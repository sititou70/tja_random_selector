'use strict';

const {app, Menu, BrowserWindow, ipcMain} = require("electron");
var functions = require("./js/functions");
var fs = require("fs");
var exec = require("child_process").exec;
var mainWindow = null;

// 全てのウィンドウが閉じたら終了
app.on("window-all-closed", function(){
	if(process.platform != "darwin"){
		app.quit();
	}
});

// Electronの初期化完了後に実行
app.on("ready", function(){
	// メイン画面の表示。ウィンドウの幅、高さを指定できる
	var window_bounds = JSON.parse(fs.readFileSync(__dirname + "\\window_bounds.json"));
	mainWindow = new BrowserWindow({
		width: window_bounds.width,
		height: window_bounds.height,
		x: window_bounds.x,
		y: window_bounds.y,
		resizable: true,
		center: true,
		autoHideMenuBar: true
	});
	mainWindow.loadURL("file://" + __dirname + "/index.html");
	
	//ウインドウが閉じる前にサイズと位置を記録する
	mainWindow.on("close", function(){
		var window_bounds = JSON.stringify(mainWindow.getBounds());
		fs.writeFileSync(__dirname + "\\window_bounds.json", window_bounds);
	});
	
	//ウィンドウが閉じられたらアプリも終了
	mainWindow.on("closed", function(){
		mainWindow = null;
	});
	
	//rendererプロセスのJSの実行が完了した
	mainWindow.webContents.on("did-finish-load", function(){
		//functionsをinit
		functions.init({
			taikojiro_dir_path: __dirname.match(/^(.*\\).*?\\.*?\\.*?\\?$/)[1],
			tjaignore_path: __dirname + "\\tjaignore.txt",
			app: app,
			webContents: mainWindow.webContents
		});
	});
	
	//開発ツールを開く
	mainWindow.toggleDevTools();
});

//ipcハンドラを定義
ipcMain.on("start_random_select", function(event, query, times){
	functions.start_random_select(query, times);
});

ipcMain.on("get_all_songs_num", function(event, querys){
	event.returnValue = functions.get_all_songs_num(querys);
});

ipcMain.on("skip_song", function(event, querys){
	functions.skip_song();
});

ipcMain.on("skip_and_add_tjaignore", function(event, querys){
	functions.skip_and_add_tjaignore();
});

ipcMain.on("escape_run_tja", function(event){
	functions.escape_run_tja();
});

ipcMain.on("quit", function(event){
	app.quit();
});

//メニューバーを定義
var menu = Menu.buildFromTemplate([
	{
		label: "File",
		submenu: [
			{
				label: "Quit",
				click: function(){
					app.quit();
				}
			}
		]
	}
]);
Menu.setApplicationMenu(menu);

