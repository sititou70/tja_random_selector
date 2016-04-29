var fs = require("fs");
var exec = require('child_process').exec;
var songs_info = [];
var taikojiro_dir_path = "";

//初期化処理
var init = function(taikojiro_dir_path){
	var taikojiro_dir_path = taikojiro_dir_path;
	
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

var get_songs_info = function(path){
	var content;
	try{
		content = fs.readFileSync(path).toString();
	}catch(e){
		return e.code;
	}
	
	var levels = content.match(/[\s\S]LEVEL:[0-9]+[\s\S]/g);
	var max_level = -1;
	
	levels.forEach(function(obj){
		var now_level = parseInt(obj.match(/LEVEL:([0-9]+)/)[1]);
		if(now_level > max_level)max_level = now_level;
	});
	
	
	var bpms = content.match(/[\s\S](BPM:|#BPMCHANGE )[0-9]+[\s\S]/g);
	var bpm_high = -1;
	var bpm_low = 9999999;
	
	bpms.forEach(function(obj){
		var now_bpm = parseInt(obj.match(/(BPM:|#BPMCHANGE )([0-9]+)/)[2]);
		if(now_bpm > bpm_high)bpm_high = now_bpm;
		if(now_bpm < bpm_low)bpm_low = now_bpm;
	});
	
	var info = {
		path: path,
		title: path.match(/^.*\/(.*?)\.tja$/)[1],
		level: max_level,
		bpm_high: bpm_high,
		bpm_low: bpm_low
	};
	
	return info;
};

//ランダムセレクトをスタート
var start_random_select = function(webContents, query, times, App){
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
			if(this_.i >= this_.random_songs.length)this_.webContents.send("alert", "該当する全ての曲をプレイしました")
			this_.webContents.send("reset_view");
			return;
		}
		
		this_.webContents.send("set_info", this_.random_songs[this_.i].title, (this_.i + 1) + " / " + ((this_.times == Infinity) ? "∞" : this_.times));
		var command = '"' + taikojiro_dir_path + 'taikojiro.exe" ' + this_.random_songs[this_.i].path;
		command = command.replace(/\//g, "\\");
		exec(command, (function(this_){
			return function(){
				this_.i++;
				run_tja(this_);
			}
		})(this_));
	}
	
	var params = {};
	params.i = 0;
	params.times = times;
	params.random_songs = random_songs;
	params.webContents = webContents;
	params.App = App;
	run_tja(params);
};

exports.init = init;
exports.get_files = get_files;
exports.start_random_select = start_random_select;

