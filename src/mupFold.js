// \▼[CN=FOLD] // Fold Membrane - click handler v4.2
// ─── changelog ───────────────────────────────────────
// v4.2  2026.04.10(金) 🟢消えるバグ修正: _activeCN+MutationObserverでDOM再構築後に復元。ヘッダー全域クリックに対応
// v4.1  2026.04.10(金) 🟢をクリック/展開/メニュー時に付与に変更。selectionchange方式廃止（ネスト2重バグ解消）
// v4.0  2026.04.10(金) 🟢アクティブ膜マーク: WYSIWYG内でカーソルが入っている膜にdata-mup-active→CSS::afterで🟢表示
// v3.9  2026.04.09(木) CNアンカースクロール: エディタ切替時に対象膜のCNを記録→WYSIWYG起動後にscrollIntoView
// v3.8  2026.04.09(木) _isWYSIWYG変数の宣言漏れを修正（v3.5で消えてReferenceError→IIFE全壊）
// v3.7  2026.04.09(木) mouseup防止を削除・右クリックはbutton!==0でスルー。_ctxSelectorを単純化
// v3.6  2026.04.09(木) ラベルをWYSIWYG/プレビューで出し分け。名前span右クリックでメニュー表示。「名前をコピー」追加（mouseup追加が原因でcontextmenu不発）
// v3.5  2026.04.09(木) renderer側で全名前spanにclass=mup-name付与。mousedown/up+selectionchange三段構え
// v3.4  2026.04.09(木) selectionchange監視で名前span侵入カーソルを即座に追い出す（class未付与で不発）
// v3.3  2026.04.09(木) 名前spanにuser-select:none!importantを追加（カーソル阻止不完全）
// v3.2  2026.04.09(木) 名前span($...$部分)のみ矢印+編集阻止。//コメント・バッジは編集可
// v3.1  2026.04.09(木) WYSIWYGプロテクション全廃。右クリックメニュー対象を.mup-icoのみに限定
// v3.0  2026.04.09(木) mousedown保護: button判定を除去（右クリックも含む全ボタンで文字カーソル阻止）
// v2.9  2026.04.09(木) 対象を.mup-hd/.mup-ft行全体に修正（本文エリアは対象外）。WYSIWYGもMarkdownも同一ターゲット
// v2.8  2026.04.09(木) WYSIWYGプロテクション修正: contenteditable=false→mousedownキャプチャ方式に変更・contextmenuもキャプチャ相+stopImmediatePropagation
// v2.7  2026.04.09(木) WYSIWYGプロテクション: 膜全体を矢印カーソル・contenteditable=false・右クリック範囲を.mupに拡大
// v2.6  2026.04.09(木) 右クリックコンテキストメニュー追加（エディタ切替）
// v2.5  2026.04.06(月) 同名膜が複数あるときoccurrenceIndexを送信（index.ts側で正しい膜を更新）
// v2.4  2026.04.06(月) 閉じ膜クリック時のmup特定を親を1段ずつ辿る方式に変更（ネスト膜バグ修正）
// v2.3  2026.04.06(月) 閉じ膜▲アイコンクリックでも開閉トグル対応
// v2.2  2026.04.06(月) 開閉クリックを▼▶アイコン(.mup-ico)のみに限定
// v2.1  2026.03.31(火) 閉じ膜クリック機能を削除・安定版
// v2.0  2026.03.31(火) 栞ボタン(.mup-bookmark)クリック→エディタ切替 追加
// v1.0  2026.03.23(月) 初版（膜ヘッダークリックで開閉）
// ─────────────────────────────────────────────────────

// \▼[CN=FOLD.ACTIVE] // アクティブ膜管理（クリック/展開/メニュー時に🟢付与）
// 最後に操作した膜が1つだけ data-mup-active="true" を持つ。
// _activeCN: DOM再構築後にMutationObserverで復元するためCN文字列も保持する。
// mupStyle.css の > .mup-hd .mup-status::after でネスト膜には届かない。
var _activeCN = null;

function _setActiveMup(mupEl) {
  var prev = document.querySelector('.mup[data-mup-active="true"]');
  if (prev && prev !== mupEl) prev.removeAttribute('data-mup-active');
  _activeCN = mupEl ? mupEl.getAttribute('data-mup-cn') : null;
  if (mupEl) mupEl.setAttribute('data-mup-active', 'true');
}

// DOM再構築後（Joplinのnote更新による再レンダリング）にアクティブ状態を復元
// data.put → Joplin再レンダリング → DOMが作り直され data-mup-active が消える問題の対策
;(new MutationObserver(function() {
  if (!_activeCN) return;
  // ":not([data-mup-active])" でまだ未付与の場合だけ処理（無限ループ防止）
  var el = document.querySelector('.mup[data-mup-cn="' + _activeCN + '"]:not([data-mup-active])');
  if (el) el.setAttribute('data-mup-active', 'true');
})).observe(document.body, { childList: true, subtree: true });
// \▲[CN=FOLD.ACTIVE]

// \▼[CN=FOLD.CLICK] // クリックイベント
document.addEventListener('click', function(e) {

  // \▼[CN=FOLD.CLICK.HEADER] // ヘッダー・フッター全域クリック → アクティブ設定
  // .mup-ico のみでなく em(コメント)・.mup-name・余白すべてのクリックで🟢を付与
  var hdFt = e.target.closest('.mup-hd, .mup-ft');
  if (hdFt) {
    var mupFromHd = hdFt.closest('.mup');
    if (mupFromHd) _setActiveMup(mupFromHd);
  }
  // \▲[CN=FOLD.CLICK.HEADER]

  // \▼[CN=FOLD.CLICK.BOOKMARK] // 🔖しおりボタン: クリック→エディタ切替
  var bm = e.target.closest('.mup-bookmark');
  if (bm) {
    // 最後に操作したアクティブ膜→なければビューポート中央に最も近い膜をアンカーに
    var _anchorMup = document.querySelector('.mup[data-mup-active="true"]') || _findNearestVisibleMup();
    var _anchorCn  = _anchorMup ? _anchorMup.getAttribute('data-mup-cn') : null;
    webviewApi.postMessage('markMupRenderer', { type: 'mupToggleEditor', cn: _anchorCn });
    return;
  }
  // \▲[CN=FOLD.CLICK.BOOKMARK]

  // \▼[CN=FOLD.CLICK.TARGET] // クリック対象の特定（▼▶▲アイコンのみ）
  var ico0 = e.target.closest('.mup-ico');
  if (!ico0) return;
  var hdEl = ico0.closest('.mup-hd');
  var ftEl = ico0.closest('.mup-ft');
  if (!hdEl && !ftEl) return;
  // 開始膜: hd.parentElement = mup
  // 閉じ膜: ft → mup-bd → mup（closest不使用で1段ずつ辿る）
  var mup = hdEl
    ? hdEl.parentElement
    : (ftEl.parentElement ? ftEl.parentElement.parentElement : null);
  if (!mup || !mup.classList.contains('mup')) return;
  // \▲[CN=FOLD.CLICK.TARGET]

  // \▼[CN=FOLD.CLICK.LOCK] // ⊘ ロック確認
  if (mup.getAttribute('data-mup-locked') === 'true') return;
  // \▲[CN=FOLD.CLICK.LOCK]

  // \▼[CN=FOLD.CLICK.ELEMENTS] // 要素取得
  var hd   = mup.querySelector('.mup-hd');
  var bd   = mup.querySelector('.mup-bd');
  var ico  = hd ? hd.querySelector('.mup-ico') : null;
  var stEl = hd ? hd.querySelector('.mup-status') : null;
  if (!bd || !ico) return;
  var sym    = mup.getAttribute('data-mup-sym');
  var isOpen = bd.style.display !== 'none';
  // \▲[CN=FOLD.CLICK.ELEMENTS]

  // \▼[CN=FOLD.CLICK.TOGGLE] // 開閉トグル
  if (isOpen) {
    // \▼[CN=FOLD.CLICK.TOGGLE.CLOSE] // 折り畳む
    bd.style.display = 'none';
    ico.textContent  = sym === 'v' ? '▼▲' : '▶◀';
    if (stEl) mupStatusDraw(stEl, '⊖');
    // \▲[CN=FOLD.CLICK.TOGGLE.CLOSE]
  } else {
    // \▼[CN=FOLD.CLICK.TOGGLE.OPEN] // 展開する（カウント+1）
    bd.style.display = '';
    ico.textContent  = sym === 'v' ? '▼' : '▶';
    if (stEl) { mupStatusIncr(stEl); mupStatusDraw(stEl, '⊕'); }
    // \▲[CN=FOLD.CLICK.TOGGLE.OPEN]
  }
  // \▲[CN=FOLD.CLICK.TOGGLE]

  // \▼[CN=FOLD.CLICK.PERSIST] // Markdownソース書き戻し（contentScriptId必須）
  if (stEl) {
    var cn  = mup.getAttribute('data-mup-cn');
    var pfx = mup.getAttribute('data-mup-pfx') || 'CN'; // v2.1: pfx取得
    // 同名膜が複数あるとき何番目かを特定（0始まり）
    var allSameCn = document.querySelectorAll('.mup[data-mup-cn="'+cn+'"][data-mup-pfx="'+pfx+'"]');
    var occIdx = Array.prototype.indexOf.call(allSameCn, mup);
    webviewApi.postMessage('markMupRenderer', {
      type:  'mupToggle',
      cn:    cn,
      pfx:   pfx,
      state: isOpen ? '⊖' : '⊕',
      count: stEl.getAttribute('data-count'),
      exp:   stEl.getAttribute('data-exp'),
      occurrenceIndex: occIdx >= 0 ? occIdx : 0
    });
  }
  // \▲[CN=FOLD.CLICK.PERSIST]

});
// \▲[CN=FOLD.CLICK]

// \▼[CN=FOLD.INCR] // カウントインクリメント（∞は無視）
function mupStatusIncr(el) {
  var cnt = el.getAttribute('data-count');
  if (cnt === '∞') return;
  var n = parseInt(cnt)  || 0;
  var e = parseInt(el.getAttribute('data-exp')) || 0;
  n++;
  if (n > 99) { n = 0; e = Math.min(e + 1, 99); }
  el.setAttribute('data-count', String(n));
  el.setAttribute('data-exp',   String(e));
}
// \▲[CN=FOLD.INCR]

// \▼[CN=FOLD.DRAW] // ステータスバッジ再描画
function mupStatusDraw(el, newState) {
  var cnt = el.getAttribute('data-count');
  var exp = el.getAttribute('data-exp');
  var isInf = (cnt === '∞');
  el.textContent  = isInf
    ? '[' + newState + '∞]'
    : '[' + newState + cnt + '+' + exp + ']';
  el.style.color  = isInf ? '#e00' : '#aaa';
}
// \▲[CN=FOLD.DRAW]

// \▼[CN=FOLD.NEAREST] // ビューポート中央に最も近い .mup 要素を返す（スクロールアンカー用）
function _findNearestVisibleMup() {
  var mups = document.querySelectorAll('.mup');
  var best = null, bestDist = Infinity;
  var cy = window.innerHeight / 2;
  for (var i = 0; i < mups.length; i++) {
    var r = mups[i].getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) continue; // 画面外
    var dist = Math.abs(r.top + r.height / 2 - cy);
    if (dist < bestDist) { bestDist = dist; best = mups[i]; }
  }
  return best;
}
// \▲[CN=FOLD.NEAREST]

// \▼[CN=FOLD.CTX] // 右クリックコンテキストメニュー（エディタ切替）+ 名前部分プロテクション
(function() {
  var _isWYSIWYG = document.body.getAttribute('contenteditable') === 'true';

  // \▼[CN=FOLD.CTX.PROTECT] // WYSIWYG: 名前span($...$部分)のみ矢印カーソル・編集阻止
  // .mup-hd/.mup-ft 内で em(コメント) と .mup-status(バッジ) は編集可のままにする
  if (document.body.getAttribute('contenteditable') === 'true') {
    var _st = document.createElement('style');
    _st.textContent = [
      // ヘッダー・フッター全体はデフォルト矢印
      '.mup-hd,.mup-ft{cursor:default!important}',
      // 名前span(.mup-name): 矢印カーソル・選択不可
      '.mup-name{cursor:default!important;user-select:none!important}',
      // コメントemとバッジだけテキストカーソル・選択可に戻す
      '.mup-hd em,.mup-ft em,.mup-hd .mup-status'
        +'{cursor:text!important;user-select:text!important}'
    ].join('');
    document.head.appendChild(_st);

    // 編集可ゾーン(em, .mup-status)以外への操作を阻止するヘルパー
    function _inNameZone(target) {
      if (!target.closest('.mup-hd, .mup-ft')) return false; // ヘッダー・フッター外
      if (target.closest('em, .mup-status')) return false;   // 編集可ゾーンはスルー
      return true; // 名前span・アイコン・余白 = 阻止対象
    }

    // ① mousedown キャプチャ: 左クリックによるカーソル配置を阻止
    // 右クリック(button!==0)はスルー → contextmenuイベントが正常に発火する
    document.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      if (_inNameZone(e.target)) e.preventDefault();
    }, true);

    // ② selectionchange 監視: キーボードナビで名前spanに入ったら追い出す
    // .mup-name が正しく付与されているので closest('.mup-name') で確実に検知できる
    document.addEventListener('selectionchange', function() {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
      var range = sel.getRangeAt(0);
      var node = range.startContainer;
      var el = (node.nodeType === 3) ? node.parentElement : node;
      if (!el.closest('.mup-hd, .mup-ft')) return;  // ヘッダー・フッター外はスルー
      if (el.closest('em, .mup-status')) return;     // 編集可ゾーンはスルー
      // 名前span・アイコン・余白 → emの先頭へ追い出す
      var hd = el.closest('.mup-hd, .mup-ft');
      var em = hd ? hd.querySelector('em') : null;
      var newRange = document.createRange();
      if (em && em.firstChild) {
        newRange.setStart(em.firstChild, 0);
      } else if (em) {
        newRange.setStart(em, 0);
      } else {
        newRange.setStartAfter(hd);
      }
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    });
  }
  // \▲[CN=FOLD.CTX.PROTECT]

  // \▼[CN=FOLD.CTX.MENU] // コンテキストメニューDOM
  var _menu = document.createElement('div');
  _menu.id = 'mup-ctx';
  _menu.style.cssText = [
    'position:fixed','z-index:99999','display:none',
    'background:#fff','border:1px solid #ccc',
    'border-radius:5px','box-shadow:0 3px 10px rgba(0,0,0,0.18)',
    'padding:4px 0','min-width:160px','font-size:13px',
    'user-select:none','cursor:default'
  ].join(';');
  document.body.appendChild(_menu);

  var _ctxMup = null; // 右クリック時の .mup 要素（コピー等で使用）

  function _addItem(label, action) {
    var item = document.createElement('div');
    item.textContent = label;
    item.style.cssText = 'padding:7px 18px;color:#333;';
    item.onmouseenter = function(){ item.style.background='#e8f0fe'; item.style.color='#1a73e8'; };
    item.onmouseleave = function(){ item.style.background=''; item.style.color='#333'; };
    item.onclick = function(){ _hide(); action(); };
    _menu.appendChild(item);
  }
  function _addSep() {
    var sep = document.createElement('div');
    sep.style.cssText = 'height:1px;background:#eee;margin:3px 0;';
    _menu.appendChild(sep);
  }
  function _show(x, y, mupEl) {
    _ctxMup = mupEl || null;
    _menu.style.display = 'block';
    var mx = Math.min(x, window.innerWidth  - _menu.offsetWidth  - 8);
    var my = Math.min(y, window.innerHeight - _menu.offsetHeight - 8);
    _menu.style.left = Math.max(0, mx) + 'px';
    _menu.style.top  = Math.max(0, my) + 'px';
  }
  function _hide() { _menu.style.display = 'none'; }

  // ① エディタ切替: WYSIWYGでは「名前の編集」用途を明示、プレビューでは汎用ラベル
  _addItem(
    _isWYSIWYG ? '⇄ エディタ切替（名前の編集）' : '⇄ エディタ切替',
    function() {
      // 右クリックした膜のCNをアンカーとして送る（スクロール復元用）
      var cn = _ctxMup ? _ctxMup.getAttribute('data-mup-cn') : null;
      webviewApi.postMessage('markMupRenderer', { type: 'mupToggleEditor', cn: cn });
    }
  );
  // ② 名前をコピー: data-mup-cn属性からCN名を取得してクリップボードへ
  _addSep();
  _addItem('📋 名前をコピー', function() {
    var name = _ctxMup ? (_ctxMup.getAttribute('data-mup-cn') || '') : '';
    if (!name) return;
    navigator.clipboard.writeText(name).catch(function(){});
  });
  // \▲[CN=FOLD.CTX.MENU]

  // \▼[CN=FOLD.CTX.SCROLL] // WYSIWYG起動時: スクロールターゲット膜へ自動スクロール
  // Markdown→WYSIWYG切替後、index.tsが保持していたCNアンカーを照会しscrollIntoViewする
  if (_isWYSIWYG) {
    webviewApi.postMessage('markMupRenderer', { type: 'mupGetScrollTarget' })
      .then(function(res) {
        if (!res || !res.cn) return;
        // TinyMCEのレンダリング完了を待って実行
        setTimeout(function() {
          var el = document.querySelector('.mup[data-mup-cn="' + res.cn + '"]');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
      });
  }
  // \▲[CN=FOLD.CTX.SCROLL]

  // \▼[CN=FOLD.CTX.EVENT] // 右クリックイベント
  // 対象: .mup-ico と .mup-name — WYSIWYG・Markdownプレビュー共通
  // キャプチャ相(true) + stopImmediatePropagation でTinyMCEのメニューを完全抑制
  document.addEventListener('contextmenu', function(e) {
    var target = e.target.closest('.mup-ico, .mup-name');
    if (!target) { _hide(); return; }
    e.preventDefault();
    e.stopImmediatePropagation();
    var mupEl = e.target.closest('.mup');
    // 右クリックした膜を🟢アクティブに
    _setActiveMup(mupEl);
    _show(e.clientX, e.clientY, mupEl);
  }, true);
  document.addEventListener('click', function(e) {
    if (!_menu.contains(e.target)) _hide();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') _hide();
  });
  // \▲[CN=FOLD.CTX.EVENT]
})();
// \▲[CN=FOLD.CTX]

// \▲[CN=FOLD]
