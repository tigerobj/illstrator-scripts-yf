var doc = app.activeDocument;


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


function wordToGroup(layer) {
    var groups = [];
    layerName = layer.name;
    for (var i = 0; i < layer.groupItems.length; i++) {
        var group = layer.groupItems[i];
        if("尺寸字" == group.name){

          //alert("尺寸字 length : "+group.textFrames.length);
          for(var j = 0;j<group.textFrames.length;j++){
            textFrame = group.textFrames[j];
            var str  = textFrame.contents;



            if (str.indexOf("右袖") !== -1) {
                item = getPageItemByNameInLayer(doc,"1","右袖");
                groups.push([textFrame,item]);
                alert("右袖");
            }else if (str.indexOf("左袖") !== -1) {
                item = getPageItemByNameInLayer(doc,"1","左袖");
                groups.push([textFrame,item]);
                alert("左袖");
            }else if (str.indexOf("前片") !== -1) {
                item = getPageItemByNameInLayer(doc,"1","前片");
                groups.push([textFrame,item]);
                alert("前袖");
            }else if (str.indexOf("後片") !== -1) {
                item = getPageItemByNameInLayer(doc,"1","後片");
                groups.push([textFrame,item]);
                alert("後袖");
            }else{
                item = getPageItemByNameInLayer(doc,"1","領");
                groups.push([textFrame,item]);
                alert("領");
            }

          }
        }
    }

    for(var i=0;i<groups.length;i++){
      groups[i][0].move(groups[i][1], ElementPlacement.PLACEATBEGINNING);
    }

    return groups;
}



for (var i = 0; i < doc.layers.length; i++) {
  if("1" === doc.layers[i].name){
    wordToGroup(doc.layers[i])

    //getTopLevelGroupsFromLayer(doc.layers[i]);
  }
}
