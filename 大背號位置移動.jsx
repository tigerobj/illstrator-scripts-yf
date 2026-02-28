
#include "對齊置中.jsx";
#include "base.jsx";

var doc = app.activeDocument;
itemA = getGroupByThreeLevel("裁切","後片","不縮放","大背號");
if (doc.selection.length === 1) {
		itemB = doc.selection[0];
}
autoCenterByItem(itemA,itemB);
//referenceItem.parent

itemB.move(itemA.parent,ElementPlacement.PLACEATBEGINNING);
itemA.remove();
itemB.name= "大背號";


//ElementPlacement.PLACEATBEGINNING


//
// selectSize();
//
// alert(team2);
// alert(team6);
// alert(team2+team6);
// var xy = team1.split(',');
//
// var xy2 = team3.split(',');
// // 範例：在 (100, 500) 畫一個 300×150 的紅色長方形
// //xy[1]-mm(parseFloat(team2)+parseFloat(team6))
//
// //x = xy[0];
// //y = xy[1]
// drawRectangleCMYK(xy[0], xy[1]-mm(parseFloat(team2)+parseFloat(team6)), mm(team4), mm(team5), 0, 100, 100, 0,true);
//
// drawRectangleCMYK(xy2[0], xy2[1]-mm(6.35+parseFloat(team12)), mm(team10), mm(team11), 0, 100, 100, 0,false);


//drawRectangleCMYK(xy[0], xy[1]-mm(parseFloat(team2)), mm(team4), mm(team5), 0, 100, 100, 0);
