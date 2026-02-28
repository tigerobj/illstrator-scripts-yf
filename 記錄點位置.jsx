#include "json2.js";
/**
 * 去空白
 */
String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
}


//log(["i",i,"opt new",opt]);
function log (input) {

    if(!JSON || !JSON.stringify) return;
    var now = new Date();
    var output = JSON.stringify(input);
    $.writeln(now.toTimeString() + ": " + output);
    //D:\開發\客戶圖檔\杰優、裕豐工廠產品\ai_script_workspace\ai_example\illustrator-scripts-master2
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    var filePath = pathEnv;
    //var filePath = "D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2";
	//alert(app.activeDocument.filePath);
    //var logFile = File(app.activeDocument.filePath + "/log.txt");
    var logFile = File(filePath + "/建立旋轉及斜率資料.txt");
		logFile.encoding = "utf8";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close(); //作測試修改222
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

//map key值
function getKeys(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

//var file = new File(pathEnv + '/衣服配置檔.csv');

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
            var type = parts[8].trim();
            var size = parts[1].trim();
            if (!clothesData[type]) {
                clothesData[type] = [];
            }
            clothesData[type].push({
                shirtType: type,
                selectedSize: size
            });

        }
        file.close(); // 關閉檔案
    } else {
        alert('無法打開檔案: ' + filePath);
        return;
    }
}


/**
 * 在指定圖層建立具名稱的文字物件
 * @param {String} layerName - 圖層名稱
 * @param {String} content - 文字內容
 * @param {String} itemName - 指定的文字物件名稱
 * @param {String} [fontName] - 字型（可選，如 "標楷體"）
 * @param {Number} [fontSize] - 字級（可選，如 21）
 * @returns {TextFrame} 建立完成的文字物件
 */
function createNamedTextInLayer(layerName, content, itemName, fontName, fontSize) {
    var doc = app.activeDocument;

    // 取得或建立圖層
    var layer;
    try {
        layer = doc.layers.getByName(layerName);
    } catch (e) {
        layer = doc.layers.add();
        layer.name = layerName;
    }

    // 建立文字物件
    var text = layer.textFrames.add();
    text.contents = content;
    text.name = itemName;

    // 設定字型（若有提供）
    if (fontName) {
        try {
            text.textRange.characterAttributes.textFont = app.textFonts.getByName(fontName);
        } catch (e) {
            alert("找不到字型: " + fontName + "，將使用預設字型");
        }
    }

    // 設定字級（若有提供）
    if (fontSize) {
        text.textRange.characterAttributes.size = fontSize;
    }

    return text;
}




/**
 * 讀取csv值,儲存成key,value物件值.
 * key為第一欄
 * values為第二欄
 */
function readCsvToObj(csvFile){
	csvFile.open('r');
	var obj = new Object();
	while (s = csvFile.readln()) {
		kv = s.split(';');
		if(kv.length ==1){
			kv = s.split(',');
			if(kv.length ==1){
				alert("檔案分隔符號有問題請檢查檔案");
			}
		}
		obj[kv[0]] = kv[1];
	}
	return obj;
	csvFile.close();

}

/**
 * 在 CSV 檔案中新增或更新多筆資料
 * upsert 更新插入
 */
function upsertMultipleToCsvFile(csvFile, dataArray) {
    var csvData = readCsvToObj(csvFile);
	//alert(csvData);
    for (var i = 0; i < dataArray.length; i++) {
        var key = dataArray[i][0];
        var value = dataArray[i][1];
        csvData[key] = value; // 更新或新增資料
		//alert(csvData[key]);
    }
    csvFile.open('w');
    for (var k in csvData) {
		//alert(k);
        if (csvData.hasOwnProperty(k)) {
            csvFile.writeln(k + ";" + csvData[k]);
        }
    }
    csvFile.close();
}

function writePoint(csvFile,kind) {
    var doc = app.activeDocument;
    var sel = doc.selection;

    if (sel.length !== 1 || sel[0].typename !== "PathItem") {
        alert("請選取一個 PathItem");
        return null;
    }

    var item = sel[0];
    var points = item.pathPoints;

    var selectedPoints = [];

    for (var i = 0; i < points.length; i++) {

        if (points[i].selected === PathPointSelection.ANCHORPOINT) {
            selectedPoints.push(points[i]);
        }
    }

	if (selectedPoints.length !== 1) {
		alert("請選取路徑上的一個錨點");
        return null;
    }

    var pt1 = selectedPoints[0].anchor;
    var dx = pt1[0];
    var dy = pt1[1];
    if (dx === 0) {
        return null; // 垂直線，斜率無限大
    }
		var anchorString = pt1[0]+","+pt1[1];
		var newEntries = [
			[kind, anchorString],
		];
		upsertMultipleToCsvFile(csvFile,newEntries);
    return pt1;
}


//左前點,右前點,左後點,右後點

function run(){
	var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
	if (pathEnv === null) {
		alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
		return null;
	}

	clothes_type = null;
	kind = "記錄點";
	var csvFile = new File(pathEnv+"/記錄點.csv");
	writePoint(csvFile,kind);
}

run();
