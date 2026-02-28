#include "json2.js";

/**
 * 在指定圖層中根據名稱獲取頁面物件，包括群組和遮罩內的物件。
 *
 * @param {Document} doc - Adobe Illustrator 文件對象。
 * @param {string} layerName - 圖層的名稱。
 * @param {string} itemName - 頁面物件的名稱。
 * @param {string} lineName - 線的名稱。
 * @returns {PageItem|null} - 返回對應的頁面物件，如果未找到則返回 null。
 */
function getPageItemByNameInLayer(doc, layerName, itemName,lineName) {
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
    } catch (e) {
        log(["在圖層 '" + layerName + "' 中未找到名為 '" + itemName + "' 的 pageItem。"]);
        return null;
    }

    var items = pageItem.pageItems;
    for (var i = 0; i < items.length; i++) {
      if (items[i].name === lineName) {
          return items[i];
      }
    }

}

doc = app.activeDocument;
tmp = getPageItemByNameInLayer(doc,"裁切","後片","後領線");
if(tmp){
  tmp.selected = true;
}
tmp = getPageItemByNameInLayer(doc,"裁切","前片","左前線");
if(tmp){
  tmp.selected = true;
}
tmp = getPageItemByNameInLayer(doc,"裁切","前片","右前線");
if(tmp){
  tmp.selected = true;
}
tmp = getPageItemByNameInLayer(doc,"裁切","左袖","左袖線");
if(tmp){
  tmp.selected = true;
}
tmp = getPageItemByNameInLayer(doc,"裁切","右袖","右袖線");
if(tmp){
  tmp.selected = true;
}
