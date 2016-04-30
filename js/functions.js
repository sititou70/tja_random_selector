var fs = require("fs");
var exec = require("child_process").exec;
var encoding = require("encoding-japanese");
var songs_info = [];
var taikojiro_dir_path = "";
var App = null;
var webContents = null;

//初期化処理
var init = function(params){
	taikojiro_dir_path = params.taikojiro_dir_path;
	App = params.App;
	webContents = params.webContents;
	
	songs_info = get_files(taikojiro_dir_path, ".*\.tja$");
	songs_info.forEach(function(elem, i){
		songs_info[i] = get_songs_info(elem);
	});
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

//クエリに一致した曲数を得る
var get_songs_num = function(query){
	var num = 0;
	songs_info.forEach(function(obj){
		if(eval(query.replace(/%level%/g, obj.level).replace(/%bpm_low%/g, obj.bpm_low).replace(/%bpm_high%/g, obj.bpm_high)))num++;
	});
	
	return num;
}

//ランダムセレクトをスタート
var start_random_select = function(query, times){
	if(times == "Inf")times = Infinity;
	var random_songs = [];
	songs_info.forEach(function(obj){
		if(eval(query.replace(/%level%/g, obj.level).replace(/%bpm_low%/g, obj.bpm_low).replace(/%bpm_high%/g, obj.bpm_high))){
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
			}
		})(this_));
	}
	
	run_tja({
		i: 0,
		times: times,
		random_songs: random_songs
	});
};

exports.init = init;
exports.get_files = get_files;
exports.get_songs_num = get_songs_num;
exports.start_random_select = start_random_select;

