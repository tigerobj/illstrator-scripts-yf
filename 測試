#include "json2.js";

/**
 * 去空白
 */
String.prototype.trim = function() {
    return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
}

//===== log =======================================================
function log(input) {
    if (!JSON || !JSON.stringify) return;
    var now = new Date();
    var output = JSON.stringify(input);
    $.writeln(now.toTimeString() + ": " + output);

    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    var logFile = File(pathEnv + "/建立旋轉及斜率資料.txt");
    logFile.encoding = "utf8";
    logFile.open("a");
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close();
}

//===== 檢查衣服配置檔.csv =========================================
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    var file = new File(pathEnv + '/衣服配置檔.csv');
    if (!file.exists) {
        alert(pathEnv + '/衣服配置檔.csv 檔案不存在！請複製 衣服配置檔.csv，再重新執行');
        return null;
    }
    return file;
}

//===== 讀取配置檔 ===============================================
function getKeys(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) keys.push(key);
    }
    return keys;
}

function readClothesData(evnFile, clothesData) {
    var file = evnFile;

    if (file.open('r')) {
        file.readln(); // ignore header
        while (!file.eof) {
            var line = file.readln();
            var parts = line.split(';');
            if (parts.length == 1) parts = line.split(',');

            var type = parts[8].trim();
            var size = parts[1].trim();

            if (!clothesData[type]) clothesData[type] = [];
            clothesData[type].push({ shirtType: type, selectedSize: size });
        }
        file.close();
    } else {
        alert('無法打開檔案');
        return;
    }
}

//===== GUI ======================================================
function showGui(allPageItems) {
    var dialog = new Window('dialog', '尺寸選擇');
    dialog.orientation = 'column';
    dialog.alignChildren = ['fill', 'top'];

    var mainGroup = dialog.add('group');
    mainGroup.orientation = 'row';
    mainGroup.alignChildren = ['fill', 'fill'];

    var contentPanel = mainGroup.add('panel', undefined, '球衣類別選擇');
    contentPanel.orientation = 'column';
    contentPanel.maximumSize.width = 200;

    var rightPanel = mainGroup.add('panel', undefined, '旋轉點選擇');
    rightPanel.orientation = 'column';
    rightPanel.alignChildren = ['fill', 'top'];

    var buttonGroup = mainGroup.add('panel', undefined, '確定選擇');
    buttonGroup.orientation = 'row';

    var okButton = buttonGroup.add('button', undefined, '確定');
    var cancelButton = buttonGroup.add('button', undefined, '取消');

    var radioButtons = [];
    var kindRadioButtons = [];

    okButton.onClick = function() {
        for (var i = 0; i < radioButtons.length; i++) {
            if (radioButtons[i].value) clothes_type = radioButtons[i].text;
        }
        for (var j = 0; j < kindRadioButtons.length; j++) {
            if (kindRadioButtons[j].value) kind = kindRadioButtons[j].text;
        }
        dialog.close();
    };

    cancelButton.onClick = function() {
        dialog.close();
    };

    // 左前點/右前點… 的 radio
    function loadKindButtons() {
        for (var j = kindRadioButtons.length - 1; j > -1; j--) {
            kindRadioButtons[j].parent.remove(kindRadioButtons[j]);
        }
        kindRadioButtons = [];

        // 原本 4 點
        kindRadioButtons.push(rightPanel.add('radiobutton', undefined, "左前點"));
        kindRadioButtons.push(rightPanel.add('radiobutton', undefined, "右前點"));
        kindRadioButtons.push(rightPanel.add('radiobutton', undefined, "左後點"));
        kindRadioButtons.push(rightPanel.add('radiobutton', undefined, "右後點"));

        // 新增 4 個中心點選項
        kindRadioButtons.push(rightPanel.add('radiobutton', undefined, "後片套圖中心位置"));
        kindRadioButtons.push(rightPanel.add('radiobutton', undefined, "前片套圖中心位置"));
        kindRadioButtons.push(rightPanel.add('radiobutton', undefined, "左袖套圖中心位置"));
        kindRadioButtons.push(rightPanel.add('radiobutton', undefined, "右袖套圖中心位置"));

        dialog.layout.layout(true);
    }

    for (var i = 0; i < allPageItems.length; i++) {
        var radioButton = contentPanel.add('radiobutton', undefined, allPageItems[i]);
        radioButton.onClick = loadKindButtons;
        radioButtons.push(radioButton);
    }

    dialog.show();
}

//==== CSV 讀寫 ==================================================
function readCsvToObj(csvFile) {
    csvFile.open('r');
    var obj = {};
    while (s = csvFile.readln()) {
        var kv = s.split(';');
        if (kv.length == 1) kv = s.split(',');
        obj[kv[0]] = kv[1];
    }
    csvFile.close();
    return obj;
}

function upsertMultipleToCsvFile(csvFile, dataArray) {
    var csvData = readCsvToObj(csvFile);
    for (var i = 0; i < dataArray.length; i++) {
        csvData[dataArray[i][0]] = dataArray[i][1];
    }

    csvFile.open('w');
    for (var k in csvData) {
        if (csvData.hasOwnProperty(k)) {
            csvFile.writeln(k + ";" + csvData[k]);
        }
    }
    csvFile.close();
}

//===== 寫入「錨點座標」 ============================================
function writePoint(csvFile, kind) {
    var doc = app.activeDocument;
    var sel = doc.selection;

    if (sel.length !== 1 || sel[0].typename !== "PathItem") {
        alert("請選取一個 PathItem");
        return null;
    }

    var item = sel[0];
    var pts = item.pathPoints;

    var selectedPts = [];
    for (var i = 0; i < pts.length; i++) {
        if (pts[i].selected === PathPointSelection.ANCHORPOINT) {
            selectedPts.push(pts[i]);
        }
    }

    if (selectedPts.length !== 1) {
        alert("請選取一個錨點");
        return null;
    }

    var pt = selectedPts[0].anchor;
    var anchorString = pt[0] + "," + pt[1];

    upsertMultipleToCsvFile(csvFile, [[kind, anchorString]]);
    return pt;
}

//===== 寫入「中心位置」 ============================================
function writeCenterPoint(csvFile, kind) {
    var doc = app.activeDocument;
    var sel = doc.selection;

    if (sel.length !== 1) {
        alert("請選取一個物件");
        return null;
    }

    var item = sel[0];
    var b = item.visibleBounds; // [L, T, R, B]

    var cx = (b[0] + b[2]) / 2;
    var cy = (b[1] + b[3]) / 2;

    var centerString = cx + "," + cy;

    upsertMultipleToCsvFile(csvFile, [[kind, centerString]]);
    return [cx, cy];
}

//===== 主程式 ====================================================
function selectSize() {
    var clothesData = {};
    var clothesCsvFile = checkForDataCsv();
    readClothesData(clothesCsvFile, clothesData);
    var shirtTypes = getKeys(clothesData);
    showGui(shirtTypes);
}

function run() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定 CLOTH_TEMPLATE_CONFIG_PATH");
        return;
    }

    clothes_type = null;
    kind = null;

    selectSize();

    var csvFile = new File(pathEnv + "/旋轉-" + clothes_type + ".csv");

    // 自動判斷是否為「中心位置」
    if (kind.indexOf("中心位置") !== -1) {
        writeCenterPoint(csvFile, kind);
    } else {
        writePoint(csvFile, kind);
    }
}

run();
