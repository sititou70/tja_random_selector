var fs = require("fs");

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

exports.get_files = get_files;
