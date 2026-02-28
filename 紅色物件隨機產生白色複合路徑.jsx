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

    var batchCount = 20; // 固定執行 20 次

    var sourceBounds = source.visibleBounds;
    var white = createWhiteColor(doc);
    var layer = doc.activeLayer;
    var compounds = [];

    for (var run = 0; run < batchCount; run++) {
        var generated = layer.groupItems.add();
        generated.name = "數學方程式白色X圖_" + timeStamp() + "_" + (run + 1);

        // 每次都隨機一組參數（不顯示輸入框）
        var minCell = randomInt(1, 3);
        var maxCell = randomInt(Math.max(2, minCell + 1), 6);
        var spacingFactor = randomRange(1.35, 1.9);
        var spreadFactor = randomRange(4.0, 7.2);
        var jitter = randomRange(0.0, 0.03);

        var sourceW = Math.max(1, sourceBounds[2] - sourceBounds[0]);
        var sourceH = Math.max(1, sourceBounds[1] - sourceBounds[3]);
        var stepX = sourceW * spacingFactor;
        var stepY = sourceH * spacingFactor;

        var centers = generateCenters(1, sourceBounds, stepX * spreadFactor, stepY * spreadFactor);

        var radius = randomInt(minCell, maxCell);
        var eqType = randomInt(0, 6);
        var occupied = equationCells(eqType, radius);
        occupied = removeIsolatedCells(occupied, 1);
        occupied = closeGaps(occupied, radius + 1, 5);
        occupied = removeIsolatedCells(occupied, 1);
        occupied = clampCellsInRadius(occupied, radius + 1);

        for (var k = 0; k < occupied.length; k++) {
            var cell = occupied[k];
            var cx = centers[0][0] + cell[0] * stepX + randomRange(-stepX * jitter, stepX * jitter);
            var cy = centers[0][1] + cell[1] * stepY + randomRange(-stepY * jitter, stepY * jitter);

            var dup = source.duplicate(generated, ElementPlacement.PLACEATEND);
            recolorToWhite(dup, white);
            placeItemCenter(dup, cx, cy);
        }

        var pathList = [];
        collectPathItems(generated, pathList);
        if (pathList.length >= 2) {
            var compound = layer.compoundPathItems.add();
            compound.name = generated.name + "_複合路徑";
            for (var p = pathList.length - 1; p >= 0; p--) {
                pathList[p].move(compound, ElementPlacement.PLACEATBEGINNING);
            }
            compounds.push(compound);
        }

        try {
            generated.remove();
        } catch (e) {
        }
    }

    if (compounds.length === 0) {
        alert("生成路徑不足，無法建立複合路徑。");
        return;
    }

    doc.selection = null;
    for (var c = 0; c < compounds.length; c++) {
        compounds[c].selected = true;
    }
    alert("完成：已自動執行 20 次，每次輸出 1 個複合路徑。\n實際產生：" + compounds.length + " 個物件。");

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
                    var man = ax + ay;
                    t = (Math.abs(man - r) <= 1) || (ax <= 1 && ay <= r - 1) || (ay <= 1 && ax <= r - 1);
                } else if (type === 1) {
                    t = (d2 <= rr && d2 >= Math.max(1, rr * 0.46));
                    if ((ax <= 1 && ay <= r + 1) || (ay <= 1 && ax <= r + 1)) t = true;
                } else if (type === 2) {
                    var th = Math.atan2(y, x);
                    var rad = Math.sqrt(d2) / Math.max(1, r);
                    var rose = 0.56 + 0.33 * Math.cos(4 * th);
                    t = rad <= rose && rad >= rose * 0.72;
                } else if (type === 3) {
                    t = (ax <= 1 || ay <= 1 || Math.abs(ax - ay) <= 1) && Math.max(ax, ay) <= r;
                    t = t && (d2 >= Math.max(1, rr * 0.06));
                } else if (type === 4) {
                    var nx = x / Math.max(1, r);
                    var ny = y / Math.max(1, r);
                    var heart = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;
                    t = heart <= 0.18 && heart >= -0.32;
                } else if (type === 5) {
                    var m = Math.max(ax, ay);
                    t = (m <= r && m >= Math.max(1, r - 2) && ((x + y) % 2 === 0)) ||
                        ((ax <= 1 || ay <= 1) && m <= r);
                } else {
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

    function closeGaps(cells, maxRadius, minNeighborsToFill) {
        var map = {};
        var i;
        for (i = 0; i < cells.length; i++) {
            map[cells[i][0] + "," + cells[i][1]] = true;
        }

        var r = Math.ceil(maxRadius);
        var added = [];
        var r2 = maxRadius * maxRadius;

        for (var y = -r; y <= r; y++) {
            for (var x = -r; x <= r; x++) {
                var key = x + "," + y;
                if (map[key]) continue;
                if (x * x + y * y > r2) continue;

                var n = 0;
                for (var dx = -1; dx <= 1; dx++) {
                    for (var dy = -1; dy <= 1; dy++) {
                        if (dx === 0 && dy === 0) continue;
                        if (map[(x + dx) + "," + (y + dy)]) n++;
                    }
                }

                if (n >= minNeighborsToFill) {
                    added.push([x, y]);
                    map[key] = true;
                }
            }
        }

        return cells.concat(added);
    }

    function removeIsolatedCells(cells, minNeighbors) {
        var map = {};
        var i;
        for (i = 0; i < cells.length; i++) {
            map[cells[i][0] + "," + cells[i][1]] = true;
        }

        var kept = [];
        for (i = 0; i < cells.length; i++) {
            var x = cells[i][0];
            var y = cells[i][1];
            var n = 0;
            for (var dx = -1; dx <= 1; dx++) {
                for (var dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    if (map[(x + dx) + "," + (y + dy)]) n++;
                }
            }
            if (n >= minNeighbors) {
                kept.push(cells[i]);
            }
        }
        return kept;
    }

    function clampCellsInRadius(cells, maxRadius) {
        var out = [];
        var r2 = maxRadius * maxRadius;
        for (var i = 0; i < cells.length; i++) {
            var x = cells[i][0];
            var y = cells[i][1];
            if (x * x + y * y <= r2) {
                out.push(cells[i]);
            }
        }
        return out;
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
