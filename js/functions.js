var fs = require("fs");
var exec = require("child_process").exec;
var encoding = require("encoding-japanese");
var songs_info = [];
var taikojiro_dir_path = "";
var tjaignore_path = "";
var App = null;
var webContents = null;
var run_tja_params = null;

//初期化処理
var init = function(params){
	taikojiro_dir_path = params.taikojiro_dir_path;
	App = params.App;
	webContents = params.webContents;
	tjaignore_path = params.tjaignore_path;
	
	songs_info = get_files(taikojiro_dir_path, ".*\.tja$");
	songs_info.forEach(function(obj, i){
		songs_info[i] = get_songs_info(obj);
	});
	
	var tjaignore = fs.readFileSync(params.tjaignore_path).toString().replace(/(\r|\n|\t)/g, "");
	for (var i = songs_info.length - 1; i >= 0; i--) {
		if(eval_songs_query(tjaignore, songs_info[i])){
			webContents.send("add_ignore_tja_list", songs_info[i].title + "(" + songs_info[i].path.replace(taikojiro_dir_path, "").match(/^\/(.*)\/.*?\.tja$/, "")[1].replace(/\//g, " > ") + ")");
			songs_info.splice(i, 1);
		}
	}
	
	webContents.send("set_songs_num");
};

//ファイルの一覧を配列で取得する
var get_files = function(dir, grep){
	var ans = [];
	
	fs.readdirSync(dir).forEach(function(obj){
		if(fs.statSync(dir + "/" + obj).isFile()){
			if(RegExp(grep).test(obj))ans.push(dir + "/" + obj);
		}else{
			get_files(dir + "/" + obj, grep).forEach(function(obj_){
				ans.push(obj_);
			});
		}
	});
	
	return ans;
};

//TJAのパスから曲の情報を得る
var get_songs_info = function(path){
	var content;
	try{
		var unicodeArray = encoding.convert(fs.readFileSync(path), {
			from: 'SJIS',
			to: 'UNICODE'
		});
		content = encoding.codeToString(unicodeArray);
	}catch(e){
		return e.code;
	}
	
	var title = content.match(/^TITLE:(.*?)(\r|\n|\r\n)/)[1];
	var subtitle = content.match(/(\r|\n|\r\n)SUBTITLE:(--)?(.*?)(\r|\n|\r\n)/)[3];
	var levels = content.match(/(\r|\n|\r\n)LEVEL:[0-9]+(\r|\n|\r\n)/g);
	var max_level = -1;
	
	levels.forEach(function(obj){
		var now_level = parseInt(obj.match(/LEVEL:([0-9]+)/)[1]);
		if(now_level > max_level)max_level = now_level;
	});
	
	
	var bpms = content.match(/(\r|\n|\r\n)(BPM:|#BPMCHANGE )[0-9]+.*?(\r|\n|\r\n)/g);
	var bpm_high = -1;
	var bpm_low = 9999999;
	
	bpms.forEach(function(obj){
		var now_bpm = parseInt(obj.match(/(BPM:|#BPMCHANGE )([0-9]+)/)[2]);
		if(now_bpm > bpm_high)bpm_high = now_bpm;
		if(now_bpm < bpm_low)bpm_low = now_bpm;
	});
	
	var info = {
		path: path,
		title: title,
		subtitle: subtitle,
		level: max_level,
		bpm_high: bpm_high,
		bpm_low: bpm_low
	};
	
	return info;
};

//エスケープ文字をエスケープします
var escape = function(work_string){
	return work_string.replace(/\\/g, "\\\\").replace(/'/g, "\\\'").replace(/"/g, '\\\"');
};

//曲をクエリで評価します
var eval_songs_query = function(query, song_info){
	return eval(query.replace(/%title%/g, escape(song_info.title)).replace(/%subtitle%/g, escape(song_info.subtitle)).replace(/%level%/g, song_info.level).replace(/%bpm_low%/g, song_info.bpm_low).replace(/%bpm_high%/g, song_info.bpm_high));
};

//クエリに一致した曲数を得る
var get_songs_num = function(query){
	var num = 0;
	songs_info.forEach(function(obj){
		if(eval_songs_query(query, obj))num++;
	});
	
	return num;
};

//ランダムセレクトをスタート
var start_random_select = function(query, times){
	if(times == "Inf")times = Infinity;
	var random_songs = [];
	songs_info.forEach(function(obj){
		if(eval_songs_query(query, obj)){
			random_songs.push(obj);
		}
	});
	
	for (var i = random_songs.length - 1; i > 0; i--) {
		var rand_target = Math.floor(Math.random() * i);
		
		var temp = random_songs[i];
		random_songs[i] = random_songs[rand_target];
		random_songs[rand_target] = temp;
	}
	
	var run_tja;
	run_tja = function(this_){
		if(this_.i >= this_.times || this_.i >= this_.random_songs.length){
			if(this_.i >= this_.random_songs.length)webContents.send("alert", "該当する全ての曲をプレイしました");
			webContents.send("reset_view");
			return;
		}
		
		var info = {
			title: this_.random_songs[this_.i].title,
			subtitle: this_.random_songs[this_.i].subtitle,
			dir_info: this_.random_songs[this_.i].path.replace(taikojiro_dir_path, "").match(/^\/(.*)\/.*?\.tja$/, "")[1].replace(/\//g, " > "),
			level: this_.random_songs[this_.i].level,
			bpm_info: (this_.random_songs[this_.i].bpm_low == this_.random_songs[this_.i].bpm_high) ? this_.random_songs[this_.i].bpm_low + "BPM" : this_.random_songs[this_.i].bpm_low + " - " + this_.random_songs[this_.i].bpm_high + "BPM",
			songs_num: (this_.i + 1) + " / " + ((this_.times == Infinity) ? "∞" : this_.times)
		};
		webContents.send("set_info", info);
		var command = '"' + taikojiro_dir_path + 'taikojiro.exe" "' + this_.random_songs[this_.i].path + '"';
		command = command.replace(/\//g, "\\");
		exec(command, (function(this_){
			return function(){
				this_.i++;
				run_tja(this_);
			};
		})(this_));
	};
	
	run_tja_params = {
		i: 0,
		times: times,
		random_songs: random_songs
	};
	
	run_tja(run_tja_params);
};

var skip_song = function(){
	run_tja_params.random_songs.splice(run_tja_params.i, 1);
	run_tja_params.i--;
	exec('taskkill /f /im "taikojiro.exe"');
};

var get_all_songs_num = function(querys){
	var nums = [];
	querys.forEach(function(obj){
		nums.push(get_songs_num(obj));
	});
	
	return nums;
};

var skip_and_add_tjaignore = function(){
	var data = " || \r\n(" + '"%title%" == "' + escape(run_tja_params.random_songs[run_tja_params.i].title) + '" && "%subtitle%" == "' + escape(run_tja_params.random_songs[run_tja_params.i].subtitle) + '" && %level% == ' + run_tja_params.random_songs[run_tja_params.i].level + " && %bpm_high% == " + run_tja_params.random_songs[run_tja_params.i].bpm_high + " && %bpm_low% == " + run_tja_params.random_songs[run_tja_params.i].bpm_low + ")";
	fs.appendFileSync(tjaignore_path, data, "utf8");
	
	skip_song();
};

var escape_run_tja = function(){
	run_tja_params.times = -1;
	exec('taskkill /f /im "taikojiro.exe"');
};


exports.init = init;
exports.get_files = get_files;
exports.get_songs_num = get_songs_num;
exports.start_random_select = start_random_select;
exports.skip_song = skip_song;
exports.get_all_songs_num = get_all_songs_num;
exports.skip_and_add_tjaignore = skip_and_add_tjaignore;
exports.escape_run_tja = escape_run_tja;

