// function getAngleBisectorIntersection(B, A, C) {
//     function normalize(v) {
//         var len = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
//         return [v[0]/len, v[1]/len];
//     }
//
//     function add(v1, v2) {
//         return [v1[0] + v2[0], v1[1] + v2[1]];
//     }
//
//     function intersectLines(p1, d1, p2, d2) {
//         var x1 = p1[0], y1 = p1[1];
//         var dx1 = d1[0], dy1 = d1[1];
//         var x2 = p2[0], y2 = p2[1];
//         var dx2 = d2[0], dy2 = d2[1];
//
//         var det = dx1 * dy2 - dy1 * dx2;
//         if (Math.abs(det) < 0.00001) return null;
//
//         var t = ((x2 - x1) * dy2 - (y2 - y1) * dx2) / det;
//         return [x1 + dx1 * t, y1 + dy1 * t];
//     }
//
//     var BA = normalize([B[0] - A[0], B[1] - A[1]]);
//     var CA = normalize([C[0] - A[0], C[1] - A[1]]);
//     var bisectorDir = normalize(add(BA, CA));
//     var BCdir = [C[0] - B[0], C[1] - B[1]];
//
//     return intersectLines(A, bisectorDir, B, BCdir);
// }
//
// // 主程式
// var doc = app.activeDocument;
// var selectedItem = doc.selection[0];
//
// if (!selectedItem || selectedItem.typename !== "PathItem") {
//     alert("請選取一個路徑 PathItem");
// } else {
//     var points = selectedItem.pathPoints;
//     var A_index = -1;
//
//     // 找出被選取的錨點 A 的 index
//     for (var i = 0; i < points.length; i++) {
//         if (points[i].selected === PathPointSelection.ANCHORPOINT) {
//             A_index = i;
//             break;
//         }
//     }
//
//     if (A_index === -1) {
//         alert("請選取一個錨點！");
//     } else if (A_index === 0 || A_index === points.length - 1) {
//         alert("A點位於邊界，無法取得 B 或 C 點！");
//     } else {
//         var B = points[A_index - 1].anchor;
//         var A = points[A_index].anchor;
//         var C = points[A_index + 1].anchor;
//
//         var intersection = getAngleBisectorIntersection(B, A, C);
//
//         if (intersection) {
//             // 畫一個小圓點標示交點
//             var dot = doc.pathItems.ellipse(
//                 intersection[1] + 0.1,
//                 intersection[0] - 0.1,
//                 0.2, 0.2
//             );
//             dot.filled = true;
//             dot.stroked = false;
//
//             var cmyk = new CMYKColor();
//             cmyk.black = 100;
//             dot.fillColor = cmyk;
//
//             alert("交點座標：\nX: " + intersection[0].toFixed(2) + "\nY: " + intersection[1].toFixed(2));
//         } else {
//             alert("角平分線與 BC 無交點（可能平行）");
//         }
//     }
// }


function getAngleBisectorIntersection(B, A, C) {
    function normalize(v) {
        var len = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
        return [v[0]/len, v[1]/len];
    }

    function add(v1, v2) {
        return [v1[0] + v2[0], v1[1] + v2[1]];
    }

    function intersectLines(p1, d1, p2, d2) {
        var x1 = p1[0], y1 = p1[1];
        var dx1 = d1[0], dy1 = d1[1];
        var x2 = p2[0], y2 = p2[1];
        var dx2 = d2[0], dy2 = d2[1];

        var det = dx1 * dy2 - dy1 * dx2;
        if (Math.abs(det) < 0.00001) return null;

        var t = ((x2 - x1) * dy2 - (y2 - y1) * dx2) / det;
        return [x1 + dx1 * t, y1 + dy1 * t];
    }

    var BA = normalize([B[0] - A[0], B[1] - A[1]]);
    var CA = normalize([C[0] - A[0], C[1] - A[1]]);
    var bisectorDir = normalize(add(BA, CA));
    var BCdir = [C[0] - B[0], C[1] - B[1]];

    return intersectLines(A, bisectorDir, B, BCdir);
}

// 主程式
var doc = app.activeDocument;
var selectedItem = doc.selection[0];

if (!selectedItem || selectedItem.typename !== "PathItem") {
    alert("請選取一個路徑 PathItem");
} else {
    var points = selectedItem.pathPoints;
    var A_index = -1;

    // 找出選取的錨點 A
    for (var i = 0; i < points.length; i++) {
        if (points[i].selected === PathPointSelection.ANCHORPOINT) {
            A_index = i;
            break;
        }
    }

    if (A_index <= 0 || A_index >= points.length - 1) {
        alert("A點在邊界，無法取得 B 與 C！");
    } else {
        var B = points[A_index - 1].anchor;
        var A = points[A_index].anchor;
        var C = points[A_index + 1].anchor;

        var intersection = getAngleBisectorIntersection(B, A, C);
        if (!intersection) {
            alert("角平分線與 BC 無交點！");
        }

        // 複製點，排除 A，並插入交點
        var newPath = doc.pathItems.add();
        newPath.stroked = true;
        newPath.filled = false;

        for (var i = 0; i < points.length; i++) {
            if (i === A_index) {
                // 插入交點（角平分線與 BC 的交點）
                var newPt = newPath.pathPoints.add();
                newPt.anchor = intersection;
                newPt.leftDirection = intersection;
                newPt.rightDirection = intersection;
                newPt.pointType = PointType.CORNER;
            } else {
                var pt = points[i];
                var np = newPath.pathPoints.add();
                np.anchor = pt.anchor;
                np.leftDirection = pt.leftDirection;
                np.rightDirection = pt.rightDirection;
                np.pointType = pt.pointType;
            }
        }

        // 遺留標記物件（命名為中心點）
        var marker = doc.pathItems.ellipse(
            intersection[1] + 0.05,
            intersection[0] - 0.05,
            0.1, 0.1
        );
        marker.stroked = true;
        marker.filled = false;
        marker.name = "中心點";

        // 刪除舊物件
        selectedItem.remove();

        alert("已刪除 A 點並加入角平分線交點作為新錨點，標記已命名為『中心點』。");
    }
}
