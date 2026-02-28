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

    var scaleMinInput = prompt("最小縮放百分比（%）", "60");
    if (scaleMinInput === null) {
        return;
    }
    var scaleMaxInput = prompt("最大縮放百分比（%）", "140");
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

    var targetLayer = doc.activeLayer;
    var generatedGroup = targetLayer.groupItems.add();
    generatedGroup.name = "隨機白色圖形_" + timeStamp();

    var whiteColor = createWhiteColor(doc);

    for (var n = 0; n < generateCount; n++) {
        var src = sourceItems[randomInt(0, sourceItems.length - 1)];
        var dup = src.duplicate(generatedGroup, ElementPlacement.PLACEATEND);

        var scale = randomRange(minScale, maxScale);
        dup.resize(scale, scale, true, true, true, true, scale, Transformation.CENTER);

        dup.rotate(randomRange(0, 360), true, true, true, true, Transformation.CENTER);

        recolorToWhite(dup, whiteColor);

        randomPlaceInBounds(dup, referenceBounds);
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

    function randomPlaceInBounds(item, areaBounds) {
        var b = item.visibleBounds;
        var w = b[2] - b[0];
        var h = b[1] - b[3];

        var areaW = areaBounds[2] - areaBounds[0];
        var areaH = areaBounds[1] - areaBounds[3];

        var left;
        var top;

        if (areaW <= w) {
            left = areaBounds[0];
        } else {
            left = areaBounds[0] + randomRange(0, areaW - w);
        }

        if (areaH <= h) {
            top = areaBounds[1];
        } else {
            top = areaBounds[1] - randomRange(0, areaH - h);
        }

        item.position = [left, top];
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
