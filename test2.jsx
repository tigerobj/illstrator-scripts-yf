#include "對齊置中.jsx";
#include "base.jsx";
var sel = app.activeDocument.selection;

var targetLayer;
var targetItem;

//6扣棒球衣隊名處理

for(var i=0;i<sel.length ;i++){
  var item = sel[0];
  var itemLayer = item.layer;
  if("6扣棒球衣隊名處理" === itemLayer.name){
    targetLayer = itemLayer;
    targetItem = item;
    break;
  }
}

alert(targetItem.name);

if(targetLayer){
  targetGroup = targetLayer.groupItems.add();

  // 將所有選取的物件（包括遮罩物件）加入群組
  for (var i = 0; i < sel.length; i++) {
    var item = sel[i];
    if(item === targetItem){
      continue;
    }
    a = item.duplicate(targetLayer);
    a.move(targetGroup, ElementPlacement.PLACEATEND);
  }
  // 將遮罩物件調整至群組內最上方
  maskItem = findPageItemInGroup(targetItem, "底色")
  maskItem.move(targetGroup, ElementPlacement.PLACEATBEGINNING);
  targetGroup.name = targetItem.name+"隊名遮罩";
  targetGroup.clipped = true;
}
