if (app.documents.length === 0) {
    alert("沒有開啟的文件。");
} else {
    try {
        var doc = app.activeDocument;
        deselectAll(doc);

        var cropLayer = findLayerByNameRecursive(doc, "裁切");
        if (!cropLayer) {
            throw new Error("找不到「裁切」圖層。");
        }

        var targetGroups = [];
        collectGroupsByName(cropLayer, "記號線", targetGroups);
        if (targetGroups.length === 0) {
            throw new Error("在「裁切」圖層內找不到名稱為「記號線」的群組。");
        }

        for (var j = 0; j < targetGroups.length; j++) {
            moveItemToFirstPosition(targetGroups[j]);
        }

        var selectedItems = [];
        for (var i = 0; i < targetGroups.length; i++) {
            collectSelectableItems(targetGroups[i], selectedItems);
        }

        if (selectedItems.length === 0) {
            throw new Error("有找到「記號線」群組，但裡面沒有可選取的物件。");
        }

        var choice = showStrokeColorDialog();
        if (!choice) {
            alert("已取消。保留目前選取結果，未變更筆畫顏色。");
        } else {
            var strokeColor = createRgbColor(choice);
            var changedCount = applyStrokeColorToItems(selectedItems, strokeColor);

            alert(
                "已取消原本選取並完成記號線物件處理。\n" +
                "找到記號線群組數：" + targetGroups.length + "\n" +
                "選取物件數：" + selectedItems.length + "\n" +
                "筆畫改為" + (choice === "white" ? "白色" : "黑色") + "的物件數：" + changedCount
            );
        }
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

    for (var i = 0; i < doc.pageItems.length; i++) {
        try {
            doc.pageItems[i].selected = false;
        } catch (e3) {
        }
    }
}

function findLayerByNameRecursive(container, targetName) {
    for (var i = 0; i < container.layers.length; i++) {
        var layer = container.layers[i];
        if (layer.name === targetName) {
            return layer;
        }

        var nested = findLayerByNameRecursive(layer, targetName);
        if (nested) {
            return nested;
        }
    }

    return null;
}

function collectGroupsByName(container, targetName, result) {
    var items = container.pageItems;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.parent !== container || item.typename !== "GroupItem") {
            continue;
        }

        if (isItemUnavailable(item)) {
            continue;
        }

        if (item.name === targetName) {
            result.push(item);
        }

        collectGroupsByName(item, targetName, result);
    }
}

function collectSelectableItems(container, result) {
    var items = container.pageItems;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.parent !== container) {
            continue;
        }

        if (isItemUnavailable(item)) {
            continue;
        }

        if (item.typename === "GroupItem") {
            collectSelectableItems(item, result);
            continue;
        }

        item.selected = true;
        result.push(item);
    }
}

function moveItemToFirstPosition(item) {
    var parent = item.parent;
    if (!parent || !parent.pageItems || parent.pageItems.length <= 1) {
        return;
    }

    var firstSibling = getFirstSiblingInParent(parent, item);
    if (!firstSibling) {
        return;
    }

    try {
        item.move(firstSibling, ElementPlacement.PLACEBEFORE);
    } catch (e) {
        try {
            item.zOrder(ZOrderMethod.SENDTOBACK);
        } catch (e2) {
        }
    }
}

function getFirstSiblingInParent(parent, currentItem) {
    for (var i = 0; i < parent.pageItems.length; i++) {
        var sibling = parent.pageItems[i];
        if (sibling !== currentItem && sibling.parent === parent) {
            return sibling;
        }
    }

    return null;
}

function isItemUnavailable(item) {
    return item.locked || item.hidden;
}

function showStrokeColorDialog() {
    var dialog = new Window("dialog", "記號線筆畫顏色");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];

    dialog.add("statictext", undefined, "請選擇要套用到選取物件的筆畫顏色：");

    var optionGroup = dialog.add("panel", undefined, "顏色");
    optionGroup.orientation = "column";
    optionGroup.alignChildren = ["left", "top"];

    var whiteRadio = optionGroup.add("radiobutton", undefined, "白色");
    var blackRadio = optionGroup.add("radiobutton", undefined, "黑色");
    whiteRadio.value = true;

    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = ["right", "center"];
    var okButton = buttonGroup.add("button", undefined, "確定", {name: "ok"});
    buttonGroup.add("button", undefined, "取消", {name: "cancel"});

    okButton.onClick = function () {
        dialog.close(1);
    };

    if (dialog.show() !== 1) {
        return null;
    }

    return whiteRadio.value ? "white" : "black";
}

function createRgbColor(choice) {
    var color = new RGBColor();
    if (choice === "white") {
        color.red = 255;
        color.green = 255;
        color.blue = 255;
    } else {
        color.red = 0;
        color.green = 0;
        color.blue = 0;
    }
    return color;
}

function applyStrokeColorToItems(items, strokeColor) {
    var changedCount = 0;

    for (var i = 0; i < items.length; i++) {
        changedCount += applyStrokeColor(items[i], strokeColor);
    }

    return changedCount;
}

function applyStrokeColor(item, strokeColor) {
    if (isItemUnavailable(item)) {
        return 0;
    }

    if (item.typename === "CompoundPathItem") {
        var compoundChanged = 0;
        for (var i = 0; i < item.pathItems.length; i++) {
            compoundChanged += setStrokeIfSupported(item.pathItems[i], strokeColor);
        }
        return compoundChanged;
    }

    if (item.typename === "TextFrame") {
        var textChanged = 0;

        try {
            item.textRange.characterAttributes.strokeColor = strokeColor;
            textChanged = 1;
        } catch (e) {
        }

        try {
            item.stroked = true;
            item.strokeColor = strokeColor;
        } catch (e2) {
        }

        return textChanged;
    }

    return setStrokeIfSupported(item, strokeColor);
}

function setStrokeIfSupported(item, strokeColor) {
    try {
        item.stroked = true;
        item.strokeColor = strokeColor;
        return 1;
    } catch (e) {
        return 0;
    }
}
