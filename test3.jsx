#include "base.jsx";
#include "json2.js";
#include "bezier.js";
#include "parallel_curve.js";


var Point = function(x,y){
	this.x = x;
	this.y = y;
}

Point.prototype = {
	set : function(anchor){
		this.x = anchor[0];
		this.y = anchor[1];
		return this;
    }
}

ParallelObj = function(opts){
	this.opts = opts; //平行線points
	this.originalNum = opts.length; //原來數量
	this.rHeadNum = 0;  //去頭數量
	this.rTailNum = 0;  //去尾數量
	this.isRHead = false; //是否去頭
	this.isRTail = false; //是否去尾

}

ParallelObj.prototype = {
	setRHeadNum : function(num){
		this.rHeadNum = num;
	},
	setRTailNum : function(num){
		this.rTailNum = num;
	},
	setIsRHead : function(b){
		this.isRHead = b;
	},
	setIsRTail : function(b){
		this.isRTail = b;
	}
}

var CenterBounds = function (geometricBounds){
	x1 = geometricBounds[0];
	y1 = geometricBounds[1];
	x2 = geometricBounds[2];
	y2 = geometricBounds[3];
	h = this.horizontal = {x1:x1,y1:y1-(y1-y2)/2,x2:x2,y2:y1-(y1-y2)/2}; //水平
	v = this.vertical = {x1:x1+(x2-x1)/2,y1:y1,x2:x1+(x2-x1)/2,y2:y2}; //垂直
	
}


CenterBounds.prototype = {
	directionality : function(p1,p2){
		x1 = p1[0];
		y1 = p1[1];
		x2 = p2[0];
		y2 = p2[1];
		if(y1 === y2){
			//log("horizontal");
			if(y1>this.horizontal.y1){
				return 1;  //top
			}else{
				return -1; //bottom
			}
		}
		if((x1+(x2-x1)/2) < this.vertical.x1){
			//log("vertical");
			return -1; //left
		}else{
			return 1;  //right
		}
	}
}



/*
pt -> pathPoint ->anchor , leftDirection ,rightDirection
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
    }, 
    setlinear : function(value){
		this.line = value;
	}
    
}


//二條線的配對
//dir為線的配對方向,true為線的起頭,false為線的結尾
var JoinPathItme = function(pathItme1,pathItem2){
	this.pi1 = pathItme1;
	this.pi2 = pathItem2;
	//this.dir1 = true;  //true start ,false end
	//this.dir2 = true;  //true start ,false end
	//this.isIntersections = true; //是否有交點
	//this.f1 = 1;
	//this.f2 = 1;
	//this.coords1 = [];
	//this.coords2 = [];
	//this.intersections = false;
	//this.linear1 = true;
	//this.linear2 = true;
}



JoinPathItme.prototype = {
	isLeft : function(opi){
		pts = opi.pathPoints;
		anchor = pts[0].anchor;
		leftDirection = pts[0].leftDirection;
		rightDirection = pts[0].rightDirection;
		if((anchor[0] === leftDirection[0]) && (anchor[1] === leftDirection[1])){
			return true;
		}else{
			return false;
		}
	},
	setLinear : function(isFirst,value){  //isFirst,value
		if(isFirst){
			this.linear1 = value;
		}else{
			this.linear2 = value;
		}
	},
	isCurve : function(){  //isFirst,value
		return !this.linear1 && !this.linear2;
	},
	isCurveLinear : function(){  //isFirst,value
		this.itmePtsToCurvePt();
		return this.linear1 != this.linear2;
	},
	isLinear : function(){  //isFirst,value
		return this.linear1 && this.linear2;
	},
	setPathItme : function(pathItme,isFirst,isStart){
		if(isFirst){
			this.pi1 = pathItme;
			this.dir1 = isStart;
		}else{
			this.pi2 = pathItme;
			this.dir2 = isStart;
		}
	},	
	setDir : function(isStart1,isStart2){  //設定配對線是頭或尾
		this.dir1 = isStart1;  //true start ,false end
		this.dir2 = isStart2;  //true start ,false end		
	},
	getPts1 : function(){
		return this.pi1.pathPoints;
	},
	getPts2 : function(){
		return this.pi2.pathPoints;
	},
	itmePtsToCurvePt : function(){	
		pts1 = this.pi1.pathPoints;
		pts2 = this.pi2.pathPoints;
		if(this.dir1){
			idx1 = 0;
			idx2 = 1;		
		}else{
			idx1 = pts1.length-2;
			idx2 = pts1.length-1;
		}
		this.coords1 = this.ptsToParallelCoords(pts1,idx1,idx2);
		
		if(this.dir2){
			idx1 = 0;
			idx2 = 1;
		}else{
			idx1 = pts2.length-2;
			idx2 = pts2.length-1;
		}
		this.coords2 = this.ptsToParallelCoords(pts2,idx1,idx2);
	},
	
	ptsToParallelCoords : function(pts,index1,index2){
		p0 = pts[idx1].anchor;
		p1 = pts[idx1].rightDirection;
		p2 = pts[idx2].leftDirection;
		p3 = pts[idx2].anchor;
		return p4TolineCoords([p0,p1,p2,p3]);
	},
	setIntersectionsValue : function(b){
		this.intersections = b;
	},
	
	setIntersections : function(f){   //是否有交接
		//交點是線的頭或尾
		//頭為0,尾為1
		op = f;
		this.itmePtsToCurvePt();
		//log(["op",op,"f1",this.f1,"f2",this.f2,"coords1",this.coords1,"coords2",this.coords2]);
		pc1 = parallel_curve.execute(this.coords1,this.f1*op);
		pc2 = parallel_curve.execute(this.coords2,this.f2*op);
		//log(["pc1 "+pc1]);
		//log(["pc2 "+pc2]);
		//drawCurve([pc1]);
		//drawCurve([pc2]);
		
		c1 = new Bezier().constructor(p4ToCoords(pc1));
		c2 = new Bezier().constructor(p4ToCoords(pc2));
		
		v = c1.intersects(c2,0.0001);
		//log(["setIntersections "+v]);
		if(v.length > 0){
			this.intersections = true;
		}
	},
	getPairCurves : function(){
		list1 = pathItemToCurve(this.pi1);
		list2 = pathItemToCurve(this.pi2);
		this.pairCurves = {cvs1 : list1,cvs2 : list2}
		return this.pairCurves;

	},
	pathItemToCurve : function(opi){
		pts = opi.pathPoints;
		list = new Array();
		for(var i=0,cv,pt;i<pts.length-1;i++){
			pt = pts[i];
			pt1 = pts[i+1];
			cv = new Array();
			cv[0] = pt.anchor;
			cv[1] = pt.rightDirection;
			cv[2] =  pt1.leftDirection;
			cv[3] =  pt1.anchor;
			list.push(cv);
		}
		return list;
	} 
}

//平行線的距離是往外或往內
function getF(apts){
	if(islinear(apts)){			
		var cBounds = new CenterBounds(activeDocument.geometricBounds);
		if(apts[0].anchor[0]<apts[1].anchor[0]){
			return  cBounds.directionality(apts[0].anchor,apts[1].anchor);
		}else{
			return cBounds.directionality(apts[1].anchor,apts[0].anchor);
		}
	}else{
		if((apts[0].anchor[0] - apts[0].rightDirection[0]) < 0){
			return 1;
		}else{
			return -1;
		}
	}
	
}

/**
 * 排序所有的pathItem交接並且記錄是否配對物件(JoinPathItme)及相關屬性例如是否有交接等
 * 排序pathItems,
 * list pathItems
 * newList 排序過新的
 * index true,false ; true->start , false->end
 */
function sortItem(list,newList,b,ff){
	if(list.length>0){
		p1 = list[0];
		pairPathItem = new JoinPathItme();
		apts = p1.pathPoints;
		var isName = p1.name.indexOf("JU");
		if(isName === -1){
			n = newList.length+1;
			if(islinear(apts)){
				//setLinear(isFirst,value)			
				p1.name = "JU"+n.toString().padStart(3,'0')+"_line";			
			}else{
				p1.name = "JU"+n.toString().padStart(3,'0')+"_curve";
			}				
		}
		pairPathItem.setLinear(true,islinear(apts));  //第一條是否為線
		pairPathItem.f1 = getF(apts);  //平行線外擴或內縮
		pairPathItem.setPathItme(p1,true,b); //設定第一個pathItm this.pi1 ,b為方向 this.dir1 true為頭 false為尾 
		if(b){
			a = apts[0].anchor;
			c = apts[apts.length-1].anchor;
		}else{
			a = apts[apts.length-1].anchor;
			c = apts[0].anchor;	
		}		
		newList.push(pairPathItem);
		if(list.length === 1 && newList.length>0){
			p3 = newList[0];
			ppts = p3.pi1.pathPoints;
			lne = ppts.length;
			x1 = ppts[lne-1].anchor[0];
			y1 = ppts[lne-1].anchor[1];
			bppts = p1.pathPoints;
			blen = bppts.length;
			//如果有接起來就配對
			//log(["abs(x1-a[0])<1",abs(x1-a[0])<1,"abs(y1-a[1])"])
	        if(abs(x1-a[0])<1 && abs(y1-a[1])<1){
				//log(["ppts[lne-1].anchor",ppts[lne-1].anchor,"a",a]);
				//設定第二條
				pairPathItem.f2 = p3.f1;
				pairPathItem.setLinear(false,p3.linear1); //isFirst,value 接回原來第一個
				pairPathItem.setPathItme(p3.pi1,false,false);  //(false 第二條, false方向尾)
				setIntersections(pairPathItem,ff);//設定是否有交點
				//log([pairPathItem.pi1.name,"dir1",pairPathItem.dir1,"dir2",pairPathItem.dir2,"intersections",pairPathItem.intersections,"isCurve",pairPathItem.isCurve(),"isLinear",pairPathItem.isLinear(),"isCurveLinear",pairPathItem.isCurveLinear()]);
			}	
		}
			
		
		//log(["list.length before",list.length]);
		list.shift();
		//log(["list.length shift",list.length]);
			
		for(var i=0,value1,value2,tmp,pts,a1,a2,p2;i<list.length;i++){
			p2 = list[i];
			pts = p2.pathPoints;
			a1 = pts[0].anchor;
			a2 = pts[pts.length-1].anchor;
			pairPathItem.f2 = getF(pts);
			//log(["i = ",i,"a[0]",a[0],"a1[0]",a1[0],"a[1]",a[1],"a1[1]",a1[1],"value1 abs(a[0]- a1[0])",abs(a[0]- a1[0]),"abs(a[1]- a1[1])",abs(a[1]- a1[1])]);
			//log(["i = ",i,"a[0]",a[0],"a2[0]",a2[0],"a[1]",a[1],"a2[1]",a2[1],"value2 abs(a[0]- a2[0])",abs(a[0]- a2[0]),"abs(a[1]- a2[1])",abs(a[1]- a2[1])]);
			value1 = (abs(a[0]- a1[0]) <1) &&　(abs(a[1]- a1[1]) <1);
			value2 = (abs(a[0]- a2[0]) <1) &&　(abs(a[1]- a2[1]) <1);
			if(value1 || value2){
				if(i>0){
					tmp = list[0];
					list[0] = p2;
					list[i] = tmp;
				}
				pairPathItem.setLinear(false,islinear(pts)); //isFirst,value
				pairPathItem.setPathItme(p2,false,value1);//(false 第二條, true方向頭)
				if(pairPathItem.f1>=0){
					f=1
				}else{
					f=-1
				}
				setIntersections(pairPathItem,ff);//設定是否有交點
				//log([pairPathItem.pi1.name,"dir1",pairPathItem.dir1,"dir2",pairPathItem.dir2,"intersections",pairPathItem.intersections,"isCurve",pairPathItem.isCurve(),"isLinear",pairPathItem.isLinear(),"isCurveLinear",pairPathItem.isCurveLinear()]);
				sortItem(list,newList,!value1,ff);

				break;
			}
		}		
	}
}

function lineCurveIntersections(pairPathItem,oPathItems,i,islast){
	pi1 = pairPathItem.pi1;
	pi2 = pairPathItem.pi2;
	ops1 = oPathItems[i];
	if(islast){
		ops2 = oPathItems[0];
	}else{
		ops2 = oPathItems[i+1];
	}
	
	
	if(pairPathItem.linear1){
		//log(["ops1",ops1]);
		line = {p1:new Point().set(ops1[0][0]),p2:new Point().set(ops1[0][3])};
		ops = ops2;
		opsLine = ops1;
		head = pairPathItem.dir2;
		lineHead = pairPathItem.dir1;
	}else{
		//log(["ops2",ops2]);
		line = {p1:new Point().set(ops2[0][0]),p2:new Point().set(ops2[0][3])};
		ops = ops1;
		opsLine = ops2;
		head = pairPathItem.dir1;
		lineHead = pairPathItem.dir2;
	}
	

	opsLen = ops.length;
	idx = 0;
	
	for(var i=0;i<opsLen;i++){
		c2 = new Bezier().constructor(p4ToCoords(ops[i]));
		aligned = utils.align(c2.points,line);
		coords = [];
		aligned.forEach(function (point) {
	        ["x", "y", "z"].forEach(function (d) {
	          if (typeof point[d] !== "undefined") {
	            coords.push(point[d]);
	          }
	        });
	    });
		nB = new Bezier().constructor(coords);
		roots = utils.roots(nB.points);
		if(roots.length>0){
			idx = i;
			t = roots[0];
			q = c2.hull(t);
			sp = split(q);
			//去頭
			if(head){
				ops[i] = sp.right;
			}else{ //去尾
				ops[i] = sp.left;
			}
			//重新設定線
			if(lineHead){
				opsLine[0][0] = [q[9].x,q[9].y];		
			}else{
				opsLine[0][3] = [q[9].x,q[9].y];
			}
			break;
		}
	}
	
	for(var i=0;i<idx;i++){
		if(head){
			ops.shift();
		}else{
			ops.pop();
		}
	}
	
	//c2 = new Bezier().constructor(p4ToCoords(pcCurve));	
	//this.dir1 = true;  //true start ,false end
	//this.dir2 = true;  //true start ,false end
	//this.isIntersections = true; //是否有交點
	//this.f1 = 1;
	//this.f2 = 1;
	//this.coords1 = [];
	//this.coords2 = [];
	//this.intersections = false;
	//this.linear1 = true;
	//this.linear2 = true;	
}

//沒交叉切線相接
function curveCurveConnection(pairPathItem,oPathItems,n,islast){
	pi1 = pairPathItem.pi1;
	pi2 = pairPathItem.pi2;
	ops1 = oPathItems[n];
	if(islast){
		ops2 = oPathItems[0];
	}else{
		ops2 = oPathItems[n+1];
	}
	num1 = ops1.length;
	num2 = ops2.length;
	
	head1 = pairPathItem.dir1;
	head2 = pairPathItem.dir2;	
	
	if(pairPathItem.dir1){
		pCurve1 = ops1[0];
		p1 = pCurve1[0];
		p2 = pCurve1[1];

	}else{
		pCurve1 = ops1[num1-1];
		p1 = pCurve1[3];
		p2 = pCurve1[2];
	}
	
	if(pairPathItem.dir2){
		pCurve2 = ops2[0];
		p3 = pCurve2[0];
		p4 = pCurve2[1];
	}else{
		pCurve2 = ops2[num2-1];
		p3 = pCurve2[3];
		p4 = pCurve2[2];		
	}

	//交點
	p = utils.lli8(p1[0],p1[1],p2[0],p2[1],p3[0],p3[1],p4[0],p4[1]);
	app.activeDocument.pathItems.add().setEntirePath([[p1[0],p1[1]],[p.x,p.y]]);
	app.activeDocument.pathItems.add().setEntirePath([[p3[0],p3[1]],[p.x,p.y]]);	
}

//沒交叉切線相接
function lineCurveConnection(pairPathItem,oPathItems,n,islast){
	
	pi1 = pairPathItem.pi1;
	pi2 = pairPathItem.pi2;
	log(["pi1.name",pi1.name,"pi2.name",pi2.name]);
	ops1 = oPathItems[n];
	if(islast){
		ops2 = oPathItems[0];
	}else{
		ops2 = oPathItems[n+1];
	}

	if(pairPathItem.linear1){
		ops = ops2;
		opsLine = ops1;
		head = pairPathItem.dir2;
		lineHead = pairPathItem.dir1;
	}else{
		ops = ops1;
		opsLine = ops2;
		head = pairPathItem.dir1;
		lineHead = pairPathItem.dir2;
	}
	
	//曲線頭
	if(head){
		pCurve1 = ops[0];
		p1 = pCurve1[0];
		p2 = pCurve1[1];

	}else{
		pCurve1 = ops[ops.length-1];
		p1 = pCurve1[3];
		p2 = pCurve1[2];
	}
	
	//線頭
	if(lineHead){
		p3 = opsLine[0][0];
		p4 = opsLine[0][3];

	}else{
		p3 = opsLine[0][3];
		p4 = opsLine[0][0];
	}
		
	//交點
	p = utils.lli8(p1[0],p1[1],p2[0],p2[1],p3[0],p3[1],p4[0],p4[1]);
	app.activeDocument.pathItems.add().setEntirePath([[p1[0],p1[1]],[p.x,p.y]]);
	p3[0] = p.x;
	p3[1] = p.y;
	log(["p.x",p.x,"p.y",p.y,"p1[0]",p1[0],"p1[1]",p1[1],"p3[0]",p3[0],"p3[1]",p3[1]]);
	
	
}

//沒交叉切線相接
function lineLineConnection(pairPathItem,oPathItems,n,islast){
	pi1 = pairPathItem.pi1;
	pi2 = pairPathItem.pi2;
	ops1 = oPathItems[n];
	//log(["ops1[0][0]",ops1[0][0]]);
	
	if(islast){
		ops2 = oPathItems[0];
	}else{
		ops2 = oPathItems[n+1];
	}
	//log(["ops2222[0][0]",ops2[0][0]]);
	num1 = ops1.length;
	num2 = ops2.length;
	
	head1 = pairPathItem.dir1;
	head2 = pairPathItem.dir2;	
	//log(["pairPathItem.dir1",pairPathItem.dir1,"pairPathItem.dir1",pairPathItem.dir2]);

	if(pairPathItem.dir1){
		pCurve1 = ops1[0];
		p1 = ops1[0][0];
		p2 = ops1[0][3];

	}else{
		pCurve1 = ops1[1];
		p1 = ops1[0][3];
		p2 = ops1[0][0];
	}
	
	if(pairPathItem.dir2){
		p3 = ops2[0][0];
		p4 = ops2[0][3];
	}else{
		p3 = ops2[0][3];
		p4 = ops2[0][0];		
	}
	
	//交點
	p = utils.lli8(p1[0],p1[1],p2[0],p2[1],p3[0],p3[1],p4[0],p4[1]);

	p1[0] = p.x;
	p1[1] = p.y;
	p3[0] = p.x;
	p3[1] = p.y;

	//app.activeDocument.pathItems.add().setEntirePath([[p1[0],p1[1]],[p.x,p.y]]);
	//app.activeDocument.pathItems.add().setEntirePath([[p3[0],p3[1]],[p.x,p.y]]);	
}


function curveCurveIntersections(pairPathItem,oPathItems,n,islast){
	pi1 = pairPathItem.pi1;
	pi2 = pairPathItem.pi2;
	ops1 = oPathItems[n];
	if(islast){
		ops2 = oPathItems[0];
	}else{
		ops2 = oPathItems[n+1];
	}
	
	
	head1 = pairPathItem.dir1;
	head2 = pairPathItem.dir2;
	
	num1 = ops1.length;
	num2 = ops2.length;
	
	alen = abs(num1-num2);
	
	len = Math.min(num1,num2);
	//log(["len : ",len]);

	find:for(var i=0,a,b;i<len;i++){
		a = b = i+1;
		for(j=0;j<i+(i+1);j++){
			if(j == 0){
				if(pairPathItem.dir1){
					aa = a-1;
				}else{
					aa = num1-a;
				}
				if(pairPathItem.dir2){
					bb = b-1;
				}else{
					bb = num2-b;
				}
				//new Bezier().constructor(p4ToCoords(ops[i]));
				c1 = new Bezier().constructor(p4ToCoords(ops1[aa]));
				c2 = new Bezier().constructor(p4ToCoords(ops2[bb]));
			}else{
				n = j+1;
				if(n%2 === 0){
					//aa = a-1;
					//bb = b-n/2-1;
					if(pairPathItem.dir1){
						aa = a-1;
					}else{
						aa = num1-a;
					}
					if(pairPathItem.dir2){
						bb = b-n/2-1;
					}else{
						bb = num2 - b+n/2;
					}
					
					c1 = new Bezier().constructor(p4ToCoords(ops1[aa]));
					c2 = new Bezier().constructor(p4ToCoords(ops2[bb]));
				}else{
					
					if(pairPathItem.dir1){
						aa = a-Math.floor(n/2)-1;
					}else{
						aa = num1-a+Math.floor(n/2);
					}
					if(pairPathItem.dir2){
						bb = b-1;
					}else{
						bb = num2-b;
					}					
					c1 = new Bezier().constructor(p4ToCoords(ops1[aa]));
					c2 = new Bezier().constructor(p4ToCoords(ops2[bb]));	
				}
			}
						
			v = c1.intersects(c2,0.001);
			
			if(v.length > 0){
				//log([pairPathItem.pi1.name,"dir1",pairPathItem.dir1,"dir2",pairPathItem.dir2,"head1",head1,"head2",head2]);
				//log(["ops1[aa]",ops1[aa],"ops1[bb]",ops1[bb]]);
				//log(["a",aa,"b",bb,"v",v]);
			}
			//log(["a",aa,"b",bb,"v",v]);
			if(v.length > 0){
				//log(["v.length == 1"]);
				tt = v[0].split('/');
				q1 = c1.hull(tt[0]);
				q2 = c2.hull(tt[1]);
				
				sp1 = split(q1);
				sp2 = split(q2);
				//去頭head = pairPathItem.dir1;
				if(head1){
					ops1[aa] = sp1.right;
				}else{ //去尾
					ops1[aa] = sp1.left;
					
				}			
				if(head2){
					ops2[bb] = sp2.right;
				}else{ //去尾
					ops2[bb] = sp2.left;
				}
				
				//log(["v.length"]);
				break find;
			}
			
		}
		//log(["=============="]);
	}
	
	
	if(head1){
		//log(["head1 aa",aa]);
		for(var i=0;i<aa;i++){
			ops1.shift();
		}
	}else{
		//log(["not head1 num1-aa-1",num1-aa-1,"num1",num1]);
		for(var i=0;i<num1-aa-1;i++){
			ops1.pop();
		}
	}
	
	if(head2){
		//log(["head2 bb",bb]);
		for(var i=0;i<bb;i++){
			ops2.shift();
		}
	}else{
		//log(["not head2 num2-bb-1",num2-bb-1,"num2",num2]);
		for(var i=0;i<num2-bb-1;i++){
			ops2.pop();
		}
	}

}

function linelineIIntersections(){
	
	
}

function setIntersections(pairPathItem,f){
	//log(["ffffffffff",f]);
	if(pairPathItem.isCurve()){
		pairPathItem.setIntersections(f);//設定是否有交點
	}else if(pairPathItem.isCurveLinear()){
		
		op = f;
		if(pairPathItem.linear1){
			pcLine = parallel_curve.execute(pairPathItem.coords1,pairPathItem.f1*op);
			pcCurve = parallel_curve.execute(pairPathItem.coords2,pairPathItem.f2*op);		
		}else{
			pcCurve = parallel_curve.execute(pairPathItem.coords1,pairPathItem.f1*op);
			pcLine = parallel_curve.execute(pairPathItem.coords2,pairPathItem.f2*op);
		}
		
		line = {p1:new Point().set(pcLine[0]),p2:new Point().set(pcLine[3])};
		c2 = new Bezier().constructor(p4ToCoords(pcCurve));		
		aligned = utils.align(c2.points,line);
		coords = [];
		aligned.forEach(function (point) {
	        ["x", "y", "z"].forEach(function (d) {
	          if (typeof point[d] !== "undefined") {
	            coords.push(point[d]);
	          }
	        });
	    });
		nB = new Bezier().constructor(coords);
		roots = utils.roots(nB.points);
		//log(["roots",objectToString(roots)]);
		pairPathItem.setIntersectionsValue(roots.length>0);
		
	}
	
	
}

function rePair(list){
	var newPairs = [];
	newPath.pathPoints
	
	for(var i = 0,a,p1,pts1 ;i<list.length;i++){
		p1 = list[i].pathItem;
		pts1 = p1.pathPoints;
		a = pts1[0];
		for(var j = i+1,p2,pts2,b1,b2;j<list.length;j++){		
			p2 = list[j].pathItem;
			pts2 = p2.pathPoints;	
			b1 = pts2[0];
			b2 = pts2[pts2.length-1];
			
			if(abs(a1[0]- a2[0]) <v &&　abs(a1[1]- a2[1]) <v){
				newPairs.push([list[i],list[j]]);
				break;
			}
		}	
	}
	return newPairs;
}

/*


 */
function pair(list,v){
	var newPairs = [];
	for(var i = 0 ;i<list.length;i++){
		for(var j = i+1,a1,a2;j<list.length;j++){
			a1 = list[i].pt.anchor;
			a2 = list[j].pt.anchor;
			if(abs(a1[0]- a2[0]) <v &&　abs(a1[1]- a2[1]) <v){
				newPairs.push([list[i],list[j]]);
				break;
			}
		}	
	}
	return newPairs;
}

function islinear(pts){
	//log(["pts.len : ",pts.length]);
	if(pts.length == 2){
		aa = pts[0].anchor;
		al = pts[0].leftDirection;
		ar = pts[0].rightDirection;
		ba = pts[1].anchor;
		bl = pts[1].leftDirection;
		br = pts[1].rightDirection;	
		
		ax = (aa[0] === al[0]) && (al[0] === ar[0]);
		ay = (aa[1] === al[1]) && (al[1] === ar[1]);

		bx = (ba[0] === bl[0]) && (bl[0] === br[0]);
		by = (ba[1] === bl[1]) && (bl[1] === br[1]);

		if((ax && by) && (bx && by)){
			return true;
		}
	}
	return false;
	
}

function findIntersections(num1,num2){
	len = Math.min(num1,num2);
	for(var i=0,a,b;i<len;i++){
		a = b = i+1;
		for(j=0;j<i+(i+1);j++){
			if(j == 0){
				log(["a",a,"b",b]);
			}else{
				n = j+1;
				if(n%2 === 0){
					log(["a",a,"b",b-n/2]);
				}else{
					log(["a",a-Math.floor(n/2),"b",b]);
				}
			}
		}
		log(["=============="]);
	}
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
			function execute(offset){
				offsetLen = offset;
				//offsetLen = 100/2.83464567;
				if(offsetLen>=0){
					ff = 3;
				}else{
					ff = -3;
				}
				
				paths = activeDocument.selection;
				var newList = new Array();
				sortItem(paths.slice(),newList,true,ff);
				var oPathItems = [];
				
				last = false;
				for(var i=0,pairPathItme,pi1,pi2;i<newList.length;i++){
					//ParallelObj
					pairPathItme = newList[i];
					pi1 = pairPathItme.pi1;
					pi2 = pairPathItme.pi2;
					len1 = pairPathItme.f1*offsetLen;
					len2 = pairPathItme.f2*offsetLen;
					if(i==0){
						oPathItems.push(genOpts(pi1,len1));
					}
					
					if(i < newList.length -1){
						oPathItems.push(genOpts(pi2,len2));
						last = false;
					}else{
						last = true;
					}
					//log(["i",i,"newList.length",newList.length,"last",last,"pairPathItme.intersections",pairPathItme.intersections]);
					
					if(pairPathItme.intersections){ //有交點
					    //去頭尾
						if(pairPathItme.isCurveLinear()){
							lineCurveIntersections(pairPathItme,oPathItems,i,last);
						}
						if(pairPathItme.isCurve()){
							curveCurveIntersections(pairPathItme,oPathItems,i,last);
						}
					}else{//沒交點
						if(pairPathItme.isCurve()){
							//log(["i",i,"last",last])
							curveCurveConnection(pairPathItme,oPathItems,i,last);
						}if(pairPathItme.isCurveLinear()){
							lineCurveConnection(pairPathItme,oPathItems,i,last);	
						}
					}
					
					if(pairPathItme.isLinear()){
						lineLineConnection(pairPathItme,oPathItems,i,last);
					}
					
				}

				for(var i=0;i<oPathItems.length;i++){
					//log(["oPathItems[i]",oPathItems[i]])
					if(newList[i].linear1){
						drawLine(oPathItems[i]);
					}else{
						drawCurve(oPathItems[i]);
					}
					
				}
					
			}	
			return {execute : execute};
		}
)();

/*
for(var i=20;i<220;i+=20){
	mytest.execute(-i/2.83464567);
}
*/

mytest.execute(-2/2.83464567);


function pointEqual(anchor ,a){
	vx =abs( anchor[0] - a.x);
	vy =abs( anchor[1] - a.y);
	//log(["vx",vx,"vy",vy]);
	if((vx < 0.00001) && (vy < 0.00001)){
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
	//log(["p",p]);
	for(var i = 0,pc,b;i<drawPt.length;i++){
		if(!p){
			continue;
		}
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


//q = c.full(t)
//r 去頭
//l 去尾
function split(q){
	P0_P = q[0];
	V1_P = q[4];
	V2_P = q[6];
	E1_P = q[7];
	E2_P = q[8];
	B_P =  q[9];
	P3_P = q[3];
	l = new Array([P0_P.x,P0_P.y],[V1_P.x,V1_P.y],[E1_P.x,E1_P.y],[B_P.x,B_P.y]);
	r = new Array([B_P.x,B_P.y],[E2_P.x,E2_P.y],[V2_P.x,V2_P.y],[P3_P.x,P3_P.y]);
	return {left:l,right:r};
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
			
			//log([i,objectToString(tmp[i])]);
			
			//log([i,"q[3].x",q[3].x,"q[3].y",q[3].y]);
			//log([i,"anchor[0]",opt.anchor[0],"anchor[1]",opt.anchor[1]]);
		    
		    xv= opt.anchor[0] - q[3].x;
			if(pointEqual(opt.anchor,q[3])){
				
				//log([i,"opt.anchor",opt.anchor,"q[3]",objectToString(q[3])]);
				
				//log([i,"opt",objectToString(opt)]);
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
				app.activeDocument.pathItems.add().setEntirePath([[B_P.x,B_P.y],[E2_P.x,E2_P.y]]);
				app.activeDocument.pathItems.add().setEntirePath([[E2_P.x,E2_P.y],[V2_P.x,V2_P.y]]);
				app.activeDocument.pathItems.add().setEntirePath([[V2_P.x,V2_P.y],[P3_P.x,P3_P.y]]);				

				opt.anchor = opt.leftDirection = [B_P.x,B_P.y];
				opt.rightDirection = [E2_P.x,E2_P.y];
				optf.leftDirection = [V2_P.x,V2_P.y];		
			}
		}		
	}
	return pt;
}

function genOpts(pi,len){
	opts = [];
	pts = pi.pathPoints;
	
	for(var i=0;i<pts.length-1;i++){
		coords = ptToCoordsForParallel(pts,i);
		//log(["coords",(coords),"len",len]);
		opt = parallel_curve.execute(coords,len);
		//log(["opt",objectToString(opt)]);
		opts.push(opt);
	}
	return opts;
	
}

function ptToCoordsForParallel(pts,idx1){
	p0 = pts[idx1].anchor;
	p1 = pts[idx1].rightDirection;
	p2 = pts[idx1+1].leftDirection;
	p3 = pts[idx1+1].anchor;
	return p4TolineCoords([p0,p1,p2,p3]);
}

function ptToCoords(pts,idx1,idx2){

	p0 = pts[idx1].anchor;
	p1 = pts[idx1].rightDirection;
	p2 = pts[idx2].leftDirection;
	p3 = pts[idx2].anchor;
	return p4ToCoords([p0,p1,p2,p3]);
	//return [p0[0],p0[1],p1[0],p1[1],p2[0],p2[1],p3[0],p3[1]];
	
}

function p4TolineCoords(p4){
	result = p4ToCoords(p4);
	return new Array([result[0],result[1]],[result[2],result[3]],[result[4],result[5]],[result[6],result[7]]);
}

function p4ToCoords(p4){
	p0 = p4[0];
	p1 = p4[1];
	p2 = p4[2];
	p3 = p4[3];
	a = (p0[0] === p1[0]) &&  (p0[1] === p1[1]);
	b = (p2[0] === p3[0]) &&  (p2[1] === p3[1]);
	if(a && b ){
		x1 = p0[0];
		y1 = p0[1];
		x2 = p3[0];
		y2 = p3[1];
		
		dir = ["x", "y"];
		dir.x  = x2 - x1;
		dir.y  = y2 - y1;
		
		p1[0] = x1 + 0.3 * dir.x;
		p1[1] = y1 + 0.3 * dir.y;
		p2[0] = x1 + 0.7 * dir.x;
		p2[1] = y1 + 0.7 * dir.y;
		//log(["p1[0]",p1[0],"p1[1]",p1[1],"p2[0]",p2[0],"p2[1]",p2[1]]);	
	}
	return [p0[0],p0[1],p1[0],p1[1],p2[0],p2[1],p3[0],p3[1]];
}

function isPtLine(pt){
	anchor = pt.anchor;
	leftDirection = pt.leftDirection;
	rightDirection = pt.rightDirection;
	x = (anchor[0] === leftDirection[0]) && (anchor[0] === rightDirection[0]);
	y = (anchor[1] === leftDirection[1]) && (anchor[1] === rightDirection[1]);
	return x && y;
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
function drawSingleCurve(ops){
	var newPath = activeDocument.pathItems.add();
	var newPoint = newPath.pathPoints.add();
	newPoint.anchor = ops[0];
	newPoint.leftDirection = newPoint.anchor;
	newPoint.rightDirection = ops[1];
	newPoint = newPath.pathPoints.add();
	newPoint.anchor = ops[3];
	newPoint.leftDirection = ops[2];
	newPoint.rightDirection = newPoint.anchor;
	
}

function drawLine(ops){
	var newPath = activeDocument.pathItems.add();		
	newPath.setEntirePath([ops[0][0],ops[0][3]]);
	return newPath;
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