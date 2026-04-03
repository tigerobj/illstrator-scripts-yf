if (app.documents.length === 0) {
    alert("沒有開啟的文件。");
} else {
    try {
        var doc = app.activeDocument;
        deselectAll(doc);

        var targetLayer = findTargetLayer(doc);
        if (!targetLayer) {
            throw new Error("找不到「圖層 5」。");
        }

        // 只處理圖層 5 下面的直接群組
        var scanContainer = targetLayer;
        var groupCount = 0;
        var selectedCount = 0;

        var directGroups = getDirectGroups(scanContainer);
        for (var i = 0; i < directGroups.length; i++) {
            var group = directGroups[i];
            groupCount++;

            var boundaryItem = findNamedDescendant(group, "邊界");
            var baseItem = findNamedDescendant(group, "底色");

            if (boundaryItem && baseItem && !baseItem.locked && !isHidden(baseItem)) {
                baseItem.selected = true;
                selectedCount++;
            }
        }

        alert(
            "已取消原本選取。\n" +
            "掃描群組數：" + groupCount + "\n" +
            "選取到底色物件數：" + selectedCount
        );
    } catch (error) {
        alert("執行失敗：" + error.message);
    }
}

function deselectAll(doc) {
    try {
        app.executeMenuCommand("deselectall");
    } catch (e) {
    }

    try {
        doc.selection = null;
    } catch (e2) {
    }
}

function findTargetLayer(doc) {
    var names = ["圖層 5", "圖層5"];
    for (var i = 0; i < names.length; i++) {
        var found = findLayerByName(doc, names[i]);
        if (found) {
            return found;
        }
    }

    if (doc.layers.length >= 5) {
        return doc.layers[4];
    }

    return null;
}

function findLayerByName(container, targetName) {
    for (var i = 0; i < container.layers.length; i++) {
        var layer = container.layers[i];
        if (layer.name === targetName) {
            return layer;
        }

        var nested = findLayerByName(layer, targetName);
        if (nested) {
            return nested;
        }
    }

    return null;
}

function getDirectGroups(container) {
    var groups = [];
    for (var i = 0; i < container.pageItems.length; i++) {
        var item = container.pageItems[i];
        if (item.typename === "GroupItem" && item.parent === container) {
            groups.push(item);
        }
    }
    return groups;
}

function findNamedDescendant(group, targetName) {
    for (var i = 0; i < group.pageItems.length; i++) {
        var item = group.pageItems[i];
        if (item.name === targetName) {
            return item;
        }
    }
    return null;
}

function isHidden(item) {
    var current = item;
    while (current) {
        if (current.hidden) {
            return true;
        }

        if (!current.parent || current.parent === current) {
            break;
        }

        current = current.parent;
        if (current.typename === "Document") {
            break;
        }
    }
    return false;
}
