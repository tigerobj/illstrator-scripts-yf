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

/**
 * 將物件從座標 (x1, y1) 平移到座標 (x2, y2)
 * 差值 = (x2 - x1 , y2 - y1)
 */
function moveItemByTwoPoints(item,x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;

    item.translate(dx, dy);
}



/************************************************************
 * 主流程：讀 CSV → 取得記錄點 → 根據記錄點旋轉物件
 ************************************************************/
function run() {

    var sel = app.activeDocument.selection;
    if (sel.length !== 1) {
        alert("請選取 1 個物件！");
        return;
    }

    var item = sel[0];

    var fileName = prompt("請輸入記錄檔案", "旋轉-釣魚衣.csv");

    var csvPath = $.getenv("CLOTH_TEMPLATE_CONFIG_PATH") + "/"+fileName;

    //var positionName = getPointFromCsv(csvPath,"左前點");

    var positionName = prompt("請輸入位置名稱", "左前點");
    // 讀取「記錄點」
    var p = getPointFromCsv(csvPath, positionName);
    if (!p) return;

    var cx = p[0];
    var cy = p[1];

    positionName = prompt("請輸入位置名稱", "左袖套圖點");
    var p = getPointFromCsv(csvPath, positionName);
    var px = p[0];
    var py = p[1];
    //moveItemByTwoPoints
    moveItemByTwoPoints(item,px,py,cx,cy);//"左袖套圖點","左前點"
}


/************************************************************
 * 執行
 ************************************************************/
run();
