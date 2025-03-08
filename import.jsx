#include "base.jsx";
#include "json2.js";
#include "Intersections.jsx";



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
    var logFile = File(filePath + "/log_import.txt");
    logFile.encoding = "big5";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close();
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
function findPathPointByPosition(targetLeft, targetTop) {
    // 定义找到的锚点变量
    var foundPoint = null;

    // 遍历所有路径项
    for (var i = 0; i < doc.pathItems.length; i++) {
        var pathItem = doc.pathItems[i];
        
        // 遍历路径项中的所有锚点
        for (var j = 0; j < pathItem.pathPoints.length; j++) {
            var pathPoint = pathItem.pathPoints[j];
            
            // 检查锚点位置是否匹配目标位置
            if (Math.abs(pathPoint.anchor[0] - targetLeft) < 0.01 && Math.abs(pathPoint.anchor[1] - targetTop) < 0.01) {
                foundPoint = pathPoint;
                break;
            }
        }
        
        if (foundPoint !== null) {
            break;
        }
    }

    return foundPoint;
}

function findPoint(value){
	pt = value.split(",");
	return findPathPointByPosition(parseFloat(pt[0]),parseFloat(pt[1]));
}


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

var mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-前X2.dxf";
var openDoc = app.open(File(mypath),DocumentColorSpace.CMYK);


var width_artwork = 210;
var height_artwork = 297;
var aiDocPreset = new DocumentPreset();
    aiDocPreset.units = RulerUnits.Millimeters;
    aiDocPreset.width = mm(width_artwork);
    aiDocPreset.height = mm(height_artwork);
    aiDocPreset.rasterResolution = DocumentRasterResolution.HighResolution;
    aiDocPreset.title = "Simple Document";
    aiDocPreset.colorMode = DocumentColorSpace.CMYK;

var doc = app.documents.addDocument("Simple Document Preset", aiDocPreset);


var strokeColor = new RGBColor();
strokeColor.red = 0;
strokeColor.green = 0;
strokeColor.blue = 0;  // 黑色


var layer =openDoc.layers['縫份'];
var pageItem = layer.pageItems[0].pageItems[0];

a = pageItem.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
a.name = "左前";
a.strokeColor = strokeColor;

//log(["a",objectToString(a)]);

//參考線
layer =openDoc.layers['參考線'];
pageItem = layer.pageItems[0].pageItems[0];
c=pageItem.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
c.name = '中心線';
c.strokeColor = strokeColor;


//粘扣
layer =openDoc.layers['粘扣'];
pageItem = layer.pageItems[0].pageItems[0];
p1 = pageItem.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
p1.name = "左前線1";
p1.strokeWidth = 10;  // 笔画宽度为 10 点
//p1.strokeDashOffset = -10;  // 虚线起始偏移量
p1.strokeColor = strokeColor;
pageItem = layer.pageItems[1].pageItems[0];
p2 = pageItem.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
p2.name = "左前線2";
p2.strokeColor = strokeColor;
p2.strokeWidth = 10;  // 笔画宽度为 10 点
p2.strokeDashOffset = -30;  // 虚线起始偏移量

app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-袖X2.dxf";
openDoc2 = app.open(File(mypath),DocumentColorSpace.CMYK);


//geometricBounds
//Plus true ,Minus false
//指定位置,取得上下二個物件的其中之一的物件,true取得上物件
function getItemByPlusMinus(layer,isPlus){
	items = layer.pageItems;
	//for (var i = 0; i < list.length; i++) {
	pageItemA = layer.pageItems[0].pageItems[0];
	pageItemB = layer.pageItems[1].pageItems[0];
	if(pageItemA.geometricBounds[1] > pageItemB.geometricBounds[1]){
		return pageItemA;
	}else{
		return pageItemB;
	}
	
}

layer =openDoc2.layers['縫份'];
//pageItem = layer.pageItems[1].pageItems[0];
pageItem = getItemByPlusMinus(layer,true);
e = pageItem.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
e.name = "左袖";
e.strokeColor = strokeColor;

layer =openDoc2.layers['參考線'];
pageItem = layer.pageItems[0].pageItems[0];
f = pageItem.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
f.name = "左前線3"
f.strokeColor = strokeColor;
f.strokeWidth = 10;  // 笔画宽度为 10 点
//f.strokeDashOffset = -10;  // 虚线起始偏移量

app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-後內貼1襯1.dxf";
openDoc3 = app.open(File(mypath),DocumentColorSpace.CMYK);

layer =openDoc3.layers['縫份'];
pageItem = layer.pageItems[0].pageItems[0];
g = pageItem.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
g.name = "後內貼";
g.strokeColor = strokeColor;

layer =openDoc3.layers['尺寸線'];
pageItem = layer.pageItems[0].pageItems[0];
g2 = pageItem.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
g.name = "後內遮罩";
g.strokeColor = strokeColor;

app.activeDocument = doc;

//"PathPoint x:",524.663313945024,"pt, y:",484.430811600811,"pt ,x:",185.089557928778,"mm ,y:",170.896425160895,"mm"
a1 = [147.057937907903,1600.64727766548];
b1=[524.637879272062,725.476236905224];
b2=[524.348825785992,339.997416912109];

translationMatrix = app.getTranslationMatrix(a1[0]-b1[0], a1[1]-b1[1]);
g.transform(translationMatrix);
translationMatrix = app.getTranslationMatrix(a1[0]-b2[0], a1[1]-b2[1]);
g2.transform(translationMatrix);





//pageItem.selected = true;

//L 前 [ '140.707992553711','1508.08972167969']

//findPoint
//L 袖 ['208.459999977365', '1845.55547165138']
la = [ 140.707992553711,1508.08972167969];
lb = [208.459999977365, 1845.55547165138];

translationMatrix = app.getTranslationMatrix(la[0]-lb[0], la[1]-lb[1]);
e.transform(translationMatrix);
f.transform(translationMatrix);

//log(["a.closed",a.closed]);

//log(["testIntersectionsA",testIntersections(la,mm(233.393484),a)]);


//tsA  = testIntersections(la,mm(233.393484),a);
//log(["testIntersectionsB",testIntersections(la,mm(233.393484),e)]);

//doc.pathItems.add().setEntirePath([[tsA[0][0],tsA[0][1]],[tsA[0][0],tsA[0][1]+150]]);
//doc.pathItems.add().setEntirePath([[tsA[1][0],tsA[1][1]],[tsA[1][0],tsA[1][1]+150]]);

e.selected = true;
//alert("aaa");
var rotationAngle = getAngleDegrees(la,mm(233.393484),a,e);


//log(["getAngleDegrees",rotationAngle]);



// 生成旋转矩阵
var rotationMatrix = app.getRotationMatrix(rotationAngle);

// 生成平移矩阵，将路径移动到原点
var translateToOrigin = app.getTranslationMatrix(-la[0], -la[1]);

// 生成平移矩阵，将路径移动回原位置
var translateBack = app.getTranslationMatrix(la[0], la[1]);


//
// 应用平移到原点矩阵
e.transform(translateToOrigin, true, true, true, true, 1, Transformation.DOCUMENTORIGIN);
f.transform(translateToOrigin, true, true, true, true, 1, Transformation.DOCUMENTORIGIN);
// 应用旋转矩阵
e.transform(rotationMatrix, true, true, true, true, 1, Transformation.DOCUMENTORIGIN);
f.transform(rotationMatrix, true, true, true, true, 1, Transformation.DOCUMENTORIGIN);
// 应用平移回原位置矩阵
e.transform(translateBack, true, true, true, true, 1, Transformation.DOCUMENTORIGIN);
f.transform(translateBack, true, true, true, true, 1, Transformation.DOCUMENTORIGIN);


app.activeDocument = doc;


totalMatrix = app.getScaleMatrix(-100, 100);

mirror(c,a,"右前");
mirror(c,e,"右袖");
mirror(c,f,"右前線3");
mirror(c,p1,"右前線1");
mirror(c,p2,"右前線2");

function mirror(c,o,name){
	totalMatrix = app.getScaleMatrix(-100, 100);
	moveVar =  c.geometricBounds[0]-o.geometricBounds[0];
	myWidth = moveVar*2-o.width;
	translationMatrix = app.getTranslationMatrix(myWidth , 0);
	tmp = o.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
	tmp.name = name;
	tmp.strokeColor = strokeColor;
	tmp.transform(translationMatrix);
	tmp.transform(totalMatrix);
	
}


// 创建一个新图层
var maskLayer = doc.layers.add();
maskLayer.name = "MaskLayer";

// 将 pathItem 移动到新图层中
g.move(maskLayer, ElementPlacement.PLACEATBEGINNING);
g2.move(maskLayer, ElementPlacement.PLACEATBEGINNING);

// 创建剪切遮罩
var groupItem = maskLayer.groupItems.add();
g2.move(groupItem, ElementPlacement.PLACEATEND);
g.move(groupItem, ElementPlacement.PLACEATEND);
groupItem.clipped = true;


openDoc.close(SaveOptions.DONOTSAVECHANGES);
openDoc2.close(SaveOptions.DONOTSAVECHANGES);
openDoc3.close(SaveOptions.DONOTSAVECHANGES);







var buttonsList = [20,40,98,98,98,98,98];
drawCircle("中心線",5,buttonsList);
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
				continue;
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
		}

		
	}
	

	
mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/前隊名.ai";
sourceDoc = app.open(File(mypath));	

teamName = getGroupItemByNameForDoc(sourceDoc,"隊名");
teamNum = getGroupItemByNameForDoc(sourceDoc,"前數字");

teamName.selected = true;
teamNum.selected = true;
app.copy();	
app.activeDocument = doc;	
app.paste();
sourceDoc.close(SaveOptions.DONOTSAVECHANGES);
var pastedGroup = getGroupItemByName("隊名");	
pastedGroup.selected = false;
//alert(pastedGroup.name);

item = getPathItemByName("左袖");

var pasteY = item.geometricBounds[1]-mm(230);

item = getPathItemByName("中心線");
var pasteX = item.geometricBounds[0];

var groupBounds = pastedGroup.visibleBounds;
var groupWidth = groupBounds[2] - groupBounds[0];
var groupHeight = groupBounds[1] - groupBounds[3];
var currentX = groupBounds[0] + (groupWidth / 2);
var currentY = groupBounds[1] ;

// 计算偏移量
var offsetX = pasteX - currentX;
var offsetY = pasteY - currentY;

// 设置新的位置
pastedGroup.translate(offsetX, offsetY);
pastedGroup2 = getGroupItemByName("前數字");	
pastedGroup2.selected = false;
pastedGroup2.translate(offsetX, offsetY);



	
}







