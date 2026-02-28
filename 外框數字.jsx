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
    var logFile = File(filePath + "/新圓領-產生.txt");
    logFile.encoding = "utf8";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close(); //作測試修改222
}

/**
 * 遞歸查找指定圖層中的頁面物件。
 *
 * @param {Item} item - 目前檢查的物件。
 * @param {string} itemName - 要查找的物件名稱。
 * @returns {PageItem|null} - 返回對應的頁面物件，如果未找到則返回 null。
 */
function findPageItemInGroup(item, itemName) {
    if (item.name === itemName) {
        return item;
    }

    // 如果是群組，則遞歸檢查其子物件
    if (item.typename === "GroupItem") {
        var items = item.pageItems;
        for (var i = 0; i < items.length; i++) {
            var foundItem = findPageItemInGroup(items[i], itemName);
            if (foundItem) {
                return foundItem;
            }
        }
    }

    return null; // 如果未找到對應物件
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

//itemB 縮放並且對對齊置中itemA
function scale(item,scaleFactor){
  var scaleMatrix = app.getScaleMatrix(scaleFactor * 100, scaleFactor * 100);
  item.transform(
      scaleMatrix,
      true,   // 改變物件
      true,   // 改變圖案
      false,   // 改變漸層
      false,   // 改變筆畫
      scaleFactor * 100,
      Transformation.CENTER
  );
}

function writeCsv(doc,aItem,bItem,index){
   a = getBounds(aItem);
   b = getBounds(bItem);
   var pathEnv = getFolderPath(doc.fullName.fsName);
   var csvFile = new File(pathEnv+"外框數字.csv");

   if(index == 0){
     var newEntries = [
       ["前小號範本高", p2mm(a.height)],
       ["前小號範本間距", p2mm(b.left - a.right)]
     ];
   }else if(index == 1){
     var newEntries = [
       ["大背號範本高", p2mm(a.height)],
       ["大背號範本間距", p2mm(b.left - a.right)]
     ];
   }
   upsertMultipleToCsvFile(csvFile,newEntries);
}


function writeCsvForCloth(doc,aItem,index){
  a = getBounds(aItem);
  var pathEnv = getFolderPath(doc.fullName.fsName);
  var csvFile = new File(pathEnv+"/外框數字.csv");
  data = readCsvToObj(csvFile);
  if(index == 0){
    h = data["前小號範本高"];
    c = data["前小號範本間距"];
    v = (a.height / h) *c;
    var newEntries = [
      ["前小號高", p2mm(a.height)],
      ["前小號間距", p2mm(v)]
    ];
  }else if(index == 1){
    h = data["大背號範本高"];
    c = data["大背號範本間距"];
    v = (a.height / h) *c;
    var newEntries = [
      ["大背號高", p2mm(a.height)],
      ["大背號間距", p2mm(v)]
    ];
  }

  upsertMultipleToCsvFile(csvFile,newEntries);
}

function getNumber(doc,index){
  try {
      okLayer = doc.layers.getByName("完成");

  } catch (e) {
      okLayer = doc.layers.add();
      okLayer.name = "完成"

  }


  if(index == 0){
    okGroup = okLayer.groupItems.add();
    okGroup.name = "前小號";
    var pathEnv = getFolderPath(doc.fullName.fsName);
    var csvFile = new File(pathEnv+"/外框數字.csv");
    data = readCsvToObj(csvFile);
    a = ""+data["產生數字"];

    cap = mm(data["前小號間距"]);
    item = getPageItemByNameInLayer(doc, "範本", "數字");
    for(var i = 0;i<a.length;i++){
      number = findPageItemInGroup(item, a[i]).duplicate();
      number.move(okGroup, ElementPlacement.PLACEATBEGINNING);
      aBounds = getBounds(number);
      b = mm(data["前小號高"]);
      //alert(b/aBounds.height);
      scale(number,(b/aBounds.height));
      if(i==0){
        n1 = number;
      }else if(i==1){
        n2 = number;
        n1Bounds = getBounds(n1);
        n2Bounds = getBounds(n2);

        n2.translate( n1Bounds.right -n2Bounds.left + cap, 0);
      }
    }
  }else if(index == 1){
    okGroup = okLayer.groupItems.add();
    okGroup.name = "大背號";
    var pathEnv = getFolderPath(doc.fullName.fsName);
    var csvFile = new File(pathEnv+"/外框數字.csv");
    data = readCsvToObj(csvFile);
    a = ""+data["產生數字"];

    cap = mm(data["大背號間距"]);
    item = getPageItemByNameInLayer(doc, "範本", "數字");
    for(var i = 0;i<a.length;i++){
      number = findPageItemInGroup(item, a[i]).duplicate();
      number.move(okGroup, ElementPlacement.PLACEATBEGINNING);
      aBounds = getBounds(number);
      b = mm(data["大背號高"]);
      //alert(b/aBounds.height);
      scale(number,(b/aBounds.height));
      if(i==0){
        n1 = number;
      }else if(i==1){
        n2 = number;
        n1Bounds = getBounds(n1);
        n2Bounds = getBounds(n2);

        n2.translate( n1Bounds.right -n2Bounds.left + cap, 0);
      }
    }
  }
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
group = getPageItemByNameInLayer(doc,"範本","前小號範本");

aItem = findPageItemInGroup(group,"1");
bItem = findPageItemInGroup(group,"2");
writeCsv(doc,aItem,bItem,0);

group = getPageItemByNameInLayer(doc,"範本","大背號範本");
aItem = findPageItemInGroup(group,"1");
bItem = findPageItemInGroup(group,"2");
writeCsv(doc,aItem,bItem,1);

group = getPageItemByNameInLayer(doc,"實際大小","前小號");
aItem = findPageItemInGroup(group,"1");
writeCsvForCloth(doc,aItem,0);

group = getPageItemByNameInLayer(doc,"實際大小","大背號");
aItem = findPageItemInGroup(group,"1");
writeCsvForCloth(doc,aItem,1);


getNumber(doc,0);
getNumber(doc,1);
