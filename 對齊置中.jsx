#include "json2.js";

/**
 * log(input)
 * ------------------------------------------------------
 * 記錄除錯訊息到外部檔案。
 * 會寫入時間戳記 + JSON 序列化後的訊息。
 * 常用於 Illustrator 腳本運行時追蹤變數內容。
 *
 * LOG 寫入位置為 CLOTH_TEMPLATE_CONFIG_PATH 變數指定的資料夾。
 *
 * @param {Any} input - 要輸出的訊息，可為物件或字串。
 */
function log(input) {

    // json2.js 是否可使用
    if (!JSON || !JSON.stringify) return;

    var now = new Date();
    var output = JSON.stringify(input);

    // 輸出到 ExtendScript Console
    $.writeln(now.toTimeString() + ": " + output);

    // 取得環境變數中的 LOG 存放路徑
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    var filePath = pathEnv;

    // 建立 log 檔案位址
    var logFile = File(filePath + "/log_對齊置中.txt");
    logFile.encoding = "utf8";

    // 以 append 模式寫入
    logFile.open("a");
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close();
}


/**
 * getPathItemByFourLevel
 * ------------------------------------------------------
 * 依照「圖層 → 群組1 → 群組2 → 群組3 → PathItem」的路徑取得物件。
 * 若其中任何一層找不到，會跳出 alert 提醒使用者。
 *
 * @param {String} layerName - 圖層名稱
 * @param {String} groupLevel1 - 第一層群組
 * @param {String} groupLevel2 - 第二層群組
 * @param {String} groupLevel3 - 第三層群組
 * @param {String} pathItemName - PathItem 名稱
 * @returns {PathItem|null}
 */
function getPathItemByFourLevel(layerName, groupLevel1, groupLevel2, groupLevel3, pathItemName) {
    var doc = app.activeDocument;

    try {
        var layer  = doc.layers.getByName(layerName);
        var group1 = layer.groupItems.getByName(groupLevel1);
        var group2 = group1.groupItems.getByName(groupLevel2);
        var group3 = group2.groupItems.getByName(groupLevel3);
        var item   = group3.pathItems.getByName(pathItemName);
        return item;
    } catch (e) {
        alert("找不到物件，請確認路徑名稱是否正確：\n" + e.message);
        return null;
    }
}
/**
 * getPathItemByThreeLevel
 * ------------------------------------------------------
 * 依照「圖層 → 群組1 → 群組2 → PathItem」取得物件。
 * 若找不到，會跳出 alert。
 *
 * @returns {PathItem|null}
 */
function getPathItemByThreeLevel(layerName, groupLevel1, groupLevel2, pathItemName) {
    var doc = app.activeDocument;

    try {
        var layer = doc.layers.getByName(layerName);
        var group1 = layer.groupItems.getByName(groupLevel1);
        var group2 = group1.groupItems.getByName(groupLevel2);
        var item = group2.pathItems.getByName(pathItemName);
        return item;
    } catch (e) {
        alert("找不到物件，請確認路徑名稱是否正確：\n" + e.message);
        return null;
    }
}

/**
 * getPathItemByThreeLevelNoAlert
 * ------------------------------------------------------
 * 與 getPathItemByThreeLevel 相同，但「不跳 Alert」。
 * 用於批次搜尋、多層判斷時避免干擾 UI。
 *
 * @returns {PathItem|null}
 */
function getPathItemByThreeLevelNoAlert(layerName, groupLevel1, groupLevel2, pathItemName) {
    var doc = app.activeDocument;

    try {
        var layer = doc.layers.getByName(layerName);
        var group1 = layer.groupItems.getByName(groupLevel1);
        var group2 = group1.groupItems.getByName(groupLevel2);
        var item = group2.pathItems.getByName(pathItemName);
        return item;
    } catch (e) {
        return null;
    }
}

/**
 * getTextFrameByThreeLevel
 * ------------------------------------------------------
 * 取得指定三層群組中的 TextFrame（例如尺碼字、尺寸文字）。
 *
 * @returns {TextFrame|null}
 */
function getTextFrameByThreeLevel(layerName, groupLevel1, groupLevel2, pathItemName) {
    var doc = app.activeDocument;

    try {
        var layer = doc.layers.getByName(layerName);
        var group1 = layer.groupItems.getByName(groupLevel1);
        var group2 = group1.groupItems.getByName(groupLevel2);
        var item = group2.textFrames.getByName(pathItemName);
        return item;
    } catch (e) {
        alert("找不到物件，請確認路徑名稱是否正確：\n" + e.message);
        return null;
    }
}

/**
 * getPathItemByTwoLevel
 * ------------------------------------------------------
 * 取得「圖層 → 群組1 → PathItem or PageItem」。
 * 支援 PageItem 可提升容錯率（因為有些 AI 物件不是 PathItem）。
 *
 * @returns {PageItem|null}
 */
function getPathItemByTwoLevel(layerName, groupLevel1, pathItemName) {
    var doc = app.activeDocument;

    try {
        var layer = doc.layers.getByName(layerName);
        var group1 = layer.groupItems.getByName(groupLevel1);
        // var item = group1.pathItems.getByName(pathItemName);
        var item = group1.pageItems.getByName(pathItemName);
        return item;
    } catch (e) {
        alert("找不到物件，請確認路徑名稱是否正確：\n" + e.message);
        return null;
    }
}


/**
 * getPathItemByLayer
 * ------------------------------------------------------
 * 直接從圖層取得 PathItem。
 * 適合用於「圖層下只有一層物件」的情境，例如對齊框、操作輔助物件。
 *
 * @returns {PathItem|null}
 */
function getPathItemByLayer(layerName, pathItemName){
  var doc = app.activeDocument;

  try {
      var layer = doc.layers.getByName(layerName);
      var item = layer.pathItems.getByName(pathItemName);
      return item;
  } catch (e) {
      alert("找不到物件，請確認路徑名稱是否正確：\n" + e.message);
      return null;
  }
}


function getGroupBy4Level(layerName, groupLevel1, groupLevel2,groupLevel3, groupItemName) {
  var doc = app.activeDocument;

  try {
      var layer = doc.layers.getByName(layerName);
      var group1 = layer.groupItems.getByName(groupLevel1);
      var group2 = group1.groupItems.getByName(groupLevel2);
      var group3 = group2.groupItems.getByName(groupLevel3);
      var group = group3.groupItems.getByName(groupItemName);
      return group;
  } catch (e) {
      alert("找不到物件，請確認路徑名稱是否正確：\n" + e.message);
      return null;
  }
}

/**
 * getGroupByThreeLevel
 * ------------------------------------------------------
 * 依照「圖層 → 群組1 → 群組2 → 群組3」取得 GroupItem。
 * 通常用於：
 *   - 找袖子裡面的裁切群組
 *   - 找前片 / 後片的「尺寸字」、「裁切」、「縫份」等分類
 *
 * 若路徑中任何一層不存在，會 alert 提醒。
 *
 * @param {String} layerName - 圖層名稱（例：裁切、縫份、操作）
 * @param {String} groupLevel1 - 第一層群組名稱
 * @param {String} groupLevel2 - 第二層群組名稱
 * @param {String} groupItemName - 第三層群組名稱
 * @returns {GroupItem|null}
 */
function getGroupByThreeLevel(layerName, groupLevel1, groupLevel2, groupItemName) {
    var doc = app.activeDocument;

    try {
        var layer = doc.layers.getByName(layerName);
        var group1 = layer.groupItems.getByName(groupLevel1);
        var group2 = group1.groupItems.getByName(groupLevel2);
        var group = group2.groupItems.getByName(groupItemName);
        return group;
    } catch (e) {
        alert("找不到物件，請確認路徑名稱是否正確：\n" + e.message);
        return null;
    }
}

/**
 * getGroupByTwoLevel
 * ------------------------------------------------------
 * 依照「圖層 → 群組1 → 群組2」取得 GroupItem。
 * 常用於：
 *  - 裁切層內找「左袖」、「右袖」、「前片」、「後片」
 *  - 找圖層下大分類中的子分類
 *
 * 若找不到會 alert。
 *
 * @returns {GroupItem|null}
 */
function getGroupByTwoLevel(layerName, groupLevel1, groupItemName) {
    var doc = app.activeDocument;

    try {
        var layer = doc.layers.getByName(layerName);
        var group1 = layer.groupItems.getByName(groupLevel1);
        var group = group1.groupItems.getByName(groupItemName);
        return group;
    } catch (e) {
        alert("找不到物件，請確認路徑名稱是否正確：\n" + e.message);
        return null;
    }
}

/**
 * getGroupByTwoLevelNoAlert
 * ------------------------------------------------------
 * 與 getGroupByTwoLevel 相同，但不跳出 alert。
 * 適合：
 *   - 自動流程（例如批次找袖子、批次建立遮罩）
 *   - 某些群組可能不存在但程式仍需繼續往下跑
 *
 * @returns {GroupItem|null}
 */
function getGroupByTwoLevelNoAlert(layerName, groupLevel1, groupItemName) {
    var doc = app.activeDocument;

    try {
        var layer = doc.layers.getByName(layerName);
        var group1 = layer.groupItems.getByName(groupLevel1);
        var group = group1.groupItems.getByName(groupItemName);
        return group;
    } catch (e) {
        return null;
    }
}


/**
 * getGroupByLevel
 * ------------------------------------------------------
 * 從指定圖層找「單層 GroupItem」。
 * 適合用於大分類，如：
 *   - 裁切層底下直接的「前片」、「後片」
 *
 * 不會跳 alert，若不存在就回傳 null。
 *
 * @returns {GroupItem|null}
 */
function getGroupByLevel(layerName, groupItemName) {
    var doc = app.activeDocument;
    try {
        var layer = doc.layers.getByName(layerName);
        var group = layer.groupItems.getByName(groupItemName);
        return group;
    } catch (e) {
        return null;
    }
}


/**
 * findPageItemInGroup
 * ------------------------------------------------------
 * 遞迴尋找群組中的子物件。
 * 支援深度搜尋，無論子層級多深都可以找到。
 *
 * 用途：
 *   - 找「底色」、「邊界」、「中線」、「尺碼字」、「印花」等命名物件
 *   - 用於判斷遮罩內容是否存在
 *
 * @param {PageItem or GroupItem} item - 要開始搜尋的群組
 * @param {String} itemName - 目標物件名稱
 * @returns {PageItem|null}
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
 * findPageItemInGroupFirst
 * ------------------------------------------------------
 * 僅搜尋群組「第一層」的子物件，不做遞迴。
 *
 * 用途：
 *   - 判斷遮罩群組是否包含底色（PathItem.clipping = true）
 *   - 檢查某物件是否位於群組最上層（例如遮罩）
 *
 * @returns {PageItem|null}
 */
function findPageItemInGroupFirst(item, itemName) {
    // 如果是群組，則遞歸檢查其子物件
    if (item.typename === "GroupItem") {
        var items = item.pageItems;
        // alert(item.layer.name+","+item.name+" , length"+items.length);
        for (var i = 0; i < items.length; i++) {
          if (items[i].name === itemName) {
              return items[i];
          }
        }
    }

    return null; // 如果未找到對應物件
}

//✔ 群組是否 clipped
//✔ 其中是否包含 clipping=true 的 PathItem
//✔ 該 PathItem 名稱是否為「底色」
//✔ 底色外框是否等於你要比對的物件外框

/**
 * isValidMaskGroup
 * ------------------------------------------------------
 * 檢查一個群組是否為遮罩群組，且遮罩物件（底色）與指定 PathItem 形狀一致。
 *
 * 用途：
 *   - 判斷兩個裁片是否是相同版型（同邊界）
 *   - 適合用於自動換版、袖子配對、前後片識別
 *
 * @param {GroupItem} maskGroup - 檢查的群組
 * @param {PathItem} pathItem - 要比對外框的物件
 * @returns {Boolean}
 */
function isValidMaskGroup(maskGroup, pathItem) {
    // 判斷是否為群組
    if (maskGroup.typename !== "GroupItem" || !maskGroup.clipped) {
        return false;
    }

    // 找到名稱為 "底色" 的遮罩物件
    var baseMask = null;
    for (var i = 0; i < maskGroup.pageItems.length; i++) {
        var item = maskGroup.pageItems[i];
        if (item.typename === "PathItem" && item.clipping && item.name === "底色") {
            baseMask = item;
            break;
        }
    }

    // 若找不到遮罩物件 "底色"
    if (!baseMask) return false;

    // 比對形狀
    var baseBounds = baseMask.geometricBounds;
    var pathBounds = pathItem.geometricBounds;

    // 比較四個邊界 (left, top, right, bottom)
    var isSameSize =
        baseBounds[0] === pathBounds[0] &&
        baseBounds[1] === pathBounds[1] &&
        baseBounds[2] === pathBounds[2] &&
        baseBounds[3] === pathBounds[3];

    return isSameSize;
}

/**
 * isClippingGroup
 * ------------------------------------------------------
 * group.clipped === true → 表示此群組是遮罩群組。
 *
 * 用途：
 *   - 快速判斷此群組是否包含 clipping 遮罩
 *
 * @returns {Boolean}
 */
function isClippingGroup(group) {
    if (group.typename !== "GroupItem") return false;
    return group.clipped === true;
}

/**
 * findMaskmInGroupFirst
 * ------------------------------------------------------
 * 找出群組中第一個含有「底色」遮罩的子群組。
 *
 * 用途：
 *   - 找裁片的主要底色遮罩
 *   - 判斷袖子的左右（依底色外框判別）
 *
 * @returns {GroupItem|null}
 */
function findMaskmInGroupFirst(item) {
    // 如果是群組，則遞歸檢查其子物件
    var items = item.pageItems;
    for (var i = 0; i < items.length; i++) {
        tmpItem = items[i];
        if(isClippingGroup(tmpItem)) {
            maskItem = findPageItemInGroupFirst(tmpItem, "底色");
            if(maskItem){
                return tmpItem;
            }else{
              continue;
            }
        }
    }


    return null; // 如果未找到對應物件
}

/**
 * getPageItemByNameInLayer(doc, layerName, itemName)
 * ------------------------------------------------------
 * 📌 功能說明
 * 在指定圖層中，用「名稱搜尋」方式取得 PageItem。
 *
 * Illustrator 的 PageItem 是總稱（包含 PathItem、GroupItem、TextFrame、
 * PlacedItem、CompoundPathItem…），因此這個方法能比 getPathItems 更通用，
 * 不管物件類型如何，只要名稱正確都能找到。
 *
 * 若圖層不存在 → 回傳 null 並記錄 log
 * 若物件不存在 → 回傳 null 並記錄 log
 *
 * ------------------------------------------------------
 * 📌 專案使用情境（在你的衣服裁片流程中）
 * ✔ 找某個裁片（例如：前片、後片、左袖、右袖）
 * ✔ 找裁片裡對齊用的基準框（例如：對齊物件大背號）
 * ✔ 找尺碼框、對齊框、操作框
 * ✔ 在「裁切」圖層中找特定群組或底色遮罩
 *
 * 你常使用方式：
 *   var item = getPageItemByNameInLayer(app.activeDocument, "裁切", "前片");
 *
 * ------------------------------------------------------
 * @param {Document} doc - Illustrator 目前的文件物件
 * @param {String} layerName - 指定要搜尋的圖層名稱
 * @param {String} itemName - 要找的 PageItem 名稱
 *
 * @returns {PageItem|null}
 *         找到 → 回傳該 PageItem
 *         找不到 → 回傳 null（並寫入 log）
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
 * getPageItemByNameInLayerByTarget(doc, layerName, itemName, targetItemName)
 * ------------------------------------------------------
 * 📌 功能說明
 * 先使用 getPageItemByNameInLayer() 在指定圖層 layerName 取得 itemName，
 * 接著在該物件內部尋找「第一層群組中名稱為 targetItemName」的子物件。
 *
 * 換句話說：
 *   → 先找外層物件（A）
 *   → 再找 A 群組裡的某個子物件（B）
 *
 * B 必須是「第一層」子物件（非遞迴搜尋）。
 *
 * ------------------------------------------------------
 * 📌 為什麼需要這個？
 * 因為你的裁片（前片、後片、袖子）外層通常是一個 GroupItem，
 * 但真正要對齊的基準通常是裡面的：
 *
 *   - 「底色」
 *   - 「邊界」
 *   - 「中線」
 *   - 「裁切線」
 *
 * Illustrator 對齊不是對整個群組，而是要對齊這些「基準 PathItem」。
 *
 * ------------------------------------------------------
 * 📌 使用情境（在你的實際裁片流程中）
 * ✔ 自動找到「裁切 → 前片」裡面的底色
 * ✔ 找「裁切 → 左袖」裡面的邊界
 * ✔ 找「縫份 → 後片」裡面的中線 path
 * ✔ 用於進階對齊：像 autoCenterBySelectNameAndItem / topCenterXY 系列
 *
 * 例如：
 *   var mask = getPageItemByNameInLayerByTarget(doc, "裁切", "前片", "底色");
 *
 * ------------------------------------------------------
 * @param {Document} doc - Illustrator 文件
 * @param {String} layerName - 圖層名稱（如：裁切、縫份）
 * @param {String} itemName - 外層物件名稱（通常是前片/後片/左袖/右袖）
 * @param {String} targetItemName - 要在 item 內尋找的子物件名稱
 *
 * @returns {PageItem|null}
 *          找到 → 回傳該子物件
 *          找不到 → 回傳 null
 */
function getPageItemByNameInLayerByTarget(doc, layerName, itemName,targetItemName) {
    var pageItem = getPageItemByNameInLayer(doc, layerName, itemName);
    if(pageItem){
      return findPageItemInGroupFirst(pageItem,targetItemName);
    }else{
      return null;
    }

}

// 取得物件 geometricBounds 資訊函式
/**
 * getBounds(item)
 * ------------------------------------------------------
 * 取得物件「geometricBounds」並回傳結構化資訊。
 *
 * geometricBounds = 不含描邊、以物件最外框為基準。
 *
 * 回傳內容包含：
 *   - left、top、right、bottom
 *   - width、height
 *   - centerX、centerY（常用在對齊）
 *
 * 用途：
 *   🔹 對齊物件（水平置中、垂直置中）
 *   🔹 計算頂點要移動的距離
 *   🔹 判斷底色與版型是否一致
 *
 * @param {PageItem} item
 * @returns {Object}
 */
function getBounds(item) {
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


/**
 * getOutlineBounds(item)
 * ------------------------------------------------------
 * 使用 visibleBounds，可取得「含描邊」的外框大小。
 * 某些設計稿會有粗描邊，會影響實際對齊，需要用此方法。
 *
 * @returns {Object}
 */
function getOutlineBounds(item) {
		var b = item.visibleBounds;
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

/**
 * centerByItem(itemA, itemB)
 * ------------------------------------------------------
 * 讓 itemB 在「水平」上置中到 itemA。
 * 僅移動 X，不動 Y。
 *
 * 用途：
 *   - 背號對齊裁片
 *   - LOGO 水平置中
 *   - 尺寸字對齊
 *
 * @returns void
 */
function centerByItem(itemA, itemB){
  targetBounds = getBounds(itemA);
  selectedBounds = getBounds(itemB);
  x = targetBounds.left - selectedBounds.left + (targetBounds.width - selectedBounds.width)/2;
  itemB.translate(x,0);
  //alert("已將選取物件對齊置中");
}


/**
 * autoCenterByItem(itemA, itemB)
 * ------------------------------------------------------
 * 將 itemB 同時「水平置中 + 垂直置中」到 itemA。
 *
 * 用途：
 *   - 整個圖案（前片印花）置中到裁片底色
 *   - 自動配置圖案位置
 *   - 對齊旋轉後的物件
 */
function autoCenterByItem(itemA, itemB){
  targetBounds = getBounds(itemA);
  selectedBounds = getBounds(itemB);
  x = targetBounds.left - selectedBounds.left + (targetBounds.width - selectedBounds.width)/2;
  y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;
  itemB.translate(x,y);
}


/**
 * centerByItemX(itemA, itemB)
 * ------------------------------------------------------
 * 與 centerByItem 類似，但只回傳 X 值，不進行移動。
 *
 * 用途：
 *   - 用於批次計算
 *   - 自動建立新物件時先取得位移量
 *
 * @returns {Number} 要移動的 x
 */
function centerByItemX(itemA, itemB){
  targetBounds = getBounds(itemA);
  selectedBounds = getBounds(itemB);
  x = targetBounds.left - selectedBounds.left + (targetBounds.width - selectedBounds.width)/2;
  return x;
  //alert("已將選取物件對齊置中");
}


/**
 * centerBySeletItem(layerName, targetItemName)
 * ------------------------------------------------------
 * 將「目前選取物件」水平置中到指定圖層中的某物件。
 *
 * 用途：
 *   - 你在 Illustrator 點選一個物件 → 按快捷鍵 → 自動對齊到底色
 *
 * @returns void
 */
function centerBySeletItem(layerName, targetItemName){
  var doc = app.activeDocument;
  // 確認選取一個物件
  if (doc.selection.length === 1) {
      var selectedItem = doc.selection[0];
      // 找尋目標群組
      var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
      targetBounds = getBounds(foundItem);
      selectedBounds = getBounds(selectedItem);
      x = targetBounds.left - selectedBounds.left + (targetBounds.width - selectedBounds.width)/2;
      selectedItem.translate(x,0);
      //alert("已將選取物件對齊置中");

  } else {
      alert("請先選取一個物件！");
  }
}

/**
 * center(layerName, targetItemName)
 * ------------------------------------------------------
 * 與 centerBySelectItem 類似，但會：
 *
 * 1. 自動找 selectedItem 群組中名為「底色」的 PathItem
 * 2. 以底色外框為基準做水平置中
 *
 * 用途：
 *   - 對齊整個裁片的印花
 *   - 對齊袖口設計
 *
 * @returns void
 */
function center(layerName, targetItemName){
    var doc = app.activeDocument;
    // 確認選取一個物件
    if (doc.selection.length === 1) {
        var selectedItem = doc.selection[0];
        // 找尋目標群組
        var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
        //alert(foundItem);
        targetBounds = getBounds(foundItem);
        selectedBounds = getBounds(findPageItemInGroup(selectedItem,"底色"));
        x = targetBounds.left - selectedBounds.left + (targetBounds.width - selectedBounds.width)/2;
        selectedItem.translate(x,0);
        //alert("已將選取物件對齊置中");

    } else {
        alert("請先選取一個物件！");
    }
}

/**
 * p2mm
 * ------------------------------------------------------
 * 將 pt → mm
 */
function p2mm(n) {
  return n / 2.83464567;
}


/**
 * mm
 * ------------------------------------------------------
 * 將 mm → pt
 */
function mm(n) {
  return n * 2.83464567;
}

/**
 * bottomCenter(layerName, targetItemName, distance)
 * ------------------------------------------------------
 * 將選取物件置中到底色並貼近「下方 distance mm」位置。
 *
 * 用途：
 *   - 後片下擺 LOGO
 *   - 置底文字（例如衣服款式資訊）
 */
function bottomCenter(layerName, targetItemName, distance){
    bottomCenterBySelectName(layerName, targetItemName, distance,"底色");
}

/**
 * bottomCenterBySelectName
 * ------------------------------------------------------
 * 與 bottomCenter 相同，但允許指定 selectName（例如 "邊界"）。
 *
 * 用途：
 *   - 某些裁片的底色不是 "底色"，例如「袖口邊界」
 */
function bottomCenterBySelectName(layerName, targetItemName, distance , selectName){
    var doc = app.activeDocument;
    // 確認選取一個物件
    if (doc.selection.length === 1) {
        var selectedItem = doc.selection[0];
        var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
        targetBounds = getBounds(foundItem);
        selectedBounds = getBounds(findPageItemInGroup(selectedItem,selectName));
        x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
        y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)-mm(distance);
        selectedItem.translate(x,y);
        //alert("已將選取物件對齊至置中");

    } else {
        alert("請先選取一個物件！");
    }
}


//bottomCenterByItems(targetItem,"底色",newItem,"底色",0);
/**
 * bottomCenterByItem(layerName, targetItemName, distance, item, selectName)
 * -------------------------------------------------------------------------
 * 📌 功能說明
 * 將「選取的物件」(selectedItem) 的某個子物件（依 selectName 指定，如底色/邊界）
 * 底部向下貼齊到 layerName → targetItemName 的物件底部，
 * 並且做水平置中。
 *
 * 更精準來說：
 *   - item：你要對齊的那個群組（例如整個前片印花、整個 LOGO 群組）
 *   - selectName：item 裡面要用來對齊的基準物件（例如：底色、邊界）
 *
 * 運作流程：
 *   1. 找 layerName 中的 targetItemName → 取得「對齊基準裁片」
 *   2. 在 item 群組中尋找 selectName → 取得要對齊的基準子物件
 *   3. 計算水平置中位置
 *   4. 計算垂直貼底距離（distance mm）
 *   5. 將選取的物件 (selectedItem) 移動到正確位置
 *
 * -------------------------------------------------------------------------
 * 📌 在你的服裝製程中的典型用途
 * ✔ 將袖口編號 / LOGO 貼齊袖片底部
 * ✔ 將前片印花貼齊前片底色底部
 * ✔ 將背號貼到後片底部（並保持水平置中）
 * ✔ item 能讓你對齊任意群組，而不限選取的那個物件
 *
 * ※ 很常用在「自動排版」與「印花自動位置補正」！
 *
 * -------------------------------------------------------------------------
 * @param {String} layerName - 圖層名稱 (例如："裁切", "縫份")
 * @param {String} targetItemName - 要對齊的裁片名稱（例如："前片", "左袖"）
 * @param {Number} distance - 與底部的距離（mm）
 * @param {PageItem} item - 外部傳入的群組，用於找 selectName 的位置基準
 * @param {String} selectName - item 中當作基準的物件名稱（如："底色", "邊界"）
 *
 * @returns void
 */
function bottomCenterByItem(layerName, targetItemName, distance , item, selectName){
    var doc = app.activeDocument;
    // 確認選取一個物件
    if (doc.selection.length === 1) {
        var selectedItem = doc.selection[0];
        var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
        targetBounds = getBounds(foundItem);
        selectedBounds = getBounds(findPageItemInGroup(item,selectName));
        x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
        y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)-mm(distance);
        selectedItem.translate(x,y);
        //alert("已將選取物件對齊至置中");

    } else {
        alert("請先選取一個物件！");
    }
}

//autoCenterBySelectNameAndItem("裁切","左袖","底色",itme)
/**
 * autoCenterBySelectNameAndItem(layerName, targetItemName , selectName, item)
 * ------------------------------------------------------
 * 與 autoCenterBySelectName 類似，但 "item" 直接指定，不需從 selection 取得。
 *
 * 流程：
 *   1. 在 layerName 找到名稱 targetItemName 的物件（通常為底色裁片）
 *   2. 在該物件內找到名稱 selectName（例如「底色」、「邊界」）
 *   3. 以該子物件為基準，將 item 置中對齊（水平 & 垂直）
 *
 * 用途：
 *   - 不需要選取物件，也能自動對齊（例如批次對齊）
 *   - 用在袖子、前片、後片自動排版
 *
 * @returns void
 */
function autoCenterBySelectNameAndItem(layerName, targetItemName , selectName,itme){
    var doc = app.activeDocument;
    // 確認選取一個物件
    if (doc.selection.length === 1) {
        var selectedItem = itme;
        var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
        targetBounds = getBounds(findPageItemInGroupFirst(foundItem,selectName));
        selectedBounds = getBounds(itme);
        x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
        y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;
        selectedItem.translate(x,y);
        //alert("已將選取物件對齊至置中");
    } else {
        alert("請先選取一個物件！");
    }
}

/**
 * autoCenterBySelectName
 * ------------------------------------------------------
 * 與 autoCenterBySelectNameAndItem 差別：
 *   - 這版使用選取物件當作 item
 *
 * 用途：
 *   - 手動選取 → 自動貼齊到底色或邊界
 *
 */
function autoCenterBySelectName(layerName, targetItemName , selectName){
    var doc = app.activeDocument;
    // 確認選取一個物件
    if (doc.selection.length === 1) {
        var selectedItem = doc.selection[0];
        var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
        targetBounds = getBounds(findPageItemInGroupFirst(foundItem,selectName));
        selectedBounds = getBounds(selectedItem);
        x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
        y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;
        selectedItem.translate(x,y);
        //alert("已將選取物件對齊至置中");

    } else {
        alert("請先選取一個物件！");
    }
}

//autoCenterByLayerAndSelect("縫份","左袖")
/**
 * autoCenterByLayerAndSelect
 * ------------------------------------------------------
 * 將「選取物件」置中到 layerName → targetItemName
 *
 * 用途：
 *   - 最基本版本的自動置中，依照整個 item 的外框
 *
 */
function autoCenterByLayerAndSelect(layerName, targetItemName ){
    var doc = app.activeDocument;
    // 確認選取一個物件
    if (doc.selection.length === 1) {
        var selectedItem = doc.selection[0];
        var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
        targetBounds = getBounds(foundItem);
        selectedBounds = getBounds(selectedItem);
        x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
        y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;
        selectedItem.translate(x,y);
        //alert("已將選取物件對齊至置中");

    } else {
        alert("請先選取一個物件！");
    }
}

//function autoCenterByThreeLevel
/**
 * autoCenterByThreeLevel(layerName, groupLevel1, groupLevel2, pathItemName, item)
 * -------------------------------------------------------------------------------
 * 📌 功能說明
 * 本函式會：
 *   1. 在 layerName → groupLevel1 → groupLevel2 中找到 pathItemName（基準物件）
 *   2. 取得此基準物件的外框（geometricBounds）
 *   3. 將外部傳入的 item 依照其外框進行「水平 + 垂直」完全置中
 *
 * 🔍 這裡的 “ThreeLevel” 指的是：
 *       Layer → GroupItem1 → GroupItem2 → PathItem
 *
 * -------------------------------------------------------------------------------
 * 📌 為什麼需要這個功能？
 * 因為你的 AI 裁片文件經常是這樣的階層結構：
 *
 *   裁切（Layer）
 *      └── 前片（Group）
 *             └── 尺寸字（Group）
 *                    └── 底色（Path）
 *
 * 像印花、背號、LOGO 等群組，想要貼齊某個裁片內層的基準 PathItem（例如「底色」），
 * 就會用到這個函式。
 *
 * ✔ 適合做「多層級精準對齊」
 * ✔ 適合自動排版、批次製作
 *
 * -------------------------------------------------------------------------------
 * 📌 實務使用情境（你現在的衣服流程）
 *
 * 1️⃣ 將印花自動置中到「裁切 → 前片 → 尺寸字 → 底色」
 * 2️⃣ 將袖子圖案對齊到三層群組裡的某個 Path（例如袖子底色）
 * 3️⃣ 將尺寸文字、貼紙群組等自動定位到裁片基準點
 *
 * -------------------------------------------------------------------------------
 * @param {String} layerName      - 最外層圖層名稱（例如："裁切"、"縫份"）
 * @param {String} groupLevel1    - 第一層群組名稱（例如："前片"、"左袖"）
 * @param {String} groupLevel2    - 第二層群組名稱（如："尺寸字"、"定位點"）
 * @param {String} pathItemName   - 要用來當作對齊基準的 PathItem 名稱（如："底色"）
 * @param {PageItem} item         - 要被對齊的外部群組或物件（例如印花群組）
 *
 * @returns {PageItem}            - 回傳找到的基準 PathItem（給後續功能使用）
 */
function autoCenterByThreeLevel(layerName, groupLevel1, groupLevel2, pathItemName,item){
   var selectedItem =item;
   var foundItem = getPathItemByThreeLevel(layerName,groupLevel1, groupLevel2, pathItemName);
   targetBounds = getBounds(foundItem);
   selectedBounds = getBounds(selectedItem);
   x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
   y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;
   selectedItem.translate(x,y);
   return foundItem;
}

//function autoCenterByThreeLevel
/**
 * autoCenterByThreeLevel2(layerName, groupLevel1, groupLevel2, pathItemName, item)
 * --------------------------------------------------------------------------------
 * 📌 功能說明
 * 與 autoCenterByThreeLevel 的差異：
 *
 *   ➜ autoCenterByThreeLevel ：直接使用 item（整組）的外框置中
 *   ➜ autoCenterByThreeLevel2：使用 item 內部名稱為「邊界」的 PathItem 作為置中基準
 *
 * 也就是說：
 *   ✦ 若 item 裡有「邊界」物件（PathItem）
 *     → 本函式會以「邊界」的外框為基準，不是以整組 item 外框。
 *
 * 這對裁片（尤其是袖子、褲子、下擺）非常重要，
 * 因為 item 的整體群組外框不一定等於裁片邊界的實際形狀。
 *
 * ---------------------------------------------------------------------------
 * 📌 運作流程
 *   1. 在 layerName → groupLevel1 → groupLevel2 中尋找 pathItemName（例如：底色）
 *   2. 在 item 群組中尋找名稱為「邊界」的子物件
 *   3. 取得雙方外框（target：裁片內層、selected：item 的邊界）
 *   4. 計算水平 + 垂直置中
 *   5. 平移整個 item 群組（不是邊界本身）
 *
 * ---------------------------------------------------------------------------
 * 📌 實務應用（你在衣服排版中的用途）
 *
 * ✔ 將印花或圖案對齊到裁片邊界（非底色）
 * ✔ 袖子上下左右置中（以袖子裁片「邊界」作為準）
 * ✔ 前片/後片內有大印花，但以裁片外輪廓（邊界）為置中依據
 * ✔ 褲子、裙子等裁片特別依賴邊界作為基準時必用
 *
 * 這個版本特別適合「item 裡面有邊界框」的版型。
 *
 * ---------------------------------------------------------------------------
 * @param {String} layerName     - 圖層名稱（如："裁切"）
 * @param {String} groupLevel1   - 第一層群組（如："左袖"）
 * @param {String} groupLevel2   - 第二層群組（如："尺寸字"）
 * @param {String} pathItemName  - 在三層結構中要定位的 PathItem 名稱（如："底色"）
 * @param {PageItem} item        - 要被移動置中的物件（整組的印花 / 群組）
 *
 * @returns {PageItem}           - 回傳在三層結構中找到的 pathItem（供後續需要使用）
 */
function autoCenterByThreeLevel2(layerName, groupLevel1, groupLevel2, pathItemName,item){
   var selectedItem =findPageItemInGroupFirst(item,"邊界");
   var foundItem = getPathItemByThreeLevel(layerName,groupLevel1, groupLevel2, pathItemName);
   targetBounds = getBounds(foundItem);
   selectedBounds = getBounds(selectedItem);
   x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
   y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;
   item.translate(x,y);
   return foundItem;
}

//autoCenterByLayerAndSelect("縫份","左袖")
/**
 * autoCenterByLayerAndItem(layerName, targetItemName, item)
 * ------------------------------------------------------
 * 與 autoCenterByLayerAndSelect 類似，但直接傳入 item。
 *
 * 用途：
 *   - 批次操作不需人工選取
 *   - 可用於自動排版流程
 *
 */
function autoCenterByLayerAndItem(layerName, targetItemName,item ){
    var doc = app.activeDocument;
    // 確認選取一個物件

    var selectedItem =item;
    var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
    targetBounds = getBounds(foundItem);
    selectedBounds = getBounds(selectedItem);
    x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
    y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;
    selectedItem.translate(x,y);
    //alert("已將選取物件對齊至置中");
}

//autoCenterByLayerAndSelect("縫份","左袖")
/**
 * autoCenterByLayerAndItem2
 * ------------------------------------------------------
 * 以 item 群組中的「邊界」作為基準對齊。
 *
 * 用途：
 *   - 有些板型底色不一致，但邊界一致
 *   - 常用於褲子、袖子等帶邊界的版型
 */
function autoCenterByLayerAndItem2(layerName, targetItemName,item ){
    var doc = app.activeDocument;
    // 確認選取一個物件

    var selectedItem =findPageItemInGroupFirst(item,"邊界");
    var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
    targetBounds = getBounds(foundItem);
    selectedBounds = getBounds(selectedItem);
    x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
    y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;
    item.translate(x,y);
    //alert("已將選取物件對齊至置中");
}

/**
 * autoTopCenterBySelectName
 * ------------------------------------------------------
 * 置於最頂部對齊，但仍保持水平置中
 *
 * y = 目標 top - 選取物件 top
 *
 * 用途：
 *   - 上胸文字對齊
 *   - 袖子上方裝飾
 *   - 置於裁片頂部
 */
function autoTopCenterBySelectName(layerName, targetItemName , selectName){
    var doc = app.activeDocument;
    // 確認選取一個物件
    if (doc.selection.length === 1) {
        var selectedItem = doc.selection[0];
        var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
        targetBounds = getBounds(findPageItemInGroupFirst(foundItem,selectName));
        selectedBounds = getBounds(selectedItem);
        x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
        y = (targetBounds.top -selectedBounds.top);
        selectedItem.translate(x,y);
        //alert("已將選取物件對齊至置中");

    } else {
        alert("請先選取一個物件！");
    }
}

/**
 * autoLeftTopXY(itemA, itemB)
 * ------------------------------------------------------
 * 計算：itemB 要如何移動到 itemA 的「左上角」位置。
 *
 * 只回傳 {left, top}，不做 translate。
 *
 * 用途：
 *   - 自動拼板（左上開始排）
 *   - 將 LOGO 吸附左上定位區
 */
function autoLeftTopXY(itemA, itemB){
      targetBounds = getBounds(itemA);
      selectedBounds = getBounds(itemB);
      //x =(targetBounds.left-selectedBounds.left)-(targetBounds.width-selectedBounds.width)/2 - targetBounds.width/2;
      x =(targetBounds.left-selectedBounds.left)-targetBounds.width+selectedBounds.width/2;
      y = (targetBounds.top -selectedBounds.top);
      //selectedItem.translate(x,y);
      //alert("已將選取物件對齊至置中");
      return{
        left:x,
        top:y
      }
}

/**
 * autoRightTopXY(itemA, itemB)
 * ------------------------------------------------------
 * 計算 itemB 對齊至 itemA 的右上角。
 */
function autoRightTopXY(itemA, itemB){
      targetBounds = getBounds(itemA);
      selectedBounds = getBounds(itemB);
      x = (targetBounds.left-selectedBounds.left)-selectedBounds.width/2;
      y = targetBounds.top -selectedBounds.top;
      //selectedItem.translate(x,y);
      //alert("已將選取物件對齊至置中");
      return{
        left:x,
        top:y
      }
}

/**
 * autoLeftCenterXY(itemA, itemB)
 * ------------------------------------------------------
 * 計算 itemB 對齊 itemA 左側，並垂直置中。
 */
function autoLeftCenterXY(itemA, itemB){
      targetBounds = getBounds(itemA);
      selectedBounds = getBounds(itemB);
      x = (targetBounds.left-selectedBounds.left)-(targetBounds.width-selectedBounds.width)/2;
      y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;
      //selectedItem.translate(x,y);
      //alert("已將選取物件對齊至置中");
      return{
        left:x,
        top:y
      }
}


/**
 * autoCenterXY(itemA, itemB)
 * ------------------------------------------------------
 * 單純回傳 itemB 要對齊 itemA 正中心的位移。
 */
function autoCenterXY(itemA, itemB){
      targetBounds = getBounds(itemA);
      selectedBounds = getBounds(itemB);
      x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
      y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;
      //selectedItem.translate(x,y);
      //alert("已將選取物件對齊至置中");
      return{
        left:x,
        top:y
      }
}

/**
 * bottomCenterXY(layerName, targetItemName, distance , selectName)
 * ------------------------------------------------------
 * 計算選取物件靠近 "底部" 的位置（不移動）。
 *
 * 用途：
 *   - 自動排版預先計算
 */
function bottomCenterXY(layerName, targetItemName, distance , selectName){
  var doc = app.activeDocument;
  // 確認選取一個物件
  if (doc.selection.length === 1) {
      var selectedItem = doc.selection[0];
      var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
      targetBounds = getBounds(foundItem);
      selectedBounds = getBounds(findPageItemInGroup(selectedItem,selectName));
      x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
      y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)-mm(distance);
      //selectedItem.translate(x,y);
      //alert("已將選取物件對齊至置中");
      return{
        left:x,
        top:y
      }
  } else {
      alert("請先選取一個物件！");
      return null;
  }
}

//a = topCenterXY("裁切", FrontBack_name,0,"底色");
/**
 * bottomCenterByGroup(layerName, targetItemName, distance , selectName)
 * ----------------------------------------------------------------------
 * 📌 功能說明
 * 將「目前選取的群組」以其內部名稱為 selectName 的子物件（例如：底色、邊界）
 * 作為基準 → 對齊到指定裁片（layerName → targetItemName）的底部，
 * 並保持水平置中。
 *
 * ✔ selectName：決定 item 群組裡的哪個子物件要當成基準（通常是“底色”或“邊界”）
 * ✔ distance（mm）：與底部的距離
 *
 * 實際對齊流程：
 *   1. 找到裁片（layerName → targetItemName）
 *   2. 找到選取物件內要作為對齊基準的子物件（selectName）
 *   3. 水平置中（中心點對齊）
 *   4. 貼齊底部（加入 distance mm）
 *   5. 平移整個選取的物件群組
 *
 * ----------------------------------------------------------------------
 * 📌 典型實務用途（你目前 AI 裁片流程中的使用）
 *
 * ✔ 把 LOGO 放到前片或後片的底部中心
 * ✔ 把文字、標語、尺寸編號貼到裁片底部
 * ✔ 將局部圖案自動靠底放置
 * ✔ selectName 讓你可依底色或邊界對齊（依版型結構不同）
 *
 * 例如：
 *   bottomCenterByGroup("裁切", "前片", 10, "底色");
 *
 * 表示：
 *   將選取群組以「底色」為基準 → 貼到前片底部（下方 10mm）
 *
 * ----------------------------------------------------------------------
 * @param {String} layerName        - 圖層名稱（如：裁切）
 * @param {String} targetItemName   - 裁片名稱（如：前片、後片、左袖）
 * @param {Number} distance         - 與底部距離（mm）
 * @param {String} selectName       - 物件內的基準子物件名稱（如：底色、邊界）
 *
 * @returns {void}
 */
function bottomCenterByGroup(layerName, targetItemName, distance , selectName){
  var doc = app.activeDocument;
  // 確認選取一個物件
  if (doc.selection.length === 1) {
      var selectedItem = doc.selection[0];
      var groupItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
      var foundItem = findPageItemInGroupFirst(groupItem,selectName);
      targetBounds = getBounds(foundItem);
      selectedBounds = getBounds(findPageItemInGroup(selectedItem,selectName));
      x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
      y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)-mm(distance);
      //selectedItem.translate(x,y);
      //alert("已將選取物件對齊至置中");
      return{
        left:x,
        top:y
      }
  } else {
      alert("請先選取一個物件！");
      return null;
  }
}




//a = topCenterXY("縫份", FrontBack_name,0,"底色");
/**
 * topCenterXY(layerName, targetItemName, distance , selectName)
 * ------------------------------------------------------
 * 計算選取物件對齊裁片頂部的位置。
 */
function topCenterXY(layerName, targetItemName, distance , selectName){
  var doc = app.activeDocument;
  // 確認選取一個物件
  if (doc.selection.length === 1) {
      var selectedItem = doc.selection[0];
      var foundItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
      targetBounds = getBounds(foundItem);
      selectedBounds = getBounds(findPageItemInGroup(selectedItem,selectName));
      x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
      y = (targetBounds.top -selectedBounds.top)-mm(distance);
      //selectedItem.translate(x,y);
      //alert("已將選取物件對齊至置中");
      return{
        left:x,
        top:y
      }
  } else {
      alert("請先選取一個物件！");
      return null;
  }
}


//a = topCenterXY("裁切", FrontBack_name,0,"底色");
/**
 * topCenterXYByGroup
 * ------------------------------------------------------
 * 與 topCenterXY 類似，但使用 groupItem 內的子物件 selectName 作為基準。
 */
function topCenterXYByGroup(layerName, targetItemName, distance , selectName){
  var doc = app.activeDocument;
  // 確認選取一個物件
  if (doc.selection.length === 1) {
      var selectedItem = doc.selection[0];
      var groupItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
      var foundItem = findPageItemInGroupFirst(groupItem,selectName);
      targetBounds = getBounds(foundItem);
      selectedBounds = getBounds(findPageItemInGroupFirst(selectedItem,selectName));
      x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
      y = (targetBounds.top -selectedBounds.top)-mm(distance);
      //selectedItem.translate(x,y);
      //alert("已將選取物件對齊至置中");
      return{
        left:x,
        top:y
      }
  } else {
      alert("請先選取一個物件！");
      return null;
  }
}


//a = topCenterXY("裁切", FrontBack_name,0,"底色");
/**
 * topCenterByGroup(layerName, targetItemName, distance , selectName)
 * -------------------------------------------------------------------
 * 📌 功能說明
 * 將「目前選取的群組」以其內部名稱為 selectName 的子物件
 * （例如：底色 / 邊界 / 中線）作為基準，
 * 對齊到指定裁片（layerName → targetItemName）的 **頂部**，
 * 並做 **水平置中**，同時向上或向下保留 distance（mm）距離。
 *
 * 👉 這是 bottomCenterByGroup 的「頂部版」。
 *
 * 要點：
 *   ✔ selectedItem 是整個需要移動的群組
 *   ✔ selectName 是群組裡真正的基準物件（底色/邊界）
 *   ✔ targetItemName 是裁片，例如「前片」、「後片」、「左袖」
 *
 * -------------------------------------------------------------------
 * 📌 運作流程（簡化視覺理解）
 *
 *   [基準裁片：top]
 *           ↓ distance
 *   [ selectedItem（以 selectName 為基準） ]
 *
 * 平移方式：
 *   1. 水平 → 中心對中心
 *   2. 垂直 → 讓 selected 的頂部 = 基準頂部 - distance(mm)
 *
 * -------------------------------------------------------------------
 * 📌 實務使用情境（你目前 AI 裁片流程）
 *
 * ✔ 將 LOGO 貼到前片頂端中心
 * ✔ 將英文標語貼在領口下方
 * ✔ 將數字/符號放在背部上緣
 * ✔ 袖子頂端放置圖示
 *
 * 例如：
 *   topCenterByGroup("裁切", "前片", 5, "底色");
 *
 * 表示：
 *   → 以選取物件中的「底色」為對齊基準
 *   → 貼到前片頂端下方 5mm 位置
 *
 * -------------------------------------------------------------------
 * @param {String} layerName        - 圖層名稱（如："裁切"）
 * @param {String} targetItemName   - 裁片名稱（如："前片"、"後片"、"左袖"）
 * @param {Number} distance         - 與頂部的距離（mm）
 * @param {String} selectName       - 選取群組內用作基準的子物件（如："底色"、"邊界"）
 *
 * @returns {void}
 */
function topCenterByGroup(layerName, targetItemName, distance , selectName){
  var doc = app.activeDocument;
  // 確認選取一個物件
  if (doc.selection.length === 1) {
      var selectedItem = doc.selection[0];
      var groupItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
      var foundItem = findPageItemInGroupFirst(groupItem,selectName);
      targetBounds = getBounds(foundItem);
      selectedBounds = getBounds(findPageItemInGroup(selectedItem,selectName));
      x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
      y = (targetBounds.top -selectedBounds.top)-mm(distance);
      selectedItem.translate(x,y);
      //alert("已將選取物件對齊至置中");
  } else {
      alert("請先選取一個物件！");
      return null;
  }
}


//
/**
 * topCenterXYByPoint(anchor, moveItemB, selectName)
 * ------------------------------------------------------
 * 以某個「點」為基準對齊（通常是中線 PathPoint）。
 *
 * 流程：
 *   1. 在 moveItemB 內找到 selectName（例如「底色」或「邊界」）
 *   2. 計算該物件 top 邊界
 *   3. 將其對齊到 anchor 所在位置
 *
 * 用途：
 *   - 袖子中線對齊前後片中線
 *   - 裁片旋轉後仍能精準對齊中線
 */
function topCenterXYByPoint(anchor,moveItemB,selectName){
  foundItem = findPageItemInGroupFirst(moveItemB,selectName);
  targetBounds = getBounds(foundItem);
  x = (anchor[0]-targetBounds.centerX);
  y = (anchor[1]-targetBounds.top);
  moveItemB.translate(x,y);
  return moveItemB;
}

/**
 * topCenterXYByEllipse(anchor, ellipse, moveItem)
 * --------------------------------------------------------------
 * 📌 功能說明
 * 將 moveItem（某個群組或物件）依照 ellipse（橢圓形）的外框進行「頂部貼齊 + 水平置中」，
 * 並讓 ellipse 的頂部位置貼到 anchor 指定的位置。
 *
 * 換句話說：
 *   ➜ anchor = 目標位置（座標點）
 *   ➜ ellipse = 基準橢圓（提供 top 與 centerX）
 *   ➜ moveItem = 整組要移動的物件
 *
 * 此函式主要作為「特殊定位點對齊工具」，
 * 尤其在你用橢圓來代表某種「定位基準」（如袖子圓弧定位點、胸線標記點）時最好用。
 *
 * --------------------------------------------------------------
 * 📌 運作流程（簡易視覺化）
 *
 *    anchor[x,y]
 *         ↓ (anchor is target top position)
 *    ┌─────────────┐
 *    │   ellipse   │   ← 基準 Ellipse 外框
 *    └─────────────┘
 *         ↓ adjust
 *    [ moveItem ]
 *
 * --------------------------------------------------------------
 * 📌 使用情境（在你的裁片流程中）
 *
 * ✔ 你用 Ellipse 做「定位點」時
 * ✔ 袖子中線需對齊某圓形定位點
 * ✔ 領口或肩線附近需精準對齊一個曲線基準
 * ✔ 在某些自動化定位流程中，Ellipse 代表 “定位區域”
 *
 * Example:
 *   topCenterXYByEllipse(pt, sleeveCircle, 印花圖案)
 *
 * 代表：
 *   → 把印花圖案貼齊到 sleeveCircle 的頂部中心
 *   → 並把該中心點移動到 anchor（pt）的位置
 *
 * --------------------------------------------------------------
 * @param {Array} anchor      - 目標對齊位置，[x,y] 座標
 * @param {PageItem} ellipse  - 基準橢圓，用來取得 top & centerX
 * @param {PageItem} moveItem - 要整組移動的物件（群組或 Path）
 *
 * @returns {void}
 */
function topCenterXYByEllipse(anchor,ellipse,moveItem){
  targetBounds = getBounds(ellipse);
  x = (anchor[0]-targetBounds.centerX);
  y = (anchor[1]-targetBounds.top);
  moveItem.translate(x,y);
}

//中線點專用
//a = topMoveXYByGroup("縫份", "左袖_前","中線",anchor);
/**
 * topMoveXYByGroup(layerName, targetItemName , selectName, anchor)
 * ------------------------------------------------------
 * 以群組中 selectName（通常是「中線」路徑）的第一個 anchor 點為基準，
 * 將 groupItem 整組移動到 anchor 指定的位置。
 *
 * 用途：
 *   - 袖子中線對齊
 *   - 前後片中線精準貼齊
 *   - 自動換版與配對
 */
function topMoveXYByGroup(layerName, targetItemName , selectName,anchor){
  var doc = app.activeDocument;
  // 確認選取一個物件
  var groupItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
  // var foundItem = findPageItemInGroupFirst(groupItem,selectName);
  var foundItem = getPathItemByTwoLevel(layerName, targetItemName, selectName);
  pt = foundItem.pathPoints[0].anchor;
  x2 = pt[0];
  y2 = pt[1];
  x = (anchor[0]-pt[0]);
  y = (anchor[1]-pt[1]);
  //selectedItem.translate(x,y);
  //alert("已將選取物件對齊至置中");
  groupItem.translate(x,y);
  return groupItem;

}

/**
 * bottomCenterByItems(itemA, nameA, itemB, nameB, distance)
 * ------------------------------------------------------
 * 讓 itemB 的 nameB 物件對齊 itemA 的 nameA 物件底部，並水平置中。
 *
 * 流程：
 *   1. 在 itemA 群組中找 nameA → 用 findPageItemInGroup
 *   2. 在 itemB 群組中找 nameB
 *   3. 水平置中
 *   4. 垂直靠底（距離 distance mm）
 *
 * 用途：
 *   - 將背號對齊前片下擺（或 LOGO 下緣）
 *   - A 與 B 都是群組時，指定要對齊哪個子物件
 */
function bottomCenterByItems(itemA,nameA,itemB,nameB,distance){
    a = findPageItemInGroup(itemA, nameA);
    b = findPageItemInGroup(itemB, nameB);
    targetBounds = getBounds(a);
    selectedBounds = getBounds(b);
    x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
    y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)-mm(distance);
    itemB.translate(x,y);
    //alert("已將選取物件對齊至置中");
}

//選擇的物件直接對齊指定的pgaeItem ,用在對齊框
//("操作","對齊物件大背號",0);
//layerName "操作"
//targetItemName "對齊物件大背號"
//distance 0
/**
 * bottomCenterSelectItemToLayerItem(layerName, targetItemName, distance)
 * ------------------------------------------------------
 * 選取物件 B → 置中對齊 layerName 中 targetItemName 的底部。
 *
 * 用途：
 *   - 對齊框（例如：放大背號時靠底對齊）
 *   - 客製化位置貼合
 */
function bottomCenterSelectItemToLayerItem(layerName, targetItemName,distance){
    var doc = app.activeDocument;
    //LayerItem
    a = getPageItemByNameInLayer(doc,layerName,targetItemName);
    //SelectItem
    b =  doc.selection[0];
    targetBounds = getBounds(a);
    selectedBounds = getBounds(b);
    x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
    y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)-mm(distance);
    b.translate(x,y);
    //alert("已將選取物件對齊至置中");
}


//選擇的物件直接對齊指定的pgaeItem ,用在對齊框
//("操作","對齊物件大背號",0);
//layerName "操作"
//targetItemName "對齊物件大背號"
//distance 0
/**
 * bottomRightSelectItemToLayerItem
 * ------------------------------------------------------
 * 將選取物件 B 對齊指定物件 A 的右下角。
 *
 * 用途：
 *   - 右下角貼齊（例如：小標語放置）
 *   - 框線對齊某個參考物件
 */
function bottomRightSelectItemToLayerItem(layerName, targetItemName,distance){
    var doc = app.activeDocument;
    //LayerItem
    a = getPageItemByNameInLayer(doc,layerName,targetItemName);
    //SelectItem
    b =  doc.selection[0];
    targetBounds = getBounds(a);
    selectedBounds = getBounds(b);
    x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width);
    y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)-mm(distance);
    b.translate(x,y);
    //alert("已將選取物件對齊至置中");
}


/**
 * topCenterByItems(itemA, nameA, itemB, nameB, distance)
 * ------------------------------------------------------
 * itemB 的 nameB 物件 → 對齊 itemA 的 nameA 頂部（貼齊 + 距離）
 *
 * 用途：
 *   - 上胸 LOGO 對齊前片胸線
 *   - 袖子裝飾往頂部擺放
 */
function topCenterByItems(itemA,nameA,itemB,nameB,distance){
    a = findPageItemInGroup(itemA, nameA);
    b = findPageItemInGroup(itemB, nameB);
    targetBounds = getBounds(a);
    selectedBounds = getBounds(b);
    x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
    y = (targetBounds.top -selectedBounds.top)-mm(distance);
    itemB.translate(x,y);
    //alert("已將選取物件對齊至置中");
}

/**
 * topCenterByTowItems(moveItem, itemA, itemB)
 * ------------------------------------------------------
 * 功能說明：
 *   將 moveItem 移動到：
 *     - 水平置中於 itemA
 *     - 垂直方向貼齊 itemA 的「上緣（top）」
 *
 *   計算方式：
 *     1. 以 itemA 為「對齊目標」
 *     2. 取得 itemA 與 itemB 的外框範圍（bounds）
 *     3. 計算水平中心差（X）
 *     4. 計算頂部對齊差（Y）
 *     5. 將 moveItem 進行 translate 位移
 *
 * 常見用途：
 *   - 上胸 LOGO 對齊前片胸線
 *   - 裝飾圖形貼齊裁片上緣
 *   - 袖子或口袋元素往上靠齊
 *
 * 注意事項：
 *   - moveItem 與 itemB 通常是「同一個物件」
 *     （itemB 用來計算位置，moveItem 負責實際移動）
 *   - getBounds() 需回傳：
 *       { left, top, width, height }
 *
 * 參數說明：
 *   @param {PageItem} moveItem 要被移動的物件
 *   @param {PageItem} itemA    對齊目標（參考上緣與中心）
 *   @param {PageItem} itemB    用來計算原始位置的物件
 * ------------------------------------------------------
 */
function topCenterByTowItems(moveItem, itemA, itemB) {

    // 取得目標物件（itemA）的邊界
    var targetBounds = getBounds(itemA);

    // 取得被移動物件（itemB）的邊界
    var selectedBounds = getBounds(itemB);

    // 計算水平置中位移（X）
    var x =
        (targetBounds.left - selectedBounds.left) +
        (targetBounds.width - selectedBounds.width) / 2;

    // 計算垂直貼齊上緣位移（Y）
    var y =
        (targetBounds.top - selectedBounds.top);

    // 套用位移
    moveItem.translate(x, y);
}



/**
 * groupItem 舊的遮罩群組
 * name 舊的遮罩形狀名稱,通常是底色
 * newMask 新的遮罩形狀,通常名稱為底色
 */
 /**
 * replaceClippingByName(groupItem, name, newMask)
 * ------------------------------------------------------
 * 將群組 groupItem 中的「舊遮罩（name）」替換成 newMask。
 *
 * groupItem 必須是裁片遮罩群組（clipped = true）。
 *
 * 流程：
 *   1. 找 groupItem 裡指定名稱 name 的遮罩（通常為 "底色"）
 *   2. 將 newMask 複製進 groupItem，放在最上面（成為新的 clipping = true）
 *   3. 移除舊底色
 *   4. 保持 groupItem.clipped = true
 *
 * 用途：
 *   - 自動修正裁片底色
 *   - 生成新板型後替換底色
 *   - 袖子、褲子換底色版型後對齊內容
 */
function replaceClippingByName(groupItem, name, newMask) {
    if (!groupItem.clipped) {
        alert("這個群組不是遮罩群組！");
        return;
    }
    var doc = app.activeDocument;
    var oldClip = null;
    oldClip = findPageItemInGroup(groupItem, name);
    // 複製新的遮罩圖形
    //var newMask = newShape.duplicate();
    //newMask.move(groupItem,ElementPlacement.PLACEATBEGINNING);
    newMask.move(groupItem,ElementPlacement.PLACEATBEGINNING);
    newMask.clipping = true;
    // 移除原本的遮罩
    oldClip.remove();
    // 確保群組還是遮罩狀態
    groupItem.clipped = true;

    //alert("已成功替換遮罩：" + name);
}

//✔ 可把任意物件包成一組遮罩群組
//✔ 自動生成 clipping group 結構
//✔ 用於「裁片組裝」、「自動建立版型群組」、「一鍵包裝內容」

/**
 * createClippingGroup(maskShape, contentGroup)
 * ------------------------------------------------------
 * 以 maskShape（遮罩）＋ contentGroup（內容）建立新的遮罩群組。
 *
 * 流程：
 *   1. 在 maskShape 的父層中建立新的 group
 *   2. 將 contentGroup 整組移進該新的 group 中
 *   3. 複製 maskShape 作為 clipping path 放到最前面
 *   4. 設 group.clipped = true
 *
 * 用途：
 *   - 建立新的裁片群組
 *   - 將印花內容包進裁片底色範圍
 *   - 建立「智慧裁片」供後續自動對齊使用
 */
function createClippingGroup(maskShape, contentGroup) {
  var parentContainer = maskShape.parent; // 可為圖層或群組

  // 建立新的遮罩群組（在 maskShape 的父容器中）
  var clippingGroup = parentContainer.groupItems.add();
  clippingGroup.name = "遮罩群組";

  // 將 contentGroup 直接移動進來
  contentGroup.move(clippingGroup, ElementPlacement.PLACEATEND);

  // 複製遮罩進來，設為 clipping
  var maskCopy = maskShape.duplicate(clippingGroup, ElementPlacement.PLACEATBEGINNING);
  maskCopy.clipping = true;

  // 設為遮罩群組
  clippingGroup.clipped = true;
  return clippingGroup;
}





//bottomCenter（"縫份","後片",100）;

//center("縫份","前片");
