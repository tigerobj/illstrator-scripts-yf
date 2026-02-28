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
        alert(pathEnv + '/客製化衣服配置檔.csv 檔案不存在！請複製 客製化衣服配置檔.csv，再重新執行');
        return null;
    }
    return file;
}

/**
 * 判斷當前目錄下是否存在名為 'clothes.csv' 的檔案
 *
 * @returns {File} - 如果找到 'clothes.csv' 則返回檔案物件，否則返回 null
 */
function checkForDataCsv2() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    var file = new File(pathEnv + '/旋轉-T恤袋.csv');
    if (!file.exists) {
        alert(pathEnv + '/旋轉-T恤袋.csv 檔案不存在！請複製 旋轉-T恤袋.csv，再重新執行');
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

/**
 * 在指定位置建立一個小圓點並命名
 * @param {Number} x - X 座標
 * @param {Number} y - Y 座標
 * @param {String} name - 物件名稱
 * @return {PathItem} 建立的點物件
 */
function createAnchorPoint(x, y, name) {
    var doc = app.activeDocument;
    var size = 1; // 圓的大小（可自行調整）
    var point = doc.pathItems.ellipse(y + size / 2, x - size / 2, size, size);
    point.stroked = false;
    point.filled = true;
    point.fillColor = getTransparentColor(); // 或填滿顏色以方便查看
    point.name = name;
    return point;
}

/**
 * 建立一個透明的顏色
 */
function getTransparentColor() {
    var noColor = new NoColor();
    return noColor;
}

function rotateFrom90ToSlope(targetSlope, targetItem,anchor,num) {
    if (!targetItem) {
        var sel = app.activeDocument.selection;
        if (sel.length !== 1 || sel[0].typename !== "PathItem") {
            alert("請選取一個 PathItem");
            return;
        }
        targetItem = sel[0];
    }

    var originalAngle = -90*num; // 預設是從垂直最上點開始
    var targetAngle = Math.atan(targetSlope) * 180 / Math.PI;
    var rotateBy = targetAngle - originalAngle;

    targetItem.rotate(
        rotateBy,
        true,  // 對物件有效
        true,  // 對圖樣有效
        true,  // 對漸層有效
        true,  // 對筆畫有效
        Transformation.CENTER
    );
}


function createClippingGroupWithMask() {
    var doc = app.activeDocument;
    var cutLayer = doc.layers.getByName("裁切");
    var frameLayer = doc.layers.getByName("外框");
    // 找出遮罩物件「底色」
    var maskPath = frameLayer.pathItems.getByName("底色");
    if (!maskPath) {
        alert("找不到遮罩物件『底色』");
        return;
    }
    // 解鎖遮罩物件
    maskPath.locked = false;
    maskPath.hidden = false;

    // 建立新的剪裁群組
    var clippingGroup = cutLayer.groupItems.add();
    clippingGroup.name = "剪裁群組前面";

    // 複製底色作為遮罩
    var mask = maskPath.duplicate(clippingGroup, ElementPlacement.PLACEATBEGINNING);
    mask.clipping = true;

    // 找出要剪裁的元件名稱
    var targetNames = ["右袖", "左袖", "領", "前片"];

    // 將每個物件搬進剪裁群組中
    for (var i = 0; i < targetNames.length; i++) {
        var targetGroup = cutLayer.groupItems.getByName(targetNames[i]);
        if (targetGroup) {
            targetGroup.move(clippingGroup, ElementPlacement.PLACEATEND);
        } else {
            alert("找不到群組：「" + targetNames[i] + "」");
        }
    }

    clippingGroup.clipped = true;
    moveItem = frameLayer.pathItems.getByName("前片外框");
    moveItem.move(cutLayer, ElementPlacement.PLACEATBEGINNING);

    // 找出遮罩物件「底色」
    var maskPath = frameLayer.pathItems.getByName("後片底色");
    if (!maskPath) {
        alert("找不到遮罩物件『底色』");
        return;
    }
    // 解鎖遮罩物件
    maskPath.locked = false;
    maskPath.hidden = false;

    // 建立新的剪裁群組
    var clippingGroup = cutLayer.groupItems.add();
    clippingGroup.name = "剪裁群組後面";

    // 複製底色作為遮罩
    var mask = maskPath.duplicate(clippingGroup, ElementPlacement.PLACEATBEGINNING);
    mask.clipping = true;

    // 找出要剪裁的元件名稱
    var targetNames = ["後片右袖", "後片左袖", "後片領", "後片"];

    // 將每個物件搬進剪裁群組中
    for (var i = 0; i < targetNames.length; i++) {
        var targetGroup = cutLayer.groupItems.getByName(targetNames[i]);
        if (targetGroup) {
            targetGroup.move(clippingGroup, ElementPlacement.PLACEATEND);
        } else {
            alert("找不到群組：「" + targetNames[i] + "」");
        }
    }

    clippingGroup.clipped = true;
    moveItem = frameLayer.pathItems.getByName("後片外框");
    moveItem.move(cutLayer, ElementPlacement.PLACEATBEGINNING);
    //alert("剪裁群組建立完成！");

    // targetLayer = getOrCreateLayer("完成");
    // clippingGroup.move(targetLayer, ElementPlacement.PLACEATBEGINNING);
}

// ✅ 若指定圖層名稱存在就取得該圖層
// ✅ 若不存在則自動新增圖層，並命名為指定名稱
function getOrCreateLayer(layerName) {
    var doc = app.activeDocument;
    var layer;

    try {
        layer = doc.layers.getByName(layerName);
    } catch (e) {
        // 若找不到圖層就建立一個新圖層
        layer = doc.layers.add();
        layer.name = layerName;
    }

    return layer;
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
// if(bPathItem == null){
//   bPathItem = getTextFrameByThreeLevel("裁切", "後示意圖", "後片","底色");
// }

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
dir = new File(MyData["袋子輸出"]);
last = findLastFileNameByCustName(fmt,dir,extension,custName);
fileName = autoCode.execute(fmt,last);

var dir = new Folder(MyData["袋子輸出"]);
if(!dir.exists){
  dir.create ();
  alert("建立目錄 : "+MyData["袋子輸出"]);
}
//fmt = "yyMMdd-nnn";
copyAndOpenAIFile(MyData["圓領T袋子"],MyData["袋子輸出"],fileName+".eps");

getPathItemByTwoLevel("裁切", "後片領", "底色").fillColor = baseFillColor;
// getPathItemByTwoLevel("裁切", "領", "底色").fillColor = baseFillColor;
compoundPath = getPathItemByTwoLevel("裁切", "領", "底色");
// alert(compoundPath.pathItems.length);

compoundPath.pathItems[0].fillColor = baseFillColor;


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

newLMask2 = LMask.duplicate(destLayer);
newRMask2 = RMask.duplicate(destLayer);

A = getGroupByLevel("裁切","左袖");
B = getGroupByLevel("裁切","右袖");
C = getGroupByLevel("裁切","後片左袖");
D = getGroupByLevel("裁切","後片右袖");

newLMask.move(A, ElementPlacement.PLACEATBEGINNING);
newRMask.move(B, ElementPlacement.PLACEATBEGINNING);

newLMask2.move(C, ElementPlacement.PLACEATBEGINNING);
newRMask2.move(D, ElementPlacement.PLACEATBEGINNING);

aItem1 = getPathItemByTwoLevel("裁切","左袖","底色");
aItem2 = getPathItemByTwoLevel("裁切","右袖","底色");

aItem3 = getPathItemByTwoLevel("裁切","後片左袖","底色");
aItem4 = getPathItemByTwoLevel("裁切","後片右袖","底色");

bItem1 = findPageItemInGroup(newLMask,"底色");
bItem2 = findPageItemInGroup(newRMask,"底色");

bItem3 = findPageItemInGroup(newLMask2,"底色");
bItem4 = findPageItemInGroup(newRMask2,"底色")

t1 = autoLeftTopXY(aItem1, bItem1);
t2 = autoRightTopXY(aItem2, bItem2);
newLMask.translate(t1.left,t1.top);
newRMask.translate(t2.left,t2.top);

t3 = autoRightTopXY(aItem3, bItem3);
t4 = autoLeftTopXY(aItem4, bItem4);
newLMask2.translate(t3.left,t3.top);
newRMask2.translate(t4.left,t4.top);


//	var data = readCsvToObj2(file);
//將右袖移動至右前點位置
var file = checkForDataCsv2();
var data = readCsvToObj(file);
var anchor = data["右前點"].split(',');

//右袖底色
bound_R= getBounds(bItem2);

//  呼叫範例：建立一個點在 x=100, y=200，並命名
point = createAnchorPoint(bound_R.centerX, bound_R.top, "右袖前面旋轉點");
point.move(B, ElementPlacement.PLACEATEND);
point.selected = true;

rotateFrom90ToSlope(data["右前點_斜率"],B,anchor,-1);
topCenterXYByEllipse(anchor,point,B);

newShape = aItem2.duplicate();
replaceClippingByName(newRMask,"底色",newShape);

//將旋轉左袖移動至右前點位置
var anchor = data["左前點"].split(',');
//右袖底色
bound_L= getBounds(bItem1);

//  呼叫範例：建立一個點在 x=100, y=200，並命名
point = createAnchorPoint(bound_L.centerX, bound_L.top, "左袖前面旋轉點");
point.move(A, ElementPlacement.PLACEATEND);
point.selected = true;

rotateFrom90ToSlope(data["左前點_斜率"],A,anchor,1);
topCenterXYByEllipse(anchor,point,A);

//放大後不正確的遮罩底色置換成袖子的底色
newShape = aItem1.duplicate();
replaceClippingByName(newLMask,"底色",newShape);



//=============================
var anchor = data["右後點"].split(',');

//右袖底色
bound_R2= getBounds(bItem4);

//  呼叫範例：建立一個點在 x=100, y=200，並命名
point = createAnchorPoint(bound_R2.centerX, bound_R2.top, "右袖後面旋轉點");
point.move(D, ElementPlacement.PLACEATEND);
point.selected = true;

rotateFrom90ToSlope(data["右後點_斜率"],D,anchor,1);
topCenterXYByEllipse(anchor,point,D);

newShape = aItem4.duplicate();
replaceClippingByName(newRMask2,"底色",newShape);


var anchor = data["左後點"].split(',');

//右袖底色
bound_L2= getBounds(bItem3);

//  呼叫範例：建立一個點在 x=100, y=200，並命名
point = createAnchorPoint(bound_L2.centerX, bound_L2.top, "左袖後面旋轉點");
point.move(C, ElementPlacement.PLACEATEND);
point.selected = true;

rotateFrom90ToSlope(data["左後點_斜率"],C,anchor,-1);
topCenterXYByEllipse(anchor,point,C);

newShape = aItem3.duplicate();
replaceClippingByName(newLMask2,"底色",newShape);


mylogo = getGroupByTwoLevel("裁切", "前片", "logo");
//ElementPlacement.PLACEBEFORE
mylogo.move(frontCloth, ElementPlacement.PLACEATBEGINNING);
createClippingGroupWithMask();

function deleteLayerByName(layerName) {
    var doc = app.activeDocument;
    try {
        var targetLayer = doc.layers.getByName(layerName);

        // 解除鎖定與顯示狀態（包含其子物件）
        unlockAndShowAllItems(targetLayer);

        // 刪除整個圖層
        targetLayer.remove();
    } catch (e) {
        alert("找不到圖層：" + layerName);
    }
}

function unlockAndShowAllItems(layer) {
    layer.locked = false;
    layer.visible = true;
    for (var i = 0; i < layer.pageItems.length; i++) {
        var item = layer.pageItems[i];
        item.locked = false;
        item.hidden = false;
    }
}

deleteLayerByName("縫份");
deleteLayerByName("外框");
function listPageItemsInLayer(layerName) {
    var doc = app.activeDocument;
    try {
        var layer = doc.layers.getByName(layerName);
        scale = 45;
        for (var i = 0; i < layer.pageItems.length; i++) {
            var item = layer.pageItems[i];
            if(("後片外框" == item.name) || ("前片外框" == item.name)){
              item.resize(scale,scale,true,true,true,true,0);
            }else{
              item.resize(scale,scale,true,true,true,true,scale);
            }

            if(("後片外框" == item.name) || ("剪裁群組後面" == item.name)){
              item.rotate(180,true,true,true,true,Transformation.CENTER);
            }
        }
    } catch (e) {
        alert("找不到圖層: " + layerName);
    }
}
listPageItemsInLayer("裁切");

//newItem.resize(scale,scale,true,true,true,true,scale);
//item.move(newGroup, ElementPlacement.PLACEATBEGINNING);


// copySelectionToDocCenter(doc,doc.selection,doc2);
// try {
//   var epsFile = doc2.fullName;
//   var saveOpts  = new EPSSaveOptions();
//   saveOpts.cmykPostScript = true;
//   saveOpts.embedAllFonts = true;
//   doc2.saveAs(epsFile,saveOpts);
// } catch (e) {
//     alert("儲存失敗：" + e.message);
// }
//
// closeActiveDocumentQuietly();
