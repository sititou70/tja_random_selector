var fs = require("fs");
var songs_info = [];

//初期化処理
var init = function(taikojiro_path){
	songs_info = get_files(taikojiro_path, ".*\.tja$");
	
	songs_info.each(function(elem, i){
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

var get_songs_info = function(){
};

//ランダムセレクトをスタート
var start_random_select = function(webContents, query, times){
	var random_songs = [];
	songs_info.each(function(obj){
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
	
	random_songs.each(function(obj, i){
		if(i > times)return;
		
		
		
		webContents.send("set_info", obj.title, (i + 1) + " / " + times);
	});
};

exports.init = init;
exports.get_files = get_files;
exports.start_random_select = start_random_select;

