String.prototype.trim = function() {
	return this.replace(/(^[\s\n\r\t\x0B]+)|([\s\n\r\t\x0B]+$)/g, '');
	
}

// 打開文件選擇對話框，讓使用者選擇 CSV 檔案
var csvFile = File.openDialog("請選擇 CSV 檔案");

// 如果使用者有選擇檔案
if (csvFile != null) {
    // 開啟並讀取 CSV 檔案內容
    csvFile.open('r');
    var csvContent = csvFile.read();
    csvFile.close();

    // 將 CSV 內容按行分割
    var lines = csvContent.split('\n');

    // 建立一個陣列來儲存標籤和值
    var data = [];

    // 遍歷每一行，解析標籤和值
    for (var i = 0; i < lines.length; i++) {
        // 忽略空白行
        if (lines[i].trim() == '') continue;

        // 將行內容以分號分割
        var cols = lines[i].split(';');

        // 如果該行至少有兩個欄位
        if (cols.length >= 2) {
            data.push({
                label: cols[0],
                value: cols[1]
            });
        }
    }

    // 建立對話框
    var dlg = new Window('dialog', 'CSV 內容編輯');

    // 主群組，用於容納所有元素
    var mainGroup = dlg.add('group');
    mainGroup.orientation = 'column';
    mainGroup.alignChildren = ['fill', 'top'];
    mainGroup.margins = 10;

    // 設定每行顯示三個欄位
    var columnsPerRow = 3;

    // 計算需要多少行
    var rows = Math.ceil(data.length / columnsPerRow);

    // 儲存所有的輸入框，以便後續取得使用者輸入的值
    var inputFields = [];

    // 逐行添加 UI 元素
    for (var r = 0; r < rows; r++) {
        var group = mainGroup.add('group');
        group.orientation = 'row';
        group.alignChildren = ['fill', 'top'];

        // 在該行添加三個欄位
        for (var c = 0; c < columnsPerRow; c++) {
            var index = r * columnsPerRow + c;

            // 如果資料存在，則添加 UI 元素
            if (index < data.length) {
                var subGroup = group.add('group');
                subGroup.orientation = 'column';
                subGroup.alignChildren = ['fill', 'top'];
                subGroup.margins = [0, 0, 10, 0];

                // 添加標籤
                subGroup.add('statictext', undefined, data[index].label);

                // 添加可編輯的文字欄位
                var editText = subGroup.add('edittext', undefined, data[index].value);
                editText.characters = 20;

                // 將輸入框加入到陣列中
                inputFields.push({
                    label: data[index].label,
                    input: editText
                });
            }
        }
    }

    // 添加確定按鈕
    var btnGroup = dlg.add('group');
    btnGroup.alignment = 'center';
    var okButton = btnGroup.add('button', undefined, '確定');

    // 顯示對話框
    if (dlg.show() == 1) {
        // 使用者點擊了確定按鈕，可以在此處處理輸入的值
        for (var i = 0; i < inputFields.length; i++) {
            var label = inputFields[i].label;
            var value = inputFields[i].input.text;
            // 在此處使用 label 和 value，例如輸出到控制台
            $.writeln('標籤: ' + label + ', 值: ' + value);
        }
    }
}



