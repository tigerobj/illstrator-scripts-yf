#include "json2.js";
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
    var logFile = File(filePath + "/log_裁切底色選擇.txt");
		logFile.encoding = "utf8";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close(); //作測試修改222
}

var allPageItems = null;

//取得所有裁片群組
function getCutPieceGroups(checkboxes){
  var doc = app.activeDocument;
  // 获取指定名称的图层
  var targetLayer;
  try {
      targetLayer = doc.layers.getByName("裁切");
  } catch (e) {
      log(["未找到名為 '" + layerName + "' 的圖層。"]);
      return null;
  }
  // 在目标图层中查找指定名称的 pageItem
  try {
      var pageItems = targetLayer.pageItems;
      allPageItems = pageItems;
      var obj = new Object();
      for(i=0;i<pageItems.length;i++){
        obj[pageItems[i].name] = pageItems[i];
      }


      return obj;
  } catch (e) {
      log(["在圖層 '" + layerName + "' 中未找到名為 '" + itemName + "' 的 pageItem。"]);
      return null;
  }
}

function findPageItemInGroupFirst(item, itemName) {
    // 如果是群組，則遞歸檢查其子物件
    if (item.typename === "GroupItem") {
        var items = item.pageItems;
        for (var i = 0; i < items.length; i++) {
          if (items[i].name === itemName) {
              return items[i];
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


function showGui() {
    cutPieceGroups = getCutPieceGroups();

    // 創建對話框
    var dialog = new Window('dialog', '裁切底色選擇');

    // 獲取螢幕尺寸
    var screenWidth = Screen.width;
    //var screenHeight = Screen.height;
    // 設置對話框的邊界，讓其佔據螢幕的大部分
    //dialog.bounds = [0, 0, screenWidth * 0.9, screenHeight * 0.9];
    // 設置對話框的佈局屬性
    dialog.orientation = 'column';
    dialog.alignChildren = ['fill', 'top'];
    //dialog.maximumSize.width = 1024;

    // 創建主組件
    var mainGroup = dialog.add('group');
    mainGroup.orientation = 'row';
    mainGroup.alignChildren = ['fill', 'fill'];

    //裁切中的裁片內容
    var contentPanel = mainGroup.add('panel', undefined, '裁片名稱選擇');
    contentPanel.orientation = 'column';
    contentPanel.alignChildren = ['fill', 'fill'];


    // 添加按鈕組
    var buttonGroup = mainGroup.add('panel', undefined, '確定選擇裁片');
    buttonGroup.orientation = 'row';
    buttonGroup.alignment = ['center', 'bottom'];

    var okButton = buttonGroup.add('button', undefined, '確定', { name: 'ok' });
    var cancelButton = buttonGroup.add('button', undefined, '取消', { name: 'cancel' });
    var checkboxes = [];
    okButton.onClick = function() {
      //alert("okButton.onClick");
      for(var i=0;i<checkboxes.length;i++){
        if(checkboxes[i].value){
          selected.push(checkboxes[i].text);
          //alert(checkboxes[i].text);
        }
      }
      dialog.close();
    }

    cancelButton.onClick = function() {
      dialog.close();
    };

    // 用於存儲尺寸的 checkbox 參考
    for (var i = 0; i < allPageItems.length; i++) {
        var checkboxButton = contentPanel.add('checkbox', undefined, allPageItems[i].name);
        checkboxes.push(checkboxButton);
    }

    dialog.layout.layout(true);
    dialog.show();
}

//在showGui函數內的okButton.onClick 內將值存入
var selected = [];
showGui();
var doc = app.activeDocument;
for(var i=0;i<selected.length;i++){
  var cutPiece = getPageItemByNameInLayer(doc,"裁切",selected[i]);
  var item = findPageItemInGroupFirst(cutPiece,"底色");
  item.selected = true;

}
