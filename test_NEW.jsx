
#include "對齊置中.jsx";
#include "base.jsx";

/**
 * 去空白
 */
String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
}

/**
 * 判斷當前目錄下是否存在名為 'clothes.csv' 的檔案
 *
 * @returns {File} - 如果找到 'clothes.csv' 則返回檔案物件，否則返回 null
 */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    var file = new File(pathEnv + '/衣服配置檔.csv');
    if (!file.exists) {
        alert(pathEnv + '/衣服配置檔.csv 檔案不存在！請複製 衣服配置檔.csv，再重新執行');
        return null;
    }
    return file;
}

/**
 * 判斷當前目錄下是否存在名為 'clothes.csv' 的檔案
 *
 * @returns {File} - 如果找到 'clothes.csv' 則返回檔案物件，否則返回 null
 */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    var file = new File(pathEnv + '/2扣隊名位置記錄檔.csv');
    if (!file.exists) {
        alert(pathEnv + '/2扣隊名位置記錄檔.csv 檔案不存在！請複製 衣服配置檔.csv，再重新執行');
        return null;
    }
    return file;
}

//var file = new File(pathEnv + '/2扣隊名位置記錄檔.csv');

function readClothesData(evnFile,clothesData) {
    var checkboxIndex = -1;
    var file = evnFile;
    //var clothesData = {};
    // 打開檔案進行讀取
    if (file.open('r')) {
        file.readln(); // 讀取並忽略首行（標題行）
        while (!file.eof) {
            var line = file.readln();
            var parts = line.split(';');

						if(mySize == parts[1]){
								alert("前片左上點="+parts[2]+",前片左上點門襟下長度 = "+parts[3]);
								// 前片左上點 = parts[2];
								// 前片左上點門襟下長度 = parts[3];
								// 後片中上點 = parts[4];
								// 隊名寬 = parts[5];
								// 高 = parts[6];
								// 隊名位置 = parts[7];
								team1 = parts[2];
								team2 = parts[3];
								team3 = parts[4];
								team4 = parts[5];
								team5 = parts[6];
								team6 = parts[7];

								team10 = parts[11];
								team11 = parts[12];
								team12 = parts[13];

						}

        }
        file.close(); // 關閉檔案
    } else {
        alert('無法打開檔案: ' + filePath);
        return;
    }
}

function selectSize(){
  var clothesData = {};
  var clothesCsvFile = checkForDataCsv();
  readClothesData(clothesCsvFile,clothesData);
	//var shirtTypes = getKeys(clothesData);
}


// 傳回目前 Illustrator 檔案資訊
function getActiveDocInfo(withExtension, fullPath) {
    if (!app.documents.length) {
        return "目前沒有開啟檔案";
    }

    var doc = app.activeDocument;

    // 檔案名稱
    var name = doc.name;

    // 如果不要副檔名
    if (!withExtension) {
        var dotPos = name.lastIndexOf(".");
        if (dotPos > -1) {
            name = name.substring(0, dotPos);
        }
    }

    // 如果需要完整路徑
    if (fullPath) {
        return doc.fullName.fsName;
    } else {
        return name;
    }
}

// 取得分隔字串的第一個片段
function getFirstPart(text, delimiter) {
    if (!text || !delimiter) {
        return "";
    }
    var parts = text.split(delimiter);
    return parts.length > 0 ? parts[0] : "";
}

// 範例用法
myFileName =  getActiveDocInfo(false, false);
mySize = getFirstPart(myFileName, "-");

// 在 Illustrator 畫長方形 (CMYK 版)
// x, y = 左上角座標
// w = 寬度
// h = 高度
// c, m, yk, k = CMYK 顏色百分比 (0~100)
function drawRectangleCMYK(x, y, w, h, c, m, yk, k,b) {
    if (!app.documents.length) {
        alert("請先開啟一個文件");
        return;
    }

    var doc = app.activeDocument;

    // 建立長方形
    var rect = doc.pathItems.rectangle(y, x, w, h);

    // 填色
    rect.filled = true;
    rect.fillColor = makeCMYKColor(c, m, yk, k);

    // 外框
    rect.stroked = true;
    rect.strokeWidth = 1;
    rect.strokeColor = makeCMYKColor(0, 0, 0, 100); // 黑色描邊
		rect.opacity = 50;
		if(b){
			itemA = getPathItemByTwoLevel("裁切","前片","底色");
			centerByItem(itemA,rect);
		}else {
			itemA = getPathItemByTwoLevel("裁切","後片","底色");
			centerByItem(itemA,rect);
		}

    return rect;
}

// 小工具：建立 CMYK 顏色
function makeCMYKColor(c, m, y, k) {
    var color = new CMYKColor();
    color.cyan = c;
    color.magenta = m;
    color.yellow = y;
    color.black = k;
    return color;
}





selectSize();

alert(team2);
alert(team6);
alert(team2+team6);
var xy = team1.split(',');

var xy2 = team3.split(',');
// 範例：在 (100, 500) 畫一個 300×150 的紅色長方形
//xy[1]-mm(parseFloat(team2)+parseFloat(team6))

//x = xy[0];
//y = xy[1]
drawRectangleCMYK(xy[0], xy[1]-mm(parseFloat(team2)+parseFloat(team6)), mm(team4), mm(team5), 0, 100, 100, 0,true);

drawRectangleCMYK(xy2[0], xy2[1]-mm(6.35+parseFloat(team12)), mm(team10), mm(team11), 0, 100, 100, 0,false);


//drawRectangleCMYK(xy[0], xy[1]-mm(parseFloat(team2)), mm(team4), mm(team5), 0, 100, 100, 0);
