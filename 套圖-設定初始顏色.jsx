
function getPathItemsByLayer(layerName){
    var doc = app.activeDocument;
    try {
        layer = doc.layers.getByName(layerName);
        return layer.pathItems;
    } catch (e) {
        alert("找不到物件，請確認路徑名稱是否正確：\n" + e.message);
        return null;
    }
}

/**
 * 在指定圖層中根據名稱獲取頁面物件，包括群組和遮罩內的物件。
 *
 * @param {Document} doc - Adobe Illustrator 文件對象。
 * @param {string} layerName - 圖層的名稱。
 * @param {string} itemName - 頁面物件的名稱。
 * @returns {PageItem|null} - 返回對應的頁面物件，如果未找到則返回 null。
 */
function getPageItemByNameInLayer(layerName, itemName) {
    // 获取指定名称的图层
    var doc = app.activeDocument;
    try {
        targetLayer = doc.layers.getByName(layerName);
        var pageItem = targetLayer.pageItems.getByName(itemName);
        return pageItem;
    } catch (e) {
        alert("找不到物件，請確認路徑名稱是否正確：\n" + e.message);
        return null;
    }
}

items  = getPathItemsByLayer("目前顏色");
for(var i=0;i<items.length;i++){
    item = items[i];
    itemName = items[i].name;
    item2 = getPageItemByNameInLayer("顏色位置",itemName);
    item.filled = true;
    item.fillColor = item2.fillColor;
}
