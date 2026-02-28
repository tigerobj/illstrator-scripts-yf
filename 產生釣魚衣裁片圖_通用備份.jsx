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
var clothSize;           // 由 GUI 輸入
var outputDoc;            //建立輸出檔案
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
 * 顯示輸入 GUI（尺寸、姓名）
 * - 尺寸使用下拉選單（S～5XL，可擴充）
 * - 姓名使用文字輸入
 ************************************************************/
function showGui() {

    // ===== 可擴充尺寸清單 =====
    // 👉 以後要加尺寸，只要改這個陣列
    var SIZE_LIST = [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "4XL",
        "5XL"
    ];

    var dialog = new Window('dialog', '尺寸 / 客戶資訊');
    dialog.orientation = 'column';
    dialog.alignChildren = ['fill', 'top'];

    // ===== 主輸入區 =====
    var inputGroup = dialog.add('group');
    inputGroup.orientation = 'column';
    inputGroup.alignChildren = ['fill', 'left'];

    inputGroup.add('statictext', undefined, "請輸入資料");

    // ===== 尺寸 =====
    var sizeGroup = inputGroup.add('group');
    sizeGroup.add('statictext', undefined, '尺寸：');

    var ddlSize = sizeGroup.add('dropdownlist', undefined, SIZE_LIST);
    ddlSize.selection = 0; // 預設選第一個（S）

    // ===== 姓名 =====
    var nameGroup = inputGroup.add('group');
    nameGroup.add('statictext', undefined, '姓名：');

    var txtName = nameGroup.add('edittext', undefined, '');
    txtName.characters = 20;

    // ===== 操作按鈕 =====
    var btnGroup = dialog.add('group');
    btnGroup.alignment = 'right';

    var btnOK = btnGroup.add('button', undefined, '確定', { name: 'ok' });
    var btnCancel = btnGroup.add('button', undefined, '取消', { name: 'cancel' });

    // ===== 按鈕事件 =====
    btnOK.onClick = function () {

        // 防呆
        if (!ddlSize.selection) {
            alert("請選擇尺寸");
            return;
        }

        if (txtName.text === "") {
            alert("請輸入姓名");
            return;
        }

        // 將結果存成全域或回傳用變數
        clothSize = ddlSize.selection.text;
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
    outputDoc = copyAndOpenAIFile(MyData["產生釣魚衣裁片圖"+clothSize], MyData["裁片輸出"], fileName + ".eps");
    if (!outputDoc) return;
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
 * 依 mapping 套圖 → 裁切 → 遮罩
 ************************************************************/
function maskImageOnClipPiece(pieceName,cfg) {
    var base = getGroupByLevel("裁切", pieceName);
    // 找對應圖層 5 套圖
    var srcGroup;
    // 尋找外觀 → 用來對齊
    var srcGroup = getGroupByTwoLevel("套圖臨時用", cfg.group,cfg.build.set);
    // var srcGroup = getGroupByTwoLevel("套圖臨時用", "前片群組","前片套圖");
    // 複製
    var newObj = srcGroup.duplicate();

    if("前片" === cfg.label || "左袖" === cfg.label || "右袖" === cfg.label){
      targetRef = getGroupByThreeLevel("套圖臨時用", cfg.templateGroupName, cfg.label, pieceName);
      // 取得對齊位移
      //單純回傳 targetRef 要對齊 sewBase 正中心的位移。
      var pos = autoCenterXY(base, targetRef);
      // 並移動
      newObj.translate(pos.left, pos.top);
    }else{
      baseItem = getPathItemByLayer("縫份", pieceName);
      templateGroup = getGroupByTwoLevel("套圖臨時用", cfg.group, pieceName);
      topCenterByTowItems(newObj, baseItem, templateGroup);
    }



    // 套用遮罩
    var pathItem = getPathItemByTwoLevel("裁切", pieceName, "底色");
    createClippingGroup(pathItem, newObj);
}

/************************************************************
 * 儲存 EPS
 ************************************************************/
function saveEPS(outputDoc) {
    try {
        var epsFile = outputDoc.fullName;
        var opts = new EPSSaveOptions();
        opts.cmykPostScript = true;
        opts.embedAllFonts = true;

        outputDoc.saveAs(epsFile, opts);

    } catch (e) {
        alert("儲存 EPS 失敗：" + e.message);
    }
    closeActiveDocumentQuietly();
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
 *   - 會開啟新檔並把全域變數 outputDoc 指向新開的文件
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
    outputDoc = app.open(destFile);
    return outputDoc;
}

/**
 * hideAllItemsInLayer(layerName)
 * ------------------------------------------------------
 * 把某個圖層底下所有 pageItems 設為 hidden = true。
 * 在這支腳本裡用來隱藏「縫份」圖層，只輸出裁片輪廓。
 */
function hideAllItemsInLayer(outputDoc,layerName) {
    try {
        var layer = outputDoc.layers.getByName(layerName);
        for (var i = 0; i < layer.pageItems.length; i++) {
            layer.pageItems[i].hidden = true;
        }
    } catch (e) {
        alert("找不到圖層名稱：" + layerName);
    }
}


var PANEL_CONFIG = {
    front: {
        label: "前片",
        scalePart: "front",
        group: "前片群組",
        // 【2】群組建立設定
        build: {
            set: "前片套圖"            // 套圖要抓哪些
        },

        // 【6】是否需要套圖範本
        useTemplate: true,
        templateGroupName: "前片範本",

        clipPieces: ["左前", "右前", "左前協", "右前協"]
    },

    back: {
        label: "後片",
        scalePart: "back",
        group: "後片群組",
        // 後片群組建立方式不同
        build: {
            set: "後片套圖"                     // ❗沒有後片套圖
        },

        // ❗後片不需要套圖範本
        useTemplate: false,

        clipPieces: ["後片"]
      },

      leftSleeve: {
          label: "左袖",
          scalePart: "sleeve",
          group: "左袖群組",
          // 後片群組建立方式不同
          build: {
              set: "左袖套圖"                     // ❗沒有後片套圖
          },

          // ❗後片不需要套圖範本
          useTemplate: true,
          templateGroupName: "左袖範本",
          clipPieces: ["左袖","左袖口"]
        },

        rightSleeve: {
            label: "右袖",
            scalePart: "sleeve",
            group: "右袖群組",
            // 後片群組建立方式不同
            build: {
                set: "右袖套圖"                     // ❗沒有後片套圖
            },

            // ❗後片不需要套圖範本
            useTemplate: true,
            templateGroupName: "右袖範本",
            clipPieces: ["右袖","右袖口"]
        }
};


/**
 * 依設定建立裁片群組（外觀 / 套圖）
 */
function buildPanelGroup(cfg) {

    var parentLayer = app.activeDocument.layers.getByName("圖層 5");
    var group = parentLayer.groupItems.add();
    group.name = cfg.label + "群組";
    var name = cfg.label;
    // 複製外觀群組
    if(("左袖" === name) || ("右袖"=== name)){
      s = group.groupItems.add();
      s.name = name;
      for (var i = 0; i < cfg.clipPieces.length; i++) {
        src = getGroupByTwoLevel("圖層 5", "外觀", cfg.clipPieces[i]);
        src.duplicate(s, ElementPlacement.PLACEATEND);
      }
    }else{
      src = getGroupByTwoLevel("圖層 5", "外觀", name);
      src.duplicate(group, ElementPlacement.PLACEATEND);
    }

    // 複製套圖群組（若有）

    var setName = cfg.build.set;
    var setGrp = getGroupByLevel("圖層 5", setName);
    setGrp.duplicate(group, ElementPlacement.PLACEATEND);


    return group;
}


/**
 * 指定 EPS 檔案路徑並開啟
 * @param {String} epsPath EPS 完整路徑
 * @returns {Document|null} 成功回傳 Document，失敗回傳 null
 */
function openEpsByPath(epsPath) {

    var epsFile = new File(epsPath);

    if (!epsFile.exists) {
        alert("EPS 檔案不存在：\n" + epsPath);
        return null;
    }

    return app.open(epsFile);
}


var SIZE_TABLE = {
    front: {
        L: 21.5,
        S: 19,
        M: 20.25,
        XL: 22.75,
        "2XL": 23.75,
        "3XL": 24.752,
        "4XL": 25.748,
        "5XL": 26.75
    },
    back: {
        L: 21.376,
        S: 18.876,
        M: 20.126,
        XL: 22.626,
        "2XL": 23.626,
        "3XL": 24.626,
        "4XL": 25.626,
        "5XL": 26.626
    },
    sleeve: {
        L: 18.098,
        S: 16.379,
        M: 17.25,
        XL: 18.946,
        "2XL": 19.797,
        "3XL": 20.644,
        "4XL": 21.342,
        "5XL": 22.041
    }
};

/**
 * 計算縮放百分比
 * --------------------------------------------------
 * @param {Number} baseSize   基準尺寸（通常是 L）
 * @param {Number} targetSize 目標尺寸（S / M / XL / 2L…）
 * @returns {Number} 縮放百分比（給 Illustrator resize 用）
 *
 * 例：
 *   baseSize = 21.5
 *   targetSize = 20.25
 *   → 回傳 94.186...
 */
function calcScalePercent(baseSize, targetSize) {
    return (targetSize / baseSize) * 100;
}

/**
 * 依部位 + 尺寸代碼計算縮放比
 */
function getScaleByPartAndSize(part, size) {
    var base = SIZE_TABLE[part].L;
    var target = SIZE_TABLE[part][size];
    return calcScalePercent(base, target);
}



function processPanel(part) {

    var cfg = PANEL_CONFIG[part];
    if (!cfg) {
        alert("未知裁片部位：" + part);
        return;
    }

    // 【2】建立群組（依 cfg）
    var panelGroup = buildPanelGroup(cfg);

    // 【3】縮放
    var scale = getScaleByPartAndSize(cfg.scalePart, clothSize);
    panelGroup.resize(scale, scale, true, true, true, true, scale);
    // 【4】開啟新裁片 EPS
    if(!outputDoc){
      readCsvDataAndCopyAndOpenAIFile();
    }

    app.activeDocument = outputDoc;

    // 【5】移到臨時圖層
    var tempLayer = getOrCreateTempLayer(outputDoc);
    var scaledPanel = panelGroup.duplicate(tempLayer);
    panelGroup.remove();

    // 【6】只有需要範本的部位才執行
    if (cfg.useTemplate) {

        var csv = readCsvToObj(checkForDataCsv());
        var templateDoc = openEpsByPath(
            csv["套圖釣魚衣裁片圖" + clothSize]
        );

        var templateGroup = getGroupByLevel("套圖", cfg.templateGroupName)
                                .duplicate(tempLayer);

        templateDoc.close(SaveOptions.DONOTSAVECHANGES);

        // 對齊
        var baseItem = findPageItemInGroupFirst(scaledPanel, cfg.label);
        topCenterByTowItems(templateGroup, baseItem, templateGroup);

    }

    // 【8】裁切套圖
    for (var i = 0; i < cfg.clipPieces.length; i++) {
        maskImageOnClipPiece(cfg.clipPieces[i],cfg);
    }

    // 【9】清理
    scaledPanel.remove();
}


/**
 * 刪除「套圖臨時用」整個圖層（含所有物件）
 */
function removeTempLayer() {

    var doc = app.activeDocument;
    var layerName = "套圖臨時用";

    for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].name === layerName) {
            doc.layers[i].remove();
            return;
        }
    }
}



/************************************************************
 * 主流程
 ************************************************************/
function main() {
    // 領片底色統一處理
    showGui();
    //沒有名字或尺寸就跳過
    if(!custName || !clothSize){
      return;
    }
    var baseFillColor = getPathItemByThreeLevel("立體版", "前面", "領", "底色").fillColor;
    mydoc = app.activeDocument;
    processPanel("front");
    app.activeDocument = mydoc;
    processPanel("back");
    app.activeDocument = mydoc;
    processPanel("rightSleeve");
    app.activeDocument = mydoc;
    processPanel("leftSleeve");
    var recolorList = [
        ["領前", "底色"],
        ["領後", "底色"],
        ["口袋左前", "底色"],
        ["口袋左後", "底色"],
        ["口袋右後", "底色"],
        ["口袋右前", "底色"]
    ];

    for (var i = 0; i < recolorList.length; i++) {
        getPathItemByTwoLevel("裁切", recolorList[i][0], recolorList[i][1]).fillColor = baseFillColor;
    }

    hideAllItemsInLayer(outputDoc,"縫份");
    removeTempLayer();
    saveEPS(outputDoc);
}

/************************************************************
 * 腳本入口
 ************************************************************/
try {
    main();
} catch (e) {
    alert("產生釣魚衣裁片圖 通用 時發生錯誤：\n" + e.message);
}
