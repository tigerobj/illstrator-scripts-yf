function sixButtonBaseballJersey() {

  //csvfilePath = "/開發/客戶圖檔/杰優、裕豐工廠產品/ai_script_workspace/ai_example/illustrator-scripts-master2/data.csv";
  //selectedValues.dxfLocation+"/"+value;
  csvfilePath = getPath("data.csv");

  myObject = readCsvToObj(new File(csvfilePath));

  //樣版前片
  var mypath = getPath(selectedValues.shirtFront);

  //var mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-前X2.dxf";
  var openDoc = app.open(File(mypath),DocumentColorSpace.CMYK);
  var layer =openDoc.layers['縫份'];
  var pageItem = layer.pageItems[0].pageItems[0];

  a = copyPageItem(pageItem);
  a.name = "左前";

  /*
  layer =openDoc.layers['針孔'];
  pageItem = layer.pageItems[0].pageItems[0];
  a_1 = copyPageItem(pageItem);
  a_1.name = "左前針孔";
  */

  //參考線
  layer =openDoc.layers['參考線'];
  pageItem = layer.pageItems[0].pageItems[0];
  c = copyPageItem(pageItem);
  c.name = '中心線';

  //線寬度
  //粘扣
  layer =openDoc.layers['粘扣'];
  pageItem = layer.pageItems[0].pageItems[0];
  p_1 = copyPageItem(pageItem);
  p_1.name = "左前線1";
  p_1.strokeWidth = myObject['線寬度'];  // 笔画宽度为 10 点
  //p_1.fillColor = lineFillColor;

  pageItem = layer.pageItems[1].pageItems[0];
  p_2 = copyPageItem(pageItem);
  p_2.name = "左前線2";
  p_2.strokeWidth = myObject['線寬度'];  // 笔画宽度为 10 点
  //p_2.fillColor = lineFillColor;


  //var mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-袖X2.dxf
  mypath = getPath(selectedValues.shirtSleeve);

  openDoc2 = app.open(File(mypath),DocumentColorSpace.CMYK);

  layer =openDoc2.layers['縫份'];
  pageItem = getItemByPlusMinus(layer,true);

  e = copyPageItem(pageItem);
  e.name = "左袖";
  //e.fillColor = sleeveFillColor;

  layer =openDoc2.layers['參考線'];
  pageItem = getItemByPlusMinus(layer,true);

  f = copyPageItem(pageItem);
  f.name = "左前線3"
  f.strokeWidth = myObject['線寬度'];  // 笔画宽度为 10 点
  //f.fillColor = lineFillColor;

  translationMatrix = moveToPoint(a,myObject['左前片點寬'],myObject['左前片點高'],e,myObject['左前袖點寬'],myObject['左前袖點高']);
  e.transform(translationMatrix);
  f.transform(translationMatrix);

  //旋轉
  list = [e,f];
  //這個用法
  //rotationAngle = getAngleDegreesByPt(p1,mm(myObject['左後袖旋轉半徑']),copy4_01,copy5_01,true,false);
  rotationPoint = getPoint(a,myObject['左前片點寬'],myObject['左前片點高']);
  angleDegrees(rotationPoint,myObject['左前袖旋轉半徑'],a,e,rotationDirection('前片交點狀態'),rotationDirection('前袖交點狀態'),list,rotationDirection('前袖旋轉方向'));


  //app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
  //mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-後內貼1襯1.dxf";
  //mypath = getPath(selectedValues.background)

  mypath = getPath(selectedValues.shirtCollar);
  openDoc3 = app.open(File(mypath),DocumentColorSpace.CMYK);

  layer =openDoc3.layers['縫份'];
  pageItem = layer.pageItems[0].pageItems[0];
  g = copyPageItem(pageItem);
  g.name = "後內貼";
  //g.fillColor = backInnerCollarFillColor;

  layer =openDoc3.layers['尺寸線'];
  pageItem = layer.pageItems[0].pageItems[0];
  g2 = copyPageItem(pageItem);
  g2.name = "後內遮罩";
  //移動後內遮罩跟領子高度對齊
  translationMatrix = app.getTranslationMatrix(0,mm(myObject['領口遮罩移動高度']));
  g2.transform(translationMatrix);
  // 创建剪切遮罩
  var groupItem = doc.layers[0].groupItems.add();

  g2.move(groupItem, ElementPlacement.PLACEATEND);
  g.move(groupItem, ElementPlacement.PLACEATEND);
  groupItem.clipped = true;
  groupItem.name = "後領遮罩",
  groupList =["後領遮罩"];
  //移動領子高度跟右袖對齊
  moveTeamName("左袖","中心線","領子點高",groupList);

  mirror(c,a,"右前");
  mirror(c,e,"右袖");
  mirror(c,f,"右前線3");
  mirror(c,p_1,"右前線1");
  mirror(c,p_2,"右前線2");

  //todo
  mypath = getPath(selectedValues.background);
  openDoc6 = app.open(File(mypath),DocumentColorSpace.CMYK);
  layer =openDoc6.layers['縫份'];
  pageItem = layer.pageItems[0].pageItems[0];
  openDoc6_01 = copyPageItem(pageItem);
  openDoc6_01.name = "底";
  movePageItemByHeight("左前","中心線",0,"底");
  //movePageItemByHeight


  var buttonsList = [60,80,98,98,98,98,98];
  drawCircle("中心線",5,buttonsList);


  groupList = ["隊名","前數字"];
  //mypath = getMypath("樣版前面隊名");
  mypath = selectedValues.dxfLocation+"/前隊名.ai"
  //mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/前隊名.ai";
  //alert(mypath);
  groupsCopy(doc,mypath,groupList);

  moveTeamName("左袖","中心線","隊名高度",groupList);

  //縮放模式 	比例
  if(myObject['縮放模式'] === "比例"){
  	//alert(myObject['縮放模式']);
  	//debug使用
  	boundaryBox = drawBoundingBoxForGroups(groupList,doc.layers[0]);
  	boundaryBox.name = "隊名邊框";

  	scaleFactor = selectedValues.ChestWidthRatio;
  	var transformations = [Transformation.BOTTOM, Transformation.TOP]; // 對應的縮放中心點
  	scalePageItems(scaleFactor, groupList, transformations);
  	moveTeamNameByScaleFactor("左袖","中心線","隊名高度",selectedValues.ChestHeightRatio,groupList);
  }


  doc.layers[0].name = "前示意圖";

  openDoc.close(SaveOptions.DONOTSAVECHANGES);
  openDoc2.close(SaveOptions.DONOTSAVECHANGES);
  openDoc3.close(SaveOptions.DONOTSAVECHANGES);
  openDoc6.close(SaveOptions.DONOTSAVECHANGES);

  var lrmargin = mm(50);
  //todo
  //movePageItem("前示意圖",-600);
  alignObjectsToLeftMargin("前示意圖",lrmargin,0);




  var backLayer = doc.layers.add();
  backLayer.name = "後示意圖";


  //app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
  //樣版後片
  //mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/L-P0811-後X1.dxf";
  mypath = getPath(selectedValues.shirtBack);

  openDoc4 = app.open(File(mypath),DocumentColorSpace.CMYK);
  layer =openDoc4.layers['縫份'];
  pageItem = layer.pageItems[0].pageItems[0];
  copy4_01 = copyPageItem(pageItem);
  copy4_01.name = "後片";

  layer =openDoc4.layers['參考線'];
  pageItem = layer.pageItems[0].pageItems[0];
  copy4_02 = copyPageItem(pageItem);
  copy4_02.name = "後領線";


  //myObject['隊名高度']
  app.activeDocument = doc;
  //app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

  mypath = getPath(selectedValues.shirtSleeve);
  openDoc5 = app.open(File(mypath),DocumentColorSpace.CMYK);

  layer =openDoc5.layers['縫份'];
  //得到下袖片縫份
  pageItem = getItemByPlusMinus(layer,false);
  copy5_01 = copyPageItem(pageItem);
  copy5_01.name = "左後袖";


  layer =openDoc5.layers['參考線'];
  //得到下袖片參考線
  pageItem = getItemByPlusMinus(layer,false);

  copy5_02 = copyPageItem(pageItem);
  copy5_02.name = "左後袖線";

  translationMatrix = moveToPoint(copy4_01,myObject['左後片點寬'],myObject['左後片點高'],copy5_01,myObject['左後袖點寬'],myObject['左後袖點高']);
  copy5_01.transform(translationMatrix);
  copy5_02.transform(translationMatrix);


  //旋轉
  list = [copy5_01,copy5_02];
  //這個用法
  //rotationAngle = getAngleDegreesByPt(p1,mm(myObject['左後袖旋轉半徑']),copy4_01,copy5_01,true,false);
  rotationPoint = getPoint(copy4_01,myObject['左後片點寬'],myObject['左後片點高']);

  angleDegrees(rotationPoint,myObject['左後袖旋轉半徑'],copy4_01,copy5_01,rotationDirection('後片交點狀態'),rotationDirection('後袖交點狀態'),list,rotationDirection('後袖旋轉方向'));


  //w = copy4_01.width - mm(myObject['左後片點寬']*2)+copy5_01.width;
  w = getMirrorWidth(copy4_01,copy5_01);
  mirrorByPt(copy5_01,"右後袖",w);
  w = getMirrorWidth(copy4_01,copy5_02);
  mirrorByPt(copy5_02,"右後袖線",w);

  //movePageItem("後示意圖",300);

  groupList = ["姓名","後背號"];

  //mypath = "D:/開發/客戶圖檔/簡單K/套圖範本/所有版型/禾羽7扣/L/MM/後姓名.ai";
  mypath = selectedValues.dxfLocation+"/後姓名.ai"
  //mypath = getMypath("樣版後背姓名");

  //樣版後背姓名
  groupsCopy(doc,mypath,groupList);
  //姓名高度


  /**
   * 移動文字到指定高度左右置中
   * "左後袖" -> topName ： 最高裁片名稱 "左袖"
   * "後片" -> centerName : 置中裁片名稱 "中心線"
   * "姓名高度" -> heightName ： 高度距離 mm,從csv檔案取得 "姓名高度"
   * groupList : 移動的所有名稱 ["隊名","前數字"]
   */


  moveTeamName("左後袖","後片","姓名高度",groupList);

  if(myObject['縮放模式'] === "比例"){
  	//alert(myObject['縮放模式']);
  	//debug使用
  	boundaryBox = drawBoundingBoxForGroups(groupList,doc.layers[0]);
  	boundaryBox.name = "姓名邊框";

  	scaleFactor = selectedValues.ChestWidthRatio;
  	var transformations = [Transformation.BOTTOM,Transformation.TOP]; // 對應的縮放中心點
  	scalePageItems(scaleFactor, groupList, transformations);
  	moveTeamNameByScaleFactor("左後袖","後片","姓名高度",selectedValues.ChestHeightRatio,groupList);
  }


  left = lrmargin;
  t1 = getPathItemByName("左袖").geometricBounds[1];
  t2 = getPathItemByName("左後袖").geometricBounds[1];
  //drawBoundaryBox("後示意圖");

  //

  //movePageItemLT("後示意圖",left,t1-t2);
  alignObjectsToRightMargin("後示意圖",left,t1-t2);
  //drawLineAtDistanceFromRight(50);
  openDoc4.close(SaveOptions.DONOTSAVECHANGES);
  openDoc5.close(SaveOptions.DONOTSAVECHANGES);


  var nameOrderList = [
      '鈕扣0', '鈕扣1', '鈕扣2', '鈕扣3', '鈕扣4', '鈕扣5', '鈕扣6',
      '隊名', '前數字', '右前線1', '右前線2', '右前線3',
      '左前線1', '左前線2', '左前線3', '後領遮罩', '中心線',
      '右前', '左前', '右袖', '左袖'
  ];

  // 調用函數進行排序
  reorderPageItemsInLayer("前示意圖", nameOrderList);

  var nameOrderList = [
      '後背號', '姓名', '右後袖線', '左後袖線', '後領線','後片', '右後袖',
      '左後袖'
  ];

  // 調用函數進行排序
  reorderPageItemsInLayer("後示意圖", nameOrderList);
}
