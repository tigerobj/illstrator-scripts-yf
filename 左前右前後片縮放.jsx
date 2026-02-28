#include "對齊置中.jsx";
#include "base.jsx";
//複製L隊名內的所有物件並且移動
//到圖層 6扣棒球衣隊名處理-XL-縮放用 的XL群組並排序物件最後

//XL作遮罩

//app.activeDocument.layers[index].groupItems

function clothesResize(layerName,size,size2,offsetY){
  doc = app.activeDocument;
  var layer = doc.layers.getByName("L隊名");
  groupItems = layer.groupItems;
  gItem_S1 = getGroupByLevel(layerName,size);
  gItem_S2 = getGroupByLevel(layerName,size2);
  b1 = getBounds(gItem_S1.pathItems[0]);
  b2 = getBounds(gItem_S2.pathItems[0]);
  scale = (b2.width/b1.width)*100;

  //
  var item;
  try{
    item = groupItems.getByName("前小號");
    a = item.duplicate();
    a.move(gItem_S1, ElementPlacement.PLACEATEND);
    a.translate(0,offsetY);
  }catch(e){

  }

  try{
    item = groupItems.getByName("右前logo");
    a = item.duplicate();
    a.move(gItem_S1, ElementPlacement.PLACEATEND);
    a.translate(0,offsetY);

  }catch(e){

  }

  try{
    item = groupItems.getByName("左前logo");
    a = item.duplicate();
    a.move(gItem_S1, ElementPlacement.PLACEATEND);
    a.translate(0,offsetY);

  }catch(e){

  }

  try{
    item = groupItems.getByName("隊名");
    a = item.duplicate();
    a.move(gItem_S1, ElementPlacement.PLACEATEND);
    a.translate(0,offsetY);
  }catch(e){

  }

  gItem_S1.clipped = true;
  gItem_S1.resize(scale,scale,true,true,true,true,scale,Transformation.TOP);

  gItem_S1 = getGroupByLevel(layerName,size+"-後片");
  gItem_S2 = getGroupByLevel(layerName,size2+"-後片");
  b1 = getBounds(gItem_S1.pathItems[0]);
  b2 = getBounds(gItem_S2.pathItems[0]);
  scale = (b2.width/b1.width)*100;


  try{
    item = groupItems.getByName("姓名");
    a = item.duplicate();
    alert(a);
    a.move(gItem_S1, ElementPlacement.PLACEATEND);

  }catch(e){

  }

  try{
    item = groupItems.getByName("大背號");
    a = item.duplicate();
    a.move(gItem_S1, ElementPlacement.PLACEATEND);

  }catch(e){

  }

  gItem_S1.clipped = true;
  gItem_S1.resize(scale,scale,true,true,true,true,scale,Transformation.TOP);

  try{
    item = groupItems.getByName("後片logo");
    a = item.duplicate();
    a.move(gItem_S1, ElementPlacement.PLACEATEND);
  }catch(e){

  }

  if (size == "L") {
    a.resize(scale,scale,true,true,true,true,scale);
  }

}

clothesResize("6扣棒球衣隊名處理-XL-縮放用","XL","2L",0);
clothesResize("6扣棒球衣隊名處理-L-縮放用","L","XS",-100);

// doc = app.activeDocument;
// var layer = doc.layers.getByName("L隊名");
// groupItems = layer.groupItems;
// gItem_XL = getGroupByLevel("6扣棒球衣隊名處理-XL-縮放用","XL");
// gItem_2L = getGroupByLevel("6扣棒球衣隊名處理-XL-縮放用","2L");
// b1 = getBounds(gItem_XL.pathItems[0]);
// b2 = getBounds(gItem_2L.pathItems[0]);
// scale = (b2.width/b1.width)*100;
// for (var i = 0; i < groupItems.length; i++) {
//   var item = groupItems[i];
//   a = item.duplicate();
//   a.move(gItem_XL, ElementPlacement.PLACEATEND);
// }
// gItem_XL.clipped = true;
// gItem_XL.resize(scale,scale,true,true,true,true,scale,Transformation.TOP);
