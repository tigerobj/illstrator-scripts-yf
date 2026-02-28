#include "對齊置中.jsx";

//對齊置中
//autoCenterBySelectName("裁切","領","底色");

//bottomCenterXY("裁切","右袖","底色");


//向上置中
//topCenterByGroup("裁切","領",0,"底色")

//bottomCenterBySelectName("裁切","右袖","底色");

//bottomCenterBySelectName("裁切","左袖",0,"底色");

// var doc = app.activeDocument;
// itemA = getPageItemByNameInLayerByTarget(doc,"裁切","後片","底色");
// var selectedItem = doc.selection[0];
// centerByItem(itemA,selectedItem);

//a = topCenterXY("裁切", FrontBack_name,0,"底色");

function xxx(layerName, targetItemName, distance , selectName){
  var doc = app.activeDocument;
  // 確認選取一個物件
  if (doc.selection.length === 1) {
      var selectedItem = doc.selection[0];
      var groupItem = getPageItemByNameInLayer(doc,layerName,targetItemName);
      var foundItem = findPageItemInGroupFirst(groupItem,selectName);
      targetBounds = getBounds(foundItem);

      rectFrameA = groupItem.layer.pathItems.rectangle(targetBounds.top, targetBounds.left, targetBounds.width, targetBounds.height);

      selectedBounds = getBounds(findPageItemInGroupFirst(selectedItem,selectName));
      rectFrameB = selectedItem.layer.pathItems.rectangle(selectedBounds.top, selectedBounds.left, selectedBounds.width, selectedBounds.height);
      x = (targetBounds.left-selectedBounds.left)+(targetBounds.width-selectedBounds.width)/2;
      y = (targetBounds.top -selectedBounds.top)-mm(distance);
      //selectedItem.translate(x,y);
      //alert("已將選取物件對齊至置中");
      return{
        left:x,
        top:y
      }
  } else {
      alert("請先選取一個物件！");
      return null;
  }
}
var rectFrameA;
var rectFrameB;
a = xxx("裁切", "後片",0,"底色");
//rectFrameB.translate(a.left,a.top);
