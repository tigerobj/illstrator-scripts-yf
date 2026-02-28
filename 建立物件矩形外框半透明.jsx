function createFarme(name){
    var doc = app.activeDocument;
    // 取得指定圖層
    try {
        var targetLayer = doc.layers.getByName("操作");
    } catch(e) {
        targetLayer = doc.layers.add();
        targetLayer.name = "操作";
        alert("建立圖層名稱：" + targetLayer.name);
    }

    // 確認目前選取一個物件
    if (doc.selection.length === 1) {
        var selectedItem = doc.selection[0];
        // 取得選取物件邊界
        var bounds = selectedItem.geometricBounds;
        var left = bounds[0];
        var top = bounds[1];
        var right = bounds[2];
        var bottom = bounds[3];
        var width = right - left;
        var height = top - bottom;
        // 建立矩形外框（與選取物件邊界一致）
        var rectFrame = targetLayer.pathItems.rectangle(top, left, width, height);
        // 設定矩形邊框為黑色1pt
        rectFrame.stroked = false;
        // rectFrame.strokeColor = new CMYKColor();
        // rectFrame.strokeColor.black = 100;
        // rectFrame.strokeWidth = 1;
        // 設定內部填色為紅色
        rectFrame.filled = true;
        rectFrame.fillColor = new CMYKColor();
        rectFrame.fillColor.cyan = 0;
        rectFrame.fillColor.magenta = 100;
        rectFrame.fillColor.yellow = 100;
        rectFrame.fillColor.black = 0;
        // 設定透明度為 50%
        rectFrame.opacity = 50;
        rectFrame.name = name;
        alert("已建立內部填色紅色且透明度50%的矩形外框！");
    } else {
        alert("請先選取一個物件！");
    }
}
