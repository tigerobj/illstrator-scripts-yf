

function testIntersections(la,radius,closedPathItem){
	// 中心点
	var centerX = la[0];
	var centerY = la[1];
	
	// 创建一个圆形路径对象
	var circle = doc.pathItems.ellipse(centerY + radius, centerX - radius, radius * 2, radius * 2, false, true);
	
	result = getCirclePathIntersections(la,radius,circle,closedPathItem);
	circle.remove();
	return result;
}


//la = [ 140.707992553711,1508.08972167969];
//var radius = (233.393484)* 2.83464567;
function getAngleDegrees(la,radius,closedPathItemA,closedPathItemB){
		
	// 中心点
	var centerX = la[0];
	var centerY = la[1];
	
	
	// 创建一个圆形路径对象
	var circle = doc.pathItems.ellipse(centerY + radius, centerX - radius, radius * 2, radius * 2, false, true);
	
	var intersectionsA = getCirclePathIntersections(la,radius,circle,closedPathItemA);
	
	var intersectionsB = getCirclePathIntersections(la,radius,circle,closedPathItemB);
	circle.remove();
	
	// 点 A 坐标
	if(intersectionsA[1][0]>intersectionsA[0][0]){
		ax = intersectionsA[1][0];
		ay = intersectionsA[1][1];
	}else{
		ax = intersectionsA[0][0];
		ay = intersectionsA[0][1];		
	} 
	
	// 点 B 坐标
	var bx = intersectionsB[1][0];
	var by = intersectionsB[1][1];
	
	/*
	doc = app.activeDocument;
	doc.pathItems.add().setEntirePath([[centerX,centerY],[ax,ay]]);
	doc.pathItems.add().setEntirePath([[centerX,centerY],[bx,by]]);
	*/
	
	// 计算从中心点到 A 点的向量
	var vectorA = {
	    x: ax - centerX,
	    y: ay - centerY
	};
	
	// 计算从中心点到 B 点的向量
	var vectorB = {
	    x: bx - centerX,
	    y: by - centerY
	};
	
	// 计算向量的点积
	var dotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
	
	// 计算向量的长度（模）
	var lengthA = Math.sqrt(vectorA.x * vectorA.x + vectorA.y * vectorA.y);
	var lengthB = Math.sqrt(vectorB.x * vectorB.x + vectorB.y * vectorB.y);
	
	// 计算向量之间的夹角（弧度）
	var angleRadians = Math.acos(dotProduct / (lengthA * lengthB));
	
	// 将弧度转换为角度
	var angleDegrees = angleRadians * (180 / Math.PI);
	
	return angleDegrees;
}


//la = [ 140.707992553711,1508.08972167969];
//var radius = (233.393484)* 2.83464567;
function getAngleDegreesByPt(la,radius,closedPathItemA,closedPathItemB,b,b2){
		
	// 中心点
	var centerX = la[0];
	var centerY = la[1];
	
	
	// 创建一个圆形路径对象
	var circle = doc.pathItems.ellipse(centerY + radius, centerX - radius, radius * 2, radius * 2, false, true);
	
	var intersectionsA = getCirclePathIntersections(la,radius,circle,closedPathItemA);
	
	var intersectionsB = getCirclePathIntersections(la,radius,circle,closedPathItemB);
	circle.remove();
	
	// 点 A 坐标
	if(b){
		ax = intersectionsA[1][0];
		ay = intersectionsA[1][1];
	}else{
		ax = intersectionsA[0][0];
		ay = intersectionsA[0][1];		
	} 
	
	// 点 B 坐标
	if(b2){
		bx = intersectionsB[1][0];
		by = intersectionsB[1][1];
	}else{
		bx = intersectionsB[0][0];
		by = intersectionsB[0][1];
	}
	
	
	//doc = app.activeDocument;
	//doc.pathItems.add().setEntirePath([[centerX,centerY],[ax,ay]]);
	//doc.pathItems.add().setEntirePath([[centerX,centerY],[bx,by]]);
	
	
	// 计算从中心点到 A 点的向量
	var vectorA = {
	    x: ax - centerX,
	    y: ay - centerY
	};
	
	// 计算从中心点到 B 点的向量
	var vectorB = {
	    x: bx - centerX,
	    y: by - centerY
	};
	
	// 计算向量的点积
	var dotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
	
	// 计算向量的长度（模）
	var lengthA = Math.sqrt(vectorA.x * vectorA.x + vectorA.y * vectorA.y);
	var lengthB = Math.sqrt(vectorB.x * vectorB.x + vectorB.y * vectorB.y);
	
	// 计算向量之间的夹角（弧度）
	var angleRadians = Math.acos(dotProduct / (lengthA * lengthB));
	
	// 将弧度转换为角度
	var angleDegrees = angleRadians * (180 / Math.PI);
	
	return angleDegrees;
}

// 函数：计算圆和路径的交点
function getCirclePathIntersections(la, radius,circle, path) {
    var intersections = [];
    var pathPoints = path.pathPoints;
    var circleCenter = [la[0], la[1]];
    
    for (var i = 0; i < pathPoints.length; i++) {
        var start = pathPoints[i];
        var end = pathPoints[(i + 1) % pathPoints.length];
        
        var startPt = [start.anchor[0], start.anchor[1]];
        var endPt = [end.anchor[0], end.anchor[1]];
        
        var interPoints = findCircleLineIntersections(circleCenter, radius, startPt, endPt);
        
        for (var j = 0; j < interPoints.length; j++) {
            intersections.push(interPoints[j]);
        }
    }
    return intersections;
}

// 函数：找到两条线段的交点
function findIntersection(p1, p2, p3, p4) {
    var x1 = p1.anchor[0], y1 = p1.anchor[1];
    var x2 = p2.anchor[0], y2 = p2.anchor[1];
    var x3 = p3.anchor[0], y3 = p3.anchor[1];
    var x4 = p4.anchor[0], y4 = p4.anchor[1];
    
    var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) {
        return null; // 平行线
    }
    
    var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        var x = x1 + ua * (x2 - x1);
        var y = y1 + ua * (y2 - y1);
        return [x, y];
    }
    return null;
}

// 函数：找到圆和线段的交点
function findCircleLineIntersections(circleCenter, radius, point1, point2) {
    var cx = circleCenter[0], cy = circleCenter[1];
    var x1 = point1[0], y1 = point1[1];
    var x2 = point2[0], y2 = point2[1];
    
    var dx = x2 - x1;
    var dy = y2 - y1;
    
    var A = dx * dx + dy * dy;
    var B = 2 * (dx * (x1 - cx) + dy * (y1 - cy));
    var C = (x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy) - radius * radius;
    
    var det = B * B - 4 * A * C;
    var t;
    
    var intersections = [];
    
    if (A <= 1e-7 || det < 0) {
        return intersections;
    } else if (det === 0) {
        t = -B / (2 * A);
        if (t >= 0 && t <= 1) {
            intersections.push([x1 + t * dx, y1 + t * dy]);
        }
    } else {
        t = (-B + Math.sqrt(det)) / (2 * A);
        if (t >= 0 && t <= 1) {
            intersections.push([x1 + t * dx, y1 + t * dy]);
        }
        t = (-B - Math.sqrt(det)) / (2 * A);
        if (t >= 0 && t <= 1) {
            intersections.push([x1 + t * dx, y1 + t * dy]);
        }
    }
    
    return intersections;
}


