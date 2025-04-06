function center(layerName, targetItemName){
    var doc = app.activeDocument;

    // 確認選取一個物件
    if (doc.selection.length === 1) {
        var selectedItem = doc.selection[0];

        // 取得指定圖層
        try {
            var targetLayer = doc.layers.getByName(layerName);
        } catch(e) {
            alert("找不到指定的圖層：" + layerName);
        }

        // 找尋目標群組
        var foundItem  = null;
        for(var i = 0; i < targetLayer.pageItems.length; i++){
            if(targetLayer.pageItems[i].name == targetItemName){
                foundItem = targetLayer.pageItems[i];
                break;
            }
        }

        if (!foundItem) {
            alert("在圖層「" + layerName + "」內找不到群組「" + groupName + "」！");
        }

        // 取得目標群組的邊界資訊
        var boundsGroup = foundItem.geometricBounds;
        var groupLeft = boundsGroup[0];
        var groupTop = boundsGroup[1];
        var groupRight = boundsGroup[2];

        // 取得選取物件的邊界資訊
        var boundsItem = selectedItem.geometricBounds;
        var itemWidth = boundsItem[2] - boundsItem[0];
        var itemHeight = boundsItem[1] - boundsItem[3];

        // 轉換單位 (mm轉為點數，1mm = 2.834645 pt)
        //var verticalDistance = distance * 2.834645;

        // 計算新位置 (水平置中, 垂直從上往下100mm)
        var newX = (groupLeft + groupRight - itemWidth) / 2;

        // 設定選取物件到新位置
        selectedItem.left = newX;
        //selectedItem.top = newY;

        alert("已將選取物件對齊置中");

    } else {
        alert("請先選取一個物件！");
    }
}

function bottomCenter(layerName, targetItemName, distance){
    var doc = app.activeDocument;

    // 確認選取一個物件
    if (doc.selection.length === 1) {
        var selectedItem = doc.selection[0];

        // 取得指定圖層
        try {
            var targetLayer = doc.layers.getByName(layerName);
        } catch(e) {
            alert("找不到指定的圖層：" + layerName);
        }

        // 找尋目標群組
        var foundItem  = null;
        for(var i = 0; i < targetLayer.pageItems.length; i++){
            if(targetLayer.pageItems[i].name == targetItemName){
                foundItem = targetLayer.pageItems[i];
                break;
            }
        }

        if (!foundItem) {
            alert("在圖層「" + layerName + "」內找不到群組「" + groupName + "」！");
        }

        // 取得目標群組的邊界資訊
        var boundsGroup = foundItem.geometricBounds;
        var groupLeft = boundsGroup[0];
        var groupTop = boundsGroup[1];
        var groupRight = boundsGroup[2];

        // 取得選取物件的邊界資訊
        var boundsItem = selectedItem.geometricBounds;
        var itemWidth = boundsItem[2] - boundsItem[0];
        var itemHeight = boundsItem[1] - boundsItem[3];

        // 轉換單位 (mm轉為點數，1mm = 2.834645 pt)
        var verticalDistance = distance * 2.834645;

        // 計算新位置 (水平置中, 垂直從上往下100mm)
        var newX = (groupLeft + groupRight - itemWidth) / 2;
        var newY = groupTop - verticalDistance;

        // 設定選取物件到新位置
        selectedItem.left = newX;
        selectedItem.top = newY;

        alert("已將選取物件對齊至置中");

    } else {
        alert("請先選取一個物件！");
    }
}


//bottomCenter（"縫份","後片",100）;

//center("縫份","前片");
