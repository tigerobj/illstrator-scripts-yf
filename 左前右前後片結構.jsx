#include "對齊置中.jsx";
#include "base.jsx";

function uniteTwoPathItems(item1, item2,newGroup) {
    // 先選取兩個物件
    app.selection = null;
		doc = app.activeDocument;
		item1.move(newGroup, ElementPlacement.PLACEATBEGINNING);
		item2.move(newGroup, ElementPlacement.PLACEATBEGINNING);
		item1.selected = true;
    item2.selected = true;
    // 呼叫 Unite（合併）
		// app.executeMenuCommand("group");         // 有些版本需要先群組
    app.executeMenuCommand("Live Pathfinder Add");
    app.executeMenuCommand("expandStyle");   // 將 Live Pathfinder 展開為實際物件
}

function addLayerByNameExt(targetLayerName,ext){
	try {
			var targetLayer = doc.layers.getByName(targetLayerName+"-"+ext);
	} catch(e){
			targetLayer = doc.layers.add();
			targetLayer.name = targetLayerName+"-"+ext;
	}
}

////2xl到6xl 一種  m到xl. 10到s 各一種

app.selection = null;
var doc = app.activeDocument;

function genStruct(baseName,size,ext,nextSize){
	targetLayerName = baseName+"-"+size;
	addLayerByNameExt(targetLayerName,ext);

	var targetLayer = doc.layers.getByName(targetLayerName+"-"+ext);
	//getPathItemByTwoLevel(layerName, groupLevel1, pathItemName)
	item1 = getPathItemByTwoLevel(targetLayerName,"左前", "底色").duplicate(targetLayer);
	item2 = getPathItemByTwoLevel(targetLayerName,"右前","底色").duplicate(targetLayer);
	var newGroup = targetLayer.groupItems.add();
	newGroup.name = size;
	uniteTwoPathItems(item1,item2,newGroup);


	item1 = getPathItemByTwoLevel( baseName+"-"+nextSize,"左前", "底色").duplicate(targetLayer);
	item2 = getPathItemByTwoLevel(baseName+"-"+nextSize,"右前","底色").duplicate(targetLayer);
	var newGroup = targetLayer.groupItems.add();
	newGroup.name = nextSize;
	uniteTwoPathItems(item1,item2,newGroup);

  var newGroup = targetLayer.groupItems.add();
  newGroup.name = size+"-後片";
  item1 = getPathItemByTwoLevel( baseName+"-"+size,"後片", "底色").duplicate(targetLayer);
  item1.move(newGroup, ElementPlacement.PLACEATEND);

  var newGroup = targetLayer.groupItems.add();
  newGroup.name = nextSize+"-後片";
  item1 = getPathItemByTwoLevel( baseName+"-"+nextSize,"後片", "底色").duplicate(targetLayer);
  item1.move(newGroup, ElementPlacement.PLACEATEND);

}

genStruct("6扣棒球衣隊名處理","XL","縮放用","2L");
genStruct("6扣棒球衣隊名處理","L","縮放用","XS");

// targetLayerName = "6扣棒球衣隊名處理-XL";
// ext = "縮放用";
// addLayerByNameExt(targetLayerName,ext);
//
// var targetLayer = doc.layers.getByName(targetLayerName+"-"+ext);
// //getPathItemByTwoLevel(layerName, groupLevel1, pathItemName)
// item1 = getPathItemByTwoLevel("6扣棒球衣隊名處理-XL","左前", "底色").duplicate(targetLayer);
// item2 = getPathItemByTwoLevel("6扣棒球衣隊名處理-XL","右前","底色").duplicate(targetLayer);
// var newGroup = targetLayer.groupItems.add();
// newGroup.name = "XL";
// uniteTwoPathItems(item1,item2,newGroup);
//
// item1 = getPathItemByTwoLevel("6扣棒球衣隊名處理-2L","左前", "底色").duplicate(targetLayer);
// item2 = getPathItemByTwoLevel("6扣棒球衣隊名處理-2L","右前","底色").duplicate(targetLayer);
// var newGroup = targetLayer.groupItems.add();
// newGroup.name = "2L";
// uniteTwoPathItems(item1,item2,newGroup);
//
//
//
// targetLayerName = "6扣棒球衣隊名處理-M";
// ext = "縮放用";
// addLayerByNameExt(targetLayerName,ext);
//
// var targetLayer = doc.layers.getByName(targetLayerName+"-"+ext);
// //getPathItemByTwoLevel(layerName, groupLevel1, pathItemName)
// item1 = getPathItemByTwoLevel("6扣棒球衣隊名處理-M","左前", "底色").duplicate(targetLayer);
// item2 = getPathItemByTwoLevel("6扣棒球衣隊名處理-M","右前","底色").duplicate(targetLayer);
// var newGroup = targetLayer.groupItems.add();
// newGroup.name = "M";
// uniteTwoPathItems(item1,item2,newGroup);
//
// item1 = getPathItemByTwoLevel("6扣棒球衣隊名處理-S","左前", "底色").duplicate(targetLayer);
// item2 = getPathItemByTwoLevel("6扣棒球衣隊名處理-S","右前","底色").duplicate(targetLayer);
// var newGroup = targetLayer.groupItems.add();
// newGroup.name = "S";
// uniteTwoPathItems(item1,item2,newGroup);




//
