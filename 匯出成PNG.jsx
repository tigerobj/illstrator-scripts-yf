/**
 * 匯出「目前選取」為 PNG（用臨時新文件，不動原檔）
 * - 只輸出選取的可見範圍（先用 visibleBounds，抓不到就用 geometricBounds 後備）
 * - 路徑：原檔同資料夾；檔名：原檔名 + _SEL.png
 * @param {Number} ppi PNG 解析度（預設 150）
 * @returns {File|null} 成功回傳輸出檔案，否則回 null
 */
function exportSelectionToPNG_NewDoc(ppi) {
    // ---- 基本檢查 ----
    if (app.documents.length === 0) { alert("請先開啟文件"); return null; }
    var src = app.activeDocument;

    if (!src.selection || src.selection.length === 0) {
        alert("請先選取要匯出的物件/群組");
        return null;
    }
    if (!src.saved || !src.fullName) {
        alert("請先把原始文件存檔，才能決定輸出位置");
        return null;
    }

    ppi = (typeof ppi === "number" && ppi > 0) ? ppi : 150;

    // ---- 正規化選取：把 TextRange 轉成對應的 TextFrame / PageItem ----
    var sel = normalizeSelectionToPageItems(src.selection);
    if (sel.length === 0) { alert("選取的項目無法處理（可能是無法複製的型別）"); return null; }

    // ---- 算合併邊界（先 visibleBounds，沒有就 geometricBounds）----
    var vb = getItemsBoundsWithFallback(sel); // [L,T,R,B] or null
    if (!vb) { alert("無法取得選取範圍（可能物件為不可見、被隱藏/鎖定，或無邊界）"); return null; }

    var W = vb[2] - vb[0];
    var H = vb[1] - vb[3];
    if (W <= 0 || H <= 0) { alert("選取範圍寬高為 0，無法匯出"); return null; }

    // ---- 建臨時文件（只 1 個畫板；不要傳 layout 列舉，避免 1320）----
    var tmp = app.documents.add(src.documentColorSpace, W, H, 1);
    tmp.artboards[0].artboardRect = [0, H, W, 0]; // 左、上、右、下

    // ---- 複製到臨時文件並對齊 ----
    app.executeMenuCommand("deselectall"); // 避免帶狀態
    var copies = [];
    for (var i = 0; i < sel.length; i++) {
        try {
            copies.push(sel[i].duplicate(tmp, ElementPlacement.PLACEATEND));
        } catch (e) { /* 有些型別無法複製就略過 */ }
    }
    if (copies.length === 0) {
        safeCloseNoSave(tmp);
        alert("沒有可複製的物件，匯出中止");
        return null;
    }

    // 在新檔取邊界，再把內容移到畫板左上 (0, H)
    var nb = getItemsBoundsWithFallback(copies);
    if (!nb) {
        safeCloseNoSave(tmp);
        alert("複製後無法取得邊界，匯出中止");
        return null;
    }
    var dx = -nb[0];
    var dy = H - nb[1];
    for (var j = 0; j < copies.length; j++) {
        try { copies[j].translate(dx, dy); } catch (e2) {}
    }

    // ---- 輸出 PNG ----
    var baseName = src.name.replace(/\.[^.]+$/i, "");
    var outFile = new File(src.fullName.parent.fsName + "/" + baseName + "_SEL.png");

    var opt = new ExportOptionsPNG24();
    opt.transparency = true;
    opt.antiAliasing = true;
    opt.artBoardClipping = true; // 只輸出畫板範圍
    var scalePercent = (ppi / 72) * 100;
    opt.horizontalScale = scalePercent;
    opt.verticalScale   = scalePercent;

    tmp.exportFile(outFile, ExportType.PNG24, opt);
    safeCloseNoSave(tmp);

    alert("已匯出 PNG：\n" + outFile.fsName);
    return outFile;
}

/**
 * 把 selection 正規化為可處理的 PageItem 陣列
 * - 若是 TextRange：往上找到擁有 bounds 的容器（通常是 TextFrame）
 * - 其他型別：若本身有 bounds 就沿用
 */
function normalizeSelectionToPageItems(selection) {
    var list = [];
    for (var i = 0; i < selection.length; i++) {
        var it = selection[i];
        if (!it) continue;

        // 1) 若是 TextRange，往上爬到有 bounds 的物件
        if (it.typename === "TextRange") {
            var p = it.parent;
            var found = findAncestorWithBounds(p);
            if (found) list.push(found);
            continue;
        }

        // 2) 一般物件，自己就有 bounds
        var withBounds = findAncestorWithBounds(it);
        if (withBounds) list.push(withBounds);
    }
    // 去重：有時同一個 TextFrame 會被加入多次
    return uniqueByUID(list);
}

/** 往上尋找具有 visibleBounds 或 geometricBounds 的祖先（含自身） */
function findAncestorWithBounds(node) {
    var cur = node;
    while (cur) {
        try {
            if (typeof cur.visibleBounds !== "undefined" || typeof cur.geometricBounds !== "undefined") {
                return cur;
            }
        } catch (e) {}
        if (!cur.parent || cur.parent === cur) break;
        cur = cur.parent;
    }
    return null;
}

/** 合併邊界：先試 visibleBounds，失敗就用 geometricBounds；全失敗回 null */
function getItemsBoundsWithFallback(items) {
    var L =  Infinity, T = -Infinity, R = -Infinity, B =  Infinity;
    var had = false;

    for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it) continue;

        var b = null;
        // 先 visibleBounds
        try { if (typeof it.visibleBounds !== "undefined") b = it.visibleBounds; } catch (e1) {}
        // 後備 geometricBounds
        if (!b) { try { if (typeof it.geometricBounds !== "undefined") b = it.geometricBounds; } catch (e2) {} }
        if (!b) continue;

        if (b[0] < L) L = b[0];
        if (b[1] > T) T = b[1];
        if (b[2] > R) R = b[2];
        if (b[3] < B) B = b[3];
        had = true;
    }
    return had ? [L, T, R, B] : null;
}

/** 關閉文件（不存），安全包一層 try */
function safeCloseNoSave(doc) {
    try { doc.close(SaveOptions.DONOTSAVECHANGES); } catch (e) {}
}

/** 以唯一識別移除重複（若無 id，退而比物件參照） */
function uniqueByUID(arr) {
    var seen = {};
    var out = [];
    for (var i = 0; i < arr.length; i++) {
        var k = getUID(arr[i]);
        if (seen[k]) continue;
        seen[k] = true;
        out.push(arr[i]);
    }
    return out;
}
function getUID(obj) {
    try {
        if (typeof obj.uuid !== "undefined") return String(obj.uuid);
        if (typeof obj.id !== "undefined") return "id:" + obj.id;
    } catch (e) {}
    // 最後手段：物件轉字串（較不保險，但可避免重複 push 指到同一引用）
    return String(obj);
}

// ---- 直接呼叫（150ppi）----
(function(){
    exportSelectionToPNG_NewDoc(150);
})();
