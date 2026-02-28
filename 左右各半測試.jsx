function splitSleeveInSeamLayer(sleeveName) {
    var doc = app.activeDocument;
    var seamLayer;
    try {
        seamLayer = doc.layers.getByName("縫份");
    } catch (e) {
        alert("找不到圖層「縫份」");
        return;
    }

    var original;
    try {
        original = seamLayer.pageItems.getByName(sleeveName);
    } catch (e) {
        alert("在圖層「縫份」中找不到路徑：" + sleeveName);
        return;
    }
    if (original.typename !== "PathItem") {
        alert(sleeveName + " 不是 PathItem！");
        return;
    }

    var vb = original.visibleBounds; // [left, top, right, bottom]
    var left   = vb[0],
        top    = vb[1],
        right  = vb[2],
        bottom = vb[3];
    var width   = right - left,
        height  = top - bottom,
        centerX = left + width / 2;

    var leftGroupName, rightGroupName;
    if (sleeveName === "左袖") {
        leftGroupName  = "左袖_前";
        rightGroupName = "左袖_後";
    } else if (sleeveName === "右袖") {
        leftGroupName  = "右袖_後";
        rightGroupName = "右袖_前";
    } else {
        alert("僅支援「左袖」或「右袖」！");
        return;
    }

    function getOrCreateGroup(layer, name) {
        try {
            return layer.groupItems.getByName(name);
        } catch (e) {
            var g = layer.groupItems.add();
            g.name = name;
            return g;
        }
    }
    var leftGroup  = getOrCreateGroup(seamLayer, leftGroupName);
    var rightGroup = getOrCreateGroup(seamLayer, rightGroupName);

    //original.hidden = false;

    function makeHalf(group, x, w) {
        original.duplicate(group, ElementPlacement.PLACEATBEGINNING);
        var mask = group.pathItems.rectangle(
            top, // y
            x,   // x
            w,   // width
            height
        );
        mask.stroked  = false;
        mask.filled   = true;
        mask.clipping = true;
        group.clipped = true;
    }

    makeHalf(leftGroup, left,        centerX - left);
    makeHalf(rightGroup, centerX,    right - centerX);

    // 改用 for 迴圈代替 forEach
    var groups = [leftGroup, rightGroup];
    for (var i = 0; i < groups.length; i++) {
        var grp = groups[i];
        var ln = grp.pathItems.add();
        ln.setEntirePath([[centerX, top], [centerX, bottom]]);
        ln.stroked     = true;
        ln.strokeWidth = 0.5;
        var c = new CMYKColor(); c.black = 100;
        ln.strokeColor = c;
        ln.filled      = false;
        ln.name        = "中線";
    }

    alert("已在圖層「縫份」中，將「" + sleeveName + "」分割並放入「前／後」群組！");
}

// 執行範例
splitSleeveInSeamLayer("左袖");
splitSleeveInSeamLayer("右袖");
