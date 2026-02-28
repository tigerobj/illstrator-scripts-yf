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
		var logFile = File(filePath + "/log_20250316.txt");
		logFile.encoding = "utf8";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close(); //作測試修改222
}


// 根据名称获取 PathItem 对象的函数
function getPathItemByName(name) {
	    // 在目标图层中查找指定名称的 pageItem
    try {
        var pageItem = doc.pathItems.getByName(name);
        return pageItem;
    } catch (e) {
        log(["' 未找到名为 '" + name + "' 的 pageItem。"]);
        return null;
    }
}


/**
 * 將不同圖層中相同名稱的頁面物件對齊，並替換遮罩中的物件，同時設置填色。
 *
 * @param {string} sourceLayerName - 來源圖層名稱（不在遮罩內的物件所在圖層）。
 * @param {string} targetLayerName - 目標圖層名稱（在遮罩內的物件所在圖層）。
 * @param {string} maskName - 遮罩內名稱。
 * @param {string} itemName - 頁面物件的名稱。
 */
function alignReplaceAndSetFill(sourceLayerName, targetLayerName,maskName, itemName) {
    //var doc = app.activeDocument;
    app.activeDocument = doc;

    // 獲取來源物件（不在遮罩內）
    var sourceItem = getPageItemByNameInLayer(doc, sourceLayerName, itemName);

    // 獲取目標物件（在遮罩內）
    var targetItem = getMaskedPageItemByNameInLayer(doc, targetLayerName,maskName, itemName);

    if (sourceItem && targetItem) {
        // 解鎖並顯示來源和目標物件
        unlockAndShowItem(sourceItem);
        unlockAndShowItem(targetItem);

        // 設置目標物件的填色為來源物件的填色
        setFillColor(targetItem,sourceItem);


        // 對齊來源物件到目標物件
        alignItems(sourceItem, targetItem);

        // 替換遮罩中的物件
        //replaceMaskItem(targetItem, sourceItem);


        //alert("已成功對齊、替換遮罩中的物件並設置填色。");
    } else {
        if (!sourceItem) {
            alert("找不到圖層 '" + sourceLayerName + "' 中名稱為 '" + itemName + "' 的來源物件。");
        }
        if (!targetItem) {
            alert("找不到圖層 '" + targetLayerName + "' 中名稱為 '" + itemName + "' 的目標遮罩物件。");
        }
    }
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




/**
 * 在指定圖層中遞歸查找位於遮罩內的頁面物件。
 *
 * @param {Document} doc - Adobe Illustrator 文件對象。
 * @param {string} layerName - 圖層的名稱。
 * @param {string} maskName - 遮罩名稱。
 * @param {string} itemName - 頁面物件的名稱。
 * @returns {PageItem|null} - 返回匹配的頁面物件，如果未找到則返回 null。
 */
function getMaskedPageItemByNameInLayer(doc, layerName,maskName, itemName) {
    var maskItem = getPageItemByNameInLayer(doc, layerName,maskName);
    var item = null;
    for(var i = 0;i<maskItem.pageItems.length ;i++){
		if(itemName === maskItem.pageItems[i].name){
			item = maskItem.pageItems[i];
			return item;
		}
	}

    return item;
}


/**
 * 根據名稱獲取圖層。
 *
 * @param {Document} doc - Adobe Illustrator 文件對象。
 * @param {string} layerName - 圖層名稱。
 * @returns {Layer|null} - 返回匹配的圖層或 null。
 */
function getLayerByName(doc, layerName) {
    var layers = doc.layers;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].name === layerName) {
            return layers[i];
        }
    }
    return null;
}

/**
 * 遞歸查找頁面物件。
 *
 * @param {PageItem} parent - 父頁面物件。
 * @param {string} itemName - 頁面物件的名稱。
 * @returns {PageItem|null} - 返回匹配的頁面物件或 null。
 */
function findPageItemRecursively(parent, itemName) {
    if (parent.name === itemName) {
        return parent;
    }
    if (parent.typename === "GroupItem") {
        var children = parent.pageItems;
        for (var i = 0; i < children.length; i++) {
            var found = findPageItemRecursively(children[i], itemName);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

/**
 * 檢查頁面物件是否為遮罩。
 *
 * @param {PageItem} item - 頁面物件。
 * @returns {boolean} - 如果是遮罩則返回 true，否則返回 false。
 */
function isClippingMask(item) {
    if (item.typename === "GroupItem" && item.clipped) {
        return true;
    }
    return false;
}

/**
 * 解鎖並顯示頁面物件。
 *
 * @param {PageItem} item - 頁面物件。
 */
function unlockAndShowItem(item) {
    item.locked = false;
    item.hidden = false;
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
 * 去空白
 * @param {string} str
 * @return {string}
 */

function trim (str) {
  return str.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');

}

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
    //alert(pathEnv);
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    myPathEvn = pathEnv;
    var file = new File(pathEnv + '/釣魚衣記錄點.csv');
    if (!file.exists) {
        alert(pathEnv + '/直條紋.csv 檔案不存在！請複製 直條紋.csv，再重新執行');
        return null;
    }
    return file;
}



function getKeys(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

function p2mm(n) {
  return n / 2.83464567;
}

function mm(n) {
  return n * 2.83464567;
}

vFile = checkForDataCsv();
vData = new Object();
// 打開檔案進行讀取
if (vFile.open('r')) {
    vFile.readln(); // 讀取並忽略首行（標題行）

    while (!vFile.eof) {
        var line = vFile.readln();
        var parts = line.split(';');
        if(parts.length == 1){
          parts = line.split(',');
        }
        if (parts.length >= 10) {
            var size = parts[0].trim();
            var style = parts[1].trim();
            var leftFrontX = parts[2].trim();
            var leftFrontY = parts[3].trim();
            var leftFrontSideX = parts[4].trim();
            var leftFrontSideY = parts[5].trim();
            var rightFrontX = parts[6].trim();
            var rightFrontY = parts[7].trim();
            var rightFrontSideX = parts[8].trim();
            var rightFrontSideY = parts[9].trim();

            var vKey = size+"_"+style;
            vData[vKey] = {
                size: size,
                style: style,
                leftFrontX: leftFrontX,
                leftFrontY: leftFrontY,
                leftFrontSideX: leftFrontSideX,
                leftFrontSideY: leftFrontSideY,
                rightFrontX: rightFrontX,
                rightFrontY: rightFrontY,
                rightFrontSideX: rightFrontSideX,
                rightFrontSideY: rightFrontSideY
            };
        }
    }
    vFile.close(); // 關閉檔案
} else {
    alert('無法打開檔案: ' + filePath);
}

slectValue = "";
isOk = false;

// 創建對話框
var dialog = new Window('dialog', '選擇直條紋種類');

// 獲取螢幕尺寸
var screenWidth = Screen.width;

// 設置對話框的佈局屬性
dialog.orientation = 'column';
dialog.alignChildren = ['fill', 'top'];
//dialog.maximumSize.width = 1024;

// 創建主組件
var mainGroup = dialog.add('group');
mainGroup.orientation = 'row';
mainGroup.alignChildren = ['fill', 'fill'];

// 左側面板：前協尺寸款式
var leftPanel = mainGroup.add('panel', undefined, '前協尺寸款式');
leftPanel.orientation = 'column';
leftPanel.alignChildren = ['fill', 'top'];
leftPanel.maximumSize.width = 200;
for (var key in vData) {
    if (vData.hasOwnProperty(key)) {
        var radioButton = leftPanel.add('radiobutton', undefined, key);
        radioButton.onClick = function() {
          slectValue = this.text;
          txtLeftFrontX.text = vData[this.text].leftFrontX;
          txtLeftFrontY.text = vData[this.text].leftFrontY;
          txtLeftFrontSideX.text = vData[this.text].leftFrontSideX;
          txtLeftFrontSideY.text = vData[this.text].leftFrontSideY;
          txtRightFrontX.text = vData[this.text].rightFrontX;
          txtRightFrontY.text = vData[this.text].rightFrontY;
          txtRightFrontSideX.text = vData[this.text].rightFrontSideX;
          txtRightFrontSideY.text = vData[this.text].rightFrontSideY;
        }
    }
}


// 右側面板：直條紋設定值
var rightPanel = mainGroup.add('panel', undefined, '記錄點設定值');
rightPanel.orientation = 'row';
rightPanel.alignChildren = ['fill', 'fill'];

var rightLblPanel = rightPanel.add('group');
rightLblPanel.orientation = 'column';


var rightTxtPanel = rightPanel.add('group');
rightTxtPanel.orientation = 'column';

var lblLeftFrontX = rightLblPanel.add('statictext', undefined, '左前-X:');
lblLeftFrontX.alignment = ['right', 'top'];

var lblLeftFrontY = rightLblPanel.add('statictext', undefined, '左前-Y:');
lblLeftFrontY.alignment = ['right', 'top'];

var lblLeftFrontSideX = rightLblPanel.add('statictext', undefined, '左前協-X:');
lblLeftFrontSideX.alignment = ['right', 'top'];

var lblLeftFrontSideY = rightLblPanel.add('statictext', undefined, '左前協-Y:');
lblLeftFrontSideY.alignment = ['right', 'top'];

var lblRightFrontX = rightLblPanel.add('statictext', undefined, '右前-X:');
lblRightFrontX.alignment = ['right', 'top'];

var lblRightFrontY = rightLblPanel.add('statictext', undefined, '右前-Y:');
lblRightFrontY.alignment = ['right', 'top'];

var lblRightFrontSideX = rightLblPanel.add('statictext', undefined, '右前協-X:');
lblRightFrontSideX.alignment = ['right', 'top'];

var lblRightFrontSideY = rightLblPanel.add('statictext', undefined, '右前協-Y:');
lblRightFrontSideY.alignment = ['right', 'top'];





var txtLeftFrontX = rightTxtPanel.add('edittext', undefined, '', { readonly: true });
txtLeftFrontX.characters = 20;
txtLeftFrontX.alignment = ['left', 'top'];

var txtLeftFrontY = rightTxtPanel.add('edittext', undefined, '', { readonly: true });
txtLeftFrontY.characters = 20;
txtLeftFrontY.alignment = ['left', 'top'];

var txtLeftFrontSideX = rightTxtPanel.add('edittext', undefined, '', { readonly: true });
txtLeftFrontSideX.characters = 20;
txtLeftFrontSideX.alignment = ['left', 'top'];

var txtLeftFrontSideY = rightTxtPanel.add('edittext', undefined, '', { readonly: true });
txtLeftFrontSideY.characters = 20;
txtLeftFrontSideY.alignment = ['left', 'top'];

//=====================

var txtRightFrontX = rightTxtPanel.add('edittext', undefined, '', { readonly: true });
txtRightFrontX.characters = 20;
txtRightFrontX.alignment = ['left', 'top'];

var txtRightFrontY = rightTxtPanel.add('edittext', undefined, '', { readonly: true });
txtRightFrontY.characters = 20;
txtRightFrontY.alignment = ['left', 'top'];

var txtRightFrontSideX = rightTxtPanel.add('edittext', undefined, '', { readonly: true });
txtRightFrontSideX.characters = 20;
txtRightFrontSideX.alignment = ['left', 'top'];

var txtRightFrontSideY = rightTxtPanel.add('edittext', undefined, '', { readonly: true });
txtRightFrontSideY.characters = 20;
txtRightFrontSideY.alignment = ['left', 'top'];





// 添加按鈕組
var buttonGroup = dialog.add('group');
buttonGroup.orientation = 'row';
buttonGroup.alignment = ['center', 'bottom'];

var okButton = buttonGroup.add('button', undefined, '確定', { name: 'ok' });
var cancelButton = buttonGroup.add('button', undefined, '取消', { name: 'cancel' });

cancelButton.onClick = function() {
  isOk = false;
  win.close();
}

okButton.onClick = function() {
  isOk = true;

  win.close();
}



dialog.layout.layout(true);
dialog.show();
myPathEvn = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
if(isOk){
  if(! slectValue){
    alert("沒有選擇直條紋樣式");
  }else{
    doc = app.activeDocument;
    myLayer = getLayerByName(doc,"裁切");
    doc.activeLayer = myLayer;
    myLayer.locked = false;
    createMaskPlacketCover("左前協","左前",false);
    createMaskPlacketCover("右前協","右前",false);
    myLayer.locked = true;
  }
}



function createMaskPlacketCover(name,isAll,isCenterLine){
  activePageItem = getPageItemByNameInLayer(doc, "裁切", name);
  vPageItem = placketCoverCreateStripes(name,isAll,isCenterLine);
  createMask(name,vPageItem);
}

//左前,跟右前直條紋,從後片複製移動位置
function placketCoverCreateStripes(name,sName,isCenterLine){

  activePageItem = getPageItemByNameInLayer(doc, "裁切", name);

  ok = findPageItemInGroup(activePageItem,"底色");

  backPageItem = getPageItemByNameInLayer(doc, "裁切", sName);
  findItem = findPageItemInGroup(backPageItem,"直條紋");
  vPageItem = findItem.duplicate(ok,ElementPlacement.PLACEBEFORE);
  if(name == "左前協"){
    x =  vData[slectValue].leftFrontSideX - vData[slectValue].leftFrontX;
    y =  vData[slectValue].leftFrontSideY - vData[slectValue].leftFrontY;
  }else{
    x =  vData[slectValue].rightFrontSideX - vData[slectValue].rightFrontX;
    y =  vData[slectValue].rightFrontSideY - vData[slectValue].rightFrontY;
  }

  vPageItem.translate(x, y);
  return vPageItem;
}

function createMask(name,vPageItem){
  activePageItem = getPageItemByNameInLayer(doc, "裁切", name);

  maskPageItem = findPageItemInGroup(activePageItem,"底色");

  //maskPageItem = findPageItemInGroup(activePageItem,"底色");
  maskPageItem2 = maskPageItem.duplicate(vPageItem, ElementPlacement.PLACEBEFORE);
  var group = activePageItem.groupItems.add();
  group.name="直條紋遮罩";
  vPageItem.move(group, ElementPlacement.PLACEATEND);
  maskPageItem2.move(group, ElementPlacement.PLACEATBEGINNING);
  group.clipped = true;
  group.move(maskPageItem,ElementPlacement.PLACEBEFORE);
}





function artboardRectToLog(){
	var doc = app.activeDocument;

	// 取得目前的工作區域索引
	var activeArtboardIndex = doc.artboards.getActiveArtboardIndex();

	// 取得當前工作區域的邊界
	var bounds = doc.artboards[activeArtboardIndex].artboardRect;
	// 取得各點座標 (點數)
	var x1 = bounds[0]; // 左
	var y1 = bounds[1]; // 上
	var x2 = bounds[2]; // 右
	var y2 = bounds[3]; // 下
	// 計算寬高
	var width = x2 - x1;
	var height = y1 - y2;

	// 轉換為毫米 (1 點 = 0.352778 mm)
	//var pointToMM = 0.352778;//p2mm
	var pointToMM = p2mm(1);//
	var xMM = x1 * pointToMM;
	var yMM = y1 * pointToMM; // 修正Y軸方向
	var widthMM = width * pointToMM;
	var heightMM = height * pointToMM;
	log(["工作區域座標與尺寸 (mm) ->X:",xMM," Y: ",yMM,"寬度: ",widthMM,"高度: ",heightMM,"x2: ",x2 * pointToMM,"y2: ",y2 * pointToMM]);
}



//原點為工作區域的左上
function boundsToLog(pageItem){
	// 取得目前的工作區域索引
	var activeArtboardIndex = doc.artboards.getActiveArtboardIndex();
	var artboardBounds = doc.artboards[activeArtboardIndex].artboardRect;
	var aX1 = artboardBounds[0]; // 左
	var aY1 = artboardBounds[1]; // 上

	//點（point） 為單位，而 1 點 = 1/72 英吋。
	//[上, 左, 下, 右] // 順序為：yMax, xMin, yMin, xMax
	//取得物件的邊界（使用 geometricBounds 來匹配 Illustrator 顯示數值）
	var bounds = pageItem.geometricBounds;
	// 取得各點座標 (點數)
	var x1 = bounds[0]; // 左
	var y1 = bounds[1]; // 上
	var x2 = bounds[2]; // 右
	var y2 = bounds[3]; // 下
	// 計算寬高
	var width = x2 - x1;
	var height = y1 - y2;

	// 轉換為毫米 (1 點 = 0.352778 mm)
	//var pointToMM = 0.352778;//p2mm
	var pointToMM = p2mm(1);//
	var xMM = (x1-aX1) * pointToMM;
	var yMM = (aY1-y1) * pointToMM; // 修正Y軸方向
	var widthMM = width * pointToMM;
	var heightMM = height * pointToMM;
	log(["pageItem name : ",pageItem.name,"物件座標與尺寸 (mm) ->X:",xMM," Y: ",yMM,"寬度: ",widthMM,"高度: ",heightMM,"x2: ",x2 * pointToMM,"y2: ",y2 * pointToMM]);
}
