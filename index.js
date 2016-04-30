'use strict';

var App = require("app");
var Menu = require("menu");
var BrowserWindow = require("browser-window");
var ipcMain = require("electron").ipcMain;
var functions = require("./js/functions");
var mainWindow = null;


// 全てのウィンドウが閉じたら終了
App.on("window-all-closed", function(){
	if(process.platform != "darwin"){
		App.quit();
	}
});

// Electronの初期化完了後に実行
App.on("ready", function(){
	// メイン画面の表示。ウィンドウの幅、高さを指定できる
	var size = require('screen').getPrimaryDisplay().size;
	mainWindow = new BrowserWindow({
		width: 700,
		height: 437,
		x: size.width - 700,
		y: size.height - 480,
		resizable: false,
		center: true,
		autoHideMenuBar: true
	});
	mainWindow.loadURL("file://" + __dirname + "/index.html");
	
	// ウィンドウが閉じられたらアプリも終了
	mainWindow.on("closed", function(){
		mainWindow = null;
	});
	
	//functionsをinit
	functions.init({
		taikojiro_dir_path: __dirname.match(/^(.*\\).*?\\.*?\\.*?\\?$/)[1],
		//taikojiro_dir_path: __dirname.match(/^(.*\\).*?\\?$/)[1],
		App: App,
		webContents: mainWindow.webContents,
	});
});

//ipcハンドラを定義
ipcMain.on("start_random_select", function(event, query, times){
	functions.start_random_select(query, times);
});

ipcMain.on("get_songs_num", function(event, querys){
	var nums = [];
	querys.forEach(function(obj){
		nums.push(functions.get_songs_num(obj));
	});
	
	event.returnValue = nums;
});

//メニューバーを定義
var menu = Menu.buildFromTemplate([
	{
		label: "File",
		submenu: [
			{
				label: "Quit",
				click: function(){
					App.quit();
				}
			}
		]
	}
]);
Menu.setApplicationMenu(menu);

