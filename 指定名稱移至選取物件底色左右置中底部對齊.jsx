/**
 * 選取一個群組後，只在第一層子物件中找唯一名稱為「底色」的物件。
 * 取得底色的位置後，讓使用者輸入名稱，
 * 再於每個可見圖層中搜尋唯一同名的物件或群組，
 * 最後將該目標移到底色的左右置中、底部對齊位置。
 */

(function () {
    if (app.documents.length === 0) {
        alert("請先開啟一個文件。");
        return;
    }

    var doc = app.activeDocument;

    if (!doc.selection || doc.selection.length !== 1) {
        alert("請先只選取一個群組。");
        return;
    }

    var selectedGroup = doc.selection[0];
    if (!selectedGroup || selectedGroup.typename !== "GroupItem") {
        alert("選取的物件必須是群組。");
        return;
    }

    function trim(text) {
        return text.replace(/^\s+|\s+$/g, "");
    }

    function getBoundsInfo(item) {
        var bounds = item.geometricBounds; // [left, top, right, bottom]
        return {
            left: bounds[0],
            top: bounds[1],
            right: bounds[2],
            bottom: bounds[3],
            centerX: (bounds[0] + bounds[2]) / 2
        };
    }

    function isVisibleLayer(layer) {
        var current = layer;
        while (current) {
            if (!current.visible || current.locked) {
                return false;
            }
            if (!current.parent || current.parent.typename === "Document") {
                break;
            }
            current = current.parent;
        }
        return true;
    }

    function isVisibleInHierarchy(item) {
        var current = item;
        while (current && current.typename !== "Document") {
            if (current.typename === "Layer") {
                return isVisibleLayer(current);
            }
            if (current.hidden || current.locked) {
                return false;
            }
            current = current.parent;
        }
        return true;
    }

    function findImmediateChildrenByName(group, name) {
        var matches = [];
        var items = group.pageItems;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            if (item.parent !== group) {
                continue;
            }
            if (!isVisibleInHierarchy(item)) {
                continue;
            }

            try {
                if (item.name === name) {
                    matches.push(item);
                }
            } catch (e) {}
        }

        return matches;
    }

    function findTargetsInVisibleLayers(name) {
        var matches = [];
        var items = doc.pageItems;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            if (!isVisibleInHierarchy(item)) {
                continue;
            }

            try {
                if (item.name === name) {
                    matches.push(item);
                }
            } catch (e) {}
        }

        return matches;
    }

    var backgroundItems = findImmediateChildrenByName(selectedGroup, "底色");

    if (backgroundItems.length === 0) {
        alert("選取群組第一層裡找不到名稱為「底色」的物件。");
        return;
    }

    if (backgroundItems.length > 1) {
        alert("選取群組第一層裡有多個名稱為「底色」的物件。");
        return;
    }

    var backgroundBounds = getBoundsInfo(backgroundItems[0]);

    var targetName = prompt("請輸入要搜尋的物件或群組名稱（完全符合）：", "");
    if (targetName === null) {
        return;
    }

    targetName = trim(targetName);
    if (!targetName) {
        alert("沒有輸入名稱，已取消。");
        return;
    }

    var targets = findTargetsInVisibleLayers(targetName);

    if (targets.length === 0) {
        alert("在可見圖層中找不到名稱為「" + targetName + "」的物件或群組。");
        return;
    }

    if (targets.length > 1) {
        alert("在可見圖層中找到多個名稱為「" + targetName + "」的物件或群組。");
        return;
    }

    var targetItem = targets[0];
    var targetBounds = getBoundsInfo(targetItem);
    var dx = backgroundBounds.centerX - targetBounds.centerX;
    var dy = backgroundBounds.bottom - targetBounds.bottom;

    targetItem.translate(dx, dy);
    doc.selection = [targetItem];

    alert("已將「" + targetName + "」移動到選取物件內「底色」的左右置中、底部對齊位置。");
})();
