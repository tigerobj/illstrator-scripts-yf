
/**
 * 判斷當前目錄下是否存在名為 'data.csv' 的檔案
 * 
 * @returns {file} - 如果找到 'data.csv' 則返回 true，否則返回 false
 */
function checkForDataCsv() {
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    //alert(pathEnv);
    if(pathEnv === null){
		alert("請設定環境變數 CLOTH_TEMPLATE_CONFIG_PATH");
		return null;
	}
    // 使用範例：檢查當前工作目錄下是否有 'data.csv'
	
	var file = new File(pathEnv + '/clothes.csv');
	if (! file.exists) {
	    alert(pathEnv + '/clothes.csv 檔案不存在！ ,請複製clothes.csv,再重新執行');
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

function showGui(filePath){

	//csvfilePath = "D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2/data.csv";
	
	// 指定 CSV 檔案路徑
	//var filePath = "D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2/clothes.csv";  // 修改為實際檔案路徑
	var file = new File(filePath);
	var clothesData = {};
	
	// 打開檔案進行讀取
	if (file.open('r')) {
	    file.readln(); // 讀取並忽略首行（標題行）
	    while (!file.eof) {
	        var line = file.readln();
	        //alert("line:"+line);
	        var parts = line.split(';');
	        if (parts.length >= 2) {
	            var type = parts[0].trim();
	            var size = parts[1].trim();
	            shirtFront = parts[2].trim();
	            shirtBack = parts[3].trim();
	            shirtSleeve = parts[4].trim();
	            shirtCollar = parts[5].trim();
	            background = parts[6].trim();
	            dxfLocation = parts[7].trim();
	            ChestWidth = parts[8].trim();
	            ChestHeight = parts[9].trim();
	            ChestWidthRatio = parts[10].trim();
	            ChestHeightRatio = parts[11].trim();
	            clothTemplatePath = parts[12].trim();
	            blankTemplate = parts[13].trim();
	            
	            if (!clothesData[type]) {
	                clothesData[type] = []; 
	            }
	            clothesData[type].push({
					shirtType:type,
					selectedSize:size,
					shirtFront:shirtFront,
					shirtBack:shirtBack,
					shirtSleeve:shirtSleeve,
					shirtCollar:shirtCollar,
					background:background,
					dxfLocation:dxfLocation,
					ChestWidth:ChestWidth,
					ChestHeight:ChestHeight,
					ChestWidthRatio:ChestWidthRatio,
					ChestHeightRatio:ChestHeightRatio,
					clothTemplatePath:clothTemplatePath,
					blankTemplate:blankTemplate});
	        }
	    }
	    file.close(); // 關閉檔案
	} else {
	    alert('無法打開檔案: ' + filePath);
	}
	
	// 創建對話框
	var dialog = new Window('dialog', '選擇衣服及尺寸');
	var mainGroup = dialog.add('group');
	mainGroup.orientation = 'row';
	
	var leftPanel = mainGroup.add('panel', undefined, '衣服類型');
	var radioButtons = {};
	
	var shirtTypes = getKeys(clothesData);
	
	
	for (var i = 0; i < shirtTypes.length; i++) {
	    var type = shirtTypes[i];
	    var radioButton = leftPanel.add('radiobutton', undefined, type);
	    radioButtons[type] = radioButton;
	    radioButton.onClick = function() {
			shirtType = this.text;
	        sizeList.removeAll();
	        var sizes = clothesData[shirtType];
	        for (var i = 0; i < sizes.length; i++) {
	        	var entry = sizeList.add('item', sizes[i].selectedSize);
	        	entry.value = sizes[i];
	    	}
	    	sizeList.selection = 0;
	    };
	}
	
	var rightPanel = mainGroup.add('panel', undefined, '尺寸');
	var sizeList = rightPanel.add('listbox', undefined, undefined, {
		multiselect: false,
		numberOfColumns: 2,
		showHeaders: true,
		columnTitles: ['尺寸', 'ValueArray'],
		columnWidths: [100, 100]	
	});
	
	if (shirtTypes.length > 0) {
	    radioButtons[shirtTypes[0]].notify('onClick');
	}
	

    // 添加一個檔案選擇按鈕和路徑顯示框，並讓按鈕顯示在右邊
    var fileSelectGroup = dialog.add('group');
    fileSelectGroup.orientation = 'row'; // 設定為水平佈局
    fileSelectGroup.alignChildren = 'left'; // 將所有子元件靠左對齊
	
	// 添加描述文字
	var infoText = fileSelectGroup.add('statictext', undefined, '請選擇一個示意圖檔案:');
	
	// 添加一個文字框顯示所選的檔案路徑
	var filePathText = fileSelectGroup.add('edittext', undefined, '', { readonly: false });
	filePathText.characters = 80;  // 設置輸入框的寬度
	selectedValues = sizeList.selection.value;
	filePathText.text = selectedValues.clothTemplatePath+"/生日快樂_套版.ai";
	selectFilePathText = filePathText.text;
	var initialPathFile = new File(selectedValues.clothTemplatePath+"/生日快樂_套版.ai");
	// 添加一個檔案選擇按鈕
	var fileSelectBtn = fileSelectGroup.add('button', undefined, '瀏覽...');
	
	
	// 當按下 "瀏覽" 按鈕時，彈出檔案選擇對話框
	fileSelectBtn.onClick = function() {
	    // 打開文件選擇器，允許選擇所有類型的檔案
	    if (initialPathFile.exists) {
		    selectedValues = sizeList.selection.value;
		    initialPathFile.openDlg("請選擇一個示意圖檔案","*.ai");
		    
		    // 如果使用者選擇了檔案，則顯示其路徑
		    if (initialPathFile != null) {
		        filePathText.text = initialPathFile.fsName;
		        selectFilePathText = filePathText.text;
		    }
	    }
	};
	
	
	
	
	var okButton = dialog.add('button', undefined, '確定', {name: 'ok'});
	
	okButton.onClick = function() {
	    selectedValues = sizeList.selection.value;
	    //alert(sizeList.selection.value);
	    // 可以添加更多的功能，如收集數據、驗證等
	    dialog.close(); // 閉關對話框
	};
	
	
	dialog.add('button', undefined, '取消', {name: 'cancel'});
	dialog.show();
}

