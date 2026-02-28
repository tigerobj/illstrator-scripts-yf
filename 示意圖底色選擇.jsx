#include "對齊置中.jsx";
#include "json2.js";
function log (input) {

    if(!JSON || !JSON.stringify) return;
    var now = new Date();
    var output = JSON.stringify(input);
    $.writeln(now.toTimeString() + ": " + output);
    //D:\開發\客戶圖檔\杰優、裕豐工廠產品\ai_script_workspace\ai_example\illustrator-scripts-master2
    var pathEnv = $.getenv('CLOTH_TEMPLATE_CONFIG_PATH');
    var filePath = pathEnv;
    //var filePath = "D:/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2";
	//alert(app.activeDocument.filePath);
    //var logFile = File(app.activeDocument.filePath + "/log.txt");
    var logFile = File(filePath + "/log_裁切底色選擇.txt");
		logFile.encoding = "utf8";
    logFile.open("a");
    //alert(now.toTimeString() + ": " + output);
    logFile.writeln(now.toTimeString() + ": " + output);
    logFile.close(); //作測試修改222
}

var allPageItems = ["前片","後片","左袖","左袖口","右袖","右袖口","領"];

function showGui() {

    // 創建對話框
    var dialog = new Window('dialog', '裁切底色選擇');

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
    var contentPanel = mainGroup.add('panel', undefined, '裁片名稱選擇');
    contentPanel.orientation = 'column';
    contentPanel.alignChildren = ['fill', 'fill'];


    // 添加按鈕組
    var buttonGroup = mainGroup.add('panel', undefined, '確定選擇裁片');
    buttonGroup.orientation = 'row';
    buttonGroup.alignment = ['center', 'bottom'];

    var okButton = buttonGroup.add('button', undefined, '確定', { name: 'ok' });
    var cancelButton = buttonGroup.add('button', undefined, '取消', { name: 'cancel' });
    var checkboxes = [];
    okButton.onClick = function() {
      //alert("okButton.onClick");
      for(var i=0;i<checkboxes.length;i++){
        if(checkboxes[i].value){
          selected.push(checkboxes[i].text);
          //alert(checkboxes[i].text);
        }
      }
      dialog.close();
    }

    cancelButton.onClick = function() {
      dialog.close();
    };

    // 用於存儲尺寸的 checkbox 參考
    for (var i = 0; i < allPageItems.length; i++) {
        var checkboxButton = contentPanel.add('checkbox', undefined, allPageItems[i]);
        checkboxes.push(checkboxButton);
    }

    dialog.layout.layout(true);
    dialog.show();
}

//在showGui函數內的okButton.onClick 內將值存入
var selected = [];
showGui();
var doc = app.activeDocument;

//"前片","後片","左袖","右袖","領"
for(i=0 ;i<selected.length;i++){
  if("前片" === selected[i]){
    getPathItemByThreeLevel("立體版", "前面", "前片", "底色").selected = true;
  }else if("後片" === selected[i]){
    getPathItemByThreeLevel("立體版", "後面", "後片", "底色").selected = true;
  }else if("左袖" === selected[i]){
    getPathItemByThreeLevel("立體版", "前面", "左袖", "底色").selected = true;
    getPathItemByThreeLevel("立體版", "後面", "左袖", "底色").selected = true;
    getPathItemByTwoLevel("裁切", "左袖", "底色").selected = true;
  }else if("右袖" === selected[i]){
    getPathItemByThreeLevel("立體版", "前面", "右袖", "底色").selected = true;
    getPathItemByThreeLevel("立體版", "後面", "右袖", "底色").selected = true;
    getPathItemByTwoLevel("裁切", "右袖", "底色").selected = true;
  }else if("領" === selected[i]){
    getPathItemByThreeLevel("立體版", "前面", "領", "底色").selected = true;
    if(getPathItemByThreeLevel("立體版", "前面", "領", "底色2")){
      getPathItemByThreeLevel("立體版", "前面", "領", "底色2").selected = true;
    }
    if(getPathItemByThreeLevelNoAlert("立體版", "前面", "領", "底色3")){
      getPathItemByThreeLevel("立體版", "前面", "領", "底色3").selected = true;
    }
    getPathItemByThreeLevel("立體版", "後面", "領", "底色").selected = true;
  }else if("左袖口" === selected[i]){
    if(getGroupByTwoLevelNoAlert("立體版", "前面", "左袖口")){
      getPathItemByThreeLevel("立體版", "前面", "左袖口", "底色").selected = true;
    }
    if(getGroupByTwoLevelNoAlert("立體版", "後面", "左袖口")){
      getPathItemByThreeLevel("立體版", "後面", "左袖口", "底色").selected = true;
    }

  }else if("右袖口" === selected[i]){
    if(getGroupByTwoLevelNoAlert("立體版", "前面", "右袖口")){
      getPathItemByThreeLevel("立體版", "前面", "右袖口", "底色").selected = true;
    }

    if(getGroupByTwoLevelNoAlert("立體版", "後面", "右袖口")){
      getPathItemByThreeLevel("立體版", "後面", "右袖口", "底色").selected = true;
    }

  }
}
