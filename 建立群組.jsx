
var doc = app.activeDocument;
var sel = doc.selection;
var groupName = null;




//要先有 allPageItems 作為radioButtons的顯示資料
//clothes_size是按鈕按下所選的radioButton的值

function showGui() {
    //cutPieceGroups = getCutPieceGroups();
    // 創建對話框
    var dialog = new Window('dialog', '尺寸選擇');

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
    var contentPanel = mainGroup.add('panel', undefined, '尺寸選擇');
    contentPanel.orientation = 'column';
    contentPanel.alignChildren = ['fill', 'fill'];

    // 添加按鈕組
    var buttonGroup = mainGroup.add('panel', undefined, '確定選擇尺寸');
    buttonGroup.orientation = 'row';
    buttonGroup.alignment = ['center', 'bottom'];

    var okButton = buttonGroup.add('button', undefined, '確定', { name: 'ok' });
    var cancelButton = buttonGroup.add('button', undefined, '取消', { name: 'cancel' });
    var radioButtons = [];
    okButton.onClick = function() {
      //alert("okButton.onClick");
      for(var i=0;i<radioButtons.length;i++){
        if(radioButtons[i].value){
          groupName = radioButtons[i].text;
        }
      }
      dialog.close();
    }

    cancelButton.onClick = function() {
      dialog.close();
    };

    //群組名稱選擇
    radioButtons.push(contentPanel.add('radiobutton', undefined, "前片"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "右前"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "左前"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "後片"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "左門襟"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "右門襟"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "左袖"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "右袖"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "領"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "領滾條"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "後內貼"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "不複製"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "不縮放"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "框"));
    radioButtons.push(contentPanel.add('radiobutton', undefined, "記號線"));
    dialog.layout.layout(true);
    dialog.show();
}

showGui();

if (sel.length > 0 ) {
  if(groupName){
    var firstItem = sel[0];
    var parentItem = firstItem.parent;
    var newGroup = parentItem.groupItems.add();
    newGroup.move(firstItem, ElementPlacement.PLACEBEFORE);
    newGroup.name = groupName;
    for(var i=0;i<sel.length;i++){
      sel[sel.length-1-i].move(newGroup, ElementPlacement.PLACEATBEGINNING);
    }
    doc.selection = null;
  }
} else {
    alert("請選取一個物件！");
}
