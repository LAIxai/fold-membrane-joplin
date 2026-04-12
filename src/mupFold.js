// \▼[CN=FOLD] // Fold Membrane - click handler v6.0
// ─── changelog ───────────────────────────────────────
// v6.5  2026.04.12(日) バッジ操作バグ修正: hd.querySelector('.mup-status')→'.mup-badge'
//                      v6.3のクラス名変更(mup-status→mup-badge)後、stElが🟢スパンを指していた
//                      → mupStatusDraw/Incrが🟢スパンに書き込みnull表示・カウントリセット
// v6.4  2026.04.12(日) バグ#1修正: WYSIWYGで🟢スパンにカーソルが入るバグ
//                      FOLD.CTX.PROTECT: .mup-statusを編集可ゾーンから外す。selectionchangeで
//                      .mup-statusに入ったらem末尾へ（←キーの対称バウンス）
//                      バグ#2修正: Markdownモード2sポーリングでソース🟢削除を即時反映
//                      _activeCN≠sourceCnを検出→_setActiveMup(null)+mupSetActive(null)
// v6.3  2026.04.12(日) バグ#1修正: WYSIWYG起動時🟢未表示
//                      FOLD.ACTIVE.INITに600msフォールバック追加: _activeCNがnullならmupGetActiveCnで復元
//                      改良点#1: FOLD.TOC.INITを条件なし常時ポーリングに変更（パネル前セッション表示に対応）
// v6.2  2026.04.12(日) パネルクリック無効バグ修正: モード切替後にmupFold.js再初期化→_tocPollTimerリセット
//                      起動時にmupIsTocVisibleでパネル状態を照会→表示中ならポーリング自動再開
// v6.1  2026.04.11(土) パネル表示バグ修正: Pull型ポーリング対応(_startTocPoll毎回送信)
//                      メニュー名英語化: "🟢 Scroll to active membrane" / "🗂 Membranes Index"
// v6.0  2026.04.11(土) 膜目次パネルをjoplin.views.panels外部パネルに刷新（ノートの外に独立表示）
//                      🗂 膜一覧をScrollメニューに移動。膜色対応。name🟢//comment形式。
//                      _collectMupData()でpanelに膜情報送信。ポーリングでクリック受取。
// v5.9  2026.04.11(土) 膜目次パネル（FOLD.TOC.PANEL）追加: 膜メニューに「📋 膜一覧」→フローティングパネル
//                      クリック → 🟢をその膜に移動 + 自動スクロール
// v5.8  2026.04.11(土) バグ修正2件: ①WYSIWYG時もmupSetActiveを送信(editor.setTextはindex.ts側でスキップ)
//                      ②入れ子膜の閉じ膜🟢重複: > .mup-bd > .mup-ftでセレクター厳密化
// v5.7  2026.04.11(土) 🟢ホバー時ツールチップ追加: CSS::beforeでSwitch editor表示（v5.7a: _isWYSIWYGスコープバグ修正）
// v5.6  2026.04.11(土) 🔖ボタン廃止。🟢をクリック可能なボタンに変更（エディタ切替機能継承）。
//                      閉じ膜にも🟢表示（markdownItRenderer v6.2で.mup-status追加）。
//                      FOLD.CLICK.BOOKMARK → FOLD.CLICK.GREEN_BTN に置換。
// v5.5  2026.04.11(土) _scrollToCn後にmupSyncScrollをpostMessage→index.tsがfocusElement+↓キー送信
//                      webview内JS KeyboardEventはBlink組み込みスクロールに届かない→OS経由に変更
// v5.4  2026.04.11(土) _triggerSyncScroll: KeyboardEvent(ArrowDown)dispatch方式に変更
//                      ユーザー発見「Note viewerフォーカス+矢印キー」を再現
// v5.3  2026.04.11(土) _triggerSyncScroll: scrollBy+WheelEvent+scroll dispatchの3段構え
//                      遅延を150ms→400msに延長（モード切替直後のJoplin初期化待ち）
// v5.2  2026.04.11(土) FOLD.CTX.SCROLL_MENUをcapture phase化→WYSIWYG対応
//                      _activeCNがある時のみTinyMCEのメニューを抑制（ない時は通常メニュー）
// v5.1  2026.04.11(土) バグ修正: contextmenuで_setActiveMupを呼ばない（右クリックで🟢が付くバグ）
//                      「🟢 Scroll to active membrane」を膜メニューから削除→膜以外の右クリックメニューに移動
// v5.0  2026.04.11(土) _scrollToCn後にwindow.scrollBy(0,1)でSync Scroll起動→左ペイン同期
//                      コンテキストメニューに「🟢 アクティブ膜にスクロール」追加
// v4.9  2026.04.10(金) バグ#2修正: mupInitialScrollToCnを削除→mupScrollToCn→CodeMirror移動→Sync Scrollがプレビューを引きずるバグ根絶
//                      バグ#1修正試み: scrollIntoViewを300ms+1200msの2段構えに（Joplin初期化リセット対策）
// v4.8  2026.04.10(金) Bug#1修正: FOLD.ACTIVE.INIT にMutationObserver追加→描画後のdata-mup-activeを確実に検出+自動スクロール
//                      Bug#2修正: _show()でTinyMCEのbody置換で消えた_menuを再アタッチ
// v4.7  2026.04.10(金) 🟢永続化: Markdownモードでクリック→mupSetActive送信→index.tsがノートソースに🟢書込み。起動時data-mup-activeで復元
// v4.6  2026.04.10(金) WYSIWYG→Markdown方向のスクロール復元: MutationObserver+初回タイムアウトで対応
// v4.5  2026.04.10(金) mceAddStyleSheet廃止: bookmarkCSSを_stに統合→スクロール先頭バグ根絶。横取りを400ms1発に簡略化
// v4.4  2026.04.10(金) スクロール横取り: 400ms/2000ms/5000ms/7000msの4段発火。ユーザー操作で即停止
// v4.3  2026.04.10(金) 🟢を<head>動的<style>方式に刷新。TinyMCEのbodyに属性不要→シリアライズ汚染・ループ根絶
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

// markdownItRendererと共有する深さ別カラー（パネル表示用）
var _DEPTH_COLORS = ['#9b6fc4','#5588cc','#4aaa6a','#c8a040','#cc7744','#44aacc'];

// \▼[CN=FOLD.ACTIVE] // アクティブ膜管理（クリック/展開/メニュー時に🟢付与）
// 【設計】TinyMCEのbodyに属性を書くと変更検知→自動保存→ノートボディ汚染→再レンダリングのループになる。
// 解決策: <head>に動的<style>を注入し、CSSでCN名を直接ターゲット。TinyMCEのbodyには一切触らない。
// 再レンダリング後もheadの<style>は残るため、🟢は消えない。
var _activeCN = null;  // スクロールアンカー(v0.9.49)にも兼用
var _mupSetActiveTimer = null;  // 🟢永続化: mupSetActive送信のデバウンスタイマー

var _activeStyle = (function() {
  var st = document.getElementById('mup-active-style');
  if (!st) {
    st = document.createElement('style');
    st.id = 'mup-active-style';
    document.head.appendChild(st);
  }
  return st;
}());

function _setActiveMup(mupEl) {
  // 一旦クリア→新たな場所に表示（ユーザー提案方式）
  _activeCN = mupEl ? mupEl.getAttribute('data-mup-cn') : null;
  if (_activeCN) {
    // CSS属性セレクターの値は文字列扱いなのでドット等の特殊文字も安全
    var _esc = _activeCN.replace(/"/g, '\\"');
    // _isWYSIWYGは別スコープのため直接参照不可 → bodyのcontenteditable属性で判定
    var _tip = (document.body.getAttribute('contenteditable') === 'true')
      ? 'Switch editor (edit name)' : 'Switch editor';
    // 閉じ膜は "> .mup-bd > .mup-ft" で直接の子のみ（入れ子膜への🟢重複を防ぐ）
    var _ftSel = '.mup[data-mup-cn="' + _esc + '"] > .mup-bd > .mup-ft';
    var _hdSel = '.mup[data-mup-cn="' + _esc + '"] > .mup-hd';
    _activeStyle.textContent =
      // 開始膜・閉じ膜の.mup-status: cursor:pointer + position:relative（ツールチップ基準点）
      _hdSel + ' .mup-status,' + _ftSel + ' .mup-status {'
      + 'cursor:pointer!important;position:relative}'
      // 🟢表示: 開始膜と閉じ膜の両方に::afterで表示
      + _hdSel + ' .mup-status::after,' + _ftSel + ' .mup-status::after {'
      + 'content:"🟢";font-size:0.85em;margin-left:3px;vertical-align:middle}'
      // ツールチップ: ホバー時に::beforeで表示（::afterは🟢で使用済み）
      + _hdSel + ' .mup-status:hover::before,' + _ftSel + ' .mup-status:hover::before {'
      + 'content:"' + _tip + '";'
      + 'position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);'
      + 'background:#333;color:#fff;padding:3px 9px;border-radius:4px;'
      + 'font-size:0.75em;white-space:nowrap;z-index:9999;pointer-events:none;'
      + 'font-family:sans-serif;font-style:normal;font-weight:normal}';
  } else {
    _activeStyle.textContent = '';
  }
  // 🟢永続化: 常にノートソースに書き込む（WYSIWYG時はindex.ts側でeditor.setTextをスキップ→TinyMCE汚染防止）
  // WYSIWYG→Markdown切替後に🟢が消える問題の根本修正（v5.8）
  if (_activeCN) {
    clearTimeout(_mupSetActiveTimer);
    _mupSetActiveTimer = setTimeout(function() {
      webviewApi.postMessage('markMupRenderer', { type: 'mupSetActive', cn: _activeCN });
    }, 500);
  }
}
// \▲[CN=FOLD.ACTIVE]

// \▼[CN=FOLD.ACTIVE.INIT] // 起動時🟢復元: ソースに🟢があった膜をアクティブに設定+自動スクロール
// markdownItRendererがdata-mup-active="true"を付加→mupFoldが読んでhead styleを設定。
// WYSIWYGでは属性を即削除しTinyMCEシリアライズを防ぐ（head styleのみで表示）。
// v4.8: MutationObserverで描画後のdata-mup-activeを確実に検出（タイムアウト1発は不確実→廃止）
// v4.9: mupInitialScrollToCn送信を削除
//       理由: mupScrollToCn→CodeMirror移動→JoplinSync Scrollがプレビューを別位置に引きずる（バグ#2）
//       Markdownモードは300ms+1200msの2段scrollIntoViewでJoplin初期化リセットに対抗（バグ#1）
(function() {
  var _initDone = false;
  var _isWYSIWYG_init = document.body.getAttribute('contenteditable') === 'true';

  function _tryInitActiveMup() {
    if (_initDone) return;
    var initEl = document.querySelector('.mup[data-mup-active="true"]');
    if (!initEl) return;
    _initDone = true;
    _initObs.disconnect();
    initEl.removeAttribute('data-mup-active'); // TinyMCEシリアライズ防止
    _setActiveMup(initEl);
    // 自動スクロール（再起動時にアクティブ膜位置へ）
    var capturedEl = initEl;
    setTimeout(function() {
      capturedEl.scrollIntoView({ behavior: 'instant', block: 'center' });
    }, 300);
    // Markdownモードのみ: Joplinの初期化スクロールリセット対策として遅延2発目
    // （mupInitialScrollToCnは送信しない: CodeMirror移動→Sync Scrollがプレビューを引きずるバグ#2の原因）
    if (!_isWYSIWYG_init) {
      setTimeout(function() {
        capturedEl.scrollIntoView({ behavior: 'instant', block: 'center' });
      }, 1200);
    }
  }

  var _initObs = new MutationObserver(function() {
    if (_initDone) { _initObs.disconnect(); return; }
    _tryInitActiveMup();
  });
  _initObs.observe(document.body, { childList: true, subtree: true });
  // 30秒後に自動切断（ページが長時間残る場合のメモリリーク防止）
  setTimeout(function() { _initObs.disconnect(); }, 30000);
  // DOMが既に構築済みのケース（WYSIWYG初回ロード後など）に備えて即時試行
  _tryInitActiveMup();

  // \▼[CN=FOLD.ACTIVE.INIT.WYSIWYG] // WYSIWYGモード🟢復元フォールバック
  // WYSIWYGではmarkdownItRendererが動かない→data-mup-activeが付かない→MutationObserverが反応しない。
  // 600ms後に_activeCNがまだnullなら、index.tsにノートソースの🟢付きCNを照会して復元する。
  setTimeout(function() {
    if (_activeCN) return; // すでに復元済み（Markdownモードなど）ならスキップ
    webviewApi.postMessage('markMupRenderer', { type: 'mupGetActiveCn' })
      .then(function(res) {
        if (!res || !res.cn || _activeCN) return;
        var mupEl = document.querySelector('.mup[data-mup-cn="' + res.cn + '"]');
        if (mupEl) {
          _setActiveMup(mupEl);
          mupEl.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      })
      .catch(function() {});
  }, 600);
  // \▲[CN=FOLD.ACTIVE.INIT.WYSIWYG]
}());
// \▲[CN=FOLD.ACTIVE.INIT]

// \▼[CN=FOLD.CLICK] // クリックイベント
document.addEventListener('click', function(e) {
  var _prevActiveCN = _activeCN; // 🟢ボタン判定用: クリック前のアクティブCNを記録

  // \▼[CN=FOLD.CLICK.HEADER] // ヘッダー・フッター全域クリック → アクティブ設定
  // .mup-ico のみでなく em(コメント)・.mup-name・余白すべてのクリックで🟢を付与
  var hdFt = e.target.closest('.mup-hd, .mup-ft');
  if (hdFt) {
    var mupFromHd = hdFt.closest('.mup');
    if (mupFromHd) _setActiveMup(mupFromHd);
  }
  // \▲[CN=FOLD.CLICK.HEADER]

  // \▼[CN=FOLD.CLICK.GREEN_BTN] // 🟢ボタン: アクティブ膜の.mup-statusクリック → エディタ切替
  // 既にアクティブだった膜の.mup-statusをクリックした時のみ切替（初回クリックはアクティブ化のみ）
  var statusEl = e.target.closest('.mup-status');
  if (statusEl) {
    var mupFromStatus = statusEl.closest('.mup');
    var cnStatus = mupFromStatus ? mupFromStatus.getAttribute('data-mup-cn') : null;
    if (cnStatus && cnStatus === _prevActiveCN) {
      e.preventDefault();
      e.stopImmediatePropagation();
      webviewApi.postMessage('markMupRenderer', { type: 'mupToggleEditor', cn: _prevActiveCN });
      return;
    }
  }
  // \▲[CN=FOLD.CLICK.GREEN_BTN]

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
  var stEl = hd ? hd.querySelector('.mup-badge') : null; // v6.5: mup-status→mup-badge（v6.3クラス名変更に追従）
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
  // .mup-hd/.mup-ft 内で em(コメント) のみ編集可。
  // .mup-status(🟢ボタン用空スパン) は名前と同様に不可侵（v6.4〜 mup-statusをemと同扱いから分離）
  // .mup-badge(バッジ<code>) も不可侵（selectionchangeで自動追い出し）
  if (document.body.getAttribute('contenteditable') === 'true') {
    var _st = document.createElement('style');
    _st.textContent = [
      // ヘッダー・フッター全体はデフォルト矢印
      '.mup-hd,.mup-ft{cursor:default!important}',
      // 名前span(.mup-name)と🟢スパン(.mup-status): 矢印カーソル・選択不可
      '.mup-name,.mup-status{cursor:default!important;user-select:none!important}',
      // コメントemのみテキストカーソル・選択可（🟢アクティブ膜は_activeStyleで.mup-status::afterに上書き）
      '.mup-hd em,.mup-ft em{cursor:text!important;user-select:text!important}'
    ].join('');
    document.head.appendChild(_st);

    // 編集可ゾーン(emのみ)以外への操作を阻止するヘルパー
    function _inNameZone(target) {
      if (!target.closest('.mup-hd, .mup-ft')) return false; // ヘッダー・フッター外
      if (target.closest('em')) return false;                 // emのみ編集可
      return true; // 名前span・アイコン・.mup-status・.mup-badge・余白 = 阻止対象
    }

    // ① mousedown キャプチャ: 左クリックによるカーソル配置を阻止
    // 右クリック(button!==0)はスルー → contextmenuイベントが正常に発火する
    document.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      if (_inNameZone(e.target)) e.preventDefault();
    }, true);

    // ② selectionchange 監視: キーボードナビで保護ゾーンに入ったら追い出す
    // 追い出し先: .mup-status(🟢)に入った場合→emの末尾（←キーとの対称バウンス）
    //            それ以外(.mup-name/.mup-badge等)→emの先頭（→キーとの対称バウンス）
    document.addEventListener('selectionchange', function() {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
      var range = sel.getRangeAt(0);
      var node = range.startContainer;
      var el = (node.nodeType === 3) ? node.parentElement : node;
      if (!el.closest('.mup-hd, .mup-ft')) return; // ヘッダー・フッター外はスルー
      if (el.closest('em')) return;                 // emはスルー（編集可）
      var hd = el.closest('.mup-hd, .mup-ft');
      var em = hd ? hd.querySelector('em') : null;
      var newRange = document.createRange();
      var inStatus = !!el.closest('.mup-status'); // 🟢スパンに入った場合
      if (inStatus) {
        // ←キーでemから🟢に入った → emの末尾へ戻す（左方向の対称バウンス）
        if (em && em.lastChild) {
          var ln = em.lastChild;
          newRange.setStart(ln, ln.nodeType === 3 ? ln.length : ln.childNodes.length);
        } else if (em) {
          newRange.setStart(em, em.childNodes.length);
        } else {
          newRange.setStartAfter(hd);
        }
      } else {
        // →キーでemからバッジ等に入った、または名前spanにカーソル → emの先頭へ
        if (em && em.firstChild) {
          newRange.setStart(em.firstChild, 0);
        } else if (em) {
          newRange.setStart(em, 0);
        } else {
          newRange.setStartAfter(hd);
        }
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
    // Bug#2修正(v4.8): TinyMCEのノート切替でbody.innerHTMLが置換されると_menuがDOMから外れる。
    // 表示前に再アタッチして確実にメニューを表示する。
    if (!_menu.parentNode) document.body.appendChild(_menu);
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

  // \▼[CN=FOLD.CTX.SCROLL] // エディタ切替後: スクロールターゲット膜へ自動スクロール
  // 両方向（Markdown→WYSIWYG / WYSIWYG→Markdown）対応（v4.6〜）
  // index.tsが保持していたCNアンカーを mupGetScrollTarget で照会しscrollIntoViewする。

  function _scrollToCn(cn) {
    var el = document.querySelector('.mup[data-mup-cn="' + cn + '"]');
    if (!el) return;
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
    // Markdownモードのみ: index.ts経由でNote viewerフォーカス+↓キー → CodeMirror同期
    // (webview内JSのKeyboardEvent dispatchはBlink組み込みスクロールに届かないためOS経由)
    if (!_isWYSIWYG) {
      setTimeout(function() {
        webviewApi.postMessage('markMupRenderer', { type: 'mupSyncScroll' });
      }, 300);
    }
  }

  if (_isWYSIWYG) {
    // ── Markdown→WYSIWYG: TinyMCEが起動してDOMが構築された後にスクロール ──
    // 【v4.5】mceAddStyleSheetを廃止したのでスクロール先頭戻りが根絶。400ms1発で十分。
    webviewApi.postMessage('markMupRenderer', { type: 'mupGetScrollTarget' })
      .then(function(res) {
        if (!res || !res.cn) return;
        setTimeout(function() { _scrollToCn(res.cn); }, 400);
      });

  } else {
    // ── WYSIWYG→Markdown: Markdownプレビューはpersistentなので再起動しない。
    // MutationObserverで.mup要素の追加（=ノート再レンダリング）を検知→アンカー照会。
    // ①初回タイムアウト（webviewがfresh startのケースに備える）
    // ②MutationObserver（persistentケース: モード切替後のDOM再構築を検知）
    function _queryAndScroll() {
      webviewApi.postMessage('markMupRenderer', { type: 'mupGetScrollTarget' })
        .then(function(res) {
          if (!res || !res.cn) return;
          _scrollToCn(res.cn);
        });
    }
    // ①
    setTimeout(_queryAndScroll, 400);
    // ②
    var _mdScrollTimer = null;
    new MutationObserver(function(mutations) {
      // .mup要素が追加されたとき（=ノート再レンダリング完了）にのみ反応
      var hasMupAdded = mutations.some(function(m) {
        return Array.prototype.some.call(m.addedNodes, function(n) {
          return n.nodeType === 1 && (
            (n.classList && n.classList.contains('mup')) ||
            (n.querySelector && n.querySelector('.mup'))
          );
        });
      });
      if (!hasMupAdded) return;
      clearTimeout(_mdScrollTimer);
      _mdScrollTimer = setTimeout(_queryAndScroll, 300);
    }).observe(document.body, { childList: true, subtree: true });
  }
  // \▲[CN=FOLD.CTX.SCROLL]

  // \▼[CN=FOLD.CTX.EVENT] // 右クリックイベント
  // 対象: .mup-ico と .mup-name — WYSIWYG・Markdownプレビュー共通
  // キャプチャ相(true) + stopImmediatePropagation でTinyMCEのメニューを完全抑制
  // v5.1: _setActiveMup削除 → 右クリックで🟢が付くバグを修正
  document.addEventListener('contextmenu', function(e) {
    var target = e.target.closest('.mup-ico, .mup-name');
    if (!target) { _hide(); _hideScrollMenu(); return; }
    e.preventDefault();
    e.stopImmediatePropagation();
    var mupEl = e.target.closest('.mup');
    _show(e.clientX, e.clientY, mupEl);
  }, true);
  document.addEventListener('click', function(e) {
    if (!_menu.contains(e.target)) _hide();
    if (!_scrollMenu.contains(e.target)) _hideScrollMenu();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { _hide(); _hideScrollMenu(); }
  });
  // \▲[CN=FOLD.CTX.EVENT]

  // \▼[CN=FOLD.TOC.EXT] // 外部パネル連携: 膜データ収集・送信・クリックポーリング
  // joplin.views.panels APIで作られた外部パネル(mupTocPanel.js)と通信する

  // 膜データを収集してindex.tsに送信（→パネルにforward）
  function _collectAndSendToc() {
    var mupEls = document.querySelectorAll('.mup');
    var membranes = [];
    Array.prototype.forEach.call(mupEls, function(mupEl) {
      var cn = mupEl.getAttribute('data-mup-cn') || '';
      var depth = 0;
      var p = mupEl.parentElement;
      while (p) {
        if (p.classList && p.classList.contains('mup')) depth++;
        p = p.parentElement;
      }
      var emEl = mupEl.querySelector(':scope > .mup-hd em');
      var comment = emEl ? emEl.textContent.replace(/^[\s\/]+/, '').trim() : '';
      var color = _DEPTH_COLORS[depth % _DEPTH_COLORS.length];
      membranes.push({ cn: cn, depth: depth, comment: comment, color: color });
    });
    webviewApi.postMessage('markMupRenderer', {
      type: 'mupUpdateToc',
      membranes: membranes,
      activeCN: _activeCN
    });
  }

  // パネルからのクリックをポーリング（400ms間隔）
  // v6.1: 毎回_collectAndSendTocを呼んでindex.tsの_latestTocDataを常に最新に保つ
  //        パネルがPull型ポーリング(600ms)でrequestTocを投げるため、最新データが必要
  var _tocPollTimer = null;
  function _startTocPoll() {
    if (_tocPollTimer) return;
    _tocPollTimer = setInterval(function() {
      // 常にTOCデータを送信（index.tsの_latestTocDataを更新）
      _collectAndSendToc();
      // クリックターゲットも確認
      webviewApi.postMessage('markMupRenderer', { type: 'mupGetTocTarget' })
        .then(function(res) {
          if (!res || !res.cn) return;
          var mupEl = document.querySelector('.mup[data-mup-cn="' + res.cn + '"]');
          if (mupEl) _setActiveMup(mupEl);
          _scrollToCn(res.cn);
        });
    }, 400);
  }
  function _stopTocPoll() {
    if (_tocPollTimer) { clearInterval(_tocPollTimer); _tocPollTimer = null; }
  }

  // \▼[CN=FOLD.TOC.INIT] // 起動時TOCポーリング開始 + Markdownモード🟢同期
  // 条件なしで常にポーリングを開始する（v6.3〜）。
  (function() {
    _collectAndSendToc();
    _startTocPoll();

    // \▼[CN=FOLD.TOC.SYNC] // Markdownモード: 2秒ごとにソースの🟢とUI表示を同期（バグ#2修正）
    // 問題: ユーザーが左ペインで🟢を手動削除しても _activeCN が残り右ペインに🟢が表示され続ける。
    // 解決: 2sごとにmupGetActiveCnでソースの🟢付きCNを照会し、_activeCNと不一致なら更新する。
    //       cn=nullの場合はmupSetActive(null)を送信→index.tsが閉じ膜の🟢もソースから削除する。
    setInterval(function() {
      if (document.body.getAttribute('contenteditable') === 'true') return; // WYSIWYGはスキップ
      webviewApi.postMessage('markMupRenderer', { type: 'mupGetActiveCn' })
        .then(function(res) {
          var sourceCn = res ? (res.cn || null) : null;
          if (sourceCn === _activeCN) return; // 変化なし
          var prevCN = _activeCN;
          if (sourceCn) {
            // 🟢が別のCNに移動（手動編集）→ そのCNをアクティブに
            var mupEl = document.querySelector('.mup[data-mup-cn="' + sourceCn + '"]');
            if (mupEl) _setActiveMup(mupEl);
          } else {
            // 🟢が消えた（手動削除）→ UIをクリア + ソースの閉じ膜🟢も削除
            _activeCN = null;
            _activeStyle.textContent = '';
            if (prevCN) {
              // cn=nullでmupSetActiveを送信→index.tsが残存する閉じ膜の🟢を削除
              webviewApi.postMessage('markMupRenderer', { type: 'mupSetActive', cn: null });
            }
          }
        })
        .catch(function() {});
    }, 2000);
    // \▲[CN=FOLD.TOC.SYNC]
  }());
  // \▲[CN=FOLD.TOC.INIT]

  // \▲[CN=FOLD.TOC.EXT]

  // \▼[CN=FOLD.CTX.SCROLL_MENU] // 膜以外の右クリック → 「🟢アクティブ膜にスクロール」
  // _activeCNがある時のみ表示。Markdownプレビューのみ（WYSIWYGはTinyMCEが制御）。
  var _scrollMenu = document.createElement('div');
  _scrollMenu.id = 'mup-scroll-ctx';
  _scrollMenu.style.cssText = [
    'position:fixed','z-index:99998','display:none',
    'background:#fff','border:1px solid #ccc',
    'border-radius:5px','box-shadow:0 3px 10px rgba(0,0,0,0.18)',
    'padding:4px 0','min-width:200px','font-size:13px',
    'user-select:none','cursor:default'
  ].join(';');
  document.body.appendChild(_scrollMenu);

  // ① 🟢 アクティブ膜にスクロール（_activeCNがある時のみ有効）
  var _smScrollItem = document.createElement('div');
  _smScrollItem.textContent = '🟢 Scroll to active membrane';
  _smScrollItem.style.cssText = 'padding:7px 18px;color:#333;';
  _smScrollItem.onmouseenter = function(){ _smScrollItem.style.background='#e8f0fe'; _smScrollItem.style.color='#1a73e8'; };
  _smScrollItem.onmouseleave = function(){ _smScrollItem.style.background=''; _smScrollItem.style.color='#333'; };
  _smScrollItem.onclick = function() {
    _hideScrollMenu();
    if (_activeCN) _scrollToCn(_activeCN);
  };
  _scrollMenu.appendChild(_smScrollItem);

  // セパレーター
  var _smSep = document.createElement('div');
  _smSep.style.cssText = 'height:1px;background:#eee;margin:3px 0';
  _scrollMenu.appendChild(_smSep);

  // ② 🗂 膜一覧パネルのトグル（常時有効）
  var _smTocItem = document.createElement('div');
  _smTocItem.textContent = '🗂 Membranes Index';
  _smTocItem.style.cssText = 'padding:7px 18px;color:#333;';
  _smTocItem.onmouseenter = function(){ _smTocItem.style.background='#e8f0fe'; _smTocItem.style.color='#1a73e8'; };
  _smTocItem.onmouseleave = function(){ _smTocItem.style.background=''; _smTocItem.style.color='#333'; };
  _smTocItem.onclick = function() {
    _hideScrollMenu();
    webviewApi.postMessage('markMupRenderer', { type: 'mupToggleToc' })
      .then(function(res) {
        if (res && res.visible) {
          _collectAndSendToc();
          _startTocPoll();
        } else {
          _stopTocPoll();
        }
      });
  };
  _scrollMenu.appendChild(_smTocItem);

  function _hideScrollMenu() { _scrollMenu.style.display = 'none'; }

  // 両モード対応: capture phaseで登録→膜以外の右クリックで表示
  // 膜ノートのpreferenceとして、_activeCN or 膜が存在する時に介入
  document.addEventListener('contextmenu', function(e) {
    if (e.target.closest('.mup-ico, .mup-name')) return;
    // 膜が1つもなければ通常メニューを維持
    if (!document.querySelector('.mup')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    // _activeCNがない時はスクロール項目をグレーアウト
    _smScrollItem.style.color = _activeCN ? '#333' : '#bbb';
    _smScrollItem.style.cursor = _activeCN ? 'pointer' : 'default';
    if (!_scrollMenu.parentNode) document.body.appendChild(_scrollMenu);
    _scrollMenu.style.display = 'block';
    var mx = Math.min(e.clientX, window.innerWidth  - _scrollMenu.offsetWidth  - 8);
    var my = Math.min(e.clientY, window.innerHeight - _scrollMenu.offsetHeight - 8);
    _scrollMenu.style.left = Math.max(0, mx) + 'px';
    _scrollMenu.style.top  = Math.max(0, my) + 'px';
  }, true);
  // \▲[CN=FOLD.CTX.SCROLL_MENU]
})();
// \▲[CN=FOLD.CTX]

// \▲[CN=FOLD]
