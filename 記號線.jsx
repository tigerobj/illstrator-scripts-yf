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
    newGroup.name = "記號線";
    // 將選取物件移至「不複製」群組內
    selectedItem.move(newGroup, ElementPlacement.PLACEATBEGINNING);
    doc.selection = null;
}
