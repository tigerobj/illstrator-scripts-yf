
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

function checkForOffsetY() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    var file = new File(pathEnv + '/6扣棒球衣隊名圖層.csv');
    if (!file.exists) {
        alert(pathEnv + '/衣服配置檔.csv 檔案不存在！請複製 衣服配置檔.csv，再重新執行');
        return null;
    }
    return file;
}


function getClothesData(evnFile) {
    var checkboxIndex = -1;
    var file = evnFile;

    // 打開檔案進行讀取
    if (file.open('r')) {
        file.readln(); // 讀取並忽略首行（標題行）
        while (!file.eof) {
            var line = file.readln();
            var parts = line.split(';');
            var type = parts[0].trim();
            var size = parts[1].trim();
            var fileLocation = parts[2].trim();
            var fileName = parts[3].trim();
            var clothTemplatePath = parts[4].trim();
            if (!clothesData[type]) {
                clothesData[type] = [];
            }
            clothesData[type].push({
                shirtType: type,
                selectedSize: size,
                fileLocation: fileLocation,
                fileName: fileName,
                clothTemplatePath: clothTemplatePath,
                number: "",
                name: ""
            });

        }
        file.close(); // 關閉檔案
    } else {
        alert('無法打開檔案: ' + filePath);
        return;
    }
}


/**
 * 關閉目前開啟的文件，不顯示任何訊息，不儲存修改
 */
function closeActiveDocumentQuietly() {
    if (app.documents.length > 0) {
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    } else {
        alert("目前沒有開啟的文件。");
    }
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
 * 讀取csv值,儲存成key,value物件值.
 * key為第一欄
 * values為第二欄
 */
function objToKeyValue(objs){
	var obj = new Object();
  for(var i = 0 ;i<objs.length;i++){
    data = objs[i];
    obj[data.selectedSize] = data;
  }
	return obj;
}

function layerObjToKeyValue(objs,targetLayerName){
	var obj = new Object();
	for(var i = 0 ;i<objs.length;i++){
		data = objs[i];
		try {
		    var targetLayer = doc.layers.getByName(targetLayerName+"-"+data.selectedSize);
		} catch(e){
		    targetLayer = doc.layers.add();
				targetLayer.name = targetLayerName+"-"+data.selectedSize;
				obj[data.selectedSize] = targetLayer;
		}
	}
  return obj;
}

function openFile(size){
  file = new File(ClothesValues[size].fileLocation+"/"+ ClothesValues[size].fileName);
  doc2 = app.open(file);

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

//2xl到6xl 一種  m到xl. 10到s 各一種

var doc = app.activeDocument;
var clothesData = {};
var doc2;

var baseItem = getPathItemByTwoLevel("縫份","右前鈕扣","1");

var baseBackGoup = getGroupByLevel("裁切","後片");
var targetLayerName = "6扣棒球衣隊名處理"; // 可自行指定
getClothesData(checkForDataCsv());
objs = clothesData["棒球衣"];
ClothesValues =  objToKeyValue(objs);
alert("targetLayerName : "+targetLayerName);
targetLayerValues = layerObjToKeyValue(objs,targetLayerName);

//checkForDataCsv()
//var csvFile = new File(selectedData.clothTemplatePath+"/"+csvFileName);
//checkForOffsetY
offsetObject = readCsvToObj(checkForOffsetY());
alert("1");

for(var i=0;i<objs.length;i++){

	clothesSize = objs[i].selectedSize;
	openFile(clothesSize);

	item1 = getGroupByLevel("裁切", "右前");
	item2 = getGroupByLevel("裁切", "左前");
	item5 = getGroupByLevel("裁切", "後片");

	//baseItemBack

	item3 = getGroupByLevel("縫份", "右前鈕扣");
	item4 = getGroupByLevel("縫份", "左前鈕扣");
	alert("cc");
	// var doc = app.activeDocument
	newA = item1.duplicate(targetLayerValues[clothesSize]);
	newB = item2.duplicate(targetLayerValues[clothesSize]);
	newC = item3.duplicate(targetLayerValues[clothesSize]);
	newD = item4.duplicate(targetLayerValues[clothesSize]);

	newE = item5.duplicate(targetLayerValues[clothesSize]);
	alert("dd");
	//alertclothesSize(+"-距離:"+offsetObject[clothesSize+"-L的距離"]);

	bottomCenterByItems(baseBackGoup,"後領線",newE,"後領線",0);

	a = findPageItemInGroup(newC,"1");
	b = findPageItemInGroup(newD,"1");

	//先把計算複製的右前跟原有的右前依鈕扣1的位移位置
	offset =  autoCenterXY(baseItem, a);
	newA.translate(offset.left,offset.top);
	newC.translate(offset.left,offset.top);

	//左袖移動到右袖對齊鈕扣位置
	offset = autoCenterXY(a, b);
	newB.translate(offset.left,offset.top);
	newD.translate(offset.left,offset.top);

	targetLayerValues[clothesSize].visible = false;
	alert("3");
	var doc2 = app.activeDocument;

	closeActiveDocumentQuietly();
}
