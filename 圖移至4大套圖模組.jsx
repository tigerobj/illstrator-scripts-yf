#include "json2.js";
#include "對齊置中.jsx";

/**
 * ===========================
 * 全域變數
 * ===========================
 */
var doc = null;
var data = {};
var item = null;

/** trim */
String.prototype.trim = function () {
    return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
};

/** 取得旋轉 CSV */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (!pathEnv) {
        alert("請設定 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    var file = new File(pathEnv + "/旋轉-釣魚衣.csv");
    if (!file.exists) {
        alert("找不到：" + file.fsName);
        return null;
    }
    return file;
}

/** 讀 CSV → Obj */
function readCsvToObj(csvFile) {
    csvFile.open('r');
    var obj = {};
    var s;
    while (s = csvFile.readln()) {
        var kv = s.split(';');
        if (kv.length === 1) kv = s.split(',');

        if (kv.length < 2) continue;
        obj[kv[0]] = kv[1];
    }
    csvFile.close();
    return obj;
}


/**
 * 判斷是否為剪裁群組，若是則回傳遮罩物件
 *
 * @param {PageItem} item
 * @returns {PathItem|CompoundPathItem|null}
 */
function getClippingMaskFromGroup(item) {

    // 必須是群組
    if (!item || item.typename !== "GroupItem") {
        return null;
    }

    // 必須是剪裁群組
    if (!item.clipped) {
        return null;
    }

    // 在群組內找 clipping = true 的物件
    for (var i = 0; i < item.pageItems.length; i++) {
        var child = item.pageItems[i];

        if (child.clipping === true) {
            return child; // 這就是遮罩物件
        }
    }

    return null;
}


/** 移中心：可用邊界或整體 */
function moveItemCenterTo(item, targetX, targetY) {
    var b = item.visibleBounds;
    for (var i = 0; i < item.pageItems.length; i++) {
      clippingItem = getClippingMaskFromGroup(item.pageItems[i]);
      if(clippingItem){
        b = clippingItem.visibleBounds;
      }
    }
    var cx = (b[0] + b[2]) / 2;
    var cy = (b[1] + b[3]) / 2;
    item.translate(targetX - cx, targetY - cy);
}

/** 用邊界移中心 */
function moveItemCenterToForBound(item, targetX, targetY) {
    var itemBound = findPageItemInGroupFirst(item, "邊界");
    if (!itemBound) {
        alert("找不到邊界");
        return;
    }

    var b = itemBound.visibleBounds;
    var cx = (b[0] + b[2]) / 2;
    var cy = (b[1] + b[3]) / 2;
    item.translate(targetX - cx, targetY - cy);
}

/** CSV 名稱移動 */
function moveItemCenterToByName(item, positionName, isBound) {
    if (!data[positionName]) {
        alert("CSV 找不到座標：" + positionName);
        return;
    }
    var parts = data[positionName].split(",");
    var x = parseFloat(parts[0]);
    var y = parseFloat(parts[1]);
    if (isBound) moveItemCenterToForBound(item, x, y);
    else moveItemCenterTo(item, x, y);
}

/** 放到目標群組範圍 */
function moveToBackPanelArea(item, parentGroup, borderItem) {
    item.move(parentGroup, ElementPlacement.PLACEATEND);
    item.move(borderItem, ElementPlacement.PLACEAFTER);
}

/** 自動中心移動 + 放進對應群組 */
function autoCenterMoveByName(item, name) {
    moveItemCenterToByName(item, name + "中心位置", false);

    var parentGroup = getGroupByLevel("圖層 5", name);
    var borderItem = getPathItemByTwoLevel("圖層 5", name, "邊界");

    if (!parentGroup || !borderItem) {
        alert("找不到：「" + name + "」群組或邊界");
        return;
    }
    moveToBackPanelArea(item, parentGroup, borderItem);
}

/* -------------------------
   單一套圖動作模組 (給 GUI 用)
--------------------------*/

/** 前片 */
function doFront() {
    var obj = item.duplicate();
    autoCenterMoveByName(obj, "前片套圖");
}

/** 後片 */
function doBack() {
    var obj = item.duplicate();
    var matrix = app.getScaleMatrix(-100, 100); // 水平鏡射
    obj.transform(matrix, true, true, true, true, undefined);
    autoCenterMoveByName(obj, "後片套圖");
}

/** 左袖 */
function doLeftSleeve() {
    var obj = item.duplicate();
    autoCenterMoveByName(obj, "左袖套圖");
}

/** 右袖 */
function doRightSleeve() {
    var obj = item.duplicate();
    autoCenterMoveByName(obj, "右袖套圖");
}

/** 全部套圖 */
function doAll() {
    doFront();
    doBack();
    doLeftSleeve();
    doRightSleeve();
    item.remove();
}

/* -------------------------
   GUI 介面
--------------------------*/
function buildGUI() {
    var win = new Window("dialog", "釣魚衣套圖工具");

    win.orientation = "column";
    win.alignChildren = "fill";

    win.add("statictext", undefined, "請選取一個要套圖的群組");

    var btnAll = win.add("button", undefined, "全部套圖");
    var btnF = win.add("button", undefined, "前片套圖");
    var btnB = win.add("button", undefined, "後片套圖");
    var btnL = win.add("button", undefined, "左袖套圖");
    var btnR = win.add("button", undefined, "右袖套圖");
    var btnCancel = win.add("button", undefined, "取消", { name: "cancel" });

    btnAll.onClick = function () { doAll(); win.close(); };
    btnF.onClick   = function () { doFront(); win.close(); };
    btnB.onClick   = function () { doBack(); win.close(); };
    btnL.onClick   = function () { doLeftSleeve(); win.close(); };
    btnR.onClick   = function () { doRightSleeve(); win.close(); };

    win.show();
}

/* -------------------------
   程式主入口
--------------------------*/
function main() {
    if (app.documents.length === 0) {
        alert("請先開啟文件");
        return;
    }
    doc = app.activeDocument;

    if (doc.selection.length !== 1) {
        alert("請選取一個群組");
        return;
    }
    item = doc.selection[0];

    var file = checkForDataCsv();
    if (!file) return;

    data = readCsvToObj(file);

    buildGUI();
}

try {
    main();
} catch (e) {
    alert("發生錯誤：\n" + e);
}
