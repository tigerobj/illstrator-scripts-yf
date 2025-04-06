/**
 * 透明度為 50%
 */

function createFarme(name){
    var doc = app.activeDocument;


    // 取得指定圖層
    try {
        var targetLayer = doc.layers.getByName("操作");
    } catch(e) {
        targetLayer = doc.layers.add();
        targetLayer.name = "操作";
        alert("建立圖層名稱：" + targetLayer.name);
    }

    // 確認目前選取一個物件
    if (doc.selection.length === 1) {
        var selectedItem = doc.selection[0];

        // 取得選取物件邊界
        var bounds = selectedItem.geometricBounds;
        var left = bounds[0];
        var top = bounds[1];
        var right = bounds[2];
        var bottom = bounds[3];
        var width = right - left;
        var height = top - bottom;
        // 建立矩形外框（與選取物件邊界一致）
        var rectFrame = targetLayer.pathItems.rectangle(top, left, width, height);
        // 設定內部填色為紅色
        rectFrame.filled = true;
        rectFrame.fillColor = new CMYKColor();
        rectFrame.fillColor.cyan = 0;
        rectFrame.fillColor.magenta = 100;
        rectFrame.fillColor.yellow = 100;
        rectFrame.fillColor.black = 0;
        // 設定透明度為 50%
        rectFrame.opacity = 50;
        rectFrame.name = name;
        alert("已建立內部填色紅色且透明度50%的矩形外框！");

    } else {
        alert("請先選取一個物件！");
    }

}

/**
 * 去空白
 */
String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');

}


/**
 * 判斷當前目錄下是否存在名為 '對齊物件.csv' 的檔案
 *
 * @returns {File} - 如果找到 '對齊物件.csv' 則返回檔案物件，否則返回 null
 */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    var file = new File(pathEnv + '/對齊物件.csv');
    if (!file.exists) {
        alert(pathEnv + '/對齊物件.csv 檔案不存在！請複製 對齊物件.csv，再重新執行');
        return null;
    }
    return file;
}

function readCSV() {
    file = checkForDataCsv();
    var alignmentData = [];

    // 打開檔案進行讀取
    if (file.open('r')) {
        file.readln(); // 讀取並忽略首行（標題行）
        while (!file.eof) {
            var line = file.readln();
            var parts = line.split(';');

            var alignmentFrame = parts[0].trim();
            var alignmentPageItem = parts[1].trim();
            var layerName = parts[2].trim();
            alignmentData.push({
                alignmentFrame: alignmentFrame,
                alignmentPageItem: alignmentPageItem,
                layerName: layerName
            });

        }
        file.close(); // 關閉檔案
        return alignmentData;
    } else {
        alert('無法打開檔案: ' + filePath);
        return;
    }
}



// 顯示GUI供選擇，並回傳選取資料
function showGUI(data) {
    var dlg = new Window("dialog", "選擇對齊物件");
    dlg.orientation = "column";
    dlg.alignChildren = ["fill", "top"];

    dlg.add("statictext", undefined, "請選擇一個對齊物件：");

    var items = [];
    for (var i = 0; i < data.length; i++) {
        items.push(data[i].alignmentFrame);  // 第一欄作為選單顯示
    }

    var dropdown = dlg.add("dropdownlist", undefined, items);
    dropdown.selection = 0;

    // 確定、取消按鈕
    var btnGroup = dlg.add("group");
    btnGroup.alignment = "center";
    var btnOK = btnGroup.add("button", undefined, "確定", {name: "ok"});
    var btnCancel = btnGroup.add("button", undefined, "取消", {name: "cancel"});

    if (dlg.show() === 1) {
        return data[dropdown.selection.index];  // 回傳選取的一整列
    } else {
        return null;
    }
}

item = showGUI(readCSV());
//alert(item.alignmentFrame+" ,"+item.alignmentPageItem+" ,"+item.layerName);


createFarme(item.alignmentFrame);
