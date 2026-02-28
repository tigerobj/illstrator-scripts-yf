(function () {
    if (app.documents.length === 0) {
        alert("請先開啟文件。");
        return;
    }

    var doc = app.activeDocument;
    if (!doc.selection || doc.selection.length === 0) {
        alert("請先選取一個紅色 X 物件（可為 Path / Group / Compound Path）。");
        return;
    }

    var source = findFirstDrawable(doc.selection);
    if (!source) {
        alert("選取內容沒有可用的向量物件。\n請選取 Path / Group / Compound Path。");
        return;
    }

    var motifCount = askInt("要產生幾個白色圖案（群組）？", 22, 1, 300);
    if (motifCount === null) return;

    var minCell = askInt("每個圖案最小半徑（格數）", 2, 1, 20);
    if (minCell === null) return;

    var maxCell = askInt("每個圖案最大半徑（格數）", 5, minCell, 30);
    if (maxCell === null) return;

    var spacingFactor = askFloat("X 之間間距倍率（建議 1.3 ~ 2.2）", 1.55, 1.05, 4.0);
    if (spacingFactor === null) return;

    var spreadFactor = askFloat("圖案中心分散倍率（建議 4.0 ~ 8.0）", 4.8, 1.0, 20.0);
    if (spreadFactor === null) return;

    var jitter = askFloat("每個 X 的抖動比例（0~0.4）", 0.05, 0, 0.4);
    if (jitter === null) return;

    var sourceBounds = source.visibleBounds;
    var sourceW = Math.max(1, sourceBounds[2] - sourceBounds[0]);
    var sourceH = Math.max(1, sourceBounds[1] - sourceBounds[3]);
    var stepX = sourceW * spacingFactor;
    var stepY = sourceH * spacingFactor;

    var white = createWhiteColor(doc);
    var layer = doc.activeLayer;
    var generated = layer.groupItems.add();
    generated.name = "數學方程式白色X圖_" + timeStamp();

    var centers = generateCenters(motifCount, sourceBounds, stepX * spreadFactor, stepY * spreadFactor);

    for (var i = 0; i < motifCount; i++) {
        var radius = randomInt(minCell, maxCell);
        var eqType = randomInt(0, 6);
        var occupied = equationCells(eqType, radius);
        occupied = thinCells(occupied, randomRange(0.70, 0.9));
        occupied = occupied.concat(makeTrailCells(radius));

        for (var k = 0; k < occupied.length; k++) {
            var cell = occupied[k];
            var cx = centers[i][0] + cell[0] * stepX + randomRange(-stepX * jitter, stepX * jitter);
            var cy = centers[i][1] + cell[1] * stepY + randomRange(-stepY * jitter, stepY * jitter);

            var dup = source.duplicate(generated, ElementPlacement.PLACEATEND);
            recolorToWhite(dup, white);

            placeItemCenter(dup, cx, cy);
        }
    }

    var pathList = [];
    collectPathItems(generated, pathList);
    if (pathList.length < 2) {
        alert("生成路徑不足，無法建立複合路徑。");
        return;
    }

    var compound = layer.compoundPathItems.add();
    compound.name = generated.name + "_複合路徑";
    for (var p = pathList.length - 1; p >= 0; p--) {
        pathList[p].move(compound, ElementPlacement.PLACEATBEGINNING);
    }

    try {
        generated.remove();
    } catch (e) {
    }

    doc.selection = null;
    compound.selected = true;
    alert("完成：已用數學方程式生成白色 X 圖案並建立複合路徑。\n圖案數量：" + motifCount);

    function askInt(msg, def, min, max) {
        var raw = prompt(msg, String(def));
        if (raw === null) return null;
        var v = parseInt(raw, 10);
        if (isNaN(v) || v < min || v > max) {
            alert(msg + "\n請輸入介於 " + min + " 到 " + max + " 的整數。");
            return null;
        }
        return v;
    }

    function askFloat(msg, def, min, max) {
        var raw = prompt(msg, String(def));
        if (raw === null) return null;
        var v = parseFloat(raw);
        if (isNaN(v) || v < min || v > max) {
            alert(msg + "\n請輸入介於 " + min + " 到 " + max + " 的數值。");
            return null;
        }
        return v;
    }

    function findFirstDrawable(selection) {
        for (var i = 0; i < selection.length; i++) {
            var t = selection[i].typename;
            if (t === "PathItem" || t === "GroupItem" || t === "CompoundPathItem") {
                return selection[i];
            }
        }
        return null;
    }

    function equationCells(type, r) {
        var cells = [];
        var rr = r * r;

        for (var y = -r; y <= r; y++) {
            for (var x = -r; x <= r; x++) {
                var ax = Math.abs(x);
                var ay = Math.abs(y);
                var d2 = x * x + y * y;
                var t = false;

                if (type === 0) {
                    // 菱形邊框 + 中心十字（像你範例的雪花菱形）
                    var man = ax + ay;
                    t = (Math.abs(man - r) <= 1) || (ax <= 1 && ay <= r - 1) || (ay <= 1 && ax <= r - 1);
                } else if (type === 1) {
                    // 圓環 + 4 向小突起
                    t = (d2 <= rr && d2 >= Math.max(1, rr * 0.46));
                    if ((ax <= 1 && ay <= r + 1) || (ay <= 1 && ax <= r + 1)) t = true;
                } else if (type === 2) {
                    // 4 petals（窄帶）
                    var th = Math.atan2(y, x);
                    var rad = Math.sqrt(d2) / Math.max(1, r);
                    var rose = 0.56 + 0.33 * Math.cos(4 * th);
                    t = rad <= rose && rad >= rose * 0.72;
                } else if (type === 3) {
                    // 八角星骨架
                    t = (ax <= 1 || ay <= 1 || Math.abs(ax - ay) <= 1) && Math.max(ax, ay) <= r;
                    t = t && (d2 >= Math.max(1, rr * 0.06));
                } else if (type === 4) {
                    // 小愛心方程（只取邊界帶）
                    var nx = x / Math.max(1, r);
                    var ny = y / Math.max(1, r);
                    var heart = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;
                    t = heart <= 0.18 && heart >= -0.32;
                } else if (type === 5) {
                    // 十字菱形混合（比較像你想要的小群組）
                    var m = Math.max(ax, ay);
                    t = (m <= r && m >= Math.max(1, r - 2) && ((x + y) % 2 === 0)) ||
                        ((ax <= 1 || ay <= 1) && m <= r);
                } else {
                    // 小型密排菱形
                    var md = ax + ay;
                    t = md <= r && ((x + y) % 2 === 0);
                    if (md <= 1) t = true;
                }

                if (t) {
                    cells.push([x, y]);
                }
            }
        }

        return cells;
    }

    function thinCells(cells, keepRatio) {
        var out = [];
        for (var i = 0; i < cells.length; i++) {
            if (Math.random() <= keepRatio) {
                out.push(cells[i]);
            }
        }
        return out;
    }

    function makeTrailCells(r) {
        var trail = [];
        var count = randomInt(0, 3);
        if (count === 0) return trail;

        var vx = randomInt(-2, 2);
        var vy = randomInt(-2, 2);
        if (vx === 0 && vy === 0) vx = 1;

        var sx = randomInt(r + 1, r + 3) * (vx >= 0 ? 1 : -1);
        var sy = randomInt(r + 1, r + 3) * (vy >= 0 ? 1 : -1);

        for (var i = 0; i < count; i++) {
            trail.push([sx + vx * i * 2, sy + vy * i * 2]);
        }

        return trail;
    }

    function generateCenters(count, srcBounds, spreadX, spreadY) {
        var cx = (srcBounds[0] + srcBounds[2]) / 2;
        var cy = (srcBounds[1] + srcBounds[3]) / 2;

        var cols = Math.ceil(Math.sqrt(count));
        var rows = Math.ceil(count / cols);

        var startX = cx - ((cols - 1) * spreadX) / 2;
        var startY = cy + ((rows - 1) * spreadY) / 2;

        var pts = [];
        for (var i = 0; i < count; i++) {
            var r = Math.floor(i / cols);
            var c = i % cols;
            var x = startX + c * spreadX + randomRange(-spreadX * 0.22, spreadX * 0.22);
            var y = startY - r * spreadY + randomRange(-spreadY * 0.22, spreadY * 0.22);
            pts.push([x, y]);
        }
        shuffle(pts);
        return pts;
    }

    function placeItemCenter(item, centerX, centerY) {
        var b = item.visibleBounds;
        var w = b[2] - b[0];
        var h = b[1] - b[3];
        item.position = [centerX - w / 2, centerY + h / 2];
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

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function randomInt(min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
    }

    function timeStamp() {
        var d = new Date();
        function pad(v) { return v < 10 ? "0" + v : "" + v; }
        return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "_" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    }
})();
