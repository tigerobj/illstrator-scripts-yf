function matrix_mul(a,b){
	var sum = 0;
	for(var i=0;i<a.length;i++){
		//
		sum += a[i]*b[i];
	}
	return sum;
}
function matrix_sub(a,b){
	var tmp = new Array(a.length)
	for(var i=0;i<a.length;i++){
		tmp[i] = a[i] - b[i];
	}
	return tmp;
}

function matrix_mul_t(t,a,b){
	var sum = 0;
	for(var i=0;i<a.length;i++){
		//
		sum += a[i]*b[i];
	}
	return t*sum;
}

function matrix_sub_t(t,a,b){
	var tmp = new Array(a.length)
	for(var i=0;i<a.length;i++){
		tmp[i] = a[i] - t*b[i];
	}	
	return tmp;
}

function matrix_add_t(t,a,b){
	var tmp = new Array(a.length)
	for(var i=0;i<a.length;i++){
		tmp[i] = a[i] + t*b[i];
	}	
	return tmp;
}

/*
[0,0][0,1][0,2]
[1,0][1,1][1,2]
[2,0][2,1][2,2]

[0,0][1,1][2,2]+[0,1][1,2][2,0]+[1,0][2,1][0,2]-[0,2][1,1][2,0]-[1,2][2,1][0,0]-[0,1][1,0][2,2]

*/

function det(a){
	return a[0][0]*a[1][1]*a[2][2]+a[0][1]*a[1][2]*a[2][0]+a[1][0]*a[2][1]*a[0][2]-a[0][2]*a[1][1]*a[2][0]-a[1][2]*a[2][1]*a[0][0]-a[0][1]*a[1][0]*a[2][2]
}

//p0 5216.5163,-3595.0036
//p1 5232.4573,-3580.7811
//p2 5244.8796,-3568.3712
//p3 5253.282,-3559.6608
var parallel_curve = (
		function init() {	
			function execute(bp,offset_length){
				
				var p0 = bp[0];
				var p1 = bp[1];
				var p2 = bp[2];
				var p3 = bp[3];
				//log(["p0",p0,"p1",p1,"p2",p2,"p3",p3]);
				
				var e = offset_length * 2.83464567;
				a = [3*(p1[0]-p0[0])+3*(p3[0]-p2[0])-2*(p3[0]-p0[0]),3*(p1[1]-p0[1])+3*(p3[1]-p2[1])-2*(p3[1]-p0[1])];
				b = [-6*(p1[0]-p0[0])-3*(p3[0]-p2[0])+3*(p3[0]-p0[0]),-6*(p1[1]-p0[1])-3*(p3[1]-p2[1])+3*(p3[1]-p0[1])];
				c = [3*(p1[0]-p0[0]),3*(p1[1]-p0[1])];
				s0 = [p1[0]-p0[0],p1[1]-p0[1]];
				s3 = [p3[0]-p2[0],p3[1]-p2[1]];
				
//				xxs = Math.sqrt(s0[0]*s0[0]+s0[1]*s0[1]);
				
				n0 = [-s0[1]/Math.sqrt( s0[0]*s0[0]+s0[1]*s0[1]),s0[0]/Math.sqrt( s0[0]*s0[0]+s0[1]*s0[1])];
				n3 = [-s3[1]/Math.sqrt( s3[0]*s3[0]+s3[1]*s3[1]),s3[0]/Math.sqrt( s3[0]*s3[0]+s3[1]*s3[1])];
				
				Q0 = [p0[0] + (e * n0[0]),p0[1] + (e * n0[1])];
				Q3 = [p3[0] + (e * n3[0]),p3[1] + (e * n3[1])];
				
				A = [3*s0[0]+3*s3[0]-2*(Q3[0]-Q0[0]),3*s0[1]+3*s3[1]-2*(Q3[1]-Q0[1])];
				B = [-6*s0[0]-3*s3[0]+3*(Q3[0]-Q0[0]),-6*s0[1]-3*s3[1]+3*(Q3[1]-Q0[1])];
				C = [3*s0[0],3*s0[1]];
				
				pc = [(1/8)*a[0]+(1/4)*b[0]+(1/2)*c[0] + p0[0],(1/8)*a[1]+(1/4)*b[1]+(1/2)*c[1] + p0[1]];
				
				Qc = [(1/8)*A[0]+(1/4)*B[0]+(1/2)*C[0] + Q0[0],(1/8)*A[1]+(1/4)*B[1]+(1/2)*C[1] + Q0[1]];
				
				dp = [3/4*a[0]+b[0]+c[0],3/4*a[1]+b[1]+c[1]];
				
				dQ = [3/4*A[0]+B[0]+C[0],3/4*A[1]+B[1]+C[1]];
				
				nc = [-dp[1]/Math.sqrt(dp[0]*dp[0]+dp[1]*dp[1]),dp[0]/Math.sqrt(dp[0]*dp[0]+dp[1]*dp[1])];
				
				rc = [pc[0] + e*nc[0], pc[1] + e*nc[1]];
							
				
				s0tnc = matrix_mul(nc,s0);
				
				s3tnc = matrix_mul(nc,s3);
				
				s0_s3 = matrix_sub(s0,s3);
				
				s0_s3tnc = matrix_mul_t(4,s0_s3, nc)
				
				yy0 = 8/3 * (rc[0]-Qc[0])
				yy1 = 8/3 * (rc[1]-Qc[1]) 
				yy2 = matrix_mul_t(4/3,nc, dQ)
				
				
				AA = [
				    [s0[0],-s3[0],8/3 * dp[0]],
				    [s0[1],-s3[1],8/3 * dp[1]],
				    [s0tnc,s3tnc,s0_s3tnc]
				    ];
				
				AA1 = [
				    [yy0,-s3[0],8/3 * dp[0]],
				    [yy1,-s3[1],8/3 * dp[1]],
				    [yy2,s3tnc,s0_s3tnc]
				    ];
				
				AA2 = [
				    [s0[0],yy0,8/3 * dp[0]],
				    [s0[1],yy1,8/3 * dp[1]],
				    [s0tnc,yy2,s0_s3tnc]
				    ];
				    
				AA3 = [
				    [s0[0],-s3[0],yy0],
				    [s0[1],-s3[1],yy1],
				    [s0tnc,s3tnc,yy2]
				    ];
				
				D0 = det(AA);
				D1 = det(AA1);
				D2 = det(AA2);
				D3 = det(AA3);
				if (D0 == 0){
					dk0 = 0;
					dk3 = 0;
					dt = 0;
					
				}else{
					dk0 = D1/D0;
					dk3 = D2/D0;
					dt = D3/D0;
				}
				
								
				R0 = Q0;
				R1 = matrix_add_t(1+dk0,Q0,s0)
				
				R2 = matrix_sub_t(1+dk3,Q3,s3)
				
				R3 = Q3;
				return new Array(R0,R1,R2,R3);
			}
			
			return {execute : execute};
		}
)();


//var xxxx = new Array([5216.5163,-3595.0036],[5232.4573,-3580.7811],[5244.8796,-3568.3712],[5253.282,-3559.6608]);
//alert(parallel_curve.execute(xxxx,10));
