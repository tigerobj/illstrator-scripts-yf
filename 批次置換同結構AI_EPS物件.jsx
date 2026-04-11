/**
 * 用目前文件中已修正的單一群組或物件，
 * 批次替換資料夾內同結構 AI / EPS 檔中的同名物件。
 *
 * 規則：
 * 1. 先在來源文件選取一個已修正的群組或物件。
 * 2. 預設使用該物件的 name 當作替換識別名稱。
 * 3. 若選取物件沒有名稱，會要求手動輸入名稱。
 * 4. 開啟指定資料夾內所有 .ai / .eps，找到同名物件後進行替換。
 * 5. 替換後會套用來源物件的位置。
 */

(function () {
    if (app.documents.length === 0) {
        alert("請先開啟一個來源 AI 或 EPS 文件。");
        return;
    }

    var sourceDoc = app.activeDocument;
    if (!sourceDoc.selection || sourceDoc.selection.length !== 1) {
        alert("請先選取一個已修正的群組或物件。");
        return;
    }

    var sourceItem = sourceDoc.selection[0];
    if (!sourceItem || !sourceItem.typename || sourceItem.typename === "TextRange") {
        alert("選取的不是可用的物件。");
        return;
    }

    var targetName = "";
    try {
        targetName = sourceItem.name;
    } catch (e) {
        targetName = "";
    }

    if (!targetName) {
        targetName = prompt("選取物件沒有名稱，請輸入要替換的物件名稱：", "");
        if (!targetName) {
            alert("未輸入物件名稱，已取消。");
            return;
        }
    }

    var folder = Folder.selectDialog("請選擇要批次置換的 AI / EPS 資料夾");
    if (!folder) {
        alert("未選取資料夾。");
        return;
    }

    var sourcePath = getDocumentPath(sourceDoc);
    var sourceBounds = getBoundsInfo(sourceItem);
    var files = folder.getFiles(function (f) {
        return f instanceof File && /\.(ai|eps)$/i.test(f.name);
    });

    if (!files || files.length === 0) {
        alert("此資料夾內找不到 AI 或 EPS 檔案。");
        return;
    }

    var oldInteractionLevel = app.userInteractionLevel;
    var processed = 0;
    var replacedFiles = 0;
    var skippedFiles = [];
    var failedFiles = [];

    app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

    try {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fullPath = normalizePath(file.fsName);

            if (sourcePath && fullPath === sourcePath) {
                skippedFiles.push(file.name + "（來源檔，略過）");
                continue;
            }

            var result = processOneFile(file, sourceItem, targetName, sourceBounds);
            processed++;

            if (result.ok) {
                if (result.replaceCount > 0) {
                    replacedFiles++;
                } else {
                    skippedFiles.push(file.name + "（找不到同名物件：" + targetName + "）");
                }
            } else {
                failedFiles.push(file.name + "（" + result.message + "）");
            }
        }
    } finally {
        app.userInteractionLevel = oldInteractionLevel;
        try {
            app.activeDocument = sourceDoc;
        } catch (e2) {}
    }

    var msg = [];
    msg.push("批次置換完成");
    msg.push("來源物件名稱：" + targetName);
    msg.push("掃描檔案數：" + files.length);
    msg.push("實際處理檔案數：" + processed);
    msg.push("成功置換檔案數：" + replacedFiles);

    if (skippedFiles.length > 0) {
        msg.push("");
        msg.push("略過：");
        msg.push("- " + skippedFiles.join("\n- "));
    }

    if (failedFiles.length > 0) {
        msg.push("");
        msg.push("失敗：");
        msg.push("- " + failedFiles.join("\n- "));
    }

    alert(msg.join("\n"));

    function processOneFile(file, sourceItemRef, itemName, positionBounds) {
        var targetDoc = null;
        var replaceCount = 0;

        try {
            targetDoc = app.open(file);
            var targets = findItemsByName(targetDoc, itemName);

            if (targets.length === 0) {
                targetDoc.close(SaveOptions.DONOTSAVECHANGES);
                return {
                    ok: true,
                    replaceCount: 0,
                    message: ""
                };
            }

            for (var i = targets.length - 1; i >= 0; i--) {
                replaceOneItem(sourceItemRef, targetDoc, targets[i], positionBounds, itemName);
                replaceCount++;
            }

            saveDocumentByType(targetDoc, file);
            targetDoc.close(SaveOptions.DONOTSAVECHANGES);

            return {
                ok: true,
                replaceCount: replaceCount,
                message: ""
            };
        } catch (err) {
            try {
                if (targetDoc) {
                    targetDoc.close(SaveOptions.DONOTSAVECHANGES);
                }
            } catch (closeErr) {}

            return {
                ok: false,
                replaceCount: replaceCount,
                message: err.message || err.toString()
            };
        }
    }

    function replaceOneItem(sourceIt, targetDoc, targetItem, positionBounds, itemName) {
        unlockItemAndParents(targetItem);

        var duplicated = sourceIt.duplicate(targetDoc, ElementPlacement.PLACEATBEGINNING);
        duplicated.move(targetItem, ElementPlacement.PLACEBEFORE);

        unlockItemAndParents(duplicated);
        moveItemToBoundsPosition(duplicated, positionBounds);

        try {
            duplicated.name = itemName;
        } catch (e) {}

        targetItem.remove();
    }

    function findItemsByName(doc, name) {
        var results = [];
        var all = doc.pageItems;

        for (var i = 0; i < all.length; i++) {
            var item = all[i];
            try {
                if (item.name === name) {
                    results.push(item);
                }
            } catch (e) {}
        }

        return results;
    }

    function unlockItemAndParents(item) {
        var current = item;
        while (current) {
            try { current.locked = false; } catch (e1) {}
            try { current.hidden = false; } catch (e2) {}

            try {
                if (current.typename === "Layer") {
                    current.visible = true;
                }
            } catch (e3) {}

            try {
                current = current.parent;
            } catch (e4) {
                current = null;
            }
        }
    }

    function getBoundsInfo(item) {
        var b = item.geometricBounds;
        return {
            left: b[0],
            top: b[1],
            right: b[2],
            bottom: b[3]
        };
    }

    function moveItemToBoundsPosition(item, bounds) {
        var current = getBoundsInfo(item);
        var dx = bounds.left - current.left;
        var dy = bounds.top - current.top;
        item.translate(dx, dy);
    }

    function saveDocumentByType(doc, file) {
        if (/\.eps$/i.test(file.name)) {
            var epsOptions = new EPSSaveOptions();
            epsOptions.cmykPostScript = true;
            epsOptions.embedAllFonts = true;
            doc.saveAs(file, epsOptions);
            return;
        }

        doc.save();
    }

    function getDocumentPath(doc) {
        try {
            return normalizePath(doc.fullName.fsName);
        } catch (e) {
            return "";
        }
    }

    function normalizePath(path) {
        return String(path).replace(/\\/g, "/").toLowerCase();
    }
})();
