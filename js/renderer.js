var ipcRenderer = require('electron').ipcRenderer

//set event handler
$(".select_category > button").click(function(){
	selector_query = $(this).data("query");
	$(".select_category").fadeOut(500);
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

ipcRenderer.on("set_info", function(event, info){
	$(".info_view > .title").html(info.title);
	$(".info_view > .level").html(info.level);
	$(".info_view > .bpm_info").html(info.bpm_info);
	$(".info_view > .songs_num").html(info.songs_num);
});

ipcRenderer.on("reset_view", function(event){
	$(".info_view").fadeOut(500);
	$(".select_category").fadeIn(500);
});

