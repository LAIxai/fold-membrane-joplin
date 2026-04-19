// \▼[CN=FOLD] // Fold Membrane - click handler v7.9
// ─── changelog ───────────────────────────────────────
// v7.9  2026.04.19(日) バッジ状態インラインボタン行(D案): ⊕/⊕f/⊖/⊖f を1クリックで切替。
//                      メニュー末尾に「バッジ: [⊕][⊕f][⊖][⊖f]」を追加。現在状態はハイライト。
//                      クリック時 mupSetBadgeState を index.ts CN=7318_SET_BADGE_STATE へ送信。
//                      count/exp は保持。f の実挙動(カウント凍結)は未実装だがソース書換は可能。
//                      LaTeX式ダブルクリック編集に近い体験を、モーダルなしで実現。
// v7.8  2026.04.19(日) 「🔧 ブロックコードに戻す」メニュー追加: 膜ボタン(v8.62)の逆操作。
//                      選択中の膜のCN/pfx/occurrenceIndexをmupUnwrapToCodeでindex.tsに送信。
//                      index.tsがnote.body中の該当膜を```…```で包んで書き戻す。
//                      → WYSIWYGでLaTeX数式のダブルクリック編集と同じ感覚で膜名/CN/コメントを編集可能。
//                      編集後Cmd+S(Repair Membranes)→CN=3094_CODEFENCE_UNWRAPが膜に復元。
// v7.1  2026.04.12(日) クラス名バグ修正: mup-body→mup-bd（実際のクラス名）
//                      v7.0まで_getBody()が常にnull返却 → keydownがsetStartAfter(mup)→膜外に飛ぶ
//                      →「フッタを飛び越える」謎の根本原因。mup-bdに修正で全て解決するはず。
// v7.0  2026.04.12(日) スコープバグ修正: _getBody()をIIFEトップに移動
//                      v6.9でifブロック内に定義→メニューアクション(ブロック外)からReferenceError
//                      → IIFE直下に移動することで全セクションからアクセス可能に
// v6.9  2026.04.12(日) 「膜の中へ移動」バグ修正 + ▶削除 + フッターemにも表示
//                      原因①: :scope > .mup-bodyが失敗→_getBody()ヘルパーに置換
//                      原因②: メニューmousedownでTinyMCEがカーソルを先に移動→e.preventDefault()追加
//                      変更: ▶削除・フッターemでも「膜の中へ移動」表示(→body末尾)
// v6.8  2026.04.12(日) ↑↓でemから脱出 + 「▶ 膜の中へ移動」コンテキストメニュー
//                      keydown: hd em+↓→body先頭 / ft em+↓→mup後 / ft em+↑→body末尾 / hd em+↑→mup前
//                      contextmenu: em右クリックもトリガー対象に追加。ヘッダーemのみ「膜の中へ」表示。
// v6.7  2026.04.12(日) ラップアラウンド移動: em先頭で← → em末尾へ、em末尾で→ → em先頭へ
//                      keydown(事前)でpreventDefault+手動ジャンプ。フラッシュ完全消去。
//                      selectionchangeはフォールバック（クリック等）として残置。コード整理。
// v6.6  2026.04.12(日) ←キーフラッシュ根本解決: selectionchange(事後)→keydownキャプチャ(事前阻止)
//                      em先頭でArrowLeft → preventDefault（mup-statusへの進入を完全ブロック）
//                      em末尾でArrowRight → preventDefault（mup-badgeへの進入を完全ブロック）
//                      selectionchangeは残置（クリック等の念のためフォールバック）
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
// v7.7  2026.04.17(金) 真の原因判明: 閉じ膜のmup-ftにemが無い → selectionchangeフォールバックが
//                      setStartAfter(hd)で下方向にバウンス → ユーザーが↑で上に逃げようとするとまた
//                      ft内に吸い込まれる → 無限下バウンス。em無しのmup-ftはpreviousSibling末尾
//                      (body末尾テキスト)へ上方向に脱出させるよう修正。
// v7.6  2026.04.17(金) v7.5再修正: 閉じ膜+↑で出られないバグ残存
//                      TreeWalker方式ではブラウザがカーソルをft内に吸い戻す場合があるため
//                      ft.previousSibling末尾に setStartBefore で明示配置する方式に変更
// v7.5  2026.04.17(金) ↑↓キー膜出入りバグ修正（レンダラv5.4で.mup-ftが.mup-bd内に入った副作用）
//                      (1) 閉じ膜+↑で膜内に入れない: TreeWalkerが.mup-ft内のテキストを拾っていた
//                          → _firstTextInBody/_lastTextInBodyヘルパーで.mup-ft除外
//                      (2) 開始膜+↑で名前頭と//手前を往復: setStartBefore(mup)がmup内に吸い込まれる
//                          → mup.previousSibling末尾へ明示配置、無ければ親先頭へ
//                      トリガーをem内から.mup-hd/.mup-ft全域に拡張（em外からも脱出可）
// v7.4  2026.04.17(金) 課題#2修正: Markdownモードで3クリック必要バグ
//                      原因: 2秒ポーリングとmupSetActive 500ms+300msデバウンスのレース
//                      対策: _pendingSetActiveUntilでクリック後2000msポーリング停止
// v7.3  2026.04.17(金) Copy membrane contentsバグ修正: .mup-ftが.mup-bd内に配置されて
//                      いるため閉じ膜の▲記号までコピーされていた→cloneして.mup-ft除去
// v7.2  2026.04.17(金) "📋 Copy membrane contents"メニュー追加
//                      _getBody()で.mup-bdのinnerTextをクリップボードにコピー
// v6.3  2026.04.14(火) バグ#1修正: _menu/_scrollMenuをdocument.documentElement配下に移動
//                      （document.bodyはWYSIWYGでTinyMCE編集エリア→ノート本文汚染の根本原因）
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
var _pendingSetActiveUntil = 0;  // v7.4: ポーリングのレース対策。書込完了予定時刻までポーリング停止

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
    // v7.4: ポーリング停止期間を設定（mupFold 500ms + index.ts 300ms debounce + 書込/再レンダリング余裕 = 2000ms）
    _pendingSetActiveUntil = Date.now() + 2000;
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

  // .mupの直接子である.mup-bdを取得（IIFEトップで定義→全セクションから参照可）
  // 実際のクラス名は mup-bd（mup-bodyではない）
  function _getBody(mup) {
    if (!mup) return null;
    for (var i = 0; i < mup.children.length; i++) {
      if (mup.children[i].classList.contains('mup-bd')) return mup.children[i];
    }
    return null;
  }

  // v7.5: body配下のテキストノード走査（.mup-ft配下は除外）
  // 理由: レンダラー v5.4以降、.mup-ftは.mup-bdの子要素として配置される（折畳み時に一緒に隠すため）
  //       単純なTreeWalkerでは閉じ膜内のテキストまで拾ってしまい、↑↓ナビが機能しない
  function _makeBodyTW(body) {
    return document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        var p = node.parentElement;
        return (p && p.closest('.mup-ft'))
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      }
    });
  }
  function _firstTextInBody(body) {
    return body ? _makeBodyTW(body).nextNode() : null;
  }
  function _lastTextInBody(body) {
    if (!body) return null;
    var tw = _makeBodyTW(body), last = null, n;
    while ((n = tw.nextNode())) last = n;
    return last;
  }

  // \▼[CN=FOLD.CTX.PROTECT] // WYSIWYG: emのみ編集可・ラップアラウンド移動
  // .mup-hd/.mup-ft 内で em(コメント) のみ編集可。
  // ← at em先頭 → em末尾へラップ。→ at em末尾 → em先頭へラップ。
  // ↓/↑ で膜の内外へ脱出（hd+↓→body先頭 / ft+↓→mup後 / ft+↑→body末尾 / hd+↑→mup前）
  if (document.body.getAttribute('contenteditable') === 'true') {
    // CSS: 名前・🟢スパンはポインタ禁止、emのみテキスト操作可
    var _st = document.createElement('style');
    _st.textContent = '.mup-hd,.mup-ft{cursor:default!important}'
      + '.mup-name,.mup-status{cursor:default!important;user-select:none!important}'
      + '.mup-hd em,.mup-ft em{cursor:text!important;user-select:text!important}';
    document.head.appendChild(_st);

    // ヘッダー内でem以外の場所はクリック阻止（右クリックはスルー）
    document.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      var t = e.target;
      if (t.closest('.mup-hd, .mup-ft') && !t.closest('em')) e.preventDefault();
    }, true);

    // em端でのラップアラウンド＋↑↓で膜の内外へ脱出（keydownで事前阻止＋手動ジャンプ）
    document.addEventListener('keydown', function(e) {
      var key = e.key;
      if (key !== 'ArrowLeft' && key !== 'ArrowRight'
       && key !== 'ArrowUp'   && key !== 'ArrowDown') return;
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
      var range = sel.getRangeAt(0);
      var node = range.startContainer;
      var el = (node.nodeType === 3) ? node.parentElement : node;
      var hdFt = el.closest('.mup-hd, .mup-ft');
      var em = el.closest('em');
      var r = document.createRange();

      if (key === 'ArrowDown' || key === 'ArrowUp') {
        // ↑↓: 膜内部 / 膜外へ脱出（em外でも .mup-hd/.mup-ft 全域で処理）
        if (!hdFt) return;
        var isHd = hdFt.classList.contains('mup-hd');
        var mup  = hdFt.closest('.mup');
        var body = _getBody(mup);
        e.preventDefault();
        if (key === 'ArrowDown') {
          if (isHd && body) {
            // ヘッダー+↓ → body先頭テキストへ（.mup-ft除外）
            var fn = _firstTextInBody(body);
            if (fn) r.setStart(fn, 0); else r.setStart(body, 0);
          } else {
            // フッター+↓ → mup全体の後へ
            r.setStartAfter(mup || hdFt);
          }
        } else {
          if (!isHd && body) {
            // フッター+↑ → body末尾（.mup-ft直前）へ
            // TreeWalkerでは ブラウザがカーソルをftに吸い込む場合があるので
            // ft要素の直前に setStartBefore で明示配置する
            var ftEl = hdFt; // 今カーソルがあるft
            var prevN = ftEl.previousSibling;
            if (prevN) {
              if (prevN.nodeType === 3) {
                r.setStart(prevN, prevN.length);
              } else {
                r.selectNodeContents(prevN);
                r.collapse(false);
              }
            } else {
              // body直下にftしかない → TreeWalkerで内容テキスト末尾を探す
              var ln = _lastTextInBody(body);
              if (ln) r.setStart(ln, ln.length);
              else r.setStartBefore(ftEl);
            }
          } else {
            // ヘッダー+↑ → mup全体の前へ
            // setStartBefore(mup) だけだとブラウザが mup内先頭テキストに吸い込む場合がある
            // → prev兄弟の末尾に明示配置し、なければ親の先頭へ
            var prev = mup && mup.previousSibling;
            if (prev) {
              // prevがテキストノードならその末尾、要素なら末尾の子へ
              if (prev.nodeType === 3) {
                r.setStart(prev, prev.length);
              } else {
                r.selectNodeContents(prev);
                r.collapse(false);
              }
            } else if (mup && mup.parentNode) {
              r.setStart(mup.parentNode, 0);
            } else {
              r.setStartBefore(hdFt);
            }
          }
        }
        r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
        return;
      }

      // ← → は em内のみ処理
      if (!em || !hdFt) return;

      if (key === 'ArrowLeft') {
        // em先頭でLeft → em末尾へラップ
        var atStart = (node.nodeType === 3 && node === em.firstChild && range.startOffset === 0)
                   || (node === em && range.startOffset === 0);
        if (!atStart) return;
        e.preventDefault();
        var last = em.lastChild;
        r.setStart(last, last.nodeType === 3 ? last.length : last.childNodes.length);
        r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
      } else {
        // em末尾でRight → em先頭へラップ
        var lastChild = em.lastChild;
        var atEnd = (lastChild && lastChild.nodeType === 3 && node === lastChild
                     && range.startOffset === lastChild.length)
                 || (node === em && range.startOffset === em.childNodes.length);
        if (!atEnd) return;
        e.preventDefault();
        var first = em.firstChild;
        r.setStart(first, 0);
        r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
      }
    }, true);

    // フォールバック: クリック等でem外にカーソルが入った場合の追い出し
    document.addEventListener('selectionchange', function() {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
      var range = sel.getRangeAt(0);
      var node = range.startContainer;
      var el = (node.nodeType === 3) ? node.parentElement : node;
      if (!el.closest('.mup-hd, .mup-ft') || el.closest('em')) return;
      var hd = el.closest('.mup-hd, .mup-ft');
      var em = hd ? hd.querySelector('em') : null;
      var r = document.createRange();

      // v7.7: 閉じ膜(em無し)にカーソルが迷い込んだ場合、body末尾テキストへ上方向に脱出させる
      //       （setStartAfter(hd)だと下方向に出てしまい、ユーザーが上方向の脱出操作をループする）
      if (!em && hd.classList.contains('mup-ft')) {
        var prevN = hd.previousSibling;
        if (prevN) {
          if (prevN.nodeType === 3) r.setStart(prevN, prevN.length);
          else { r.selectNodeContents(prevN); r.collapse(false); }
        } else {
          r.setStartBefore(hd);
        }
        r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
        return;
      }

      if (el.closest('.mup-status')) {
        // 🟢スパン → em末尾へ
        var ln = em && em.lastChild;
        if (ln) r.setStart(ln, ln.nodeType === 3 ? ln.length : ln.childNodes.length);
        else if (em) r.setStart(em, em.childNodes.length);
        else r.setStartAfter(hd);
      } else {
        // 名前・バッジ等 → em先頭へ
        var fn = em && em.firstChild;
        if (fn) r.setStart(fn, 0);
        else if (em) r.setStart(em, 0);
        else r.setStartAfter(hd);
      }
      r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
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
  document.documentElement.appendChild(_menu);

  var _ctxMup   = null; // 右クリック時の .mup 要素
  var _ctxEmCur = null; // 右クリック時にカーソルがあったem（WYSIWYGのみ）

  function _addItem(label, action) {
    var item = document.createElement('div');
    item.textContent = label;
    item.style.cssText = 'padding:7px 18px;color:#333;';
    item.onmouseenter = function(){ item.style.background='#e8f0fe'; item.style.color='#1a73e8'; };
    item.onmouseleave = function(){ item.style.background=''; item.style.color='#333'; };
    // mousedownでTinyMCEのカーソル移動を阻止（actionでカーソルを確実に制御するため）
    item.onmousedown = function(e){ e.preventDefault(); };
    item.onclick = function(){ _hide(); action(); };
    _menu.appendChild(item);
    return item; // 参照を返す（表示制御用）
  }
  function _addSep() {
    var sep = document.createElement('div');
    sep.style.cssText = 'height:1px;background:#eee;margin:3px 0;';
    _menu.appendChild(sep);
  }
  function _show(x, y, mupEl, cursorEm) {
    _ctxMup   = mupEl   || null;
    _ctxEmCur = cursorEm || null;
    // TinyMCEのノート切替でbody.innerHTMLが置換されても_menuはdocumentElementに保持されるため再アタッチ不要だが念のため
    if (!_menu.parentNode) document.documentElement.appendChild(_menu);
    // 「膜の中へ」はヘッダー/フッターemにカーソルがある時に表示
    if (_itemJumpInside) {
      _itemJumpInside.style.display = cursorEm ? '' : 'none';
    }
    // v7.9: バッジ状態ボタンのハイライト更新（開く度に現在状態を反映）
    if (typeof _updateStateHighlight === 'function') {
      try { _updateStateHighlight(mupEl); } catch(_e) {}
    }
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
      var cn = _ctxMup ? _ctxMup.getAttribute('data-mup-cn') : null;
      webviewApi.postMessage('markMupRenderer', { type: 'mupToggleEditor', cn: cn });
    }
  );
  // ② 名前をコピー / Copy membrane contents
  _addSep();
  _addItem('📋 名前をコピー', function() {
    var name = _ctxMup ? (_ctxMup.getAttribute('data-mup-cn') || '') : '';
    if (!name) return;
    navigator.clipboard.writeText(name).catch(function(){});
  });
  _addItem('📋 Copy membrane contents', function() {
    var body = _getBody(_ctxMup);
    if (!body) return;
    // .mup-ftは.mup-bd内に配置されているためcloneしてから除去
    var clone = body.cloneNode(true);
    var fts = clone.querySelectorAll('.mup-ft');
    for (var i = 0; i < fts.length; i++) fts[i].parentNode.removeChild(fts[i]);
    var text = (clone.innerText || clone.textContent || '').trim();
    navigator.clipboard.writeText(text).catch(function(){});
  });
  // ③ 🔧 ブロックコードに戻す — 膜ボタン(v8.62)の逆操作
  //    この膜を ```…``` で包んで書き戻し、TinyMCEに「コードブロック」として表示させる。
  //    WYSIWYGでLaTeX数式(ダブルクリック→編集→離脱で再レンダ)と同じ感覚で
  //    膜の名前/CN/コメントを編集できるようにする。
  //    編集後Cmd+S→CN=3094_CODEFENCE_UNWRAPが自動的に膜形式へ戻す。
  _addSep();
  _addItem('🔧 ブロックコードに戻す', function() {
    if (!_ctxMup) return;
    var cn  = _ctxMup.getAttribute('data-mup-cn');
    var pfx = _ctxMup.getAttribute('data-mup-pfx') || 'CN';
    if (!cn) return;
    // 同名膜が複数あるとき、ドキュメント順で何番目かを特定（0始まり）
    var all = document.querySelectorAll('.mup[data-mup-cn="'+cn+'"][data-mup-pfx="'+pfx+'"]');
    var occIdx = Array.prototype.indexOf.call(all, _ctxMup);
    webviewApi.postMessage('markMupRenderer', {
      type: 'mupUnwrapToCode',
      cn:   cn,
      pfx:  pfx,
      occurrenceIndex: occIdx >= 0 ? occIdx : 0
    });
  });
  // ④ バッジ状態インラインボタン行（D案 v7.9）: ⊕/⊕f/⊖/⊖f を1クリックで切替
  //    固定表示(f)を書込み/削除する専用UI。現在状態はハイライト表示。
  //    f の実挙動(カウント凍結)は未実装。本UIはソース書換のみ。
  //    メッセージ: mupSetBadgeState → index.ts CN=7318_SET_BADGE_STATE が処理。
  _addSep();
  var _stateRow = document.createElement('div');
  _stateRow.style.cssText = 'display:flex;padding:5px 14px 5px 18px;gap:4px;align-items:center;';
  var _stateLabel = document.createElement('span');
  _stateLabel.textContent = 'バッジ:';
  _stateLabel.style.cssText = 'color:#666;font-size:12px;margin-right:6px;user-select:none;';
  _stateRow.appendChild(_stateLabel);
  var _STATES = ['⊕', '⊕f', '⊖', '⊖f'];
  var _stateButtons = [];
  _STATES.forEach(function(s) {
    var btn = document.createElement('div');
    btn.textContent = s;
    btn.setAttribute('data-state', s);
    btn.style.cssText = [
      'padding:3px 9px','border:1px solid #ccc','border-radius:3px',
      'cursor:pointer','font-size:13px','background:#fafafa','color:#333',
      'user-select:none','min-width:22px','text-align:center'
    ].join(';');
    btn.onmouseenter = function() {
      if (btn.getAttribute('data-active') !== '1') {
        btn.style.background = '#e8f0fe'; btn.style.color = '#1a73e8';
      }
    };
    btn.onmouseleave = function() {
      if (btn.getAttribute('data-active') !== '1') {
        btn.style.background = '#fafafa'; btn.style.color = '#333';
      }
    };
    btn.onmousedown = function(e) { e.preventDefault(); };
    btn.onclick = function() {
      if (!_ctxMup) { _hide(); return; }
      var cn  = _ctxMup.getAttribute('data-mup-cn');
      var pfx = _ctxMup.getAttribute('data-mup-pfx') || 'CN';
      _hide();
      if (!cn) return;
      var all = document.querySelectorAll('.mup[data-mup-cn="'+cn+'"][data-mup-pfx="'+pfx+'"]');
      var occIdx = Array.prototype.indexOf.call(all, _ctxMup);
      webviewApi.postMessage('markMupRenderer', {
        type: 'mupSetBadgeState',
        cn:   cn,
        pfx:  pfx,
        state: s,
        occurrenceIndex: occIdx >= 0 ? occIdx : 0
      });
    };
    _stateRow.appendChild(btn);
    _stateButtons.push(btn);
  });
  _menu.appendChild(_stateRow);

  // 現在の状態を .mup-status のテキストから読み取る（例: "[⊕f0+0]" → "⊕f"）
  function _currentBadgeState(mupEl) {
    if (!mupEl) return null;
    var hd = mupEl.querySelector(':scope > .mup-hd');
    if (!hd) return null;
    var st = hd.querySelector('.mup-status');
    if (!st) return null;
    var m = (st.textContent || '').match(/([⊕⊖⊘])(f?)/);
    return m ? (m[1] + (m[2] || '')) : null;
  }
  function _updateStateHighlight(mupEl) {
    var cur = _currentBadgeState(mupEl);
    for (var i = 0; i < _stateButtons.length; i++) {
      var btn = _stateButtons[i];
      var isActive = btn.getAttribute('data-state') === cur;
      if (isActive) {
        btn.setAttribute('data-active', '1');
        btn.style.background   = '#1a73e8';
        btn.style.color        = '#fff';
        btn.style.borderColor  = '#1a73e8';
      } else {
        btn.removeAttribute('data-active');
        btn.style.background   = '#fafafa';
        btn.style.color        = '#333';
        btn.style.borderColor  = '#ccc';
      }
    }
  }

  // ⑤ 膜の中へ移動（WYSIWYGのみ・ヘッダー/フッターemにカーソルがある時表示）
  //    ヘッダーem → body先頭へ。フッターem → body末尾へ。
  var _itemJumpInside = null;
  if (_isWYSIWYG) {
    _addSep();
    _itemJumpInside = _addItem('膜の中へ移動', function() {
      var em   = _ctxEmCur;
      var mup  = em ? em.closest('.mup') : null;
      var body = _getBody(mup);
      if (!body) return;
      var isHd = !!(em && em.closest('.mup-hd'));
      var s = window.getSelection();
      var r = document.createRange();
      if (isHd) {
        // ヘッダーem → body先頭テキストへ
        var tw = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
        var fn = tw.nextNode();
        if (fn) r.setStart(fn, 0); else r.setStart(body, 0);
      } else {
        // フッターem → body末尾テキストへ
        var tw2 = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
        var ln = null, tn;
        while ((tn = tw2.nextNode())) ln = tn;
        if (ln) r.setStart(ln, ln.length); else r.setStart(body, body.childNodes.length);
      }
      r.collapse(true); s.removeAllRanges(); s.addRange(r);
    });
    _itemJumpInside.style.display = 'none'; // 初期非表示
  }
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
  // 対象: .mup-ico / .mup-name（アイコン・名前）＋ WYSIWYGのみ .mup-hd em（コメント編集中）
  // キャプチャ相(true) + stopImmediatePropagation でTinyMCEのメニューを完全抑制
  document.addEventListener('contextmenu', function(e) {
    var target   = e.target.closest('.mup-ico, .mup-name');
    var cursorEm = _isWYSIWYG ? e.target.closest('.mup-hd em, .mup-ft em') : null;
    if (!target && !cursorEm) { _hide(); _hideScrollMenu(); return; }
    e.preventDefault();
    e.stopImmediatePropagation();
    var mupEl = e.target.closest('.mup');
    _show(e.clientX, e.clientY, mupEl, cursorEm);
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
      // v7.4: 最近クリックした場合は書込が完了するまでポーリングをスキップ（レース対策）
      if (Date.now() < _pendingSetActiveUntil) return;
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
  document.documentElement.appendChild(_scrollMenu);

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
    if (!_scrollMenu.parentNode) document.documentElement.appendChild(_scrollMenu);
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
