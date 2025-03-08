/**
 * 判斷當前目錄下是否存在名為 'clothes.csv' 的檔案
 * 
 * @returns {File} - 如果找到 'clothes.csv' 則返回檔案物件，否則返回 null
 */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    if (pathEnv === null) {
        alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
        return null;
    }
    var file = new File(pathEnv + '/clothes.csv');
    if (!file.exists) {
        alert(pathEnv + '/clothes.csv 檔案不存在！請複製 clothes.csv，再重新執行');
        return null;
    }
    return file;
}



function getKeys(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}





