(function () {
    if (app.documents.length === 0) {
        alert("請先開啟文件。");
        return;
    }

    var doc = app.activeDocument;
    if (!doc.selection || doc.selection.length === 0) {
        alert("請先選取至少一個紅色物件當作圖形來源。");
        return;
    }

    var sourceItems = [];
    for (var i = 0; i < doc.selection.length; i++) {
        if (isDrawableItem(doc.selection[i])) {
            sourceItems.push(doc.selection[i]);
        }
    }

    if (sourceItems.length === 0) {
        alert("選取內容沒有可複製的向量物件。\n請選取 Path / Group / Compound Path。");
        return;
    }

    var countInput = prompt("要隨機產生幾個白色物件？", "120");
    if (countInput === null) {
        return;
    }

    var generateCount = parseInt(countInput, 10);
    if (isNaN(generateCount) || generateCount <= 0) {
        alert("請輸入大於 0 的整數。\n例如：120");
        return;
    }

    var scaleMinInput = prompt("最小縮放百分比（%）", "85");
    if (scaleMinInput === null) {
        return;
    }
    var scaleMaxInput = prompt("最大縮放百分比（%）", "120");
    if (scaleMaxInput === null) {
        return;
    }

    var minScale = parseFloat(scaleMinInput);
    var maxScale = parseFloat(scaleMaxInput);

    if (isNaN(minScale) || isNaN(maxScale) || minScale <= 0 || maxScale <= 0 || minScale > maxScale) {
        alert("縮放範圍不正確。\n請確認最小值 <= 最大值，且都大於 0。");
        return;
    }

    var referenceBounds = unionBoundsOfItems(sourceItems);
    if (!referenceBounds) {
        alert("無法取得選取物件範圍。\n請確認選取的是可見向量物件。");
        return;
    }

    var spacingInput = prompt("排列間距倍率（建議 2.0 ~ 4.0，數字越大越分散）", "2.8");
    if (spacingInput === null) {
        return;
    }
    var spacingFactor = parseFloat(spacingInput);
    if (isNaN(spacingFactor) || spacingFactor < 1.2) {
        alert("排列間距倍率需 >= 1.2");
        return;
    }

    var jitterInput = prompt("排列抖動百分比（0~40，越小越整齊）", "12");
    if (jitterInput === null) {
        return;
    }
    var jitterPercent = parseFloat(jitterInput);
    if (isNaN(jitterPercent) || jitterPercent < 0 || jitterPercent > 40) {
        alert("排列抖動百分比需在 0~40 之間");
        return;
    }

    var targetLayer = doc.activeLayer;
    var generatedGroup = targetLayer.groupItems.add();
    generatedGroup.name = "隨機白色圖形_" + timeStamp();

    var whiteColor = createWhiteColor(doc);

    var layout = buildOrderedLayout(referenceBounds, generateCount, spacingFactor, jitterPercent);

    for (var n = 0; n < generateCount; n++) {
        var src = sourceItems[randomInt(0, sourceItems.length - 1)];
        var dup = src.duplicate(generatedGroup, ElementPlacement.PLACEATEND);

        var scale = randomRange(minScale, maxScale);
        dup.resize(scale, scale, true, true, true, true, scale, Transformation.CENTER);

        var angle = randomInt(0, 7) * 45 + randomRange(-8, 8);
        dup.rotate(angle, true, true, true, true, Transformation.CENTER);

        recolorToWhite(dup, whiteColor);

        placeAtCenter(dup, layout[n][0], layout[n][1]);
    }

    var pathList = [];
    collectPathItems(generatedGroup, pathList);

    if (pathList.length < 2) {
        alert("產生的白色路徑數量不足，無法建立複合路徑。\n請增加產生數量後再試一次。");
        return;
    }

    var compound = targetLayer.compoundPathItems.add();
    compound.name = generatedGroup.name + "_複合路徑";

    for (var p = pathList.length - 1; p >= 0; p--) {
        pathList[p].move(compound, ElementPlacement.PLACEATBEGINNING);
    }

    try {
        generatedGroup.remove();
    } catch (e) {
    }

    doc.selection = null;
    compound.selected = true;

    alert("完成：已隨機產生白色圖形，並建立複合路徑。\n數量：" + generateCount);

    function isDrawableItem(item) {
        var t = item.typename;
        return t === "PathItem" || t === "GroupItem" || t === "CompoundPathItem";
    }

    function createWhiteColor(documentRef) {
        if (documentRef.documentColorSpace === DocumentColorSpace.CMYK) {
            var cmyk = new CMYKColor();
            cmyk.cyan = 0;
            cmyk.magenta = 0;
            cmyk.yellow = 0;
            cmyk.black = 0;
            return cmyk;
        }

        var rgb = new RGBColor();
        rgb.red = 255;
        rgb.green = 255;
        rgb.blue = 255;
        return rgb;
    }

    function recolorToWhite(item, white) {
        if (item.typename === "PathItem") {
            if (!item.guides && !item.clipping) {
                item.filled = true;
                item.fillColor = white;
                item.stroked = false;
            }
            return;
        }

        if (item.typename === "CompoundPathItem") {
            for (var i = 0; i < item.pathItems.length; i++) {
                recolorToWhite(item.pathItems[i], white);
            }
            return;
        }

        if (item.typename === "GroupItem") {
            for (var j = 0; j < item.pageItems.length; j++) {
                recolorToWhite(item.pageItems[j], white);
            }
        }
    }

    function collectPathItems(item, output) {
        if (item.typename === "PathItem") {
            if (!item.guides && !item.clipping) {
                output.push(item);
            }
            return;
        }

        if (item.typename === "CompoundPathItem") {
            for (var i = 0; i < item.pathItems.length; i++) {
                collectPathItems(item.pathItems[i], output);
            }
            return;
        }

        if (item.typename === "GroupItem") {
            for (var j = 0; j < item.pageItems.length; j++) {
                collectPathItems(item.pageItems[j], output);
            }
        }
    }

    function unionBoundsOfItems(items) {
        var bounds = null;

        for (var i = 0; i < items.length; i++) {
            var b = items[i].visibleBounds;
            if (!b || b.length !== 4) {
                continue;
            }

            if (!bounds) {
                bounds = [b[0], b[1], b[2], b[3]];
            } else {
                bounds[0] = Math.min(bounds[0], b[0]);
                bounds[1] = Math.max(bounds[1], b[1]);
                bounds[2] = Math.max(bounds[2], b[2]);
                bounds[3] = Math.min(bounds[3], b[3]);
            }
        }

        return bounds;
    }

    function buildOrderedLayout(sourceBounds, count, spacingFactor, jitterPercent) {
        var cx = (sourceBounds[0] + sourceBounds[2]) / 2;
        var cy = (sourceBounds[1] + sourceBounds[3]) / 2;
        var sw = Math.max(1, sourceBounds[2] - sourceBounds[0]);
        var sh = Math.max(1, sourceBounds[1] - sourceBounds[3]);

        var cellW = sw * spacingFactor;
        var cellH = sh * spacingFactor;

        var cols = Math.ceil(Math.sqrt(count));
        var rows = Math.ceil(count / cols);

        var startX = cx - ((cols - 1) * cellW) / 2;
        var startY = cy + ((rows - 1) * cellH) / 2;

        var jitterX = cellW * (jitterPercent / 100);
        var jitterY = cellH * (jitterPercent / 100);

        var indices = [];
        for (var i = 0; i < rows * cols; i++) {
            indices.push(i);
        }
        shuffle(indices);

        var points = [];
        for (var n = 0; n < count; n++) {
            var idx = indices[n];
            var r = Math.floor(idx / cols);
            var c = idx % cols;
            var px = startX + c * cellW + randomRange(-jitterX, jitterX);
            var py = startY - r * cellH + randomRange(-jitterY, jitterY);
            points.push([px, py]);
        }
        return points;
    }

    function placeAtCenter(item, centerX, centerY) {
        var b = item.visibleBounds;
        var w = b[2] - b[0];
        var h = b[1] - b[3];
        item.position = [centerX - w / 2, centerY + h / 2];
    }

    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function randomInt(min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    function timeStamp() {
        var d = new Date();
        function pad(v) { return v < 10 ? "0" + v : "" + v; }
        return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "_" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    }
})();
