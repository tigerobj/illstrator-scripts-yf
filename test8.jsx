/**
 * 以目前選取的物件(refItem)為基準，
 * 將名稱為 targetName 的物件上下左右置中到 refItem 的中心
 * 來源：在現有縮放腳本上修改而成（改為對中心）
 */

(function () {
    if (app.documents.length === 0) { alert("請先開啟一個文件。"); return; }

    var doc = app.activeDocument;

    // 需要選取 1 個參考物件
    if (!app.selection || app.selection.length !== 1) {
        alert("請先『只選取一個』物件作為參考位置。");
        return;
    }
    var refItem = app.selection[0];

    // 讓你選擇用可視邊界(含線寬/外觀)或幾何邊界
    var useVisibleBounds = true; // 想改幾何邊界就設為 false

    // 目標名稱
    var targetName = prompt("請輸入要置中的物件名稱（完全符合）：", "");
    if (!targetName) return;

    // --- 共用工具 ---
    function getBounds(it) {
        return useVisibleBounds ? it.visibleBounds : it.geometricBounds; // [y1, x1, y2, x2]
    }
    function getCenter(it) {
        var b = getBounds(it);
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
            moved++;
        } catch (e) {
            skipped++;
        }
    }

    alert("置中完成：" + moved + " 個；略過：" + skipped + " 個。\n量測依據：" + (useVisibleBounds ? "可視邊界(含線寬/外觀)" : "幾何邊界"));
})();
