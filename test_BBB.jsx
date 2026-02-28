
#include "對齊置中.jsx";
#include "base.jsx";

/**
 * 去空白
 */
String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
}

Array.prototype.indexOf = function(clothesSize) {
	for (var i = 0; i < this.length; i++) {
			if (this[i] === clothesSize) return i;
	}
	return -1;
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
				obj[data.selectedSize] = targetLayer;
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


function unlockAndShowLayer(layer) {
    if (!layer.visible) layer.visible = true;
    if (layer.locked) layer.locked = false;
    app.executeMenuCommand("deselectall");
    app.redraw();
    $.sleep(100);
}

function hindLayer(layer) {
		layer.visible = false;
    app.executeMenuCommand("deselectall");
    app.redraw();
    $.sleep(100);
}

//2xl到6xl 一種  m到xl. 10到s 各一種

var doc = app.activeDocument;
var clothesData = {};
var doc2;

var baseItem = getPathItemByTwoLevel("縫份","右前鈕扣","1");

var targetLayerName = "6扣棒球衣隊名處理"; // 可自行指定
getClothesData(checkForDataCsv());
objs = clothesData["棒球衣"];
ClothesValues =  objToKeyValue(objs);
targetLayerValues = layerObjToKeyValue(objs,targetLayerName);


csvFileName = "6扣棒球衣隊名圖層.csv";
var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
var csvFile = new File(pathEnv+"/"+csvFileName);


// 定義三個尺寸陣列
var group1Sizes  = ["5L", "4L", "3L", "2L"];
var group2Sizes  = ["XL", "L", "M"];
var group3Sizes  = ["S", "XS", "12", "10"];



//2xl到6xl 一種  m到xl. 10到s 各一種
//[5L,4L,3L,2L] [XL,L,M] [S,XS,12,10]
for(var i=0;i<objs.length;i++){
	//targetLayerValues 圖層
	//clothesSize = objs[i].selectedSize;
	clothesSize = objs[i].selectedSize;
	targetLayer = targetLayerValues[clothesSize];

	if(clothesSize == "5L"){
		continue;
	}
	unlockAndShowLayer(targetLayer);

	// layerName = targetLayerName+"-"+clothesSize;
	// layerName_base = targetLayerName+"-L";
	// 判斷是否在某個陣列內
	if (group1Sizes.indexOf(clothesSize) !== -1) {
	    // alert(clothesSize + " 屬於 group1");
			// alert(targetLayer.name);
			itemA = getPathItemByTwoLevel(targetLayer.name, "左前", "底色").duplicate(targetLayer);
			itemB = getPathItemByTwoLevel(targetLayer.name, "右前", "底色").duplicate(targetLayer);
			itemC = getPathItemByTwoLevel(targetLayer.name, "後片", "底色").duplicate(targetLayer);
			var newGroupA = targetLayer.groupItems.add();
			newGroupA.name = "左前隊名遮罩";
			//a.move(gItem_S1, ElementPlacement.PLACEATEND);
			var newGroupB = targetLayer.groupItems.add();
			newGroupB.name = "右前隊名遮罩";

			var newGroupC = targetLayer.groupItems.add();
			newGroupB.name = "後片姓名遮罩";

			itemA.move(newGroupA, ElementPlacement.PLACEATEND);
			a = getGroupByTwoLevel("6扣棒球衣隊名處理-XL-縮放用","XL", "左前logo");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupA, ElementPlacement.PLACEATEND);
			}
			a = getGroupByTwoLevel("6扣棒球衣隊名處理-XL-縮放用","XL", "隊名");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupA, ElementPlacement.PLACEATEND);
			}
			a = getGroupByTwoLevel("6扣棒球衣隊名處理-XL-縮放用","XL", "前小號");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupA, ElementPlacement.PLACEATEND);
			}

			itemB.move(newGroupB, ElementPlacement.PLACEATEND);
			a = getGroupByTwoLevel("6扣棒球衣隊名處理-XL-縮放用","XL", "右前logo");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupB, ElementPlacement.PLACEATEND);
			}
			a = getGroupByTwoLevel("6扣棒球衣隊名處理-XL-縮放用","XL", "隊名");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupB, ElementPlacement.PLACEATEND);
			}

			itemC.move(newGroupC, ElementPlacement.PLACEATEND);
			a = getGroupByTwoLevel("6扣棒球衣隊名處理-L-縮放用","XL", "姓名");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupB, ElementPlacement.PLACEATEND);
			}

			itemC.move(newGroupC, ElementPlacement.PLACEATEND);
			a = getGroupByTwoLevel("6扣棒球衣隊名處理-L-縮放用","XL", "大背號");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupB, ElementPlacement.PLACEATEND);
			}

			itemC.move(newGroupC, ElementPlacement.PLACEATEND);
			a = getGroupByTwoLevel("6扣棒球衣隊名處理-L-縮放用","XL", "後片logo");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupB, ElementPlacement.PLACEATEND);
			}

			newGroupA.clipped = true;
			newGroupB.clipped = true;
			newGroupC.clipped = true;

	}

	if (group2Sizes.indexOf(clothesSize) !== -1) {
			// alert(targetLayer.name);
			itemA = getPathItemByTwoLevel(targetLayer.name, "左前", "底色").duplicate(targetLayer);
			itemB = getPathItemByTwoLevel(targetLayer.name, "右前", "底色").duplicate(targetLayer);
			itemC = getPathItemByTwoLevel(targetLayer.name, "後片", "底色").duplicate(targetLayer);
			var newGroupA = targetLayer.groupItems.add();
			newGroupA.name = "左前隊名遮罩";
			//a.move(gItem_S1, ElementPlacement.PLACEATEND);
			var newGroupB = targetLayer.groupItems.add();
			newGroupB.name = "右前隊名遮罩";

			var newGroupC = targetLayer.groupItems.add();
			newGroupB.name = "後片姓名遮罩";

			itemA.move(newGroupA, ElementPlacement.PLACEATEND);
			a = getGroupByLevel("L隊名", "左前logo");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupA, ElementPlacement.PLACEATEND);
			}
			a = getGroupByLevel("L隊名", "隊名");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupA, ElementPlacement.PLACEATEND);
			}
			a = getGroupByLevel("L隊名", "前小號");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupA, ElementPlacement.PLACEATEND);
			}

			itemB.move(newGroupB, ElementPlacement.PLACEATEND);
			a = getGroupByLevel("L隊名", "右前logo");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupB, ElementPlacement.PLACEATEND);
			}
			a = getGroupByLevel("L隊名", "隊名");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupB, ElementPlacement.PLACEATEND);
			}

			itemC.move(newGroupC, ElementPlacement.PLACEATEND);
			a = getGroupByLevel("L隊名", "姓名");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupB, ElementPlacement.PLACEATEND);
			}
			a = getGroupByLevel("L隊名", "大背號");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupB, ElementPlacement.PLACEATEND);
			}
			a = getGroupByLevel("L隊名", "後片logo");
			if(a){
				ad = a.duplicate(targetLayer);
				ad.move(newGroupB, ElementPlacement.PLACEATEND);
			}

			newGroupA.clipped = true;
			newGroupB.clipped = true;
			newGroupC.clipped = true;

	}

	if (group3Sizes.indexOf(clothesSize) !== -1) {
		// alert(clothesSize + " 屬於 group1");
		// alert(targetLayer.name);
		itemA = getPathItemByTwoLevel(targetLayer.name, "左前", "底色").duplicate(targetLayer);
		itemB = getPathItemByTwoLevel(targetLayer.name, "右前", "底色").duplicate(targetLayer);
		itemC = getPathItemByTwoLevel(targetLayer.name, "後片", "底色").duplicate(targetLayer);
		var newGroupA = targetLayer.groupItems.add();
		newGroupA.name = "左前隊名遮罩";
		//a.move(gItem_S1, ElementPlacement.PLACEATEND);
		var newGroupB = targetLayer.groupItems.add();
		newGroupB.name = "右前隊名遮罩";

		var newGroupC = targetLayer.groupItems.add();
		newGroupB.name = "後片姓名遮罩";

		itemA.move(newGroupA, ElementPlacement.PLACEATEND);
		a = getGroupByTwoLevel("6扣棒球衣隊名處理-L-縮放用","L", "左前logo");
		if(a){
			ad = a.duplicate(targetLayer);
			ad.move(newGroupA, ElementPlacement.PLACEATEND);
		}
		a = getGroupByTwoLevel("6扣棒球衣隊名處理-L-縮放用","L", "隊名");
		if(a){
			ad = a.duplicate(targetLayer);
			ad.move(newGroupA, ElementPlacement.PLACEATEND);
		}
		a = getGroupByTwoLevel("6扣棒球衣隊名處理-L-縮放用","L", "前小號");
		if(a){
			ad = a.duplicate(targetLayer);
			ad.move(newGroupA, ElementPlacement.PLACEATEND);
		}

		itemB.move(newGroupB, ElementPlacement.PLACEATEND);
		a = getGroupByTwoLevel("6扣棒球衣隊名處理-L-縮放用","L", "右前logo");
		if(a){
			ad = a.duplicate(targetLayer);
			ad.move(newGroupB, ElementPlacement.PLACEATEND);
		}
		a = getGroupByTwoLevel("6扣棒球衣隊名處理-L-縮放用","L", "隊名");
		if(a){
			ad = a.duplicate(targetLayer);
			ad.move(newGroupB, ElementPlacement.PLACEATEND);
		}

		itemC.move(newGroupC, ElementPlacement.PLACEATEND);
		a = getGroupByTwoLevel("6扣棒球衣隊名處理-L-縮放用","L", "姓名");
		if(a){
			ad = a.duplicate(targetLayer);
			ad.move(newGroupB, ElementPlacement.PLACEATEND);
		}

		itemC.move(newGroupC, ElementPlacement.PLACEATEND);
		a = getGroupByTwoLevel("6扣棒球衣隊名處理-L-縮放用","L", "大背號");
		if(a){
			ad = a.duplicate(targetLayer);
			ad.move(newGroupB, ElementPlacement.PLACEATEND);
		}

		itemC.move(newGroupC, ElementPlacement.PLACEATEND);
		a = getGroupByTwoLevel("6扣棒球衣隊名處理-L-縮放用","L", "後片logo");
		if(a){
			ad = a.duplicate(targetLayer);
			ad.move(newGroupB, ElementPlacement.PLACEATEND);
		}

		newGroupA.clipped = true;
		newGroupB.clipped = true;
		newGroupC.clipped = true;
	}

	hindLayer(targetLayer);

}
