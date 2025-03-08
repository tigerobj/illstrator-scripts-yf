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


function showGui(filePath,selectedSizes,configObject) {
    var file = new File(filePath);
    var clothesData = {};

    // 打開檔案進行讀取
    if (file.open('r')) {
        file.readln(); // 讀取並忽略首行（標題行）
        while (!file.eof) {
            var line = file.readln();
            var parts = line.split(';');
            if (parts.length >= 14) {
                var type = parts[0].trim();
                var size = parts[1].trim();
                var shirtFront = parts[2].trim();
                var shirtBack = parts[3].trim();
                var shirtSleeve = parts[4].trim();
                var shirtCollar = parts[5].trim();
                var background = parts[6].trim();
                var dxfLocation = parts[7].trim();
                var ChestWidth = parts[8].trim();
                var ChestHeight = parts[9].trim();
                var ChestWidthRatio = parts[10].trim();
                var ChestHeightRatio = parts[11].trim();
                var clothTemplatePath = parts[12].trim();
                var blankTemplate = parts[13].trim();

                if (!clothesData[type]) {
                    clothesData[type] = [];
                }
                clothesData[type].push({
                    shirtType: type,
                    selectedSize: size,
                    shirtFront: shirtFront,
                    shirtBack: shirtBack,
                    shirtSleeve: shirtSleeve,
                    shirtCollar: shirtCollar,
                    background: background,
                    dxfLocation: dxfLocation,
                    ChestWidth: ChestWidth,
                    ChestHeight: ChestHeight,
                    ChestWidthRatio: ChestWidthRatio,
                    ChestHeightRatio: ChestHeightRatio,
                    clothTemplatePath: clothTemplatePath,
                    blankTemplate: blankTemplate
                });
            }
        }
        file.close(); // 關閉檔案
    } else {
        alert('無法打開檔案: ' + filePath);
        return;
    }

    // 創建對話框
    var dialog = new Window('dialog', '選擇衣服及尺寸');

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

    // 左側面板：衣服類型
    var leftPanel = mainGroup.add('panel', undefined, '衣服類型');
    leftPanel.orientation = 'column';
    leftPanel.alignChildren = ['fill', 'top'];
    leftPanel.maximumSize.width = 200;

    var radioButtons = {};

    var shirtTypes = getKeys(clothesData);

    // 右側面板：尺寸
    var rightPanel = mainGroup.add('panel', undefined, '尺寸');
    rightPanel.orientation = 'column';
    rightPanel.alignChildren = ['fill', 'top'];
    //rightPanel.minimumSize.width = 776;

    // 用於存儲尺寸的 checkbox 參考
    var sizeCheckboxes = [];

    for (var i = 0; i < shirtTypes.length; i++) {
        var type = shirtTypes[i];
        var radioButton = leftPanel.add('radiobutton', undefined, type);
        radioButtons[type] = radioButton;

        radioButton.onClick = function() {
            var shirtType = this.text;

            // 清除之前的尺寸 checkbox
            for (var j = 0; j < sizeCheckboxes.length; j++) {
                sizeCheckboxes[j].parent.remove(sizeCheckboxes[j]);
            }
            sizeCheckboxes = [];

            var sizes = clothesData[shirtType];

            for (var k = 0; k < sizes.length; k++) {
                var sizeData = sizes[k];
                var checkbox = rightPanel.add('checkbox', undefined, sizeData.selectedSize);
                checkbox.value = true; // 預設未選中
                checkbox.sizeData = sizeData; // 將尺寸資料存入 checkbox
                sizeCheckboxes.push(checkbox);
            }

            dialog.layout.layout(true); // 重新佈局
        };
    }

    // 預設選中第一個衣服類型
    if (shirtTypes.length > 0) {
        radioButtons[shirtTypes[0]].value = true;
        radioButtons[shirtTypes[0]].notify('onClick');
    }

    // 添加檔案選擇組
    var fileSelectGroup = dialog.add('group');
    fileSelectGroup.orientation = 'row';
    fileSelectGroup.alignChildren = ['left', 'center'];
    fileSelectGroup.alignment = ['fill', 'top'];

    // 添加描述文字
    var infoText = fileSelectGroup.add('statictext', undefined, '請選擇一個示意圖檔案:');
    infoText.alignment = ['left', 'center'];

    // 添加文字框顯示所選的檔案路徑
    var filePathText = fileSelectGroup.add('edittext', undefined, '', { readonly: false });
    filePathText.characters = 60;
    filePathText.text = configObject["示意圖路徑"]+"/"+configObject["示意圖名稱"];
    filePathText.alignment = ['fill', 'center'];

    // 添加檔案選擇按鈕
    var fileSelectBtn = fileSelectGroup.add('button', undefined, '瀏覽...');
    fileSelectBtn.alignment = ['right', 'center'];
	var initialPathFile = new File(configObject["示意圖路徑"]+"/"+configObject["示意圖名稱"]);
    fileSelectBtn.onClick = function() {
        var selectedFile = initialPathFile.openDlg("請選擇一個示意圖檔案", "*.ai");
        if (selectedFile != null) {
            filePathText.text = selectedFile.fsName;
        }
    };

    // 添加按鈕組
    var buttonGroup = dialog.add('group');
    buttonGroup.orientation = 'row';
    buttonGroup.alignment = ['center', 'bottom'];

    var okButton = buttonGroup.add('button', undefined, '確定', { name: 'ok' });
    var cancelButton = buttonGroup.add('button', undefined, '取消', { name: 'cancel' });

    okButton.onClick = function() {
        // 收集選擇的尺寸資料
        for (var i = 0; i < sizeCheckboxes.length; i++) {
			if(sizeCheckboxes[i].value){
				selectedSizes.push(sizeCheckboxes[i].sizeData);
			}
        }

        if (selectedSizes.length === 0) {
            alert("請至少選擇一個尺寸。");
            return;
        }
        
        if("" === filePathText.text.trim()){
			alert("請選擇套版檔案。");
			return;
		}

        // 在這裡處理 selectedSizes 陣列，例如進行後續操作
		selectFilePathText = filePathText.text;
        dialog.close(); // 關閉對話框
    };

    cancelButton.onClick = function() {
        dialog.close();
    };

    //dialog.left();
    dialog.layout.layout(true);
    dialog.show();
}


