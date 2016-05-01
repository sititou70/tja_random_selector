# TJAランダムセレクター

## 概要
お使いの太鼓さん次郎からランダムに選曲し、その曲で太鼓さん次郎を起動します。
レベル別やBPM別等、フィルタを掛けた上でのランダム選曲も可能です。

## 効能
ウォーミングアップ、地力上げ、未知との遭遇。

## インストール
1. Windows(x64)向けにパッケージしています。
[リリース情報](https://github.com/sititou70/tja_random_selector/releases)を確認して、一番新しいZIPファイルを取得してください。
2. 解凍して出てきた、tja_random_selector-win32-x64フォルダをtaikojiro.exeと同じ場所に配置してください。

## tjaignore.txt
tjaignore.txtは、tja_random_selector.exeから見て`./resources/app/`にあります。
これは、ランダム選曲の対象から除外するTJAを指定するためのファイルです。

除外したいTJAの条件式（JavaScript）をUTF-8で記述します。改行、タブ文字は全て無視されます。

tjaignore.txtでは、`%title%`（曲のタイトル、文字列）、`%level%`（曲のレベル、数値）、`%bpm_high%`（曲の最高BPM、数値）、`%bpm_low%`（曲の最低BPM、数値）のキーワードが使えます。

アプリは、tjaignore.txtに書かれた条件式を全てのTJAに対して評価し、真となった曲をランダム選曲の対象から除外します。

より詳細には、キーワードを当該の数値や文字列に置換し、`eval`します。したがって、`%title% == "hoge"`のように利用することは出来ません。`"%title%" == "hoge"`のように、文字リテラルとして扱ってください。また、文字リテラル中にエスケープが必要な文字が含まれる場合、適切にエスケープしてください。

### 例

どの曲も除外しない。（デフォルト）

```
false
```


レベルが9（★×9）の曲を除外する。

```
%level% == 9
```


レベルが9以上か、レベルが6以下で最低BPMが170未満の曲を除外する。

```
%level% >= 9 || (%level% <= 6 && %bpm_low% < 170)
```


タイトルが`hoge`か`fuga`か`piyo`の曲を除外する。

```
"%title%" == "hoge" ||
"%title%" == "fuga" ||
"%title%" == "piyo"
```


タイトルに`hoge`か`fuga`か`piyo`が含まれる曲を除外する。

```
RegExp(".*(hoge|fuga|piyo).*").test("%title%")
```


BPMが30以上変化する曲を除外する。

```
%bpm_high% - %bpm_low% >= 30
```


変数oneとtwoを定義する。それぞれを`1`と`2`で初期化する。もし`1=2`が偽なら、どのTJAも除外されないはずだ。しかし、アプリを起動してみると、全てのTJAが除外されている。したがって、 [*1と2は等しい*](http://ja.uncyclopedia.info/wiki/1%3D2) ことが確認された。

```
(function(){
	var one = 1;
	var two = 2;
	if(one = two){
		return true;
	}else{
		return false;
	}
})();
```


レベルが１の曲は除外し、その都度メモ帳を起動する。

```
if(%level% == 1)require("child_process").exec("notepad.exe");
```


除外するか除外しないかは、どちらも同様に確からしい。

```
Math.random() > 0.5
```

** 脆弱性？知らんな。 **

## フィルタ（条件）の追加依頼
このアプリのリポジトリに対して、適当な名前でissueを立ててください。随時対応します。
