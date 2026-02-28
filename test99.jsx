function getSelectedAnchorPoints() {
    var doc = app.activeDocument;
    var result = [];

    for (var i = 0; i < doc.pathItems.length; i++) {
        var path = doc.pathItems[i];

        if (path.selected) {
            for (var j = 0; j < path.pathPoints.length; j++) {
                var point = path.pathPoints[j];

                if (point.selected === PathPointSelection.ANCHORPOINT) {
                    var anchor = point.anchor; // [x, y]
                    result.push({
                        x: anchor[0],
                        y: anchor[1],
                        parent: path,
                        index: j
                    });
                }
            }
        }
    }

    return result;
}

function p2mm(n) {
  return n / 2.83464567;
}

// 示範使用
var selectedAnchors = getSelectedAnchorPoints();

if (selectedAnchors.length === 0) {
    alert("目前沒有選取任何錨點");
} else {
    var msg = "選取的錨點座標：\n";
    for (var i = 0; i < selectedAnchors.length; i++) {
        msg += "點 " + i + ": X=" + p2mm(selectedAnchors[i].x) + ", Y=" + p2mm(selectedAnchors[i].y) + "\n";
    }
    alert(msg);
}
