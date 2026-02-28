
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

function writerObjToCsv(csvFile,obj){
	csvFile.open('w');
	csvFile.encoding = "big5";
	content = ""
	n=0;
	for (var key in obj) {
		if(n != 0){
			content = content+"\n";
		}
		content = content+key+";"+obj[key];
		n++;

	}

	csvFile.write(content);
	csvFile.close();
}

/**
 * 在 CSV 檔案最後增加一筆資料
 */
function appendToCsvFile(csvFile, key, value) {
    csvFile.open('a');
    csvFile.writeln(key + ";" + value);
    csvFile.close();
}


/**
 * 在 CSV 檔案最後增加多筆資料
 */
function appendMultipleToCsvFile(csvFile, dataArray) {
    csvFile.open('a');
    for (var i = 0; i < dataArray.length; i++) {
        var key = dataArray[i][0];
        var value = dataArray[i][1];
        csvFile.writeln(key + ";" + value);
    }
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


function copyAndOpenAiFile(sourcePath, destinationPath) {
	// 創建目標文件對象

  var destinationFile = new File(destinationPath);

	alert(destinationFile);
	if(destinationFile.exists){
		alert("檔案已經存在,沒有從樣版中複製,打開己存在的檔案");
		app.open(destinationFile,DocumentColorSpace.CMYK);
	} else {
		// 檢查來源文件是否存在
	    var sourceFile = new File(sourcePath);
	    if (!sourceFile.exists) {
	        alert("來源檔案不存在：" + sourcePath);
	        return;
	    }
	    // 複製文件
	    var copied = sourceFile.copy(destinationFile);
	    if (copied) {
	        //alert("檔案已成功複製到：" + destinationPath);
	        app.open(destinationFile,DocumentColorSpace.CMYK);
	        sourceFile.close();
	    } else {
	        alert("檔案複製失敗。");
	    }
	}
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

function getKeys(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

function showGui(evnFile) {
    var checkboxIndex = -1;
    var file = evnFile;
		alert(evnFile);
    var clothesData = {};
    // 打開檔案進行讀取
    if (file.open('r')) {
        file.readln(); // 讀取並忽略首行（標題行）
        while (!file.eof) {
            var line = file.readln();
						alert(line);
            var parts = line.split(';');
            var type = parts[0].trim();
            var size = parts[1].trim();
            var fileLocation = parts[2].trim();
            var fileName = parts[3].trim();
            var clothTemplatePath = parts[4].trim();
            if (!clothesData[type]) {
                clothesData[type] = [];
            }
            clothesData[type].push({
                shirtType: type,
                selectedSize: size,
                fileLocation: fileLocation,
                fileName: fileName,
                clothTemplatePath: clothTemplatePath,
                number: "",
                name: ""
            });

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
            checkboxIndex = -1;
            if (filePathText !== undefined) {
                filePathText.text = "";
            }
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
                checkbox.value = false; // 預設未選中
                checkbox.sizeData = sizeData; // 將尺寸資料存入 checkbox
                sizeCheckboxes.push(checkbox);
                checkbox.onClick = function() {
                    if (filePathText !== undefined) {
                        filePathText.text = checkbox.sizeData.clothTemplatePath;
                    }
                    for (var i = 0; i < sizeCheckboxes.length; i++) {
                        if(this.sizeData.selectedSize ===  sizeCheckboxes[i].sizeData.selectedSize){
                            checkboxIndex = i;
                        }else{
                            sizeCheckboxes[i].value = false;
                        }
                    }
                }
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
    var lblOrderPath = fileSelectGroup.add('statictext', undefined, '訂單路徑:');
    lblOrderPath.alignment = ['left', 'center'];
    // 添加文字框顯示所選的檔案路徑
    var filePathText = fileSelectGroup.add('edittext', undefined, '', { readonly: false });
    filePathText.characters = 60;
    filePathText.alignment = ['fill', 'center'];

    var dataGroup = dialog.add('group');
    dataGroup.orientation = 'row';
    dataGroup.alignChildren = ['left', 'center'];
    dataGroup.alignment = ['fill', 'top'];

    var lblNumber = dataGroup.add('statictext', undefined, '號碼:');
    lblNumber.alignment = ['left', 'center'];
    // 添加文字框顯示所選的檔案路徑
    var numberText = dataGroup.add('edittext', undefined, '', { readonly: false });
    numberText.characters = 20;
    numberText.alignment = ['fill', 'center'];

    var lblName = dataGroup.add('statictext', undefined, '姓名:');
    lblName.alignment = ['left', 'center'];
    // 添加文字框顯示所選的檔案路徑
    var nameText = dataGroup.add('edittext', undefined, '', { readonly: false });
    nameText.characters = 20;
    nameText.alignment = ['fill', 'center'];



    // 添加按鈕組
    var buttonGroup = dialog.add('group');
    buttonGroup.orientation = 'row';
    buttonGroup.alignment = ['center', 'bottom'];

    var okButton = buttonGroup.add('button', undefined, '確定', { name: 'ok' });
    var cancelButton = buttonGroup.add('button', undefined, '取消', { name: 'cancel' });

    okButton.onClick = function() {
        selectedData = sizeCheckboxes[checkboxIndex].sizeData;
        selectedData.clothTemplatePath = filePathText.text;
        selectedData.number = numberText.text;
        selectedData.name = nameText.text;
        dialog.close(); // 關閉對話框
		result = "ok";
        return selectedSizes;
    };

    cancelButton.onClick = function() {
		result = null;
		return reslut;
        dialog.close();
    };

    //dialog.left();
    dialog.layout.layout(true);
    dialog.show();
}

// 傳入檔名字串，回傳副檔名（不含點）
function getFileExtension(fileName) {
    if (fileName && fileName.indexOf('.') !== -1) {
        return fileName.split('.').pop().toLowerCase(); // 小寫回傳
    } else {
        return null; // 沒有副檔名時回傳 null
    }
}

var selectedData;
var result;
showGui(checkForDataCsv());
if(result == null){
	throw new Error("你按取消,終止程式");
}
//sourcePath
extension = getFileExtension(selectedData.fileName);

if(extension == null){
    alert("沒有附檔名請確定 衣服配置檔.csv 內的 空白樣版 欄位");
		throw new Error("沒有附檔名請確定 衣服配置檔.csv 內的 空白樣版 欄位");
}

fileName = selectedData.selectedSize+"-"+selectedData.number+"-"+selectedData.name+"."+extension;
sourcePath = selectedData.fileLocation+"/"+selectedData.fileName;
destinationPath = selectedData.clothTemplatePath+"/"+fileName;

copyAndOpenAiFile(sourcePath,destinationPath);
csvFileName = selectedData.selectedSize+"-data.csv"

var destinationFile = new File(destinationPath);


var csvFile = new File(selectedData.clothTemplatePath+"/"+csvFileName);
if(! csvFile.exists){
	var newEntries = [
		["類別", selectedData.shirtType],
		["尺寸", selectedData.selectedSize],
		["樣版位置", selectedData.fileLocation],
		["樣版檔案名稱", selectedData.fileName],
		["姓名", selectedData.name],
		["號碼", selectedData.number],
		["姓名轉框", "N"],
		["大背號轉框","N"],
		["前小號轉框", "N"],
		["客人logo對齊", "置中"],
		["姓名對齊", "置中"],
		["大背號對齊", "置中"],
		["前右胸logo對齊", "置中"],
		["前胸logo對齊", "置中"],
		["前小號對齊", "置中"],
		["左袖對齊", "置中"],
		["右袖對齊", "置中"],
		["套版", selectedData.selectedSize+"-套版.eps"]
	];
	upsertMultipleToCsvFile(csvFile,newEntries);
}else{
	var newEntries = [
		["姓名", selectedData.name],
		["號碼", selectedData.number]
	];
	upsertMultipleToCsvFile(csvFile,newEntries);
}
