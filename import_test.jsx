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

layer =openDoc2.layers['縫份'];
pageItem = layer.pageItems[1].pageItems[0];
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