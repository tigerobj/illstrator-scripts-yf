/************************************************************
 * 讀取 CSV → 回傳 key:value 物件
 ************************************************************/
function readCsvToObj(csvFile) {
    csvFile.open("r");
    var obj = {};

    while (!csvFile.eof) {
        var line = csvFile.readln();
        if (!line) continue;

        // 支援「;」與「,」兩種分隔符
        var kv = line.split(";");
        if (kv.length === 1) kv = line.split(",");

        obj[kv[0]] = kv[1];
    }

    csvFile.close();
    return obj;
}


/************************************************************
 * 從 CSV 取得某座標（格式： x,y ）
 ************************************************************/
function getPointFromCsv(csvPath, keyName) {
    var csvFile = new File(csvPath);

    if (!csvFile.exists) {
        alert("找不到 CSV：" + csvPath);
        return null;
    }

    var data = readCsvToObj(csvFile);

    if (!data[keyName]) {
        alert("CSV 內不存在 key：「" + keyName + "」");
        return null;
    }

    var parts = data[keyName].split(",");
    if (parts.length !== 2) {
        alert("CSV 座標格式錯誤：" + data[keyName]);
        return null;
    }

    return [parseFloat(parts[0]), parseFloat(parts[1])];
}

//Angle

/************************************************************
 * 從 CSV 取得某角度
 ************************************************************/
function getAngleFromCsv(csvPath, keyName) {
    var csvFile = new File(csvPath);

    if (!csvFile.exists) {
        alert("找不到 CSV：" + csvPath);
        return null;
    }

    var data = readCsvToObj(csvFile);

    if (!data[keyName]) {
        alert("CSV 內不存在 key：「" + keyName + "」");
        return null;
    }

    return data[keyName];
}


/************************************************************
 * 計算 px,py 以 PageItem 幾何中心為基準旋轉 angle 度後的新座標
 * 用於旋轉後補償位移用（計算旋轉後的 P2）
 ************************************************************/
function rotatePointByItem(px, py, item, angle) {

    var gb = item.geometricBounds;
    var cx = (gb[0] + gb[2]) / 2; // 中心 X
    var cy = (gb[1] + gb[3]) / 2; // 中心 Y

    var rad = angle * Math.PI / 180;
    var dx = px - cx;
    var dy = py - cy;

    var cosv = Math.cos(rad);
    var sinv = Math.sin(rad);

    var x2 = cx + dx * cosv - dy * sinv;
    var y2 = cy + dx * sinv + dy * cosv;

    return [x2, y2];
}


/************************************************************
 * 依指定旋轉點 (cx, cy) 旋轉物件（並補償平移避免中心跑掉）
 ************************************************************/
function rotateAroundPoint(item, angle, cx, cy) {

    // 計算旋轉後 P2（以 PageItem 中心為 pivot）
    var p2 = rotatePointByItem(cx, cy, item, angle);

    // 執行真正旋轉（以物件中心旋轉）
    var m = app.getRotationMatrix(angle);
    item.transform(m, true, true, true, true, 1);

    // 補償位移：讓旋轉後的 pivot(P2) 回到原本位置(cx,cy)
    var dx = cx - p2[0];
    var dy = cy - p2[1];
    item.translate(dx, dy);
}


/************************************************************
 * 彈出輸入框讓使用者輸入旋轉角度
 ************************************************************/
function askAngle() {
    var win = new Window("dialog", "輸入旋轉角度（度）");
    win.orientation = "column";

    win.add("statictext", undefined, "請輸入旋轉角度：");
    var input = win.add("edittext", undefined, "0");
    input.characters = 6;

    var g = win.add("group");
    var ok = g.add("button", undefined, "確定");
    var cancel = g.add("button", undefined, "取消");

    var result = null;

    ok.onClick = function () {
        result = parseFloat(input.text);
        if (isNaN(result)) {
            alert("請輸入正確的數字！");
            return;
        }
        win.close();
    };

    cancel.onClick = function () {
        result = null;
        win.close();
    };

    win.show();
    return result;
}

/************************************************************
 * 彈出輸入框讓使用者輸入旋轉角度
 ************************************************************/
function askRotationObject() {
		var win = new Window("dialog", "輸入要旋轉物件名稱");
    win.orientation = "column";

		win.add("statictext", undefined, "左前或左前袖口,右前或右前袖口：");
		var input = win.add("edittext", undefined, "左前");
		input.characters = 20;

    var g = win.add("group");
    var ok = g.add("button", undefined, "確定");
    var cancel = g.add("button", undefined, "取消");

    var result = null;

    ok.onClick = function () {
        result = input.text;
        win.close();
    };

    cancel.onClick = function () {
        result = null;
        win.close();
    };

    win.show();
    return result;
}

/**
 * 判斷是否為袖口相關
 * 名稱只要包含「袖」、「袖口」、「左袖」、「右袖」皆視為袖口類別
 */
function isSleeveKind(kind) {
    if (!kind) return false;
    return (
        kind.indexOf("袖口") !== -1 ||
        kind.indexOf("左袖") !== -1 ||
        kind.indexOf("右袖") !== -1 ||
        kind.indexOf("袖") !== -1  // 最廣義，包含袖子相關
    );
}


/************************************************************
 * 主流程：讀 CSV → 取得記錄點 → 根據記錄點旋轉物件
 ************************************************************/
function rotateByCsvPoint() {

    var sel = app.activeDocument.selection;
    if (sel.length !== 1) {
        alert("請選取 1 個物件！");
        return;
    }

    var item = sel[0];

    var csvPath = $.getenv("CLOTH_TEMPLATE_CONFIG_PATH") + "/旋轉-釣魚衣.csv";

		objName = askRotationObject();
		alert(objName);
    // 讀取「記錄點」
		nf = objName.substring(0, 1);

		if(objName.indexOf("袖口") !== -1){
			myName = nf+"袖口套圖點";
		}else{
			myName = nf+"袖套圖點";
		}

		//if(左前袖口)
    var p = getPointFromCsv(csvPath, myName);
    if (!p) return;

    var cx = p[0];
    var cy = p[1];

    // 輸入角度
		var angle = getAngleFromCsv(csvPath, objName+"點旋轉角度");
    if (angle === null) return;

    // 執行旋轉 + 補償
    rotateAroundPoint(item, angle, cx, cy);

    alert("旋轉完成！");
}


/************************************************************
 * 執行
 ************************************************************/
rotateByCsvPoint();
