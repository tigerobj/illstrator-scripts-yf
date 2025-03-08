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
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    var filePath = pathEnv;
    //var filePath = "D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2";
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


/**
 * 將不同圖層中相同名稱的頁面物件對齊，並替換遮罩中的物件，同時設置填色。
 * 
 * @param {string} sourceLayerName - 來源圖層名稱（不在遮罩內的物件所在圖層）。
 * @param {string} targetLayerName - 目標圖層名稱（在遮罩內的物件所在圖層）。
 * @param {string} itemName - 頁面物件的名稱。
 */
function alignReplaceAndSetFill(sourceLayerName, targetLayerName, itemName) {
    var doc = app.activeDocument;
    
    // 獲取來源物件（不在遮罩內）
    var sourceItem = getPageItemByNameInLayer(doc, sourceLayerName, itemName);
    
    // 獲取目標物件（在遮罩內）
    var targetItem = getPageItemByNameInLayer(doc, targetLayerName, itemName);
    
    if (sourceItem && targetItem) {
        // 解鎖並顯示來源和目標物件
        unlockAndShowItem(sourceItem);
        unlockAndShowItem(targetItem);
        
        // 設置目標物件的填色為來源物件的填色
        setFillColor(targetItem,sourceItem);
        
        
        // 對齊來源物件到目標物件
        alignItems(sourceItem, targetItem);
        
        // 替換遮罩中的物件
        //replaceMaskItem(targetItem, sourceItem);
        
        
        
        //alert("已成功對齊、替換遮罩中的物件並設置填色。");
    } else {
        if (!sourceItem) {
            alert("找不到圖層 '" + sourceLayerName + "' 中名稱為 '" + itemName + "' 的來源物件。");
        }
        if (!targetItem) {
            alert("找不到圖層 '" + targetLayerName + "' 中名稱為 '" + itemName + "' 的目標遮罩物件。");
        }
    }
}


/**
 * 遞歸查找指定圖層中的頁面物件。
 * 
 * @param {Item} item - 目前檢查的物件。
 * @param {string} itemName - 要查找的物件名稱。
 * @returns {PageItem|null} - 返回對應的頁面物件，如果未找到則返回 null。
 */
function findPageItemInGroup(item, itemName) {
    if (item.name === itemName) {
        return item;
    }

    // 如果是群組，則遞歸檢查其子物件
    if (item.typename === "GroupItem") {
        var items = item.pageItems;
        for (var i = 0; i < items.length; i++) {
            var foundItem = findPageItemInGroup(items[i], itemName);
            if (foundItem) {
                return foundItem;
            }
        }
    }

    return null; // 如果未找到對應物件
}


/**
 * 在指定圖層中根據名稱獲取頁面物件，包括群組和遮罩內的物件。
 * 
 * @param {Document} doc - Adobe Illustrator 文件對象。
 * @param {string} layerName - 圖層的名稱。
 * @param {string} itemName - 頁面物件的名稱。
 * @returns {PageItem|null} - 返回對應的頁面物件，如果未找到則返回 null。
 */
function getPageItemByNameInLayer(doc, layerName, itemName) {
    var layer = doc.layers.getByName(layerName);
    if (layer) {
        var items = layer.pageItems;
        for (var i = 0; i < items.length; i++) {
            var foundItem = findPageItemInGroup(items[i], itemName);
            if (foundItem) {
                return foundItem;
            }
        }
    }
    return null; // 如果找不到對應的物件，返回 null
}


/**
 * 在指定圖層中遞歸查找位於遮罩內的頁面物件。
 * 
 * @param {Document} doc - Adobe Illustrator 文件對象。
 * @param {string} layerName - 圖層的名稱。
 * @param {string} itemName - 頁面物件的名稱。
 * @returns {PageItem|null} - 返回匹配的頁面物件，如果未找到則返回 null。
 */
function getMaskedPageItemByNameInLayer(doc, layerName, itemName) {
    var layer = getLayerByName(doc, layerName);
    if (layer) {
        var pageItems = layer.pageItems;
        for (var i = 0; i < pageItems.length; i++) {
            var item = pageItems[i];
            if (item.name === itemName && isClippingMask(item)) {
                // 如果是遮罩本身，則返回其第一個被遮罩的物件
                if (item.typename === "GroupItem" && item.clipped) {
                    var clippedItems = item.pageItems;
                    if (clippedItems.length > 0) {
                        return clippedItems[0];
                    }
                }
            }
            if (item.typename === "GroupItem") {
                var foundItem = findPageItemRecursively(item, itemName);
                if (foundItem && isClippingMask(foundItem)) {
                    return foundItem;
                }
            }
        }
    }
    return null;
}

/**
 * 根據名稱獲取圖層。
 * 
 * @param {Document} doc - Adobe Illustrator 文件對象。
 * @param {string} layerName - 圖層名稱。
 * @returns {Layer|null} - 返回匹配的圖層或 null。
 */
function getLayerByName(doc, layerName) {
    var layers = doc.layers;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].name === layerName) {
            return layers[i];
        }
    }
    return null;
}

/**
 * 遞歸查找頁面物件。
 * 
 * @param {PageItem} parent - 父頁面物件。
 * @param {string} itemName - 頁面物件的名稱。
 * @returns {PageItem|null} - 返回匹配的頁面物件或 null。
 */
function findPageItemRecursively(parent, itemName) {
    if (parent.name === itemName) {
        return parent;
    }
    if (parent.typename === "GroupItem") {
        var children = parent.pageItems;
        for (var i = 0; i < children.length; i++) {
            var found = findPageItemRecursively(children[i], itemName);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

/**
 * 檢查頁面物件是否為遮罩。
 * 
 * @param {PageItem} item - 頁面物件。
 * @returns {boolean} - 如果是遮罩則返回 true，否則返回 false。
 */
function isClippingMask(item) {
    if (item.typename === "GroupItem" && item.clipped) {
        return true;
    }
    return false;
}

/**
 * 解鎖並顯示頁面物件。
 * 
 * @param {PageItem} item - 頁面物件。
 */
function unlockAndShowItem(item) {
    item.locked = false;
    item.hidden = false;
}

/**
 * 對齊兩個頁面物件的位置（使中心點對齊）。
 * 
 * @param {PageItem} sourceItem - 來源頁面物件。
 * @param {PageItem} targetItem - 目標頁面物件。
 */
function alignItems(sourceItem, targetItem) {
    var sourceBounds = sourceItem.visibleBounds; // [上, 左, 下, 右]
    var targetBounds = targetItem.visibleBounds;
    
    targetItem.selected = true;
    
    var sourceCenterX = (sourceBounds[0] + sourceBounds[2]) / 2;
    var sourceCenterY = (sourceBounds[1]);
    
    var targetCenterX = (targetBounds[0] + targetBounds[2]) / 2;
    var targetCenterY = (targetBounds[1]);
    
    var deltaX = (targetCenterX - sourceCenterX);
    var deltaY = targetCenterY - sourceCenterY;
    
    sourceItem.translate(deltaX, deltaY);
}

/**
 * 替換遮罩中的頁面物件。
 * 
 * @param {PageItem} maskItem - 遮罩中的頁面物件。
 * @param {PageItem} newItem - 新的頁面物件，用於替換。
 */
function replaceMaskItem(maskItem, newItem) {
    var parentGroup = maskItem.parent;
    
    // 複製新物件
    var duplicatedItem = newItem.duplicate(parentGroup, ElementPlacement.PLACEATEND);
    
    // 移除原遮罩物件
    maskItem.remove();
    
    // 如果原來是群組且有遮罩，確保新物件也屬於該群組
    if (parentGroup.typename === "GroupItem" && parentGroup.clipped) {
        duplicatedItem.move(parentGroup, ElementPlacement.PLACEATEND);
    }
}

/**
 * 將一個頁面物件的填色設置為另一個頁面物件的填色。
 * 
 * @param {PageItem} sourceItem - 來源頁面物件。
 * @param {PageItem} targetItem - 目標頁面物件。
 */
function setFillColor(sourceItem, targetItem) {
	if (sourceItem && targetItem) {
		var fillColor = sourceItem.fillColor;
		targetItem.fillColor = fillColor;
	}else {
        if (!sourceItem) {
            alert("找不到圖層 '" + sourceLayer + "' 中名稱為 '" + sourceName + "' 的來源物件。");
        }
        if (!targetItem) {
            alert("找不到圖層 '" + targetLayer + "' 中名稱為 '" + targetName + "' 的目標物件。");
        }
    }
    return fillColor;
}

/**
 * 根據名稱獲取頁面物件。
 * 
 * @param {string} name - 頁面物件的名稱。
 * @returns {PageItem|null} - 對應的頁面物件。
 */
function getPageItemByName(name) {
    var doc = app.activeDocument;
    var items = doc.pageItems;
    for (var i = 0; i < items.length; i++) {
        if (items[i].name === name) {
            return items[i];
        }
    }
    return null;
}

// 使用範例
// 將來源圖層 "設計層" 中名稱為 "底" 的物件，對齊到目標圖層 "遮罩圖層" 中名稱為 "底" 的物件，並替換遮罩內的物件，同時設置填色
//alignReplaceAndSetFill("設計層", "遮罩圖層", "底");




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

/**
 * 遞迴遍歷群組中的所有物件，解鎖並顯示
 * 
 * @param {GroupItem} groupItem - 要遞迴遍歷的群組
 */
function unlockAndShowGroupItems(groupItem) {
    // 檢查物件是否已鎖定，若鎖定則解鎖
    if (groupItem.locked) {
        groupItem.locked = false;
    }

    // 檢查物件是否可見，若隱藏則顯示
    if (!groupItem.visible) {
        groupItem.visible = true;
    }

    // 遍歷該群組內的所有物件
    for (var i = 0; i < groupItem.pageItems.length; i++) {
        var item = groupItem.pageItems[i];
        if(!item){
			continue;
		}

        // 如果該物件是一個群組，遞迴遍歷其內部物件
        if (item.typename === "GroupItem") {
            unlockAndShowGroupItems(item);
        } else {
            // 如果是其他類型的物件，解鎖並顯示
            if (item.locked === true) {
                //item.locked = false;
                continue;
            }
            if (item.visible === false) {
				alert(item+" :　"+item.visible);
                //item.visible = true;
                continue;
            }
            if (item.selected === false) {
				item.selected = true;
			}
            
        }
    }
}

function groupsCopy(doc,path,groupList){
	sourceDoc = app.open(File(path));
	for (var i = 0; i < groupList.length; i++) {
		//alert(groupList[i]);
		groupItem = getGroupItemByNameForDoc(sourceDoc,groupList[i]);
		if(!groupItem){
			continue;
		}
		
		groupItem.selected = true;
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


/**
 * 根據名稱和縮放因子縮放頁面物件。
 * 
 * @param {number} scaleFactor - 縮放因子，0.5 代表縮小到一半，2 代表放大兩倍。
 * @param {Array} pageItem - 需要縮放的頁面物件。
 * @param {Array} transformation - 縮放中心點。
 */
function scalePageItemByGroup(scaleFactor, pageItem, transformation) {
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
	//log(["w = ",w,"h = ",h, "mm(w)",w*n,"mm(h)",h*n]);
	pt = [pageItem.geometricBounds[0]+w*n,pageItem.geometricBounds[1]-h*n];
	//log(["x = ",p2mm(pt[0]),"y = ",p2mm(pt[1])]);
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



/**
 * 在指定圖層中，釋放指定名稱的剪裁遮色片群組，並移除該群組。
 * 
 * @param {string} layerName - 圖層的名稱（例如 "設計層"）。
 * @param {string} groupName - 剪裁遮色片群組的名稱（例如 "剪裁群組_底"）。
 */
function releaseAndRemoveClippingMaskGroup(layerName, groupName) {
    var doc = app.activeDocument;

    // 獲取指定的圖層
    var layer = doc.layers.getByName(layerName);
    if (!layer) {
        alert("找不到名稱為 '" + layerName + "' 的圖層。");
        return;
    }

    // 在圖層中尋找指定名稱的群組
    var group = getPageItemByNameInLayer(doc,layerName, groupName);
    if (!group) {
        alert("在圖層 '" + layerName + "' 中找不到名稱為 '" + groupName + "' 的群組。");
        return;
    }

    // 解鎖並顯示群組
    unlockAndShowItem(group);

    // 如果群組是剪裁遮色片，則釋放遮罩
    if (isClippingMask(group)) {
        releaseClippingMask(group);
    }

    // 移除群組
    group.remove();

    //alert("已成功釋放剪裁遮色片並移除群組 '" + groupName + "'。");
}


/**
 * 釋放剪裁遮色片。
 * 
 * @param {GroupItem} maskGroup - 剪裁遮色片群組對象。
 */
function releaseClippingMask(maskGroup) {
    // 解鎖並顯示群組內的所有物件
    for (var i = 0; i < maskGroup.pageItems.length; i++) {
        unlockAndShowItem(maskGroup.pageItems[i]);
    }

    // 解除剪裁遮色片屬性
    maskGroup.clipped = false;

    // 如果需要，將群組內的物件移出群組
    // 取消以下註解可將物件移出群組
    
    var parent = maskGroup.parent;
    while (maskGroup.pageItems.length > 0) {
        maskGroup.pageItems[0].move(parent, ElementPlacement.PLACEATEND);
    }
    
}

/**
 * 解鎖並顯示指定的頁面物件。
 * 
 * @param {PageItem} item - 要解鎖和顯示的物件。
 */
function unlockAndShowItem(item) {
    if (item.locked) {
        item.locked = false;
    }
    if (item.hidden) {
        item.hidden = false;
    }
}


/**
 * 移除指定圖層內名稱為 pageItemName 的頁面物件。
 * 
 * @param {string} layerName - 圖層的名稱。
 * @param {string} pageItemName - 頁面物件的名稱。
 */
function removePageItem(layerName, pageItemName) {
    var doc = app.activeDocument;

    // 獲取指定圖層
    var layer = doc.layers.getByName(layerName);
    if (!layer) {
        alert("找不到名稱為 '" + layerName + "' 的圖層。");
        return;
    }

    // 在圖層中尋找指定名稱的 pageItem
    
    var pageItem = getPageItemByNameInLayer(doc, layerName, pageItemName);
    if (!pageItem) {
        alert("在圖層 '" + layerName + "' 中找不到名稱為 '" + pageItemName + "' 的頁面物件。");
        return;
    }

    // 解鎖並顯示頁面物件，以便可以刪除
    unlockAndShowItem(pageItem);

    // 移除頁面物件
    pageItem.remove();
}


/**
 * 將指定的頁面物件移動到目標圖層，並排序為該圖層中的第一個物件。
 * 
 * @param {string} sourceLayerName - 來源圖層的名稱。
 * @param {string} pageItemName - 要移動的頁面物件的名稱。
 * @param {string} targetLayerName - 目標圖層的名稱。
 */
function movePageItemToLayerAsFirst(sourceLayerName, pageItemName, targetLayerName) {
    var doc = app.activeDocument;

//var layer = doc.layers.getByName(layerName);
    // 獲取來源圖層
    var sourceLayer = doc.layers.getByName(sourceLayerName);
    if (!sourceLayer) {
        alert("找不到名稱為 '" + sourceLayerName + "' 的來源圖層。");
        return;
    }

    // 獲取目標圖層
    var targetLayer = doc.layers.getByName(targetLayerName);
    if (!targetLayer) {
        alert("找不到名稱為 '" + targetLayerName + "' 的目標圖層。");
        return;
    }

    // 在來源圖層中尋找指定名稱的 pageItem
    var pageItem = getPageItemByNameInLayer(doc,sourceLayerName, pageItemName);
    if (!pageItem) {
        alert("在圖層 '" + sourceLayerName + "' 中找不到名稱為 '" + pageItemName + "' 的頁面物件。");
        return;
    }

    // 解鎖並顯示頁面物件，以便可以移動
    unlockAndShowItem(pageItem);

    // 將頁面物件移動到目標圖層，並排序為第一個
    pageItem.move(targetLayer, ElementPlacement.PLACEATBEGINNING);

    //alert("已成功將頁面物件 '" + pageItemName + "' 移動到圖層 '" + targetLayerName + "' 並排在第一位。");
}

/**
 * 在指定圖層內，選擇所有物件並將它們製作成剪裁遮色片，並設定遮罩群組的名稱。
 * 
 * @param {string} layerName - 要操作的圖層名稱。
 * @param {string} clippingMaskGroupName - 要設定的遮罩群組名稱。
 */
function createClippingMaskForLayerWithName(layerName, clippingMaskGroupName,itemName) {
    var doc = app.activeDocument;
    myItem = getPageItemByNameInLayer(doc, layerName, itemName);
    var fillColor = myItem.fillColor;
    // 獲取指定圖層
    try {
        var layer = doc.layers.getByName(layerName);
    } catch (e) {
        alert("找不到名稱為 '" + layerName + "' 的圖層。");
        return;
    }
    
    // 獲取圖層內的所有頁面物件
    var items = layer.pageItems;
    if (items.length < 2) {
        alert("圖層 '" + layerName + "' 內的物件不足以製作剪裁遮色片。需要至少 2 個物件。");
        return;
    }
    
    // 解鎖並顯示所有物件
    for (var i = 0; i < items.length; i++) {
        unlockAndShowItem(items[i]);
    }
    
    // 選取圖層內的所有物件
    for (var i = 0; i < items.length; i++) {
        items[i].selected = true;
    }
    
    // 執行製作剪裁遮色片的命令
    app.executeMenuCommand('makeMask');
    
    // 在圖層中尋找新的剪裁遮色片群組
    var clippingGroup = null;
    for (var i = 0; i < layer.groupItems.length; i++) {
        var group = layer.groupItems[i];
        if (group.clipped) {
            clippingGroup = group;
            break;
        }
    }
    
    if (clippingGroup) {
        // 設定剪裁遮色片群組的名稱
        clippingGroup.name = clippingMaskGroupName;
        //alert("已成功為圖層 '" + layerName + "' 內的物件製作剪裁遮色片，並設定名稱為 '" + clippingMaskGroupName + "'。");
    } else {
        alert("未能找到新的剪裁遮色片群組。");
    }
    
    myItem.fillColor4 = fillColor;
    //fillColor
    // 清除選取
    doc.selection = null;
}


/**
 * 將指定的頁面物件移動到目標圖層，並在目標圖層中將其排列在指定的頁面物件之後。
 * 
 * @param {string} sourceLayerName - 來源圖層的名稱。
 * @param {string} pageItemName - 要移動的頁面物件的名稱。
 * @param {string} targetLayerName - 目標圖層的名稱。
 * @param {string} referencePageItemName - 目標圖層中作為參考的頁面物件名稱，新的頁面物件將排列在其之後。
 */
function movePageItemToLayerAfterItem(sourceLayerName, pageItemName, targetLayerName, referencePageItemName) {
    var doc = app.activeDocument;

    // 獲取來源圖層
    var sourceLayer =  doc.layers.getByName(sourceLayerName);
    if (!sourceLayer) {
        alert("找不到名稱為 '" + sourceLayerName + "' 的來源圖層。");
        return;
    }

    // 獲取目標圖層
    var targetLayer = doc.layers.getByName(targetLayerName);
    if (!targetLayer) {
        alert("找不到名稱為 '" + targetLayerName + "' 的目標圖層。");
        return;
    }

	//getPageItemByNameInLayer(doc, layerName, itemName);
    // 在來源圖層中尋找要移動的頁面物件
    var pageItem = getPageItemByNameInLayer(doc,sourceLayerName, pageItemName);
    if (!pageItem) {
        alert("在圖層 '" + sourceLayerName + "' 中找不到名稱為 '" + pageItemName + "' 的頁面物件。");
        return;
    }

    // 在目標圖層中尋找參考頁面物件
    var referencePageItem = getPageItemByNameInLayer(doc,targetLayerName, referencePageItemName);
    if (!referencePageItem) {
        alert("在圖層 '" + targetLayerName + "' 中找不到名稱為 '" + referencePageItemName + "' 的參考頁面物件。");
        return;
    }

    // 解鎖並顯示頁面物件，以便可以移動
    unlockAndShowItem(pageItem);

    // 將頁面物件移動到目標圖層
    pageItem.move(targetLayer, ElementPlacement.PLACEATEND);

    // 將頁面物件排列在參考頁面物件之後
    pageItem.move(referencePageItem, ElementPlacement.PLACEAFTER);

    //alert("已成功將頁面物件 '" + pageItemName + "' 移動到圖層 '" + targetLayerName + "' 並排列在 '" + referencePageItemName + "' 之後。");
}

/**
 * 將來源頁面物件移動並對齊到目標頁面物件的左上角。
 * 
 * @param {string} sourceLayerName - 來源圖層的名稱。
 * @param {string} sourcePageItemName - 要移動的頁面物件的名稱。
 * @param {string} movePageItemName - 移動物件的名稱。
 * @param {string} targetLayerName - 目標圖層的名稱。
 * @param {string} targetPageItemName - 要對齊的目標頁面物件的名稱。
 */
function alignPageItemToTopLeft(sourceLayerName, sourcePageItemName,movePageItemName, targetLayerName, targetPageItemName) {
    var doc = app.activeDocument;

    // 在來源圖層中尋找要移動的距離物件  getPageItemByNameInLayer
    var sourcePageItem = getPageItemByNameInLayer(doc,sourceLayerName, sourcePageItemName);
    if (!sourcePageItem) {
        alert("在圖層 '" + sourceLayerName + "' 中找不到名稱為 '" + sourcePageItemName + "' 的頁面物件。");
        return;
    }

    // 在目標圖層中尋找要對齊的目標頁面物件
    var targetPageItem = getPageItemByNameInLayer(doc,targetLayerName, targetPageItemName);
    if (!targetPageItem) {
        alert("在圖層 '" + targetLayerName + "' 中找不到名稱為 '" + targetPageItemName + "' 的目標頁面物件。");
        return;
    }
    
    //
    //移動的頁面物件
    var movePageItem = getPageItemByNameInLayer(doc,sourceLayerName, movePageItemName);
    if (!movePageItem) {
        alert("在圖層 '" + sourceLayerName + "' 中找不到名稱為 '" + movePageItemName + "' 的移動物件。");
        return;
    }

    // 解鎖並顯示頁面物件，以便可以移動
    unlockAndShowItem(sourcePageItem);

    // 計算目標頁面物件的左上角座標 (top, left)
    //geometricBounds
    var targetBounds = targetPageItem.geometricBounds; // [上, 左, 下, 右]
    //var targetBounds = targetPageItem.visibleBounds; // [上, 左, 下, 右]
    var targetTopLeftX = targetBounds[0]; // 左邊 X
    var targetTopLeftY = targetBounds[1]; // 上邊 Y

    // 計算來源頁面物件的左上角座標 (top, left)
    var sourceBounds = sourcePageItem.geometricBounds; // [上, 左, 下, 右]
    //var sourceBounds = sourcePageItem.visibleBounds; // [上, 左, 下, 右]
    var sourceTopLeftX = sourceBounds[0]; // 左邊 X
    var sourceTopLeftY = sourceBounds[1]; // 上邊 Y

    // 計算要移動的位移量
    var deltaX = targetTopLeftX - sourceTopLeftX;
    var deltaY = targetTopLeftY - sourceTopLeftY;

	
    // 移動來源頁面物件到目標頁面物件的左上角
    movePageItem.translate(deltaX, deltaY);
    targetPageItem.selected = false;
	sourcePageItem.selected = false;
	return [deltaX, deltaY];
    
    //alert("sourcePageItem x : "+sourcePageItem.geometricBounds[0]);
    //alert("targetPageItem x : "+targetPageItem.geometricBounds[0]);
    

    //alert("已成功將頁面物件 '" + sourcePageItemName + "' 移動並對齊到 '" + targetPageItemName + "' 的左上角。");
}

/**
 * 將指定的頁面物件在 y 軸上移動指定的距離（正數為向下，負數為向上）。
 * 
 * @param {string} layerName - 來源圖層的名稱。
 * @param {string} pageItemName - 要移動的頁面物件名稱。
 * @param {number} distance - 要移動的距離（正數表示向下，負數表示向上）。
 */
function movePageItemVertically(layerName, pageItemName, distance) {
    var doc = app.activeDocument;

    // 獲取來源圖層
    var layer = doc.layers.getByName(layerName);
    if (!layer) {
        alert("找不到名稱為 '" + layerName + "' 的來源圖層。");
        return;
    }

    // 在圖層中尋找頁面物件
    var pageItem = getPageItemByNameInLayer(doc, layerName, pageItemName);
    if (!pageItem) {
        alert("在圖層 '" + layerName + "' 中找不到名稱為 '" + pageItemName + "' 的頁面物件。");
        return;
    }

    // 解鎖並顯示頁面物件，以便可以移動
    unlockAndShowItem(pageItem);

    // 移動頁面物件，在 y 軸方向移動指定的距離
    pageItem.translate(0, distance* 2.83464567);

    //alert("已成功將頁面物件 '" + pageItemName + "' 向 " + (distance > 0 ? "下" : "上") + " 移動了 " + Math.abs(distance) + " 點。");
}

/**
 * 根據提供的名稱列表，按照倒序重新排列指定圖層中的 pageItems 順序
 * 
 * @param {string} layerName - 要進行排序的圖層名稱
 * @param {Array} nameOrderList - 按照這個名稱順序對應的 pageItems 進行排序
 */
function reorderPageItemsInLayer(layerName, nameOrderList) {
    var doc = app.activeDocument;

    // 找到指定的圖層
    var layer = doc.layers.getByName(layerName);
    if (!layer) {
        alert("找不到名稱為 '" + layerName + "' 的圖層。");
        return;
    }

    // 倒序遍歷提供的名稱列表，依次查找並將 pageItem 移到最上層
    for (var i = nameOrderList.length - 1; i >= 0; i--) {
        var itemName = nameOrderList[i];
		if(! itemName){
			continue;
		}

        // 查找該圖層中的 pageItem
        try {
            var pageItem = layer.pageItems.getByName(itemName);
            if (pageItem) {
                // 將該 pageItem 移動到最上層
                pageItem.move(layer, ElementPlacement.PLACEATBEGINNING);
            }
        } catch (e) {
            // 如果找不到該名稱的 pageItem，跳過
            log(["未找到名稱為",itemName,"的物件，跳過。"]);
            //alert("未找到名稱為 '" + itemName + "' 的物件，跳過。");
        }
    }

    //alert("倒序排序完成！");
}




/**
 * 從指定文檔和 pageItem 名稱中獲取填色
 * 
 * @param {Document} doc - 要操作的文檔
 * @param {string} itemName - pageItem 的名稱
 * @returns {fillColor} - 填色的顏色
 */
function getFillColorFromPageItem(doc, itemName) {
    try {
        // 獲取指定名稱的 pageItem
        var pageItem = doc.pageItems.getByName(itemName);
        
        // 檢查物件是否有填色
        if (pageItem.filled) {
           return pageItem.fillColor;
        }
	}catch (e) {
        return "未找到名稱為 '" + itemName + "' 的物件或該物件無法獲取填色。";
    }	
}


/**
 * 從一個文檔的 pageItem 獲取填色，並將它應用到另一個文檔的 pageItem
 * 
 * @param {Document} sourceDoc - 來源文檔
 * @param {string} sourceItemName - 來源文檔中 pageItem 的名稱
 * @param {Document} targetDoc - 目標文檔
 * @param {pageItem} targetItem - 目標文檔中 pageItem
 */
function applyFillColorFromAnotherDoc(sourceDoc, sourceItemName, targetDoc, targetItem) {
    try {
        // 獲取來源文檔中的 pageItem
        var sourceItem = sourceDoc.pageItems.getByName(sourceItemName);
        if (!sourceItem) {
            throw new Error("未找到來源文檔中的物件 '" + sourceItemName + "'");
        }

        // 檢查來源物件是否有填色
        if (sourceItem.filled) {
            var fillColor = sourceItem.fillColor;
			
            // 將來源物件的填色應用到目標物件
            targetItem.fillColor = fillColor;
            
        } else {
            alert("來源物件 '" + sourceItemName + "' 無填色");
        }
    } catch (e) {
        alert("錯誤：" + e.message);
    }
}


/**
 * 從一個文檔的 pageItem 獲取描邊顏色，並將它應用到另一個文檔的 pageItem
 * 
 * @param {Document} sourceDoc - 來源文檔
 * @param {string} sourceItemName - 來源文檔中 pageItem 的名稱
 * @param {Document} targetDoc - 目標文檔
 * @param {pageItem} targetItem - 目標文檔中 pageItem
 */
function applyStrokeColorFromAnotherDoc(sourceDoc, sourceItemName, targetDoc, targetItem) {
    try {
        // 獲取來源文檔中的 pageItem
        var sourceItem = sourceDoc.pageItems.getByName(sourceItemName);
        if (!sourceItem) {
            throw new Error("未找到來源文檔中的物件 '" + sourceItemName + "'");
        }

        // 檢查來源物件是否有填色
        if (sourceItem.strokeColor) {
            var strokeColor = sourceItem.strokeColor;
            targetItem.strokeColor = strokeColor;
        } else {
            alert("來源物件 '" + sourceItemName + "' 無描邊顏色");
        }
    } catch (e) {
        alert("錯誤：" + e.message);
    }
}



pathEnvFile = checkForDataCsv();
if(pathEnvFile === null){
	exit();
}

var selectedValues;
var selectFilePathText;
showGui(pathEnvFile.fsName);

log(["selectedValues",selectedValues]);

clothingTemplateDoc = app.open(File(selectFilePathText));


//sourceFillDoc.close(SaveOptions.DONOTSAVECHANGES);

//var doc = app.activeDocument;
//alert(sourceFillDoc);
//alert(sleeveFillColor);
//alert(backInnerCollarFillColor);

//alert(selectedValues.shirtType+" ,"+selectedValues.selectedSize+" , selectedValue = "+selectedValues.shirtFront);
//alert(selectFilePathText);
//0

csvfilePath = getPath("data.csv");
//csvfilePath = "D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2/data.csv";

myObject = readCsvToObj(new File(csvfilePath));

app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
var optRef = app.preferences.AutoCADFileOptions; 
optRef.centerArtwork=true; 
optRef.globalScaleOption=AutoCADGlobalScaleOption.ScaleByValue; 
optRef.globalScalePercent=100.0; 
optRef.mergeLayers=false; 
optRef.scaleLineweights=false; 
optRef.selectedLayoutName="Model"; 
optRef.unit=AutoCADUnit.Millimeters; 
optRef.unitScaleRatio=1; 

var width_artwork = 2540;
var height_artwork = 1350;
var aiDocPreset = new DocumentPreset();
aiDocPreset.units = RulerUnits.Millimeters;
aiDocPreset.width = mm(width_artwork);
aiDocPreset.height = mm(height_artwork);
aiDocPreset.rasterResolution = DocumentRasterResolution.HighResolution;
aiDocPreset.title = myObject['名稱']+"_"+myObject['尺寸'];
aiDocPreset.colorMode = DocumentColorSpace.CMYK;

var doc = app.documents.addDocument(myObject['名稱']+"_"+myObject['尺寸']+"_Preset", aiDocPreset);




//樣版前片
var mypath = getPath(selectedValues.shirtFront);

//var mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-前X2.dxf";
var openDoc = app.open(File(mypath),DocumentColorSpace.CMYK);
var layer =openDoc.layers['縫份'];
var pageItem = layer.pageItems[0].pageItems[0];

a = copyPageItem(pageItem);
a.name = "左前";

/*
layer =openDoc.layers['針孔'];
pageItem = layer.pageItems[0].pageItems[0];
a_1 = copyPageItem(pageItem);
a_1.name = "左前針孔";
*/

//參考線
layer =openDoc.layers['參考線'];
pageItem = layer.pageItems[0].pageItems[0];
c = copyPageItem(pageItem);
c.name = '中心線';

//線寬度
//粘扣
layer =openDoc.layers['粘扣'];
pageItem = layer.pageItems[0].pageItems[0];
p_1 = copyPageItem(pageItem);
p_1.name = "左前線1";
p_1.strokeWidth = myObject['線寬度'];  // 笔画宽度为 10 点


pageItem = layer.pageItems[1].pageItems[0];
p_2 = copyPageItem(pageItem);
p_2.name = "左前線2";
p_2.strokeWidth = myObject['線寬度'];  // 笔画宽度为 10 点
//p_2.fillColor = lineFillColor;


//var mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-袖X2.dxf
mypath = getPath(selectedValues.shirtSleeve);

openDoc2 = app.open(File(mypath),DocumentColorSpace.CMYK);

layer =openDoc2.layers['縫份'];
pageItem = getItemByPlusMinus(layer,true);

e = copyPageItem(pageItem);
e.name = "左袖";
//e.fillColor = sleeveFillColor;

layer =openDoc2.layers['參考線'];
pageItem = getItemByPlusMinus(layer,true);

f = copyPageItem(pageItem);
f.name = "左前線3"
f.strokeWidth = myObject['線寬度'];  // 笔画宽度为 10 点
//f.fillColor = lineFillColor;

translationMatrix = moveToPoint(a,myObject['左前片點寬'],myObject['左前片點高'],e,myObject['左前袖點寬'],myObject['左前袖點高']);
e.transform(translationMatrix);
f.transform(translationMatrix);

//旋轉
list = [e,f];
//這個用法
//rotationAngle = getAngleDegreesByPt(p1,mm(myObject['左後袖旋轉半徑']),copy4_01,copy5_01,true,false);
rotationPoint = getPoint(a,myObject['左前片點寬'],myObject['左前片點高']);
angleDegrees(rotationPoint,myObject['左前袖旋轉半徑'],a,e,rotationDirection('前片交點狀態'),rotationDirection('前袖交點狀態'),list,rotationDirection('前袖旋轉方向'));


//app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
//mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-後內貼1襯1.dxf";
//mypath = getPath(selectedValues.background)

mypath = getPath(selectedValues.shirtCollar);
openDoc3 = app.open(File(mypath),DocumentColorSpace.CMYK);

layer =openDoc3.layers['縫份'];
pageItem = layer.pageItems[0].pageItems[0];
g = copyPageItem(pageItem);
g.name = "後內貼";
//g.fillColor = backInnerCollarFillColor;

layer =openDoc3.layers['尺寸線'];
pageItem = layer.pageItems[0].pageItems[0];
g2 = copyPageItem(pageItem);
g2.name = "後內遮罩";
//移動後內遮罩跟領子高度對齊
translationMatrix = app.getTranslationMatrix(0,mm(myObject['領口遮罩移動高度']));
g2.transform(translationMatrix);
// 创建剪切遮罩
var groupItem = doc.layers[0].groupItems.add();

g2.move(groupItem, ElementPlacement.PLACEATEND);
g.move(groupItem, ElementPlacement.PLACEATEND);
groupItem.clipped = true;
groupItem.name = "後領遮罩",
groupList =["後領遮罩"];
//移動領子高度跟右袖對齊
moveTeamName("左袖","中心線","領子點高",groupList);

mirror(c,a,"右前");
mirror(c,e,"右袖");
mirror(c,f,"右前線3");
mirror(c,p_1,"右前線1");
mirror(c,p_2,"右前線2");





//todo
mypath = getPath(selectedValues.background);
openDoc6 = app.open(File(mypath),DocumentColorSpace.CMYK);
layer =openDoc6.layers['縫份'];
pageItem = layer.pageItems[0].pageItems[0];
openDoc6_01 = copyPageItem(pageItem);
openDoc6_01.name = "底";
movePageItemByHeight("左前","中心線",0,"底");
//movePageItemByHeight


var buttonsList = [60,80,98,98,98,98,98];
drawCircle("中心線",5,buttonsList);

/*
groupList = ["隊名","前數字"];
//mypath = getMypath("樣版前面隊名");
mypath = selectedValues.dxfLocation+"/前隊名.ai"
//mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/前隊名.ai";
//alert(mypath);
groupsCopy(doc,mypath,groupList);

moveTeamName("左袖","中心線","隊名高度",groupList);

//縮放模式 	比例
if(myObject['縮放模式'] === "比例"){
	//alert(myObject['縮放模式']);
	//debug使用
	boundaryBox = drawBoundingBoxForGroups(groupList,doc.layers[0]);
	boundaryBox.name = "隊名邊框";
	
	scaleFactor = selectedValues.ChestWidthRatio;
	var transformations = [Transformation.BOTTOM, Transformation.TOP]; // 對應的縮放中心點
	scalePageItems(scaleFactor, groupList, transformations);    
	moveTeamNameByScaleFactor("左袖","中心線","隊名高度",selectedValues.ChestHeightRatio,groupList);
}
*/

doc.layers[0].name = "前示意圖";



applyFillColorFromAnotherDoc(clothingTemplateDoc, "右袖", doc, getPageItemByNameInLayer(doc, "前示意圖", "右袖"));
applyFillColorFromAnotherDoc(clothingTemplateDoc, "左袖", doc, getPageItemByNameInLayer(doc, "前示意圖", "左袖"));
applyFillColorFromAnotherDoc(clothingTemplateDoc, "後內貼", doc, getPageItemByNameInLayer(doc, "前示意圖", "後內貼"));

applyStrokeColorFromAnotherDoc(clothingTemplateDoc, "右前線1", doc, getPageItemByNameInLayer(doc, "前示意圖", "左前線1"));
applyStrokeColorFromAnotherDoc(clothingTemplateDoc, "右前線2", doc, getPageItemByNameInLayer(doc, "前示意圖", "左前線2"));
applyStrokeColorFromAnotherDoc(clothingTemplateDoc, "右前線3", doc, getPageItemByNameInLayer(doc, "前示意圖", "左前線3"));

applyStrokeColorFromAnotherDoc(clothingTemplateDoc, "右前線1", doc, getPageItemByNameInLayer(doc, "前示意圖", "右前線1"));
applyStrokeColorFromAnotherDoc(clothingTemplateDoc, "右前線2", doc, getPageItemByNameInLayer(doc, "前示意圖", "右前線2"));
applyStrokeColorFromAnotherDoc(clothingTemplateDoc, "右前線3", doc, getPageItemByNameInLayer(doc, "前示意圖", "右前線3"));




openDoc.close(SaveOptions.DONOTSAVECHANGES);
openDoc2.close(SaveOptions.DONOTSAVECHANGES);
openDoc3.close(SaveOptions.DONOTSAVECHANGES);
openDoc6.close(SaveOptions.DONOTSAVECHANGES);

var lrmargin = mm(50);
//todo
//movePageItem("前示意圖",-600);
alignObjectsToLeftMargin("前示意圖",lrmargin,0);




var backLayer = doc.layers.add();
backLayer.name = "後示意圖";


//app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
//樣版後片
//mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-後X1.dxf";
mypath = getPath(selectedValues.shirtBack);

openDoc4 = app.open(File(mypath),DocumentColorSpace.CMYK);
layer =openDoc4.layers['縫份'];
pageItem = layer.pageItems[0].pageItems[0];
copy4_01 = copyPageItem(pageItem);
copy4_01.name = "後片";

layer =openDoc4.layers['參考線'];
pageItem = layer.pageItems[0].pageItems[0];
copy4_02 = copyPageItem(pageItem);
copy4_02.name = "後領線";


//myObject['隊名高度']	
app.activeDocument = doc;
//app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

mypath = getPath(selectedValues.shirtSleeve);
openDoc5 = app.open(File(mypath),DocumentColorSpace.CMYK);

layer =openDoc5.layers['縫份'];
//得到下袖片縫份
pageItem = getItemByPlusMinus(layer,false);
copy5_01 = copyPageItem(pageItem);
copy5_01.name = "左後袖";


layer =openDoc5.layers['參考線'];
//得到下袖片參考線
pageItem = getItemByPlusMinus(layer,false);

copy5_02 = copyPageItem(pageItem);
copy5_02.name = "左後袖線";

translationMatrix = moveToPoint(copy4_01,myObject['左後片點寬'],myObject['左後片點高'],copy5_01,myObject['左後袖點寬'],myObject['左後袖點高']);
copy5_01.transform(translationMatrix);
copy5_02.transform(translationMatrix);


//旋轉
list = [copy5_01,copy5_02];
//這個用法  
//rotationAngle = getAngleDegreesByPt(p1,mm(myObject['左後袖旋轉半徑']),copy4_01,copy5_01,true,false);
rotationPoint = getPoint(copy4_01,myObject['左後片點寬'],myObject['左後片點高']);

angleDegrees(rotationPoint,myObject['左後袖旋轉半徑'],copy4_01,copy5_01,rotationDirection('後片交點狀態'),rotationDirection('後袖交點狀態'),list,rotationDirection('後袖旋轉方向'));


//w = copy4_01.width - mm(myObject['左後片點寬']*2)+copy5_01.width;
w = getMirrorWidth(copy4_01,copy5_01);
mirrorByPt(copy5_01,"右後袖",w);
w = getMirrorWidth(copy4_01,copy5_02);
mirrorByPt(copy5_02,"右後袖線",w);

//movePageItem("後示意圖",300);


/*
groupList = ["姓名","後背號"];

//mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/後姓名.ai";
mypath = selectedValues.dxfLocation+"/後姓名.ai"
//mypath = getMypath("樣版後背姓名");

//樣版後背姓名
groupsCopy(doc,mypath,groupList);
//姓名高度

moveTeamName("左後袖","後片","姓名高度",groupList);

if(myObject['縮放模式'] === "比例"){
	//alert(myObject['縮放模式']);
	//debug使用
	boundaryBox = drawBoundingBoxForGroups(groupList,doc.layers[0]);
	boundaryBox.name = "姓名邊框";
	
	scaleFactor = selectedValues.ChestWidthRatio;
	var transformations = [Transformation.BOTTOM,Transformation.TOP]; // 對應的縮放中心點
	scalePageItems(scaleFactor, groupList, transformations);    
	moveTeamNameByScaleFactor("左後袖","後片","姓名高度",selectedValues.ChestHeightRatio,groupList);
}*/


left = lrmargin;
t1 = getPathItemByName("左袖").geometricBounds[1];
t2 = getPathItemByName("左後袖").geometricBounds[1];
//drawBoundaryBox("後示意圖");

//

//movePageItemLT("後示意圖",left,t1-t2);
alignObjectsToRightMargin("後示意圖",left,t1-t2);
//drawLineAtDistanceFromRight(50);

applyFillColorFromAnotherDoc(clothingTemplateDoc, "右後袖", doc, getPageItemByNameInLayer(doc, "後示意圖", "右後袖"));
applyFillColorFromAnotherDoc(clothingTemplateDoc, "左後袖", doc, getPageItemByNameInLayer(doc, "後示意圖", "左後袖"));



openDoc4.close(SaveOptions.DONOTSAVECHANGES);
openDoc5.close(SaveOptions.DONOTSAVECHANGES);





var outfitDesignLayer = doc.layers.add();
outfitDesignLayer.name = "設計層";

//mypath = "D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2/生日快樂_套版.ai";
mypath = selectFilePathText;

groupList = ["剪裁群組_底","隊名","前數字"];
groupsCopy(doc,mypath,groupList);

var tmpGroup = doc.groupItems.add();
//for (var i = 0; i < allPageItems.length; i++) {
for(var i = 0; i < groupList.length; i++){
	if(getPageItemByName(groupList[i])){
		getPageItemByName(groupList[i]).move(tmpGroup, ElementPlacement.PLACEATEND);
	}
}
//var transformations = [Transformation.TOP,Transformation.TOP]; // 對應的縮放中心點
scaleFactor = selectedValues.ChestWidthRatio;
//scalePageItems(scaleFactor, groupList, transformations);
scalePageItemByGroup(scaleFactor,tmpGroup,Transformation.TOP);
// 將 "來源層" 中的 "物件A" 移動到 "目標層"，並在 "目標層" 中排列在 "物件B" 之後
//movePageItemToLayerAfterItem("設計層", "隊名", "前示意圖", "中心線");
// 解除群組：將群組內的物件移出

while (tmpGroup.pageItems.length > 0) {
	var item = tmpGroup.pageItems[0];
	if(tmpGroup.pageItems[0].name === "剪裁群組_底"){
		item.move(doc.layers.getByName("設計層"), ElementPlacement.PLACEATEND);  // 移回設計層 
	}else{
		item.move(doc.layers.getByName("前示意圖"), ElementPlacement.PLACEATEND);  // 移回設計層 
		item.selected = false;
	}
}

// 刪除群組
tmpGroup.remove();

var doc = app.activeDocument;

myItem = getPageItemByNameInLayer(doc, "設計層", "底");
var fillColor = myItem.fillColor;
alignReplaceAndSetFill("前示意圖", "設計層", "底");




// 使用範例
// 將 "來源層" 中的 "物件A" 向下移動 50 點
//selectedValues.setVerticalGap
movePageItemVertically("前示意圖", "底", myObject['套圖垂直距離']);



releaseAndRemoveClippingMaskGroup("設計層","剪裁群組_底");
removePageItem("設計層", "底");
movePageItemToLayerAsFirst("前示意圖","底","設計層");
createClippingMaskForLayerWithName("設計層","剪裁群組_底","底");


// 將 "來源層" 中的 "物件A" 移動到 "目標層"，並在 "目標層" 中排列在 "物件B" 之後
movePageItemToLayerAfterItem("設計層", "剪裁群組_底", "前示意圖", "中心線");

//fillColor
myItem = getPageItemByNameInLayer(doc, "前示意圖", "底");
myItem.selected = true;
myItem.fillColor=fillColor;
//movePageItemByHeight("左前","中心線",0,"底");
// 將 "來源層" 中的 "物件A" 移動並對齊到 "目標層" 中的 "物件B" 的左上角

//剪裁群組_底內的底是移動位置的參考物件跟右前的移動距離,真正移動的是剪裁群組_底
translatexy = alignPageItemToTopLeft("前示意圖","底", "剪裁群組_底", "前示意圖", "右前");

getPageItemByNameInLayer(doc, "前示意圖", "隊名").translate(translatexy[0], translatexy[1]);
//設計層




var nameOrderList = [
    '鈕扣0', '鈕扣1', '鈕扣2', '鈕扣3', '鈕扣4', '鈕扣5', '鈕扣6',
    '隊名', '前數字', '右前線1', '右前線2', '右前線3',
    '左前線1', '左前線2', '左前線3', '後領遮罩', '中心線',
    '右前', '左前', '剪裁群組_底', '右袖', '左袖'
];

// 調用函數進行排序
reorderPageItemsInLayer("前示意圖", nameOrderList);

//===================================
//
//===================================
groupList = ["剪裁群組_後片","姓名","後背號"];

groupsCopy(doc,mypath,groupList);
var tmpGroup = doc.groupItems.add();

for(var i = 0; i < groupList.length; i++){
	if(getPageItemByName(groupList[i])){
		//alert(getPageItemByName(groupList[i]));
		getPageItemByName(groupList[i]).move(tmpGroup, ElementPlacement.PLACEATEND);
	}
}


scaleFactor = selectedValues.ChestWidthRatio;
scalePageItemByGroup(scaleFactor,tmpGroup,Transformation.TOP);
// 將 "來源層" 中的 "物件A" 移動到 "目標層"，並在 "目標層" 中排列在 "物件B" 之後
//movePageItemToLayerAfterItem("設計層", "隊名", "前示意圖", "中心線");
// 解除群組：將群組內的物件移出

while (tmpGroup.pageItems.length > 0) {
	var item = tmpGroup.pageItems[0];
	if(tmpGroup.pageItems[0].name === "剪裁群組_後片"){
		item.move(doc.layers.getByName("設計層"), ElementPlacement.PLACEATEND);  // 移回設計層 
	}else{
		item.move(doc.layers.getByName("後示意圖"), ElementPlacement.PLACEATEND);  // 後示意圖 
		item.selected = false;
	}
}

// 刪除群組
tmpGroup.remove();
var doc = app.activeDocument;


myItem2 = getPageItemByNameInLayer(doc, "後示意圖", "後片").duplicate();
myItem2.name = "後片2";
myItem = getPageItemByNameInLayer(doc, "設計層", "後片");
var fillColor = myItem.fillColor;
alignReplaceAndSetFill("後示意圖", "設計層", "後片");
movePageItemVertically("後示意圖", "後片", myObject['套圖垂直距離']);
releaseAndRemoveClippingMaskGroup("設計層","剪裁群組_後片");
removePageItem("設計層", "後片");
movePageItemToLayerAsFirst("後示意圖","後片","設計層");
createClippingMaskForLayerWithName("設計層","剪裁群組_後片","後片");

// 將 "來源層" 中的 "物件A" 移動到 "目標層"，並在 "目標層" 中排列在 "物件B" 之後
movePageItemToLayerAfterItem("設計層", "剪裁群組_後片", "後示意圖", "後片2");

//fillColor

myItem2.selected = true;
myItem2.fillColor=fillColor;
//movePageItemByHeight("左前","中心線",0,"底");

// 將 "來源層" 中的 "物件A" 移動並對齊到 "目標層" 中的 "物件B" 的左上角
translatexy = alignPageItemToTopLeft("後示意圖","後片", "剪裁群組_後片", "後示意圖", "後片2");
// 將 "來源層" 中的 "物件A" 移動並對齊到 "目標層" 中的 "物件B" 的左上角
//translatexy = alignPageItemToTopLeft("前示意圖","底", "剪裁群組_底", "前示意圖", "右前");


if(getPageItemByNameInLayer(doc, "後示意圖", "姓名")){
	getPageItemByNameInLayer(doc, "後示意圖", "姓名").translate(translatexy[0], translatexy[1]);
}

if(getPageItemByNameInLayer(doc, "後示意圖", "後背號")){
	getPageItemByNameInLayer(doc, "後示意圖", "後背號").translate(translatexy[0], translatexy[1]);
}
//設計層

getPageItemByNameInLayer(doc, "後示意圖", "後片").fillColor = 	myItem2.fillColor;
myItem2.remove();


var nameOrderList = [
    '後背號', '姓名', '右後袖線', '左後袖線', '後領線','剪裁群組_後片', '右後袖',
    '左後袖'
];

// 調用函數進行排序
reorderPageItemsInLayer("後示意圖", nameOrderList);




/*
var myDxfFilePath = getPath(myObject['名稱']+"_"+myObject['尺寸']+".dxf");
alert(myDxfFilePath);
saveAsDXF(myDxfFilePath);
*/
/**
 * 將當前文檔另存為 DXF 格式
 * @param {string} filePath - 另存為的文件路徑，包括文件名
 */
function saveAsDXF(filePath) {
    var doc = app.activeDocument;

    // 建立 DXF 保存選項
    var exportOptions = new ExportOptionsAutoCAD();
    exportOptions.exportFileFormat = AutoCADExportFileFormat.DXF; // 設定文件格式為 DXF
    exportOptions.unit = AutoCADUnit.Millimeters; // 設定單位，這裡以毫米為例
    exportOptions.unitScaleRatio = 1.0; // 單位比例因子
    exportOptions.colors = AutoCADColors.TrueColors; // 設定顏色選項

    // 使用設定的選項將文件另存為 DXF
    try {
        doc.exportFile(new File(filePath), ExportType.AUTOCAD, exportOptions);
        alert("文件已成功另存為 DXF 格式: " + filePath);
    } catch (e) {
        alert("另存為 DXF 時發生錯誤: " + e.toString());
    }
}



//csvfilePath = getPath("data.csv");
//"D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2/clothes.csv"

