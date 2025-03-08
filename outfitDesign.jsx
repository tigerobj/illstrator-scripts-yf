#include "base.jsx";
#include "json2.js";
#include "Intersections.jsx";
#include "selectMenu2.jsx";



//log(["i",i,"opt new",opt]);
function log (input) {

    if(!JSON || !JSON.stringify) return;
    var now = new Date();
    var output = JSON.stringify(input);
    $.writeln(now.toTimeString() + ": " + output);
    //D:\開發\客戶圖檔\杰優、裕豐工廠產品\ai_script_workspace\ai_example\illustrator-scripts-master2
    var filePath = "D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2";
	//alert(app.activeDocument.filePath);
    //var logFile = File(app.activeDocument.filePath + "/log.txt");
    var logFile = File(filePath + "/log_parameter_configuration.txt");
    logFile.encoding = "big5";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close();
}

function getPageItemByName(name){
    var allPageItems = doc.pageItems;
    for (var i = 0; i < allPageItems.length; i++) {
        if (allPageItems[i].name === name) {
            return allPageItems[i];
        }
    }
    return null;  // 如果没有找到匹配的 PathItem	
}

// 根据名称获取 PathItem 对象的函数
function getPathItemByName(name) {
    var allPathItems = doc.pathItems;
    for (var i = 0; i < allPathItems.length; i++) {
        if (allPathItems[i].name === name) {
            return allPathItems[i];
        }
    }
    return null;  // 如果没有找到匹配的 PathItem
}

function getGroupItemByName(name){
	var allGroupItems = doc.groupItems;
	for (var i = 0; i < allGroupItems.length; i++) {
        if (allGroupItems[i].name === name) {
            return allGroupItems[i];
        }
    }
    return null;  // 如果没有找到匹配的 PathItem
}

function getGroupItemByNameForDoc(mydoc,name){
	var allGroupItems = mydoc.groupItems;
	for (var i = 0; i < allGroupItems.length; i++) {
        if (allGroupItems[i].name === name) {
            return allGroupItems[i];
        }
    }
    return null;  // 如果没有找到匹配的 PathItem
}


/**
 * 根据左边距和上边距找到特定的锚点
 * @param {number} targetLeft - 锚点的左边距
 * @param {number} targetTop - 锚点的上边距
 * @returns {PathPoint|null} 找到的锚点对象，如果没有找到则返回 null
 */
function findPathPointByPosition(pathItem,targetLeft, targetTop) {
    // 定义找到的锚点变量
    var foundPoint = null;

    //alert(pathItem.pathPoints.length);
    // 遍历路径项中的所有锚点
    for (var j = 0; j < pathItem.pathPoints.length; j++) {
        var pathPoint = pathItem.pathPoints[j];
        // 检查锚点位置是否匹配目标位置
        if (Math.abs(pathPoint.anchor[0] - targetLeft) < 0.3 && Math.abs(pathPoint.anchor[1] - targetTop) < 0.3) {
            foundPoint = pathPoint;
            break;
        }
    }
    


    return foundPoint;
}

function findPoint(pathItem,value){
	return findPathPointByPosition(pathItem,value[0],value[1]);
}

//D:\開發\客戶圖檔\簡單K\套圖範本\所有版型\禾羽7扣\L\MM

function writerObjToCsv(csvFile,obj){
	csvFile.open('w');
	csvFile.encoding = "big5";
	content = ""
	n=0;
	for (var key in obj) {
		if(n != 0){
			content = content+"\n";
		}
		content = content+key+";"+obj[key];
		n++;
		
	}
		
	csvFile.write(content);
	csvFile.close();
}

function drawCircle(name,diameter,list){
	
	item = getPathItemByName(name);
	
	if (item !== null) {
		point = item.geometricBounds[0];
		var positionX = item.geometricBounds[0];  // 水平位置
		var positionY = item.geometricBounds[1];  // 垂直位置
		
		// 圆的直径
		var diameterPoints = mm(diameter);
		for (var i = 0; i < list.length; i++) {
			
			positionY = positionY-mm(list[i]);
			if(i == 2){
				//continue;
			}
			// 创建圆形路径对象
			var circle = doc.pathItems.ellipse(positionY + diameterPoints / 2, positionX - diameterPoints / 2, diameterPoints, diameterPoints, false, true);
						// 设置圆的笔画和填充颜色（可选）
			circle.stroked = true;
			circle.strokeWidth = 0.75;  // 笔画宽度
			circle.strokeColor = new RGBColor();
			circle.strokeColor.red = 0;
			circle.strokeColor.green = 0;
			circle.strokeColor.blue = 0;  // 黑色笔画
			
			circle.filled = false;  // 没有填充颜色
			circle.name="鈕扣"+i;
		}

		
	}
}


//geometricBounds
//Plus true ,Minus false
//指定位置,取得上下二個物件的其中之一的物件,true取得上物件
function getItemByPlusMinus(layer,isPlus){
	items = layer.pageItems;
	//for (var i = 0; i < list.length; i++) {
	pageItemA = layer.pageItems[0].pageItems[0];
	pageItemB = layer.pageItems[1].pageItems[0];
	 
	if(pageItemA.geometricBounds[1] > pageItemB.geometricBounds[1]){
		up =  pageItemA;
		down =  pageItemB;
	}else{
		up =  pageItemB;
		down =  pageItemA;
	}
	
	if(isPlus){
		return up;
	}else{
		return down;
	}
	
	
}


function mirror(c,o,name){
	totalMatrix = app.getScaleMatrix(-100, 100);
	//alert(c);
	//alert(o);
	moveVar =  c.geometricBounds[0]-o.geometricBounds[0];
	myWidth = moveVar*2-o.width;
	translationMatrix = app.getTranslationMatrix(myWidth , 0);
	tmp = o.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
	tmp.name = name;
	tmp.strokeColor = strokeColor;
	tmp.transform(translationMatrix);
	tmp.transform(totalMatrix);
	
}

function mirrorByPt(o,name,w){
	totalMatrix = app.getScaleMatrix(-100, 100);
	translationMatrix = app.getTranslationMatrix(w , 0);
	tmp = o.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
	tmp.name = name;
	//tmp.strokeColor = strokeColor;
	tmp.transform(translationMatrix);
	tmp.transform(totalMatrix);
	
}

function groupsCopy(doc,path,groupList){
	sourceDoc = app.open(File(path));
	for (var i = 0; i < groupList.length; i++) {
		getGroupItemByNameForDoc(sourceDoc,groupList[i]).edk   = true;
	}
	app.copy();	
	app.activeDocument = doc;	
	app.paste();
	sourceDoc.close(SaveOptions.DONOTSAVECHANGES);
}


/**
 * topName ： 最高裁片名稱 "左袖"
 * centerName : 置中裁片名稱 "中心線"
 * heightName ： 高度距離 mm,從csv檔案取得 "隊名高度"
 * groupList : 移動的所有名稱 ["隊名","前數字"]
 */
function moveTeamName(topName,centerName,heightName,groupList){
	teamNameheight = myObject[heightName];
	moveTeamNameByHeight(topName,centerName,teamNameheight,groupList);
}

function moveTeamNameByHeight(topName,centerName,teamNameheight,groupList){
	groupItems = [];
	for (var i = 0; i < groupList.length; i++) {
		groupItems.push(getGroupItemByName(groupList[i]));
	}
	
	topItem = getPathItemByName(topName);
	centerItem = getPathItemByName(centerName);
	pasteY = topItem.geometricBounds[1]-mm(teamNameheight);
	pasteX = centerItem.geometricBounds[0]+centerItem.width/2; //x:中心
	pastedGroup = groupItems[0];  //隊名
	groupBounds = pastedGroup.visibleBounds;
	groupWidth = groupBounds[2] - groupBounds[0];
	groupHeight = groupBounds[1] - groupBounds[3];
	currentX = groupBounds[0] + (groupWidth / 2);
	currentY = groupBounds[1] ; 
	offsetX = pasteX - currentX;
	offsetY = pasteY - currentY;	
    for(var i=0;i<groupItems.length; i++){
		groupItems[i].translate(offsetX, offsetY);
		groupItems[i].selected = false;
	}
	
}

function moveTeamNameByScaleFactor (topName,centerName,heightName,scaleFactor,groupList){
	teamNameheight = myObject[heightName]*scaleFactor;
	//alert(teamNameheight);
	moveTeamNameByHeight(topName,centerName,teamNameheight,groupList);
}


function movePageItemByHeight(topName,centerName,teamNameheight,name){
	itme = getPageItemByName(name);	
	topItem = getPathItemByName(topName);
	centerItem = getPathItemByName(centerName);
	pasteY = topItem.geometricBounds[1]-mm(teamNameheight);
	pasteX = centerItem.geometricBounds[0]+centerItem.width/2; //x:中心	
	groupWidth = itme.geometricBounds[2] - itme.geometricBounds[0];
	groupHeight = itme.geometricBounds[1] - itme.geometricBounds[3];
	currentX = itme.geometricBounds[0] + (groupWidth / 2);
	currentY = itme.geometricBounds[1] ; 
	offsetX = pasteX - currentX;
	offsetY = pasteY - currentY;	
	itme.translate(offsetX, offsetY);
	itme.selected = false;
}


function movePageItem(layerName,moveDistance){
	// 將毫米轉換為點（1毫米約等於2.8346點）
	var moveDistancePoints = mm(moveDistance);
	movePageItemLT(layerName,moveDistancePoints,0);	
}

function movePageItemLT(layerName,left,top){
	var layer = doc.layers.getByName(layerName);
	// 遍歷圖層中的所有路徑項並移動它們
	for (var i = 0; i < layer.pathItems.length; i++) {
	    var pathItem = layer.pathItems[i];
	    pathItem.translate(left, top);  // 向左移動
	}
	
	// 遍歷圖層中的所有文本框並移動它們
	for (var i = 0; i < layer.textFrames.length; i++) {
	    var textFrame = layer.textFrames[i];
	    textFrame.translate(left, top);  // 向左移動
	}
	
	// 遍歷圖層中的所有其他類型的項目並移動它們
	for (var i = 0; i < layer.pageItems.length; i++) {
	    var pageItem = layer.pageItems[i];
	    if (pageItem.typename !== "PathItem" && pageItem.typename !== "TextFrame") {
	        pageItem.translate(left, top);  // 向左移動
	    }
	}	
}


/**
 * 獲取指定圖層內所有物件的最左邊位置
 * @param {string} layerName - 要檢查的圖層名稱
 * @returns {number} 最左邊物件的 x 坐標
 */
function getLeftmostPosition(layerName) {
    // 嘗試獲取圖層，如果找不到指定名稱的圖層，返回 undefined
    try {
        var layer = app.activeDocument.layers.getByName(layerName);
    } catch (e) {
        alert("圖層 '" + layerName + "' 不存在。");
        return undefined;
    }

    // 檢查圖層是否包含物件
    if (layer.pageItems.length === 0) {
        alert("圖層 '" + layerName + "' 中沒有物件。");
        return undefined;
    }

    // 初始化變數來儲存最小的 x 坐標值
    var leftmost;

    // 遍歷圖層中的所有物件
    for (var i = 0; i < layer.pageItems.length; i++) {
		
        var item = layer.pageItems[i];
        if (i == 0){
			leftmost = item.geometricBounds[0];
		}
        
        // 更新最左邊的 x 坐標值
        if (item.geometricBounds[0] < leftmost) {
            leftmost = item.geometricBounds[0]; 
        }
    }

    return leftmost;
}

/**
 * 獲取指定圖層內所有物件的最右邊位置
 * @param {string} layerName - 要檢查的圖層名稱
 * @returns {number} 最右邊物件的 x 坐標
 */
function getRightmostPosition(layerName) {
    // 嘗試獲取圖層，如果找不到指定名稱的圖層，返回 undefined
    try {
        var layer = app.activeDocument.layers.getByName(layerName);
    } catch (e) {
        alert("圖層 '" + layerName + "' 不存在。");
        return undefined;
    }

    // 檢查圖層是否包含物件
    if (layer.pageItems.length === 0) {
        alert("圖層 '" + layerName + "' 中沒有物件。");
        return undefined;
    }

    // 初始化變數來儲存最大的 x 坐標值
    var rightmost;

    // 遍歷圖層中的所有物件
    for (var i = 0; i < layer.pageItems.length; i++) {
		
        var item = layer.pageItems[i];
        
        if (i == 0){
			rightmost = item.geometricBounds[2]+item.width;
		}
		
		//rightmost = item.geometricBounds[2];
        // 更新最右邊的 x 坐標值
        if (item.visible && (item.geometricBounds[2]+item.width) > rightmost) {
            rightmost = item.geometricBounds[2]+item.width;
        }
    }

    return rightmost;
}


/**
 * 將指定圖層的所有物件向左移動，使其左邊距與工作區域的指定邊距對齊
 * @param {string} layerName - 圖層的名稱
 * @param {number} leftMargin - 指定的左邊距 (以點為單位)
 */
function alignObjectsToLeftMargin(layerName, leftMargin, topMargin) {
    // 獲取指定的圖層
    var layer = app.activeDocument.layers.getByName(layerName);
    var distanceToMove = leftMargin - getLeftmostPosition(layerName);
    for (var i = 0; i < layer.pathItems.length; i++) {
	    var item = layer.pathItems[i];
	    item.translate(distanceToMove, topMargin);  // 向左移動
	}
	
	// 遍歷圖層中的所有文本框並移動它們
	for (var i = 0; i < layer.textFrames.length; i++) {
	    var textFrame = layer.textFrames[i];
	    textFrame.translate(distanceToMove, topMargin);  // 向左移動
	}
	
	// 遍歷圖層中的所有其他類型的項目並移動它們
	for (var i = 0; i < layer.pageItems.length; i++) {
	    var pageItem = layer.pageItems[i];
	    if (pageItem.typename !== "PathItem" && pageItem.typename !== "TextFrame") {
	        pageItem.translate(distanceToMove, topMargin);  // 向左移動
	    }
	}
}

/**
 * 將指定圖層的所有物件向左移動，使其左邊距與工作區域的指定邊距對齊
 * @param {string} layerName - 圖層的名稱
 * @param {number} leftMargin - 指定的左邊距 (以點為單位)
 */
function alignObjectsToRightMargin(layerName, rightMargin, topMargin) {
    var doc = app.activeDocument;
    
    try {
        var layer = doc.layers.getByName(layerName);
    } catch (e) {
        alert("圖層 '" + layerName + "' 不存在。");
        return;
    }

    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;

    // 遍歷所有物件來找出邊界
    for (var i = 0; i < layer.pageItems.length; i++) {
        var item = layer.pageItems[i];
        var bounds = item.visibleBounds; // 使用 visibleBounds 考慮到線寬
        if(i === 0){
			minX = bounds[0];
			maxY = bounds[1];
			maxX = bounds[2];
			minY = bounds[3];
		}
        
        
        if (bounds[0] < minX) minX = bounds[0]; // 左
        if (bounds[1] > maxY) maxY = bounds[1]; // 上
        if (bounds[2] > maxX) maxX = bounds[2]; // 右
        if (bounds[3] < minY) minY = bounds[3]; // 下
    }

    if (minX == Infinity || maxX == -Infinity || minY == Infinity || maxY == -Infinity) {
        alert("沒有可見物件或物件無邊界。");
        return;
    }
    
    var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()]; // 獲取當前的藝術板
    var artboardBounds = artboard.artboardRect; // [左, 上, 右, 下]

    // 將毫米轉換為點 (1 毫米 = 2.834645 點)
    //var pointDistance = mmDistance * 2.834645;

    // 計算直線的 x 座標位置
    var lineX = artboardBounds[2] - rightMargin;
    
    
     
    var distanceToMove = lineX-maxX;
    //var distanceToMove = artboardRight -  getRightmostPosition(layerName);

    for (var i = 0; i < layer.pathItems.length; i++) {
	    var item = layer.pathItems[i];
	    item.translate(distanceToMove, topMargin);  // 向左移動
	}
	
	// 遍歷圖層中的所有文本框並移動它們
	for (var i = 0; i < layer.textFrames.length; i++) {
	    var textFrame = layer.textFrames[i];
	    textFrame.translate(distanceToMove, topMargin);  // 向左移動
	}
	
	// 遍歷圖層中的所有其他類型的項目並移動它們
	for (var i = 0; i < layer.pageItems.length; i++) {
	    var pageItem = layer.pageItems[i];
	    if (pageItem.typename !== "PathItem" && pageItem.typename !== "TextFrame") {
	        pageItem.translate(distanceToMove, topMargin);  // 向左移動
	    }
	}
}


/**
 * 為指定圖層的所有物件繪製一個紅色邊界框，框住所有物件的最外圍
 * @param {string} layerName - 圖層名稱
 */
function drawBoundaryBox(layerName) {
    var doc = app.activeDocument;
    
    try {
        var layer = doc.layers.getByName(layerName);
    } catch (e) {
        alert("圖層 '" + layerName + "' 不存在。");
        return;
    }

    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;

    // 遍歷所有物件來找出邊界
    for (var i = 0; i < layer.pageItems.length; i++) {
        var item = layer.pageItems[i];
        var bounds = item.visibleBounds; // 使用 visibleBounds 考慮到線寬
        if(i === 0){
			minX = bounds[0];
			maxY = bounds[1];
			maxX = bounds[2];
			minY = bounds[3];
		}
        
        
        if (bounds[0] < minX) minX = bounds[0]; // 左
        if (bounds[1] > maxY) maxY = bounds[1]; // 上
        if (bounds[2] > maxX) maxX = bounds[2]; // 右
        if (bounds[3] < minY) minY = bounds[3]; // 下
    }

    if (minX == Infinity || maxX == -Infinity || minY == Infinity || maxY == -Infinity) {
        alert("沒有可見物件或物件無邊界。");
        return;
    }

    // 計算寬度和高度
    var width = maxX - minX;
    var height = maxY - minY;

    // 繪製紅色邊界框
    var boundaryBox = layer.pathItems.rectangle(maxY, minX, width, height);
    boundaryBox.strokeColor = new RGBColor();
    boundaryBox.strokeColor.red = 255;
    boundaryBox.strokeColor.green = 0;
    boundaryBox.strokeColor.blue = 0;
    boundaryBox.filled = false; // 設定為無填充色
    boundaryBox.strokeWidth = 2; // 線條寬度為 2 點
}


/**
 * 在指定距離右邊界的位置畫一條直線
 * @param {number} mmDistance - 距離右邊界的距離，單位為毫米
 */
function drawLineAtDistanceFromRight(mmDistance) {
    var doc = app.activeDocument;
    var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()]; // 獲取當前的藝術板
    var artboardBounds = artboard.artboardRect; // [左, 上, 右, 下]

    // 將毫米轉換為點 (1 毫米 = 2.834645 點)
    var pointDistance = mmDistance * 2.834645;

    // 計算直線的 x 座標位置
    var lineX = artboardBounds[2] - pointDistance;

    // 獲取藝術板的垂直範圍
    var topY = artboardBounds[1];
    var bottomY = artboardBounds[3];

    // 繪製直線
    var line = doc.pathItems.add();
    line.setEntirePath([[lineX, topY], [lineX, bottomY]]);
    line.stroked = true; // 設定有邊框
    line.strokeColor = new RGBColor();
    line.strokeColor.red = 0;
    line.strokeColor.green = 0;
    line.strokeColor.blue = 0;
    line.strokeWidth = 1; // 線條寬度
}

/**
 * 在所有指定的群組物件中，找出最大邊界位置並畫紅色框。
 *
 * @param {Array} groupNames - 包含群組名稱的清單。
 */
function drawBoundingBoxForGroups(groupNames,layer) {
    if (!groupNames || groupNames.length === 0) {
        alert('群組名稱清單為空或未提供');
        return;
    }
    
    // 初始化邊界
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;

    // 遍歷所有群組名稱
    for (var i = 0; i < groupNames.length; i++) {
        var groupName = groupNames[i];
        var item = getGroupItemByName(groupName);

        var bounds = item.visibleBounds; // 使用 visibleBounds 考慮到線寬
        if(i === 0){
			minX = bounds[0];
			maxY = bounds[1];
			maxX = bounds[2];
			minY = bounds[3];
		}
        
        
        if (bounds[0] < minX) minX = bounds[0]; // 左
        if (bounds[1] > maxY) maxY = bounds[1]; // 上
        if (bounds[2] > maxX) maxX = bounds[2]; // 右
        if (bounds[3] < minY) minY = bounds[3]; // 下
    }
    
    if (minX == Infinity || maxX == -Infinity || minY == Infinity || maxY == -Infinity) {
        alert("沒有可見物件或物件無邊界。");
        return;
    }

    // 計算寬度和高度
    var width = maxX - minX;
    var height = maxY - minY;

    // 繪製紅色邊界框
    var boundaryBox = layer.pathItems.rectangle(maxY, minX, width, height);
    
    var borderColor = new CMYKColor();
    borderColor.cyan = 0;
    borderColor.magenta = 100;
    borderColor.yellow = 100;
    borderColor.black = 0;
    boundaryBox.strokeColor = borderColor;
    boundaryBox.filled = false; // 設定為無填充色
    boundaryBox.strokeWidth = 2; // 線條寬度為 2 點    
    //boundingBox.name = "隊名邊框";
    return boundaryBox;
}

/**
 * 根據名稱和縮放因子縮放頁面物件。
 * 
 * @param {number} scaleFactor - 縮放因子，0.5 代表縮小到一半，2 代表放大兩倍。
 * @param {Array} names - 需要縮放的頁面物件名稱的數組。
 * @param {Array} transformations - 縮放中心點的數組，對應於每個頁面物件。
 */
function scalePageItems(scaleFactor, names, transformations) {
    // 檢查傳入參數的數量是否匹配
    if (names.length !== transformations.length) {
        alert('名稱和變換數組的長度不匹配。');
        return;
    }

    // 遍歷所有名稱和對應的變換
    for (var i = 0; i < names.length; i++) {
        var name = names[i];
        var transformation = transformations[i];
        
        var pageItem = getPageItemByName(name);
        if (pageItem) {
            // 計算縮放百分比
            var scalePercentage = scaleFactor * 100;

            // 縮放對象
            pageItem.resize(
                scalePercentage,          // 水平縮放百分比
                scalePercentage,          // 垂直縮放百分比
                true,                     // 縮放線條
                true,                     // 縮放樣式
                true,                     // 縮放圖案
                true,                     // 縮放漸變
                scalePercentage,          // 縮放選項
                transformation            // 縮放中心點
            );
        } else {
            alert('找不到名稱為 "' + name + '" 的對象。');
        }
    }
}

function copyPageItem(pageItem){
	strokeColor = new RGBColor();
	strokeColor.red = 0;
	strokeColor.green = 0;
	strokeColor.blue = 0;  // 黑色
	
	newItem = pageItem.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
	newItem.strokeColor = strokeColor;
	newItem.strokeWidth = 0.75;
	app.activeDocument = doc;
	return newItem;
	
}

function getPoint(pageItem,w,h){
	n = 2.83464567;
	log(["w = ",w,"h = ",h, "mm(w)",w*n,"mm(h)",h*n]);
	pt = [pageItem.geometricBounds[0]+w*n,pageItem.geometricBounds[1]-h*n];
	log(["x = ",p2mm(pt[0]),"y = ",p2mm(pt[1])]);
	return pt;
}

function moveToPoint(pageItem1,w1,h1,pageItem2,w2,h2){
	p1 = getPoint(pageItem1,w1,h1);
	p2 = getPoint(pageItem2,w2,h2); 
	translationMatrix = app.getTranslationMatrix(p1[0]-p2[0], p1[1]-p2[1]);
	return translationMatrix;
}

/**
 * p:旋轉點
 * r:半徑 單位:mm myObject['左後袖旋轉半徑']
 * i1:物件,不旋轉
 * i2:旋轉物件
 * b1:i1半徑交叉點0或1
 * b2:i2半徑交叉點0或1
 * list:要旋轉的所有物件
 * b3:正向或反向旋轉
 */
function angleDegrees(p,r,i1,i2,b1,b2,list,b3){
	rotationAngle = getAngleDegreesByPt(p,mm(r),i1,i2,b1,b2);
	if(b3){
		rotationMatrix = app.getRotationMatrix(rotationAngle);
	}else{
		rotationMatrix = app.getRotationMatrix(-rotationAngle);
	}
	// 生成平移矩阵，将路径移动到原点
	var translateToOrigin = app.getTranslationMatrix(-p[0], -p[1]);
	// 生成平移矩阵，将路径移动回原位置
	var translateBack = app.getTranslationMatrix(p[0], p[1]);
	
	for (var i = 0; i < list.length; i++) {
		list[i].transform(translateToOrigin, true, true, true, true, 1, Transformation.DOCUMENTORIGIN)
		list[i].transform(rotationMatrix, true, true, true, true, 1, Transformation.DOCUMENTORIGIN);
		list[i].transform(translateBack, true, true, true, true, 1, Transformation.DOCUMENTORIGIN);
	}
}

//mirrorByPt

function getMirrorWidth(item1,item2){
	v1 = item1.geometricBounds[0]+item1.width/2; //中心
	v2 = item2.geometricBounds[2];
	w = (v1-v2)*2+item2.width;
	return w;
	
}

//旋轉方向傳入欄位名稱例如 後袖旋轉方向
function rotationDirection(name){
	if(list,myObject[name] == 'true'){
		return true;
	}else{
		return false;
	}
}


function getMypath(name){
	apath = myObject['路徑'];
	return apath + "/" + myObject[name];
}

function getPath(value){
	return selectedValues.dxfLocation+"/"+value;
}


/**
 * 將指定的頁面物件移動至另一個頁面物件之前或之後。
 * 
 * @param {string} itemToMoveName - 要移動的頁面物件名稱。
 * @param {string} referenceItemName - 參考頁面物件名稱，將 itemToMoveName 移動到這個物件之前或之後。
 * @param {boolean} moveBefore - 如果為 true，將 itemToMoveName 移動到 referenceItemName 之前，否則移動到 referenceItemName 之後。
 */
function moveItem(itemToMoveName, referenceItemName, moveBefore) {
    var itemToMove = getPageItemByName(itemToMoveName);
    var referenceItem = getPageItemByName(referenceItemName);
    
    if (itemToMove && referenceItem) {
        if (moveBefore) {
            // 將 itemToMove 移動到 referenceItem 之前
            itemToMove.move(referenceItem, ElementPlacement.PLACEBEFORE);
        } else {
            // 將 itemToMove 移動到 referenceItem 之後
            itemToMove.move(referenceItem, ElementPlacement.PLACEAFTER);
        }
    } else {
        if (!itemToMove) {
            alert("找不到名稱為 " + itemToMoveName + " 的頁面物件。");
        }
        if (!referenceItem) {
            alert("找不到名稱為 " + referenceItemName + " 的頁面物件。");
        }
    }
}

/**
 * 將指定的頁面物件移動到圖層的最前面或最後面。
 * 
 * @param {string} itemName - 要移動的頁面物件名稱。
 * @param {boolean} moveToFront - 如果為 true，將物件移動到圖層的最前面；如果為 false，將物件移動到圖層的最後面。
 */
function arrangeItemOrder(itemName, moveToFront) {
    var doc = app.activeDocument;
    var item = getPageItemByName(itemName);
    
    if (item) {
        if (moveToFront) {
            // 將 item 移動到圖層的最前面
            item.move(doc.activeLayer, ElementPlacement.PLACEATEND);
        } else {
            // 將 item 移動到圖層的最後面
            item.move(doc.activeLayer, ElementPlacement.PLACEBEFORE);
        }
    } else {
        alert("找不到名稱為 " + itemName + " 的頁面物件。");
    }
}



var selectedValues;
showGui("D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2/clothes.csv");
csvfilePath = "D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2/clothes.csv";
myObject = readCsvToObj(new File(csvfilePath));