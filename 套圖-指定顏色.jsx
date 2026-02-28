#include "對齊置中.jsx";
#include "json2.js";
//要先有 allPageItems 作為radioButtons的顯示資料
//clothes_size是按鈕按下所選的radioButton的值

function showGui(allPageItems) {
    //cutPieceGroups = getCutPieceGroups();
    // 創建對話框
    var dialog = new Window('dialog', '顏色位置選擇');

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
    var contentPanel = mainGroup.add('panel', undefined, '顏色位置');
    contentPanel.orientation = 'column';
    contentPanel.alignChildren = ['fill', 'fill'];


    // 添加按鈕組
    var buttonGroup = mainGroup.add('panel', undefined, '確定顏色位置');
    buttonGroup.orientation = 'row';
    buttonGroup.alignment = ['center', 'bottom'];

    var okButton = buttonGroup.add('button', undefined, '確定', { name: 'ok' });
    var cancelButton = buttonGroup.add('button', undefined, '取消', { name: 'cancel' });
    var radioButtons = [];
    okButton.onClick = function() {
      //alert("okButton.onClick");
      for(var i=0;i<radioButtons.length;i++){
        if(radioButtons[i].value){
          color_order = radioButtons[i].text;
        }
      }
      dialog.close();
    }

    cancelButton.onClick = function() {
      dialog.close();
    };

    // 用於存儲尺寸的 checkbox 參考
    for (var i = 0; i < allPageItems.length; i++) {
        var radioButton = contentPanel.add('radiobutton', undefined, allPageItems[i].name);
        radioButtons.push(radioButton);
    }
    dialog.layout.layout(true);
    dialog.show();
}
var doc = app.activeDocument;
pathItems = doc.layers.getByName("目前顏色").pathItems;
var color_order = null;
selectItem = app.activeDocument.selection[0];
if(selectItem){
    showGui(pathItems);
    group = getGroupByLevel("指定顏色",color_order);
    if(group){
        group.remove();
    }
    destinationLayer = doc.layers.getByName("指定顏色");
    newItem = selectItem.duplicate(destinationLayer, ElementPlacement.PLACEATEND);
    newItem.name = color_order;
    itemA = getPageItemByNameInLayer(doc ,"顏色位置", color_order);
    autoCenterByItem(itemA, newItem);
    app.activeDocument.selection  = null;
}else{
    alert("請至杰優色樣選擇一個顏色")
}
