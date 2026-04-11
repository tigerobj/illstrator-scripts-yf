/**
 * 將目前選取的單一物件或群組中心點寫入 CSV。
 * 輸出檔名：寫入物件中心點.csv
 * 輸出格式：
 * 中心點;centerX,centerY
 */

String.prototype.trim = function () {
    return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, "");
};

function readCsvToObj(csvFile) {
    var obj = {};

    if (!csvFile.exists) {
        return obj;
    }

    csvFile.encoding = "UTF8";
    if (!csvFile.open("r")) {
        return obj;
    }

    while (!csvFile.eof) {
        var line = csvFile.readln();
        if (!line || !line.trim()) {
            continue;
        }

        var kv = line.split(";");
        if (kv.length === 1) {
            kv = line.split(",");
            if (kv.length === 1) {
                continue;
            }
        }

        obj[kv[0]] = kv.slice(1).join(";");
    }

    csvFile.close();
    return obj;
}

function upsertMultipleToCsvFile(csvFile, dataArray) {
    var csvData = readCsvToObj(csvFile);
    var i;

    for (i = 0; i < dataArray.length; i++) {
        csvData[dataArray[i][0]] = dataArray[i][1];
    }

    csvFile.encoding = "UTF8";
    if (!csvFile.open("w")) {
        alert("無法寫入 CSV：\n" + csvFile.fsName);
        return false;
    }

    for (var key in csvData) {
        if (csvData.hasOwnProperty(key)) {
            csvFile.writeln(key + ";" + csvData[key]);
        }
    }

    csvFile.close();
    return true;
}

function getSelectionCenter(item) {
    var bounds = item.geometricBounds;
    return {
        x: (bounds[0] + bounds[2]) / 2,
        y: (bounds[1] + bounds[3]) / 2
    };
}

function run() {
    if (!app.documents.length) {
        alert("目前沒有開啟的文件。");
        return;
    }

    var doc = app.activeDocument;
    var sel = doc.selection;

    if (!sel || sel.length !== 1) {
        alert("請先選取一個物件或一個群組。");
        return;
    }

    var pathEnv = $.getenv("CLOTH_TEMPLATE_CONFIG_PATH");
    if (pathEnv === null || pathEnv === "") {
        alert("請先設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH。");
        return;
    }

    var center = getSelectionCenter(sel[0]);
    var csvFile = new File(pathEnv + "/寫入物件中心點.csv");
    var centerString = center.x + "," + center.y;
    var success = upsertMultipleToCsvFile(csvFile, [
        ["中心點", centerString],
        ["centerX", center.x],
        ["centerY", center.y]
    ]);

    if (!success) {
        return;
    }

    alert("已寫入物件中心點：\n" + centerString + "\n\n" + csvFile.fsName);
}

run();
