
/**
 * 去空白
 */
String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
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




/**
 * 在 CSV 檔案中新增或更新多筆資料
 * upsert 更新插入
 */
function upsertMultipleToCsvFile(csvFile, dataArray) {
    var csvData = readCsvToObj(csvFile);
	//alert(csvData);
    for (var i = 0; i < dataArray.length; i++) {
        var key = dataArray[i][0];
        var value = dataArray[i][1];
        csvData[key] = value; // 更新或新增資料
		//alert(csvData[key]);
    }
    csvFile.open('w');
    for (var k in csvData) {
		//alert(k);
        if (csvData.hasOwnProperty(k)) {
            csvFile.writeln(k + ";" + csvData[k]);
        }
    }
    csvFile.close();
}



csvFileName = "物件Bounds.csv";
var sel = app.activeDocument.selection[0];
var b = sel.geometricBounds;

var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
var csvFile = new File(pathEnv+"/"+csvFileName);
if(! csvFile.exists){
	var newEntries = [
		["0", b[0]],
		["1", b[1]],
		["2", b[2]],
		["3", b[3]]
	];
	upsertMultipleToCsvFile(csvFile,newEntries);
}else{
	var newEntries = [
		["0", b[0]],
		["1", b[1]],
		["2", b[2]],
		["3", b[3]]
	];
	upsertMultipleToCsvFile(csvFile,newEntries);
}
