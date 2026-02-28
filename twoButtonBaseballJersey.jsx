/**
 * openDoc 為目前己經打開的documents
 *
 */

function dxfCopyDoc(openDoc,layerName,myItemName){
  var layer =openDoc.layers[layerName];
  var pageItem = layer.pageItems[0].pageItems[0];
  a = copyPageItem(pageItem);
  a.name = myItemName;
}

function dxfCopyDocByIndex(openDoc,layerName,myItemName,index){
  var layer =openDoc.layers[layerName];
  var pageItem = layer.pageItems[index].pageItems[0];
  a = copyPageItem(pageItem);
  a.name = myItemName;
}

function dxfCopyGropDoc(openDoc,layerName,myItemName){
  var layer =openDoc.layers[layerName];
  if(layer.pageItems.length >0){
    var newGroup = doc.layers[0].groupItems.add();
    newGroup.name = myItemName;
  }

  for(var i=0;i<layer.pageItems.length;i++){
    pageItem = layer.pageItems[i].pageItems[0];
    a = copyPageItem(pageItem);
    a.name = myItemName+"_"+i;
    a.move(newGroup, ElementPlacement.PLACEATEND);
  }
}

function twoButtonBaseballJersey() {
  //csvfilePath = "/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2/data.csv";
  //selectedValues.dxfLocation+"/"+value;
  csvfilePath = getPath("data.csv");

  myObject = readCsvToObj(new File(csvfilePath));

  //樣版前片
  var mypath = getPath(selectedValues.shirtFront);
  //var mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-前X2.dxf";
  var openDoc = app.open(File(mypath),DocumentColorSpace.CMYK);
  dxfCopyDoc(openDoc,'縫份','前片');
  dxfCopyGropDoc(openDoc,'參考線','鈕扣線');
  dxfCopyDoc(openDoc,'粘扣','前線');

  mypath = getPath(selectedValues.shirtSleeve);
  var openDoc = app.open(File(mypath),DocumentColorSpace.CMYK);
  dxfCopyDocByIndex(openDoc,'縫份','左前袖',1);
  dxfCopyDocByIndex(openDoc,'參考線','左前線1',0);



}
