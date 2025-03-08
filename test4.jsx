#include "base.jsx";
#include "json2.js";
#include "bezier.js";
#include "parallel_curve.js";

/*
pt -> pathPoint
pCurve ->parallel curve -> P0,P1,P2,P3
isFirst -> pathItem pathPoints value ture first , flase last
*/
var JoinPair = function(pt,pCurve){
    this.pt = pt;
    this.pCurve = pCurve;
}

JoinPair.prototype = {
    set : function(pt,pCurve){
	    this.pt = pt;
	    this.pCurve = pCurve;
        return this;
    }
}


function pair(list,v){
	var newPairs = [];
	for(var i = 0 ;i<list.length;i++){
		for(var j = i+1,a1,a2;j<list.length;j++){
			a1 = l
			+ist[i].pt.anchor;
			a2 = list[j].pt.anchor;
			if(abs(a1[0]- a2[0]) <v &&　abs(a1[1]- a2[1]) <v){
				newPairs.push([list[i],list[j]]);
				break;
			}
		}	
	}
	return newPairs;
}



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
			function execute(t){
				var s = activeDocument.selection[0];
				log(["s",objectToString(s)]);
				pts = s.pathPoints;
				
				for(var i=0 ;i<pts.length;i++){
					log(["pathPoints[i]",i,objectToString(pts[i])]);
				}
				x1 = pts[0].anchor[0];
				y1 = pts[0].anchor[1];
				x2 = pts[1].anchor[0];
				y2 = pts[1].anchor[1];
				k = (y2-y1)/(x2-x1);
				m = -1/k;
				f = 60;
				
				dir = ["x", "y"];
				
				dir.x  = pts[1].anchor[0] - pts[0].anchor[0];
				dir.y  = pts[1].anchor[1] - pts[0].anchor[1];
				
				dir.x  = x2 - x1;
				dir.y  = y2 - y1;
				
				t = 1;
				x = x1 + t * dir.x;
				y = y1 + t * dir.y;
				
				log(["x",x,"y",y]);
				
				r_sq = f*f / (1+m*m);
				r = sqrt(r_sq);
				p2 = [x1+r,y1+ m*r];
				
				p3 = [x+r,y+ m*r];
				
				log(["p2",p2]);
				app.activeDocument.pathItems.add().setEntirePath( [pts[0].anchor,p2]);
				app.activeDocument.pathItems.add().setEntirePath( [[x,y],p3]);
				app.activeDocument.pathItems.add().setEntirePath( [p2,p3]);						
			}	
			return {execute : execute};
		}
)();

mytest.execute(0.5);


function pointEqual(anchor ,a){
	vx = anchor[0] - a.x;
	vy = anchor[1] - a.y;
	if(vx < 0.00001 && vy < 0.00001){
		return true;
	}else{
		return false;
	}	
}


function lineJoin(pair,c1,c2){
	//points
	//utils
	//lli4: function (p1, p2, p3, p4)
	points = [];
	drawPt = [];
	if(isRight(pair[0].pt)){
		points.push(pair[0].pCurve[2]);
		points.push(pair[0].pCurve[3]);
		drawPt.push([pair[0].pCurve[3],1]);
	}
	if(isLeft(pair[0].pt)){
		points.push(pair[0].pCurve[0]);
		points.push(pair[0].pCurve[1]);	
		drawPt.push([pair[0].pCurve[0],0]);	
	}
	if(isRight(pair[1].pt)){
		points.push(pair[1].pCurve[2]);
		points.push(pair[1].pCurve[3]);
		drawPt.push([pair[1].pCurve[3],1]);	
	}
	if(isLeft(pair[1].pt)){
		points.push(pair[1].pCurve[0]);
		points.push(pair[1].pCurve[1]);
		drawPt.push([pair[1].pCurve[0],0]);		
	}
	//log(["points[0]",points[0],"points[1]",points[1],"points[2]",points[2],"points[3]",points[3]]);
	p = utils.lli8(points[0][0],points[0][1],points[1][0],points[1][1],points[2][0],points[2][1],points[3][0],points[3][1]);
	
	for(var i = 0,pc,b;i<drawPt.length;i++){
		pc = drawPt[i][0];
		//log(["pc",pc]);
		b = drawPt[i][1];
		if(b === 1){
			app.activeDocument.pathItems.add().setEntirePath([[pc[0],pc[1]],[p.x,p.y]]);
		}else{
			app.activeDocument.pathItems.add().setEntirePath([[p.x,p.y],[pc[0],pc[1]]]);
		}
	}
	
	
	
}

function reDrawCurve(pathItems,pt,q){
	//pt.anchor = [q[0].x,q[0].y];
	//last -last
	P0_P = q[0];
	V1_P = q[4];
	V2_P = q[6];
	E1_P = q[7];
	E2_P = q[8];
	B_P =  q[9];
	P3_P = q[3];	
	
	//曲線去尾
	if(isRight(pt)){
		
		for(var i=0;i<pathItems.length;i++){
			opts = pathItems[i].pathPoints;
			opt = opts[opts.length-1];
			optb = opts[opts.length-2];
			
			//log([i,"q[3].x",q[3].x,"q[3].y",q[3].y]);
			//log([i,"anchor[0]",opt.anchor[0],"anchor[1]",opt.anchor[1]]);
		    
		    xv= opt.anchor[0] - q[3].x;
			if(pointEqual(opt.anchor,q[3])){
			//if((opt.anchor[0] === q[3].x) && (opt.anchor[1] === q[3].y)){
				//P0_P V1_P E1_P B_P

				//畫垂左邊結構
				//app.activeDocument.pathItems.add().setEntirePath([[P0_P.x,P0_P.y],[V1_P.x,V1_P.y]]);
				//app.activeDocument.pathItems.add().setEntirePath([[V1_P.x,V1_P.y],[E1_P.x,E1_P.y]]);
				//app.activeDocument.pathItems.add().setEntirePath([[E1_P.x,E1_P.y],[B_P.x,B_P.y]]);

				opt.anchor = opt.rightDirection = [B_P.x,B_P.y];
				opt.leftDirection = [E1_P.x,E1_P.y];
				optb.rightDirection = [V1_P.x,V1_P.y];
				//log(["i",i,"opt new",opt]);
			}
		}
		
	}
	//曲線切頭
	if(isLeft(pt)){
		for(var i=0;i<pathItems.length;i++){
			opts = pathItems[i].pathPoints;
			opt = opts[0];
			optf = opts[1];
			if(pointEqual(opt.anchor,q[0])){
			//if((opt.anchor[0] === q[0].x) && (opt.anchor[1] === q[0].y)){
				//
				//B_P E2_P V2_P P3_P
				
				//畫垂右邊結構
				//app.activeDocument.pathItems.add().setEntirePath([[B_P.x,B_P.y],[E2_P.x,E2_P.y]]);
				//app.activeDocument.pathItems.add().setEntirePath([[E2_P.x,E2_P.y],[V2_P.x,V2_P.y]]);
				//app.activeDocument.pathItems.add().setEntirePath([[V2_P.x,V2_P.y],[P3_P.x,P3_P.y]]);				

				opt.anchor = opt.leftDirection = [B_P.x,B_P.y];
				opt.rightDirection = [E2_P.x,E2_P.y];
				optf.leftDirection = [V2_P.x,V2_P.y];		
			}
		}		
	}
	return pt;
}


function ptToCoords(pts,idx1,idx2){

	p0 = pts[idx1].anchor;
	p1 = pts[idx1].rightDirection;
	p2 = pts[idx2].leftDirection;
	p3 = pts[idx2].anchor;

	return [p0[0],p0[1],p1[0],p1[1],p2[0],p2[1],p3[0],p3[1]];
	
}

function p4ToCoords(p4){
	p0 = p4[0];
	p1 = p4[1];
	p2 = p4[2];
	p3 = p4[3];
	return [p0[0],p0[1],p1[0],p1[1],p2[0],p2[1],p3[0],p3[1]];
}

function isLeft(pt){
	anchor = pt.anchor;
	leftDirection = pt.leftDirection;
	rightDirection = pt.rightDirection;
	if((anchor[0] === leftDirection[0]) && (anchor[1] === leftDirection[1])){
		return true;
	}	
}

function isRight(pt){
	anchor = pt.anchor;
	leftDirection = pt.leftDirection;
	rightDirection = pt.rightDirection;
	if((anchor[0] === rightDirection[0]) && (anchor[1] === rightDirection[1])){
		return true;
	}	
}

//not begin join pair
function directionality(pt){
	anchor = pt.anchor;
	leftDirection = pt.leftDirection;
	rightDirection = pt.rightDirection;
	if((anchor[0] === leftDirection[0]) && (anchor[1] === leftDirection[1])){
		if((anchor[0] - rightDirection[0]) < 0){
			return 1;
		}else{
			return -1;
		}
	}else{
		return 0;
	}	
}

function drawCurve(ops){
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
	//newPath.selected = true;
	return newPath;
}