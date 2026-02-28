
/**
 * 去空白
 */
String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
}


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
    var file = new File(pathEnv + '/衣服配置檔.csv');
    if (!file.exists) {
        alert(pathEnv + '/衣服配置檔.csv 檔案不存在！請複製 衣服配置檔.csv，再重新執行');
        return null;
    }
    return file;
}

//var file = new File(pathEnv + '/衣服配置檔.csv');

function readClothesData(evnFile,clothesData) {
    var checkboxIndex = -1;
    var file = evnFile;
    //var clothesData = {};
    // 打開檔案進行讀取
    if (file.open('r')) {
        file.readln(); // 讀取並忽略首行（標題行）
        while (!file.eof) {
            var line = file.readln();
            var parts = line.split(';');
            var type = parts[8].trim();
            var size = parts[1].trim();
            if (!clothesData[type]) {
                clothesData[type] = [];
            }
            clothesData[type].push({
                shirtType: type,
                selectedSize: size
            });

        }
        file.close(); // 關閉檔案
    } else {
        alert('無法打開檔案: ' + filePath);
        return;
    }
}


//要先有 allPageItems 作為radioButtons的顯示資料
//clothes_size是按鈕按下所選的radioButton的值

function showGui(allPageItems) {
    //cutPieceGroups = getCutPieceGroups();
    // 創建對話框
    var dialog = new Window('dialog', '尺寸選擇');

    // 獲取螢幕尺寸
    var screenWidth = Screen.width;
    //var screenHeight = Screen.height;
    // 設置對話框的邊界，讓其佔據螢幕的大部分
    //dialog.bounds = [0, 0, screenWidth * 0.9, screenHeight * 0.9];
    // 設置對話框的佈局屬性
    dialog.orientation = 'column';
    dialog.alignChildren = ['fill', 'top'];
    //dialog.maximumSize.width = 1024;

    // 創建主組件
    var mainGroup = dialog.add('group');
    mainGroup.orientation = 'row';
    mainGroup.alignChildren = ['fill', 'fill'];

    //裁切中的裁片內容
    var contentPanel = mainGroup.add('panel', undefined, '尺寸選擇');
    contentPanel.orientation = 'column';
    contentPanel.alignChildren = ['fill', 'fill'];


    // 添加按鈕組
    var buttonGroup = mainGroup.add('panel', undefined, '確定選擇尺寸');
    buttonGroup.orientation = 'row';
    buttonGroup.alignment = ['center', 'bottom'];

    var okButton = buttonGroup.add('button', undefined, '確定', { name: 'ok' });
    var cancelButton = buttonGroup.add('button', undefined, '取消', { name: 'cancel' });
    var radioButtons = [];
    okButton.onClick = function() {
      //alert("okButton.onClick");
      for(var i=0;i<radioButtons.length;i++){
        if(radioButtons[i].value){
          clothes_size = radioButtons[i].text;
        }
      }
      dialog.close();
    }

    cancelButton.onClick = function() {
      dialog.close();
    };

    // 用於存儲尺寸的 checkbox 參考
    for (var i = 0; i < allPageItems.length; i++) {
        var radioButton = contentPanel.add('radiobutton', undefined, allPageItems[i].selectedSize);
        //var checkboxButton = contentPanel.add('checkbox', undefined, allPageItems[i].name);
        radioButtons.push(radioButton);
    }
    dialog.layout.layout(true);
    dialog.show();
}

var clothes_size;

function selectSize(name){
  var clothesData = {};
  var clothesCsvFile = checkForDataCsv();
  readClothesData(clothesCsvFile,clothesData);
  showGui(clothesData[name]);
  return clothes_size;
}
