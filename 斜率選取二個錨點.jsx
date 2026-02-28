function getSelectedAnchor() {
    var doc = app.activeDocument;
    var sel = doc.selection;

    if (sel.length !== 1 || sel[0].typename !== "PathItem") {
        alert("請選取一個 PathItem");
        return null;
    }

    var item = sel[0];
    var points = item.pathPoints;

    var selectedPoints = [];

    for (var i = 0; i < points.length; i++) {
        if (points[i].selected === PathPointSelection.ANCHORPOINT) {
            selectedPoints.push(points[i]);
        }
    }

    if (selectedPoints.length !== 1) {
        alert("請選取路徑上的一個錨點,超過一個錨點請重新選擇");
        return null;
    }

    var pt1 = selectedPoints[0].anchor;
    var dx = pt1[0];
    var dy = pt1[1];

    return pt1;
}

function getSelectedAnchorSlope() {
    var doc = app.activeDocument;
    var sel = doc.selection;

    if (sel.length !== 1 || sel[0].typename !== "PathItem") {
        alert("請選取一個 PathItem");
        return null;
    }

    var item = sel[0];
    var points = item.pathPoints;

    var selectedPoints = [];

    for (var i = 0; i < points.length; i++) {
        if (points[i].selected === PathPointSelection.ANCHORPOINT) {
            selectedPoints.push(points[i]);
        }
    }

    if (selectedPoints.length !== 2) {
        alert("請選取路徑上的兩個錨點");
        return null;
    }

    var pt1 = selectedPoints[0].anchor;
    var pt2 = selectedPoints[1].anchor;

    var dx = pt2[0] - pt1[0];
    var dy = pt2[1] - pt1[1];

    if (dx === 0) {
        return null; // 垂直線，斜率無限大
    }

    var slope = dy / dx;
    return slope;
}

function rotateFrom90ToSlope(targetSlope, targetItem) {
    if (!targetItem) {
        var sel = app.activeDocument.selection;
        if (sel.length !== 1 || sel[0].typename !== "PathItem") {
            alert("請選取一個 PathItem");
            return;
        }
        targetItem = sel[0];
    }

    var originalAngle = -90; // 預設是從垂直最上點開始
    var targetAngle = Math.atan(targetSlope) * 180 / Math.PI;
    var rotateBy = targetAngle - originalAngle;

    // 取得物件中心點作為旋轉中心
    var bounds = targetItem.visibleBounds;
    var centerX = (bounds[0] + bounds[2]) / 2;
    var centerY = (bounds[1] + bounds[3]) / 2;

    targetItem.rotate(
        rotateBy,
        true,  // 對物件有效
        true,  // 對圖樣有效
        true,  // 對漸層有效
        true,  // 對筆畫有效
        Transformation.CENTER,
        [centerX, centerY]
    );

    alert("已旋轉 " + rotateBy.toFixed(2) + "°，斜率為 " + targetSlope.toFixed(4));
}


var slope = getSelectedAnchorSlope();

if (slope === null) {
    alert("選取的兩點形成垂直線，斜率為 ∞");
} else {
    alert("兩錨點的斜率為：" + slope.toFixed(4));
}

// rotateFrom90ToSlope(-0.3001);
