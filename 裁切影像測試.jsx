#include "對齊置中.jsx";
var doc = app.activeDocument;
var selection = doc.selection;

var targetLayer = doc.layers.getByName("圖層 5"); // 假設您選取了「左前」群組
items = targetLayer.pageItems;
var targetImg;

for (var i = 0; i < items.length; i++) {
    // 檢查是否為點陣影像（RasterItem）或 連結影像（PlacedItem）
    if (items[i].typename == "RasterItem" || items[i].typename == "PlacedItem") {
        targetImg = items[i];
        alert(targetImg.name);
        items[i].selected = true;
        break; // 找到第一個就停止
    }
}

if (targetImg) {
    alert("成功抓取影像物件！類型是：" + targetImg.typename);
}
// if (selection.length > 0) {
//     // 取得選取物件內的所有子物件
//     var allItems = selection[0].pageItems;
//     var targetImg = null;
//     var targetBg = null;
//
//     // 1. 精準尋找目標 (根據您的截圖名稱)
//     for (var i = 0; i < allItems.length; i++) {
//         var item = allItems[i];
//         // 尋找名稱包含 "影像" 的物件
//         if (item.name.indexOf("影像") !== -1 || item.typename == "RasterItem") {
//             targetImg = item;
//         }
//         // 尋找名稱為 "底色" 的物件
//         if (item.name == "底色") {
//             targetBg = item;
//         }
//     }
//
//     if (targetImg && targetBg) {
//         // 2. 關鍵步驟：獲取底色的幾何邊界
//         // 這是一個 [left, top, right, bottom] 的座標陣列
//         var cropBox = targetBg.geometricBounds;
//
//         // 3. 設定點陣化參數
//         var options = new RasterizeOptions();
//         options.transparent = true; // 透明背景
//         options.resolution = 300;    // 印刷用解析度
//         options.antiAliasingMethod = AntiAliasingMethod.ARTOPTIMIZED;
//
//         // 4. 執行實體裁切：將影像依照底色範圍重新產生
//         // 重點在於第二個參數 cropBox
//         doc.rasterize(targetImg, cropBox, options);
//
//         alert("裁切成功！影像已縮減至底色大小。");
//     } else {
//         alert("找不到目標：請確認物件名稱是否為『影像』與『底色』");
//     }
// } else {
//     alert("請先選取包含影像與底色的群組");
// }
