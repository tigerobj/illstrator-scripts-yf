#include "對齊置中.jsx";
#include "base.jsx";


sels = app.activeDocument.selection;
alert(sels.length);
for(i=0;i<sels.length;i++){
  item = sels[i];
  if("後片姓名遮罩" == item.name){
    group = getGroupByLevel("裁切","後片");
    target = findPageItemInGroupFirst(group, "底色");
    moveItem = findPageItemInGroupFirst(item, "底色");
    a = autoCenterXY(target,moveItem);
    item.translate(a.left,a.top);
    item.move(group, ElementPlacement.PLACEATBEGINNING);
  }else if("右前隊名遮罩" == item.name){
    group = getGroupByLevel("裁切","右前");
    target = findPageItemInGroupFirst(group, "底色");
    moveItem = findPageItemInGroupFirst(item, "底色");
    a = autoCenterXY(target,moveItem);
    item.translate(a.left,a.top);
    item.move(group, ElementPlacement.PLACEATBEGINNING);
  }else if("左前隊名遮罩" == item.name){
    group = getGroupByLevel("裁切","左前");
    target = findPageItemInGroupFirst(group, "底色");
    moveItem = findPageItemInGroupFirst(item, "底色");
    a = autoCenterXY(target,moveItem);
    item.translate(a.left,a.top);
    item.move(group, ElementPlacement.PLACEATBEGINNING);
  }
}
