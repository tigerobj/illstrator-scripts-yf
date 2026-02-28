#include "json2.js";
//log(["i",i,"opt new",opt]);
function log (input) {

    if(!JSON || !JSON.stringify) return;
    var now = new Date();
    var output = JSON.stringify(input);
    $.writeln(now.toTimeString() + ": " + output);
    //D:\開發\客戶圖檔\杰優、裕豐工廠產品\ai_script_workspace\ai_example\illustrator-scripts-master2
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    var filePath = pathEnv;
    //var filePath = "D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2";
	//alert(app.activeDocument.filePath);
    //var logFile = File(app.activeDocument.filePath + "/log.txt");
		var logFile = File(filePath + "/log_標示尺寸-新圓領衫.txt");
		logFile.encoding = "utf8";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close(); //作測試修改222
}
/**
 * 去空白
 * @param {string} str
 * @return {string}
 */

function trim (str) {
  return str.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');

}

String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');

}

/**
 * 在指定圖層中根據名稱獲取頁面物件，包括群組和遮罩內的物件。
 *
 * @param {Document} doc - Adobe Illustrator 文件對象。
 * @param {string} layerName - 圖層的名稱。
 * @param {string} itemName - 頁面物件的名稱。
 * @returns {PageItem|null} - 返回對應的頁面物件，如果未找到則返回 null。
 */
function getPageItemByNameInLayer(doc, layerName, itemName) {
    // 获取指定名称的图层
    var targetLayer;
    try {
        targetLayer = doc.layers.getByName(layerName);
    } catch (e) {
        log(["未找到名為 '" + layerName + "' 的圖層。"]);
        return null;
//檔案最後增加一筆資料
    }

    // 在目标图层中查找指定名称的 pageItem
    try {
        var pageItem = targetLayer.pageItems.getByName(itemName);
        return pageItem;
    } catch (e) {
        log(["在圖層 '" + layerName + "' 中未找到名為 '" + itemName + "' 的 pageItem。"]);
        return null;
    }
}

/**
 * 遞歸查找指定圖層中的頁面物件。
 *
 * @param {Item} item - 目前檢查的物件。
 * @param {string} itemName - 要查找的物件名稱。
 * @returns {PageItem|null} - 返回對應的頁面物件，如果未找到則返回 null。
 */
function findPageItemInGroup(item, itemName) {
    if (item.name === itemName) {
        return item;
    }

    // 如果是群組，則遞歸檢查其子物件
    if (item.typename === "GroupItem") {
        var items = item.pageItems;
        for (var i = 0; i < items.length; i++) {
            var foundItem = findPageItemInGroup(items[i], itemName);
            if (foundItem) {
                return foundItem;
            }
        }
    }

    return null; // 如果未找到對應物件
}

/**
 * 讀取csv值,儲存成key,value物件值.
 * key為第一欄
 * values為第二欄
 */
function readCsvToObj(csvFile){
	csvFile.open('r');
	var obj = new Object();
	while (s = csvFile.readln()) {
		kv = s.split(';');
		if(kv.length ==1){
			kv = s.split(',');
			if(kv.length ==1){
				alert("檔案分隔符號有問題請檢查檔案");
			}
		}
		obj[kv[0]] = kv[1];
	}
	return obj;
	csvFile.close();

}

/**
 * 判斷當前目錄下是否存在名為 '標示尺寸-新圓領衫.csv' 的檔案
 *
 * @returns {File} - 如果找到 '標示尺寸-新圓領衫.csv' 則返回檔案物件，否則返回 null
 */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    //alert(pathEnv);
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    myPathEvn = pathEnv;
    var file = new File(pathEnv + '/標示尺寸-新圓領衫.csv');
    if (!file.exists) {
        alert(pathEnv + '/標示尺寸-新圓領衫.csv 檔案不存在！請複製 標示尺寸-新圓領衫.csv，再重新執行');
        return null;
    }
    return file;
}

/**
 * 判斷當前目錄下是否存在名為 'clothes.' 的檔案
 *
 * @returns {File} - 如果找到 'clothes.csv' 則返回檔案物件，否則返回 null
 */
function checkSizeFile() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    //alert(pathEnv);
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    myPathEvn = pathEnv;
    var file = new File(pathEnv + '/尺寸.txt');
    if (!file.exists) {
        alert(pathEnv + '/尺寸.txt 檔案不存在！請複製 尺寸.txt，再重新執行');
        return null;
    }
    return file;
}

// 建立字型名稱對照物件的函式
function createFontMapping() {
    var fonts = app.textFonts;
    var fontMap = {};

    for (var i = 0; i < fonts.length; i++) {
        var key = fonts[i].family + " " + fonts[i].style;
        fontMap[key] = fonts[i].name;
    }

    return fontMap;
}

// 建立文字函式 (可指定內容、字型、大小、位置)
function createText(textGroup,content, fontName, fontSize, x, y) {
    // 建立點狀文字 (Point Text)
    var text = textGroup.textFrames.add();
    text.contents = content;

    // 指定字型與字體大小
    try {
        text.textRange.characterAttributes.textFont = app.textFonts.getByName(fontName);
    } catch(e) {
        alert("找不到指定的字型：" + fontName);
        log(["找不到指定的字型：'" + fontName]);
        return;
    }

    text.textRange.characterAttributes.size = fontSize; // 單位為 pt

    // 指定文字的位置（Illustrator 座標以左上角為原點）
    text.left = x;
    text.top = y;

    return text;
}

// 建立並對齊文字函式
// groupAName: 參考群組名稱（例如："前片"）
// targetGroupName: 放置文字的群組名稱
// textContent: 文字內容
// fontName: 內部字型名稱（如："AdobeMingStd-Light"）
// fontSize: 文字大小（pt）
// verticalDistance: 文字從groupA上方往下的距離（點）
// horizontalDistance: 文字從參考點向左的距離（點）
// alignMode: 對齊方式 ("bottom-center", "bottom-left", "bottom-right")

function createAlignedText(groupAName, targetGroupName, textContent, fontName, fontSize, verticalDistance, horizontalDistance, alignMode) {
    var doc = app.activeDocument;
    layername = "裁切";
    // 取得參考群組（前片）
    var groupA = getPageItemByNameInLayer(doc,layername,groupAName);
    if (!groupA) {
        alert("找不到參考群組：" + groupAName);
        log(["找不到參考群組：'" + fontName]);
        return null;
    }

    targetLayer = doc.layers.getByName(layername);
    // 取得目標群組，若不存在則建立
    var targetGroup;
    targetGroup = getPageItemByNameInLayer(doc,layername,targetGroupName);
    if(targetGroup == null){
      targetGroup = targetLayer.groupItems.add();
      targetGroup.name = targetGroupName;
    }


    // 取得群組邊界 (geometricBounds 最精確)
    frame = findPageItemInGroup(groupA , "框");
    var bounds = frame.geometricBounds;
    var left = bounds[0];
    var top = bounds[1];
    var right = bounds[2];
    var bottom = bounds[3];

    // 計算文字位置
    var textX, textY;

    switch (alignMode) {
        case "bottom-center": // 向下置中
            textX = (left + right) / 2 - horizontalDistance;
            break;
        case "bottom-left":   // 向下靠左
            textX = left + horizontalDistance;
            break;
        case "bottom-right":  // 向下靠右
            textX = right - horizontalDistance;
            break;
        default:
            alert("alignMode 參數錯誤，請輸入：bottom-center、bottom-left 或 bottom-right");
            return null;
    }

    textY = bottom - verticalDistance; // 向下移動，因Illustrator Y軸由上往下遞減

    // 建立文字到目標群組
    var textItem = targetGroup.textFrames.add();
    textItem.contents = textContent;
    textItem.textRange.characterAttributes.textFont = app.textFonts.getByName(fontName);
    textItem.textRange.characterAttributes.size = fontSize;

    // 設定文字對齊位置（以左上角為基準點）
    textItem.left = textX-textItem.width/2;
    textItem.top = textY;
}





clothes_size = "";
var allPageItems = [];
vFile = checkForDataCsv();
//sFilse = checkSizeFile();
vData = new Object();

// 打開檔案進行讀取
if (vFile.open('r')) {
    vFile.readln(); // 讀取並忽略首行（標題行）
    while (!vFile.eof) {
        var line = vFile.readln();
        var parts = line.split(';');
        if(parts.length<2){
          parts = line.split(',');
        }
        var size = parts[0].trim();
        var FrontPlacketCover = parts[1].trim();  //前片
        var backUpperCollarCover = parts[2].trim();  //後片
        var leftSleeve = parts[3].trim();   //左袖
        var rightSleeve = parts[4].trim();  //右袖
        var collar = parts[5].trim();       //領片

        var leftFrontPanel = parts[6].trim();  //左前
        var rightFrontPanel = parts[7].trim();  //右前
        var leftFrontSidePanel = parts[8].trim();  //左前協
        var rightFrontSidePanel = parts[9].trim();  //右前協
        var frontCollar = parts[10].trim();  //領前
        var leftFrontPocket = parts[11].trim();  //口袋左前
        var leftBackPocket = parts[12].trim();  //口袋左後
        var rightFrontPocket = parts[13].trim();  //口袋右前
        var rightBackPocket = parts[14].trim();  //口袋右後
        var vKey = size;

        vData[vKey] = {
            size: size,
            FrontPlacketCover: FrontPlacketCover,
            backUpperCollarCover: backUpperCollarCover,
            leftSleeve: leftSleeve,
            rightSleeve: rightSleeve,
            collar: collar,
            leftFrontPanel: leftFrontPanel,
            rightFrontPanel: rightFrontPanel,
            leftFrontSidePanel: leftFrontSidePanel,
            rightFrontSidePanel: rightFrontSidePanel,
            frontCollar: frontCollar,
            leftFrontPocket: leftFrontPocket,
            leftBackPocket: leftBackPocket,
            rightFrontPocket: rightFrontPocket,
            rightBackPocket: rightBackPocket
        };
        allPageItems.push(size);
    }
    vFile.close(); // 關閉檔案
} else {
    alert('無法打開檔案: ' + filePath);
}

// 打開檔案進行讀取
// if (sFilse.open('r')) {
//     line = sFilse.readln(); // 讀取並忽略首行（標題行）
//     var parts = line.split(';');
//     clothes_size = parts[0].trim();
//     sFilse.close(); // 關閉檔案
// } else {
//     alert('無法打開檔案: ' + filePath);
// }


showGui();


//要先有 allPageItems 作為radioButtons的顯示資料
//clothes_size是按鈕按下所選的radioButton的值

function showGui() {
    //cutPieceGroups = getCutPieceGroups();
    // 創建對話框
    var dialog = new Window('dialog', '尺寸選擇');

    // 獲取螢幕尺寸
    var screenWidth = Screen.width;
    //var screenHeight = Screen.height;
    // 設置對話框的邊界，讓其佔據螢幕的大部分
    //dialog.bounds = [0, 0, screenWidth * 0.9, screenHeight * 0.9];
    // 設置對話框的佈局屬性
    dialog.orientation = 'column';
    dialog.alignChildren = ['fill', 'top'];
    //dialog.maximumSize.width = 1024;

    // 創建主組件
    var mainGroup = dialog.add('group');
    mainGroup.orientation = 'row';
    mainGroup.alignChildren = ['fill', 'fill'];

    //裁切中的裁片內容
    var contentPanel = mainGroup.add('panel', undefined, '尺寸選擇');
    contentPanel.orientation = 'column';
    contentPanel.alignChildren = ['fill', 'fill'];


    // 添加按鈕組
    var buttonGroup = mainGroup.add('panel', undefined, '確定選擇尺寸');
    buttonGroup.orientation = 'row';
    buttonGroup.alignment = ['center', 'bottom'];

    var okButton = buttonGroup.add('button', undefined, '確定', { name: 'ok' });
    var cancelButton = buttonGroup.add('button', undefined, '取消', { name: 'cancel' });
    var radioButtons = [];
    okButton.onClick = function() {
      //alert("okButton.onClick");
      for(var i=0;i<radioButtons.length;i++){
        if(radioButtons[i].value){
          clothes_size = radioButtons[i].text;
        }
      }
      dialog.close();
    }

    cancelButton.onClick = function() {
      dialog.close();
    };

    // 用於存儲尺寸的 checkbox 參考
    for (var i = 0; i < allPageItems.length; i++) {
        var radioButton = contentPanel.add('radiobutton', undefined, allPageItems[i]);
        //var checkboxButton = contentPanel.add('checkbox', undefined, allPageItems[i].name);
        radioButtons.push(radioButton);
    }
    dialog.layout.layout(true);
    dialog.show();
}



var doc = app.activeDocument;

// 使用範例：建立文字 "Hello World"，指定字型、大小、座標
var fontMapping = createFontMapping();
var fontName = fontMapping["Adobe 明體 Std L"];  // 字型名稱（可調整，例如：ArialMT、AdobeMingStd-Light）
var fontSize = 21;
var verticalDistance = -30;
var horizontalDistance = 0;
var textGroup = "尺寸字";
// 使用範例
createAlignedText(
    "左前",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].leftFrontPanel,              // 文字內容
    fontName,   // 字型內部名稱
    fontSize,                     // 字體大小 (pt)
    verticalDistance,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);

createAlignedText(
    "右前",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].rightFrontPanel,              // 文字內容
    fontName,   // 字型內部名稱
    fontSize,                     // 字體大小 (pt)
    verticalDistance,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);

createAlignedText(
    "左前協",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].leftFrontSidePanel,              // 文字內容
    fontName,   // 字型內部名稱
    fontSize,                     // 字體大小 (pt)
    verticalDistance,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);

createAlignedText(
    "右前協",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].rightFrontSidePanel,              // 文字內容
    fontName,   // 字型內部名稱
    fontSize,                     // 字體大小 (pt)
    verticalDistance,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);


// 使用範例
createAlignedText(
    "後片",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].backUpperCollarCover,              // 文字內容
    fontName,   // 字型內部名稱
    fontSize,                     // 字體大小 (pt)
    verticalDistance,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);

// 使用左袖
createAlignedText(
    "左袖",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].leftSleeve,              // 文字內容
    fontName,   // 字型內部名稱
    fontSize,                     // 字體大小 (pt)
    verticalDistance,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);

// 使用右袖
createAlignedText(
    "右袖",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].rightSleeve,              // 文字內容
    fontName,   // 字型內部名稱
    fontSize,                     // 字體大小 (pt)
    verticalDistance,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);

// 口袋左前
createAlignedText(
    "口袋左前",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].leftFrontPocket,              // 文字內容
    fontName,   // 字型內部名稱
    fontSize,                     // 字體大小 (pt)
    verticalDistance,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);

// 口袋左後
createAlignedText(
    "口袋左後",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].leftBackPocket,              // 文字內容
    fontName,   // 字型內部名稱
    fontSize,                     // 字體大小 (pt)
    verticalDistance,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);

// 口袋右前
createAlignedText(
    "口袋右前",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].rightFrontPocket,              // 文字內容
    fontName,   // 字型內部名稱
    fontSize,                     // 字體大小 (pt)
    verticalDistance,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);

// 口袋右後
createAlignedText(
    "口袋右後",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].rightBackPocket,              // 文字內容
    fontName,   // 字型內部名稱
    fontSize,                     // 字體大小 (pt)
    verticalDistance,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);

// 領前
createAlignedText(
    "領前",                 // 參考群組名稱
    textGroup,               // 文字放置的群組名稱
    vData[clothes_size].frontCollar,              // 文字內容
    fontName,   // 字型內部名稱
    30,                     // 字體大小 (pt)
    verticalDistance-65,                     // 向下的距離 (pt)
    horizontalDistance,                     // 向左的距離 (pt)
    "bottom-center"         // 對齊方式
);
