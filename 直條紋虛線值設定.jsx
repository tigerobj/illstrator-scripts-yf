#include "json2.js";
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
    var logFile = File(filePath + "/直條紋虛線值設定.txt");
    logFile.encoding = "utf8";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close(); //作測試修改222
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
    var file = new File(pathEnv + '/直條紋虛線值設定.csv');
    if (!file.exists) {
        alert(pathEnv + '/直條紋虛線值設定.csv 檔案不存在！請複製 直條紋虛線值設定.csv，再重新執行');
        return null;
    }
    return file;
}


// 取得物件 geometricBounds 資訊函式
function getBounds(item) {
		var b = item.geometricBounds;
		return {
				left: b[0],
				top: b[1],
				right: b[2],
				bottom: b[3],
				width: (b[2] - b[0]),
				height: (b[1] - b[3]),
				centerX: (b[0] + b[2]) / 2,
				centerY: (b[1] + b[3]) / 2
		};
}

function getOutlineBounds(item) {
		var b = item.visibleBounds;
		return {
				left: b[0],
				top: b[1],
				right: b[2],
				bottom: b[3],
        width : (b[2] - b[0]),
				height: (b[1] - b[3]),
				centerX: (b[0] + b[2]) / 2,
				centerY: (b[1] + b[3]) / 2
		};
}



function parseDashArray(str) {
  var parts = str.split(",");
  var result = [];

  for (var i = 0; i < parts.length; i++) {
      result.push(parseFloat(parts[i]));
  }

  return result;
}

function setCap(line,name){
  if("ROUNDENDCAP" == name){
    line.strokeCap = StrokeCap.ROUNDENDCAP; // 端點為
  }else if("BUTTENDCAP" == name){
    line.strokeCap = StrokeCap.BUTTENDCAP; // 端點為
  }else if("PROJECTENDCAP" == name){
    line.strokeCap = StrokeCap.PROJECTENDCAP; // 端點為
  }

}

//spacingMM間距
//
function createStripedMask(pageItem) {
    var doc = app.activeDocument;
    data = readCsvToObj(checkForDataCsv());

    try {
        targetLayer = doc.layers.getByName("裁切");
    } catch (e) {
        log(["未找到名為 '" + layerName + "' 的圖層。"]);
        return null;
        //檔案最後增加一筆資料
    }

    group = targetLayer.groupItems.add();
    targetGroup = pageItem.parent ;
    var maskShape = pageItem.duplicate();


    var spacingPt = data["間距"] * 2.834645;
    var bounds = getOutlineBounds(pageItem);
    count = Math.floor( (bounds.width+spacingPt)/spacingPt);
    if((count % 2) == 0){
      if("Y" != data["線對齊方式置中"]){
        count ++;
      }
    }else{
      if("Y" == data["線對齊方式置中"]){
        count ++;
      }
    }
    w = count * spacingPt;
    // x0 = bounds.left - extendPt/2;
    x0 = bounds.left - (w - bounds.width)/2;
    for (var i = 0 ; i < count+1; i++) {
      var line = targetGroup.pathItems.add();
      x = x0 + i * spacingPt;
      line.setEntirePath([
          [x, bounds.top + 10],
          [x, bounds.bottom - 10]
      ]);
      line.stroked = true;
      line.strokeWidth = data["線條寬度"];
      if("Y" == data["是否虛線"]){
        line.strokeDashes = parseDashArray(data["虛線設定"]);
        setCap(line,data["端點樣式"]);
      }
      line.strokeColor = makeBlack();
      line.move(group, ElementPlacement.PLACEATBEGINNING);
    }
    maskShape.move(group, ElementPlacement.PLACEATBEGINNING);
    group.clipped = true;
    //group.move(referenceItem, ElementPlacement.PLACEBEFORE);
    group.move(pageItem, ElementPlacement.PLACEBEFORE);
    //group.move(targetGroup, ElementPlacement.PLACEATBEGINNING);
    doc.selection = null;
    group.selected = true;
    return group;
}

// 建立黑色描邊
function makeBlack() {
    var black = new CMYKColor();
    black.cyan = 0;
    black.magenta = 0;
    black.yellow = 0;
    black.black = 100; // 純黑
    return black;
}


if (app.activeDocument.selection.length === 1) {
    var item = app.activeDocument.selection[0];
    createStripedMask(item);
} else {
    alert("請選取一個物件！");
}
