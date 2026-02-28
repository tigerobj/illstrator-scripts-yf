#include "json2.js";
#include "對齊置中.jsx";

/**
 * ===========================
 * 全域變數（所有函數可使用）
 * ===========================
 */
var doc = null;
var data = {}; // ← ⭐ 你要求變成全域變數
var item = null;


/**
 * 自訂字串 trim()
 */
String.prototype.trim = function () {
    return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
};


/**
 * 檢查旋轉 CSV
 */
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


/**
 * 讀 CSV → Obj
 */
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
 * 物件移動至中心
 */
function moveItemCenterTo(item, targetX, targetY) {
    var b = item.visibleBounds;
    var cx = (b[0] + b[2]) / 2;
    var cy = (b[1] + b[3]) / 2;

    var dx = targetX - cx;
    var dy = targetY - cy;

    item.translate(dx, dy);
}


/**
 * 依據物件內「邊界」計算中心
 */
function moveItemCenterToForBound(item, targetX, targetY) {

    var itemBound = findPageItemInGroupFirst(item, "邊界");
    if (!itemBound) {
        alert("找不到邊界");
        return;
    }

    var b = itemBound.visibleBounds;
    var cx = (b[0] + b[2]) / 2;
    var cy = (b[1] + b[3]) / 2;

    var dx = targetX - cx;
    var dy = targetY - cy;

    item.translate(dx, dy);
}


/**
 * 依 CSV 名稱移動中心
 */
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


/**
 * 移到後片套圖 → 邊界下、底色上
 */
function moveToBackPanelArea(item, parentGroup, borderItem) {

    item.move(parentGroup, ElementPlacement.PLACEATEND);
    item.move(borderItem, ElementPlacement.PLACEAFTER);
}


/**
 * 自動依名稱做中心移動並放進正確群組
 */
function autoCenterMoveByName(item, name) {

    // 中心移動
    moveItemCenterToByName(item, name + "中心位置", false);

    // 找目標群組與邊界
    var parentGroup = getGroupByLevel("圖層 5", name);
    var borderItem = getPathItemByTwoLevel("圖層 5", name, "邊界");

    if (!parentGroup || !borderItem) {
        alert("找不到：「" + name + "」的群組或邊界");
        return;
    }

    moveToBackPanelArea(item, parentGroup, borderItem);
}


/**
 * ======================================
 * main：主流程（最乾淨、最正統結構）
 * ======================================
 */
function main() {

    // 開啟文件
    if (app.documents.length === 0) {
        alert("請先開啟文件");
        return;
    }
    doc = app.activeDocument;

    // 必須選一個物件
    if (doc.selection.length !== 1) {
        alert("請選取一個群組或物件");
        return;
    }

    item = doc.selection[0];

    // 載入 CSV → 存入全域 data
    var file = checkForDataCsv();
    if (!file) return;

    data = readCsvToObj(file);  // ⭐ 全域 data

    // 複製 4 份
    // 執行前片套圖流程
		var itemA = item.duplicate();
    autoCenterMoveByName(itemA, "前片套圖");

		// 執行後片套圖流程
		var itemB = item.duplicate();
		//後片作水平鏡射
		matrix = app.getScaleMatrix(-100, 100); // 水平鏡射
		itemB.transform(matrix, true, true, true, true, undefined); // 鏡射
		autoCenterMoveByName(itemB, "後片套圖");

		// 執行左袖套圖流程
		var itemC = item.duplicate();
		autoCenterMoveByName(itemC, "左袖套圖");

		// 執行右袖套圖流程
		var itemD = item.duplicate();
		autoCenterMoveByName(itemD, "右袖套圖");


}


/**
 * ---- 程式入口 ----
 */
try {
    main();
} catch (e) {
    alert("發生錯誤：\n" + e);
}
