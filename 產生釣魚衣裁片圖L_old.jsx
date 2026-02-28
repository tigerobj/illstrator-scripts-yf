#include "對齊置中.jsx";  // 共用：對齊、找物件等工具
#include "base.jsx";      // 共用：CSV、單位換算、自動編號等工具
var custName;
/**
 * checkForDataCsv()
 * ------------------------------------------------------
 * 讀取 CLOTH_TEMPLATE_CONFIG_PATH 環境變數，
 * 確認裡面是否有「客製化衣服配置檔.csv」。
 *
 * 回傳：
 *   - 找到：回傳 File 物件
 *   - 找不到或沒設定環境變數：alert 提示並回傳 null
 */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請先在系統環境變數設定 CLOTH_TEMPLATE_CONFIG_PATH 再執行腳本");
        return null;
    }

    var file = new File(pathEnv + '/客製化衣服配置檔.csv');
    if (!file.exists) {
      alert(pathEnv + '/衣服配置檔.csv 檔案不存在！\n請先複製「衣服配置檔.csv」到該資料夾再重新執行。');
      return null;
    }
    return file;
}

/**
 * showGui()
 * ------------------------------------------------------
 * 顯示一個簡單輸入視窗，讓你輸入：
 *   - 系列（clothStyle）
 *   - 姓名（custName）
 *
 * 輸入完成按「確定」後，會把值寫進全域變數：
 *   - clothStyle
 *   - custName
 */
function showGui() {
    var dialog = new Window('dialog', '尺寸 / 客戶資訊');

    dialog.orientation = 'column';
    dialog.alignChildren = ['fill', 'top'];

    // 主區塊
    var mainGroup = dialog.add('group');
    mainGroup.orientation = 'row';
    mainGroup.alignChildren = ['fill', 'fill'];

    // 左側 panel（只是視覺標題用）
    var contentPanel = mainGroup.add('panel', undefined, '基本資訊');
    contentPanel.orientation = 'column';
    contentPanel.alignChildren = ['fill', 'fill'];

    // 系列
    var lblNumber = mainGroup.add('statictext', undefined, '系列：');
    lblNumber.alignment = ['left', 'center'];
    var numberText = mainGroup.add('edittext', undefined, '', { readonly: false });
    numberText.characters = 20;
    numberText.alignment = ['fill', 'center'];

    // 姓名
    var lblName = mainGroup.add('statictext', undefined, '姓名：');
    lblName.alignment = ['left', 'center'];
    var nameText = mainGroup.add('edittext', undefined, '', { readonly: false });
    nameText.characters = 20;
    nameText.alignment = ['fill', 'center'];

    // 下方按鈕區
    var dataGroup = dialog.add('group');
    dataGroup.orientation = 'row';
    dataGroup.alignChildren = ['left', 'center'];
    dataGroup.alignment = ['fill', 'top'];

    dataGroup.add('panel', undefined, '動作');

    var okButton = dataGroup.add('button', undefined, '確定', { name: 'ok' });
    var cancelButton = dataGroup.add('button', undefined, '取消', { name: 'cancel' });

    okButton.onClick = function () {
        clothStyle = numberText.text;
        custName = nameText.text;
        dialog.close();
    };

    cancelButton.onClick = function () {
        dialog.close();
    };

    dialog.layout.layout(true);
    dialog.show();
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
 * closeActiveDocumentQuietly()
 * ------------------------------------------------------
 * 關閉目前 activeDocument，不儲存、不再跳出詢問視窗。
 * 避免批次跑完還一堆「是否儲存」對話框。
 */
function closeActiveDocumentQuietly() {
    if (app.documents.length > 0) {
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    } else {
        alert("目前沒有開啟的文件。");
    }
}

/**
 * replaceClippingByName(groupItem, oldName, newShape, destLayer)
 * ------------------------------------------------------
 * 在一個「遮罩群組」裡面，把特定名稱（oldName）的 clipping path 換成新圖形。
 *
 * 用途：
 *   - 以新的「底色外框」當遮罩來裁片
 */
function replaceClippingByName(groupItem, oldName, newShape, destLayer) {
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

    // 移入新的遮罩圖形
    var newMask = newShape;
    newMask.move(groupItem, ElementPlacement.PLACEATBEGINNING);
    newMask.clipping = true;
    newMask.name = oldName;

    // 刪掉舊遮罩
    oldClip.remove();

    // 確保群組還是遮罩狀態
    groupItem.clipped = true;
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

function readCsvDataAndCopyAndOpenAIFile(){
  var cfgFile = checkForDataCsv();
  if (cfgFile == null) {
      return; // 找不到設定檔就直接結束
  }

  var MyData = readCsvToObj(cfgFile);
  // 檔名格式：yyyyMMdd-姓名-001、002、003...
  var fmt = "yyyyMMdd-%" + custName + "%-nnn";
  var extension = "eps";

  var dirFile = new File(MyData["裁片輸出"]);
  var last = findLastFileNameByCustName(fmt, dirFile, extension, custName);
  var fileName = autoCode.execute(fmt, last);

  // 確保輸出資料夾存在
  var outFolder = new Folder(MyData["裁片輸出"]);
  if (!outFolder.exists) {
      outFolder.create();
      alert("已建立輸出資料夾：" + MyData["裁片輸出"]);
  }
  if (!copyAndOpenAIFile(MyData["產生釣魚衣裁片圖L"], MyData["裁片輸出"], fileName + ".eps")) {
      return;
  }
}

/**
 * 清空前片套圖：保留「邊界」與「底色」
 */
function cleanFrontPanel(name) {

      var grp = getGroupByLevel("圖層 5", name+"套圖");
      if (!grp) {
          alert("找不到：圖層 5 -> "+name+"套圖");
          return;
      }
      var keepNames = {
          "邊界": true,
          "底色": true
      };
      for (var i = grp.pageItems.length - 1; i >= 0; i--) {
          var it = grp.pageItems[i];
          // 安全判斷：如果名稱是要保留的就略過
          if (keepNames[it.name] === true) continue;
          it.remove();
      }
      if("前片" === name){
        if(getGroupByLevel("裁切","前片")){
        		removeMask2("裁切","前片");
        }

        if(getGroupByLevel("裁切","右前協")){
        		removeMask2("裁切","右前協");
        }
        if(getGroupByLevel("裁切","左前協")){
        		removeMask2("裁切","左前協");
        }
        if(getGroupByLevel("裁切","右前")){
        		removeMask2("裁切","右前");
        }
        if(getGroupByLevel("裁切","左前")){
        		removeMask2("裁切","左前");
        }
      }
      if("後片" === name){
        if(getGroupByLevel("裁切","後片")){
        		removeMask2("裁切","後片");
        }
      }


}

function getOrderedItems(srcGroup) {
    var arr = [];

    for (var i = 0; i < srcGroup.pageItems.length; i++) {
        var it = srcGroup.pageItems[i];

        // 如果來源群組不含邊界、底色，也可以改成保留
        // 若你要保留，可改用 if(it.name==="邊界" || it.name==="底色") continue;
        arr.push({
            name: it.name,
            ref: it
        });
    }

    return arr;  // 保留原順序
}


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
//前片
function copyPanelObjects(name){
  nf = name.substring(0, 1);
  itemA = getGroupByLevel("圖層 5", name+"套圖");
  itemB = getGroupBy4Level("立體版", nf+"面",name, "遮罩群組", name+"套圖");
  //單純回傳 itemB 要對齊 itemA 正中心的位移。
  var pos = autoCenterXY(itemA, itemB);
  // 先取得來源物件列表（保留順序）
  var items = [];
  for (var i = 0; i < itemB.pageItems.length; i++) {
      var it = itemB.pageItems[i];
      if (it.name !== "邊界" && it.name !== "底色") {
          items.push(it);
      }
  }

    // --- 逐一複製物件並對齊 ---
  for (var j = 0; j < items.length; j++) {
      var srcItem = items[j];
      var newObj = srcItem.duplicate();
      newObj.translate(pos.left, pos.top);
      newObj.move(itemA, ElementPlacement.PLACEATEND);
  }

  syncGroupOrder(itemB,itemA);

}

function maskImageOnClipPiece(name){


	itemA = getPathItemByLayer("縫份", name);
	//前片套圖,後片套圖,左袖套圖,右袖套圖
	itemOriginal = getGroupByLevel("圖層 5", getMappingForPiece(name));

	if (isFrontPiece(name)) {
	    itemB = getPathItemByThreeLevel("圖層 5", "外觀", "前片", name);
	} else {
	    itemB = getPathItemByThreeLevel("圖層 5", "外觀", name, name);
	}
	positionObj = autoCenterXY(itemA, itemB);
	itemC = itemOriginal.duplicate();
	itemC.translate(positionObj.left,positionObj.top);
	pathItem = getPathItemByTwoLevel("裁切", name,  "底色");
	createClippingGroup(pathItem,itemC);
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
 * 取得或建立「套圖臨時用」圖層
 */
function getOrCreateTempLayer(mydoc) {
    var targetName = "套圖臨時用";

    // 尋找是否已有這個圖層
    for (var i = 0; i < mydoc.layers.length; i++) {
        if (mydoc.layers[i].name === targetName) {
            return mydoc.layers[i]; // 已存在 → 回傳
        }
    }
    // 沒有 → 建立新圖層
    var newLayer = mydoc.layers.add();
    newLayer.name = targetName;

    // 推薦：放到最底層以避免干擾主要裁片
    // newLayer.move(mydoc.layers[mydoc.layers.length - 1], ElementPlacement.PLACEAFTER);

    return newLayer;
}

/**
 * 套圖 → 遮罩 → 對齊 → 放進裁切層的指定裁片
 * @param {Document} doc2       新開啟的裁片文件
 * @param {PageItem} sourceObj  來源裁片（如 backPanel）
 * @param {String}   panelName  裁片名稱（如 "後片", "前片", "左袖"）
 * @returns {GroupItem}         回傳完成定位後的群組
 */
function applyMaskToPanel(doc2, sourceObj, panelName) {

    // ① 取得臨時層與裁切層
    var tempLayer = getOrCreateTempLayer(doc2);
    var cutLayer  = doc2.layers.getByName("裁切");
    var targetGrp = cutLayer.groupItems.getByName(panelName);  // 例如 裁切 → 後片

    // ② 複製來源裁片到「套圖臨時用」
    var duplicated = sourceObj.duplicate(tempLayer);

    // ③ 找出目標裁片的底色（用來對齊）
    var itemA = findPageItemInGroupFirst(targetGrp, "底色");

    // ④ 找出來源裁片遮罩群組的第一個遮罩群組
    var maskGrp = getFirstClippingGroupFromGroup(duplicated);

    // 來源底色
    var itemB = findPageItemInGroupFirst(maskGrp, "底色");

    // ⑤ 計算 A（目標裁片） 與 B（來源裁片）中心點位移
    var pos = autoCenterXY(itemA, itemB);

    // ⑥ 平移來源群組至正中
    maskGrp.translate(pos.left, pos.top);

    // ⑦ 移入裁切 → panelName，例如裁切 → 後片
    maskGrp.move(targetGrp, ElementPlacement.PLACEATBEGINNING);

    duplicated.remove();
    return maskGrp; // 方便後面繼續處理
}


/**
 * main()
 * ------------------------------------------------------
 * 產生「釣魚衣 L 號裁片圖」的主要流程：
 *   1. 從立體版抓領口底色、前後片、袖子的遮罩群組
 *   2. 讓使用者輸入系列 / 姓名，從配置 CSV 算出輸出檔名
 *   3. 複製圓領 T L 號裁片範本到輸出資料夾並開啟
 *   4. 把立體版的遮罩套用到新檔的裁片上，並依縫份對齊
 *   5. 調整袖子遮罩位置
 *   6. 把領滾條、領片的底色改成和立體版一樣
 *   7. 隱藏縫份圖層、調整 logo 順序
 *   8. 以 EPS 覆寫儲存，再關閉新檔
 */
function main() {
    var doc = app.activeDocument;
    var doc2;
    //要產生裁片時,先清除前後片套圖,裁片圖
    cleanFrontPanel("前片");
    cleanFrontPanel("後片");
    //複製前後片立體圖到前後片套圖
    copyPanelObjects("前片");
    copyPanelObjects("後片");
    //複製前後片套圖到裁片
    maskImageOnClipPiece("左前");
  	maskImageOnClipPiece("右前");
  	maskImageOnClipPiece("左前協");
  	maskImageOnClipPiece("右前協");
	  maskImageOnClipPiece("後片");

    var backPanel = getGroupByLevel("裁切", "後片");
    var rightFrontAssist = getGroupByLevel("裁切", "右前協");
    var leftFrontAssist = getGroupByLevel("裁切", "左前協");
    var rightFront = getGroupByLevel("裁切", "右前");
    var leftFront = getGroupByLevel("裁切", "左前");
    var leftCuff = getGroupByLevel("裁切", "左袖口");
    var leftSleeve = getGroupByLevel("裁切", "左袖");
    var rightCuff = getGroupByLevel("裁切", "右袖口");
    var rightSleeve = getGroupByLevel("裁切", "右袖");
    var baseFillColor = getPathItemByThreeLevel("立體版", "前面", "領", "底色").fillColor;

    showGui(); // 寫入上面兩個全域變數
    // 3. 複製範本裁片檔到輸出資料夾並開啟 --------------------------
    readCsvDataAndCopyAndOpenAIFile();
    doc2 = app.activeDocument; // 新開啟的裁片檔
    applyMaskToPanel(doc2,backPanel,"後片");
    applyMaskToPanel(doc2,rightFrontAssist,"右前協");
    applyMaskToPanel(doc2,leftFrontAssist,"左前協");
    applyMaskToPanel(doc2,rightFront,"右前");
    applyMaskToPanel(doc2,leftFront,"左前");
    applyMaskToPanel(doc2,leftCuff,"左袖口");
    applyMaskToPanel(doc2,leftSleeve,"左袖");
    applyMaskToPanel(doc2,rightCuff,"右袖口");
    applyMaskToPanel(doc2,rightSleeve,"右袖");
    getPathItemByTwoLevel("裁切", "領前", "底色").fillColor = baseFillColor;
    getPathItemByTwoLevel("裁切", "領後", "底色").fillColor = baseFillColor;
    getPathItemByTwoLevel("裁切", "口袋左前", "底色").fillColor = baseFillColor;
    getPathItemByTwoLevel("裁切", "口袋左後", "底色").fillColor = baseFillColor;
    getPathItemByTwoLevel("裁切", "口袋右後", "底色").fillColor = baseFillColor;
    getPathItemByTwoLevel("裁切", "口袋右前", "底色").fillColor = baseFillColor;
    //儲存EPS
    saveEPS(doc2);
}

function saveEPS(doc2){
  try {
      var epsFile = doc2.fullName;
      var saveOpts = new EPSSaveOptions();
      saveOpts.cmykPostScript = true;
      saveOpts.embedAllFonts = true;
      doc2.saveAs(epsFile, saveOpts);
  } catch (e) {
      alert("儲存 EPS 失敗：" + e.message);
  }
  closeActiveDocumentQuietly();
}

// ------------------------------------------------------
// 腳本入口點
// ------------------------------------------------------
try {
    main();
} catch (e) {
    alert("產生釣魚衣裁片圖 L 時發生錯誤：\n" + e.message);
}
