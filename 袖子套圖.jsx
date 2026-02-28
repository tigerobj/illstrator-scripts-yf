#include "對齊置中.jsx";

function sleeve(sleeve_name){
  //左袖不縮放複製至左袖
  //先取得選取物件內的底色物件移動至縫份圖層內的左袖向下對齊,22.225mm為折車部份
  //a = bottomCenterXY("縫份", sleeve_name, 22.225,"底色");
  a = bottomCenterByGroup("裁切", sleeve_name,0,"底色");
  //將不縮放複製並移到左袖對齊
  selectItem = app.activeDocument.selection[0];
  targetItem = getPageItemByNameInLayer(app.activeDocument, "裁切", sleeve_name);
  item = findPageItemInGroup(selectItem, "不縮放");
  groupItem = null;
  //如果有不縮放
  if(item){
    moveItem = item.duplicate(item.layer, ElementPlacement.PLACEATBEGINNING);
    moveItem.translate(a.left,a.top);
    //將不縮放移至左袖物件內的第一個

    //move(doc.activeLayer, ElementPlacement.PLACEBEFORE);
    moveItem.move(targetItem,ElementPlacement.PLACEATBEGINNING);
    groupItem = findPageItemInGroup(moveItem,"袖口橫條");
  }
  //取得袖口橫條舊遮罩底色置換成後片的底色


  //如果有袖口橫條遮罩
  if(groupItem){
    newShape = findPageItemInGroupFirst(targetItem,"底色").duplicate();
    replaceClippingByName(groupItem,"底色",newShape);
  }

  maskBaseItem = findPageItemInGroupFirst(selectItem,"底色");
  targetBaseItem = findPageItemInGroupFirst(targetItem,"底色");

  maskItem = findMaskmInGroupFirst(selectItem);
  //如果有遮罩套圖
  if(maskItem){
    newItem = maskItem.duplicate();

    aBrounds = getBounds(targetBaseItem);
    bBrounds = getBounds(maskBaseItem);
    scale = (aBrounds.width/bBrounds.width)*100;
    newItem.resize(scale,scale,true,true,true,true,scale);
    bottomCenterByItems(targetItem,"底色",newItem,"底色",0);

    //移到左袖內底色前面
    newItem.move(targetBaseItem, ElementPlacement.PLACEBEFORE);
    //放大後不正確的遮罩底色置換成袖子的底色
    newShape = findPageItemInGroupFirst(targetItem,"底色").duplicate();
    replaceClippingByName(newItem,"底色",newShape);
  }
}


sleeve(app.activeDocument.selection[0].name);
