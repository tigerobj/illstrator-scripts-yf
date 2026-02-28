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

    //var myScale = 208.3333;
    var myScale =250;
    // 匯出 JPG
    var jpgFile = new File(folderPath + "/" + baseName + ".jpg");
    var jpgOptions = new ExportOptionsJPEG();
    jpgOptions.antiAliasing = true;
	  jpgOptions.qualitySetting = 100;
    jpgOptions.artBoardClipping = true;
    jpgOptions.horizontalScale = myScale;
    jpgOptions.verticalScale = myScale;
    doc.exportFile(jpgFile, ExportType.JPEG, jpgOptions);


    var pngFile = new File(folderPath + "/" + baseName + ".png");

    var exportOptions = new ExportOptionsPNG24();
    exportOptions.antiAliasing = true;
    exportOptions.transparency = true; // 保留透明背景
    exportOptions.artBoardClipping = true;
    exportOptions.horizontalScale = myScale; // 150ppi ≈ 208.3333%
    exportOptions.verticalScale = myScale;

    doc.exportFile(pngFile, ExportType.PNG24, exportOptions);
}

/**
 * 複製目前選取的所有物件，加入群組，並將群組複製到指定 doc 中並置中
 * @param {Document} targetDoc - 目標 Illustrator 文件
 */
function copySelectionToDocCenter(sourceDoc,selection,targetDoc) {

    // 將選取的物件加入新群組
    var tempGroup = sourceDoc.groupItems.add();
    tempGroup.name = "顏色區塊";
    for (var i =  selection.length-1; i >=0; i--) {
        var duplicated = selection[i].duplicate(sourceDoc, ElementPlacement.PLACEATEND);
        duplicated.moveToBeginning(tempGroup);
    }

    // 複製整個群組到目標文件
    app.activeDocument = targetDoc;
    var pastedGroup = tempGroup.duplicate(targetDoc, ElementPlacement.PLACEATEND);

    // 計算置中位置
    var groupBounds = pastedGroup.visibleBounds; // [left, top, right, bottom]
    var groupWidth = groupBounds[2] - groupBounds[0];
    var groupHeight = groupBounds[1] - groupBounds[3];
    var groupCenterX = (groupBounds[0] + groupBounds[2]) / 2;
    var groupCenterY = (groupBounds[1] + groupBounds[3]) / 2;

    var artboardRect = targetDoc.artboards[targetDoc.artboards.getActiveArtboardIndex()].artboardRect; // [left, top, right, bottom]
    var artboardCenterX = (artboardRect[0] + artboardRect[2]) / 2;
    var artboardCenterY = (artboardRect[1] + artboardRect[3]) / 2;

    // 取得物件 geometricBounds 資訊函式
    function getMyBounds(item) {
    		var b = item.geometricBounds;
    		return {
    				left: b[0],
    				top: b[1],
    				right: b[2],
    				bottom: b[3],
    				width: (b[2] - b[0]),
    				height: (b[1] - b[3]),
    				centerX: (b[0] + b[2]) / 2,
    				centerY: (b[1] + b[3]) / 2
    		};
    }
    // 取得物件 geometricBounds 資訊函式
    function getMyBounds2() {
        var b = targetDoc.artboards[targetDoc.artboards.getActiveArtboardIndex()].artboardRect; // [left, top, right, bottom]
    		return {
    				left: b[0],
    				top: b[1],
    				right: b[2],
    				bottom: b[3],
    				width: (b[2] - b[0]),
    				height: (b[1] - b[3]),
    				centerX: (b[0] + b[2]) / 2,
    				centerY: (b[1] + b[3]) / 2
    		};
    }


    frameA = getPathItemByFourLevel("圖層 1","顏色區塊","前面","前片","底色");

    targetBounds = getMyBounds2();
    selectedBounds = getMyBounds(frameA);
    // x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
    y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;



    var deltaX = artboardCenterX - groupCenterX;
    // var deltaY = artboardCenterY - groupCenterY;

    pastedGroup.translate(deltaX, y);

    // 刪除來源文件中的臨時群組
    tempGroup.remove();
}


function replaceClippingByName(groupItem, oldName, newShape,destLayer) {
    if (!groupItem.clipped) {
        alert("這個群組不是遮罩群組！");
        return;
    }

    var oldClip = null;

    // 找出名稱為 oldName 的遮罩物件
    for (var i = 0; i < groupItem.pageItems.length; i++) {
        var item = groupItem.pageItems[i];
        if (item.typename === "PathItem" && item.clipping && item.name === oldName) {
            oldClip = item;
            break;
        }
    }

    if (!oldClip) {
        alert("找不到名為「" + oldName + "」的遮罩物件！");
        return;
    }

    // 複製新的遮罩圖形
    var newMask = newShape;
    newMask.move(groupItem, ElementPlacement.PLACEATBEGINNING);
    newMask.clipping = true;
    newMask.name = oldName;

    // 移除原本的遮罩
    oldClip.remove();

    // 確保群組還是遮罩狀態
    groupItem.clipped = true;
}

function getFirstClippingGroupFromGroup(fgroup) {

    // 在該群組內找第一個剪裁群組
    for (var j = 0; j < fgroup.groupItems.length; j++) {
        var subGroup = fgroup.groupItems[j];
        if (subGroup.clipped) {
            return subGroup;
        }
    }

    alert("「" + groupName + "」群組內沒有剪裁群組！");
    return null;
}


/**
 * 將指定圖層內所有 pageItem 設為 hidden
 * @param {String} layerName - 要處理的圖層名稱，例如 "縫份"
 */
function hideAllItemsInLayer(layerName) {
    var doc = app.activeDocument;
    try {
        var layer = doc.layers.getByName(layerName);
        for (var i = 0; i < layer.pageItems.length; i++) {
            layer.pageItems[i].hidden = true;
        }
    } catch (e) {
        alert("找不到圖層名稱：" + layerName);
    }
}



var doc = app.activeDocument;
var doc2;

//領子底色
baseFillColor = getPathItemByThreeLevel("立體版","前面","領", "底色").fillColor;

//前片群組
fgroup = getGroupByTwoLevel("立體版","前面","前片");
bgroup = getGroupByTwoLevel("立體版","後面","後片");
//找到第一個群組遮罩
oldMask = getFirstClippingGroupFromGroup(fgroup);
oldMask2 = getFirstClippingGroupFromGroup(bgroup);

//作為新遮罩的底色
fPathItem = getPathItemByTwoLevel("裁切", "前示意圖", "前片");

bPathItem = getPathItemByTwoLevel("裁切", "後示意圖", "後片");
if(bPathItem == null){
  bPathItem = getTextFrameByThreeLevel("裁切", "後示意圖", "後片","底色");
}

leftSleeveGroup = getGroupByLevel("裁切","左袖");
rightSleeveGroup = getGroupByLevel("裁切","右袖");
LMask = getFirstClippingGroupFromGroup(leftSleeveGroup);
RMask = getFirstClippingGroupFromGroup(rightSleeveGroup);



var custName;
var clothStyle;
showGui();
var MyData = readCsvToObj(checkForDataCsv());
fmt = "yyyyMMdd-%"+custName+"%-nnn";
extension = "eps";
dir = new File(MyData["裁片輸出"]);
last = findLastFileNameByCustName(fmt,dir,extension,custName);
fileName = autoCode.execute(fmt,last);

var dir = new Folder(MyData["裁片輸出"]);
if(!dir.exists){
  dir.create ();
  alert("建立目錄 : "+MyData["裁片輸出"]);
}
//fmt = "yyMMdd-nnn";
copyAndOpenAIFile(MyData["圓領T裁片L"],MyData["裁片輸出"],fileName+".eps");
destLayer = doc2.layers.getByName("裁切");
destLayer2 = doc2.layers.getByName("縫份");
newCopyGroup = oldMask.duplicate(destLayer);
newCopyGroup.name = "前片遮罩";
newCopyGroup2 = oldMask2.duplicate(destLayer);
newCopyGroup2.name = "後片遮罩";
newMaskPathItem = fPathItem.duplicate(destLayer);
newMaskPathItem2 = bPathItem.duplicate(destLayer);


replaceClippingByName(newCopyGroup, "底色", newMaskPathItem,destLayer);
replaceClippingByName(newCopyGroup2, "底色", newMaskPathItem2,destLayer);


frontCloth = getGroupByLevel("裁切", "前片");
aItem = destLayer2.pathItems.getByName("前片"); //縫份前片
bItem = findPageItemInGroup(newCopyGroup,"底色");
t = autoCenterXY(aItem, bItem);
newCopyGroup.translate(t.left,t.top);
newShapeBase = getPathItemByTwoLevel("裁切", "前片", "底色");
replaceClippingByName(newCopyGroup, "底色", newShapeBase.duplicate(),destLayer);
newCopyGroup.move(frontCloth, ElementPlacement.PLACEATBEGINNING);


backCloth = getGroupByLevel("裁切", "後片");
aItem = destLayer2.pathItems.getByName("後片");
bItem = findPageItemInGroup(newCopyGroup2,"底色");
t = autoCenterXY(aItem, bItem);
newCopyGroup2.translate(t.left,t.top);
newShapeBase2 = getPathItemByTwoLevel("裁切", "後片", "底色");
replaceClippingByName(newCopyGroup2, "底色", newShapeBase2.duplicate(),destLayer);
newCopyGroup2.move(backCloth, ElementPlacement.PLACEATBEGINNING);

newLMask = LMask.duplicate(destLayer);
newRMask = RMask.duplicate(destLayer);

A = getGroupByLevel("裁切","左袖");
B = getGroupByLevel("裁切","右袖");
newLMask.move(A, ElementPlacement.PLACEATBEGINNING);
newRMask.move(B, ElementPlacement.PLACEATBEGINNING);

aItem1 = getPathItemByTwoLevel("裁切","左袖","底色");
aItem2 = getPathItemByTwoLevel("裁切","右袖","底色");

bItem1 = findPageItemInGroup(newLMask,"底色");
bItem2 = findPageItemInGroup(newRMask,"底色");

t1 = autoCenterXY(aItem1, bItem1);
t2 = autoCenterXY(aItem2, bItem2);
newLMask.translate(t1.left,t1.top);
newRMask.translate(t2.left,t2.top);

//baseFillColor

getPathItemByTwoLevel("裁切", "領滾條", "底色").fillColor = baseFillColor;
getPathItemByTwoLevel("裁切", "領", "底色").fillColor = baseFillColor;


hideAllItemsInLayer("縫份");

//ZOrderMethod.BRINGTOFRONT

mylogo = getGroupByTwoLevel("裁切", "前片", "logo");
//ElementPlacement.PLACEBEFORE
mylogo.move(frontCloth, ElementPlacement.PLACEATBEGINNING);

//item.move(newGroup, ElementPlacement.PLACEATBEGINNING);


// copySelectionToDocCenter(doc,doc.selection,doc2);
try {
  var epsFile = doc2.fullName;
  var saveOpts  = new EPSSaveOptions();
  saveOpts.cmykPostScript = true;
  saveOpts.embedAllFonts = true;
  doc2.saveAs(epsFile,saveOpts);
} catch (e) {
    alert("儲存失敗：" + e.message);
}

closeActiveDocumentQuietly();
