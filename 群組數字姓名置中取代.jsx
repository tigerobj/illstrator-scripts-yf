/**
 * 依選取的物件高度，等比例縮放「指定名稱」的物件
 * 修正版：避免 PageItem 未定義錯誤
 */

(function () {
    if (app.documents.length === 0) {
        alert("請先開啟一個文件。");
        return;
    }

    var doc = app.activeDocument;

    // 檢查是否只選取一個物件
    if (!app.selection || app.selection.length !== 1) {
        alert("請先『只選取一個』物件作為參考高度。");
        return;
    }

    var refItem = app.selection[0];

    // 檢查是不是圖形物件（排除圖層、群組等）
    if (!refItem.typename || refItem.typename === "TextRange") {
        alert("選取的不是有效的圖形物件。");
        return;
    }

    // 使用者輸入目標名稱
    var targetName = prompt("請輸入要搜尋的物件名稱（完全符合）：", "");
    if (!targetName) return;

    // 取得物件高度
    function getItemHeight(it) {
        var vb = it.geometricBounds; // [y1, x1, y2, x2]
        return Math.abs(vb[1] - vb[3]);
    }

    // 搜尋名稱完全相符的物件
    function findItemsByName(name) {
        var results = [];
        var all = doc.pageItems;
        for (var i = 0; i < all.length; i++) {
            var it = all[i];
            if (it.locked || it.hidden) continue;
            try {
                if (it.name === name) results.push(it);
            } catch (e) {}
        }
        return results;
    }

    // 執行等比例縮放
    function scaleItemToHeight(it, targetHeight) {
        var h = getItemHeight(it);
        if (h <= 0) return false;
        var scalePercent = (targetHeight / h) * 100;

        it.resize(
            scalePercent,
            scalePercent,
            true,  // changePositions
            true,  // changeFillPatterns
            true,  // changeFillGradients
            true,  // changeStrokePattern
            scalePercent,  // scaleLineWidths
            Transformation.CENTER
        );
        return true;
    }

    var refH = getItemHeight(refItem);
    if (refH <= 0) {
        alert("參考物件的高度為 0，請換另一個。");
        return;
    }

    var targets = findItemsByName(targetName);
    if (targets.length === 0) {
        alert("找不到名稱為「" + targetName + "」的物件。");
        return;
    }

    var done = 0;
    for (var i = 0; i < targets.length; i++) {
        try {
            if (scaleItemToHeight(targets[i], refH)) done++;
        } catch (e) {}
    }
    //alert("完成縮放 " + done + " 個物件。");

    // --- 共用工具 ---
    function getCenter(it) {
        var b = it.geometricBounds;
        var cx = (b[0] + b[2]) / 2.0; // (left + right)/2
        var cy = (b[1] + b[3]) / 2.0; // (top + bottom)/2
        return { x: cx, y: cy };
    }
    function findItemsByName(name) {
        var out = [], all = doc.pageItems;
        for (var i = 0; i < all.length; i++) {
            var it = all[i];
            if (it.locked || it.hidden) continue;
            try { if (it.name === name) out.push(it); } catch (e) {}
        }
        return out;
    }

    // --- 主流程：把每個 targetName 置中到 refItem ---
    var refC = getCenter(refItem);
    var targets = findItemsByName(targetName);

    if (targets.length === 0) {
        alert("找不到名稱為「" + targetName + "」的物件。");
        return;
    }

    var moved = 0, skipped = 0;
    for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        try {
            var c = getCenter(t);
            var dx = refC.x - c.x;
            var dy = refC.y - c.y;
            // 直接以文件座標移動到同中心
            t.translate(dx, dy);

            // ★ 新增這兩行 ↓↓↓
            t.move(refItem, ElementPlacement.PLACEAFTER);
            t.name = refItem.name;
            // ★ 新增這兩行 ↑↑↑

            moved++;
        } catch (e) {
            skipped++;
        }
    }

    refItem.remove();

    //alert("置中完成：" + moved + " 個；略過：" + skipped + " 個。\n量測依據： 幾何邊界");


})();
