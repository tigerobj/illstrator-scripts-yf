(function () {
    var root = new File($.fileName).parent;

    function log(message) {
        $.writeln("[run_color_flow] " + message);
    }

    function runScript(fileName) {
        var scriptFile = File(root.fsName + "/" + fileName);
        if (!scriptFile.exists) {
            throw new Error("Missing script: " + scriptFile.fsName);
        }
        log("Running " + fileName);
        $.evalFile(scriptFile);
        log("Finished " + fileName);
    }

    try {
        runScript("套圖-指定顏色.jsx");
        runScript("套圖-改變顏色.jsx");
        log("Color flow completed.");
    } catch (error) {
        log("Color flow failed: " + error);
        throw error;
    }
}());
