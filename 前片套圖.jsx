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
    var logFile = File(filePath + "/log_20250326.txt");
		logFile.encoding = "utf8";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close(); //作測試修改222
}

// 函式：指定左上點座標、寬度、高度繪製矩形
function drawRectangle(topLeftX, topLeftY, width, height){
    // 建立矩形
    var rect = doc.pathItems.rectangle(topLeftY, topLeftX, width, height);

    // 設定矩形邊框顏色為黑色
    rect.stroked = true;
    rect.strokeWidth = 1; // 邊框寬度為1pt
    rect.strokeColor = new CMYKColor();
    rect.strokeColor.black = 100;

    // 設定矩形內無填色
    rect.filled = true;

    return rect;
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

var doc = app.activeDocument;

// 指定圖層與群組名稱（可調整）
var targetLayerName = "裁切";
var targetGroupName = "前片";

// 確認已選取一個群組
if (doc.selection.length === 1 && doc.selection[0].typename === "GroupItem" && doc.selection[0].clipped) {
    var selectedGroup = doc.selection[0];

    // 取得指定圖層
    var targetLayer;
    try {
        targetLayer = doc.layers.getByName(targetLayerName);
    } catch(e) {
        alert("找不到指定圖層：" + targetLayerName);
    }

    // 尋找目標圖層內名稱為 A 的群組
    var groupA = null;
    for (var i = 0; i < targetLayer.groupItems.length; i++) {
        if (targetLayer.groupItems[i].name === targetGroupName) {
            groupA = targetLayer.groupItems[i];
            break;
        }
    }

    if (groupA === null) {
        alert("在圖層「" + targetLayerName + "」找不到群組「" + targetGroupName + "」！");
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

    // 取得邊界資訊
    var selectedBounds = getBounds(selectedGroup.pageItems[0]);
    var boundsA = getBounds(groupA); // groupA.pageItems[0] 遮罩內的形狀

    // 計算所需的縮放比例 (以寬度為基準)
    var scaleFactor = boundsA.width / selectedBounds.width;

    // 使用 transform() 手動縮放（避免 resize 無效）
    var scaleMatrix = app.getScaleMatrix(scaleFactor * 100, scaleFactor * 100);
    selectedGroup.transform(
        scaleMatrix,
        true,   // 改變物件
        true,   // 改變圖案
        false,   // 改變漸層
        false,   // 改變筆畫
        scaleFactor * 100,
        Transformation.CENTER
    );

    // 縮放後重新取得邊界資訊
    selectedBounds = getBounds(selectedGroup);

    // 計算群組位移量（向上邊界對齊、水平置中對齊）
    var deltaX = boundsA.centerX - selectedBounds.centerX;  // 水平置中
    var deltaY = boundsA.top - selectedBounds.top;          // 向上對齊

    // 執行位移
    selectedGroup.translate(deltaX, deltaY);

    //targetGroupName
    var maskShape = selectedGroup.pageItems[0];

    targetPageItem = findPageItemInGroup(groupA, "底色")

    maskShape_new = targetPageItem.duplicate();
    maskShape_new.move(selectedGroup, ElementPlacement.PLACEATBEGINNING);
    maskShape.remove();

    selectedGroup.clipped = true;

    selectedGroup.move(targetPageItem, ElementPlacement.PLACEBEFORE);

    alert("已成功將群組（含裁剪遮色片）確實縮放至與「A群組」相同寬度，並向上對齊！");

} else {
    alert("請先選取一個群組物件！");
}
