#include "對齊置中.jsx";


function duplicateToLayer(item, layerName) {
    var doc = app.activeDocument;
    var targetLayer;

    // 嘗試找到指定名稱的圖層
    try {
        targetLayer = doc.layers.getByName(layerName);
    } catch (e) {
        alert("找不到圖層：" + layerName);
        return null;
    }

    // 複製物件並移到指定圖層
    var newItem = item.duplicate(targetLayer, ElementPlacement.PLACEATBEGINNING);
    item.selected = false;
    newItem.selected = true;
    return newItem;
}

function addGroupDuplicate(){
  var doc = app.activeDocument;
  var sel = doc.selection;
  if (sel.length !== 1) {
      alert("請選取一個物件！");
  } else {
      var selectedItem = sel[0];

      var parentGroup = selectedItem.parent;

      // 在「右前」建立新群組「不複製」
      var newGroup = parentGroup.groupItems.add();
      newGroup.move(selectedItem, ElementPlacement.PLACEBEFORE);
      newGroup.name = "不複製";
      // 將選取物件移至「不複製」群組內
      selectedItem.move(newGroup, ElementPlacement.PLACEATBEGINNING);

  }


}

//直條紋複製 成二個分別為a跟b

doc = app.activeDocument;
sel = doc.selection[0];
sel.selected = false;
if(sel.name == "不複製"){
    sel = sel.pageItems[0];
}

a = duplicateToLayer(sel,"裁切");
b = a.duplicate();
a.selected = true;
b.selected = false;
//

autoCenterBySelectNameAndItem("裁切", "左前" , "底色",a);
buttonsItem = getPageItemByNameInLayer(doc,"縫份","左前鈕扣");
oenButtons = findPageItemInGroupFirst(buttonsItem,"1");
centerByItem(oenButtons,a);
targetParent = getPageItemByNameInLayer(doc,"裁切","左前");
targetItem = findPageItemInGroupFirst(targetParent,"底色");
a.move(targetItem, ElementPlacement.PLACEBEFORE);
replaceClippingByName(a,"底色",targetItem.duplicate());
addGroupDuplicate();


a.selected = false;
b.selected = true;
autoCenterBySelectNameAndItem("裁切", "右前" , "底色",b);
buttonsItemB = getPageItemByNameInLayer(doc,"縫份","右前鈕扣");
oenButtonsB = findPageItemInGroupFirst(buttonsItemB,"1");
centerByItem(oenButtonsB,b);
targetParentB = getPageItemByNameInLayer(doc,"裁切","右前");
targetItemB = findPageItemInGroupFirst(targetParentB,"底色");
b.move(targetItemB, ElementPlacement.PLACEBEFORE);
replaceClippingByName(b,"底色",targetItemB.duplicate());
addGroupDuplicate();

doc.selection = null;


// //左袖不縮放複製至左袖
// //先取得選取物件內的底色物件移動至縫份圖層內的左袖向下對齊,22.225mm為折車部份
// a = bottomCenterXY("縫份", "左袖", 22.225,"底色");
// //將不縮放複製並移到左袖對齊
// item = findPageItemInGroup(app.activeDocument.selection[0], "不縮放");
// moveItem = item.duplicate(item.layer, ElementPlacement.PLACEATBEGINNING);
// moveItem.translate(a.left,a.top);
// //將不縮放移至左袖物件內的第一個
// targetItem = getPageItemByNameInLayer(app.activeDocument, "裁切", "左袖");
// //move(doc.activeLayer, ElementPlacement.PLACEBEFORE);
// moveItem.move(targetItem,ElementPlacement.PLACEATBEGINNING);
//
// //取得袖口橫條舊遮罩底色置換成後片的底色
// groupItem = findPageItemInGroup(moveItem,"袖口橫條");
// newShape = findPageItemInGroupFirst(targetItem,"底色").duplicate();
// replaceClippingByName(groupItem,"底色",newShape);
