#include "json2.js";
#include "對齊置中.jsx";


/**
 * 自訂字串的 trim()，清除字串前後的空白字元
 * ExtendScript 早期沒有原生 trim()，因此自行定義。
 */
String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
}

/**
 * 📌 判斷是否存在釣魚衣的旋轉設定 CSV 檔（衣服配置檔）
 *
 * ExtendScript 使用系統環境變數 CLOTH_TEMPLATE_CONFIG_PATH
 * 此資料夾應放置：
 *   - 旋轉-釣魚衣.csv
 *   - 或你後續需要的尺寸/配置資料
 *
 * @returns {File|null}
 *          若找到 → 回傳 File 物件
 *          若找不到 → alert 並回傳 null
 */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
		var file = new File(pathEnv + '/旋轉-釣魚衣.csv');
    if (!file.exists) {
        alert(pathEnv + '/衣服配置檔.csv 檔案不存在！請複製 衣服配置檔.csv，再重新執行');
        return null;
    }
    return file;
}


/**
 * 讀取csv值,儲存成key,value物件值.
 * key為第一欄
 * values為第二欄
 */
 /**
 * 📌 讀取 CSV 檔案，轉成 key → value 的物件結構
 *
 * CSV 結構格式預期為：
 *   key ; value
 *   或
 *   key , value
 *
 * 用途：
 *   - 用於載入「旋轉-釣魚衣.csv」中的前點 / 後點 / 斜率資料
 *
 * @param {File} csvFile - ExtendScript File 物件
 * @returns {Object}     - 回傳 { key: value , ... }
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
	csvFile.close();
	return obj;


}

/**
 * 將選取的物件中心移動到指定座標
 * @param {PageItem} item - 物件
 * @param {Number} targetX - 目標中心 X
 * @param {Number} targetY - 目標中心 Y
 */
function moveItemCenterTo(item, targetX, targetY) {
    var b = item.visibleBounds;
    // [left, top, right, bottom]

    var cx = (b[0] + b[2]) / 2;
    var cy = (b[1] + b[3]) / 2;

    var dx = targetX - cx;
    var dy = targetY - cy;

    // Illustrator 座標系：Y 軸往上是 + ，但 translate 的 y 方向相反，因此直接使用 dy
    item.translate(dx, dy);
}


/**
 * 將選取的物件中心移動到指定座標
 * @param {PageItem} item - 物件
 * @param {Number} targetX - 目標中心 X
 * @param {Number} targetY - 目標中心 Y
 */
function moveItemCenterToForBound(item, targetX, targetY) {

		itemBound = findPageItemInGroupFirst(item,"邊界");

    var b = itemBound.visibleBounds;
    // [left, top, right, bottom]

    var cx = (b[0] + b[2]) / 2;
    var cy = (b[1] + b[3]) / 2;

    var dx = targetX - cx;
    var dy = targetY - cy;

    // Illustrator 座標系：Y 軸往上是 + ，但 translate 的 y 方向相反，因此直接使用 dy
    item.translate(dx, dy);
}

/**
 *  將選取的物件中心移動到指定座標
 *  旋轉-釣魚衣.csv
 */

function moveItemCenterToByName(item, positionName,isBound){
	var parts = data[positionName].split(",");
	var x = parseFloat(parts[0]);
	var y = parseFloat(parts[1]);
	if(isBound){
		moveItemCenterToForBound(item,x,y);
	}else{
		moveItemCenterTo(item,x,y);
	}

}

function getTopAnchorOfPath(pathItem) {

    if (pathItem.typename !== "PathItem") {
        alert("請提供 PathItem");
        return null;
    }

    var pts = pathItem.pathPoints;
    var topPoint = pts[0];

    for (var i = 1; i < pts.length; i++) {
        if (pts[i].anchor[1] > topPoint.anchor[1]) {
            topPoint = pts[i];
        }
    }

    return topPoint; // 回傳 PathPoint 物件
}

/**
 * 將物件從座標 (x1, y1) 平移到座標 (x2, y2)
 * 差值 = (x2 - x1 , y2 - y1)
 */
function moveItemByTwoPoints(item,x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;

    item.translate(dx, dy);
}


/************************************************************
 * 從 CSV 取得某座標（格式： x,y ）
 ************************************************************/
function getPointFromCsv(csvPath, keyName) {
    var csvFile = new File(csvPath);

    if (!csvFile.exists) {
        alert("找不到 CSV：" + csvPath);
        return null;
    }

    var data = readCsvToObj(csvFile);


		return getPoint(data,keyName);
}

function getPoint(data,keyName){
	if (!data[keyName]) {
			alert("CSV 內不存在 key：「" + keyName + "」");
			return null;
	}

	var parts = data[keyName].split(",");
	if (parts.length !== 2) {
			alert("CSV 座標格式錯誤：" + data[keyName]);
			return null;
	}

	return [parseFloat(parts[0]), parseFloat(parts[1])];
}


function sleeveMove(name,data){
	item = getGroupByTwoLevel("圖層 5", "外觀", name);
	p2 = getPoint(data,name+"套圖點");
	pathItemP1 = findPageItemInGroupFirst(item, "參考線");
	p1 = getTopAnchorOfPath(pathItemP1);
	x1 = p1.anchor[0];
	y1 = p1.anchor[1];
	x2 = p2[0];
	y2 = p2[1];
	moveItemByTwoPoints(item,x1, y1, x2, y2);
}

var file = checkForDataCsv();
var data = readCsvToObj(file);



item = getGroupByTwoLevel("圖層 5", "外觀", "前片");
moveItemCenterToByName(item, "前片套圖中心位置",false);

item = getGroupByLevel("圖層 5", "前片套圖");
moveItemCenterToByName(item, "前片套圖中心位置",true);

item = getGroupByTwoLevel("圖層 5", "外觀", "後片");
moveItemCenterToByName(item, "後片套圖中心位置",false);

item = getGroupByLevel("圖層 5", "後片套圖");
moveItemCenterToByName(item, "後片套圖中心位置",true);

sleeveMove("右袖",data);
sleeveMove("右袖口",data);

item = getGroupByLevel("圖層 5", "右袖套圖");
moveItemCenterToByName(item, "右袖套圖中心位置",true);


sleeveMove("左袖",data);
sleeveMove("左袖口",data);

item = getGroupByLevel("圖層 5", "左袖套圖");
moveItemCenterToByName(item, "左袖套圖中心位置",true);
