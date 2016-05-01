var ipcRenderer = require('electron').ipcRenderer
//require('remote').getCurrentWindow().toggleDevTools();

//functions
var set_songs_num = function(){
	var buttons = $(".select_category > button");
	
	var querys = [];
	buttons.each(function(i, obj){
		querys.push($(obj).data("query"));
	});
	
	var nums = ipcRenderer.sendSync("get_songs_num", querys);
	
	buttons.each(function(i, obj){
		$(obj).text($(obj).text() + "[" + nums[i] + "]");
	});
}

//set event handler
$(".select_category > button").click(function(){
	selector_query = $(this).data("query");
	$(".select_category").fadeOut(500);
	$(".ignore_tja_list").fadeOut(500);
	$(".times_selector").fadeIn(500);
});

$(".times_selector > button").click(function(){
	ipcRenderer.send("start_random_select", selector_query, $(this).data("times"));
	$(".times_selector").fadeOut(500);
	$(".info_view").fadeIn(500);
});

var selector_query = "";

//ipc handlers
ipcRenderer.on("alert", function(event, text){
	alert(text);
});

ipcRenderer.on("set_songs_num", function(event){
	set_songs_num();
});

ipcRenderer.on("set_info", function(event, info){
	$(".info_view > .title").html(info.title);
	$(".info_view > .subtitle").html(info.subtitle);
	$(".info_view > .dir_info").html(info.dir_info);
	$(".info_view > .level").html(info.level);
	$(".info_view > .bpm_info").html(info.bpm_info);
	$(".info_view > .songs_num").html(info.songs_num);
});

ipcRenderer.on("reset_view", function(event){
	$(".info_view").fadeOut(500);
	$(".select_category").fadeIn(500);
	$(".ignore_tja_list").fadeIn(500);
});

ipcRenderer.on("add_ignore_tja_list", function(event, string){
	$(".ignore_tja_list > p").css({
		display: "none"
	});
	
	var new_li = $("<li>");
	new_li.text(string);
	$(".ignore_tja_list > ul").append(new_li);
});

