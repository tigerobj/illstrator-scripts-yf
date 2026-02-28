/**
 * 取得或建立圖層
 */
function getOrCreateLayer(doc, layerName) {
    for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].name === layerName) {
            return doc.layers[i];
        }
    }
    var layer = doc.layers.add();
    layer.name = layerName;
    return layer;
}


/**
 * 取得或建立群組（parent 可為 Layer 或 GroupItem）
 */
function getOrCreateGroup(parent, name) {
    for (var i = 0; i < parent.groupItems.length; i++) {
        if (parent.groupItems[i].name === name) {
            return parent.groupItems[i];
        }
    }
    var g = parent.groupItems.add();
    g.name = name;
    return g;
}


/**
 * 建立「套圖」圖層與其下範本結構
 */
function buildTemplateLayerStructure() {

    var doc = app.activeDocument;

    // === 最上層：套圖（圖層）===
    var tplLayer = getOrCreateLayer(doc, "套圖");

    // === 左袖範本 ===
    var leftSleeveTpl = getOrCreateGroup(tplLayer, "左袖範本");
		getOrCreateGroup(leftSleeveTpl, "左袖");
		getOrCreateGroup(leftSleeveTpl, "左袖縫份");


    // === 右袖範本 ===
    var rightSleeveTpl = getOrCreateGroup(tplLayer, "右袖範本");
    getOrCreateGroup(rightSleeveTpl, "右袖");
		getOrCreateGroup(rightSleeveTpl, "右袖縫份");

    // === 前片範本 ===
    var frontTpl = getOrCreateGroup(tplLayer, "前片範本");
		getOrCreateGroup(frontTpl, "前片");
    getOrCreateGroup(frontTpl, "前片縫份");


    return tplLayer;
}

buildTemplateLayerStructure();
