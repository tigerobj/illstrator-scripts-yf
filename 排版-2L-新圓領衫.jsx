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
    var logFile = File(filePath + "/排版-2L-新圓領衫.txt");
		logFile.encoding = "utf8";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close(); //作測試修改222
}
function createFarme(selectedItem,name){
    var doc = app.activeDocument;
    // 取得指定圖層
    try {
        var targetLayer = doc.layers.getByName("操作");
    } catch(e) {
        targetLayer = doc.layers.add();
        targetLayer.name = "操作";
        alert("建立圖層名稱：" + targetLayer.name);
    }
    // 取得選取物件邊界
    var bounds = selectedItem.geometricBounds;
    var left = bounds[0];
    var top = bounds[1];
    var right = bounds[2];
    var bottom = bounds[3];
    var width = right - left;
    var height = top - bottom;
    // 建立矩形外框（與選取物件邊界一致）
    var rectFrame = targetLayer.pathItems.rectangle(top, left, width, height);
    // 設定矩形邊框為黑色1pt
    rectFrame.stroked = false;
    // rectFrame.strokeColor = new CMYKColor();
    // rectFrame.strokeColor.black = 100;
    // rectFrame.strokeWidth = 1;
    // 設定內部填色為紅色
    rectFrame.filled = true;
    rectFrame.fillColor = new CMYKColor();
    rectFrame.fillColor.cyan = 0;
    rectFrame.fillColor.magenta = 100;
    rectFrame.fillColor.yellow = 100;
    rectFrame.fillColor.black = 0;
    // 設定透明度為 50%
    rectFrame.opacity = 50;
    rectFrame.name = name;
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


function wordToGroup(layer) {
    var groups = [];
    layerName = layer.name;
    for (var i = 0; i < layer.groupItems.length; i++) {
        var group = layer.groupItems[i];
        if("尺寸字" == group.name){

          //alert("尺寸字 length : "+group.textFrames.length);
          for(var j = 0;j<group.textFrames.length;j++){
            textFrame = group.textFrames[j];
            var str  = textFrame.contents;



            if (str.indexOf("右袖") !== -1) {
                item = getPageItemByNameInLayer(doc,layer.name,"右袖");
                groups.push([textFrame,item]);
                //alert("右袖");
            }else if (str.indexOf("左袖") !== -1) {
                item = getPageItemByNameInLayer(doc,layer.name,"左袖");
                groups.push([textFrame,item]);
                //alert("左袖");
            }else if (str.indexOf("前片") !== -1) {
                item = getPageItemByNameInLayer(doc,layer.name,"前片");
                groups.push([textFrame,item]);
                //alert("前袖");
            }else if (str.indexOf("後片") !== -1) {
                item = getPageItemByNameInLayer(doc,layer.name,"後片");
                groups.push([textFrame,item]);
                //alert("後袖");
            }else{
                item = getPageItemByNameInLayer(doc,layer.name,"領");
                groups.push([textFrame,item]);
                //alert("領");
            }

          }
        }
    }

    for(var i=0;i<groups.length;i++){
      groups[i][0].move(groups[i][1], ElementPlacement.PLACEATBEGINNING);
    }

    return groups;
}

function bottomLeft(selectedItem,layerName, targetItemName, distance){
    var doc = app.activeDocument;
        // 取得指定圖層
    try {
        var targetLayer = doc.layers.getByName(layerName);
    } catch(e) {
        alert("找不到指定的圖層：" + layerName);
    }

    // 找尋目標群組
    var foundItem  = null;
    for(var i = 0; i < targetLayer.pageItems.length; i++){
        if(targetLayer.pageItems[i].name == targetItemName){
            foundItem = targetLayer.pageItems[i];
            break;
        }
    }

    if (!foundItem) {
        alert("在圖層「" + layerName + "」內找不到群組「" + groupName + "」！");
    }

    // 取得目標群組的邊界資訊
    var boundsGroup = foundItem.geometricBounds;
    var groupLeft = boundsGroup[0];
    var groupTop = boundsGroup[1];
    var groupRight = boundsGroup[2];

    // 取得選取物件的邊界資訊
    var boundsItem2 = findPageItemInGroup(selectedItem,"框").geometricBounds;
    var item2Left = boundsItem2[0];
    var item2Top = boundsItem2[1];
    var item2Width = boundsItem2[2] - boundsItem2[0];
    var item2Height = boundsItem2[1] - boundsItem2[3];


    var boundsItem = selectedItem.geometricBounds;
    var itemLeft = boundsItem[0];
    var itemTop = boundsItem[1];
    var itemWidth = boundsItem[2] - boundsItem[0];
    var itemHeight = boundsItem[1] - boundsItem[3];

    // 轉換單位 (mm轉為點數，1mm = 2.834645 pt)
    var verticalDistance = distance * 2.834645;

    // 計算新位置
    if(item2Left === itemLeft){
      offsetX = groupLeft - itemLeft;
    }
    if(item2Left > itemLeft){
      d = (item2Left - itemLeft);
      offsetX = groupLeft - itemLeft -d;
    }

    if(item2Top === itemTop){
      offsetY = groupTop - itemTop;
    }
    if(itemTop > item2Top){
      d = (item2Top - itemTop);
      offsetY = groupTop - itemTop -d;
    }
    selectedItem.translate(offsetX, offsetY);


}

function isNameInKeywords(name) {
    var keywords = ["前片", "後片", "左袖", "右袖", "領", "領滾條"];

    for (var i = 0; i < keywords.length; i++) {
        if (name.indexOf(keywords[i]) !== -1) {
            return true;
        }
    }
    return false;
}


function getTopLevelGroupsFromLayer(layer) {
    var groups = [];
    layerName = layer.name;
    for (var i = 0; i < layer.groupItems.length; i++) {
        var group = layer.groupItems[i];
        //alert("group name = "+group.name);
        if(! isNameInKeywords(group.name)){
          continue;
        }
        layoutName = group.name+"-"+layerName;
        //alert(layoutName);
        //alert(layoutObj[layoutName]);
        if("反" === layoutObj[layoutName]){
          group.rotate(180);
        }
        //alert(layoutName);
        bottomLeft(group,"排版",layoutName,0);
    }

    return groups;
}

var doc = app.activeDocument;
var names = [];

fileName = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH')+"/排版-2L-新圓領衫.csv";
layoutObj = readCsvToObj(File(fileName));

for (var i = 0; i < doc.layers.length; i++) {
  if("排版" !== doc.layers[i].name){
    wordToGroup(doc.layers[i]);
    //alert(doc.layers[i]);
    getTopLevelGroupsFromLayer(doc.layers[i]);
  }
}
