var ipcRenderer = require("electron").ipcRenderer;
//require("remote").getCurrentWindow().toggleDevTools();

//functions
var set_songs_num = function(){
	var buttons = $(".select_category > button");
	
	var querys = [];
	buttons.each(function(i, obj){
		querys.push($(obj).data("query"));
	});
	
	var nums = ipcRenderer.sendSync("get_all_songs_num", querys);
	
	buttons.each(function(i, obj){
		$(obj).text($(obj).text() + "[" + nums[i] + "]");
	});
};

//set event handler
$(".select_category > button").click(function(){
	selector_query = $(this).data("query");
	$(".select_category").fadeOut(300);
	$(".ignore_tja_list").fadeOut(300);
	$(".times_selector").fadeIn(300);
});

$(".times_selector > button").click(function(){
	ipcRenderer.send("start_random_select", selector_query, $(this).data("times"));
	$(".times_selector").fadeOut(300);
	$(".info_view").fadeIn(300);
});

$(".info_view > .skip_song").click(function(){
	ipcRenderer.send("skip_song");
});

$(".info_view > .skip_and_add_tjaignore").click(function(){
	ipcRenderer.send("skip_and_add_tjaignore");
});

$(window).keydown(function(key){
	if(key.keyCode == 27){
		if($(".select_category").css("display") == "block"){
			ipcRenderer.send("quit");
		}
		if($(".times_selector").css("display") == "block"){
			$(".times_selector").fadeOut(300);
			$(".select_category").fadeIn(300);
			$(".ignore_tja_list").fadeIn(300);
		}
		if($(".info_view").css("display") == "block"){
			ipcRenderer.send("escape_run_tja");
			
			$(".info_view").fadeOut(300);
			$(".select_category").fadeIn(300);
			$(".ignore_tja_list").fadeIn(300);
		}
	}
});

var selector_query = "";

//ipc handlers
ipcRenderer.on("alert", function(event, text){
	alert(text);
});

ipcRenderer.on("set_songs_num", function(event){
	set_songs_num();
});

ipcRenderer.on("set_info", function(event, info, taikojiro_dir_path, songs_num){
	$(".info_view > .title").html(info.title);
	$(".info_view > .subtitle").html(info.subtitle);
	$(".info_view > .dir_info").html(info.path.replace(taikojiro_dir_path, "").match(/^\/(.*)\/.*?\.tja$/, "")[1].replace(/\//g, " > "))
	$(".info_view > .level").html(info.level);
	$(".info_view > .bpm_info").html((info.bpm_low == info.bpm_high) ? info.bpm_low + "BPM" : info.bpm_low + " - " + info.bpm_high + "BPM");
	$(".info_view > .songs_num").html(songs_num);
	if(info.highscore.hasOwnProperty("Oni")){
		$(".info_view > .clearmark").removeClass("clearmark-new");
		$(".info_view > .clearmark").removeClass("clearmark-none");
		$(".info_view > .clearmark").removeClass("clearmark-silver");
		$(".info_view > .clearmark").removeClass("clearmark-red");
		$(".info_view > .clearmark").removeClass("clearmark-gold");
		$(".info_view > .clearmark").addClass("clearmark-" + info.highscore.Oni.clearmark);
		$(".info_view > .highscore").html("HiScore : " + info.highscore.Oni.score + "<br>" +
		"良:" + info.highscore.Oni.great + " " +
		"可:" + info.highscore.Oni.good + " " +
		"不可:" + info.highscore.Oni.bad + " " +
		"連打:" + info.highscore.Oni.roll);
	}else{
		$(".info_view > .clearmark").removeClass("clearmark-new");
		$(".info_view > .clearmark").removeClass("clearmark-none");
		$(".info_view > .clearmark").removeClass("clearmark-silver");
		$(".info_view > .clearmark").removeClass("clearmark-red");
		$(".info_view > .clearmark").removeClass("clearmark-gold");
		$(".info_view > .highscore").html("");
	}
});

ipcRenderer.on("reset_view", function(event){
	$(".info_view").fadeOut(300);
	$(".select_category").fadeIn(300);
	$(".ignore_tja_list").fadeIn(300);
});

ipcRenderer.on("add_ignore_tja_list", function(event, string){
	$(".ignore_tja_list > p").css({
		display: "none"
	});
	
	var new_li = $("<li>");
	new_li.text(string);
	$(".ignore_tja_list > ul").append(new_li);
});

