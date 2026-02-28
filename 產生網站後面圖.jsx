#include "對齊置中.jsx";
#include "base.jsx";

/**
 * 判斷當前目錄下是否存在名為 'clothes.csv' 的檔案
 *
 * @returns {File} - 如果找到 'clothes.csv' 則返回檔案物件，否則返回 null
 */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
	var file = new File(pathEnv + '/客製化衣服配置檔.csv');
    if (!file.exists) {
        alert(pathEnv + '/衣服配置檔.csv 檔案不存在！請複製 衣服配置檔.csv，再重新執行');
        return null;
    }
    return file;
}



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




	var lblNumber = mainGroup.add('statictext', undefined, '系列:');
    lblNumber.alignment = ['left', 'center'];
    // 添加文字框顯示所選的檔案路徑
    var numberText = mainGroup.add('edittext', undefined, '', { readonly: false });
    numberText.characters = 20;
    numberText.alignment = ['fill', 'center'];

    var lblName = mainGroup.add('statictext', undefined, '姓名:');
    lblName.alignment = ['left', 'center'];
    // 添加文字框顯示所選的檔案路徑
    var nameText = mainGroup.add('edittext', undefined, '', { readonly: false });
    nameText.characters = 20;
    nameText.alignment = ['fill', 'center'];

	var dataGroup = dialog.add('group');
	dataGroup.orientation = 'row';
	dataGroup.alignChildren = ['left', 'center'];
	dataGroup.alignment = ['fill', 'top'];

    // 添加按鈕組
    var buttonGroup = dataGroup.add('panel', undefined, '確定選擇尺寸');
    dataGroup.orientation = 'row';
    dataGroup.alignment = ['center', 'bottom'];

    var okButton = dataGroup.add('button', undefined, '確定', { name: 'ok' });
    var cancelButton = dataGroup.add('button', undefined, '取消', { name: 'cancel' });

	okButton.onClick = function() {
		clothStyle = numberText.text;
		custName = nameText.text;
		dialog.close();
    };

    cancelButton.onClick = function() {

        dialog.close();
    };

    dialog.layout.layout(true);
    dialog.show();
}




/**
 * 複製指定 AI 檔案到另一個路徑，並開啟它
 * @param {String} sourcePath - 原始 AI 檔案完整路徑
 * @param {String} destFolderPath - 目的資料夾完整路徑
 * @returns {Boolean} - 成功回傳 true，失敗回傳 false
 */
function copyAndOpenAIFile(sourcePath, destFolderPath,fileName) {
    var sourceFile = new File(sourcePath);
    var destFolder = new Folder(destFolderPath);

    if (!sourceFile.exists) {
        alert("來源檔案不存在：" + sourcePath);
        return false;
    }

    if (!destFolder.exists) {
        alert("目的資料夾不存在：" + destFolderPath);
        return false;
    }

    // 目的檔案完整路徑
    var destFile = new File(destFolder.fsName + "/" + fileName);

    // 複製
    var success = sourceFile.copy(destFile);
    if (!success) {
        alert("複製檔案失敗！");
        return false;
    }

    // 開啟複製後的檔案
    doc2 = app.open(destFile);

}

/**
 * 將指定群組置中到目前作用中的工作區域中心
 * @param {GroupItem} group - 要移動的群組
 */
function centerGroupToArtboard(group) {
    if (group.typename !== "GroupItem") {
        alert("請傳入一個群組物件 (GroupItem)！");
        return;
    }

    var doc = app.activeDocument;
    var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var abBounds = artboard.artboardRect; // [left, top, right, bottom]

    // 計算 artboard 中心
    var abCenterX = (abBounds[0] + abBounds[2]) / 2;
    var abCenterY = (abBounds[1] + abBounds[3]) / 2;

    // 計算群組的幾何邊界中心
    var gb = group.geometricBounds; // [left, top, right, bottom]
    var groupCenterX = (gb[0] + gb[2]) / 2;
    var groupCenterY = (gb[1] + gb[3]) / 2;

    // 計算位移量（目標中心 - 目前中心）
    var deltaX = abCenterX - groupCenterX;
    var deltaY = abCenterY - groupCenterY;

    // 執行位移
    group.translate(deltaX, deltaY);
}

/**
 * 關閉目前開啟的文件，不顯示任何訊息，不儲存修改
 */
function closeActiveDocumentQuietly() {
    if (app.documents.length > 0) {
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    } else {
        alert("目前沒有開啟的文件。");
    }
}

/**
 * 將目前開啟的 Illustrator 文件匯出為「不可再編輯」的 PDF 和 JPG，
 * 儲存在相同路徑與檔名前綴
 */
function exportNonEditablePDFandJPG() {
    var doc = app.activeDocument;

    if (!doc.saved || !doc.fullName) {
        alert("此文件尚未儲存，請先儲存後再匯出！");
        return;
    }

    var aiFile = doc.fullName;
    var folderPath = aiFile.path;
    var baseName = aiFile.name.replace(/\.ai$/i, "");

    // 匯出 PDF（不可編輯）
    var pdfFile = new File(folderPath + "/" + baseName + ".pdf");
    var pdfOptions = new PDFSaveOptions();
    pdfOptions.compatibility = PDFCompatibility.ACROBAT5; // 較廣泛支援版本
    pdfOptions.preserveEditability = false;  // ✅ 不保留 Illustrator 編輯資訊
    pdfOptions.generateThumbnails = true;
    pdfOptions.optimization = true;          // ✅ 壓縮圖形與文字
    pdfOptions.colorConversionID = ColorConversion.None;
    doc.saveAs(pdfFile, pdfOptions);

    // 匯出 JPG
    var jpgFile = new File(folderPath + "/" + baseName + ".jpg");
    var jpgOptions = new ExportOptionsJPEG();
    jpgOptions.antiAliasing = true;
	  jpgOptions.qualitySetting = 100;
    jpgOptions.artBoardClipping = true;
    // jpgOptions.horizontalScale = 208.3333;
    // jpgOptions.verticalScale = 208.3333;
    doc.exportFile(jpgFile, ExportType.JPEG, jpgOptions);


    var pngFile = new File(folderPath + "/" + baseName + ".png");

    var exportOptions = new ExportOptionsPNG24();
    exportOptions.antiAliasing = true;
    exportOptions.transparency = true; // 保留透明背景
    exportOptions.artBoardClipping = true;
    // exportOptions.horizontalScale = 208.3333; // 150ppi ≈ 208.3333%
    // exportOptions.verticalScale = 208.3333;

    doc.exportFile(pngFile, ExportType.PNG24, exportOptions);
}




var doc = app.activeDocument;
var doc2;

var custName;
var clothStyle;

showGui();

var MyData = readCsvToObj(checkForDataCsv());
back = getGroupByLevel("立體版","後面");
front = getGroupByLevel("立體版","前面");
layer = doc.layers.getByName("指定顏色");
items = layer.pageItems;
//newItem = back.duplicate();

fmt = "yyyyMMdd-%T"+custName+"B%-nnn";

extension = "ai";

folderPath = MyData["網站圖輸出位置"];
//var dir = new Folder
dir = new Folder(MyData["網站圖輸出位置"]);
if(!dir.exists){
  dir.create ();
}
last = findLastFileNameByCustName(fmt,folderPath,extension,"T"+custName+"B");

fileName = autoCode.execute(fmt,last);
//fmt = "yyMMdd-nnn";
copyAndOpenAIFile(MyData["網站底圖"],MyData["網站圖輸出位置"],fileName+".ai");


destLayer = doc2.layers.getByName("服裝內容");
// newItem = back.duplicate(destLayer);
newItem2 = back.duplicate(destLayer);

// layer = doc2.layers.getByName("顏色區塊");
// var newGroup = layer.groupItems.add();
// newGroup.name = "指定顏色";
// for(var i=0;i<items.length;i++){
// 	item = items[i].duplicate(destLayer);
// 	//item.move(newGroup, ElementPlacement.PLACEATEND);
// 	item.move(newGroup, ElementPlacement.PLACEATBEGINNING);
// }

// newGroup.resize(11.5357107151372,11.5357107151372,true,true,false,false,0);
// newItem.resize(9.12349848269201,9.12349848269201,true,true,false,false,0);
newItem2.resize(60,60,true,true,true,true,60);

// frameA = getPathItemByFourLevel("底圖","背景","展示區","右區","底色");
// frameB = getPathItemByThreeLevel("服裝內容","後面","後片","底色");
// t = autoCenterXY(frameA,frameB);
// newItem.translate(t.left,t.top);
//
frameA = getPathItemByLayer("圖層 1","邊界");
frameB = getPathItemByThreeLevel("服裝內容","後面","後片","底色");
t = autoCenterXY(frameA,frameB);
newItem2.translate(t.left,t.top);
//
//
// centerGroupToArtboard(newGroup);

//.contents = content;

// text = getTextFrameByThreeLevel("底圖","背景","變動文字","姓名");
// text.contents = custName;


try {
	doc2.save(); // 無提示儲存現有檔案
} catch (e) {
    alert("儲存失敗：" + e.message);
}

exportNonEditablePDFandJPG();
//autoCenterByItem(baseItem,newItem);
closeActiveDocumentQuietly();
