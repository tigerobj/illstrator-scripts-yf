#include "對齊置中.jsx";


//左袖不縮放複製至左袖
//先取得選取物件內的底色物件移動至縫份圖層內的左袖向下對齊,22.225mm為折車部份
a = bottomCenterXY("縫份", "左袖", 22.225,"底色");
//將不縮放複製並移到左袖對齊
item = findPageItemInGroup(app.activeDocument.selection[0], "不縮放");
moveItem = item.duplicate(item.layer, ElementPlacement.PLACEATBEGINNING);
moveItem.translate(a.left,a.top);
//將不縮放移至左袖物件內的第一個
targetItem = getPageItemByNameInLayer(app.activeDocument, "裁切", "左袖");
//move(doc.activeLayer, ElementPlacement.PLACEBEFORE);
moveItem.move(targetItem,ElementPlacement.PLACEATBEGINNING);

//取得袖口橫條舊遮罩底色置換成後片的底色
groupItem = findPageItemInGroup(moveItem,"袖口橫條");
newShape = findPageItemInGroupFirst(targetItem,"底色").duplicate();
replaceClippingByName(groupItem,"底色",newShape);



//center("縫份", "左袖");

//bottomCenter("縫份", "右袖", 22.225,"底色");

//findPageItemInGroup

// a = bottomCenterXY("縫份", "左袖", 22.225,"底色");
// var doc = app.activeDocument;
// var selectedItem = doc.selection[0];
// myItem = findPageItemInGroup(selectedItem,"左袖文字");
//
// targetItem = getPageItemByNameInLayer(doc,"裁切", "左袖")
//
// var duplicatedItem = myItem.duplicate(targetItem, ElementPlacement.PLACEATBEGINNING);
// duplicatedItem.translate(a.left,a.top);


// var itemA = app.activeDocument.selection[0];
//
// newItem = itemA.duplicate(itemA.layer, ElementPlacement.PLACEATBEGINNING);

// if (app.activeDocument.selection.length === 1) {
//     var item = app.activeDocument.selection[0];
//     scale = 1.5*100;
//     item.resize(
//         scale,      // scaleX：水平放大 150%
//         scale,       // scaleY：垂直縮小為 80%
//         true,     // 改變位置
//         true,     // 改變填色圖樣
//         false,    // 不改變漸層（保留漸層比例）
//         false
//     );
//
//     alert("縮放完成！");
// } else {
//     alert("請選取一個物件！");
// }

// var itemA = app.activeDocument.selection[0];
// newItem = itemA.duplicate();
// scale = 1.1*100;
// newItem.resize(scale,scale,true,true,false,false,0);
// alert(itemA.name);
// alert(newItem.name);
// bottomCenterByItems(itemA,"底色",newItem,"底色",0);
