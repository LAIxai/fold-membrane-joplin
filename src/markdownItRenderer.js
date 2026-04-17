// \▼[CN=RENDERER] // Fold Membrane - markdown-it renderer
/**
 * @file    markdownItRenderer.js
 * @version 6.4
 * @date    2026.04.17(金)
 * @desc    v6.4 [2026.04.17(金)pm04:29]: 閉じ膜(.mup-ft)に<em> // comment </em>を常設。開始膜と構造対称化し
 *                カーソル配置可能に。↑↓脱出バグ解消＋次膜への繋ぎメモ記入可。
 *                閉じ行の `// ...` コメントを独立パースし、開始と別内容を書ける。
 * @desc    v6.3: 開始膜の🟢位置修正: バッジ<code>をmup-badge化し、mup-name直後に空span.mup-statusを追加。
 * @desc    v6.2: 🔖ボタン廃止。RE_BM/RE_BM_DIV削除。閉じ膜に.mup-statusスパン追加（🟢ボタン化対応）。
 * @desc    v6.1: 🟢永続化対応。ソースに🟢があればdata-mup-active="true"を.mupに付加。
 * @desc    v2.x-v3.x: 全行自前処理方式（renderMarkMup）。罫線・空行に副作用あり。
 *          v4.0: 全面リアーキテクチャ。膜行・栞行のみプレースホルダーに置換→
 *                markdown-itにネイティブ処理を委譲。罫線・空行・太字・リンク等は
 *                Joplin標準処理。renderMarkMup廃止。
 *          v4.1: 膜タグ行キャッシュ追加（行番号+内容が同じならparse/buildをスキップ）
 *          v5.0: state.tokens直接操作方式。markdownIt.render()の二重呼び出し排除。
 *                膜行・栞行トークン（paragraph_open+inline+paragraph_close）を
 *                html_blockトークンに直接差し替え。キー入力遅延を根本解消。
 *          v5.1: 膜ノート早期検出に🔖m[を追加（栞単独ノートでボタン非表示バグ修正）。
 *          v5.2: 複数行段落の分割対応。v5.0で「空行必須」になったregression修正。
 *                markdown-itが空行なし隣接行を1段落にまとめる場合でも、
 *                mup行単位で分割してhtml_blockに変換。空行なしの膜記法が再び動作。
 *          v5.3: カーソル形状改善。mup-hd-lblを導入しグレー背景をテキスト幅のみに縮小。
 *                .mup-icoのみcursor:pointer。CN名・コメントはcursor:text;user-select:text。
 *          v5.4: アイコンをcursor:default（矢印）に変更。閉じ膜mup-ftも inline-flex化。
 *          v5.5: 栞ボタンもcursor:default（矢印）に変更。
 *          v5.6: 折畳み全7状態インジケーター実装。
 *                analyzeBodyState追加。中身×リンク種別(⇄/⇒)を自動検出し、
 *                空膜=[🛒]、リンクのみ=⇄[🛒]/⇒[🛒]、中身+リンク=[⊖N] ⇄⇒ を表示。
 *          v5.7: RE_LINK_ME を /Me⇒|⇒Me/ に拡張。
 *                Me⇒{B}（自膜→先）・{A}⇒Me（他→自膜）も ⇒ アイコン表示対象に。
 *          v6.0: emのcursor:text/user-select:textをインラインから削除。
 *                プレビューは膜全体でカーソルを矢印に統一。
 *                WYSIWYGのみmupFold.jsがCSSで cursor:text!important を再適用。
 *          v5.9: 全名前spanにclass="mup-name"を付与。cursor:default化。mupFoldのプロテクション用。
 *          v5.8: 状態インジケーター（🛒/⇄/⇒）をDOM要素→data-mup-state属性+CSS::afterに変更。
 *                TinyMCEがシリアライズしても本文汚染ゼロ。mupStyle.css v1.2対応。
 * @author  俊克 + Claude (Anthropic)
 * @desc    markMup膜記法をJoplinのMarkdown-itでHTMLレンダリングする
 */
'use strict';

// \▼[CN=RENDERER.CONST] // 定数
// 正式記法 ▼m[CN=...] と旧記法 $▼_M[CN=...]$ / $M▼[CN=...]$ の全形式を受理（後方互換）
var RE_O  = /^[ \t]*\$?(?:(▼|▶)m|(▼|▶)_[Mm🄼]|[Mm🄼](▼|▶))\[(CN|H[1-3])=([^\]]+)\]\$?/;
var RE_C  = /^[ \t]*\$?(?:(▲|◀)m|(▲|◀)_[Mm🄼]|[Mm🄼](▲|◀))\[(CN|H[1-3])=([^\]]+)\]\$?/;
var DEPTH_COLORS = ['#9b6fc4','#5588cc','#4aaa6a','#c8a040','#cc7744','#44aacc'];
var RE_LINK_BIDIR = /⇄\s*\{/;   // 相互リンク記法 ⇄ {CN=...}
var RE_LINK_ME    = /Me⇒|⇒Me/;  // Me結合記法: {A}⇒Me⇒{B} / Me⇒{B} / {A}⇒Me
// \▲[CN=RENDERER.CONST]

// \▼[CN=RENDERER.UTIL] // ユーティリティ
function escH(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
// \▲[CN=RENDERER.UTIL]

// \▼[CN=RENDERER.FIXDISPLAY] // span破損を一時修復（データ書換なし・表示専用前処理）
// WYSIWYGがspan形式に破壊した膜・栞を描画前に一時修復する
function fixDisplaySrc(src) {
  // 開き膜: <span>▼</span><span class="mup-pfx-CN">name</span> → ▼m[CN=name]
  src = src.replace(/<span[^>]*>(▼|▶)<\/span>[ \t]*<span[^>]*class="[^"]*mup-pfx-([^"\s]+)[^"]*"[^>]*>([^<]*)<\/span>/g,
    function(_,arrow,pfx,cn){return arrow+'m['+pfx+'='+cn.trim()+']';});
  // 閉じ膜: ▲/◀ <span class="mup-pfx-CN">name</span> → ▲m[CN=name]
  src = src.replace(/(▲|◀)[ \t]*<span[^>]*class="[^"]*mup-pfx-([^"\s]+)[^"]*"[^>]*>([^<]*)<\/span>/g,
    function(_,arrow,pfx,cn){return arrow+'m['+pfx+'='+cn.trim()+']';});
  // 閉じ膜: <span>▲</span><span class="mup-pfx-CN">name</span> → ▲m[CN=name]
  src = src.replace(/<span[^>]*>(▲|◀)<\/span>[ \t]*<span[^>]*class="[^"]*mup-pfx-([^"\s]+)[^"]*"[^>]*>([^<]*)<\/span>/g,
    function(_,arrow,pfx,cn){return arrow+'m['+pfx+'='+cn.trim()+']';});
  return src;
}
// \▲[CN=RENDERER.FIXDISPLAY]

// \▼[CN=RENDERER.PARSE] // 膜パーサー
function parseStatus(commentRaw){
  // \▼[CN=RENDERER.PARSE.STATUS] // [⊕/⊖/⊘ N+M] / [∞/♾️] / [N] を解析
  var raw=commentRaw.replace(/♾️/g,'∞').replace(/\u267e\ufe0f/g,'∞').replace(/\u267e/g,'∞');
  var m=raw.match(/^(.*?)\s*\[(⊕|⊖|⊘)(∞|\d+)?(?:\+(\d+))?\]\s*$/);
  if(m) return {comment:m[1].trim(),status:{state:m[2],count:m[3]||'0',exp:m[4]||'0'}};
  var m2=raw.match(/^(.*?)\s*\[∞\]\s*$/);
  if(m2) return {comment:m2[1].trim(),status:{state:'⊕',count:'∞',exp:'0'}};
  var m3=raw.match(/^(.*?)\s*\[(\d+)\]\s*$/);
  if(m3) return {comment:m3[1].trim(),status:{state:'⊕',count:m3[2],exp:'0'}};
  return {comment:commentRaw.trim(),status:null};
  // \▲[CN=RENDERER.PARSE.STATUS]
}
function parseMembranes(lines){
  var blocks=[],stack=[];
  for(var i=0;i<lines.length;i++){
    var om=RE_O.exec(lines[i]),cm=RE_C.exec(lines[i]);
    if(om){
      var rawLine=(lines[i].match(/\/\/\s*(.+)$/)||[])[1]||'';
      var raw=rawLine.replace(/\$`?\s*$/,'').trim();
      var parsed=parseStatus(raw);
      var pfx=om[4].trim(),cn=om[5].trim();
      // 🟢アクティブマーク検出: ]$?の直後・//より前に🟢がある場合
      var _aft=lines[i].slice(om[0].length);
      var _si=_aft.indexOf('//');
      var _bfSl=_si>=0?_aft.slice(0,_si):_aft;
      var isActive=_bfSl.indexOf('🟢')>=0;
      var b={sym:om[1]||om[2]||om[3],pfx:pfx,cn:cn,startLine:i,endLine:-1,depth:stack.length,
             comment:parsed.comment,status:parsed.status,active:isActive};
      stack.push(b);blocks.push(b);
    } else if(cm){
      var cpfx=cm[4].trim(),ccn=cm[5].trim();
      for(var k=stack.length-1;k>=0;k--){
        if(stack[k].pfx===cpfx&&stack[k].cn===ccn){stack[k].endLine=i;stack.splice(k,1);break;}
      }
    }
  }
  return blocks;
}
// \▲[CN=RENDERER.PARSE]

// \▼[CN=RENDERER.ANALYZE] // 膜本文の状態解析（空/⇄リンク/⇒Me結合/テキスト）
// 各ブロックにhasText・hasBidir・hasMeLinkプロパティを付加する
function analyzeBodyState(blocks, lines){
  blocks.forEach(function(b){
    var hasText=false, hasBidir=false, hasMeLink=false;
    var end=b.endLine>=0 ? b.endLine : b.startLine+1;
    for(var i=b.startLine+1; i<end; i++){
      var line=lines[i];
      var trimmed=line.trim();
      if(!trimmed) continue;                          // 空行スキップ
      if(RE_O.test(line)||RE_C.test(line)) continue; // 膜タグ行スキップ
      if(RE_LINK_BIDIR.test(trimmed)){ hasBidir=true; continue; }
      if(RE_LINK_ME.test(trimmed))   { hasMeLink=true; continue; }
      hasText=true;
    }
    b.hasText=hasText; b.hasBidir=hasBidir; b.hasMeLink=hasMeLink;
  });
}
// \▲[CN=RENDERER.ANALYZE]

// \▼[CN=RENDERER.BUILD] // 膜HTML生成（行番号→HTMLマップ）
function buildMupHtmlMap(blocks, lines){
  var map={};
  blocks.forEach(function(b){
    var col=DEPTH_COLORS[b.depth%DEPTH_COLORS.length];
    var hm=/^H(\d+)$/i.exec(b.pfx);
    var isV=(b.sym==='▼');
    var st=b.status;
    var cn=b.cn;
    var comment=escH(b.comment);

    // \▼[CN=RENDERER.BUILD.STATE] // 開閉初期状態
    var startOpen=isV;
    if(st){
      if(st.state==='⊕') startOpen=true;
      else if(st.state==='⊖'||st.state==='⊘') startOpen=false;
    }
    var bodyDisplay=startOpen?'':'display:none';
    var isLocked=st&&st.state==='⊘';
    var ico=startOpen?(isV?'▼':'▶'):(isV?'▼▲':'▶◀');
    // \▲[CN=RENDERER.BUILD.STATE]

    // \▼[CN=RENDERER.BUILD.STATUS] // ステータスバッジHTML
    var statusHtml='';
    if(st){
      var isInf=(st.count==='∞');
      var dispTxt=isInf?'['+st.state+'∞]':'['+st.state+st.count+'+'+st.exp+']';
      var sCol=isInf?'#e00':'#aaa';
      statusHtml=' <code class="mup-badge"'
        +' data-count="'+escH(st.count)+'"'
        +' data-exp="'+escH(st.exp)+'"'
        +' style="font-size:0.8em;font-family:monospace;color:'+sCol+';background:none;border:none;padding:0">'
        +escH(dispTxt)+'</code>';
    }
    // \▲[CN=RENDERER.BUILD.STATUS]

    // \▼[CN=RENDERER.BUILD.INDICATOR] // 折畳み全7状態インジケーター（🛒/⇄/⇒）
    // data-mup-state 属性に状態値を持たせ CSS ::after で表示する。
    // DOM要素を生成しないためTinyMCEがシリアライズしても本文に🛒/⇄/⇒が混入しない。
    var linkPart=(b.hasBidir?'⇄':'')+(b.hasMeLink?'⇒':'');
    var mupStateVal='';
    if(!b.hasText){
      mupStateVal=linkPart+'[🛒]';   // 状態①②③: 空膜
    } else if(linkPart){
      mupStateVal=linkPart;           // 状態⑤⑥⑦: 中身あり+リンク
    }
    // 状態④: 中身あり・リンクなし → mupStateVal=''（属性なし）
    var mupStateAttr=mupStateVal?' data-mup-state="'+escH(mupStateVal)+'"':'';
    // \▲[CN=RENDERER.BUILD.INDICATOR]

    // \▼[CN=RENDERER.BUILD.OPEN] // 開始膜HTML
    var openHtml;
    if(hm){
      var lv=parseInt(hm[1]);
      var hfs=lv<=1?'1.5em':lv===2?'1.25em':'1.1em';
      openHtml='<div class="mup" data-mup-sym="'+escH(isV?'v':'h')+'" data-mup-pfx="'+escH(b.pfx)+'" data-mup-cn="'+escH(cn)+'"'
        +(isLocked?' data-mup-locked="true"':'')+(b.active?' data-mup-active="true"':'')+' style="border-left:4px solid '+col+';margin:8px 0">'
        +'<div class="mup-hd" style="padding:4px 10px;">'
        +'<span class="mup-hd-lbl" style="display:inline-flex;align-items:center;gap:2px;user-select:none;"'+mupStateAttr+'>'
        +'<span class="mup-ico" style="color:'+col+';font-size:0.75em;cursor:default">'+ico+'</span>'
        +'<span class="mup-name mup-pfx-'+escH(b.pfx)+'" style="font-size:'+hfs+';font-weight:bold;margin:0;cursor:default"> '+escH(cn)+'</span>'
        +'<span class="mup-status"></span>'
        +(comment?' <em style="color:#555;"> // '+comment+'</em>':'')
        +statusHtml
        +'</span>'
        +'</div>'
        +'<div class="mup-bd" style="padding:2px 10px;'+bodyDisplay+'">';
    } else {
      openHtml='<div class="mup" data-mup-sym="'+escH(isV?'v':'h')+'" data-mup-pfx="'+escH(b.pfx)+'" data-mup-cn="'+escH(cn)+'"'
        +(isLocked?' data-mup-locked="true"':'')+(b.active?' data-mup-active="true"':'')+' style="border-left:3px solid '+col+';margin:4px 0">'
        +'<div class="mup-hd" style="padding:3px 8px;font-size:0.85em;">'
        +'<span class="mup-hd-lbl" style="display:inline-flex;align-items:center;gap:2px;background:#f8f8f8;padding:1px 6px;border-radius:3px;user-select:none;"'+mupStateAttr+'>'
        +'<span class="mup-ico" style="color:'+col+';cursor:default">'+ico+'</span>'
        +'<span class="mup-name" style="font-family:monospace;color:#888;cursor:default"> '+escH(cn)+'</span>'
        +'<span class="mup-status"></span>'
        +(comment?' <em style="color:#555;"> // '+comment+'</em>':'')
        +statusHtml
        +'</span>'
        +'</div>'
        +'<div class="mup-bd" style="padding:4px 8px;'+bodyDisplay+'">';
    }
    map[b.startLine]=openHtml;
    // \▲[CN=RENDERER.BUILD.OPEN]

    // \▼[CN=RENDERER.BUILD.CLOSE] // 終了膜HTML（フッター付き）
    if(b.endLine>=0){
      var cm2=RE_C.exec(lines[b.endLine]);
      var csym=cm2?(cm2[1]||cm2[2]||cm2[3]):'▲';
      // v6.4: 閉じ膜にも <em> を常設（カーソル配置＋次膜への繋ぎメモ用）
      var closeRawLine=(lines[b.endLine].match(/\/\/\s*(.+)$/)||[])[1]||'';
      var closeComment=escH(closeRawLine.replace(/\$`?\s*$/,'').trim());
      map[b.endLine]='<div class="mup-ft" style="padding:2px 8px;font-size:0.8em;color:'+col+';opacity:0.7">'
        +'<span style="display:inline-flex;align-items:center;gap:2px;background:#f8f8f8;padding:1px 6px;border-radius:3px;user-select:none;">'
        +'<span class="mup-ico" style="cursor:default">'+csym+'</span>'
        +'<span class="mup-name mup-pfx-'+escH(b.pfx)+'" style="font-family:monospace;color:#aaa;cursor:default"> '+escH(cn)+'</span>'
        +'<span class="mup-status"></span>'
        +'</span>'
        +' <em style="color:#555;"> // '+closeComment+' </em>'
        +'</div>'
        +'</div>'  // mup-bd
        +'</div>'; // mup
    }
    // \▲[CN=RENDERER.BUILD.CLOSE]
  });
  return map;
}
// \▲[CN=RENDERER.BUILD]

// \▼[CN=RENDERER.JOPLIN] // Joplinプラグイン登録
module.exports = {
  default: function(context) {
    return {
      plugin: function(markdownIt,_options){

        // \▼[CN=RENDERER.JOPLIN.MARKMUP] // 膜記法レンダラー（state.tokens直接操作方式 v5.0）
        // 膜行・栞行のparagraph_open+inline+paragraph_closeトークンをhtml_blockに直接差し替え
        // markdownIt.render()の二重呼び出しを排除し、キー入力遅延を根本解消
        // v5.0: state.tokens直接操作（二重レンダリング排除） / v4.1: キャッシュ追加
        var _mupCache = { key: '', blocks: [], htmlMap: {} };
        markdownIt.core.ruler.push('markMup',function(state){
          var src=state.src;

          // 膜ノート検出: ▼m[ / ▶m[ の2文字（正式）または旧記法
          if(src.indexOf('▼m[')<0 && src.indexOf('▶m[')<0 &&
             !/[▼▶▲◀]_[Mm🄼]\[|[Mm🄼][▼▶▲◀]\[/.test(src)) return false;

          // \▼[CN=RENDERER.JOPLIN.MARKMUP.PREP] // 前処理・パース（キャッシュ付き）
          var rawLines=src.split('\n');
          // 膜タグ行 + 本文状態(T/B/M)をキャッシュキーに含める
          // → 空膜に中身を書いた瞬間に🛒→カウンター表示が正しく切り替わる
          var mupMembraneParts=[], mupBodyParts=[];
          rawLines.forEach(function(l,i){
            if(RE_O.test(l)||RE_C.test(l)){
              mupMembraneParts.push(i+':'+l);
            } else {
              var t=l.trim();
              if(t){
                if(RE_LINK_BIDIR.test(t))      mupBodyParts.push(i+':B');
                else if(RE_LINK_ME.test(t))    mupBodyParts.push(i+':M');
                else                            mupBodyParts.push(i+':T');
              }
            }
          });
          var mupKey=mupMembraneParts.join('\n')+'\n---\n'+mupBodyParts.join('\n');

          var blocks, htmlMap;
          if(mupKey===_mupCache.key && _mupCache.blocks.length>0){
            // キャッシュ利用
            blocks=_mupCache.blocks;
            htmlMap=_mupCache.htmlMap;
          } else {
            // キャッシュ更新
            var srcFixed=fixDisplaySrc(src);
            var lines=srcFixed.split('\n');
            blocks=parseMembranes(lines);
            analyzeBodyState(blocks,lines); // 全7状態の検出
            htmlMap=buildMupHtmlMap(blocks,lines);
            _mupCache.key=mupKey;
            _mupCache.blocks=blocks;
            _mupCache.htmlMap=htmlMap;
          }
          // \▲[CN=RENDERER.JOPLIN.MARKMUP.PREP]

          // \▼[CN=RENDERER.JOPLIN.MARKMUP.TOKENS] // state.tokens直接操作（v5.0 二重レンダリング排除）
          // 行番号 → 膜HTML マップを構築
          var mupLineHtml={};
          blocks.forEach(function(b){
            if(htmlMap[b.startLine]!==undefined) mupLineHtml[b.startLine]=htmlMap[b.startLine];
            if(b.endLine>=0&&htmlMap[b.endLine]!==undefined) mupLineHtml[b.endLine]=htmlMap[b.endLine];
          });

          // state.tokensを逆順スキャン: 膜行・栞行の paragraph_open+inline+paragraph_close を
          // html_block に差し替え。v5.2: 複数行段落もmup行で分割して対応（空行不要）。
          var tokens=state.tokens;
          for(var i=tokens.length-3;i>=0;i--){
            if(tokens[i].type!=='paragraph_open'||!tokens[i].map) continue;
            var lineStart=tokens[i].map[0];
            var lineEnd=tokens[i].map[1]; // exclusive

            // この段落範囲内にmup行があるか確認
            var hasMup=false;
            for(var ln=lineStart;ln<lineEnd;ln++){if(mupLineHtml[ln]!==undefined){hasMup=true;break;}}
            if(!hasMup) continue;

            if(lineEnd-lineStart===1){
              // 単行段落（最も一般的なケース・高速パス）
              var ht=new state.Token('html_block','',0);
              ht.content=mupLineHtml[lineStart];
              ht.map=[lineStart,lineEnd];
              tokens.splice(i,3,ht);
            } else {
              // 複数行段落（空行なし隣接行）: mup行で段落を分割
              // markdown-itが隣接行を1段落にまとめるため、mup行単位でhtml_blockに切り出す
              var inlineTok=tokens[i+1];
              var contentLines=(inlineTok&&inlineTok.content?inlineTok.content:'').split('\n');
              var newToks=[];
              var textBuf=[];
              var textLineStart2=lineStart;
              for(var li=0;li<lineEnd-lineStart;li++){
                var absLine=lineStart+li;
                if(mupLineHtml[absLine]!==undefined){
                  // テキストバッファをflush（非空の場合のみ）
                  if(textBuf.length>0&&textBuf.join('').replace(/\s/g,'')!==''){
                    var poNew=new state.Token('paragraph_open','p',1);
                    poNew.map=[textLineStart2,absLine];
                    var inlNew=new state.Token('inline','',0);
                    inlNew.content=textBuf.join('\n');
                    inlNew.children=[];
                    state.md.inline.parse(inlNew.content,state.md,state.env,inlNew.children);
                    var pcNew=new state.Token('paragraph_close','p',-1);
                    newToks.push(poNew,inlNew,pcNew);
                    textBuf=[];
                  }
                  // mup行をhtml_blockとして追加
                  var htSplit=new state.Token('html_block','',0);
                  htSplit.content=mupLineHtml[absLine];
                  htSplit.map=[absLine,absLine+1];
                  newToks.push(htSplit);
                  textLineStart2=absLine+1;
                } else {
                  textBuf.push(contentLines[li]||'');
                }
              }
              // 残りテキストをflush
              if(textBuf.length>0&&textBuf.join('').replace(/\s/g,'')!==''){
                var poRem=new state.Token('paragraph_open','p',1);
                poRem.map=[textLineStart2,lineEnd];
                var inlRem=new state.Token('inline','',0);
                inlRem.content=textBuf.join('\n');
                inlRem.children=[];
                state.md.inline.parse(inlRem.content,state.md,state.env,inlRem.children);
                var pcRem=new state.Token('paragraph_close','p',-1);
                newToks.push(poRem,inlRem,pcRem);
              }
              // splice（spread演算子の代わりにapplyで安全に）
              Array.prototype.splice.apply(tokens,[i,3].concat(newToks));
            }
          }
          return true;
          // \▲[CN=RENDERER.JOPLIN.MARKMUP.TOKENS]
        });
        // \▲[CN=RENDERER.JOPLIN.MARKMUP]

        // \▼[CN=RENDERER.JOPLIN.HR] // <hr>段落→実HR要素変換（膜なしノート用）
        // Joplin html:false時、<hr>直書き行は段落トークンになる。
        // coreルールで実<hr>要素に変換し、WYSIWYGが罫線として表示できるようにする。
        markdownIt.core.ruler.push('mup_hr',function(state){
          var tokens=state.tokens;
          for(var i=tokens.length-3;i>=0;i--){
            if(tokens[i].type==='paragraph_open'&&
               tokens[i+1]&&tokens[i+1].type==='inline'&&
               tokens[i+1].content.trim()==='<hr>'&&
               tokens[i+2]&&tokens[i+2].type==='paragraph_close'){
              var hrToken=new state.Token('html_block','',0);
              hrToken.content='<hr>\n';
              hrToken.map=tokens[i].map;
              tokens.splice(i,3,hrToken);
            }
          }
        });
        // \▲[CN=RENDERER.JOPLIN.HR]
      },
      assets: function(){ return [{name:'mupFold.js'},{name:'mupStyle.css'}]; },
    };
  }
};
// \▲[CN=RENDERER.JOPLIN]

// \▲[CN=RENDERER]
