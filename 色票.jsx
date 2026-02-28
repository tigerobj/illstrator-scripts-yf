/*
 * BatchEPS2ASE_legacy.jsx
 * 兼容舊版 ExtendScript：不使用 Object.keys / let / const
 * 穩定掃描 EPS → 建色票群組 → 輸出 ASE（與 EPS 同名）
 * 支援：填色、描邊、漸層停駐點、文字填色/描邊；略過 PatternColor
 */

(function () {
  // ===== 偏好保存/恢復 =====
  var _uiBak = app.userInteractionLevel;
  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
  function restoreUI(){ app.userInteractionLevel = _uiBak; }

  // ===== 資料夾選取 =====
  var srcFolder = Folder.selectDialog("選擇含 EPS 的資料夾");
  if (!srcFolder) { restoreUI(); alert("未選取來源資料夾。"); return; }

  var outFolder = Folder.selectDialog("選擇 ASE 輸出資料夾");
  if (!outFolder) { restoreUI(); alert("未選取輸出資料夾。"); return; }

  var epsFiles = srcFolder.getFiles(function (f) {
    return f instanceof File && /\.eps$/i.test(f.name);
  });
  if (!epsFiles || epsFiles.length === 0) {
    restoreUI(); alert("此資料夾沒有 EPS。"); return;
  }

  // ===== 參數（可調）=====
  var MAX_COLORS = 256;        // 單檔最多收集多少顏色
  var ENABLE_TEXT_COLOR = true;

  // ===== 簡易 Map 實作（避免用 Object.keys）=====
  function MapLite() { this._k = []; this._v = []; }
  MapLite.prototype.has = function (key) {
    for (var i=0;i<this._k.length;i++) if (this._k[i]===key) return true;
    return false;
  };
  MapLite.prototype.set = function (key, val) {
    for (var i=0;i<this._k.length;i++) if (this._k[i]===key) { this._v[i]=val; return; }
    this._k.push(key); this._v.push(val);
  };
  MapLite.prototype.get = function (key) {
    for (var i=0;i<this._k.length;i++) if (this._k[i]===key) return this._v[i];
    return null;
  };
  MapLite.prototype.keys = function () { return this._k.slice(0); };
  MapLite.prototype.size = function () { return this._k.length; };

  // ===== 工具 =====
  function round4(n){ return Math.round(n*10000)/10000; }

  function colorKey(col){
    if (!col) return null;
    if (col.typename === "NoColor") return null;
    if (col.typename === "SpotColor") col = col.spot.color;
    if (col.typename === "GradientColor") return null; // 由停駐點處理
    if (col.typename === "PatternColor") return null;

    if (col.typename === "RGBColor")
      return "RGB:"+round4(col.red)+","+round4(col.green)+","+round4(col.blue);
    if (col.typename === "CMYKColor")
      return "CMYK:"+round4(col.cyan)+","+round4(col.magenta)+","+round4(col.yellow)+","+round4(col.black);
    if (col.typename === "GrayColor")
      return "GRAY:"+round4(col.gray);
    return null;
  }

  function cloneColor(col){
    if (!col) return null;
    if (col.typename === "SpotColor") col = col.spot.color;

    var out=null;
    if (col.typename === "RGBColor"){
      out = new RGBColor(); out.red=col.red; out.green=col.green; out.blue=col.blue;
    } else if (col.typename === "CMYKColor"){
      out = new CMYKColor(); out.cyan=col.cyan; out.magenta=col.magenta; out.yellow=col.yellow; out.black=col.black;
    } else if (col.typename === "GrayColor"){
      out = new GrayColor(); out.gray=col.gray;
    }
    return out;
  }

  function pushColor(mapLite, col){
    if (!col) return;
    if (col.typename === "NoColor") return;

    if (col.typename === "GradientColor"){
      var stops = col.gradient.gradientStops;
      for (var s=0; s<stops.length; s++){
        pushColor(mapLite, stops[s].color);
        if (mapLite.size() >= MAX_COLORS) return;
      }
      return;
    }
    if (col.typename === "PatternColor") return;

    var k = colorKey(col);
    if (!k) return;
    if (mapLite.has(k)) return;

    var cc = cloneColor(col);
    if (cc) mapLite.set(k, cc);
  }

  function collectDocumentColors(doc){
    var cmap = new MapLite();
    var items = doc.pageItems;
    var total = items.length;

    for (var i=0; i<total; i++){
      var it = items[i];

      try { if (it.filled)  pushColor(cmap, it.fillColor); } catch(e){}
      try { if (it.stroked) pushColor(cmap, it.strokeColor); } catch(e){}

      if (ENABLE_TEXT_COLOR && it.typename === "TextFrame"){
        try { pushColor(cmap, it.textRange.characterAttributes.fillColor); } catch(e){}
        try { pushColor(cmap, it.textRange.characterAttributes.strokeColor); } catch(e){}
      }

      if (cmap.size() >= MAX_COLORS) break;
    }
    return cmap;
  }

  function buildSwatchGroup(doc, groupName, cmap){
    // 刪同名群組
    var sg = doc.swatchGroups;
    for (var g=sg.length-1; g>=0; g--){
      try { if (sg[g].name === groupName) sg[g].remove(); } catch(e){}
    }

    var grp = doc.swatchGroups.add();
    grp.name = groupName;

    var ks = cmap.keys();
    for (var i=0; i<ks.length; i++){
      var key = ks[i];
      var col = cmap.get(key);
      if (!col) continue;

      var sw = doc.swatches.add();
      try { sw.name = key; } catch(e){}
      try { sw.color = col; } catch(e){}
      try { grp.addSwatch(sw); } catch(e){}
    }
    return grp;
  }

  function exportASE(doc, group, outFile){
    try { if (group && group.exportToASE){ group.exportToASE(outFile); return true; } } catch(e){}
    try { if (doc.exportToASE){ doc.exportToASE(outFile); return true; } } catch(e){}
    return false;
  }

  // ===== 主流程 =====
  var ok=0, failed=[];
  for (var i=0; i<epsFiles.length; i++){
    var f = epsFiles[i];
    try{
      var doc = app.open(f);

      var cmap = collectDocumentColors(doc);
      if (cmap.size() === 0){
        doc.close(SaveOptions.DONOTSAVECHANGES);
        failed.push(f.name + "（未偵測到顏色）");
        continue;
      }

      var base = decodeURI(f.name).replace(/\.eps$/i,"");
      var group = buildSwatchGroup(doc, base + "_colors", cmap);

      var aseFile = File(outFolder.fsName + "/" + base + ".ase");
      var okExport = exportASE(doc, group, aseFile);

      doc.close(SaveOptions.DONOTSAVECHANGES);
      if (okExport) ok++; else failed.push(f.name + "（版本不支援自動 ASE，請手動存）");

      $.sleep(50); $.gc();
    }catch(e){
      try{ app.activeDocument.close(SaveOptions.DONOTSAVECHANGES); }catch(_){}
      failed.push(f.name + "（錯誤：" + e + "）");
    }
  }

  restoreUI();
  var msg = "完成！成功輸出 ASE：" + ok + " / " + epsFiles.length;
  if (failed.length){ msg += "\n\n需要留意的檔案：\n- " + failed.join("\n- "); }
  alert(msg);
})();
