(function () {
    var root = new File($.fileName).parent;

    function runScript(fileName) {
        var scriptFile = File(root.fsName + "/" + fileName);
        if (!scriptFile.exists) {
            throw new Error("找不到腳本: " + scriptFile.fsName);
        }
        $.evalFile(scriptFile);
    }

    try {
        runScript("套圖-指定顏色.jsx");
        runScript("套圖-改變顏色.jsx");
        alert("已完成:\n1. 套圖-指定顏色.jsx\n2. 套圖-改變顏色.jsx");
    } catch (error) {
        alert("套圖顏色流程執行失敗:\n" + error);
        throw error;
    }
}());
