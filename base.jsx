const FONT_NUM = 2;
const FONT_EN = 1;
const FONT_ZH = 0;
const FONT_OTHER = -1;


//對Date的擴充套件，將 Date 轉化為指定格式的String
//月(M)、日(d)、小時(h)、分(m)、秒(s)、季度(q) 可以用 1-2 個佔位符，
//年(y)可以用 1-4 個佔位符，毫秒(S)只能用 1 個佔位符(是 1-3 位的數字)
//例子：
//(new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
//(new Date()).format("yyyy-M-d hⓜ️s.S") ==> 2006-7-2 8:9:4.18
Date.prototype.format = function(fmt) {
	var o = {
		"M+" : this.getMonth() + 1, // 月份
		"d+" : this.getDate(), // 日
		"h+" : this.getHours(), // 小時
		"m+" : this.getMinutes(), // 分
		"s+" : this.getSeconds(), // 秒
		"q+" : Math.floor((this.getMonth() + 3) / 3), // 季度
		"S" : this.getMilliseconds()
	// 毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	for ( var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
					: (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}


Date.prototype.addSeconds = function(seconds) {
	this.setSeconds(this.getSeconds() + seconds);
	return this;
}

Date.prototype.addMinutes = function(minutes) {
	this.setMinutes(this.getMinutes() + minutes);
	return this;
}

Date.prototype.addHours = function(hours) {
	this.setHours(this.getHours() + hours);
	return this;
}

Date.prototype.addDays = function(days) {
	this.setDate(this.getDate() + days);
	return this;
}

Date.prototype.addMonths = function(months) {
	this.setMonth(this.getMonth() + months);
	return this;
}

Date.prototype.addYears = function(years) {
	this.setFullYear(this.getFullYear() + years);
	return this;
}

function diffSeconds(milliseconds) {
	return Math.floor(milliseconds / 1000);
}

function diffMinutes(milliseconds) {
	return Math.floor(milliseconds / 1000 / 60);
}

function diffHours(milliseconds) {
	return Math.floor(milliseconds / 1000 / 60 / 60);
}

function diffDays(milliseconds) {
	return Math.floor(milliseconds / 1000 / 60 / 60 / 24);
}


/**
 * 判斷文字是否為中文,英文,數字
 * @param {string} str
 * @return {number} FONT_NUM,FONT_EN,FONT_ZH,FONT_OTHER
 *
 */
function fondKing(str){
	var zh = /^[\u0391-\uffe5\s]+$/i;
	var en =  /^[a-zA-Z\s]+$/i;
	var num = /^[0-9\s]*$/i;

	if(zh.test(str)){
		return FONT_ZH;
	}else if(en.test(str)){
		return FONT_EN;
	}else if(num.test(str)){
		return FONT_NUM;
	}else{
		return FONT_OTHER;
	}
}

/**
 * 去空白
 * @param {string} str
 * @return {string}
 */

function trim (str) {
  return str.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');

}

String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');

}

/**
 * 將pageItems陣列用itme名字綁定成物件. obj.name = obj.
 * @param {array} array
 * @return {obj} 物件
 */
function nameBindObj(array){
	var obj = new Object();
	for(var i =0 ;i<array.length;i++){
		obj[array[i].name] = array[i];
	}
	return obj;
}

/**
 * 字體物件
 */
var font={
		no:'',
		family:''
}

/**
 * 指定字體編號從指定字體陣列回傳字型family值
 * @param {fonts} 字體陣列
 * @param {string} 字體編號
 * @return {string} family
 */
function searchFontFamily(fonts,value){
	for(var i=0;i<familys.length;i++){
		if(Number(familys[i].no) == Number(value)){
			//alert(familys[i].family);
			return familys[i].family;
		}
	}
}


/**
 * 以font q物件為元素的陣列
 * enFamilys陣列,英文字體陣列.
 * zhFamilys陣列,中文字體陣列.
 * numberFamilys陣列,數字字體陣列.
 */
var fontFamilys = {
	enFamilys:[],
	zhFamilys:[],
	numberFamilys:[]
}

/**
 * 顏色區塊物件
 *
 */
var cb = {
	no:'',
	name:'',
	fullName:'',
	cmykValue:'',
	ColorType:''
}


/**
 * 客製化物件
 * colorBlockList,以cb 為陣列元素
 */
var exportObj = {
	colorBlockList:[],
	numberValue:'',
	TNValue:'',
	BNValue:'',
	TeamName:'',
	Name:'',
	BN:'',
	FN:'',
	FN2:''
}

/**
 * 客製化物件
 */
var custValue =  {
	colorObject:new Object(),
	numberValue:'',
	TNValue:'',
	BNValue:'',
	TeamName:'',
	Name:'',
	BN:'',
	FN:'',
	FN2:''
}


/**
 * 指定csv路徑檔 ex:"new File(D:/開發/熱昇華圖檔/簡單K/測試用/cmyk.csv)"
 * 寫入的內容
 * @param {File} 指定csv檔案
 * @param {string} content檔案內容
 */
function writeFile(csv,content){
	var cvsFile = csv;
	cvsFile.open('w');
	cvsFile.encoding = "utf-8";
	cvsFile.write(content);
	cvsFile.close();
}

/**
 * 色塊名稱編號取出編號,例如cmyk名稱編號 -> 錫灰色\n(12) 回傳12
 * @param {string} contents cmyk名稱編號 -> 錫灰色\n(12)
 * @return {number} 回傳編號->12
 */
function cmykNameTONo(contents){
	splitStr = contents.split(/\r?\n|\r|\n/g);
	return Number(splitStr[1].substring(splitStr[1].indexOf("\(")+1,splitStr[1].indexOf("\)")));
}

/**
 * 色塊名稱編號取出名稱,例如cmyk名稱編號 -> 錫灰色\n(12) 回傳錫灰色
 * @param {string} contents cmyk名稱編號 -> 錫灰色\n(12)
 * @return {number} 回傳名稱->錫灰色
 */
function cmykNameTOName(contents){
	splitStr = contents.split(/\r?\n|\r|\n/g);
	return splitStr[0];
}


/**
 * 將文字cmyk(0,40,100,0)轉成cmyk物件
 * @param {string} sourceTextContent -> cmyk(0,40,100,0)
 * @return {color} 顏色物件
 */
function getCmykColor(sourceTextContent){
	var s = sourceTextContent.substring(5, sourceTextContent.length-1);
	var c = s.split(",");
	var cmykColor = new CMYKColor();
	cmykColor.cyan = c[0];
	cmykColor.magenta = c[1];
	cmykColor.yellow = c[2];
	cmykColor.black = c[3];
	return cmykColor;
}

/**
 *  如果資料夾不存在就建立資料夾
 * @param {boolean} isParent , 是否回上一層目錄
 * @param {string} folderName , 建立資料夾名稱
 * @return {Folder} 回傳資料夾
 */
function createFolder(isParent,folderName){
	return createFolder(isParent,folderName,fullName);
}

/**
 *  如果資料夾不存在就建立資料夾
 * @param {boolean} isParent , 是否回上一層目錄
 * @param {string} folderName , 建立資料夾名稱
 * @return {Folder} 回傳資料夾
 */
function createFolder(isParent,folderName,fullName){
	var fullName = decodeURI(app.activeDocument.fullName);
	var num = fullName.lastIndexOf("/");
	var parent = "";
	if(isParent){
		parent="../";
	}
	var destFile = fullName.substring(1,2)+":"+fullName.substring(2,num)+"/"+parent+folderName;
	var dir = new Folder(destFile);
	if(!dir.exists){
		dir.create ();
		alert("建立目錄 : "+destFile);
	}
	return destFile;
}



/**
 * 目前檔案所在的目錄
 */
function getActiveFolder(){
	var fullName = decodeURI(app.activeDocument.fullName);
	return getActiveFolder(fullName);
}


/**
 * 目前檔案所在的目錄
 */
function getActiveFolder(fullName){
	var file = new File(fullName);
	return file.parent.displayName;
}

/**
 * 檔案名稱沒有副檔名
 */
function getActiveName(){
	var fullName = decodeURI(app.activeDocument.fullName);
	return getActiveName(fullName);
}

/**
 * 檔案名稱沒有副檔名
 */
function getActiveName(fullName){
	var file = new File(fullName);
	var str  = file.displayName;
	var num = str.lastIndexOf(".");
	return str.substring(0,num);
}


/**
 *
 */
function createFolderByFolderPath(folder){
	var str = folder+"/"+new Date().format("yyyy-MM-dd");

	var dir = new Folder(str);
	if(!dir.exists){
		dir.create ();
		alert("建立目錄 : "+str);
	}
	return str;
}

/**
 *
 */
function createFolderByDateName(){
	var str = new Date().format("yyyy-MM-dd")+"/"+getActiveFolder()+"/"+getActiveName();
	dest = createFolder(true,str)
	return dest;
}


function createFolderByOutJpg(){

	//isParent,folderName
	var str = getActiveFolder()+"_輸出照片";
	dest = createFolder(true,str);
	return dest;
}

/**
 * yyMMdd-nn
 * yy-MM-dd_nnn
 * yyMMddnnn
 * %name%nn
 *
 * %img%nnn
 * 005img005
 */
function getLastNum(fmt,src){
	//1.先取代img
	//text.replace
	//str.indexOf("%, 15);

}

/**
 * 指定長度補字元,如果超過字元自動截斷函
 * @param {int} 指定長度.
 * @param {string} 字元,可以任意字元,通常是補0,所以用'0'
 * @return {String} 回傳字串
 */
String.prototype.padStart = function(len,chart) {
	var str="";
	if(len > this.length){
		for(var i=0 ;i<len - this.length;i++){
			str = str+chart;
		}
		return str+this;
	}

	if(len<this.length){
		return this.substr(this.length-len,len);
	}
	return this;
}

/**
 *  將格式化文字轉成陣列
 * 	var fmtTestStr = "nnyyddnnn%訂單%yy_MM#dd%img%nnn%test%nnn%xxx%MMdd%okok%nMM-ddnnnnnn";
 *	var fmts = paserFmtToArray.execute(fmtTestStr);
 */

var paserFmtToArray = (

		function init() {

			function paserFmt(str){
				var count = (str.match(/%/g) || []).length;
				nums = [];
				strs = [];
				fmts = [];
				var subStr;
				var tmp
				var startIndex=0;

//				if(count === 0){
//					paserNNN(fmts,fmts);
//					return fmts;
//				}

				for(var i=0;i<count/2;i++){
					n1 = str.indexOf("%",startIndex);
					n2 = str.indexOf("%",n1+1);
					nums.push(n1);
					nums.push(n2);
					strs.push(str.substring(n1+1,n2));
					startIndex = n2+1;
				}


				if(count === 0){
					strs.push(str);
				}



				for(var i=0;i<strs.length;i++){
					if(i == 0 ){
						tmp = str.split("%"+strs[i]+"%");
					}else{
						tmp = subStr.split("%"+strs[i]+"%");
					}
					if(tmp[0] != ""){
						paserNNN(fmts,tmp[0]);
						//alert(tmp[0]);
					}
					if(count !== 0){
					fmts.push(strs[i]);
					subStr = tmp[1];

						if(i == strs.length-1 && tmp[1].length>0){
							paserNNN(fmts,tmp[1]);
						}
					}
				}
				//alert(fmts);
				return fmts;
			}


			/**
			 * nnyyddnnn
			 */
			function paserNNN(fmts,contens){
				var re = /n+/g;
				var found = contens.match(re);
				var tmp2;
				var subStr2;
				if(found == null){
					fmts.push(contens);
					return;
				}

				if((found.length === 1) && (found[0].length === contens.length)){
					fmts.push(contens);
					return;
				}
				for(var i=0;i<found.length;i++){
					if(i === 0){
						tmp2 = contens.split(found[i]);
					}else{
						tmp2 = subStr2.split(found[i]);
					}

					if(tmp2[0] != ""){
						fmts.push(tmp2[0]);
					}
					fmts.push(found[i]);
					subStr2 = tmp2[1];

					if(typeof tmp2[1] == 'undefined'){
						continue;
					}
					if((i === found.length-1) && (tmp2[1].length>0)){
						fmts.push(tmp2[1]);
					}
				}
			}


			function execute(fmtStr){
				//var fmtStr = "nnyyddnnn%訂單%yy_MM#dd%img%nnn%test%nnn%xxx%MMdd%okok%nMM-ddnnnnnn";

				return paserFmt(fmtStr);

			}

			return {execute : execute};
		}
)();



/**
 * 傳入 格式化分解list 如yyMMdd-nnn -> [yyMMdd-,nnn]與值 value 例如221010-001 ,自動加1
 */
var numberPlusOne = (

		function init() {

			function execute(list,value){
				var startIndex = 0;
				var plusOneValue = "";
				var numStr="";
				for(var i=0;i<list.length;i++){
					//alert(list[i]);
					if (list[i].indexOf("n") >= 0){

						//alert("value : "+value+", startIndex = "+startIndex+" ,list["+i+"].length = "+list[i].length);
						numStr = value.substr(startIndex, list[i].length);
						//alert(numStr);
						n = Number(numStr)+1;
						//alert(n);
						plusOneValue = plusOneValue+n.toString().padStart(list[i].length, '0');
					}else{
						plusOneValue = plusOneValue+value.substr(startIndex, list[i].length);
					}

					startIndex = startIndex+list[i].length;
				}
				return plusOneValue;
			}
			return {execute : execute};
		}
)();

//test run
//var tsetlist = paserFmtToArray.execute("yyMMdd-nnn");
//alert(numberPlusOne.execute(tsetlist,"221009-005"));

/**
 * 依照格式化字串,自動編號,如果有日期整式會自動判斷是否有今天日期
 * 要搭配paserFmtToArray.execute(fmtTestStr);使用
 */
var autoCode = (

		function init() {



			function paserValue(fmts,value){
				var start = 0;
				var szie = 0;
				var values = [];
				for(var i=0;i<fmts.length;i++){
					size = fmts[i].length;
					values[i] = value.substr(start,size);

					start = start+(size);
				}
				return values;
			}


			function plusOne(fmts,value){
				var list = paserFmtToArray.execute(fmts);
				return numberPlusOne.execute(list,value);
			}

			function valueListToStr(fmts){
				var str = "";
				for(var i=0;i<fmts.length;i++){
					str = str+fmts[i];
				}
				return str;

			}

			function newValue(fmts,value){

				//paserFmtToArray
				//alert(fmts);
				var list = paserFmtToArray.execute(fmts);

				if(list.length === 0){
					throw "paserFmtToArray.execute("+fmts+") 解析"+fmts+"錯誤";
				}
				for(var i=0;i<list.length;i++){
					//alert(list[i]);

					if(list[i].indexOf("n") >= 0){
						list[i] = "1".padStart(list[i].length, '0');
					}

					if (/^[yMd\s]+/.test(list[i])){
						//alert("/^[yMd\s]+/");
						list[i] = new Date().format(list[i]);
					}
				}

				return valueListToStr(list);
			}

			/**
			 * todo
			 */
			function isToday(fmts,value){

				var list = paserFmtToArray.execute(fmts);
				if(list.length === 0){
					throw "paserFmtToArray.execute("+fmts+") 解析"+fmts+"錯誤";
				}
				//alert(list);
				var startIndex = 0;
				var fmtsValue = "";
				for(var i=0;i<list.length;i++){
					if (/^[yMd\s]+/.test(list[i])){
						fmtsValue = fmtsValue+new Date().format(list[i]);
					}else{
						fmtsValue = fmtsValue+value.substr(startIndex, list[i].length);
					}

					startIndex = startIndex+list[i].length;
				}
				if(value === fmtsValue){
					//alert("is today");
					return true;
				}else{
					return false;
				}
			}

			function execute(fmts,value){
				var isNew = false;
				if(typeof value === 'undefined'){
					isNew = true;
				}else if(value == ""){
					isNew = true;
				}else if(isToday(fmts,value) !== true){
					isNew = true;
				}

				if(isNew){
					//alert("isNew");
					return newValue(fmts,value);
				}else{

					return plusOne(fmts,value);
				}

			}

			return {execute : execute};
		}
)();


//autoCode

//alert("my: "+autoCode.execute("yyMMdd-nnn","221010-005"));

//alert("my: "+autoCode.execute("yyMMdd-nnn"));



//autoCode.execute("yyMMdd-nnn","221010-005")
/**
 *
 * fmt = "yyMMdd-nnn";
 * dir = new File("D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/build);
 * extension = "ai";
 * last = findLastFileName(fmt,dir,extension);
 * autoCode.execute(fmt,last);
 *
 */
function findLastFileName(fmt,buildPath,extension){

	dir = new Folder(buildPath);
	//alert(dir.displayName+"/*."+extension);
	var files = dir.getFiles();
	//alert(buildPath+"/*."+extension);
	//alert(files.length);
	//var num = str.lastIndexOf(".");
	//str.substring(0,num);
	if(files.length > 0){
		//file.displayName;
		//getActiveName
		var tmpList=[];
	    var value="";
	    var fileExtension="";
		for(var i=0;i<files.length;i++){
			num = files[i].displayName.lastIndexOf(".");
			fileExtension = files[i].displayName.substring(num+1,files[i].displayName.length);
			//alert(fileExtension);
			if(fileExtension == extension){
				//
				//alert(files[i].displayName);
				tmpList.push(getActiveName(files[i].displayName));
			}

			tmpList.sort();
		}
		value = tmpList[tmpList.length - 1];
		//alert(value);
		return value;
	}else{
		return "";
	}
}



function fillColorToStr(cmykcolor){
	return "cmyk("+cmykcolor.cyan+","+cmykcolor.magenta+","+cmykcolor.yellow+","+cmykcolor.black+")";
}

/**
 * 讀取csv值,儲存成key,value物件值並將加入arrayList,第一列為key,之後每一列為物件的值.
 * 然後將加入陣列.
 * 使用如下: 範本路徑就是key, value就從陣列中指定key得到值
 * myObjectArray = readValues(new File("D:/開發/客戶圖檔/杰優、裕豐工廠產品/崴丞/目錄路徑.csv"));
 * for(i=0;i<myObjectArray.length;i++){
 *   value = myObjectArray[i]["範本路徑"];
 * }
 */
function readCsvValues(csvFile){
	var arrayList =[];
	var n = 0;
	csvFile.open('r');
	while (s = csvFile.readln()) {
        //第一列為key
		if (n == 0){
			keys = s.split(';');
			if(keys.length ==1){
                          keys = s.split(',');
                          if(keys.length ==1){
                            alert("檔案分隔符號有問題請檢查檔案");
                          }
			}
		}else{
			var obj = new Object();
			values = s.split(';');
			if(values.length ==1){
                          values  = s.split(',');
                          if(values .length ==1){
                            alert("檔案分隔符號有問題請檢查檔案");
                          }
			}



			for(var i = 0;i<keys.length;i++){
				//
				obj[keys[i]] = values[i];
			}
			arrayList.push(obj);
		}
		n++;
	}
	csvFile.close();
	return arrayList;
}

/**
 * 讀取csv值,儲存成key,value物件值.
 * key為第一欄
 * values為第二欄
 */
function readCsvToObj(csvFile){
	csvFile.open('r');
	var obj = new Object();
	while (s = csvFile.readln()) {
		kv = s.split(';');
		if(kv.length ==1){
			kv = s.split(',');
			if(kv.length ==1){
				alert("檔案分隔符號有問題請檢查檔案");
			}
		}
		obj[kv[0]] = kv[1];
	}
	return obj;
	csvFile.close();

}


function mm(n) {
  return n * 2.83464567;
}

function cm(n) {
  return n * 28.3464567;
}

function m(n) {
  return n * 283.464567;
}

function inch(n) {
  return n * 72;
}

function foot(n) {
  return n * 864;
}

function p2mm(n) {
  return n / 2.83464567;
}

function p2cm(n) {
  return n / 28.3464567;
}

function p2m(n) {
  return n / 283.464567;
}

function p2inch(n) {
  return n / 72;
}

function p2foot(n) {
  return n / 864;
}

function rect2mm(rect){
	return [p2mm(rect[0]),p2mm(rect[1]),p2mm(rect[2]),p2mm(rect[3])];
}

function rect2cm(rect){
	return [p2cm(rect[0]),p2cm(rect[1]),p2cm(rect[2]),p2cm(rect[3])];
}

function round(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

function rect2cm(rect){
	var p1 = round(p2cm(rect[0]));
	var p2 = round(p2cm(rect[1]));
	var p3 = round(p2cm(rect[2]));
	var p4 = round(p2cm(rect[3]));

	return [p1,p2,p3,p4];
}

function objectToString (obj) {
    var str = '';
    var i=0;
    var xxx = false;
    for (var key in obj) {

    	if(key == 'parent'){
        	continue;
        }

    	try {
	        if (obj.hasOwnProperty(key)) {
	            if(typeof obj[key] == 'object')
	            {
	                if(obj[key] instanceof Array)
	                {
	                	str+= key + ' : [ ';
	                    for(var j=0;j<obj[key].length;j++)
	                    {
	                        if(typeof obj[key][j]=='object') {
	                            str += '{' + objectToString(obj[key][j]) + (j > 0 ? ',' : '') + '}';
	                        }
	                        else
	                        {
	                            str += '\'' + obj[key][j] + '\'' + (j > 0 ? '' : ','); // non
																						// objects
																						// would
																						// be
																						// represented
																						// as
																						// strings
	                        }
	                    }
	                    str+= ']' + (i > 0 ? ',' : '')
	                }
	                else
	                {
	                    str += key + ' : { ' + objectToString(obj[key]) + '} ' + (i > 0 ? ',' : '');
	                }
	            }
	            else {

	                str +=key + ':\'' + obj[key] + '\'' + (i > 0 ? '' : '');
	                xxx = true;
	            }
	            i++;
	            if(xxx){
	            	str += "\n";
	            	xxx= false;
	            }else{
	            	if("," != str.slice(-1)){
	            		str += ",";
	            	}
	            }

	        }
    	}
    	catch (e) {

    	}

    }
    return str;
}

function copyText(text){
	var tempObj = app.activeDocument.pathItems.add(); // create some temporary object

	var myText = app.activeDocument.textFrames.add(); // create the text frame

	myText.contents = text;

	tempObj.selected = true; // select the temporary object first -- it is important part!

	myText.selected = true; // <--- suprise! now you can select the text frame just like any other object

	tempObj.remove(); // delete the temporary object

	app.copy(); // voilá

	myText.remove();

}

function forEach(collection, fn) {
  for (var i = 0; i < collection.length; i++) {
    fn(collection[i]);
  }
}


function angleDegrees(centerX,centerY,ax,ay,bx,by){
	var vectorA = {
	    x: ax - centerX,
	    y: ay - centerY
	};
	var vectorB = {
	    x: bx - centerX,
	    y: by - centerY
	};
	var dotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
	var lengthA = Math.sqrt(vectorA.x * vectorA.x + vectorA.y * vectorA.y);
	var lengthB = Math.sqrt(vectorB.x * vectorB.x + vectorB.y * vectorB.y);
	var angleRadians = Math.acos(dotProduct / (lengthA * lengthB));
	var result = angleRadians * (180 / Math.PI);
	return result;
}
