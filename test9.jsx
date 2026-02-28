/**
 * 顯示選取物件的 可視邊界/幾何邊界 (mm)
 * bounds 順序： [x1, y1, x2, y2]
 * 轉換：1 pt = 0.352778 mm
 */
(function () {
    if (app.documents.length === 0) { alert("請先開啟文件"); return; }
    if (!app.selection || app.selection.length === 0) { alert("請先選取至少一個物件"); return; }

    var PT2MM = 0.352778;

    function boundsToMM_XY(b) {
        var x1 = b[0], y1 = b[1], x2 = b[2], y2 = b[3];
        var left   = Math.min(x1, x2);
        var right  = Math.max(x1, x2);
        var top    = Math.max(y1, y2);   // Y 向下遞增 → 上方數值較大
        var bottom = Math.min(y1, y2);
        return {
            left: left * PT2MM,
            right: right * PT2MM,
            top: top * PT2MM,
            bottom: bottom * PT2MM,
            width: (right - left) * PT2MM,
            height: (top - bottom) * PT2MM
        };
    }

    function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2); }

    var lines = [];
    for (var i = 0; i < app.selection.length; i++) {
        var it = app.selection[i];
        var gb = boundsToMM_XY(it.geometricBounds);
        var vb = boundsToMM_XY(it.visibleBounds);

        lines.push(
            "◆ 物件 #" + (i + 1) + (it.name ? ("（名稱：" + it.name + "）") : "") +
            "\n-- 幾何邊界 geometricBounds (mm) --" +
            "\n  left: " + fmt(gb.left) + " , top: " + fmt(gb.top) +
            "\n  right: " + fmt(gb.right) + " , bottom: " + fmt(gb.bottom) +
            "\n  寬×高: " + fmt(gb.width) + " × " + fmt(gb.height) +
            "\n-- 可視邊界 visibleBounds (mm) --" +
            "\n  left: " + fmt(vb.left) + " , top: " + fmt(vb.top) +
            "\n  right: " + fmt(vb.right) + " , bottom: " + fmt(vb.bottom) +
            "\n  寬×高: " + fmt(vb.width) + " × " + fmt(vb.height)
        );
    }

    alert(lines.join("\n\n"));
})();
