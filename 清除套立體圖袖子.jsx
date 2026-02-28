#include "json2.js";
#include "對齊置中.jsx";

/**
 * 去空白
 */
String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
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


removeMask("立體版","前面","左袖");
removeMask("立體版","前面","右袖");
removeMask("立體版","後面","左袖");
removeMask("立體版","後面","右袖");
removeMask2("裁切","左袖");
removeMask2("裁切","右袖");
