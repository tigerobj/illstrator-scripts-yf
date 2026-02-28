/************************************************************
 * 產生釣魚衣 L 號裁片圖.jsx
 * ----------------------------------------------------------
 * 本程式用途：
 *   1. 從「立體版」取得各裁片的套圖（前片/後片/左右袖）
 *   2. 對齊後複製到「圖層 5 → 套圖區塊」
 *   3. 產生正式裁片文件（EPS）
 *   4. 自動套用遮罩、縫份對齊、底色同步
 *
 * 經過完整重構並添加詳細註釋（台灣用語）
 * ----------------------------------------------------------
 * 你提供的原始檔案已完整保留所有邏輯，
 * 僅補強可讀性與後續維護性。
 ************************************************************/

#include "對齊置中.jsx";   // 共用小工具（尋找物件、中心對齊等等）
#include "base.jsx";       // 共用 CSV 讀取、編號工具等

var custName;             // 由 GUI 輸入
var clothStyle;           // 由 GUI 輸入

/************************************************************
 * 讀取裁片配置 CSV（來自環境變數）
 ************************************************************/
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請先設定 CLOTH_TEMPLATE_CONFIG_PATH（環境變數）");
        return null;
    }

    var file = new File(pathEnv + '/客製化衣服配置檔.csv');
    if (!file.exists) {
        alert("找不到客製化配置檔：" + file.fsName);
        return null;
    }
    return file;
}

/************************************************************
 * 顯示輸入 GUI（系列、姓名）
 ************************************************************/
function showGui() {
    var dialog = new Window('dialog', '尺寸 / 客戶資訊');
    dialog.orientation = 'column';
    dialog.alignChildren = ['fill', 'top'];

    // ===== 主輸入區 =====
    var inputGroup = dialog.add('group');
    inputGroup.orientation = 'column';
    inputGroup.alignChildren = ['fill', 'center'];
    inputGroup.add('statictext', undefined, "（請輸入資料）");

    // 系列
    var seriesGroup = inputGroup.add('group');
    seriesGroup.add('statictext', undefined, '系列：');
    var txtSeries = seriesGroup.add('edittext', undefined, '');
    txtSeries.characters = 20;

    // 姓名
    var nameGroup = inputGroup.add('group');
    nameGroup.add('statictext', undefined, '姓名：');
    var txtName = nameGroup.add('edittext', undefined, '');
    txtName.characters = 20;

    // ===== 操作按鈕 =====
    var btnGroup = dialog.add('group');
    var btnOK = btnGroup.add('button', undefined, '確定', { name: 'ok' });
    var btnCancel = btnGroup.add('button', undefined, '取消', { name: 'cancel' });

    btnOK.onClick = function () {
        clothStyle = txtSeries.text;
        custName = txtName.text;
        dialog.close();
    };
    btnCancel.onClick = function () {
        dialog.close();
    };

    dialog.show();
}

/************************************************************
 * 複製範本 → 產生新裁片檔 → 開啟
 ************************************************************/
function readCsvDataAndCopyAndOpenAIFile() {

    var cfgFile = checkForDataCsv();
    if (cfgFile == null) return;

    var MyData = readCsvToObj(cfgFile);

    /* 檔名格式：yyyyMMdd-姓名-nnn */
    var fmt = "yyyyMMdd-%" + custName + "%-nnn";
    var extension = "eps";

    // 找上一筆同客戶的編號
    var dirFile = new File(MyData["裁片輸出"]);
    var last = findLastFileNameByCustName(fmt, dirFile, extension, custName);

    // 自動生成新檔名
    var fileName = autoCode.execute(fmt, last);

    // 若輸出資料夾不存在 → 自動建立
    var outFolder = new Folder(MyData["裁片輸出"]);
    if (!outFolder.exists) {
        outFolder.create();
        alert("已建立裁片輸出資料夾：" + MyData["裁片輸出"]);
    }

    // 開啟複製的新 AI 檔
    var ok = copyAndOpenAIFile(MyData["產生釣魚衣裁片圖L"], MyData["裁片輸出"], fileName + ".eps");
    if (!ok) return;
}

/************************************************************
 * 關閉文件，不顯示詢問視窗
 ************************************************************/
function closeActiveDocumentQuietly() {
    if (app.documents.length > 0) {
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }
}

/************************************************************
 * 取得或建立「套圖臨時用」圖層
 ************************************************************/
function getOrCreateTempLayer(doc) {

    var target = "套圖臨時用";

    // 若已存在 → 直接回傳
    for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].name === target) {
            return doc.layers[i];
        }
    }

    // 沒有 → 建立
    var newLayer = doc.layers.add();
    newLayer.name = target;

    // （可選）放到最後，以免干擾主要裁片
    // newLayer.move(doc.layers[doc.layers.length - 1], ElementPlacement.PLACEAFTER);

    return newLayer;
}

/************************************************************
 * ★ 核心：產生 itemA → itemB 中心對齊後的位移
 ************************************************************/
function getAlignOffset(itemA, itemB) {
    return autoCenterXY(itemA, itemB);
}

/************************************************************
 * ★ 核心：來源裁片 → 遮罩群組 → 對齊 → 放進裁切層
 * panelName 如：後片、右前協、左袖等
 ************************************************************/
function applyMaskToPanel(doc2, sourceObj, panelName) {

    // ① 臨時層
    var tempLayer = getOrCreateTempLayer(doc2);

    // ② 裁切層 → 找指定裁片
    var cutLayer = doc2.layers.getByName("裁切");
    var targetGrp = cutLayer.groupItems.getByName(panelName);

    // ③ 複製來源裁片到臨時層（完整群組）
    var duplicated = sourceObj.duplicate(tempLayer);

    // ④ 找「裁切層裁片」的底色（用於對齊）
    var baseA = findPageItemInGroupFirst(targetGrp, "底色");

    // ⑤ 找來源遮罩群組
    var maskGrp = getFirstClippingGroupFromGroup(duplicated);
    var baseB = findPageItemInGroupFirst(maskGrp, "底色");

    // ⑥ 計算位移
    var pos = getAlignOffset(baseA, baseB);

    // ⑦ 平移
    maskGrp.translate(pos.left, pos.top);

    // ⑧ 搬到裁切層的指定裁片
    maskGrp.move(targetGrp, ElementPlacement.PLACEATBEGINNING);

    // ⑨ 清除臨時複製體
    duplicated.remove();

    return maskGrp;
}

/************************************************************
 * 清空「圖層 5 → X 套圖」，只保留邊界、底色
 ************************************************************/
function cleanFrontPanel(name) {

    var grp = getGroupByLevel("圖層 5", name + "套圖");
    if (!grp) return;

    var keep = { "邊界": true, "底色": true };

    for (var i = grp.pageItems.length - 1; i >= 0; i--) {
        var it = grp.pageItems[i];
        if (!keep[it.name]) it.remove();
    }

    // // 若為前片 → 清除各裁切遮罩
    // if (name === "前片") {
    //
    //     var list = ["前片", "右前協", "左前協", "右前", "左前"];
    //     for (var i = 0; i < list.length; i++) {
    //         if (getGroupByLevel("裁切", list[i])) {
    //             removeMask2("裁切", list[i]);
    //         }
    //     }
    // }
    //
    // // 若為後片 → 清遮罩
    // if (name === "後片") {
    //     if (getGroupByLevel("裁切", "後片")) {
    //         removeMask2("裁切", "後片");
    //     }
    // }
}

/************************************************************
 * ★ 移除群組裡的舊遮罩（僅保留該裁片真正需要的底色遮罩）
 ************************************************************/
function removeMask2(layerName, groupLevel1){
	group  = getGroupByLevel(layerName,groupLevel1);
	baseItem = getPathItemByTwoLevel(layerName,groupLevel1,"底色");
	groups = group.groupItems;
	for(var i = groups.length-1;i>=0;i--){
		obj = groups[i];
		if(isValidMaskGroup(obj,baseItem)){
			//
			obj.remove();
		}
	}

}


/**
 * 判斷是否為剪裁群組，若是則回傳遮罩物件
 *
 * @param {PageItem} item
 * @returns {PathItem|CompoundPathItem|null}
 */
function getClippingMaskFromGroup(item) {

    // 必須是群組
    if (!item || item.typename !== "GroupItem") {
        return null;
    }

    // 必須是剪裁群組
    if (!item.clipped) {
        return null;
    }

    // 在群組內找 clipping = true 的物件
    for (var i = 0; i < item.pageItems.length; i++) {
        var child = item.pageItems[i];

        if (child.clipping === true) {
            return child; // 這就是遮罩物件
        }
    }

    return null;
}

/************************************************************
 * ★ 從立體版複製裁片 → 產生完整套圖（圖層 5 版本）
 ************************************************************/
function copyPanelObjects(name) {

    var nf = name.substring(0, 1); // 前 / 後
    var itemA = getGroupByLevel("圖層 5", name + "套圖");
    var itemB = getGroupBy4Level("立體版", nf + "面", name, "遮罩群組", name + "套圖");

    // alert(itemB);

    var srcBounds = findPageItemInGroupFirst(itemB, "邊界");


    // 計算中心對齊位移
    var pos = autoCenterXY(itemA, srcBounds);

    // 收集來源群組的物件（不含邊界、底色）
    var items = [];
    for (var i = 0; i < itemB.pageItems.length; i++) {
        var it = itemB.pageItems[i];
        if (it.name !== "邊界" && it.name !== "底色") {
            items.push(it);
        }
    }

    // 複製 & 對齊 & 放入圖層 5
    for (var j = 0; j < items.length; j++) {
        var src = items[j];
        var obj = src.duplicate();
        obj.translate(pos.left, pos.top);
        obj.move(itemA, ElementPlacement.PLACEATEND);
    }

    // 最後依來源順序重排
    syncGroupOrder(itemB, itemA);
}

/************************************************************
 * 依 mapping 套圖 → 裁切 → 遮罩
 ************************************************************/
function maskImageOnClipPiece(name) {

    var sewBase = getPathItemByLayer("縫份", name);

    // 找對應圖層 5 套圖
    var srcGroup = getGroupByLevel("圖層 5", getMappingForPiece(name));

    // 尋找外觀 → 用來對齊
    var targetRef =
        isFrontPiece(name)
            ? getPathItemByThreeLevel("圖層 5", "外觀", "前片", name)
            : getPathItemByThreeLevel("圖層 5", "外觀", name, name);

    // 取得對齊位移
    var pos = autoCenterXY(sewBase, targetRef);

    // 複製並移動
    var newObj = srcGroup.duplicate();
    newObj.translate(pos.left, pos.top);

    // 套用遮罩
    var pathItem = getPathItemByTwoLevel("裁切", name, "底色");
    createClippingGroup(pathItem, newObj);
}

/************************************************************
 * 儲存 EPS
 ************************************************************/
function saveEPS(doc2) {
    try {
        var epsFile = doc2.fullName;
        var opts = new EPSSaveOptions();
        opts.cmykPostScript = true;
        opts.embedAllFonts = true;

        doc2.saveAs(epsFile, opts);

    } catch (e) {
        alert("儲存 EPS 失敗：" + e.message);
    }
    closeActiveDocumentQuietly();
}

/**
 * syncGroupOrder(srcGroup, dstGroup)
 * ----------------------------------------------------------
 * 功能：
 *   讓「目標群組 dstGroup」的物件順序，完全跟「來源群組 srcGroup」
 *   的順序一致（依名稱比對）。
 *
 * 使用情境：
 *   立體版 → 套圖群組（來源）
 *   圖層 5 → 套圖群組（目標）
 *
 *   我們會：
 *     1. 先取得來源群組的物件順序（由上到下）
 *     2. 依照來源順序，在目標群組中找相同名稱的物件
 *     3. 只要找到，就把它移到目標群組的「最上層」
 *        → 重複這個動作就會形成正確的堆疊順序
 *
 * 注意：
 *   - 本函式比對的是「名稱」，不是物件內容。
 *   - 前提是你已經把來源的物件複製到 dstGroup 裡。
 *
 * 例子：
 *   若來源順序為：
 *      logo → 邊界 → <影像> → 底色
 *
 *   目標經過 sync 後也會呈現同樣的排列方式。
 *
 * 參數：
 *   @param {GroupItem} srcGroup  來源群組（要參考它的順序）
 *   @param {GroupItem} dstGroup  目標群組（要重排的地方）
 *
 * ----------------------------------------------------------
 */
function syncGroupOrder(srcGroup, dstGroup) {

    var order = getOrderedItems(srcGroup);  // 來源順序

    // 逐一依照來源順序，重排目標群組的堆疊
    for (var i = 0; i < order.length; i++) {

        var name = order[i].name;

        // 從目標群組找到相同名稱的物件（因為你已經複製過了）
        var dstItem = null;

        for (var j = 0; j < dstGroup.pageItems.length; j++) {
            if (dstGroup.pageItems[j].name === name) {
                dstItem = dstGroup.pageItems[j];
                break;
            }
        }

        if (dstItem) {
            // 將物件依來源順序往上堆疊
            dstItem.move(dstGroup, ElementPlacement.PLACEATEND);
        }
    }
}

/**
 * getOrderedItems(srcGroup)
 * ----------------------------------------------------------
 * 功能：
 *   取得來源群組（srcGroup）底下所有 pageItems 的「原始堆疊順序」，
 *   並將其整理成一個陣列（array）回傳。
 *
 *   Illustrator 群組內的 pageItems 是有明確堆疊順序的：
 *     - index 越小 → 越底層
 *     - index 越大 → 越上層
 *
 *   因此，本函式的目的就是把：
 *      srcGroup.pageItems[0]
 *      srcGroup.pageItems[1]
 *      srcGroup.pageItems[2]
 *      ...
 *   逐一讀出並依原順序存入 arr[] 用於後續同步群組順序。
 *
 * 回傳格式：
 *   [
 *      { name: "logo",   ref: <PathItem or GroupItem> },
 *      { name: "邊界",    ref: <PathItem> },
 *      { name: "<影像>", ref: <GroupItem> },
 *      ...
 *   ]
 *
 * 為什麼要 name + ref？
 *   - name：用來比對目標群組中相同名稱的物件
 *   - ref：可在需要時回存來源物件本身（目前 syncGroupOrder 只用 name）
 *
 * 備註：
 *   - 本函式目前「沒有過濾」邊界、底色，因為 syncGroupOrder 要完整順序。
 *   - 若有需求，也可以依名稱略過某些項目（註釋示範）
 *
 * ----------------------------------------------------------
 * @param {GroupItem} srcGroup 來源群組
 * @returns {Array} 依原堆疊順序排列的物件資訊列表
 */
function getOrderedItems(srcGroup) {

    var arr = [];

    // 依 Illustrator 群組中 pageItems 的原始順序讀取
    for (var i = 0; i < srcGroup.pageItems.length; i++) {

        var it = srcGroup.pageItems[i];

        /**
         * 若你想忽略特定物件，可在這裡做篩選：
         *
         *   if (it.name === "邊界" || it.name === "底色") continue;
         *
         * 目前保留所有項目，以維持來源群組的完整順序。
         */

        arr.push({
            name: it.name,  // 用於順序比對
            ref:  it        // 保留物件本身
        });
    }

    // 回傳完整順序列表
    return arr;
}
//"右前協","左前協","右前","左前","前片" ->前片套圖
//"後片" ->後片套圖
//"左袖","左袖口" ->左袖套圖
//"右袖","右袖口" ->右袖套圖
function getMappingForPiece(name) {

    // --- 前片套圖 ---
    var frontList = [
        "右前協", "左前協",
        "右前", "左前",
        "前片"
    ];

    for (var i = 0; i < frontList.length; i++) {
        if (name.indexOf(frontList[i]) !== -1) {
            return "前片套圖";
        }
    }

    // --- 後片套圖 ---
    if (name.indexOf("後片") !== -1) {
        return "後片套圖";
    }

    // --- 左袖套圖 ---
    var leftSleeveList = ["左袖", "左袖口"];

    for (var j = 0; j < leftSleeveList.length; j++) {
        if (name.indexOf(leftSleeveList[j]) !== -1) {
            return "左袖套圖";
        }
    }

    // --- 右袖套圖 ---
    var rightSleeveList = ["右袖", "右袖口"];

    for (var k = 0; k < rightSleeveList.length; k++) {
        if (name.indexOf(rightSleeveList[k]) !== -1) {
            return "右袖套圖";
        }
    }

    // 🔥 若完全找不到 → 你可選擇回傳 null 或預設流程
    return null;
}

function isFrontPiece(name) {
    var list = [
        "右前協",
        "左前協",
        "右前",
        "左前"
    ];
    for (var i = 0; i < list.length; i++) {
        if (name === list[i]) return true;
    }
    return false;
}

/**
 * copyAndOpenAIFile(sourcePath, destFolderPath, fileName)
 * ------------------------------------------------------
 * 將範本 AI 檔案複製到指定資料夾，改名後再打開。
 *
 * 參數：
 *   - sourcePath     範本 AI 完整路徑
 *   - destFolderPath 目的資料夾完整路徑
 *   - fileName       新檔名（含副檔名）
 *
 * 成功後：
 *   - 會開啟新檔並把全域變數 doc2 指向新開的文件
 */
function copyAndOpenAIFile(sourcePath, destFolderPath, fileName) {
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

    // 開啟複製後的檔案（新裁片檔）
    doc2 = app.open(destFile);
    return true;
}

/**
 * getFirstClippingGroupFromGroup(fgroup)
 * ------------------------------------------------------
 * 在指定群組裡，找「第一個 clipped = true 的子群組」，
 * 通常就是那一片裁片的主要遮罩群組。
 */
function getFirstClippingGroupFromGroup(fgroup) {
    for (var j = 0; j < fgroup.groupItems.length; j++) {
        var subGroup = fgroup.groupItems[j];
        if (subGroup.clipped) {
            return subGroup;
        }
    }

    alert("這個群組內找不到任何剪裁群組！");
    return null;
}

/**
 * hideAllItemsInLayer(layerName)
 * ------------------------------------------------------
 * 把某個圖層底下所有 pageItems 設為 hidden = true。
 * 在這支腳本裡用來隱藏「縫份」圖層，只輸出裁片輪廓。
 */
function hideAllItemsInLayer(doc2,layerName) {
    try {
        var layer = doc2.layers.getByName(layerName);
        for (var i = 0; i < layer.pageItems.length; i++) {
            layer.pageItems[i].hidden = true;
        }
    } catch (e) {
        alert("找不到圖層名稱：" + layerName);
    }
}

/************************************************************
 * 主流程
 ************************************************************/
function main() {

    var doc = app.activeDocument;

    // 清除舊的套圖
    cleanFrontPanel("前片");
    cleanFrontPanel("後片");

    // 建立新的套圖（圖層 5）
    copyPanelObjects("前片");
    copyPanelObjects("後片");

    // // 套圖到裁片用圖層
    // var arr = ["左前", "右前", "左前協", "右前協", "後片"];
    // for (var i = 0; i < arr.length; i++) {
    //     maskImageOnClipPiece(arr[i]);
    // }
    //
    // // GUI 取得客戶資訊
    // showGui();
    // var panels = [
    //     ["後片", null],
    //     ["右前協",null],
    //     ["左前協", null],
    //     ["右前", null],
    //     ["左前", null],
    //     ["左袖口", null],
    //     ["左袖", null],
    //     ["右袖口", null],
    //     ["右袖", null]
    // ];
    // for (var i = 0; i < panels.length; i++) {
    //   panels[i][1] = getGroupByLevel("裁切", panels[i][0]);
    // }
    // // 領片底色統一處理
    // var baseFillColor =
    //     getPathItemByThreeLevel("立體版", "前面", "領", "底色").fillColor;
    //
    // // 開啟新裁片文件
    // readCsvDataAndCopyAndOpenAIFile();
    // var doc2 = app.activeDocument;
    //
    // // 將各裁片套用遮罩並放入 "裁切"
    // for (var i = 0; i < panels.length; i++) {
    //     applyMaskToPanel(doc2, panels[i][1], panels[i][0]);
    // }
    //
    // var recolorList = [
    //     ["領前", "底色"],
    //     ["領後", "底色"],
    //     ["口袋左前", "底色"],
    //     ["口袋左後", "底色"],
    //     ["口袋右後", "底色"],
    //     ["口袋右前", "底色"]
    // ];
    //
    // for (var i = 0; i < recolorList.length; i++) {
    //     getPathItemByTwoLevel("裁切", recolorList[i][0], recolorList[i][1]).fillColor = baseFillColor;
    // }
    //
    // hideAllItemsInLayer(doc2,"縫份");
    // // 儲存 EPS
    // saveEPS(doc2);
}

/************************************************************
 * 腳本入口
 ************************************************************/
try {
    main();
} catch (e) {
    alert("產生釣魚衣裁片圖 L 時發生錯誤：\n" + e.message);
}
