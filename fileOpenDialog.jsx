// 創建一個函數來打開檔案選擇對話框並選擇一個檔案
function selectFile() {
    var file = File.openDialog("選擇一個檔案", "*.ai", false);
    if (file) {
        alert("您選擇了檔案: " + file.fsName);  // fsName 提供完整的檔案路徑
    } else {
        alert("未選擇檔案。");
    }
}

// 呼叫函數
selectFile();