// === 找到 "裁切" 圖層 ===
function findLayerByName(doc, name) {
    for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].name === name) {
            return doc.layers[i];
        }
    }
    return null;
}

var doc = app.activeDocument;
var targetLayer = findLayerByName(doc, "裁切");

if (!targetLayer) {
    alert("找不到圖層：裁切");
} else {
    // 清除現有選取
    doc.selection = null;

    // 迴圈搜尋該圖層內所有項目
    function searchGroups(container) {
        for (var i = 0; i < container.pageItems.length; i++) {
            var item = container.pageItems[i];

            // 找名稱含「直條紋」
            if (item.name === "掃布線") {
                item.selected = true;
            }

            // 若還有子群組則繼續往下找
            if (item.typename === "GroupItem") {
                searchGroups(item);
            }
        }
    }

    searchGroups(targetLayer);
    alert("已選取圖層「裁切」內所有含『直條紋』的群組！");
}
