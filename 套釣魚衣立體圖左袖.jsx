#include "json2.js";
#include "對齊置中.jsx";


/**
 * 自訂字串的 trim()，清除字串前後的空白字元
 * ExtendScript 早期沒有原生 trim()，因此自行定義。
 */
String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
}

/**
 * 📌 判斷是否存在釣魚衣的旋轉設定 CSV 檔（衣服配置檔）
 *
 * ExtendScript 使用系統環境變數 CLOTH_TEMPLATE_CONFIG_PATH
 * 此資料夾應放置：
 *   - 旋轉-釣魚衣.csv
 *   - 或你後續需要的尺寸/配置資料
 *
 * @returns {File|null}
 *          若找到 → 回傳 File 物件
 *          若找不到 → alert 並回傳 null
 */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
		var file = new File(pathEnv + '/旋轉-釣魚衣.csv');
    if (!file.exists) {
        alert(pathEnv + '/衣服配置檔.csv 檔案不存在！請複製 衣服配置檔.csv，再重新執行');
        return null;
    }
    return file;
}


/**
 * 讀取csv值,儲存成key,value物件值.
 * key為第一欄
 * values為第二欄
 */
 /**
 * 📌 讀取 CSV 檔案，轉成 key → value 的物件結構
 *
 * CSV 結構格式預期為：
 *   key ; value
 *   或
 *   key , value
 *
 * 用途：
 *   - 用於載入「旋轉-釣魚衣.csv」中的前點 / 後點 / 斜率資料
 *
 * @param {File} csvFile - ExtendScript File 物件
 * @returns {Object}     - 回傳 { key: value , ... }
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
	csvFile.close();
	return obj;


}


function maskImageToSleeve(name){
	a = getPathItemByLayer("縫份","左袖");
	b = getGroupByTwoLevel("圖層 5", "外觀", name);

	position = autoCenterXY(a, b);
	item = getGroupByLevel("圖層 5", name+"套圖").duplicate();
	item.translate(position.left,position.top);
}


maskImageToSleeve("左袖");
