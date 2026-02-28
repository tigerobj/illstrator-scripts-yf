var doc = app.activeDocument;
var sel = doc.selection;
if (sel.length !== 1) {
    alert("請選取一個物件！");
} else {
    sel[0].name = "邊界";
    doc.selection = null;
}
