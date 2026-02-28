#include "json2.js";
#include "排版-尺寸選擇.jsx";
//排版-女版領衫長袖.jsx
cloName = "女版圓領衫長袖";
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
    var logFile = File(filePath + "/排版-"+cloName+".txt");
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

function wordToGroup(layer) {
    var groups = [];
    layerName = layer.name;
    for (var i = 0; i < layer.groupItems.length; i++) {
        var group = layer.groupItems[i];
        if("尺寸字" == group.name){
          // alert(group.name);
          //alert("尺寸字 length : "+group.textFrames.length);
          for(var j = 0;j<group.textFrames.length;j++){
            textFrame = group.textFrames[j];
            var str  = textFrame.contents;
            if(textFrame.name){
              str = textFrame.name;
            }

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

    // alert("groups.length = "+groups.length+" , groups = "+groups);
    for(var i=0;i<groups.length;i++){
      groups[i][0].move(groups[i][1], ElementPlacement.PLACEATBEGINNING);
    }

    return groups;
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

function topCenterXY(itemA, itemB){
      targetBounds = getBounds(itemA);
      selectedBounds = getBounds(findPageItemInGroup(itemB,"底色"));
      x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
      y = (targetBounds.top -selectedBounds.top);
      return{
        left:x,
        top:y
      }
}

function isNameInKeywords(name) {
    var keywords = ["前片", "後片", "左袖", "右袖", "左袖口", "右袖口", "領"];

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
        itemA = getPageItemByNameInLayer(app.activeDocument,"排版",layoutName);
        //alert(itemA);
        a = topCenterXY(itemA,group);
        //alert(layoutName);
        group.translate(a.left,a.top);

    }

    return groups;
}

// /**
//  * 判斷當前目錄下是否存在名為 'clothes.' 的檔案
//  *
//  * @returns {File} - 如果找到 'clothes.csv' 則返回檔案物件，否則返回 null
//  */
// function checkSizeFile() {
//     var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
//     //alert(pathEnv);
//     if (pathEnv === null) {
//         alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
//         return null;
//     }
//     myPathEvn = pathEnv;
//     var file = new File(pathEnv + '/尺寸.txt');
//     if (!file.exists) {
//         alert(pathEnv + '/尺寸.txt 檔案不存在！請複製 尺寸.txt，再重新執行');
//         return null;
//     }
//     return file;
// }

String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');

}

// sFilse = checkSizeFile();

// // 打開檔案進行讀取
// if (sFilse.open('r')) {
//     line = sFilse.readln(); // 讀取並忽略首行（標題行）
//     var parts = line.split(';');
//     clothes_size = parts[0].trim();
//     sFilse.close(); // 關閉檔案
// } else {
//     alert('無法打開檔案: ' + filePath);
// }

var doc = app.activeDocument;
var names = [];

clothes_size = selectSize(cloName);
fileName = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH')+"/排版-"+ clothes_size +"-"+cloName+".csv";
alert(fileName);
layoutObj = readCsvToObj(File(fileName));

for (var i = 0; i < doc.layers.length; i++) {
  if("排版" !== doc.layers[i].name){
    //alert(doc.layers[i]);
    wordToGroup(doc.layers[i]);
    getTopLevelGroupsFromLayer(doc.layers[i]);
  }
}
