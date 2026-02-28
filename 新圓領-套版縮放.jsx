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
    var logFile = File(filePath + "/新圓領-套版縮放.txt");
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

function getOutlineBounds(item) {
		var b = item.visibleBounds;
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

function centerAlign(itemA,itemB){
    if(itemA == null){
        return null;
    }
    if(itemB == null){
        return null;
    }
    itemABounds = getBounds(itemA);
    itemBBounds = getBounds(itemB);
    offsetX = itemABounds.left - itemBBounds.left + (itemABounds.width - itemBBounds.width)/2;
    offsetY = itemABounds.top - itemBBounds.top - (itemABounds.height - itemBBounds.height)/2;
    itemB.translate(offsetX, offsetY);
}

function centerTopAlign(itemA,itemB){
    if(itemA == null){
        return null;
    }
    if(itemB == null){
        return null;
    }
    itemABounds = getBounds(itemA);
    itemBBounds = getBounds(itemB);
    offsetX = itemABounds.left - itemBBounds.left + (itemABounds.width - itemBBounds.width)/2;
    offsetY = itemABounds.top - itemBBounds.top;
    itemB.translate(offsetX, offsetY);
}

function centerDownAlign(itemA,itemB){
    if(itemA == null){
        return null;
    }
    if(itemB == null){
        return null;
    }
    itemABounds = getBounds(itemA);
    itemBBounds = getBounds(itemB);
    offsetX = itemABounds.left - itemBBounds.left + (itemABounds.width - itemBBounds.width)/2;
    offsetY = itemABounds.top - itemBBounds.top - (itemABounds.height - itemBBounds.height);
    itemB.translate(offsetX, offsetY);
}

function rightAlign(itemA,itemB){
    if(itemA == null){
        return null;
    }
    if(itemB == null){
        return null;
    }
    itemABounds = getBounds(itemA);
    //itemBBounds = getBounds(itemB);
    itemBBounds = getOutlineBounds(itemB);
    offsetX = itemABounds.left - itemBBounds.left + (itemABounds.width - itemBBounds.width);
    offsetY = itemABounds.top - itemBBounds.top - (itemABounds.height - itemBBounds.height)/2;
    itemB.translate(offsetX, offsetY);
}


//itemB 縮放並且對對齊置中itemA
function scaleAndAlign(itemA,itemB){
  if(itemA == null){
      return null;
  }
  if(itemB == null){
      return null;
  }
  itemABounds = getBounds(itemA);
  itemBBounds = getBounds(itemB);
  // 計算所需的縮放比例 (以寬度為基準)
  var scaleFactor = itemABounds.width / itemBBounds.width;
  // 使用 transform() 手動縮放（避免 resize 無效）
  var scaleMatrix = app.getScaleMatrix(scaleFactor * 100, scaleFactor * 100);
  itemB.transform(
      scaleMatrix,
      true,   // 改變物件
      true,   // 改變圖案
      false,   // 改變漸層
      false,   // 改變筆畫
      scaleFactor * 100,
      Transformation.CENTER
  );
  centerTopAlign(itemA,itemB);

}

function writePosition(csvFile,itemA,itemB,name){
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

function createFarme(name,data,item){
    var doc = app.activeDocument;
    // 取得指定圖層
    try {
        var targetLayer = doc.layers.getByName("操作");
    } catch(e) {
        targetLayer = doc.layers.add();
        targetLayer.name = "操作";
        //alert("建立圖層名稱：" + targetLayer.name);
    }
    //alert(data[name+"-寬"]);
    if(!data[name+"-寬"]){
      return null;
    }

    itemBounds = getBounds(item);

    var left = itemBounds.centerX - mm(data[name+"-寬"])/2 -  mm(data[name+"-置中距離"]);
    var top = itemBounds.top-mm(data[name+"-上距離"]);
    var width = mm(data[name+"-寬"]);
    var height = mm(data[name+"-高"]);
    // 建立矩形外框（與選取物件邊界一致）
    var rectFrame = targetLayer.pathItems.rectangle(top, left, width, height);
    rectFrame.stroked = false;
    rectFrame.filled = true;
    rectFrame.fillColor = new CMYKColor();
    rectFrame.fillColor.cyan = 0;
    rectFrame.fillColor.magenta = 100;
    rectFrame.fillColor.yellow = 100;
    rectFrame.fillColor.black = 0;
    // 設定透明度為 50%
    rectFrame.opacity = 50;
    rectFrame.name = name;
    //alert("text name : "+name);
    return rectFrame;
}


function createFarmeDown(name,data,item){
    var doc = app.activeDocument;
    // 取得指定圖層
    try {
        var targetLayer = doc.layers.getByName("操作");
    } catch(e) {
        targetLayer = doc.layers.add();
        targetLayer.name = "操作";
        //alert("建立圖層名稱：" + targetLayer.name);
    }
    if(!data[name+"-寬"]){
      return null;
    }


    itemBounds = getBounds(item);

    var left = itemBounds.centerX - mm(data[name+"-寬"])/2 -  mm(data[name+"-置中距離"]);
    var width = mm(data[name+"-寬"]);
    var height = mm(data[name+"-高"]);
    var top = itemBounds.bottom+mm(data[name+"-底距離"])+height;

    // 建立矩形外框（與選取物件邊界一致）
    var rectFrame = targetLayer.pathItems.rectangle(top, left, width, height);
    rectFrame.stroked = false;
    rectFrame.filled = true;
    rectFrame.fillColor = new CMYKColor();
    rectFrame.fillColor.cyan = 0;
    rectFrame.fillColor.magenta = 100;
    rectFrame.fillColor.yellow = 100;
    rectFrame.fillColor.black = 0;
    // 設定透明度為 50%
    rectFrame.opacity = 50;
    rectFrame.name = name;
    return rectFrame;
}

function getPageItemByNameForDoc(mydoc,name){
	//var groupItem = doc.groupItems.getByName(groupName);
	try {
		var pageItems = mydoc.pageItems.getByName(name);
		return pageItems;
	} catch (e) {
		log(["doc名稱為 ： ",mydoc.name,"沒有pageItem名稱為 : ",name]);
		return null;
	}

}

function pageItemsCopy(doc,path,groupList){
	sourceDoc = app.open(File(path));
	for (var i = 0; i < groupList.length; i++) {
		//alert(groupList[i]);
		groupItem = getPageItemByNameForDoc(sourceDoc,groupList[i]);
		if(!groupItem){
			continue;
		}

		groupItem.selected = true;
	}
	app.activeDocument = sourceDoc;
	app.copy();
	app.activeDocument = doc;
	app.paste();
	sourceDoc.close(SaveOptions.DONOTSAVECHANGES);
}

function findPageByName(doc,name){
    try {
		var pageItems = doc.pageItems.getByName(name);
		return pageItems;
	} catch (e) {
		log(["doc名稱為 ： ",doc.name,"沒有pageItem名稱為 : ",name]);
		return null;
	}
}

function align(a,b,align){
    if("置中" === align){
        centerAlign(a,b);
    }else if("靠右" === align){
        rightAlign(a,b);
    }

}

function isEmptyString(str) {
    return str == null || str === "";
}

//取資料夾路徑
function getFolderPath(fullFilePath) {
  // 將所有反斜線 \ 替換為正斜線 /
  var normalizedPath = fullFilePath.replace(/\\/g, '/');
  // 找出最後一個斜線的位置
  var lastSlashIndex = normalizedPath.lastIndexOf('/');
  // 提取資料夾路徑
  return normalizedPath.substring(0, lastSlashIndex + 1);
}

var doc = app.activeDocument;
targetLayer = doc.layers.add();
targetLayer.name = "套版縮放";

// pathName = "H:\杰優、裕豐工廠產品\阿庚訂單\114\03\18\宏川\宏川新竹青商練習衣追加資料/L-data.csv";
// var csvFile = new File(pathName);

list = ["右袖文字","左袖文字","前胸logo","前左胸logo","前右胸logo","前小號","大背號","姓名","客人logo"
        ,"後片","前片","左袖","右袖"
        ,"對齊物件右袖","對齊物件左袖","對齊物件前小號","對齊物件前胸logo","對齊物件前左胸logo","對齊物件前右胸logo","對齊物件大背號","對齊物件姓名","對齊物件客人logo"
       ];


var fullPath = getFolderPath(doc.fullName.fsName);

// var cPathName = "H:/杰優、裕豐工廠產品/阿庚訂單/114/03/18/宏川/宏川新竹青商練習衣追加資料/L-套版.eps";
alert("目前檔案所在位置:"+fullPath);
var cPathName = fullPath+"L-套版.eps";
pageItemsCopy(doc,cPathName,list);

var tmpGroup = targetLayer.groupItems.add();
tmpGroup.name = "後片群組";
a1 = getPageItemByNameInLayer(doc,"套版縮放","對齊物件客人logo");
if(a1){
  a1.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
a2 = getPageItemByNameInLayer(doc,"套版縮放","對齊物件姓名");
if(a2){
  a2.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
a3 = getPageItemByNameInLayer(doc,"套版縮放","對齊物件大背號");
if(a3){
  a3.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
a4 = getPageItemByNameInLayer(doc,"套版縮放","後片");

if(a4){
  a4.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
a4.stroked = false;
scaleAndAlign(getPageItemByNameInLayer(doc,"縫份","後片"),tmpGroup);
a4.stroked = true;
a4.strokeColor = new CMYKColor();
a4.strokeColor.black = 100;
a4.strokeWidth = 1;
centerAlign(a1,findPageByName(doc,"客人logo"));
centerAlign(a2,findPageByName(doc,"姓名"));
centerAlign(a3,findPageByName(doc,"大背號"));

targetLayer2 = doc.layers.add();
targetLayer2.name = "操作";
if(a1){
  a1.move(targetLayer2, ElementPlacement.PLACEATBEGINNING);
}
if(a2){
  a2.move(targetLayer2, ElementPlacement.PLACEATBEGINNING);
}
if(a3){
  a3.move(targetLayer2, ElementPlacement.PLACEATBEGINNING);
}
tmpGroup.remove();



tmpGroup = targetLayer.groupItems.add();
tmpGroup.name = "前片群組";
a1 = getPageItemByNameInLayer(doc,"套版縮放","對齊物件前右胸logo");
if(a1){
  a1.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
a2 = getPageItemByNameInLayer(doc,"套版縮放","對齊物件前左胸logo");
if(a2){
  a2.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
a3 = getPageItemByNameInLayer(doc,"套版縮放","對齊物件前胸logo");
if(a3){
  a3.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
a4 = getPageItemByNameInLayer(doc,"套版縮放","對齊物件前小號");
if(a4){
  a4.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
a5 = getPageItemByNameInLayer(doc,"套版縮放","前片");
if(a5){
  a5.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}

a5.stroked = false;
scaleAndAlign(getPageItemByNameInLayer(doc,"縫份","前片"),tmpGroup);
a5.stroked = true;
a5.strokeColor = new CMYKColor();
a5.strokeColor.black = 100;
a5.strokeWidth = 1;
centerAlign(a1,findPageByName(doc,"前右胸logo"));
centerAlign(a2,findPageByName(doc,"前左胸logo"));
centerAlign(a3,findPageByName(doc,"前胸logo"));
centerAlign(a4,findPageByName(doc,"前小號"));

if(a1){
  a1.move(targetLayer2, ElementPlacement.PLACEATBEGINNING);
}
if(a2){
  a2.move(targetLayer2, ElementPlacement.PLACEATBEGINNING);
}
if(a3){
  a3.move(targetLayer2, ElementPlacement.PLACEATBEGINNING);
}
if(a4){
  a4.move(targetLayer2, ElementPlacement.PLACEATBEGINNING);
}

tmpGroup.remove();



tmpGroup = targetLayer.groupItems.add();
tmpGroup.name = "左袖群組";
a1 = getPageItemByNameInLayer(doc,"套版縮放","對齊物件左袖");
if(a1){
  a1.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
a = getPageItemByNameInLayer(doc,"套版縮放","左袖");
if(a){
  a.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
centerDownAlign(getPageItemByNameInLayer(doc,"縫份","左袖"),tmpGroup);
centerAlign(a1,findPageByName(doc,"左袖文字"));
if(a1){
  a1.move(targetLayer2, ElementPlacement.PLACEATBEGINNING);
}
tmpGroup.remove();



tmpGroup = targetLayer.groupItems.add();
tmpGroup.name = "右袖群組";
a1 = getPageItemByNameInLayer(doc,"套版縮放","對齊物件右袖");
if(a1){
  a1.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
a = getPageItemByNameInLayer(doc,"套版縮放","右袖");
if(a){
  a.move(tmpGroup,ElementPlacement.PLACEATBEGINNING);
}
centerDownAlign(getPageItemByNameInLayer(doc,"縫份","右袖"),tmpGroup);
centerAlign(a1,findPageByName(doc,"右袖文字"));
if(a1){
  a1.move(targetLayer2, ElementPlacement.PLACEATBEGINNING);
}
tmpGroup.remove();

mainLayer = doc.layers.getByName("裁切");
groups  = mainLayer.groupItems;
for(var i=groups.length-1;i>=0;i--){
  a = groups[i];
  a.remove();
}

secLayer = doc.layers.getByName("套版縮放");
items = secLayer.pageItems;

for(var i=items.length-1;i>=0;i--){
  a = items[i];
  //alert(a.name);
  a.move(mainLayer, ElementPlacement.PLACEATBEGINNING);
}
secLayer.remove();
