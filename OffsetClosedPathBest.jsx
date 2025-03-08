#target illustrator

// 向量運算輔助函數
function add(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}

function subtract(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}

function multiply(v, scalar) {
    return { x: v.x * scalar, y: v.y * scalar };
}

function divide(v, scalar) {
    return { x: v.x / scalar, y: v.y / scalar };
}

function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

function length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalize(v) {
    var len = length(v);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
}

function perpendicular(v) {
    return { x: -v.y, y: v.x };
}

function lerp(v1, v2, t) {
    return {
        x: v1.x + (v2.x - v1.x) * t,
        y: v1.y + (v2.y - v1.y) * t
    };
}

// 計算兩條直線的交點
function getLineIntersection(p0, dir0, p1, dir1) {
    var a = dir0.x;
    var b = -dir1.x;
    var c = dir0.y;
    var d = -dir1.y;
    var e = p1.x - p0.x;
    var f = p1.y - p0.y;

    var denominator = a * d - b * c;
    if (Math.abs(denominator) < 1e-10) {
        return null; // 平行，無交點
    }

    var t = (e * d - b * f) / denominator;

    return {
        x: p0.x + t * dir0.x,
        y: p0.y + t * dir0.y
    };
}

// CubicBezier 類別
function CubicBezier(P0, P1, P2, P3) {
    this.P0 = P0;
    this.P1 = P1;
    this.P2 = P2;
    this.P3 = P3;
}

CubicBezier.prototype.getPoint = function(t) {
    var mt = 1 - t;
    var mt2 = mt * mt;
    var t2 = t * t;

    var x = mt2 * mt * this.P0.x +
            3 * mt2 * t * this.P1.x +
            3 * mt * t2 * this.P2.x +
            t2 * t * this.P3.x;

    var y = mt2 * mt * this.P0.y +
            3 * mt2 * t * this.P1.y +
            3 * mt * t2 * this.P2.y +
            t2 * t * this.P3.y;

    return { x: x, y: y };
};

CubicBezier.prototype.getDerivative = function(t) {
    var mt = 1 - t;

    var dx = -3 * mt * mt * this.P0.x +
             3 * (mt * mt - 2 * mt * t) * this.P1.x +
             3 * (2 * mt * t - t * t) * this.P2.x +
             3 * t * t * this.P3.x;

    var dy = -3 * mt * mt * this.P0.y +
             3 * (mt * mt - 2 * mt * t) * this.P1.y +
             3 * (2 * mt * t - t * t) * this.P2.y +
             3 * t * t * this.P3.y;

    return { x: dx, y: dy };
};

CubicBezier.prototype.getNormal = function(t) {
    var d = this.getDerivative(t);
    var n = perpendicular(d);
    return normalize(n);
};

// 偏移封閉路徑
function offsetClosedPath(pathItem, offsetDistance) {
    var newPathData = [];
    var segments = getPathSegments(pathItem);
    var numSegments = segments.length;

    // 偏移所有段並保存
    for (var i = 0; i < numSegments; i++) {
        var segment = segments[i];
        var offsetSegment = {};

        if (segment.type === "LINE") {
            // 處理直線段
            var startPoint = segment.P0;
            var endPoint = segment.P1;
            var direction = subtract(endPoint, startPoint);
            var normal = perpendicular(direction);
            normal = normalize(normal);

            // 計算偏移後的起點和終點
            offsetSegment.P0 = add(startPoint, multiply(normal, offsetDistance));
            offsetSegment.P1 = add(endPoint, multiply(normal, offsetDistance));
            offsetSegment.dir = direction;
            offsetSegment.normal = normal;
            offsetSegment.type = "LINE";
        } else if (segment.type === "CUBIC_BEZIER") {
            // 處理曲線段
            var bezier = new CubicBezier(segment.P0, segment.P1, segment.P2, segment.P3);
            var offsetBezier = computeOffsetCurve(bezier, offsetDistance);

            offsetSegment.P0 = offsetBezier.P0;
            offsetSegment.P1 = offsetBezier.P1;
            offsetSegment.P2 = offsetBezier.P2;
            offsetSegment.P3 = offsetBezier.P3;
            offsetSegment.dir = subtract(offsetBezier.P3, offsetBezier.P0);
            offsetSegment.type = "CUBIC_BEZIER";
        }

        newPathData.push(offsetSegment);
    }

    // 調整偏移段的端點
    for (var i = 0; i < numSegments; i++) {
        var currSegment = newPathData[i];
        var prevSegment = newPathData[(i - 1 + numSegments) % numSegments];

        // 取得方向向量
        var currDir = (currSegment.type === "LINE") ? currSegment.dir : subtract(currSegment.P3, currSegment.P0);
        var prevDir = (prevSegment.type === "LINE") ? prevSegment.dir : subtract(prevSegment.P3, prevSegment.P0);

        // 取得端點
        var currStart = currSegment.P0;
        var prevEnd = (prevSegment.type === "LINE") ? prevSegment.P1 : prevSegment.P3;

        // 計算延伸線的交點
        var intersection = getLineIntersection(
            prevEnd, prevDir,
            currStart, multiply(currDir, -1)
        );

        if (intersection) {
            // 調整端點到交點位置
            currSegment.P0 = intersection;
            if (currSegment.type === "LINE") {
                // 對於直線段，調整 P0
                currSegment.P0 = intersection;
            } else {
                // 對於曲線段，調整 P0 和 P1
                currSegment.P0 = intersection;
                // 可根據需要調整 P1，以確保曲線的平滑度
            }

            if (prevSegment.type === "LINE") {
                // 對於直線段，調整 P1
                prevSegment.P1 = intersection;
            } else {
                // 對於曲線段，調整 P3 和 P2
                prevSegment.P3 = intersection;
                // 可根據需要調整 P2，以確保曲線的平滑度
            }
        }
    }

    // 組合新的路徑
    var newPath = app.activeDocument.pathItems.add();
    newPath.stroked = true;
    newPath.filled = false;
    newPath.closed = true;
    newPath.strokeColor = pathItem.strokeColor;

    for (var i = 0; i < numSegments; i++) {
        var segment = newPathData[i];

        if (segment.type === "LINE") {
            var idx = newPath.pathPoints.length;

            if (idx == 0) {
                newPath.setEntirePath([[segment.P0.x, segment.P0.y]]);
            } else {
                newPath.pathPoints.add();
            }

            var point = newPath.pathPoints[idx];
            point.anchor = [segment.P0.x, segment.P0.y];
            point.leftDirection = [segment.P0.x, segment.P0.y];
            point.rightDirection = [segment.P0.x, segment.P0.y];

            // 添加終點
            newPath.pathPoints.add();
            idx = newPath.pathPoints.length - 1;
            point = newPath.pathPoints[idx];
            point.anchor = [segment.P1.x, segment.P1.y];
            point.leftDirection = [segment.P1.x, segment.P1.y];
            point.rightDirection = [segment.P1.x, segment.P1.y];
        } else if (segment.type === "CUBIC_BEZIER") {
            var idx = newPath.pathPoints.length;

            if (idx == 0) {
                newPath.setEntirePath([[segment.P0.x, segment.P0.y]]);
            } else {
                newPath.pathPoints.add();
            }

            var point = newPath.pathPoints[idx];
            point.anchor = [segment.P0.x, segment.P0.y];
            point.leftDirection = [segment.P0.x, segment.P0.y];
            point.rightDirection = [segment.P1.x, segment.P1.y];

            // 添加終點
            newPath.pathPoints.add();
            idx = newPath.pathPoints.length - 1;
            point = newPath.pathPoints[idx];
            point.anchor = [segment.P3.x, segment.P3.y];
            point.leftDirection = [segment.P2.x, segment.P2.y];
            point.rightDirection = [segment.P3.x, segment.P3.y];
        }
    }

    return newPath;
}

// 獲取路徑段，識別直線和曲線
function getPathSegments(pathItem) {
    var segments = [];
    var pathPoints = pathItem.pathPoints;
    var numPoints = pathPoints.length;

    for (var i = 0; i < numPoints; i++) {
        var currentPoint = pathPoints[i];
        var nextPoint = pathPoints[(i + 1) % numPoints];

        var P0 = { x: currentPoint.anchor[0], y: currentPoint.anchor[1] };
        var P1 = { x: currentPoint.rightDirection[0], y: currentPoint.rightDirection[1] };
        var P2 = { x: nextPoint.leftDirection[0], y: nextPoint.leftDirection[1] };
        var P3 = { x: nextPoint.anchor[0], y: nextPoint.anchor[1] };

        // 判斷是否為直線段
        var isLine = (arePointsEqual(currentPoint.anchor, currentPoint.leftDirection) &&
                      arePointsEqual(currentPoint.anchor, currentPoint.rightDirection) &&
                      arePointsEqual(nextPoint.anchor, nextPoint.leftDirection) &&
                      arePointsEqual(nextPoint.anchor, nextPoint.rightDirection));

        if (isLine) {
            segments.push({
                type: "LINE",
                P0: P0,
                P1: P3
            });
        } else {
            segments.push({
                type: "CUBIC_BEZIER",
                P0: P0,
                P1: P1,
                P2: P2,
                P3: P3
            });
        }
    }

    return segments;
}

// 檢查兩個點是否相等
function arePointsEqual(p1, p2) {
    return (Math.abs(p1[0] - p2[0]) < 1e-5) && (Math.abs(p1[1] - p2[1]) < 1e-5);
}

// 計算偏移曲線的控制點
function computeOffsetCurve(bezier, offsetDistance) {
    var tValues = [0, 0.25, 0.5, 0.75, 1];
    var normals = [];
    var points = [];

    for (var i = 0; i < tValues.length; i++) {
        var t = tValues[i];
        var point = bezier.getPoint(t);
        var normal = bezier.getNormal(t);
        normals.push(normal);
        points.push(point);
    }

    var offsetPoints = [];
    for (var i = 0; i < points.length; i++) {
        offsetPoints.push(add(points[i], multiply(normals[i], offsetDistance)));
    }

    // 簡單地使用偏移點作為新的控制點
    var Q0 = offsetPoints[0];
    var Q1 = offsetPoints[1];
    var Q2 = offsetPoints[3];
    var Q3 = offsetPoints[4];

    return new CubicBezier(Q0, Q1, Q2, Q3);
}

// 主程序
function main() {
    if (app.documents.length === 0) {
        alert("請先打開一個 Illustrator 文件。");
        return;
    }

    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert("請選取一個封閉的路徑物件。");
        return;
    }

    var selectedPath = doc.selection[0];
    if (!(selectedPath.typename === "PathItem") || !selectedPath.closed) {
        alert("請選取一個封閉的路徑物件。");
        return;
    }

    // 提示輸入偏移距離
    var offsetDistanceInput = prompt("請輸入偏移的距離（單位：毫米）：", "5");
    if (offsetDistanceInput === null) {
        return;
    }

    var offsetDistanceMM = parseFloat(offsetDistanceInput);
    if (isNaN(offsetDistanceMM)) {
        alert("請輸入有效的數字作為偏移距離。");
        return;
    }

    var mmToPoints = 2.83465;
    var offsetDistance = offsetDistanceMM * mmToPoints;

    // 執行偏移操作
    offsetClosedPath(selectedPath, offsetDistance);

    alert("偏移曲線已成功創建！");
}

// 執行主程序
main();
