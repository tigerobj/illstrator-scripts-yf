function extendLinesByLengthTowardsIntersection(extMM) {
    var doc = app.activeDocument;
    var sel = doc.selection;
    if (sel.length !== 2 ||
        sel[0].typename !== "PathItem" ||
        sel[1].typename !== "PathItem") {
        alert("請選取兩條直線（每條只有 2 個錨點）");
        return;
    }

    // mm → pt
    var lengthPt = extMM * 2.834645;

    // 取得兩條線及其端點座標
    var line1 = sel[0];
    var A1 = line1.pathPoints[0].anchor;
    var A2 = line1.pathPoints[1].anchor;

    var line2 = sel[1];
    var B1 = line2.pathPoints[0].anchor;
    var B2 = line2.pathPoints[1].anchor;

    // 計算無限延伸線的交點 P
    var dx1 = A2[0] - A1[0], dy1 = A2[1] - A1[1];
    var dx2 = B2[0] - B1[0], dy2 = B2[1] - B1[1];
    var det = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(det) < 1e-6) {
        alert("兩線平行，無法計算交點");
        return;
    }
    var t = ((B1[0] - A1[0]) * dy2 - (B1[1] - A1[1]) * dx2) / det;
    var P = [
        A1[0] + dx1 * t,
        A1[1] + dy1 * t
    ];

    // 延伸函式：從「最近於 P 的端點」往 P 方向延伸 extMM
    function extendLine(line, Q1, Q2) {
        // 計算距離 d1, d2
        var dxA = Q1[0] - P[0], dyA = Q1[1] - P[1];
        var d1 = Math.sqrt(dxA*dxA + dyA*dyA);
        var dxB = Q2[0] - P[0], dyB = Q2[1] - P[1];
        var d2 = Math.sqrt(dxB*dxB + dyB*dyB);

        // 要延伸的端點 q
        var qx, qy, isFirst;
        if (d1 < d2) {
            qx = Q1[0]; qy = Q1[1]; isFirst = true;
        } else {
            qx = Q2[0]; qy = Q2[1]; isFirst = false;
        }

        // 方向向量 u = (P - q) / |P - q|
        var vx = P[0] - qx, vy = P[1] - qy;
        var vlen = Math.sqrt(vx*vx + vy*vy);
        if (vlen < 1e-6) return;  // q 與 P 幾乎重疊
        var ux = vx / vlen, uy = vy / vlen;

        // 新端點 q' = q + u * lengthPt
        var nx = qx + ux * lengthPt;
        var ny = qy + uy * lengthPt;

        // 更新該端點
        var pts = line.pathPoints;
        var pt = isFirst ? pts[0] : pts[1];
        pt.anchor         = [nx, ny];
        pt.leftDirection  = [nx, ny];
        pt.rightDirection = [nx, ny];
        pt.pointType      = PointType.CORNER;
    }

    // 分別延伸 line1、line2
    extendLine(line1, A1, A2);
    extendLine(line2, B1, B2);

    alert("已將兩條線各自往交叉點方向延伸 " + extMM + " mm");
}

// 使用範例：延伸 15 mm
extendLinesByLengthTowardsIntersection(15.875);
