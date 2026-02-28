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
        alert("僅支援「左袖」或！");
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
        Transformation.CENTER
    );
}

//袖子套圖
//name 左袖或右袖
function maskImageToSleeve(name){
	var doc = app.activeDocument;
	var selectedItem = doc.selection[0];
	itemA = selectedItem.duplicate();
	itemB = selectedItem.duplicate();
	nf = name.substring(0, 1);
	num = 1;
	if("右袖" === name){
		num = -1;
	}
	autoCenterByLayerAndItem2("縫份",name,itemA);
	autoCenterByLayerAndItem2("縫份",name,itemB);
	splitSleeveInSeamLayer(name);
	newItem = getPageItemByNameInLayer(doc,"縫份",name+"_前");
	itemA.move(newItem, ElementPlacement.PLACEATBEGINNING);
	var file = checkForDataCsv();
	var data = readCsvToObj(file);
	var anchor = data[nf+"前點"].split(',');
	rotateFrom90ToSlope(data[nf+"前點_斜率"],newItem,anchor,1*num);
	topMoveXYByGroup("縫份", name+"_前","中線",anchor);
	var pathItem = getPathItemByThreeLevel("立體版", "前面", name, "底色");
	createClippingGroup(pathItem,itemA);
	newItem.remove();

	newItem = getPageItemByNameInLayer(doc,"縫份",name+"_後");
	itemB.move(newItem, ElementPlacement.PLACEATBEGINNING);
	var file = checkForDataCsv();
	var data = readCsvToObj(file);
	var anchor = data[nf+"後點"].split(',');
	rotateFrom90ToSlope(data[nf+"後點_斜率"],newItem,anchor,-1*num);
	topMoveXYByGroup("縫份", name+"_後","中線",anchor);
	var pathItem = getPathItemByThreeLevel("立體版", "後面", name, "底色");
	createClippingGroup(pathItem,itemB);
	newItem.remove();
	app.selection = null;
	app.selection = [selectedItem];

}


function maskImageToSleeve2(sName){
	var doc = app.activeDocument;
	var selectedItem = doc.selection[0];
	itemA = selectedItem.duplicate();
	// itemB = selectedItem.duplicate();
	autoCenterByLayerAndItem2("縫份",sName,itemA);
	// autoCenterByLayerAndItem2("縫份","右袖",itemB);
	var pathItem = getPathItemByTwoLevel("裁切", sName, "底色");
	createClippingGroup(pathItem,itemA);
	// pathItem = getPathItemByTwoLevel("裁切", "右袖", "底色");
	// createClippingGroup(pathItem,itemB);
	app.selection = null;
	app.selection = [selectedItem];
}


//立體版前後片套圖
function maskImageToBodyPart(){
	var doc = app.activeDocument;
	var selectedItem = doc.selection[0];
	itemA = selectedItem.duplicate();
	itemB = selectedItem.duplicate();
	mirrorItem("horizontal",itemB);
	//("立體圖", "前面", "前片", "底色");
	var pathItem = autoCenterByThreeLevel2("立體版", "前面", "前片", "底色",itemA);
	createClippingGroup(pathItem,itemA);
	pathItem = autoCenterByThreeLevel2("立體版", "後面", "後片", "底色",itemB);
	createClippingGroup(pathItem,itemB);
	app.selection = null;
	app.selection = [selectedItem];
}





// 水平鏡射目前選取物件
//mirrorSelectedItems("horizontal");

// 垂直鏡射，並以點 [200, 300] 為中心
// mirrorSelectedItems("vertical", [200, 300]);
/**
 * 將目前選取的物件進行鏡射
 * @param {"horizontal"|"vertical"} direction 鏡射方向
 * @param {Array} origin 中心點座標 [x, y]，預設為物件中心
 */
function mirrorSelectedItems(direction) {
    var sel = app.activeDocument.selection;

    if (!sel || sel.length === 0) {
        alert("請先選取一個或多個物件！");
        return;
    }

    for (var i = 0; i < sel.length; i++) {
        var item = sel[i];
				bound = getBounds(findPageItemInGroupFirst(item, "邊界"));
        // 計算鏡射中心點
				var ox = bound.centerX;
        var oy = bound.centerY;
        // 設定鏡射矩陣
        var matrix;
        if (direction === "horizontal") {
            matrix = app.getScaleMatrix(-100, 100); // 水平鏡射
        } else if (direction === "vertical") {
            matrix = app.getScaleMatrix(100, -100); // 垂直鏡射
        } else {
            alert("請輸入 'horizontal' 或 'vertical'");
            return;
        }
        // 鏡射中心點轉換：平移到原點 → 鏡射 → 再平移回來
				//item.translate(-ox, -oy);        // 平移至原點
        item.transform(matrix, true, true, true, true, undefined); // 鏡射
				bound = getBounds(findPageItemInGroupFirst(item, "邊界"));
				var ox2 = bound.centerX;
				var oy2 = bound.centerY;
				item.translate(ox-ox2,oy-oy2);
    }
}


// 水平鏡射目前選取物件
//mirrorItem("horizontal",item);
/**
 * 將目前選取的物件進行鏡射
 * @param {"horizontal"|"vertical"} direction 鏡射方向
 * @param {Array} origin 中心點座標 [x, y]，預設為物件中心
 */
function mirrorItem(direction,item) {
		bound = getBounds(findPageItemInGroupFirst(item, "邊界"));
    // 計算鏡射中心點
		var ox = bound.centerX;
    var oy = bound.centerY;
    // 設定鏡射矩陣
    var matrix;
    if (direction === "horizontal") {
        matrix = app.getScaleMatrix(-100, 100); // 水平鏡射
    } else if (direction === "vertical") {
        matrix = app.getScaleMatrix(100, -100); // 垂直鏡射
    } else {
        alert("請輸入 'horizontal' 或 'vertical'");
        return;
    }
    // 鏡射中心點轉換：平移到原點 → 鏡射 → 再平移回來
		//item.translate(-ox, -oy);        // 平移至原點
    item.transform(matrix, true, true, true, true, undefined); // 鏡射
		bound = getBounds(findPageItemInGroupFirst(item, "邊界"));
		var ox2 = bound.centerX;
		var oy2 = bound.centerY;
		item.translate(ox-ox2,oy-oy2);
}

//袖子套圖
//name 左袖或右袖
function maskImageToSleeve3(name){
	var doc = app.activeDocument;
	var selectedItem = doc.selection[0];
	itemA = selectedItem.duplicate();
	itemB = selectedItem.duplicate();
	nf = name.substring(0, 1);
	num = 1;
	if("右袖" === name){
		num = -1;
	}
	autoCenterByLayerAndItem2("縫份",name,itemA);
	autoCenterByLayerAndItem2("縫份",name,itemB);
	splitSleeveInSeamLayer(name);
	newItem = getPageItemByNameInLayer(doc,"縫份",name+"_前");
	itemA.move(newItem, ElementPlacement.PLACEATBEGINNING);
	var file = checkForDataCsv();
	var data = readCsvToObj(file);
	var anchor = data[nf+"前點"].split(',');
	rotateFrom90ToSlope(data[nf+"前點_斜率"],newItem,anchor,1*num);
	topMoveXYByGroup("縫份", name+"_前","中線",anchor);
	var pathItem = getPathItemByThreeLevel("立體版", "前面", name, "底色");
	//createClippingGroup(pathItem,itemA);
	//newItem.remove();

	newItem = getPageItemByNameInLayer(doc,"縫份",name+"_後");
	itemB.move(newItem, ElementPlacement.PLACEATBEGINNING);
	var file = checkForDataCsv();
	var data = readCsvToObj(file);
	var anchor2 = data[nf+"後點"].split(',');
	alert(anchor2);
	rotateFrom90ToSlope(data[nf+"後點_斜率"],newItem,anchor2,-1*num);
	topMoveXYByGroup("縫份", name+"_後","中線",anchor2);
	var pathItem = getPathItemByThreeLevel("立體版", "後面", name, "底色");
	//createClippingGroup(pathItem,itemB);
	//newItem.remove();
	app.selection = null;
	app.selection = [selectedItem];

}

function removeMask(layerName, groupLevel1, groupLevel2){
	group  = getGroupByTwoLevel(layerName,groupLevel1,groupLevel2);
	baseItem = getPathItemByThreeLevel(layerName,groupLevel1,groupLevel2,"底色");
	groups = group.groupItems;
	for(var i = groups.length-1;i>=0;i--){
		obj = groups[i];
		if(isValidMaskGroup(obj,baseItem)){
			//
			obj.remove();
		}
	}

}

function removeMask2(layerName, groupLevel1){
	group  = getGroupByLevel(layerName,groupLevel1);
	baseItem = getPathItemByTwoLevel(layerName,groupLevel1,"底色");
	groups = group.groupItems;
	for(var i = groups.length-1;i>=0;i--){
		obj = groups[i];
		if(isValidMaskGroup(obj,baseItem)){
			//
			obj.remove();
		}
	}

}


/**
 * 設定 PathItem 填色為淺灰色
 * @param {PathItem} pathItem - 要設定顏色的 PathItem
 * @param {Number} grayLevel - 灰度（0-100），預設 10（較淺）
 */
function setPathItemGrayFill(pathItem, grayLevel) {
    if (pathItem.typename !== "PathItem") {
        alert("請傳入一個 PathItem 物件！");
        return;
    }

    if (grayLevel < 0 || grayLevel > 100) {
        alert("灰度必須在 0-100 之間！");
        return;
    }

    // 建立 CMYK 灰色
    var grayColor = new CMYKColor();
    grayColor.cyan = 0;
    grayColor.magenta = 0;
    grayColor.yellow = 0;
    grayColor.black = grayLevel;

    // 設定填色
    pathItem.filled = true;
    pathItem.fillColor = grayColor;

}

removeMask("立體版","前面","右袖");
removeMask("立體版","後面","右袖");
removeMask2("裁切","右袖");

maskImageToSleeve("右袖");
//maskImageToSleeve("右袖");
maskImageToSleeve2("右袖");
