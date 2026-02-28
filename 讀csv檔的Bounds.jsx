#include "對齊置中.jsx";

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

function getBounds2(b0,b1,b2,b3) {
		return {
				left: b0,
				top: b1,
				right: b2,
				bottom: b3,
				width: (b2 - b0),
				height: (b1 - b3),
				centerX: (b0 + b2) / 2,
				centerY: (b1 + b3) / 2
		};
}

function autoCenterXYByBoundsB(b0,b1,b2,b3,itemB){
      targetBounds = getBounds2(b0,b1,b2,b3);
      selectedBounds = getBounds(itemB);
      x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
      y = (targetBounds.top -selectedBounds.top)-(targetBounds.height - selectedBounds.height)/2;
      //selectedItem.translate(x,y);
      //alert("已將選取物件對齊至置中");
      return{
        left:x,
        top:y
      }
}

/**
 * 取得環境變數中的 CSV 檔案，並讀取成物件
 */
function getEnvCsvFile(csv){
	return new readCsvToObj(File($.getenv('CLOTH_TEMPLATE_CONFIG_PATH')+"/"+csv));
}

csvFileName = "物件Bounds.csv";

ItemBounds =  getEnvCsvFile(csvFileName);


var itemB = app.activeDocument.selection[0];

t =  autoCenterXYByBoundsB(ItemBounds["0"],ItemBounds["1"],ItemBounds["2"],ItemBounds["3"],itemB);

itemB.translate(t.left,t.top);
