// \▼[CN=RENDERER] // Fold Membrane - markdown-it renderer
/**
 * @file    markdownItRenderer.js
 * @version 2.7
 * @date    2026.03.30(月)
 * @desc    v2.0: H1=/H2=/H3= prefix型サポート、CN=H1旧形式廃止、pfx/cn分離
 *          v2.2: H1=型を<h1>→<span class="mup-pfx-*">に変更（TinyMCEの#変換を防止）; 閉じ膜フッターのpfx埋込み方式をclassに統一
 *          v2.3: $\▼[CN=...]$ / $\🔖[...]$ 形式（LaTeX保護記法）対応。`$形式と両立。
 *          v2.4: RE_BM_DOLLARを追加。$\🔖[...]$形式のとき data-mup-dollar="1" をボタンDIVに付与→repairMupSpanが$を復元可能に。
 *          v2.5: data-mup-dollar廃止→class="mup-dollar"で$\🔖[label]$のドル情報を保持（TinyMCEはdata-*を消すがclassは保持する）
 *          v2.6: A記法に全面切替（\▼→A▼, \🔖→A🔖等）。バックスラッシュ増殖問題の根本解決。
 *          v2.7: A記法→M記法（Membrane/膜の頭文字）
 * @author  俊克 + Claude (Anthropic)
 * @desc    markMup膜記法をJoplinのMarkdown-itでHTMLレンダリングする
 */
'use strict';

// \▼[CN=RENDERER.CONST] // 定数
var RE_O  = /^[ \t]*M(▼|▶)\[(CN|H[1-3])=([^\]]+)\]/;  // M▼ / M▶ 形式 / CN= と H1=/H2=/H3= 対応
var RE_C  = /^[ \t]*M(▲|◀)\[(CN|H[1-3])=([^\]]+)\]/;  // M▲ / M◀ 形式 / CN= と H1=/H2=/H3= 対応
var RE_BM        = /^[ \t]*M🔖\[([^\]]*)\]/;            // M🔖[ラベル] しおり＆エディタ切替ボタン
var RE_BM_DIV    = /<(?:div|span)[^>]*data-mup="bookmark"[^>]*data-mup-label="([^"]*)"[^>]*>/; // HTML div/span形式
var DEPTH_COLORS = ['#9b6fc4','#5588cc','#4aaa6a','#c8a040','#cc7744','#44aacc'];
var SN_CMDS = ['fnm','sur','spfx','sfx','pfx','orgdiv','orgname','orgaddress',
               'street','postcode','state','city','country','corresp','equalcont','email'];
// \▲[CN=RENDERER.CONST]

// \▼[CN=RENDERER.UTIL] // ユーティリティ
function escH(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function readBrace(s,from){
  var depth=0,i=from,out='';
  for(;i<s.length;i++){
    if(s[i]==='{'){if(depth>0)out+=s[i];depth++;}
    else if(s[i]==='}'){depth--;if(depth===0)return{content:out,end:i+1};out+=s[i];}
    else if(depth>0)out+=s[i];
  }
  return{content:out,end:i};
}
function applyFmt(s,cmd,op,cl){
  var re=new RegExp('\\\\'+cmd+'\\*?\\s*\\{','g'),m,out='',last=0;re.lastIndex=0;
  while((m=re.exec(s))!==null){
    var bi=s.indexOf('{',m.index+m[0].length-1);if(bi<0)continue;
    var r=readBrace(s,bi);out+=s.slice(last,m.index)+op+inlineStd(r.content)+cl;last=r.end;re.lastIndex=last;
  }
  return out+s.slice(last);
}
function expandSN(s){
  var pat=new RegExp('\\\\('+SN_CMDS.join('|')+')\\*?(?:\\[[^\\]]*\\])?\\s*\\{','g'),m,out='',last=0;
  pat.lastIndex=0;
  while((m=pat.exec(s))!==null){
    var bi=s.indexOf('{',m.index+m[0].length-1);if(bi<0)continue;
    var r=readBrace(s,bi);out+=s.slice(last,m.index)+r.content+' ';last=r.end;pat.lastIndex=last;
  }
  return (out+s.slice(last)).replace(/\s{2,}/g,' ').trim();
}
function inlineStd(s){
  if(!s)return'';
  var maths=[];
  s=s.replace(/\$\$([\s\S]*?)\$\$/g,function(_,m){var i=maths.length;maths.push('$$'+m+'$$');return'MPHZ'+i+'Z';});
  s=s.replace(/\$([^$\n]+?)\$/g,function(_,m){var i=maths.length;maths.push('$'+m+'$');return'MPHZ'+i+'Z';});
  s=s.replace(/\\\\/g,'<br>').replace(/\\ /g,' ').replace(/\\~/g,'\u00a0');
  s=applyFmt(s,'textbf','<strong>','</strong>');
  s=applyFmt(s,'textit','<em>','</em>');
  s=applyFmt(s,'emph','<em>','</em>');
  s=applyFmt(s,'texttt','<code>','</code>');
  s=applyFmt(s,'textrm','','');s=applyFmt(s,'text','','');
  s=s.replace(/\\url\s*\{([^{}]*)\}/g,'<a href="$1">$1</a>');
  s=s.replace(/\\&/g,'&amp;').replace(/\\%/g,'%').replace(/\\#/g,'#');
  s=s.replace(/---/g,'—').replace(/--/g,'–').replace(/``/g,'\u201c').replace(/''/g,'\u201d');
  s=s.replace(/\\(?:quad|qquad)\b/g,' ').replace(/\\[,;:!]/g,' ');
  s=s.replace(/\\(?:noindent|maketitle|qed|newline|hfill|vfill)\b\s*/g,'');
  var re2=/\\[a-zA-Z]+\*?\s*\{/g,m2,o='',l=0;re2.lastIndex=0;
  while((m2=re2.exec(s))!==null){
    var bi2=s.indexOf('{',m2.index+m2[0].length-1);if(bi2<0)continue;
    var r2=readBrace(s,bi2);o+=s.slice(l,m2.index)+r2.content;l=r2.end;re2.lastIndex=l;
  }
  s=o+s.slice(l);
  s=s.replace(/\\[a-zA-Z]+\b\*?\s*/g,'').replace(/\{([^{}]*)\}/g,'$1');
  s=s.replace(/\s{2,}/g,' ').trim();
  s=s.replace(/MPHZ(\d+)Z/g,function(_,i){return maths[parseInt(i)];});
  return s;
}
function inlineByMode(s,mode){
  return mode==='nature'?inlineStd(expandSN(s)):inlineStd(s);
}
// \▲[CN=RENDERER.UTIL]

// \▼[CN=RENDERER.PARSE] // 膜パーサー
function parseStatus(commentRaw){
  // \▼[CN=RENDERER.PARSE.STATUS] // [⊕/⊖/⊘ N+M] / [∞/♾️] / [N] を解析
  // ♾️(U+267E+FE0F絵文字) を ∞(U+221E数学記号) に正規化
  var raw=commentRaw.replace(/♾️/g,'∞').replace(/\u267e\ufe0f/g,'∞').replace(/\u267e/g,'∞');
  var m=raw.match(/^(.*?)\s*\[(⊕|⊖|⊘)(∞|\d+)?(?:\+(\d+))?\]\s*$/);
  if(m) return {comment:m[1].trim(),status:{state:m[2],count:m[3]||'0',exp:m[4]||'0'}};
  var m2=raw.match(/^(.*?)\s*\[∞\]\s*$/);      // 状態記号なし ∞/♾️
  if(m2) return {comment:m2[1].trim(),status:{state:'⊕',count:'∞',exp:'0'}};
  var m3=raw.match(/^(.*?)\s*\[(\d+)\]\s*$/);  // 状態記号なし 数値 → ⊕ N+0
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
      var raw=rawLine.replace(/\$`?\s*$/, '').trim(); // 末尾の $` または $ を除去（`$形式・$形式両対応）
      var parsed=parseStatus(raw);
      var pfx=om[2].trim(),cn=om[3].trim(); // pfx=(CN|H1|H2|H3), cn=名前
      var b={sym:om[1],pfx:pfx,cn:cn,startLine:i,endLine:-1,depth:stack.length,
             comment:parsed.comment, status:parsed.status};
      stack.push(b);blocks.push(b);
    } else if(cm){
      var cpfx=cm[2].trim(),ccn=cm[3].trim();
      for(var k=stack.length-1;k>=0;k--){
        if(stack[k].pfx===cpfx&&stack[k].cn===ccn){stack[k].endLine=i;stack.splice(k,1);break;}
      }
    }
  }
  return blocks;
}
// \▲[CN=RENDERER.PARSE]

// \▼[CN=RENDERER.HTML] // HTML生成
function renderMarkMup(src,mode){
  var lines=src.split('\n');
  var blocks=parseMembranes(lines);

  // \▼[CN=RENDERER.HTML.BLOCKMAP]
  var blockMap={};
  blocks.forEach(function(b){blockMap[b.startLine]=b;});
  // \▲[CN=RENDERER.HTML.BLOCKMAP]

  // \▼[CN=RENDERER.HTML.OPENINFO] // 開始膜の情報をCNキーで保持（フッター表示用）
  var openInfo={};
  // \▲[CN=RENDERER.HTML.OPENINFO]

  var html='<div class="mup-root">';
  var openStack=[];

  // \▼[CN=RENDERER.HTML.LOOP] // 全行処理
  for(var i=0;i<lines.length;i++){
    var line=lines[i];
    var b=blockMap[i];

    // \▼[CN=RENDERER.HTML.LOOP.OPEN] // 膜開始行
    if(b){
      var cn=b.cn,comment=escH(b.comment);
      var col=DEPTH_COLORS[b.depth%DEPTH_COLORS.length];
      var hm=/^H(\d+)$/i.exec(b.pfx); // v2.0: pfx=(H1|H2|H3) で見出し型判定
      var isV=(b.sym==='▼');
      var st=b.status;

      // \▼[CN=RENDERER.HTML.LOOP.OPEN.STATE] // 開閉初期状態・ロック判定
      var startOpen=isV;
      if(st){
        if(st.state==='⊕') startOpen=true;
        else if(st.state==='⊖'||st.state==='⊘') startOpen=false;
      }
      var bodyDisplay=startOpen?'':'display:none';
      var isLocked=st&&st.state==='⊘';
      var ico=startOpen?(isV?'▼':'▶'):(isV?'▼▲':'▶◀');
      // \▲[CN=RENDERER.HTML.LOOP.OPEN.STATE]

      // \▼[CN=RENDERER.HTML.LOOP.OPEN.STATUS] // ステータスバッジHTML
      // <code>タグを使用: TinyMCEが<span>を完全削除するのと異なり<code>はバックティック化して保持される
      // → WYSIWYG→Markdown変換でカウント値が消えるバグを防止。repairMupSpanで`[⊖N+M]`→[⊖N+M]に戻す。
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
      // \▲[CN=RENDERER.HTML.LOOP.OPEN.STATUS]

      // フッター表示用に開始情報を保存（v2.0: キーをpfx:cnに変更）
      openInfo[b.pfx+':'+cn]={col:col,sym:b.sym,pfx:b.pfx,comment:comment,isHeading:!!hm};

      if(hm){
        // \▼[CN=RENDERER.HTML.LOOP.OPEN.HEADING] // H1/H2/H3 型: ▼アイコン先頭→<span class="mup-pfx-*">cn→//comment
        // v2.2: <h1>→<span>に変更。理由: TinyMCEは<h1>を# headingに変換→repairMupSpanが復元不能。
        //        <span class="mup-pfx-H1">ならTinyMCEがspan保持→prefixもclassから検出可能。
        //        見出しスタイルはCSSで再現。//commentは開始膜のみ(仕様: optional)。
        var lv=parseInt(hm[1]);
        var hfs=lv<=1?'1.5em':lv===2?'1.25em':'1.1em'; // フォントサイズ（H1/H2/H3）
        html+='<div class="mup" data-mup-sym="'+escH(isV?'v':'h')+'" data-mup-pfx="'+escH(b.pfx)+'" data-mup-cn="'+escH(cn)+'"'
             +(isLocked?' data-mup-locked="true"':'')+' style="border-left:4px solid '+col+';margin:8px 0">'
             +'<div class="mup-hd" style="padding:4px 10px;cursor:'+(isLocked?'default':'pointer')+'">'
             +'<span class="mup-ico" style="color:'+col+';font-size:0.75em">'+ico+'</span>'
             +' <span class="mup-pfx-'+escH(b.pfx)+'" style="font-size:'+hfs+';font-weight:bold;display:inline;margin:0">'+escH(cn)+'</span>'
             +(comment?' <em style="color:#555"> // '+comment+'</em>':'')
             +statusHtml
             +'</div>'
             +'<div class="mup-bd" style="padding:2px 10px;'+bodyDisplay+'">';
        // \▲[CN=RENDERER.HTML.LOOP.OPEN.HEADING]
      } else {
        // \▼[CN=RENDERER.HTML.LOOP.OPEN.CN] // CN型: ▼アイコン先頭→monospace(cn)→//comment
        html+='<div class="mup" data-mup-sym="'+escH(isV?'v':'h')+'" data-mup-pfx="'+escH(b.pfx)+'" data-mup-cn="'+escH(cn)+'"'
             +(isLocked?' data-mup-locked="true"':'')+' style="border-left:3px solid '+col+';margin:4px 0">'
             +'<div class="mup-hd" style="padding:3px 8px;background:#f8f8f8;font-size:0.85em;cursor:'+(isLocked?'default':'pointer')+';user-select:none">'
             +'<span class="mup-ico" style="color:'+col+'">'+ico+'</span>'
             +' <span style="font-family:monospace;color:#888">'+escH(cn)+'</span>'
             +(comment?' <em style="color:#555"> // '+comment+'</em>':'')
             +statusHtml
             +'</div>'
             +'<div class="mup-bd" style="padding:4px 8px;'+bodyDisplay+'">';
        // \▲[CN=RENDERER.HTML.LOOP.OPEN.CN]
      }
      openStack.push(b.pfx+':'+cn); // v2.0: pfx:cn キーで管理
    // \▲[CN=RENDERER.HTML.LOOP.OPEN]

    // \▼[CN=RENDERER.HTML.LOOP.CLOSE] // 膜終了行（フッター表示付き）
    } else if(RE_C.test(line)){
      var cm2=RE_C.exec(line);
      var ccpfx=cm2[2].trim(); // pfx
      var ccn=cm2[3].trim();   // cn
      var csym=cm2[1]; // ▲ or ◀
      var ckey=ccpfx+':'+ccn;
      for(var si=openStack.length-1;si>=0;si--){
        if(openStack[si]===ckey){
          var info=openInfo[ckey]||{};
          var fcol=info.col||'#999';
          var fico=csym; // ▲ or ◀
          var fisH=info.isHeading;
          // \▼[CN=RENDERER.HTML.LOOP.CLOSE.FOOTER] // フッター：v2.2 pfxをclassで管理
          // v2.2: closeLabel から (H1) プレフィックスを削除。
          //        代わりに class="mup-pfx-{pfx}" でprefixを保持。
          //        repairMupSpanがclassからpfxを検出して\▲[H1=cn]を正確に復元する。
          html+='<div class="mup-ft" style="padding:2px 8px;background:#f8f8f8;font-size:0.8em;cursor:default;user-select:none;color:'+fcol+';opacity:0.7">'
               +'<span class="mup-ico">'+fico+'</span>'
               +' <span class="mup-pfx-'+escH(ccpfx)+'" style="font-family:monospace;color:#aaa">'+escH(ccn)+'</span>'
               +'</div>'
               +'</div>' // mup-bd close
               +'</div>'; // mup close
          // \▲[CN=RENDERER.HTML.LOOP.CLOSE.FOOTER]
          openStack.splice(si,1);
          break;
        }
      }
    // \▲[CN=RENDERER.HTML.LOOP.CLOSE]

    // \▼[CN=RENDERER.HTML.LOOP.BOOKMARK] // 🔖しおり＆エディタ切替ボタン行
    } else if(RE_BM.test(line)||RE_BM_DIV.test(line)){
      var bmmatch=RE_BM.test(line)?RE_BM.exec(line):RE_BM_DIV.exec(line);
      var bmlabel=escH((bmmatch[1]||'bookmark').trim());
      var bmClass='mup-bookmark';
      var bmStyle='display:inline-flex;align-items:center;gap:6px;'
           +'padding:3px 12px;background:#fff8e1;border:1px solid #ffcc02;'
           +'border-radius:16px;cursor:pointer;font-size:0.85em;'
           +'user-select:none;margin:4px 0;color:#5c4a00';
      html+='<div class="'+bmClass+'"'
           +' data-mup="bookmark" data-mup-label="'+bmlabel+'"'
           +' style="'+bmStyle+'">'
           +'🔖 '+bmlabel+'</div>';
    // \▲[CN=RENDERER.HTML.LOOP.BOOKMARK]

    // \▼[CN=RENDERER.HTML.LOOP.TEXT] // 通常テキスト行
    } else {
      if(line.trim()!==''){
        if(line.trim()==='<hr>'){
          // \▼[CN=RENDERER.HTML.LOOP.HR] // <hr>行→実HR要素（WYSIWYG変換パイプライン経由で罫線復元）
          html+='<hr>';
          // \▲[CN=RENDERER.HTML.LOOP.HR]
        } else if(/\$/.test(line)||/\\[a-zA-Z]/.test(line)){
          html+='<p style="margin:2px 0">'+inlineByMode(line,mode)+'</p>';
        } else {
          html+='<p style="margin:2px 0">'+escH(line)+'</p>';
        }
      }
    }
    // \▲[CN=RENDERER.HTML.LOOP.TEXT]
  }
  // \▲[CN=RENDERER.HTML.LOOP]

  // 閉じ忘れ
  for(var d=0;d<openStack.length;d++) html+='</div></div>';
  html+='</div>';
  return html;
}
// \▲[CN=RENDERER.HTML]

// \▼[CN=RENDERER.JOPLIN] // Joplinプラグイン登録
module.exports = {
  default: function(context) {
    return {
      plugin: function(markdownIt,_options){
        // \▼[CN=RENDERER.JOPLIN.MARKMUP] // 膜記法レンダラー（膜ありノート用）
        markdownIt.core.ruler.push('markMup',function(state){
          var src=state.src;
          if(!/M[▼▶▲◀]\[(CN|H[1-3])=|M🔖\[/.test(src)) return false;
          var mode=/^%\s*nature/im.test(src)?'nature':'std';
          state.tokens=[];
          var token=new state.Token('html_block','',0);
          token.content=renderMarkMup(src,mode);
          token.map=[0,state.lineMax];
          state.tokens.push(token);
          return true;
        });
        // \▲[CN=RENDERER.JOPLIN.MARKMUP]

        // \▼[CN=RENDERER.JOPLIN.HR] // <hr>段落→実HR要素変換（膜なしノート用・WYSIWYG変換パイプライン経由）
        // html:false時、<hr>は段落トークンになる。coreルールで実<hr>要素に変換し、
        // WYSIWYGモード切替時にTinyMCEが罫線として表示できるようにする。
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