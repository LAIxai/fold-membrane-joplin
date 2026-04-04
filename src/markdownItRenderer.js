// \▼[CN=RENDERER] // Fold Membrane - markdown-it renderer
/**
 * @file    markdownItRenderer.js
 * @version 4.0
 * @date    2026.04.01(水)
 * @desc    v2.x-v3.x: 全行自前処理方式（renderMarkMup）。罫線・空行に副作用あり。
 *          v4.0: 全面リアーキテクチャ。膜行・栞行のみプレースホルダーに置換→
 *                markdown-itにネイティブ処理を委譲。罫線・空行・太字・リンク等は
 *                Joplin標準処理。renderMarkMup廃止。
 * @author  俊克 + Claude (Anthropic)
 * @desc    markMup膜記法をJoplinのMarkdown-itでHTMLレンダリングする
 */
'use strict';

// \▼[CN=RENDERER.CONST] // 定数
// 正式記法 ▼m[CN=...] と旧記法 $▼_M[CN=...]$ / $M▼[CN=...]$ の全形式を受理（後方互換）
var RE_O  = /^[ \t]*\$?(?:(▼|▶)m|(▼|▶)_[Mm🄼]|[Mm🄼](▼|▶))\[(CN|H[1-3])=([^\]]+)\]\$?/;
var RE_C  = /^[ \t]*\$?(?:(▲|◀)m|(▲|◀)_[Mm🄼]|[Mm🄼](▲|◀))\[(CN|H[1-3])=([^\]]+)\]\$?/;
// RE_BM: bracket形式ラベル=bm[1], 破損形式ラベル=bm[2]
var RE_BM     = /^[ \t]*(?:\$?(?:🔖m|🔖_[Mm🄼]|[Mm🄼]🔖)\[([^\]]*)\]\$?|🔖 ([^\n$]+))/;
var RE_BM_DIV = /<(?:div|span)[^>]*data-mup="bookmark"[^>]*data-mup-label="([^"]*)"[^>]*>/;
var DEPTH_COLORS = ['#9b6fc4','#5588cc','#4aaa6a','#c8a040','#cc7744','#44aacc'];
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
      var b={sym:om[1]||om[2]||om[3],pfx:pfx,cn:cn,startLine:i,endLine:-1,depth:stack.length,
             comment:parsed.comment,status:parsed.status};
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
      statusHtml=' <code class="mup-status"'
        +' data-count="'+escH(st.count)+'"'
        +' data-exp="'+escH(st.exp)+'"'
        +' style="font-size:0.8em;font-family:monospace;color:'+sCol+';background:none;border:none;padding:0">'
        +escH(dispTxt)+'</code>';
    }
    // \▲[CN=RENDERER.BUILD.STATUS]

    // \▼[CN=RENDERER.BUILD.OPEN] // 開始膜HTML
    var openHtml;
    if(hm){
      var lv=parseInt(hm[1]);
      var hfs=lv<=1?'1.5em':lv===2?'1.25em':'1.1em';
      openHtml='<div class="mup" data-mup-sym="'+escH(isV?'v':'h')+'" data-mup-pfx="'+escH(b.pfx)+'" data-mup-cn="'+escH(cn)+'"'
        +(isLocked?' data-mup-locked="true"':'')+' style="border-left:4px solid '+col+';margin:8px 0">'
        +'<div class="mup-hd" style="padding:4px 10px;cursor:'+(isLocked?'default':'pointer')+'">'
        +'<span class="mup-ico" style="color:'+col+';font-size:0.75em">'+ico+'</span>'
        +' <span class="mup-pfx-'+escH(b.pfx)+'" style="font-size:'+hfs+';font-weight:bold;display:inline;margin:0">'+escH(cn)+'</span>'
        +(comment?' <em style="color:#555"> // '+comment+'</em>':'')
        +statusHtml
        +'</div>'
        +'<div class="mup-bd" style="padding:2px 10px;'+bodyDisplay+'">';
    } else {
      openHtml='<div class="mup" data-mup-sym="'+escH(isV?'v':'h')+'" data-mup-pfx="'+escH(b.pfx)+'" data-mup-cn="'+escH(cn)+'"'
        +(isLocked?' data-mup-locked="true"':'')+' style="border-left:3px solid '+col+';margin:4px 0">'
        +'<div class="mup-hd" style="padding:3px 8px;background:#f8f8f8;font-size:0.85em;cursor:'+(isLocked?'default':'pointer')+';user-select:none">'
        +'<span class="mup-ico" style="color:'+col+'">'+ico+'</span>'
        +' <span style="font-family:monospace;color:#888">'+escH(cn)+'</span>'
        +(comment?' <em style="color:#555"> // '+comment+'</em>':'')
        +statusHtml
        +'</div>'
        +'<div class="mup-bd" style="padding:4px 8px;'+bodyDisplay+'">';
    }
    map[b.startLine]=openHtml;
    // \▲[CN=RENDERER.BUILD.OPEN]

    // \▼[CN=RENDERER.BUILD.CLOSE] // 終了膜HTML（フッター付き）
    if(b.endLine>=0){
      var cm2=RE_C.exec(lines[b.endLine]);
      var csym=cm2?(cm2[1]||cm2[2]||cm2[3]):'▲';
      map[b.endLine]='<div class="mup-ft" style="padding:2px 8px;background:#f8f8f8;font-size:0.8em;cursor:default;user-select:none;color:'+col+';opacity:0.7">'
        +'<span class="mup-ico">'+csym+'</span>'
        +' <span class="mup-pfx-'+escH(b.pfx)+'" style="font-family:monospace;color:#aaa">'+escH(cn)+'</span>'
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

        // \▼[CN=RENDERER.JOPLIN.MARKMUP] // 膜記法レンダラー（プレースホルダー方式 v4.0）
        // 膜行・栞行のみ名札に置換 → markdown-it がネイティブ処理 → 名札を膜divに差し替え
        markdownIt.core.ruler.push('markMup',function(state){
          var src=state.src;

          // 膜ノート検出: ▼m[ の3文字（正式）または旧記法
          if(src.indexOf('▼m[')<0 && src.indexOf('▶m[')<0 &&
             !/[▼▶▲◀]_[Mm🄼]\[|[Mm🄼][▼▶▲◀]\[|🔖_[Mm🄼]\[|[Mm🄼]🔖\[/.test(src)) return false;

          // \▼[CN=RENDERER.JOPLIN.MARKMUP.PREP] // 前処理・パース
          src=fixDisplaySrc(src);
          var lines=src.split('\n');
          var blocks=parseMembranes(lines);
          var htmlMap=buildMupHtmlMap(blocks,lines);
          // \▲[CN=RENDERER.JOPLIN.MARKMUP.PREP]

          // \▼[CN=RENDERER.JOPLIN.MARKMUP.PH] // プレースホルダーテーブル構築
          var phToHtml={}; // 名札文字列 → 膜HTML
          var lineToKey={}; // 行番号 → 名札文字列
          var idx=0;

          // 膜行（開始・終了）
          blocks.forEach(function(b){
            var okey='ZMUP'+(idx++)+'OZ';
            lineToKey[b.startLine]=okey;
            phToHtml[okey]=htmlMap[b.startLine]||'';
            if(b.endLine>=0){
              var ckey='ZMUP'+(idx++)+'CZ';
              lineToKey[b.endLine]=ckey;
              phToHtml[ckey]=htmlMap[b.endLine]||'';
            }
          });

          // 栞行
          lines.forEach(function(line,i){
            if(lineToKey[i]!==undefined) return;
            var bmmatch=null;
            if(RE_BM.test(line)) bmmatch=RE_BM.exec(line);
            else if(RE_BM_DIV.test(line)) bmmatch=RE_BM_DIV.exec(line);
            if(bmmatch){
              var bmlabel=escH(((bmmatch[1]||bmmatch[2]||'bookmark')).trim());
              var bmkey='ZMUP'+(idx++)+'BMZ';
              lineToKey[i]=bmkey;
              phToHtml[bmkey]='<div class="mup-bookmark"'
                +' data-mup="bookmark" data-mup-label="'+bmlabel+'"'
                +' style="display:inline-flex;align-items:center;gap:6px;'
                +'padding:3px 12px;background:#fff8e1;border:1px solid #ffcc02;'
                +'border-radius:16px;cursor:pointer;font-size:0.85em;'
                +'user-select:none;margin:4px 0;color:#5c4a00">'
                +'🔖 '+bmlabel+'</div>';
            }
          });
          // \▲[CN=RENDERER.JOPLIN.MARKMUP.PH]

          // \▼[CN=RENDERER.JOPLIN.MARKMUP.RENDER] // 名札置換 → markdown-it処理 → 差し替え
          // 膜行・栞行を名札に置換（それ以外はそのまま）
          var modSrc=lines.map(function(line,i){
            return lineToKey[i]!==undefined ? lineToKey[i] : line;
          }).join('\n');

          // markdown-it でネイティストレンダリング（名札が消えているので再帰しない）
          var html=markdownIt.render(modSrc);

          // 名札 → 膜HTML に差し替え
          // markdown-it は単独行テキストを <p>名札</p> にラップするので両パターン対応
          Object.keys(phToHtml).forEach(function(key){
            html=html.replace(new RegExp('<p>'+key+'<\\/p>\\n?','g'),phToHtml[key]);
            html=html.replace(new RegExp(key,'g'),phToHtml[key]); // 念のため
          });

          // tokens を差し替え
          state.tokens=[];
          var token=new state.Token('html_block','',0);
          token.content=html;
          token.map=[0,state.lineMax];
          state.tokens.push(token);
          return true;
          // \▲[CN=RENDERER.JOPLIN.MARKMUP.RENDER]
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
