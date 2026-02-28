#target illustrator

(function () {
    if (app.documents.length === 0) { alert("請先開啟文件。"); return; }
    if (!app.activeDocument.selection || app.activeDocument.selection.length === 0) {
        alert("請先選取一個文字或包含文字的群組。"); return;
    }

    var userText = Window.prompt("請輸入要取代的數字或文字：", "");
    if (userText === null) return;

    var sel = app.activeDocument.selection;
    var processed = 0;

    // 幾何中心（使用可見邊界，較符合視覺）
    function getCenter(item){
        var b = item.visibleBounds; // [L,T,R,B]
        return [(b[0]+b[2])/2, (b[1]+b[3])/2];
    }

    // 將任何選到的東西，盡可能轉成 TextFrame
    function toTextFrames(item, out){
        if (!item || item.locked || item.hidden) return;

        var tn = item.typename;
        if (tn === "TextFrame") {
            out.push(item);
        } else if (tn === "TextRange" || tn === "InsertionPoint") {
            // 編輯文字模式會出現這兩種；往上找 TextFrame
            try {
                var tf = item.parent;
                while (tf && tf.typename !== "TextFrame" && tf.parent) tf = tf.parent;
                if (tf && tf.typename === "TextFrame") out.push(tf);
            } catch(e){}
        } else if (tn === "GroupItem" || tn === "Layer") {
            for (var i=0; i<item.pageItems.length; i++) toTextFrames(item.pageItems[i], out);
        } else if (tn === "CompoundPathItem" || tn === "PathItem" || tn === "SymbolItem") {
            // 已外框化或是符號：沒有文字可換，略過
        }
    }

    for (var i=0; i<sel.length; i++){
        var list = [];
        toTextFrames(sel[i], list);

        for (var j=0; j<list.length; j++){
            var oldTF = list[j];
            try{
                var oldCenter = getCenter(oldTF);
                var oldName = oldTF.name;

                // 複製承接所有外觀（字型、大小、顏色、筆畫、效果…）
                var newTF = oldTF.duplicate();
                newTF.contents = userText;

                // 置中對齊（避免多位數時左右跑位）
                try { newTF.textRange.paragraphAttributes.justification = Justification.CENTER; } catch(e){}

                // 回到原幾何中心
                var newCenter = getCenter(newTF);
                newTF.translate(oldCenter[0]-newCenter[0], oldCenter[1]-newCenter[1]);

                try { newTF.name = oldName; } catch(e){}
                oldTF.remove();
                newTF.selected = true;

                processed++;
            }catch(err){ /* 單一失敗不影響其他 */ }
        }
    }

    if (processed === 0) {
        alert("找不到可取代的文字物件。\n若是外框化（路徑）就無法直接替換。");
    } else {
        alert("已成功取代 " + processed + " 個文字物件。");
    }
})();
