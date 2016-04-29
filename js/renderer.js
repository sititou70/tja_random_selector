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
ipcRenderer.on("set_info", function(event, title, songs_num){
	$(".info_view > .title").html(title);
	$(".info_view > .songs_num").html(songs_num);
});

ipcRenderer.on("reset_view", function(event, title, songs_num){
	$(".info_view").fadeOut(500);
	$(".select_category").fadeIn(500);
});

