var ipcRenderer = require('electron').ipcRenderer

//functions


//set event handler
console.log($(".open_file_dialog"));
$(".open_file_dialog").click(function(){
	var path = ipcRenderer.sendSync("get_jiro_path");
	if(path != "not_selected")$(this).prev().val(path);
	
	var mode = "";
	if($(this).prev().attr("id") == "from_taikojiro_exe"){
		mode = "from";
	}else{
		mode = "to";
	}
	
	if(path != "not_selected")ipcRenderer.send("set_taikojiro_path", path, mode);
});

$("#analyze_savedata").click(function(){
	if($("#from_taikojiro_exe").val() == "" || $("#to_taikojiro_exe").val() == ""){
		alert("太鼓さん次郎の場所が未指定です");
		return;
	}
	
	$("#analyze_savedata").text("分析中").prop("disabled", true).animate({opacity: 0.5}, 500, function(){
		ipcRenderer.send("match_savedata");
	});
});

$("#start_copy").click(function(){
	$("#start_copy").text("実行中").prop("disabled", true).animate({opacity: 0.5}, 500, function(){
		ipcRenderer.send("start_copy");
	});
});

$("#app_quit").click(function(){
	ipcRenderer.send("app_quit");
});




//ipc handlers
ipcRenderer.on("alert", function(event ,message){
	alert(message);
});

ipcRenderer.on("change_panel", function(event, prev_panel_selector ,next_panel_selector){
	$(prev_panel_selector).css({
		display: "none",
		left: "-100vw"
	});
	
	$(next_panel_selector).css({
		display: "inline-block",
		left: "0"
	});
});

ipcRenderer.on("set_text_info", function(event, html){
	$("#text_info").html(html);
});

ipcRenderer.on("set_table", function(event, selector, header, work_array){
	var table = $("<table>")
	
	var th = $("<tr>");
	header.forEach(function(obj){
		th.append($("<th>").text(obj[0]));
	});
	table.append($("<thead>").append(th));
	
	var tbody = $("<tbody>");
	work_array.forEach(function(obj){
		var tr = $("<tr>");
		
		header.forEach(function(obj_){
			tr.append($("<td>").text(obj[obj_[1]]));
		});
		
		tbody.append(tr);
	});
	
	table.append(tbody);
	
	$(selector).html(table.html());
});

