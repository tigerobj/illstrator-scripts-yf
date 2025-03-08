#include "base.jsx";
#include "json2.js";



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
    var logFile = File(filePath + "/log_position.txt");
    logFile.encoding = "big5";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close();
}

// 获取当前文档
var doc = app.activeDocument;
var selectedItems = doc.selection;

if (selectedItems.length > 0) {
    var selectedItem = selectedItems[0];
    
    // 确保选中的项目是路径项目
    if (selectedItem.typename === "PathItem") {
        var pathPoints = selectedItem.selectedPathPoints;
        
        // 遍历所有路径点并打印其坐标
        for (var i = 0; i < pathPoints.length; i++) {
            var point = pathPoints[i].anchor;
            var x = point[0];
            var y = point[1];
            log(["PathPoint x:" ,  x , "pt, y:" , y , "pt ,x:" ,p2mm(x),"mm ,y:" ,p2mm(y),"mm"]);
            //log(["pathPoints[",i,"]" ,  objectToString(pathPoints[i]),"pathPoint.selected ",pathPoints[i].selected,"PathPointSelection.ANCHORPOINT",PathPointSelection.ANCHORPOINT]);
        }
    } else {
        log(["选中的项目不是路径项目。"]);
    }
} else {
    log(["没有选中的项目。"]);
}
