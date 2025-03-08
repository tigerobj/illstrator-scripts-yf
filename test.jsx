#include "parallel_curve.js"; // include polyfill file
#include "base.jsx"; // include polyfill file
#include "json2.js"; // include polyfill file

function log (input) {

    if(!JSON || !JSON.stringify) return;
    var now = new Date();
    var output = JSON.stringify(input);
    $.writeln(now.toTimeString() + ": " + output);
    //D:\開發\客戶圖檔\杰優、裕豐工廠產品\ai_script_workspace\ai_example\illustrator-scripts-master2
    var filePath = "D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2";
	//alert(app.activeDocument.filePath);
    //var logFile = File(app.activeDocument.filePath + "/log.txt");
    var logFile = File(filePath + "/log.txt");
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    
    
    logFile.close();
}

var mytest = (
		function init() {	
			function execute(p){
				var s = activeDocument.selection[0];
				
				//log(objectToString(s.selectedPathPoints));
				var ps = s.selectedPathPoints;
				
				log(["anchor =",ps[0].anchor,"leftDirection=",ps[0].leftDirection,"rightDirection=",ps[0].rightDirection]);
				//ai pathPoints to bezier curves points array [p0,p1,p2,p3]
				var ops = []; 
				
				for(var i =0;i<ps.length-1;i++){
					//bps.push(new Array(ps[i].anchor, ps[i].rightDirection, ps[i+1].leftDirection,ps[i+1].anchor));
					ops.push(parallel_curve.execute(new Array(ps[i].anchor, ps[i].rightDirection, ps[i+1].leftDirection,ps[i+1].anchor),3));
									
				}
				activeDocument.selection = null;
				
				//log(["ops",ops]);
				
				
				var newPath = activeDocument.pathItems.add();
				
				var newPoint;
				
				for(var i=0;i<ops.length;i++){
					newPoint = newPath.pathPoints.add();
					newPoint.anchor = ops[i][0];
					if(i == 0){
						newPoint.leftDirection = ops[i][0];
					}else{
						newPoint.leftDirection = ops[i-1][2];
					}					
					newPoint.rightDirection = ops[i][1];
					
					if(i == ops.length-1){
						newPoint = newPath.pathPoints.add();
						newPoint.anchor = ops[i][3];
						newPoint.leftDirection = ops[i][2];
						newPoint.rightDirection = ops[i][3];
					}
					
				}
				//log(["newPath.pathPoints",objectToString(newPath.pathPoints)]);
				
				
				//log(objectToString(s.layer));
				//log(s.closed);
				
				return "return";
			}
			
			return {execute : execute};
		}
)();




mytest.execute("xx");