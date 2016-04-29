var ipcRenderer = require('electron').ipcRenderer

//set event handler
$(".select_category > button").click(function(){
	selector_query = $(this).data("query");
	$(".select_category").fadeOut(300);
	$(".times_selector").fadeIn(300);
});

$(".times_selector > button").click(function(){
	ipcRenderer.send("start_random_select", selector_query, eval($(this).data("times")));
	$(".times_selector").fadeOut(300);
	$(".info_view").fadeIn(300);
});

var selector_query = "";

//ipc handlers
ipcRenderer.on("set_info", function(event, info){
	$(".info_view > title").html(info.title);
	$(".info_view > songs_num").html(info.songs_num);
});

