(function () {

    if (app.documents.length === 0) {
        alert("目前沒有開啟文件");
        return;
    }

    var doc = app.activeDocument;

    if (doc.selection.length === 0) {
        alert("請先選取物件或文字，再執行腳本");
        return;
    }

    // === 使用者輸入直徑（mm） ===
    var diameterMM = prompt("請輸入圓的直徑（mm）：", "30");
    if (!diameterMM || isNaN(diameterMM)) {
        alert("輸入錯誤");
        return;
    }

    var mmToPt = 2.834645669;
    var diameterPT = parseFloat(diameterMM) * mmToPt;
    var radiusPT = diameterPT / 2;

    // === 取得選取物件的精準中心（支援文字、群組、任何物件）===
    var sel = doc.selection;

    var xMin = Infinity;
    var xMax = -Infinity;
    var yMax = -Infinity;
    var yMin = Infinity;

    for (var i = 0; i < sel.length; i++) {
        // geometricBounds = [y1, x1, y2, x2]
        // geometricBounds = [x1, y1, x2, y2]
        var b = sel[i].geometricBounds;

        if (b[0] < xMin) xMin = b[0];
        if (b[2] > xMax) xMax = b[2];
        if (b[1] > yMax) yMax = b[1];
        if (b[3] < yMin) yMin = b[3];
    }

    var centerX = (xMin + xMax) / 2;
    var centerY = (yMax + yMin) / 2;

    // === 建立圓形（放在選取物件中心）===
    // ellipse(top, left, width, height)
    var circle = doc.activeLayer.pathItems.ellipse(
        centerY + radiusPT, // top
        centerX - radiusPT, // left
        diameterPT,         // width
        diameterPT          // height
    );

    // === 設定 CMYK 顏色 ===

    // 白色填滿（CMYK = 0,0,0,0）
    var cmykWhite = new CMYKColor();
    cmykWhite.cyan = 0;
    cmykWhite.magenta = 0;
    cmykWhite.yellow = 0;
    cmykWhite.black = 0;

    // 黑色外框（CMYK = 0,0,0,100）
    var cmykBlack = new CMYKColor();
    cmykBlack.cyan = 0;
    cmykBlack.magenta = 0;
    cmykBlack.yellow = 0;
    cmykBlack.black = 100;

    circle.filled = true;
    circle.fillColor = cmykWhite;

    circle.stroked = true;
    circle.strokeWidth = 1;
    circle.strokeColor = cmykBlack;

    alert("圓形已使用 CMYK 顏色並精準置中到所選物件！");

})();
