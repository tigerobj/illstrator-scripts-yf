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
		var logFile = File(filePath + "/新圓領-配置檔.txt");
		logFile.encoding = "utf8";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close(); //作測試修改222
}

function mm(n) {
  return n * 2.83464567;
}

function p2mm(n) {
  return n / 2.83464567;
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



function topDistance(itemA,itemB){
	itemABounds = getBounds(itemA);
	itemBBounds = getBounds(itemB);
	value = itemABounds.top - itemBBounds.top;
	return value;
}

function space(itemA,itemB){
	itemABounds = getBounds(itemA);
	itemBBounds = getBounds(itemB);
	value = itemABounds.bottom- itemB.top;
	return value;
}

/**
 * 在指定圖層中根據名稱獲取頁面物件，包括群組和遮罩內的物件。
 *
 * @param {Document} doc - Adobe Illustrator 文件對象。
 * @param {string} layerName - 圖層的名稱。
 * @param {string} itemName - 頁面物件的名稱。
 * @returns {PageItem|null} - 返回對應的頁面物件，如果未找到則返回 null。
 */
function getPageItemByNameInLayer(doc, layerName, itemName) {
    // 获取指定名称的图层
    var targetLayer;
    try {
        targetLayer = doc.layers.getByName(layerName);
    } catch (e) {
        log(["未找到名為 '" + layerName + "' 的圖層。"]);
        return null;
//檔案最後增加一筆資料
    }

    // 在目标图层中查找指定名称的 pageItem
    try {
        var pageItem = targetLayer.pageItems.getByName(itemName);
        return pageItem;
    } catch (e) {
        log(["在圖層 '" + layerName + "' 中未找到名為 '" + itemName + "' 的 pageItem。"]);
        return null;
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

function writePosition(csvFile,itemA,itemB,name){
    if(isNull(itemB)){
        return null;
    }
	itemABounds = getBounds(itemA);
	itemBBounds = getBounds(itemB);
	distance = p2mm(itemABounds.top - itemBBounds.top);
	width = p2mm(itemBBounds.width);
	height = p2mm(itemBBounds.height);
	center = p2mm(itemABounds.centerX - itemBBounds.centerX);
	var newEntries = [
		[name+"-上距離", distance],
		[name+"-寬", width],
		[name+"-高", height],
		[name+"-置中距離", center]
	];
	upsertMultipleToCsvFile(csvFile,newEntries);
}

function writePositionDown(csvFile,itemA,itemB,name){
    if(isNull(itemB)){
        return null;
    }
	itemABounds = getBounds(itemA);
	itemBBounds = getBounds(itemB);
	distance = p2mm(itemBBounds.bottom-itemABounds.bottom);
	width = p2mm(itemBBounds.width);
	height = p2mm(itemBBounds.height);
	center = p2mm(itemABounds.centerX - itemBBounds.centerX);
	var newEntries = [
		[name+"-底距離", distance],
		[name+"-寬", width],
		[name+"-高", height],
		[name+"-置中距離", center]
	];
	upsertMultipleToCsvFile(csvFile,newEntries);
}

function getSize(name){
    return name.split('-')[0];
}

function isNull(obj){
    return obj == null;
}

var doc = app.activeDocument;
size = getSize(doc.name);
var folder = doc.fullName.parent;
pathName = folder.fsName+'/'+size+'-data.csv';
alert(pathName);
var csvFile = new File(pathName);
data = readCsvToObj(csvFile);

layerName = "操作";
itemName = "對齊物件客人logo";
pageItem1 = getPageItemByNameInLayer(doc,"縫份","後片");
pageItem2 = getPageItemByNameInLayer(doc,layerName,itemName);
writePosition(csvFile,pageItem1,pageItem2,itemName);


itemName = "對齊物件姓名";
pageItem2 = getPageItemByNameInLayer(doc,layerName,itemName);
writePosition(csvFile,pageItem1,pageItem2,itemName);

itemName = "對齊物件大背號";
pageItem2 = getPageItemByNameInLayer(doc,layerName,itemName);
writePosition(csvFile,pageItem1,pageItem2,itemName);

pageItem1 = getPageItemByNameInLayer(doc,"縫份","前片");
itemName = "對齊物件前右胸logo";
pageItem2 = getPageItemByNameInLayer(doc,layerName,itemName);
writePosition(csvFile,pageItem1,pageItem2,itemName);

itemName = "對齊物件前左胸logo";
pageItem2 = getPageItemByNameInLayer(doc,layerName,itemName);
writePosition(csvFile,pageItem1,pageItem2,itemName);

itemName = "對齊物件前胸logo";
pageItem2 = getPageItemByNameInLayer(doc,layerName,itemName);
writePosition(csvFile,pageItem1,pageItem2,itemName);

itemName = "對齊物件前小號";
pageItem2 = getPageItemByNameInLayer(doc,layerName,itemName);
writePosition(csvFile,pageItem1,pageItem2,itemName);

pageItem1 = getPageItemByNameInLayer(doc,"縫份","左袖");
itemName = "對齊物件左袖";
pageItem2 = getPageItemByNameInLayer(doc,layerName,itemName);
writePositionDown(csvFile,pageItem1,pageItem2,itemName);

pageItem1 = getPageItemByNameInLayer(doc,"縫份","右袖");
itemName = "對齊物件右袖";
pageItem2 = getPageItemByNameInLayer(doc,layerName,itemName);
writePositionDown(csvFile,pageItem1,pageItem2,itemName);
