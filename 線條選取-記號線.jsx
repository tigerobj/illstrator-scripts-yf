// 在「裁切」圖層中，選取所有位於「記號線」群組內的物件。
// 執行第一步會先清除整份文件目前的選取。

function clearDocumentSelection(doc) {
    // 先清空 selection 陣列
    doc.selection = null;

    // 再遍歷所有 pageItems，確保所有物件都取消選取
    for (var i = 0; i < doc.pageItems.length; i++) {
        doc.pageItems[i].selected = false;
    }
}

function findLayerByName(doc, layerName) {
    for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].name === layerName) {
            return doc.layers[i];
        }
    }
    return null;
}

function selectAllDescendants(container) {
    var items = container.pageItems;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        // 跳過鎖定或隱藏物件
        if (item.locked || item.hidden) {
            continue;
        }

        item.selected = true;

        // 若是群組，繼續往下選取所有子物件
        if (item.typename === "GroupItem") {
            selectAllDescendants(item);
        }
    }
}

function findAndSelectNotchGroups(container) {
    var pageItems = container.pageItems;

    for (var i = 0; i < pageItems.length; i++) {
        var item = pageItems[i];

        // 找到名稱為「記號線」的群組時，選取其底下所有物件
        if (item.typename === "GroupItem" && item.name === "記號線") {
            selectAllDescendants(item);
        }

        // 持續遞迴搜尋整個圖層樹
        if (item.typename === "GroupItem") {
            findAndSelectNotchGroups(item);
        }
    }
}

var doc = app.activeDocument;

// 第一個步驟：先把文件內所有物件取消選取
clearDocumentSelection(doc);

var cropLayer = findLayerByName(doc, "裁切");

if (!cropLayer) {
    alert("找不到圖層：裁切");
} else {
    findAndSelectNotchGroups(cropLayer);
    alert("已選取圖層「裁切」中「記號線」群組內的所有物件。");
}
