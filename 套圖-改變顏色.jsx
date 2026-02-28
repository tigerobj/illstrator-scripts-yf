#include "json2.js";
#include "對齊置中.jsx";
/**
 * 選取所有與目前所選物件填色相同的物件
 * baseItem 目前顏色 P1,P2...
 * changItem 指定顏色 P1,P2...
 */
function selectSameFillColor(groupItem,baseItem,changItem) {

    var baseFill = baseItem.fillColor;

    // 清空現有選取
    app.selection = null;

    var matchedItems = [];

    /**
     * 判斷 TextFrame 是否有填色
     * @param {TextFrame} textFrame - 文字框物件
     * @returns {Boolean} - 是否有填色
     */
    function isTextFrameFilled(textFrame) {
        if (textFrame.typename !== "TextFrame") return false;

        try {
            var fillColor = textFrame.textRange.characterAttributes.fillColor;
            return fillColor != null && fillColor.typename !== "NoColor";
        } catch (e) {
            return false;
        }
    }


    // 遞迴搜尋函數
    function searchSameFill(item) {
        if (item.typename === "PathItem" && item.filled) {
          if( colorsEqual(item.fillColor, baseFill)){
            matchedItems.push(item);
            item.fillColor = changItem.fillColor;
          }else if (item.fillColor.typename === "GradientColor"){
            alert("GradientColor");
          }

        }else if (item.typename === "CompoundPathItem") {
            for (var p = 0; p < item.pathItems.length; p++) {
                searchSameFill(item.pathItems[p]);
            }
        } else if (item.typename === "GroupItem") {
            for (var g = 0; g < item.pageItems.length; g++) {
                searchSameFill(item.pageItems[g]);
            }
        } else if (isTextFrameFilled(item) && colorsEqual(item.textRange.fillColor, baseFill)) {
            matchedItems.push(item);
            item.textRange.fillColor = changItem.fillColor;
        } else if (isMeshItem(item)){

            //alert(item.name+","+meshItem.);
            // for(var m = 0;m<item.meshPoints.length; mm++){
            //     mItem = item.meshPoints[m];
            //     if(mItem && mItem.filled && colorsEqual(mItem.fillColor, baseFill)){
            //         matchedItems.push(mItem);
            //     }
            // }
        }
    }

    // 遞迴搜尋函數
    // function searchSameFill(item) {
    //     if (item.typename === "PathItem" && item.filled) {
    //         if (colorsEqual(item.fillColor, baseFill)) {
    //             matchedItems.push(item);
    //             item.fillColor = changItem.fillColor;
    //         } else if (item.fillColor.typename === "GradientColor" && baseFill.typename === "GradientColor") {
    //             alert("漸層");
    //             if (gradientEqual(item.fillColor, baseFill)) {
    //                 alert("漸層2");
    //                 matchedItems.push(item);
    //                 item.fillColor = changItem.fillColor;
    //             }
    //         }
    //     } else if (item.typename === "CompoundPathItem") {
    //         for (var p = 0; p < item.pathItems.length; p++) {
    //             searchSameFill(item.pathItems[p]);
    //         }
    //     } else if (item.typename === "GroupItem") {
    //         for (var g = 0; g < item.pageItems.length; g++) {
    //             searchSameFill(item.pageItems[g]);
    //         }
    //     } else if (isTextFrameFilled(item)) {
    //         var textColor = item.textRange.fillColor;
    //         if (colorsEqual(textColor, baseFill)) {
    //             matchedItems.push(item);
    //             item.textRange.fillColor = changItem.fillColor;
    //         } else if (textColor.typename === "GradientColor" && baseFill.typename === "GradientColor") {
    //             if (gradientEqual(textColor, baseFill)) {
    //                 matchedItems.push(item);
    //                 item.textRange.fillColor = changItem.fillColor;
    //             }
    //         }
    //     } else if (isMeshItem(item)) {
    //         // Mesh 填色處理（未完整支援，可視版本補完）
    //     }
    // }


    /**
     * 判斷指定物件是否為網格物件 (MeshItem)
     * @param {PageItem} item - 要判斷的物件
     * @returns {Boolean} - 若是網格物件，則回傳 true
     */
    function isMeshItem(item) {
        return item.typename === "MeshItem";
    }

    /**
 * 顯示物件的所有屬性和方法
 * @param {Object} obj 要顯示屬性的物件
 */
function inspectObject(obj) {
    var props = [];
    for (var prop in obj) {
        props.push(prop);
    }
    props.sort(); // 排序方便查看

    var msg = "物件 (" + obj.typename + ") 的屬性與方法：\n";
    for (var i = 0; i < props.length; i++) {
        try {
            var type = typeof obj[props[i]];
            msg += props[i] + " (" + type + ")\n";
        } catch(e) {
            msg += props[i] + " (unknown)\n";
        }
    }

    // 顯示結果
//    alert(msg);
}


    // 比較顏色函數
    function colorsEqual(c1, c2) {
        if (c1.typename !== c2.typename) return false;

        if (c1.typename === "CMYKColor") {
            return c1.cyan === c2.cyan &&
                   c1.magenta === c2.magenta &&
                   c1.yellow === c2.yellow &&
                   c1.black === c2.black;
        } else if (c1.typename === "RGBColor") {
            return c1.red === c2.red &&
                   c1.green === c2.green &&
                   c1.blue === c2.blue;
        } else if (c1.typename === "SpotColor") {
            return c1.spot.name === c2.spot.name && c1.tint === c2.tint;
        } else if (c1.typename === "GrayColor") {
            return c1.gray === c2.gray;
        }
        return false;
    }

    searchSameFill(groupItem);

    if (matchedItems.length === 0) {
        //alert("沒有找到相同填色的物件。");
        return;
    }

    // 選取這些物件
    //app.selection = matchedItems;
    //alert("已選取相同填色的物件，共 " + matchedItems.length + " 個。");
}

function isNameStartsWithC_(pathItem) {
    if (pathItem.typename !== "PathItem") return false;
    return /^C_/.test(pathItem.name);
}


function findPathItemByNamePart(doc,layerName,groupItemName,name) {
    //指定顏色 -> p1 -> c_
    p =getGroupByLevel(layerName, groupItemName).pageItems;
    for(var i=0;i<p.length;i++){
        if( isNameStartsWithC_(p[i])){
            return p[i];
        }
    }
    alert("沒有 C_ 顏色區塊");
    return null;
}

function changColor(gItem){
    var doc = app.activeDocument;
    // 執行函數
    pathItems = doc.layers.getByName("目前顏色").pathItems;
    for (var i = 0; i < pathItems.length; i++) {
        baseItem = pathItems[i];
        changItem = findPathItemByNamePart(doc ,"指定顏色", baseItem.name);
        selectSameFillColor(gItem,baseItem,changItem);
    }
}

function restoreColor(){
    var doc = app.activeDocument;
    items = doc.layers.getByName("目前顏色").pathItems;
    for(var i=0;i<items.length;i++){
        item = items[i];
        itemName = items[i].name;
        item2 = getPageItemByNameInLayer(doc,"顏色位置",itemName);
        item.filled = true;
        item.fillColor = item2.fillColor;
    }
}

function changBaseColor(){
    var doc = app.activeDocument;
    pathItems = doc.layers.getByName("目前顏色").pathItems;
    for (var i = 0; i < pathItems.length; i++) {
        baseItem = pathItems[i];
        changItem = findPathItemByNamePart(doc ,"指定顏色", baseItem.name);
        baseItem.fillColor = changItem.fillColor;
    }
}

var doc = app.activeDocument;
gItem = getGroupByLevel("立體版","前面");
changColor(gItem);
gItem = getGroupByLevel("立體版","後面");
changColor(gItem);
gItem = getGroupByLevel("裁切","右袖");
changColor(gItem);
gItem = getGroupByLevel("裁切","左袖");
changColor(gItem);
changBaseColor();
app.selection = null;
