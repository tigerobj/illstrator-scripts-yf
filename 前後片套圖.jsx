#include "對齊置中.jsx";

function shirtFrontBack(FrontBack_name){
  //左前不縮放複製至左前
  //先取得選取物件內的底色物件移動指定裁切名稱的物件,例如左前
  a = topCenterXYByGroup("裁切", FrontBack_name,0,"底色");
  //將不縮放複製並移到左袖對齊
  selectItem = app.activeDocument.selection[0];
  targetItem = getPageItemByNameInLayer(app.activeDocument, "裁切", FrontBack_name);
  item = findPageItemInGroup(selectItem, "不縮放");
  groupItem = null;
  moveItem = null;
  new3Item = null;
  var myLeftx;
  //如果有不縮放
  if(item){
    moveItem = item.duplicate(item.layer, ElementPlacement.PLACEATBEGINNING);
    moveItem.translate(a.left,a.top);
    //將不縮放移至左袖物件內的第一個
    //move(doc.activeLayer, ElementPlacement.PLACEBEFORE);
    moveItem.move(targetItem,ElementPlacement.PLACEATBEGINNING);
  }


  maskBaseItem = findPageItemInGroupFirst(selectItem,"底色");

  //有遮罩物件
  targetBaseItem = findPageItemInGroupFirst(targetItem,"底色");
  maskItem = findMaskmInGroupFirst(selectItem);
  if(maskItem){
    newItem = maskItem.duplicate();

    aBrounds = getBounds(targetBaseItem);
    bBrounds = getBounds(maskBaseItem);
    scale = (aBrounds.width/bBrounds.width)*100;

    newItem.resize(scale,scale,true,true,true,true,scale);
    topCenterByItems(targetItem,"底色",newItem,"底色",0);
    
    //移到左袖內底色前面
    newItem.move(targetBaseItem, ElementPlacement.PLACEBEFORE);
    //放大後不正確的遮罩底色置換成袖子的底色
    newShape = findPageItemInGroupFirst(targetItem,"底色").duplicate();
    replaceClippingByName(newItem,"底色",newShape);



    new3Item = findPageItemInGroup(newItem,FrontBack_name+"隊名");
  }

  if(new3Item){
    //如果左右前隊名是要縮放所以放在遮罩內,所以要重新置換遮罩底色
    newShape = findPageItemInGroupFirst(targetItem,"底色").duplicate();
    replaceClippingByName(new3Item,"底色",newShape);
    buttonsItem = getPageItemByNameInLayer(app.activeDocument,"縫份",FrontBack_name+"鈕扣");
    oenButtons = findPageItemInGroupFirst(buttonsItem,"1");

    var items = new3Item.pageItems;
    myLeftx0 = getLeftX(items,oenButtons);
    for(var i=0;i<items.length;i++){
      tmpItem = items[i];
      if(tmpItem.name === "底色"){
        continue;
      }else{
        tmpItem.translate(myLeftx0,0);
      }
    }
    new3Item.move(new3Item.parent, ElementPlacement.PLACEATBEGINNING);
  }

  if(moveItem){
    new2Item = findPageItemInGroup(moveItem,FrontBack_name+"隊名");
    if(new2Item){
      newShape = findPageItemInGroupFirst(targetItem,"底色").duplicate();
      replaceClippingByName(new2Item,"底色",newShape);
      buttonsItem = getPageItemByNameInLayer(app.activeDocument,"縫份",FrontBack_name+"鈕扣");
      oenButtons = findPageItemInGroupFirst(buttonsItem,"1");
      var items = new2Item.pageItems;
      myLeftx = getLeftX(items,oenButtons);

      for(var i=0;i<items.length;i++){
        tmpItem = items[i];
        if(tmpItem.name === "底色"){
          continue;
        }else{
          tmpItem.translate(myLeftx,0);
        }
      }
    }
  }

}


function getLeftX(items,oenButtons){
  for(var i=0;i<items.length;i++){
    tmpItem = items[i];
    if(tmpItem.name === "前胸logo"){
      value = centerByItemX(oenButtons,tmpItem);
      return value;
    }
  }
}

shirtFrontBack(app.activeDocument.selection[0].name);
