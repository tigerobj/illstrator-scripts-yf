#include "parallel_curve.js"; // include polyfill file
#include "base.jsx"; // include polyfill file
#include "json2.js"; // include polyfill file
#include "bezier.js"; 

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
				//log(["abs",abs(-5.5),"crt(2)",crt(2),"crt(-2)",crt(-2),"tau",tau,"nMax",nMax]);
				

				//log(["utils.pointToString(p)",utils.pointToString(new Point().set(10,20))]);
				//log(["M",M]);
				
				
				//["x", "y", "z"].forEach(function (d) {alert(d);})
				
				//1247.9985 pt
				coords1 = [1247.9985,4769.4746, 1386.5659, 4729.8467, 1466.6785, 4619.0924, 1510.7486, 4548.3842];
				
				coords2 = [1479.3501, 4560.7697, 1579.9008, 4587.7336, 1728.7122, 4612.0346, 1896.7955, 4574.7586];
				
				//coords1 = [50,35, 45,235, 220,235, 220,135];
  				//coords2 = [20,150, 120,20, 220,95, 140,240];
				
				var curve1 = new Bezier().constructor(coords1);
				var curve2 = new Bezier().constructor(coords2);
				
				var intersections = curve1.intersects(curve2,0.0001);
				log(intersections);
				intersections.forEach(function (str) {
					log(["split",str.split('/')]);
					tt = str.split('/');
					ct = parseFloat(tt[0]);
					p = curve1.get(ct);
					log(["p",p]);
					ct2 = parseFloat(tt[1]);
					pp = curve2.get(ct2);
					log(["pp",pp]);
				});
				//log(objectToString(intersections));
				
				
				
				/*
				cv = new Curve( activeDocument.selection[0], 2, 3 );
				cv.setParams();
				aaaaa = cv.drawStruct(0.92041);
				reSetCurve(activeDocument.selection[0],2,3,aaaaa.left);
				*/
				
				
				
				/*
				alert(activeDocument.selection[1].pathPoints[0].anchor);
				cv2 = new Curve( activeDocument.selection[1], 2, 3 );
				cv2.setParams();
				bbbb = cv2.drawStruct(0.0649);*/
				//reSetCurve(activeDocument.selection[1],2,3,bbbb.right);
				
				
				//==================================
				pts = s.pathPoints;
				ptStart = pts[0];
				ptEnd = pts[pts.length-1];
				log(["ptStart anchor ",ptStart.anchor,ptStart.leftDirection,ptStart.rightDirection,"ptEnd",ptEnd.anchor,ptEnd.leftDirection,ptEnd.rightDirection]);
				
				
				
				//0.0649

				
				//log(["ops",ops]);

				
				//cv = new Curve( path, pIdx, pNext );
				
				//找出B點
				

			}
			
			return {execute : execute};
		}
)();

function StdBoardSize(coords) {
	this.args = coords;
	log(["this.args.length",this.args.length,"this.args",this.args]);
	this.tolog = function () {
		log(["this.args",this.args]);
		return this;
	}
}


// -----------------------------------------------
function getCurvesLength( cvs ){
    var len = 0;
    for(var i = 0, iEnd = cvs.length; i < iEnd; i++){
        len += cvs[i].getLength(1);
    }
    return len;
}
// -----------------------------------------------
function isSegmentSelected(pts, pIdx){
    var s = pts[pIdx].selected; 
    return ! (s == PathPointSelection.NOSELECTION
        || s == PathPointSelection.LEFTDIRECTION);
}

function reSetCurve(path, idx1, idx2, newPts){
	var pts = path.pathPoints;
	pts[idx1].anchor = newPts[0];
	pts[idx1].rightDirection = newPts[1];
	pts[idx2].leftDirection = newPts[2];
	pts[idx2].anchor = newPts[3];
	return path;
}

var SplitCurve = function(){
	this.left =[];
	this.right = [];
}

SplitCurve.prototype = {
	set : function(left, right){
        this.left = left;
        this.right = right;
        return this;
    }
}


// -----------------------------------------------
var Point = function(){
    this.x = 0;
    this.y = 0;
}
Point.prototype = {
    set : function(x, y){
        this.x = x;
        this.y = y;
        return this;
    },
    setr : function(xy){ // set with an array
        this.x = xy[0];
        this.y = xy[1];
        return this;
    },
    setp : function(p){ // set with a Point
        this.x = p.x;
        this.y = p.y;
        return this;
    },
    addp : function(p){
        return new Point().set( this.x + p.x, this.y + p.y );
    },
    subp : function(p){
        return new Point().set( this.x - p.x, this.y - p.y );
    },
    mul : function(m){
        return new Point().set( this.x * m, this.y * m );
    },
    rotate : function(rad){
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        return new Point().set( this.x * c - this.y * s, this.x * s + this.y * c );
    },
    getAngle : function(){
        return Math.atan2( this.y, this.x ); // radian
    },
    normalize : function(){
        var d = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        var p = new Point();
        if( d == 0 ){
            p.set(0,0);
        } else {
            p.set(this.x / d, this.y / d);
        }
        return p;
    },
    toArray : function(){
        return [this.x, this.y];
    }
}


/**
 * 
 */
// -----------------------------------------------
var Curve = function(path, idx1, idx2){
    var pts = path.pathPoints;
    
    for(var i=0;i<pts.length;i++){
		
		log([i,objectToString(pts[i])]);
	}
    
	log(objectToString(pts));
    this.path = path;
    this.idx1 = idx1;
    this.idx2 = idx2;
    
    this.p1 = new Point().setr(pts[idx1].anchor);
    this.rdir = new Point().setr(pts[idx1].rightDirection);
    this.ldir = new Point().setr(pts[idx2].leftDirection);
    this.p2 = new Point().setr(pts[idx2].anchor);

    this.q = [this.p1, this.rdir, this.ldir, this.p2];
    this.params = null;
    this.dm = null;
    this.dn = null;
    this.length = null;
}
Curve.prototype = {
    bezier : function(t){
        var u = 1 - t;
        return new Point().set(
            u*u*u * this.p1.x + 3*u*t*(u* this.rdir.x + t* this.ldir.x) + t*t*t * this.p2.x,
            u*u*u * this.p1.y + 3*u*t*(u* this.rdir.y + t* this.ldir.y) + t*t*t * this.p2.y);
    },
    setParams : function(){
        var m = [this.p2.x - this.p1.x + 3 * (this.rdir.x - this.ldir.x),
                 this.p1.x - 2 * this.rdir.x + this.ldir.x,
                 this.rdir.x - this.p1.x];
        var n = [this.p2.y - this.p1.y + 3 * (this.rdir.y - this.ldir.y),
                 this.p1.y - 2 * this.rdir.y + this.ldir.y,
                 this.rdir.y - this.p1.y];
        
        this.params = [ m[0] * m[0] + n[0] * n[0],
                        4 * (m[0] * m[1] + n[0] * n[1]),
                        2 * ((m[0] * m[2] + n[0] * n[2]) + 2 * (m[1] * m[1] + n[1] * n[1])),
                        4 * (m[1] * m[2] + n[1] * n[2]),
                        m[2] * m[2] + n[2] * n[2]];
        
        this.dm = [m[0], 2 * m[1], m[2]];
        this.dn = [n[0], 2 * n[1], n[2]]; 
    },
    getStrutPoints : function(t){
		var u = 1 - t;
		var uuu = u*u*u;
		var ttt = t*t*t;
		ut = uuu / (ttt + uuu);
		
		//this.bezier(t);
		
		//new Point()
		
	},
    getLength : function(t){
        if( !this.params ) this.setParams();
        var k = this.params;
    
        var h = t / 128;
        var hh = h * 2;
        
        var fc = function(t, k){
            return Math.sqrt(t * (t * (t * (t * k[0] + k[1]) + k[2]) + k[3]) + k[4]) || 0 };
        
        var total = (fc(0, k) - fc(t, k)) / 2;
        
        for(var i = h; i < t; i += hh){
            total += 2 * fc(i, k) + fc(i + h, k);
        }
        
        return total * hh;
    },
    getTforLength : function(len){
        //if( !this.params ) this.setParams();
        var k = this.params;

        //if( !this.length) this.length = this.getLength(1);
        if(len <= 0){
            return 0;
        } else if(len > this.length){
            return -1;
        }
        
        var t, d;
        var t0 = 0;
        var t1 = 1;
        var torelance = 0.001;
        
        for(var h = 1; h < 30; h++){
            t = t0 + (t1 - t0) / 2;
            d = len - this.getLength(t);
            
            if(Math.abs(d) < torelance) break;
            else if(d < 0) t1 = t;
            else t0 = t;
        }
        
        return Math.min(1, t);
    },
    getEquallySpacedParameters : function( spec ){
		//log(["getEquallySpacedParameters spec before",objectToString(spec)]);
        // spec = { ts:[], d:d, ini_d:0 }
        if( !this.params ) this.setParams();
        if( !this.length ) this.length = this.getLength(1);

        var total_d = spec.ini_d;  //total_d:'163.39916862535'
        var t;
		//log(["this.length",this.length,"total_d = spec.ini_d",total_d]);
		//"this.length",123.295692163844  ,total_d = spec.ini_d",112.388917634357
        if( total_d < this.length ){
            while( 1 ){
                t = this.getTforLength( total_d );
                if( t < 0 ) break;
                spec.ts.push( t );
                total_d += spec.d;
            }
            spec.ini_d = total_d - this.length;
        } else {
            spec.ini_d -= this.length;
        }
        //log(["getEquallySpacedParameters spec after",objectToString(spec)]);
    },
    drawNotchesForT2 : function(t,notch_length,grp){
		
		var pnt = this.bezier(t);
		
		var mt = (1 - t);
		
		a = mt*mt;
		b = 2*mt*t;
		c = t*t;
		dp = [{x: 3 * (this.rdir.x - this.p1.x),y: 3 * (this.rdir.y - this.p1.y)},
		     {x: 3 * (this.ldir.x - this.rdir.x),y: 3 * (this.ldir.y - this.rdir.y)},
		     {x: 3 * (this.p2.x - this.ldir.x),y: 3 * (this.p2.y - this.ldir.y)}];
		
		log(["dp",objectToString(dp)]);
		
		dd = {x: a * dp[0].x + b * dp[1].x + c * dp[2].x,
		      y: a * dp[0].y + b * dp[1].y + c * dp[2].y};
		      
		log(["dd",objectToString(dd)]);
		
		log(["dd.x",Math.sqrt(dd.x*dd.x + dd.y*dd.y)]);
		
		var m = Math.sqrt(dd.x*dd.x + dd.y*dd.y);
		
		
		d = { x: dd.x/m, y: dd.y/m };
		const q = Math.sqrt(d.x * d.x + d.y * d.y);
		var n = { x: -d.y / q, y: d.x / q };
        
        pp1 = [pnt.x + d.x*notch_length, pnt.y + d.y*notch_length];
        pv1 = [pnt.x + n.x*notch_length, pnt.y + n.y*notch_length];
        
        var line = this.path.duplicate();
        line.closed = false;
        line.filled = false;
        line.stroked = true;
        line.setEntirePath([pp1, pnt.toArray(),[pnt.x, pnt.y]]);
        log(["pp1",pp1,"pnt.toArray()",pnt.toArray(),"x,y",[pnt.x, pnt.y]])
        line.move(grp, ElementPlacement.PLACEATEND);
        
        line = this.path.duplicate();
        line.closed = false;
        line.filled = false;
        line.stroked = true;
        line.setEntirePath([pv1, pnt.toArray(),[pnt.x, pnt.y]]);
        log(["pv1",pv1,"pnt.toArray()",pnt.toArray(),"x,y",[pnt.x, pnt.y]])
        line.move(grp, ElementPlacement.PLACEATEND);
        
	},
    drawNotchesForT : function(t,notch_length,grp){
		//alert("drawNotchesForT : this.dm[0]"+this.dm[0]);
		var hpi = Math.PI / 2;
        var dx = t * (t * this.dm[0] + this.dm[1]) + this.dm[2];
        var dy = t * (t * this.dn[0] + this.dn[1]) + this.dn[2];
        var pnt = this.bezier(t);
        var rad = Math.atan2( dy, dx ) + hpi;
        //alert("rad : "+rad);
        var xoffset = notch_length * Math.cos(rad);
        var yoffset = notch_length * Math.sin(rad);
        
        
        var p1 = [pnt.x + xoffset, pnt.y + yoffset];
        //var p2 = [pnt.x - xoffset, pnt.y - yoffset];
        var p2 = [pnt.x, pnt.y];
        var p1Str = "("+(pnt.x + xoffset)+","+(pnt.y + yoffset)+")";
        var p2Str = "("+(pnt.x - xoffset)+","+(pnt.y - yoffset)+")";
        //log(["dx",dx,"dy",dy,"xoffset",xoffset,"yoffset",yoffset,"p1",p1Str,"p2",p2Str,""]);		
        var line = this.path.duplicate();
        line.closed = false;
        line.filled = false;
        line.stroked = true;
        line.setEntirePath([p1, pnt.toArray(), p2]);
        line.move(grp, ElementPlacement.PLACEATEND);	
        
        	
	},
    drawNotches : function(spec, notch_length, grp){
        var ts = spec.ts;
        if(ts.length < 1) return;
        
        //if( !this.params ) this.setParams();
        
        var hpi = Math.PI / 2;

        for(var ti = 0, tiEnd = ts.length; ti < tiEnd; ti++){
            var t = ts[ti];
            var dx = t * (t * this.dm[0] + this.dm[1]) + this.dm[2];
            var dy = t * (t * this.dn[0] + this.dn[1]) + this.dn[2];
            var pnt = this.bezier(t);
            var rad = Math.atan2( dy, dx ) + hpi;
            var xoffset = notch_length * Math.cos(rad);
            var yoffset = notch_length * Math.sin(rad);
            var p1 = [pnt.x + xoffset, pnt.y + yoffset];
            var p2 = [pnt.x - xoffset, pnt.y - yoffset];
            var p1Str = "("+(pnt.x + xoffset)+","+(pnt.y + yoffset)+")";
            var p2Str = "("+(pnt.x - xoffset)+","+(pnt.y - yoffset)+")";
            //log(["dx",dx,"dy",dy,"xoffset",xoffset,"yoffset",yoffset,"p1",p1Str,"p2",p2Str,""]);
            
            var line = this.path.duplicate();
            line.closed = false;
            line.filled = false;
            line.stroked = true;
            line.setEntirePath([p1, pnt.toArray(), p2]);
            
            line.move(grp, ElementPlacement.PLACEATEND);

            spec.count--;
            if( spec.count < 1 ) break;
        }
    },
    drawStruct : function(t){
		if( !this.params ) this.setParams();
        if( !this.length ) this.length = this.getLength(1);
        var Bpnt = this.bezier(t);
        var Pstart = this.bezier(0);
        var Pend = this.bezier(1);
        u = 1-t;
		uuu = (1-t)*(1-t)*(1-t);
		ttt = t*t*t;
		ut = uuu/(ttt+uuu);
		ratio = Math.abs((ttt+uuu-1)/(ttt+uuu)); 
		var Cpnt = new Point().set((ut*Pstart.x+(1-ut)*Pend.x),(ut*Pstart.y+(1-ut)*Pend.y));
		
		var Apnt = new Point().set(Bpnt.x - ((Cpnt.x-Bpnt.x)/ratio),Bpnt.y - (Cpnt.y-Bpnt.y)/ratio);
		var C1pnt = this.rdir;
		var C2pnt = this.ldir;
		var v1 = new Point().set((1-t)*Pstart.x+t*C1pnt.x,(1-t)*Pstart.y+t*C1pnt.y);
		var v2 = new Point().set((1-t)*C2pnt.x+t*Pend.x,(1-t)*C2pnt.y+t*Pend.y);
		
		var e1 = new Point().set((1-t)*v1.x+t*Apnt.x,(1-t)*v1.y+t*Apnt.y);
		var e2 = new Point().set((1-t)*Apnt.x+t*v2.x,(1-t)*Apnt.y+t*v2.y);
		
		/*
		app.activeDocument.pathItems.add().setEntirePath( [[Pstart.x,Pstart.y],[Pend.x,Pend.y]] );
		app.activeDocument.pathItems.add().setEntirePath( [[Pstart.x,Pstart.y],[C1pnt.x,C1pnt.y]] );
		app.activeDocument.pathItems.add().setEntirePath( [[C2pnt.x,C2pnt.y],[Pend.x,Pend.y]] );
		app.activeDocument.pathItems.add().setEntirePath( [[C2pnt.x,C2pnt.y],[C1pnt.x,C1pnt.y]] );
		app.activeDocument.pathItems.add().setEntirePath( [[Cpnt.x,Cpnt.y],[Apnt.x,Apnt.y]] );
		app.activeDocument.pathItems.add().setEntirePath( [[v1.x,v1.y],[Apnt.x,Apnt.y]] );
		app.activeDocument.pathItems.add().setEntirePath( [[v2.x,v2.y],[Apnt.x,Apnt.y]] );	
		app.activeDocument.pathItems.add().setEntirePath( [[e1.x,e1.y],[e2.x,e2.y]] );
		*/
		app.activeDocument.pathItems.add().setEntirePath( [[Pstart.x,Pstart.y],[v1.x,v1.y]] ); 
		app.activeDocument.pathItems.add().setEntirePath( [[v1.x,v1.y],[e1.x,e1.y]] ); 
		app.activeDocument.pathItems.add().setEntirePath( [[e1.x,e1.y],[Bpnt.x,Bpnt.y]] );      
        //var pnt = this.bezier(t);
        //result = {left,}
        
        result = new SplitCurve().set([[Pstart.x,Pstart.y],[v1.x,v1.y],[e1.x,e1.y],[Bpnt.x,Bpnt.y]]
        							,[[Bpnt.x,Bpnt.y],[e2.x,e2.y],[v2.x,v2.y],[Pend.x,Pend.y]]);
        return result;
		
	}
}

// ------------------------------------------------
// convert millimeter to PostScript point
function mm2pt(n){
    return n * 2.83464567;
}
// ----------------------------------------------
// return the index of pathpoint. when the argument is out of bounds,
// fixes it if the path is closed (ex. next of last index is 0),
// or return -1 if the path is not closed.
function parseIdx(p, n){ // PathPoints, number for index
  var len = p.length;
  if( p.parent.closed ){
    return n >= 0 ? n % len : len - Math.abs(n % len);
  } else {
    return (n < 0 || n > len - 1) ? -1 : n;
  }
}
// ------------------------------------------------
// extract PathItems from the selection which length of PathPoints
// is greater than "n"
function getPathItemsInSelection(n, paths){
  if(documents.length < 1) return;
  
  var s = activeDocument.selection;
  
  if (!(s instanceof Array) || s.length < 1) return;

  extractPaths(s, n, paths);
}

// --------------------------------------
// extract PathItems from "s" (Array of PageItems -- ex. selection),
// and put them into an Array "paths".  If "pp_length_limit" is specified,
// this function extracts PathItems which PathPoints length is greater
// than this number.
function extractPaths(s, pp_length_limit, paths){
  for(var i = 0; i < s.length; i++){
    if (s[i].locked || s[i].hidden){
        continue;
    } else if(s[i].typename == "PathItem"){
      if((pp_length_limit && s[i].pathPoints.length <= pp_length_limit)
        || s[i].guides || s[i].clipping){
        continue;
      }
      paths.push(s[i]);
      
    } else if(s[i].typename == "GroupItem"){
      // search for PathItems in GroupItem, recursively
      extractPaths(s[i].pageItems, pp_length_limit, paths);
      
    } else if(s[i].typename == "CompoundPathItem"){
      // searches for pathitems in CompoundPathItem, recursively
      // ( ### Grouped PathItems in CompoundPathItem are ignored ### )
      extractPaths(s[i].pathItems, pp_length_limit , paths);
    }
  }
}


mytest.execute(0.5);