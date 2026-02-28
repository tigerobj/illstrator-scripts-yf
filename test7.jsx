/**
 * 顯示選取物件的高度（mm）
 * 作者：ChatGPT (台灣繁體版)
 */

 function p2mm(n) {
   return n / 2.83464567;
 }

(function () {
    if (app.documents.length === 0) {
        alert("請先開啟文件。");
        return;
    }

    if (!app.selection || app.selection.length === 0) {
        alert("請先選取一個物件。");
        return;
    }

    var sel = app.selection[0];

    // 取得可視邊界 (含線寬、特效)
    var bounds = sel.geometricBounds; // [y1, x1, y2, x2]
    var height_pt = Math.abs(bounds[1] - bounds[3]); // 高度（單位：pt）

    // // Illustrator 1 pt = 0.352778 mm
    // var height_mm = height_pt * 0.352778;
    var height_mm = p2mm(height_pt);

    alert("選取物件高度：約 " + height_mm.toFixed(5) + " mm");
})();
