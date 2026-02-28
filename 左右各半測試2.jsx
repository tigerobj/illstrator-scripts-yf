#include "json2.js";
#include "對齊置中.jsx";

/**
 * 去空白
 */
String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
}

/**
 * 判斷當前目錄下是否存在名為 'clothes.csv' 的檔案
 *
 * @returns {File} - 如果找到 'clothes.csv' 則返回檔案物件，否則返回 null
 */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    var file = new File(pathEnv + '/旋轉-新圓領衫.csv');
    if (!file.exists) {
        alert(pathEnv + '/衣服配置檔.csv 檔案不存在！請複製 衣服配置檔.csv，再重新執行');
        return null;
    }
    return file;
}

function splitSleeveInSeamLayer(sleeveName) {
    var doc = app.activeDocument;
    var seamLayer;
    try {
        seamLayer = doc.layers.getByName("縫份");
    } catch (e) {
        alert("找不到圖層「縫份」");
        return;
    }

    var original;
    try {
        original = seamLayer.pageItems.getByName(sleeveName);
    } catch (e) {
        alert("在圖層「縫份」中找不到路徑：" + sleeveName);
        return;
    }
    if (original.typename !== "PathItem") {
        alert(sleeveName + " 不是 PathItem！");
        return;
    }

    var vb = original.visibleBounds; // [left, top, right, bottom]
    var left   = vb[0],
        top    = vb[1],
        right  = vb[2],
        bottom = vb[3];
    var width   = right - left,
        height  = top - bottom,
        centerX = left + width / 2;

    var leftGroupName, rightGroupName;
    if (sleeveName === "左袖") {
        leftGroupName  = "左袖_前";
        rightGroupName = "左袖_後";
    } else if (sleeveName === "右袖") {
        leftGroupName  = "右袖_後";
        rightGroupName = "右袖_前";
    } else {
        alert("僅支援「左袖」或「右袖」！");
        return;
    }

    function getOrCreateGroup(layer, name) {
        try {
            return layer.groupItems.getByName(name);
        } catch (e) {
            var g = layer.groupItems.add();
            g.name = name;
            return g;
        }
    }
    var leftGroup  = getOrCreateGroup(seamLayer, leftGroupName);
    var rightGroup = getOrCreateGroup(seamLayer, rightGroupName);

    //original.hidden = false;

    function makeHalf(group, x, w) {
        original.duplicate(group, ElementPlacement.PLACEATBEGINNING);
        var mask = group.pathItems.rectangle(
            top, // y
            x,   // x
            w,   // width
            height
        );
        mask.stroked  = false;
        mask.filled   = true;
        mask.clipping = true;
        group.clipped = true;
    }

    makeHalf(leftGroup, left,        centerX - left);
    makeHalf(rightGroup, centerX,    right - centerX);

    // 改用 for 迴圈代替 forEach
    var groups = [leftGroup, rightGroup];
    for (var i = 0; i < groups.length; i++) {
        var grp = groups[i];
        var ln = grp.pathItems.add();
        ln.setEntirePath([[centerX, top], [centerX, bottom]]);
        ln.stroked     = true;
        ln.strokeWidth = 0.5;
        var c = new CMYKColor(); c.black = 100;
        ln.strokeColor = c;
        ln.filled      = false;
        ln.name        = "中線";
    }

    alert("已在圖層「縫份」中，將「" + sleeveName + "」分割並放入「前／後」群組！");
}

/**
 * 讀取csv值,儲存成key,value物件值.
 * key為第一欄
 * values為第二欄
 */
function readCsvToObj(csvFile){
	csvFile.open('r');
	var obj = new Object();
	while (s = csvFile.readln()) {
		kv = s.split(';');
		if(kv.length ==1){
			kv = s.split(',');
			if(kv.length ==1){
				alert("檔案分隔符號有問題請檢查檔案");
			}
		}
		obj[kv[0]] = kv[1];
	}
	return obj;
	csvFile.close();

}

function rotateFrom90ToSlope(targetSlope, targetItem,anchor,num) {
    if (!targetItem) {
        var sel = app.activeDocument.selection;
        if (sel.length !== 1 || sel[0].typename !== "PathItem") {
            alert("請選取一個 PathItem");
            return;
        }
        targetItem = sel[0];
    }

    var originalAngle = -90*num; // 預設是從垂直最上點開始
    var targetAngle = Math.atan(targetSlope) * 180 / Math.PI;
    var rotateBy = targetAngle - originalAngle;

    targetItem.rotate(
        rotateBy,
        true,  // 對物件有效
        true,  // 對圖樣有效
        true,  // 對漸層有效
        true,  // 對筆畫有效
        Transformation.TOP,
        [anchor[0],anchor[1]]
    );
}

//(targetSlope, targetItem,anchor,num)
function rotateAroundPoint(targetSlope, targetItem,anchor,num) {
    var originalAngle = -90*num; // 預設是從垂直最上點開始
    var targetAngle = Math.atan(targetSlope) * 180 / Math.PI;
    var angleDeg = targetAngle - originalAngle;

    var rad = angleDeg * Math.PI / 180;
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);

    var matrix = app.getRotationMatrix(angleDeg);

    // 先平移物件，使中心對齊原點
    targetItem.translate(-anchor[0], -anchor[1]);

    // 套用旋轉
    targetItem.transform(
        matrix,
        true,  // 物件
        true,  // 圖樣
        true,  // 漸層
        true   // 筆畫
    );

    // 再平移回原中心位置
    targetItem.translate(anchor[0], anchor[1]);
}

var doc = app.activeDocument;
var selectedItem = doc.selection[0];
itemA = selectedItem.duplicate();
// itemB = selectedItem.duplicate();
// itemC = selectedItem.duplicate();
// itemD = selectedItem.duplicate();
doc.selection = null;
autoCenterByLayerAndItem("縫份","左袖",itemA);
// 執行範例
splitSleeveInSeamLayer("左袖");

newItem = getPageItemByNameInLayer(doc,"縫份","左袖_前");
itemA.move(newItem, ElementPlacement.PLACEATBEGINNING);

// splitSleeveInSeamLayer("右袖");
var file = checkForDataCsv();
var data = readCsvToObj(file);
var anchor = data["左前點"].split(',');

rotateFrom90ToSlope(data["左前點_斜率"],newItem,anchor,1);
topMoveXYByGroup("縫份", "左袖_前","中線",anchor);
//
// var anchor = data["右前點"].split(',');
// targetItem = topMoveXYByGroup("縫份", "右袖_前","中線",anchor);
// rotateFrom90ToSlope(data["右前點_斜率"],targetItem,anchor,-1);
//
// var anchor = data["左後點"].split(',');
// targetItem = topMoveXYByGroup("縫份", "左袖_後","中線",anchor);
// rotateFrom90ToSlope(data["左後點_斜率"],targetItem,anchor,-1);
//
// var anchor = data["右後點"].split(',');
// targetItem = topMoveXYByGroup("縫份", "右袖_後","中線",anchor);
// rotateFrom90ToSlope(data["右後點_斜率"],targetItem,anchor,1);
