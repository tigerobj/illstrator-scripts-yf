#include "json2.js";
#include "對齊置中.jsx";


// function log (input) {
//
//     if(!JSON || !JSON.stringify) return;
//     var now = new Date();
//     var output = JSON.stringify(input);
//     $.writeln(now.toTimeString() + ": " + output);
//     var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
//     var filePath = pathEnv;
// 		var logFile = File(filePath + "/套釣魚衣立體圖.txt");
// 		logFile.encoding = "utf8";
//     logFile.open("a");
//     logFile.writeln(now.toTimeString() + ": " + output);
//     logFile.close();
// }


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

//Angle

/************************************************************
 * 從 CSV 取得某角度
 ************************************************************/
function getAngleFromCsv(csvPath, keyName) {
    var csvFile = new File(csvPath);

    if (!csvFile.exists) {
        alert("找不到 CSV：" + csvPath);
        return null;
    }

    var data = readCsvToObj(csvFile);

    if (!data[keyName]) {
        alert("CSV 內不存在 key：「" + keyName + "」");
        return null;
    }

    return data[keyName];
}


/************************************************************
 * 計算 px,py 以 PageItem 幾何中心為基準旋轉 angle 度後的新座標
 * 用於旋轉後補償位移用（計算旋轉後的 P2）
 ************************************************************/
function rotatePointByItem(px, py, item, angle) {

    var gb = item.geometricBounds;
    var cx = (gb[0] + gb[2]) / 2; // 中心 X
    var cy = (gb[1] + gb[3]) / 2; // 中心 Y

    var rad = angle * Math.PI / 180;
    var dx = px - cx;
    var dy = py - cy;

    var cosv = Math.cos(rad);
    var sinv = Math.sin(rad);

    var x2 = cx + dx * cosv - dy * sinv;
    var y2 = cy + dx * sinv + dy * cosv;

    return [x2, y2];
}


/************************************************************
 * 依指定旋轉點 (cx, cy) 旋轉物件（並補償平移避免中心跑掉）
 ************************************************************/
function rotateAroundPoint(item, angle, cx, cy) {

    // 計算旋轉後 P2（以 PageItem 中心為 pivot）
    var p2 = rotatePointByItem(cx, cy, item, angle);

    // 執行真正旋轉（以物件中心旋轉）
    var m = app.getRotationMatrix(angle);
    item.transform(m, true, true, true, true, 1);

    // 補償位移：讓旋轉後的 pivot(P2) 回到原本位置(cx,cy)
    var dx = cx - p2[0];
    var dy = cy - p2[1];
    item.translate(dx, dy);
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


function applyBodyPanelPlacement(name) {
		log(["前後片套圖流程：",name]);
		item = getGroupByLevel("圖層 5", name+"套圖").duplicate();
		if("前片" === name){
			groupName = "前面";
		}else if ("後片" === name) {
			groupName = "後面";
		}else{
			alert(name + " ,不是前片或後片,此函數只能用於前後片套圖");
		}
		var pathItem = autoCenterByThreeLevel2("立體版", groupName, name, "底色",item);
		createClippingGroup(pathItem,item);
    return item;
}


/**
 * 輸入：左袖 / 右袖 / 左袖口 / 右袖口
 * 回傳：該部位的點位名稱（定位點 / 套圖點 / 旋轉角度點）
 */
function getSleeveMapping(part) {

    switch (part) {

        //=========================
        // ⭐ 左袖
        //=========================
        case "左袖":
            return {
								name: "左袖套圖",
                keyPoints: ["左前點", "左後點"],
                mapPoint:  "左袖套圖點",
                rotatePoints: ["左前點旋轉角度", "左後點旋轉角度"]
            };

        //=========================
        // ⭐ 右袖
        //=========================
        case "右袖":
            return {
								name: "右袖套圖",
                keyPoints: ["右前點", "右後點"],
                mapPoint:  "右袖套圖點",
                rotatePoints: ["右前點旋轉角度", "右後點旋轉角度"]
            };

        //=========================
        // ⭐ 左袖口
        //=========================
        case "左袖口":
            return {
								name: "左袖套圖",
                keyPoints: ["左前袖口點", "左後袖口點"],
                mapPoint:  "左袖口套圖點",
                rotatePoints: [
                    "左前袖口點旋轉角度",
                    "左後袖口點旋轉角度"
                ]
            };

        //=========================
        // ⭐ 右袖口
        //=========================
        case "右袖口":
            return {
								name: "右袖套圖",
                keyPoints: ["右前袖口點", "右後袖口點"],
                mapPoint:  "右袖口套圖點",
                rotatePoints: [
                    "右前袖口點旋轉角度",
                    "右後袖口點旋轉角度"
                ]
            };

        default:
            alert("未定義部位：" + part);
            return null;
    }
}


//袖口
function applySleevePlacement(name) {
		// log(["袖子套圖流程：" , name]);

		var info = getSleeveMapping(name);

		//info.name:左袖套圖
		itemA = getGroupByLevel("圖層 5", info.name).duplicate();
		// log(["itemA.name：" , itemA.name]);

		itemB = getGroupByLevel("圖層 5", info.name).duplicate();
		nf = name.substring(0, 1);
		var csvPath = $.getenv("CLOTH_TEMPLATE_CONFIG_PATH") + "/旋轉-釣魚衣.csv";
		// 左袖套圖點

		var p = getPointFromCsv(csvPath, info.mapPoint);

		var cx = p[0];
    var cy = p[1];
		// log([name+"套圖點","cx : ",cx,"cy:",cy]);
		//左前點

		var p2 = getPointFromCsv(csvPath, info.keyPoints[0]);
		var px = p2[0];
		var py = p2[1];
		// log([nf+"前點","px : ",px,"py:",py]);
		// 輸入角度, 左前點旋轉角度

		var angle = getAngleFromCsv(csvPath, info.rotatePoints[0]);
		// log([nf+"前點旋轉角度","角度 : ",angle]);
		// 執行左前旋轉 + 補償
    rotateAroundPoint(itemA, angle, cx, cy);
		moveItemByTwoPoints(itemA,cx, cy, px, py);
		var pathItem = getPathItemByThreeLevel("立體版", "前面", name, "底色");
    createClippingGroup(pathItem,itemA);

		//左後點
		 p2 = getPointFromCsv(csvPath, info.keyPoints[1]);
		 px = p2[0];
		 py = p2[1];
		 // 輸入角度, 左後點旋轉角度
		 angle = getAngleFromCsv(csvPath, info.rotatePoints[1]);
		 rotateAroundPoint(itemB, angle, cx, cy);
		 moveItemByTwoPoints(itemB,cx, cy, px, py);
		 pathItem = getPathItemByThreeLevel("立體版", "後面", name, "底色");
		 createClippingGroup(pathItem,itemB);
}

function isFrontPiece(name) {
    var list = [
        "右前協",
        "左前協",
        "右前",
        "左前"
    ];
    for (var i = 0; i < list.length; i++) {
        if (name === list[i]) return true;
    }
    return false;
}

//"右前協","左前協","右前","左前","前片" ->前片套圖
//"後片" ->後片套圖
//"左袖","左袖口" ->左袖套圖
//"右袖","右袖口" ->右袖套圖
function getMappingForPiece(name) {

    // --- 前片套圖 ---
    var frontList = [
        "右前協", "左前協",
        "右前", "左前",
        "前片"
    ];

    for (var i = 0; i < frontList.length; i++) {
        if (name.indexOf(frontList[i]) !== -1) {
            return "前片套圖";
        }
    }

    // --- 後片套圖 ---
    if (name.indexOf("後片") !== -1) {
        return "後片套圖";
    }

    // --- 左袖套圖 ---
    var leftSleeveList = ["左袖", "左袖口"];

    for (var j = 0; j < leftSleeveList.length; j++) {
        if (name.indexOf(leftSleeveList[j]) !== -1) {
            return "左袖套圖";
        }
    }

    // --- 右袖套圖 ---
    var rightSleeveList = ["右袖", "右袖口"];

    for (var k = 0; k < rightSleeveList.length; k++) {
        if (name.indexOf(rightSleeveList[k]) !== -1) {
            return "右袖套圖";
        }
    }

    // 🔥 若完全找不到 → 你可選擇回傳 null 或預設流程
    return null;
}


function maskImageOnClipPiece(name){


	itemA = getPathItemByLayer("縫份", name);
	//前片套圖,後片套圖,左袖套圖,右袖套圖
	itemOriginal = getGroupByLevel("圖層 5", getMappingForPiece(name));

	if (isFrontPiece(name)) {
	    itemB = getPathItemByThreeLevel("圖層 5", "外觀", "前片", name);
	} else {
	    itemB = getPathItemByThreeLevel("圖層 5", "外觀", name, name);
	}
	positionObj = autoCenterXY(itemA, itemB);
	itemC = itemOriginal.duplicate();
	itemC.translate(positionObj.left,positionObj.top);
	pathItem = getPathItemByTwoLevel("裁切", name,  "底色");
	createClippingGroup(pathItem,itemC);
}


/**
 * ======================================
 * main：主流程（最乾淨、最正統結構）
 * ======================================
 */
function main() {
	applyBodyPanelPlacement("前片");
	maskImageOnClipPiece("左前");
	maskImageOnClipPiece("右前");
	maskImageOnClipPiece("左前協");
	maskImageOnClipPiece("右前協");


	applyBodyPanelPlacement("後片");
	maskImageOnClipPiece("後片");


	applySleevePlacement("左袖");
	maskImageOnClipPiece("左袖");

	applySleevePlacement("右袖");
	maskImageOnClipPiece("右袖");

	applySleevePlacement("左袖口");
	maskImageOnClipPiece("左袖口");

	applySleevePlacement("右袖口");
	maskImageOnClipPiece("右袖口");
}

/**
 * ---- 程式入口 ----
 */
try {
    main();
} catch (e) {
    alert("發生錯誤：\n" + e);
}
