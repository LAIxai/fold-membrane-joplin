/**
 * \▼[CN=5831_FILE_HEADER] // ファイルヘッダー
 * @file    index.ts
 * @version 8.37
 * @date    2026.04.10(金)
 * @author  俊克 + Claude (Anthropic)
 * @desc
 *   v1.0 2026.03.18 am10:12 末尾追記
 *   v1.1 2026.03.18 pm01:36 先頭挿入
 *   v1.2 2026.03.18 pm02:00 §MK§マーカーでカーソル位置挿入
 *   v1.3〜v1.7      各種バグ修正
 *   v1.8 2026.03.18 pm08:59 onNoteChange→span破壊を膜記法に自動修復
 *   v2.0 2026.03.19 am05:58 repairMupBodyにバックスラッシュ増殖修復追加
 *   v2.2 2026.03.19 am11:31 onNoteChange10秒デバウンス全修復
 *   v2.3〜v3.2      正規表現バグ修正
 *   v3.3 2026.03.19 pm04:02 手動Repair Membranes ✨メニュー追加
 *   v3.4 2026.03.19 pm04:12 repairScript復活→isMarkdownModeフラグ管理
 *   v3.5 2026.03.19 pm04:25 toggleEditorsでWYSIWYG→Markdown→修復→WYSIWYG
 *   v3.6 2026.03.19 pm04:50 ①膜の存在②更新日③span検出④修復の4段階チェック
 *   v3.7 2026.03.19 pm05:15 repairScript登録を一時無効化→メニュー消失バグ調査
 *   v3.8 2026.03.19 pm09:53 Insert Membrane→WYSIWYGはtoggleEditorsで自動切替
 *   v3.9 2026.03.19 pm10:12 toggleEditors前の待ち時間を500ms→1500msに増加
 *   v4.0 2026.03.19 pm10:20 Repair Membranes→WYSIWYGで実行時に自動toggleEditors
 *   v4.1 2026.03.19 pm10:26 isMarkdownModeフラグ廃止→常にtoggleEditors実行
 *   v4.3 2026.03.19 pm11:31 mupInsertVをStep1テスト用に変更→111先頭書込→WYSIWYG戻る
 *   v4.4 2026.03.20 am04:44 v4.3にrepairMupSpanを追加→Step2テスト
 *   v4.5 2026.03.20 am05:38 §MK§廃止→toggleEditors+先頭追加のシンプル実装
 *   v4.6 2026.03.20 am08:04 repairMupSpanにタグ分断修復+class="mup-ico"付加を追加
 *   v4.7 2026.03.20 am08:52 repairMupSpanをdiv形式のまま修復（\▼変換を削除→罫線破壊防止）
 *   v4.8 2026.03.20 am09:10 insertTemplateを§MK§プローブでモード判定に変更
 *   v4.9 2026.03.20 am09:27 mupInsertVをinsertTemplate経由に修正・repairMupSpanをシンプルなdiv修復に修正
 *   v5.0 2026.03.20 pm01:56 &nbsp;無限増殖修復追加・---保護・repairをMarkdownモードで実行
 *   v5.1 2026.03.21 ① Insert Membrane に[⊕0+0]追加 ② mupToggle onMessage→カウント書き戻し
 *   v5.2 2026.03.21 webviewApi.postMessage第1引数にIDを追加→onMessage発火修正
 *   v5.3 2026.03.21 [∞]簡略形対応・[N]簡略形対応（数字のみ→⊕N+0として開始値指定）
 *   v5.4 2026.03.21 repairMupSpanにSPAN2MUP変換追加・修復flowを§MK§+repair一括処理に改善
 *   v5.8 2026.03.21 pm07:33 insertTemplate刷新: toggleEditors廃止→WYSIWYGは末尾追記で①②③バグ修正
 *   v5.9 2026.03.21 pm07:47 insertTemplate整理: WYSIWYG=toggleEditors前後で挟むだけ・MARKER挿入は共通処理
 *   v6.0 2026.03.21 pm08:26 MARKERをインラインコード`§MK§`に変更→TinyMCEが<code>として保持→toggleEditors後に検出可能
 *   v6.1 2026.03.21 pm08:51 WYSIWYGはclipboard.writeText+Pasteコマンドでカーソル位置挿入（insertTextはCodeMirror専用と判明）
 *   v6.2 2026.03.21 pm08:57 WYSIWYGはmceInsertContent+templateToHtmlでカーソル位置挿入（clipboard sandbox問題回避）
 *   v6.3 2026.03.21 pm09:00 WYSIWYGはclipboard.writeText+Cmd+V(sendInputEvent)でOS経由ペースト
 *   v6.4 2026.03.21 pm09:09 WYSIWYG検出時にCmd+Zで"null"アンドゥ→Cmd+Vでtemplate挿入
 *   v6.5 2026.03.21 pm09:16 Undoコマンドで"null"消去・getFocusedWindow→getCurrentWindow・旧remoteフォールバック追加
 *   v6.6 2026.03.21 pm09:30 Cmd+V前にShift+Cmd+B(ノート本文フォーカス)を発火してからCmd+V
 *   v6.7 2026.03.21 pm09:35 WYSIWYGはsendInputEvent廃止→mceInsertContent(Undoと同じeditor.execCommandルート)で挿入
 *   v6.8 2026.03.21 pm09:41 mceInsertContent argsを[html]→html直渡しに変更・clipboard.writeText復活
 *   v6.9 2026.03.21 pm09:49 sendInputEvent復活・Cmd+V前のディレイを2000msに延長
 *   v7.0 2026.03.21 pm10:04 sendInputEvent廃止→AppleScript(osascript)でOS経由Cmd+V発火
 *   v7.1 2026.03.21 pm10:15 待機時間0化・Windows(PowerShell)/Linux(xdotool)フォールバック追加
 *   v7.2 2026.03.21 pm11:25 ①mupUpdateBadge削除(WYSIWYGで⊕/⊖2重挿入バグ修正) ②テンプレートを\▼形式に ③WYSIWYG INSERT→toggleEditors+insertText
 *   v7.3 2026.03.22 am02:36 v7.2の過剰変更を戻す: ①mupUpdateBadge復活 ②WYSIWYG INSERT→v7.1のclipboard+AppleScript ③\▼テンプレートのみ維持
 *   v7.4 2026.03.22 am03:02 WYSIWYG INSERT→Undo後にtoggleEditors→Markdownモードでclipboard+osascript Cmd+V（TinyMCEバックスラッシュ追加を回避）
 *   v7.5 2026.03.22 am03:11 WYSIWYG INSERT→toggleEditors後にeditor.focus+insertTextに変更（osascriptはフォーカス未取得で失敗）
 *   v7.6 2026.03.22 am03:14 WYSIWYG INSERT→toggleEditors+editor.focus+1500ms待ち後にosascript Cmd+V（フォーカス確保してからペースト）
 *   v7.7 2026.03.22 am03:21 editor.focus削除・1500ms待ち・osascriptにactivate追加
 *   v7.8 2026.03.22 am04:40 mupInsertAtCursor(CM6コマンド)登録→toggleEditors後に引数渡しでカーソル挿入（AppleScriptフォーカス問題を根本回避）
 *   v7.9 2026.03.22 am05:17 v7.1完全復元: WYSIWYG INSERT→Undo+clipboard+osascript(toggleEditors廃止)・テンプレート→バックティック・ドル形式
 *   v7.10 2026.03.22 am05:43 WYSIWYG INSERT→toggleEditors+2000ms+clipboard+osascript（editor.focus/activate不要）・テンプレート→\▼形式
 *   v7.11 2026.03.22 am06:03 WYSIWYG INSERT→osascript1本: Ctrl+Cmd+E(切替)+delay 1+Cmd+V(ペースト)→toggleEditors廃止
 *   v7.12 2026.03.22 am06:16 v5.9方式復活: WYSIWYG→osascriptでMARKER挿入→toggleEditors→MARKER位置にdata.put→toggleEditors戻す
 *   v7.13 2026.03.22 am06:27 toggleEditors後の待ちを1000ms→2000ms（DB保存完了待ち）
 *   v7.14 2026.03.22 am06:35 テスト: Undo→toggleEditors→800ms→Cmd+V×5回（CodeMirrorに届くか確認）
 *   v7.15 2026.03.22 am06:35 待ち0ms（待つ必要なし）
 *   v7.16 2026.03.22 am06:43 toggleEditors後にinsertText(PROBE)ポーリングでMarkdown確定→data.putで挿入（Cmd+V廃止）
 *   v7.17 2026.03.22 am06:49 v7.12に戻す+ポーリングをinsertTextではなくselectedNote()でMARKERを検索（insertTextはTinyMCEに行くため）
 *   v7.18 2026.03.22 バッジ重複バグ修正: ①onMessage.REGEXのgroup3バグ修正(g3→_g2,g3) ②§MK§プローブでモード判定→WYSIWYGではmupUpdateBadge呼ばない
 *   v7.19 2026.03.22 §MK§プローブ廃止→mupCheckMode+postMessageでモード判定（insertTextがTinyMCEに"null"挿入するバグを根本除去）
 *   v7.20 2026.03.22 insertTemplateもmupCheckMode判定に統一: Markdown=mupInsertAtCursor直接挿入(MARKER不要・null不要)、WYSIWYG=Undo廃止+osascript維持
 *   v7.21 2026.03.22 ②wait 200ms→300ms（osascript→TinyMCEペースト完了に必要な最小値、③ポーリング間隔200msは独立）
 *   v7.22 2026.03.22 ③polling 100ms→200ms（100msではDB保存未完了でMARKER検出失敗、実測200ms必要）
 *   v7.23 2026.03.22 mupLatexToCode廃止→mupInsertLatexInline/Block（テンプレート挿入）に置換・latexToCode関数削除
 *   v7.24 2026.03.22 replace(MARKER,template)→replace(MARKER,()=>template)（$`特殊パターンによる前テキスト混入バグ修正）
 *   v7.25 2026.03.22 ②wait 300ms→500ms（300msは環境依存で不安定、v7.17確認済みの値に戻す）
 *   v7.26 2026.03.22 mupInsertLatexBlock: `$$...$$`→```\n$$...$$\n```（トリプルバッククォートに修正）
 *   v7.27 2026.03.23 v2.0記法対応: H1=/H2=/H3=プレフィックス型サポート・pfx分離・Bug#1修正(insertTemplate 300ms→500ms)
 *   v7.28 2026.03.23 Bug#1最終修正: mupCheckModeInsert専用コマンド+_insertModeResolve分離→競合解消 / CN=固有値+名前形式に変更
 *   v7.29 2026.03.23 v7.28退行修正: insertTemplate.PROBEをmupCheckMode(実績あり)に戻す+両resolver同時解決で競合根絶
 *   v7.30 2026.03.23 v7.26状態に完全復元: _insertModeResolve廃止・_modeCheckResolve共有・タイムアウト300ms（v7.26実績値）
 *   v7.31 2026.03.23 Bug#1根本修正: webviewApi.postMessage廃止→mupInsertAtCursor(PROBE)+DBポーリングでMarkdown/WYSIWYG判定
 *   v7.32 2026.03.23 Bug#1最終解決: joplin.settings.globalValue('editor.codeView')でゼロ遅延モード判定
 *   v7.33 2026.03.23 WYSIWYGパス刷新: osascript廃止→toggleEditors+codeViewポーリング+mupInsertAtCursor+自動保存待ち+toggleEditors戻す
 *   v7.34 2026.03.23 WYSIWYGパス再刷新: toggleEditors完全廃止→osascript§MK§挿入→600ms待ち→data.put置換（カーソル位置保持）
 *   v7.35 2026.03.23 isMarkdownMode()関数化: editor.codeView判定を再利用可能なユーティリティに分離
 *   v7.36 2026.03.23 🔖しおりボタン追加: \🔖[label]記法→クリックでtoggleEditors・メニュー#3に追加
 *   v7.37 2026.03.23 🔖デフォルトラベルを「ここだよ🔖!!」に変更→文字検索でも位置特定可能
 *   v7.38 2026.03.23 🔖しおりWYSIWYG破壊自動復旧: toggleEditors後に「🔖 label」→「\🔖[label]」修復
 *   v7.39 2026.03.23 WYSIWYGポーリング延長: 10回×200ms→30回×200ms（大ノート対応）+MARKER残存クリーンアップ追加
 *   v7.40 2026.03.23 WYSIWYGパス修正: toggleEditors復活（強制保存）→ポーリング20回→data.put（大ノート根本対応）
 *   v7.41 2026.03.24 WYSIWYGパス刷新: Electron HTML clipboard+<pre><code>→osascript Cmd+V（§MK§/toggleEditors/ポーリング完全廃止）
 *   v7.42 2026.03.24 WYSIWYGクリップボード修正: require('electron')→joplin.clipboard.write({html})+language-undefined class付加
 *   v7.43 2026.03.24 language-undefined→language-に修正→'''ゴミのみ・WYSIWYG挿入完成
 *   v7.44 2026.03.24 バックスラッシュ無限増殖修復強化: H1〜H3型・🔖・\[パターン追加、しおり切替時に全修復統合
 *   v7.45 2026.03.24 自動修復2点修正: ①\\\ → ``` 復旧追加 ②タイミング修正(isMarkdownMode後にDB書込待ちポーリング)
 *   v7.46 2026.03.24 バックスラッシュ増殖根本対策: onNoteChange常時監視→Markdownモード+破壊検出時に自動修復（🔖ボタン以外でも動作）
 *   v7.47 2026.03.24 onNoteChange修正: codeView更新前に発火するためisMarkdownModeポーリング追加（最大3秒待機）
 *   v7.48 2026.03.24 onNoteChange廃止→editor.codeView 500ms監視: false→true遷移検出でCN=6302と同じ修復ロジック実行
 *   v7.49 2026.03.24 BACKSLASH修復強化: ①^\\{2,}`?$→``` ⑤\`→` ⑥\▼\🔖以外の全バックスラッシュ削除
 *   v7.50 2026.03.24 CODEFENCE残骸除去: WYSIWYG挿入時の```で囲まれた栞・膜ブロックを修復
 *   v7.51 2026.03.24 HR修正: CN=3819(* * *→---)を無効化(TinyMCEのSetext見出し混同バグ回避); CN=4392正規表現強化
 *   v7.52 2026.03.24 4点修正: ①rule①を{3}限定(長バックスラッシュ行→空行) ②CN=6537強化(&nbsp;単独行/インライン) ③CN=3819復活(* * *→<hr>) ④CN=4392を\s+?方式に
 *   v7.53 2026.03.24 CN=3819修正: <hr>→* * *に戻す（JoplinはデフォルトHTMLレンダリングOFF→<hr>がテキスト表示になるため）
 *   v7.54 2026.03.24 CN=5274: Insert HR ―メニュー追加（Markdown=* * *挿入、WYSIWYG=<hr>をHTMLクリップボード経由でペースト）
 *   v7.55 2026.03.25 CN=3819復活(* * *→<hr>)+CN=1647追加: Markdown→WYSIWYG時にCmd+A/C/V+clipboard.readHTML()で<hr>テキストを実罫線に自動変換
 *   v7.56 2026.03.25 CN=3819: &lt;hr&gt;→<hr>正規化追加 / CN=1647: clipboard.readHTML廃止→mceGetContent+mceSetContent方式に変更
 *   v7.57 2026.03.25 markdownItRenderer.js: <hr>行→実HR要素変換（膜あり=renderMarkMup内、膜なし=mup_hr coreルール）WYSIWYG変換パイプライン経由で罫線復元
 *   v7.58 2026.03.25 CN=1647: Shift+Cmd+B(ノート本文フォーカス)追加→フォーカス不在でCmd+A/Cが無効化されていた根本原因を修正
 *   v7.59 2026.03.25 CN=4392仕様変更: ```完全除去→連続```のみ1つに統合（単一```は選択境界として保持）
 *   v7.60 2026.03.25 CN=2615: 同行内連続span結合追加（WYSIWYG膜編集時に固有値/コメントspanが分裂→復元不能バグ修正）
 *   v7.61 2026.03.25 CN=1647: Cmd+V(ペーストハンドラー)→mceSetContent に変更（ペースト時に<code>等が消えるバグ修正）
 *   v7.62 2026.03.25 CN=2615: 同行mergeルール削除（矢印spanとCN spanが合体する根本バグ）; CN=7384: 複数CN値span対応; CN=4729: CN番号自動付加
 *   v7.63 2026.03.25 CN=8153: 開き膜にバッジなし→[⊕0+0]/[⊖0+0]自動付加（バッジなしはmup-status未生成→折畳み状態が永続しないバグ修正）
 *   v7.64 2026.03.25 CN=3726追加: <pre><code>/<code>→Markdown変換（WYSIWYG→Markdown時TinyMCEがHTMLタグ出力→Joplinでプレーンテキスト化するバグ修正）; CN=4729: ランダム番号→現在時刻の分秒4桁に変更; markdownItRenderer: statusHtmlを<em>内に移動（カウント値がWYSIWYG往復で消えるバグ修正）
 *   v7.65 2026.03.25 statusHtml: <span>→<code>に変更（TinyMCEが<span>を完全削除→<code>はバックティック保持される); <em>移動を戻す; CN=5492: `[⊕N+M]`→[⊕N+M]逆変換追加
 *   v7.66 2026.03.26 CN=2091: 固有値なしCN値に(?:\d{4}_)?オプション前置（repairMupSpanとのレースコンディション解消）
 *   v7.67 2026.03.26 CN=5849: $$膜ラッパー除去（TinyMCE保護→Markdown復元時に$$strip）; CN=3417: onNoteSelectionChange→送出ノート自動修復
 *   v7.68 2026.03.26 CN=7384: H1=型span修復: <h1>→<span class="mup-pfx-H1">変更対応（TinyMCEの#変換防止）; [^\s<>]*→[^<>]*(空白許容); CN=ハードコード廃止→class検出; 仕様: //commentはoption(開始膜のみ推奨)
 *   v7.69 2026.03.26 CN=3417: onNoteSelectionChangeをポーリング方式に（span破壊確認後に修復、レースコンディション解消）; CN=9031: modeWatcherにノートIDトラッキング+WYSIWYG切替後span検出→toggleEditors修復（フォールバック）
 *   v7.70 2026.03.26 CN=7538: switchedToMarkdown修正: 事前フェッチnoteに破壊パターンあれば即修復（v7.69ポーリング200ms初期待機がH1=修復を阻害するリグレッション解消）; CN=9031をelse ifに変更
 *   v7.71 2026.03.26 CN=7384: 閉じ膜ナビゲーター方式追加（閉じ膜のCN→対応する壊れた開き膜を検出・修復）
 *   v7.72 2026.03.26 CN=7384: SPAN2MUP正規表現の\s*→[ \t]*修正（改行消費バグ解消）
 *   v7.73 2026.03.27 CN=7384: 閉じ膜直後のテキスト保護（\▲[CN=xxx]直後に改行挿入）
 *   v7.74 2026.03.27 _hasDmg: 高速破壊検出関数追加（閉じ膜後テキスト・隣接HR検出でポーリング最適化）; CN=3819: * * *前後に空行挿入追加
 *   v7.75 2026.03.27 CN=9031/CN=3417: <span>検出→class="mup-"に絞る（リンク・画像・テーブルのspan誤検知でtoggleEditors暴発→文字化け修正）
 *   v7.76 2026.03.27 CN=1647無効化: mceSetContent廃止（* * *→<hr>変換でTinyMCE往復時に空行消失）; CN=3819: <hr>&lt;hr&gt;→* * *変換追加; _hasDmg: 隣接HR検出追加
 *   v7.77 2026.03.27 CN=9031/CN=3417: class="mup-" || /^🔖 /.test() 条件に統一（栞タグのみノートも修復対象に）; CN=3417: _hasMembrane事前チェック追加
 *   v7.78 2026.03.27 CN=4853追加: <a href=":/id">→[text](:/id) / <img src=":/id">→![alt](:/id) 変換（TinyMCEが膜付きノートのリンク・画像をHTML化するバグ修正）
 *   v7.79 2026.03.27 CN=4853拡張: <table>→Markdownテーブル変換追加（TinyMCEがテーブルをdiv/tableタグにシリアライズするバグ修正）
 *   v7.80 2026.03.27 CN=4853拡張: ①<div class="joplin-table-wrapper">対応（Joplin独自ラッパー+TailwindクラスHTML）②<img src="file:///...resources/HEXID.ext">→![](:/HEXID)対応（TinyMCEがローカルパス展開するバグ修正）
 *   v7.81 2026.03.27 CN=4853拡張: ①テーブル前後に\n\n追加（markdown-itがテーブル認識できずパイプ文字プレーンテキスト表示のバグ修正）②]\n(:/id)分断リンク結合（旧バージョンDB保存済み破損データ修復）
 *   v7.82 2026.03.27 CN=6174追加: _hasDmg共有化+拡張（split link/file:///path/htmltable検出追加）; CN=3417: ①②ともに_hasDmg統合（旧DB保存済み破損ノートをノート切替時に自動修復）
 *   v7.83 2026.03.27 switchedToMarkdown修復後にeditor.setTextでCodeMirrorをリフレッシュ（DB保存だけでは左ペイン/プレビュー未更新問題の修正）; _autoRepairPrev=true追加（修復後の再トリガー防止）
 *   v7.84 2026.03.27 CN=1920: コードブロック保護追加（```...```・`...`内をプレースホルダに退避してから⑤⑥実行→$\frac{a}{b}$等のLaTeX内バックスラッシュ削除バグ修正）
 *   v7.85 2026.03.28 CN=1920: 保護範囲を$$...$$・$...$（LaTeX数式）にも拡張（インライン数式$\frac{}{}$の\バックスラッシュ削除バグ修正）; CN=6537: 単独行&nbsp;削除を廃止→スペース変換のみ（罫線間空行&nbsp;が消えるバグ修正）
 *   v7.86 2026.03.28 switchedToMarkdown: _hasDmg未検出時に早期return追加（破損パターンなし→修復スキップ→クリーンなノートへの副作用ゼロ化）
 *   v7.87 2026.03.28 CN=8052拡張: ```\n$...$\n```→$...$変換追加（TinyMCEが膜付きノートの数式を\\\コードブロック化→CN=1920で```変換後の残骸修復）
 *   v7.88 2026.03.28 Bug#1: CN=3094追加: 膜を含むコードフェンスを除去; Bug#2: CN=4481追加: italic comment残骸除去; Bug#3: CN=2615 rule4に* * *否定先読み追加
 *   v7.89 2026.03.28 CN=3094修正: \`単独行を削除（TinyMCEは```を\`にシリアライズ→バリア残骸の根本除去）
 *   v7.90 2026.03.28 CN=6174修正: _hasDmgに\`バリア検出を追加（v7.86早期returnでrepairMupSpanに到達しなかった根本原因）
 *   v7.91 2026.03.28 根本原因特定: TinyMCEはコードブロックを```(バックスラッシュなし)でシリアライズ→_hasDmgが未検出; CN=6174: ```+膜共存検出追加; CN=3094: ```[lang]+孤立```対応
 *   v7.92 2026.03.28 火元を断つ: CN=6247 WYSIWYG挿入を<pre><code>→<p>行分割に変更（コードフェンス自体を生成しない→バリア問題の根本解決）
 *   v7.93 2026.03.28 $記法対応: ステータスバッジ正規表現を$\▼[CN=...]$形式にも対応; markdownItRenderer.js v2.3
 *   v7.94 2026.03.28 pm11:20 無限ループ対策: ①CN=6174_hasDmg: ```+膜の誤検知修正(```直後が膜行のみ検出); ②CN=3417: ポーリング15→5回; ③CN=3417: _isAutoRepairing ガード追加
 *   v7.95 2026.03.29(日) am11:25 CN=6174_hasDmg: \\▼限定→\\{2}（任意二重バックスラッシュ）に拡張（膜外テキストへの増殖を検出できなかった欠陥修正）
 *   v7.96 2026.03.29(日) pm12:16 CN=3094: inner抽出と同時にバックスラッシュ除去を追加（CN=1920保護をすり抜ける```ブロック内バックスラッシュ問題の根本修正）; CN=3417②: data.put後にeditor.setTextで強制リフレッシュ追加
 *   v7.97 2026.03.30(月) am10:31 CN=4821: repairMupSpanにHTMLエンティティデコード追加; CN=6174: &lt;span/&lt;div検出追加; CN=5293: Repair HTML Entitiesメニュー追加（暫定）
 *   v7.98 2026.03.30(月) am11:00 栞デフォルトラベルを「ここだよ🔖!!」→「Here 🔖!!」に変更（英語化）
 *   v7.99 2026.03.30(月) am11:20 新アーキテクチャ原則: WYSIWYGは書き込まない; CN=3417①②にMarkdownモードガード追加; CN=9031無効化
 *   v8.00 2026.03.30(月) am11:30 テストケース: 栞ボタンに膜フラグ付与; CN=4471: WYSIWYGはHTML div挿入→即時表示; CN=7832: BOOKMARK_DIV→\🔖変換追加; CN=6174: data-mup検出追加
 *   v8.01 2026.03.30(月) am12:00 CN=3291: Markdown→WYSIWYG切替時にmceAddStyleSheetでdata-mup CSSをTinyMCEに注入（テスト）
 *   v8.02 2026.03.30(月) pm00:20 CN=4471: <div>→<span>に変更（<p>内不正HTML→スタイル消失の修正）; CN=7832: span/div両対応
 *   v8.03 2026.03.30(月) pm01:10 CN=4471: WYSIWYGも\🔖[label]プレーンテキストをmceInsertContentで挿入（HTMLサニタイザー完全回避）
 *   v8.04 2026.03.30(月) pm02:10 CN=7832: data-mup-dollar="1"で$\🔖[label]$を復元; markdownItRenderer.js v2.4: RE_BM_DOLLAR追加・$形式検出→data-mup-dollar付与
 *   v8.05 2026.03.30(月) pm06:50 CN=1920: $...$スロット復元時に②③適用（\\🔖増殖の根本修正）; CN=6483: Repair Backslash ∞🔧メニュー追加（\\{2,}→\核オプション）
 *   v8.06 2026.03.30(月) pm07:35 CN=7832: data-mup-dollar→class="mup-dollar"に変更（TinyMCEのsetContentもdata-*を消す→classは保持 → Cmd+S後も$が消えない根本修正）; markdownItRenderer.js v2.5
 *   v8.07 2026.03.30(月) pm08:xx A記法に全面切替: \▼→A▼, \▶→A▶, \▲→A▲, \◀→A◀, \🔖→A🔖（バックスラッシュ増殖根本解決）; mupMigrateToA移行メニュー追加
 *   v8.08 2026.03.30(月) A記法→M記法（Membrane/膜の頭文字）: A▼→M▼, A🔖→M🔖等; mupMigrateToM移行メニュー更新
 *   v8.09 2026.03.31(火) 正式記法を$M▼[CN=...]$に統一: テンプレート・repair・_bm2mup全更新; markdownItRenderer.js v2.8: $オプション対応
 *   v8.10 2026.03.31(火) 記法を$▼_M[CN=...]$に変更（▼先頭・_MはLaTeXサブスクリプト）。旧$M▼形式も受理; KaTeX競合修正: katexバンドル+renderMath()で自前レンダリング; markdownItRenderer.js v2.9
 *   v8.11 2026.03.31(火) 正式記法を▼m[CN=...]に変更（$なし・#見出し感覚）; repairMupSpan出力も▼m形式に統一; markdownItRenderer.js v3.0
 *   v8.12 2026.03.31(火) データ上は$▼m[...]$（KaTeX保護）を維持。$なしはREADME(GitHub)のみ。template/repair/$を全復元。
 *   v8.13 2026.03.31(火) markdownItRenderer.js v3.1: 🔖 label破損形式をデータ変更なしで表示修復（RE_BM拡張・検出条件を▼m[3文字チェックに統合）
 *   v8.14 2026.03.31(火) CN=3417: isMarkdownMode()ガード除去。WYSIWYGモードでも別ノート切替時に修復発火（WYSIWYG→MD切替と同一処理）
 *   v8.15 2026.03.31(火) CN=3417①②: _hasDmgを_hasMemberaneより先にチェック（spanform破損後▼m[パターン消失→_hasMembrane=false早期breakバグ修正）; ②_hasMembrane2廃止→_hasDmgのみ判定
 *   v8.16 2026.03.31(火) CN=9031復活: WYSIWYG内ノート切替→膜ノート表示リフレッシュ（toggleEditors→editor.setTextに変更・cursor reset解消）。根本原因: データ正常($▼m[]$, KaTeX保護)なのにTinyMCEが再描画しないJoplinバグの回避
 *   v8.17 2026.03.31(火) CN=9031改: updated_time比較方式に変更（編集ありの時だけ再描画。編集なし切替は過剰な再描画なし）; onNoteSelectionChangeにupdated_timeベースライン保存追加
 *   v8.18 2026.03.31(火) markdownItRenderer.js v3.2: CN=RENDERER.HTML.LOOP.HR拡張: * * * / --- / ___ をMarkdown HR記法として<hr>に変換（WYSIWYG→MD→WYSIWYG往復で罫線がテキスト化するバグ修正）
 *   v8.19 2026.04.01(水) markdownItRenderer.js v3.3: 罫線増殖バグ修正（空行スペーサー<p style="height:0.8em">削除→TinyMCEが<hr>変換する根本原因除去; <hr style="margin:0.5em 0">でCSS視覚余白確保）
 *   v8.20 2026.04.01(水) markdownItRenderer.js v4.0: 全面リアーキテクチャ。膜行・栞行のみプレースホルダーに置換→markdown-itにネイティブ処理を委譲。renderMarkMup（全行自前処理）廃止。罫線・空行・太字等はJoplin標準処理で完全解決。
 *   v8.21 2026.04.07(火) ①栞単独ノートボタン非表示バグ修正: markdownItRenderer.js v5.1（🔖m[を早期検出条件に追加）。②閉じ膜・中身非表示バグ修正(応急処置): insertTemplateのテンプレートに空行追加。
 *   v8.22 2026.04.07(火) markdownItRenderer.js v5.2: 複数行段落分割対応（空行必須regression根本修正）。markdown-itが隣接行を1段落にまとめた場合もmup行単位で分割→空行なし膜記法が再び動作。
 *   v8.23 2026.04.07(火) insertTemplateテンプレートの不要な空行を削除（v5.2で根本修正済みのためv0.9.18応急処置を撤回）。
 *   v8.24 2026.04.07(火) CN=3819修正: TinyMCEが改行なしで* * *を連結した場合の対応（改行なし版正規表現を追加）。
 *   v8.25 2026.04.07(火) mupEditor.js v2.0対応: 膜名前自動同期機能追加（開始膜↔閉じ膜CN名リアルタイム同期）。
 *   v8.26 2026.04.08(水) markdownItRenderer.js v5.3対応: mup-hd-lbl導入によるカーソル形状改善。
 *   v8.27 2026.04.08(水) markdownItRenderer.js v5.4: アイコンcursor:default、閉じ膜inline-flex化。
 *   v8.28 2026.04.08(水) markdownItRenderer.js v5.5: 栞ボタンもcursor:default（矢印）に変更。
 *   v8.29 2026.04.08(水) CN=6291 NAME_SYNC追加: WYSIWYG編集後の開閉膜名不一致をrepairMupSpan内で自動修正。
 *   v8.34 2026.04.09(木) CN=4721 SCROLL_TARGET: Markdown→WYSIWYG切替時にCNアンカーを保存。WYSIWYG起動後にscrollIntoViewで対象膜へ自動スクロール。
 *   v8.33 2026.04.09(木) CN=3901 ANTISPOOFING: mupToggle受信直後にノートIDを保存。300msプローブ後・PUT直前に二重照合。
 * \▲[CN=5831_FILE_HEADER]
 */

// \▼[CN=0001_TOC] // 目次
// \▼[CN=5831_FILE_HEADER] // ファイルヘッダー
// \▼[CN=4267_imports] // モジュールインポート
// \▼[CN=9043_repairMupSpan] // TinyMCE破壊をmarkMup記法に修復  {5139,9015,7538,3417} ⇒ Me
//   \▼[CN=5849_repairMupSpan.DOLLARBLOCK] // $$膜ラッパー除去（TinyMCE保護）
//   \▼[CN=2615_repairMupSpan.TAG_JOIN] // タグ間の改行を除去
//   \▼[CN=7384_repairMupSpan.SPAN2MUP] // span形式→markMup記法に変換
//   \▼[CN=6291_repairMupSpan.NAME_SYNC] // WYSIWYG編集後の開閉膜名不一致修正
//   \▼[CN=1920_repairMupSpan.BACKSLASH] // バックスラッシュ増殖修復
//   \▼[CN=6537_repairMupSpan.NBSP] // &nbsp;無限増殖修復
//   \▼[CN=3819_repairMupSpan.HR] // * * * → --- 復元
//   \▼[CN=8052_repairMupSpan.LATEX] // コード囲み→LaTeX復旧
//   \▼[CN=4392_repairMupSpan.CODEFENCE] // 連続```統合（膜2つ連続ペースト時のみ）
// \▼[CN=1473_plugin] // プラグイン本体
//   \▼[CN=6924_renderer] // markMupレンダラー登録
//   \▼[CN=3518_editorScript] // CodeMirrorプラグイン登録
//   \▼[CN=7201_modeCheck] // mupCheckMode応答受信  ⇒ Me ⇒ {2847_isMarkdownMode}
//   \▼[CN=6174_hasDmg] // 破損パターン検出ユーティリティ  {7538,3417} ⇒ Me
//   \▼[CN=4896_onMessage] // mupToggle/mupToggleEditorメッセージ受信  ⇒ Me ⇒ {5139,8347,2091,5763,9412}
//     \▼[CN=5139_onMessage.TOGGLE_EDITOR] // 🔖エディタ切替＋自動復旧  {4896,4471} ⇒ Me ⇒ {9043,2847}
//     \▼[CN=8347_onMessage.PROBE] // Markdown/WYSIWYGモード判定
//     \▼[CN=2091_onMessage.REGEX] // 開始膜行のバッジを置換
//     \▼[CN=5763_onMessage.PUT] // DBへ書き戻し
//     \▼[CN=9412_onMessage.EDITOR] // CM6エディタ左ペインを同期
//   \▼[CN=2847_isMarkdownMode] // エディタモード判定ユーティリティ  {5139,7538,7125,7201} ⇒ Me
//   \▼[CN=7538_modeWatcher.AUTOREPAIR] // モード変化監視: 双方向遷移検出→自動修復  ⇒ Me ⇒ {9043,2847,6174}
//     \▼[CN=1647_modeWatcher.HR_RESTORE] // [無効化] Markdown→WYSIWYG: HR自動変換
//   \▼[CN=3417_noteSelectWatcher] // ノート切替時: 送出ノート自動修復（バックグラウンド）  ⇒ Me ⇒ {9043,6174}
//   \▼[CN=3658_insertTemplate] // 膜テンプレート挿入関数  {8530} ⇒ Me ⇒ {7125}
//     \▼[CN=7125_insertTemplate.MODECHECK] // isMarkdownMode()でMarkdown/WYSIWYG判定  {3658} ⇒ Me ⇒ {2847}
//     \▼[CN=4983_insertTemplate.MARKDOWN] // Markdownモード: mupInsertAtCursorで直接挿入
//     \▼[CN=6247_insertTemplate.WYSIWYG] // WYSIWYGモード: MARKER挿入→data.put
//   \▼[CN=8530_commands] // コマンド登録  {2384} ⇒ Me ⇒ {3658,4471,9015,5274}
//     \▼[CN=1849_mupInsertLatexInline.EXEC] // インラインLaTeX挿入
//     \▼[CN=3726_mupInsertLatexBlock.EXEC] // ブロックLaTeX挿入
//     \▼[CN=4471_mupInsertBookmark.EXEC] // 🔖しおりボタン挿入  {8530} ⇒ Me ⇒ {5139}
//     \▼[CN=9015_mupRepairSpan.EXEC] // Repair Membranes  {8530} ⇒ Me ⇒ {9043}
//     \▼[CN=5274_mupInsertHR.EXEC] // Insert HR ―（Markdown=* * *、WYSIWYG=<hr>HTML貼付け）
//   \▼[CN=2384_menu] // ツールメニュー登録  ⇒ Me ⇒ {8530_commands}
// \▲[CN=0001_TOC]

// \▼[CN=4267_imports] // モジュールインポート
import joplin from 'api';
import { ContentScriptType, MenuItemLocation } from 'api/types';
// \▲[CN=4267_imports]

// \▼[CN=9043_repairMupSpan] // TinyMCE破壊をmarkMup記法に修復
// {5139_onMessage.TOGGLE_EDITOR, 9015_mupRepairSpan.EXEC, 7538_modeWatcher.AUTOREPAIR, 3417_noteSelectWatcher} ⇒ Me
function repairMupSpan(body: string): string {
  let fixed = body;

  // \▼[CN=4821_repairMupSpan.ENTITY_DECODE] // HTMLエンティティデコード（TinyMCE二重エスケープ修復）
  // TinyMCEが<div class="mup">を&lt;div class=&quot;mup&quot;&gt;にエンコードするケースを修復。
  // div/spanタグに限定してデコード（コードブロック内の正当な&lt;等を保護）。
  fixed = fixed.replace(
    /&lt;(\/?(?:div|span)[^&\n]*?)&gt;/g,
    (_: string, inner: string) => '<' + inner.replace(/&quot;/g, '"').replace(/&amp;/g, '&') + '>'
  );
  // \▲[CN=4821_repairMupSpan.ENTITY_DECODE]

  // \▼[CN=7832_repairMupSpan.BOOKMARK_DIV] // data-mup="bookmark" div/span → \🔖記法に変換（Markdownモード用）
  // WYSIWYGで挿入されたHTML形式の栞をMarkdown記法に戻す（div/span両対応）
  // data-mup-dollar="1" があれば $\🔖[label]$ 形式で復元（ドル保護記法を維持）
  // data-mup-dollarはTinyMCEが消す → class="mup-dollar"で判定（TinyMCEはclassを保持する）
  const _bm2mup = (_m: string, label: string) => '$🔖m[' + label + ']$';
  fixed = fixed.replace(
    /<(?:div|span)[^>]*data-mup="bookmark"[^>]*data-mup-label="([^"]*)"[^>]*>[\s\S]*?<\/(?:div|span)>/g,
    _bm2mup
  );
  fixed = fixed.replace(
    /<(?:div|span)[^>]*data-mup-label="([^"]*)"[^>]*data-mup="bookmark"[^>]*>[\s\S]*?<\/(?:div|span)>/g,
    _bm2mup
  );
  // \▲[CN=7832_repairMupSpan.BOOKMARK_DIV]

  // \▼[CN=5849_repairMupSpan.DOLLARBLOCK] // $$膜ラッパー除去: TinyMCE保護用の$$を解放
  // TinyMCEは$$...$$ブロックを数式ウィジェットとして扱い、内容を一切変換しない。
  // ユーザーが$$で膜を囲むと、WYSIWYG↔Markdown往復で膜記法が保護される。
  // WYSIWYG→Markdown後、repairMupSpan実行時に$$ラッパーを除去して膜として機能させる。
  // 本物のLaTeX（$$内に\▼/\▶がない）はそのまま保持する。
  fixed = fixed.replace(
    /^\$\$\r?\n([\s\S]*?)\r?\n\$\$(?=\r?\n|$)/gm,
    function(match: string, inner: string) {
      if (/M[▼▶]/.test(inner) && /M[▲◀]/.test(inner)) {
        return inner; // 膜記法あり → $$を除去して膜を解放
      }
      return match; // 本物のLaTeX → そのまま保持
    }
  );
  // \▲[CN=5849_repairMupSpan.DOLLARBLOCK]

  // \▼[CN=2615_repairMupSpan.TAG_JOIN] // タグ間の改行を除去（TinyMCEが分断したタグを結合）
  fixed = fixed.replace(/(<\/div>)\s*\n\s*(<div)/g, '$1$2');
  fixed = fixed.replace(/(<div[^>]*>)\s*\n\s*(<div)/g, '$1$2');
  fixed = fixed.replace(/(<\/span>)\s*\n\s*(<span)/g, '$1$2');
  fixed = fixed.replace(/(<\/span>)\s*\n\s*(\*)(?!\s\*\s\*)/g, '$1 $2'); // * * * (HR) は結合しない
  fixed = fixed.replace(/(\*[^*\n]*\*)\s*\n\s*(<span)/g, '$1$2');
  // \▲[CN=2615_repairMupSpan.TAG_JOIN]

  // \▼[CN=3726_repairMupSpan.CODE] // HTMLコードタグ→Markdown変換
  // TinyMCEがコードをHTMLタグのまま出力する場合がある（Joplin HTML無効時にプレーンテキスト化する）
  // コードブロック: <pre><code>...</code></pre> → ``` ``` ```...``` ``` ``` (先にブロック処理)
  fixed = fixed.replace(
    /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g,
    function(_: string, code: string) {
      const decoded = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      return '```\n' + decoded.trim() + '\n```';
    }
  );
  // インラインコード: <code>...</code> → `...` (ブロック処理後)
  fixed = fixed.replace(/<code[^>]*>([^<]*)<\/code>/g, '`$1`');
  // \▲[CN=3726_repairMupSpan.CODE]

  // \▼[CN=4853_repairMupSpan.LINKS] // Joplinリンク・画像・テーブルのHTML→Markdown変換
  // TinyMCEが膜付きノートをシリアライズ時にMarkdown→HTMLへ変換するのを戻す

  // ① テーブル変換ヘルパー（HTML<table>→Markdownパイプ形式）
  const _htmlTableToMd = (tableHtml: string): string | null => {
    const rows: string[][] = [];
    const rowMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    for (const row of rowMatches) {
      const cells: string[] = [];
      const cellMatches = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
      for (const cell of cellMatches) {
        const inner = cell.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
        cells.push(inner);
      }
      if (cells.length > 0) rows.push(cells);
    }
    if (rows.length === 0) return null;
    const header    = '| ' + rows[0].join(' | ') + ' |';
    const separator = '| ' + rows[0].map(() => '---').join(' | ') + ' |';
    const body = rows.slice(1).map(r => '| ' + r.join(' | ') + ' |').join('\n');
    // 前後に空行を入れてmarkdown-itがテーブルとして認識できるようにする
    return '\n\n' + header + '\n' + separator + (body ? '\n' + body : '') + '\n\n';
  };
  // joplin-table-wrapperごと変換（Joplin独自ラッパー+TailwindクラスのHTMLをまとめて変換）
  fixed = fixed.replace(
    /<div[^>]*class="[^"]*joplin-table-wrapper[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    function(wrapHtml: string) {
      const tableMatch = wrapHtml.match(/<table[\s\S]*?<\/table>/i);
      if (!tableMatch) return wrapHtml;
      return _htmlTableToMd(tableMatch[0]) ?? wrapHtml;
    }
  );
  // ラッパーなし<table>も念のため処理
  fixed = fixed.replace(/<table[\s\S]*?<\/table>/gi, function(tableHtml: string) {
    return _htmlTableToMd(tableHtml) ?? tableHtml;
  });

  // ② ノートリンク・リソースリンク: <a href=":/hex">text</a> → [text](:/hex)
  fixed = fixed.replace(
    /<a[^>]*href="(:\/[a-f0-9]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    function(_: string, href: string, content: string) {
      const text = content.replace(/<[^>]+>/g, '').trim();
      return '[' + (text || href) + '](' + href + ')';
    }
  );

  // ③ リソース画像: <img src=":/hex" ...> → ![alt](:/hex)
  //    または:     <img src="file:///...resources/HEXID.ext..." ...> → ![alt](:/HEXID)
  //    TinyMCEがWYSIWYG表示時に:/idをローカルfile://パスに展開してしまうケースに対応
  fixed = fixed.replace(/<img[^>]*>/gi, function(imgTag: string) {
    const altMatch = imgTag.match(/alt="([^"]*)"/i);
    const alt = altMatch ? altMatch[1] : '';
    // :/hex 形式（正規）
    const srcJoplin = imgTag.match(/src="(:\/[a-f0-9]+)"/i);
    if (srcJoplin) return '![' + alt + '](' + srcJoplin[1] + ')';
    // file:///...resources/HEXID.ext 形式（TinyMCEがローカルパスに展開したもの）
    const srcFile = imgTag.match(/src="file:\/\/\/[^"]*\/resources\/([a-f0-9]+)\.[^"?]*(?:\?[^"]*)?"?/i);
    if (srcFile) return '![' + alt + '](:/'+srcFile[1]+')';
    return imgTag;
  });

  // ④ 改行で分断されたMarkdownリンク/画像を結合（旧バージョンのDB保存済み破損データ対応）
  // [text]\n(:/id) → [text](:/id)  /  ![alt]\n(:/id) → ![alt](:/id)
  fixed = fixed.replace(/(\])\n(\(:\/[a-f0-9]+\))/g, '$1$2');
  // [text]\n(file:///...resources/HEXID.ext) → ![alt](:/HEXID)
  fixed = fixed.replace(
    /(!?\[[^\]\n]*\])\n\(file:\/\/\/[^)\n]*\/resources\/([a-f0-9]+)\.[^)?)\n]*(?:\?[^)\n]*)?\)/g,
    function(_: string, bracket: string, hexId: string) {
      return bracket + '(:/' + hexId + ')';
    }
  );
  // \▲[CN=4853_repairMupSpan.LINKS]

  // \▼[CN=5492_repairMupSpan.BADGE_TICK] // バックティック囲みバッジを平文化
  // TinyMCEが<code class="mup-status">を`[⊕N+M]`にシリアライズした後の逆変換
  fixed = fixed.replace(/`(\[(?:⊕|⊖|⊘)[^\]]*\])`/g, '$1');
  // 🛒インジケーター（空膜マーク）のバックティック包みを完全除去
  // TinyMCEが<code class="mup-status-cart">を``化した残骸。ノート本文に保存不要なため削除。
  // 例: `[🛒]` / `⇄[🛒]` / `⇒[🛒]` / `⇄⇒[🛒]`
  fixed = fixed.replace(/`\s*[⇄⇒]*\[🛒\]\s*`/g, '');
  // リンクアイコンのバックティック包みも除去（<span class="mup-link-ico">の残骸）
  // 例: `⇄` / `⇒` / `⇄⇒`
  fixed = fixed.replace(/`\s*([⇄⇒]+)\s*`/g, '');
  // \▲[CN=5492_repairMupSpan.BADGE_TICK]

  // \▼[CN=7384_repairMupSpan.SPAN2MUP] // span形式→markMup記法に変換
  // v2.3: 閉じ膜(\▲[CN=xxx])をナビゲーターとして使い、対応する壊れた開き膜を検出・修復。
  // 戦略: ①閉じ膜のCNキー収集 → ②開き膜の欠損検出 → ③<span>▼</span>行を修復
  // 旧SPAN2MUP(span構造パース)は残すが、新方式を先行実行することで大半をカバー。
  //
  // --- 新方式: 閉じ膜ナビゲーター ---
  {
    // ① 壊れていない閉じ膜のCNキーを収集（例: "CN=5500_new", "H1=見出し"）
    const _closingKeys: string[] = [];
    fixed.replace(/(?:[▲◀]m|M[▲◀])\[((?:CN|H[1-3])=[^\]]+)\]/g, (_: string, key: string) => {
      _closingKeys.push(key); return '';
    });
    // ② 壊れていない開き膜のCNキーを収集
    const _openingKeys = new Set<string>();
    fixed.replace(/(?:[▼▶]m|M[▼▶])\[((?:CN|H[1-3])=[^\]]+)\]/g, (_: string, key: string) => {
      _openingKeys.add(key); return '';
    });
    // ③ 開き膜が欠損しているCNについて、破損行（<span>▼</span>で始まる行）を修復
    for (const _key of _closingKeys) {
      if (_openingKeys.has(_key)) continue; // 対応する開き膜あり → スキップ
      const _cn = _key.split('=').slice(1).join('='); // "CN=5500_new" → "5500_new"
      fixed = fixed.replace(
        /^<span[^>]*>[▼▶]<\/span>[^\n]*$/gm,
        (line: string) => {
          if (!line.includes(_cn)) return line; // CN値を含まない行はスキップ
          const _openArrow = line.match(/[▼▶]/)?.[0] || '▼';
          const _cm = line.match(/\*\s*(\/\/[^*\n]*?)\s*\*/);
          const _bm = line.match(/(\[(?:⊕|⊖|⊘)[^\]\n]*\])/);
          return '$' + _openArrow + 'm[' + _key + ']$'
               + (_cm ? ' ' + _cm[1].trim() : '')
               + (_bm ? ' ' + _bm[1]        : '');
        }
      );
    }
  }
  // --- 旧方式: spanクラスパース（H1=型など、閉じ膜が既に正常な場合にも対応） ---
  function _extractPfxCn(cnParts: string): { pfx: string; cn: string } {
    const pfxMatch = cnParts.match(/class="[^"]*mup-pfx-([^"\s]+)/);
    const pfx = pfxMatch ? pfxMatch[1] : 'CN';
    const rawCn = cnParts.replace(/<[^>]+>/g, '');
    const cn = pfx === 'CN' ? rawCn.replace(/\s+/g, '') : rawCn.trim();
    return { pfx, cn };
  }
  fixed = fixed.replace(
    /<span[^>]*>(▼|▶)<\/span>[ \t]*((?:<span[^>]*>[^<>]*<\/span>[ \t]*)+)([ \t]*\*\s*\/\/([^*<]*?)\s*\*)?(?:[ \t]*<span[^>]*>(.*?)<\/span>)?/g,
    function(_, arrow, cnParts, _c, comment, badge) {
      const { pfx, cn } = _extractPfxCn(cnParts);
      const c = comment ? ' // ' + comment.trim() : '';
      const b = badge   ? ' ' + badge.replace(/\\([\[\]])/g, '$1') : '';
      return '$' + arrow + 'm[' + pfx + '=' + cn + ']$' + c + b;
    }
  );
  // 閉じ膜(▲直書き): ▲ <span class="mup-pfx-*">cn</span>+ [*// comment*]
  fixed = fixed.replace(
    /(▲|◀)[ \t]*((?:<span[^>]*>[^<>]*<\/span>[ \t]*)+)([ \t]*\*[^*\n]*\*)?/g,
    function(_, arrow, cnParts) {
      const { pfx, cn } = _extractPfxCn(cnParts);
      return '$' + arrow + 'm[' + pfx + '=' + cn + ']$';
    }
  );
  // 閉じ膜(span内): <span>▲</span> <span class="mup-pfx-*">cn</span>+
  fixed = fixed.replace(
    /<span[^>]*>(▲|◀)<\/span>[ \t]*((?:<span[^>]*>[^<>]*<\/span>[ \t]*)+)([ \t]*\*[^*\n]*\*)?/g,
    function(_, arrow, cnParts) {
      const { pfx, cn } = _extractPfxCn(cnParts);
      return '$' + arrow + 'm[' + pfx + '=' + cn + ']$';
    }
  );
  // 閉じ膜の直後に続くテキストを次行へ移動（TinyMCEが膜フッター内に追記した場合の対応）
  // 例: \▲[CN=xxx]ううう → \▲[CN=xxx]\nううう
  fixed = fixed.replace(/(M[▲◀]\[[^\]\n]+\])([ \t]*)(\S)/g, '$1\n$3');
  // \▼[CN=4481_repairMupSpan.ITALIC_COMMENT] // *// comment* の italic マーカー除去
  // TinyMCEが<em>// comment</em>を * // comment * にシリアライズした残骸を除去する
  // CN=7384(SPAN2MUP)のregexがcommentをキャプチャし損ねた場合に膜の行末に残る
  fixed = fixed.replace(/(M[▼▶]\[[^\]\n]+\])[ \t]+\*[ \t]*(\/\/[^*\n]*?)[ \t]*\*/g, '$1 $2');
  // \▲[CN=4481_repairMupSpan.ITALIC_COMMENT]

  // \▼[CN=6291_repairMupSpan.NAME_SYNC] // WYSIWYG編集後の開閉膜名不一致修正
  // WYSIWYGモードではmupEditor.js（CM6プラグイン）が動作しないため、
  // 開始膜の名前を変更しても閉じ膜が連動しない。
  // 孤立膜方式（v2.1）: 完全一致(pfx+cn)するペアを消費し、残った孤立開始膜と
  // 孤立閉じ膜を順番にマッチさせて名前を同期する。
  // これにより同名入れ子膜（例: new1内にnew1）で内側膜が誤更新される旧バグを修正。
  {
    const RE_NS_O = /^[ \t]*\$?(?:▼|▶)m\[(CN|H[1-3])=([^\]]+)\]\$?/;
    const RE_NS_C = /^[ \t]*\$?(?:▲|◀)m\[(CN|H[1-3])=([^\]]+)\]\$?/;
    const nsLines = fixed.split('\n');
    // すべての開始膜・閉じ膜を行番号付きで収集
    type NsEntry = {lineIdx: number; pfx: string; cn: string; consumed: boolean};
    const openStack: NsEntry[] = [];
    const closeList: NsEntry[] = [];
    for (let i = 0; i < nsLines.length; i++) {
      const om = RE_NS_O.exec(nsLines[i]);
      const cm = RE_NS_C.exec(nsLines[i]);
      if (om) openStack.push({lineIdx: i, pfx: om[1], cn: om[2].trim(), consumed: false});
      else if (cm) closeList.push({lineIdx: i, pfx: cm[1], cn: cm[2].trim(), consumed: false});
    }
    // 完全一致(pfx+cn)するペアを消費（逆順スタックで正しいネスト順に処理）
    for (const cl of closeList) {
      for (let k = openStack.length - 1; k >= 0; k--) {
        const op = openStack[k];
        if (!op.consumed && op.pfx === cl.pfx && op.cn === cl.cn && op.lineIdx < cl.lineIdx) {
          op.consumed = true;
          cl.consumed = true;
          break;
        }
      }
    }
    // 孤立開始膜と孤立閉じ膜を抽出してペアリング（ドキュメント順）
    const orphanOpenings = openStack.filter(o => !o.consumed);
    const orphanClosings = closeList.filter(c => !c.consumed);
    const usedCloseIdx = new Set<number>();
    for (const op of orphanOpenings) {
      for (const cl of orphanClosings) {
        if (usedCloseIdx.has(cl.lineIdx)) continue;
        if (cl.pfx !== op.pfx || cl.lineIdx <= op.lineIdx) continue;
        usedCloseIdx.add(cl.lineIdx);
        // 開始膜名を正として閉じ膜を更新
        if (op.cn !== cl.cn) {
          const oldBracket = '[' + cl.pfx + '=' + cl.cn + ']';
          const newBracket = '[' + op.pfx + '=' + op.cn + ']';
          nsLines[cl.lineIdx] = nsLines[cl.lineIdx].replace(oldBracket, () => newBracket);
        }
        break;
      }
    }
    fixed = nsLines.join('\n');
  }
  // \▲[CN=6291_repairMupSpan.NAME_SYNC]

  // \▼[CN=4729_repairMupSpan.AUTO_CN] // CN番号自動付加（4桁プレフィックスなし → 現在時刻の分秒4桁を自動追加）
  // 同一CN値の開閉膜ペアには同じ番号を割り当てる（折畳み対応を壊さない）
  // 分秒形式 (例: 4720 = 47分20秒): 連続採番でも衝突しにくく、後から見ても時刻として判読可能
  {
    const _now = new Date();
    const _mm = String(_now.getMinutes()).padStart(2, '0');
    const _ss = String(_now.getSeconds()).padStart(2, '0');
    const _timeId = _mm + _ss; // 例: "4720"
    const cnMap: Map<string, string> = new Map();
    fixed.replace(/M[▼▶▲◀]\[CN=([^\]]*)\]/g, (_, cn: string) => {
      if (!/^\d{4}/.test(cn) && !cnMap.has(cn)) {
        cnMap.set(cn, cn ? _timeId + '_' + cn : _timeId);
      }
      return '';
    });
    if (cnMap.size > 0) {
      fixed = fixed.replace(/M([▼▶▲◀])\[CN=([^\]]*)\]/g, (_: string, arrow: string, cn: string) => {
        if (/^\d{4}/.test(cn)) return 'M' + arrow + '[CN=' + cn + ']';
        const newCn = cnMap.get(cn);
        return 'M' + arrow + '[CN=' + (newCn ?? cn) + ']';
      });
    }
  }
  // \▲[CN=4729_repairMupSpan.AUTO_CN]

  // \▼[CN=8153_repairMupSpan.AUTO_STATUS] // 開き膜にステータスバッジがなければ自動付加
  // ▼→[⊕0+0](デフォルト展開) / ▶→[⊖0+0](デフォルト折畳み)
  // バッジなしではmup-status要素が生成されず、クリックしても開閉状態が永続しないため必須。
  fixed = fixed.replace(
    /^(M([▼▶])\[(?:CN|H[1-3])=[^\]]*\][^\n]*)$/gm,
    function(_: string, line: string, sym: string) {
      if (/\[(?:⊕|⊖|⊘)/.test(line)) return line; // 既にバッジあり
      const trimmed = line.trimEnd();
      const badge = ' [' + (sym === '▼' ? '⊕' : '⊖') + '0+0]';
      return /\/\//.test(trimmed) ? trimmed + badge : trimmed + ' //' + badge;
    }
  );
  // \▲[CN=8153_repairMupSpan.AUTO_STATUS]

  // \▼[CN=3094_repairMupSpan.CODEFENCE_UNWRAP] // 膜・しおりを囲むバリア行を除去
  // TinyMCEはWYSIWYGペースト時の<pre class="language-"><code>ブロックを
  // ``` (または ```language-) コードフェンスとしてシリアライズする。
  // これが膜記法の前後にバリアとして残り続けるため除去する。
  // ① \` 単独行を削除（TinyMCEが<p>```</p>を\`にシリアライズした場合）
  fixed = fixed.replace(/^\\`+[ \t]*$/gm, '');
  // ② ``` ブロック（言語タグ含む）が膜を囲む場合は膜を解放（コードフェンスを除去）
  // [^\n]* で ```language- のような言語指定にも対応
  // 抽出と同時にinner内の余剰バックスラッシュも除去（CN=1920の保護をすり抜けるケースを防ぐ）
  fixed = fixed.replace(
    /^```[^\n]*\r?\n([\s\S]*?)\r?\n[ \t]*```[ \t]*$/gm,
    function(match: string, inner: string) {
      if (/(?:[▼▶▲◀]m|M[▼▶▲◀])\[(?:CN|H[1-3])=|(?:🔖m|M🔖)\[/.test(inner)) {
        // 膜記法を含む → コードフェンスのみ除去
        return inner;
      }
      return match;
    }
  );
  // ③ 孤立した``` 行が膜の直前・直後にある場合も削除（ペア不成立の残骸）
  fixed = fixed.replace(/^```[^\n]*\r?\n([ \t]*(?:[▼▶▲◀]m|M[▼▶▲◀]))/gm, '$1');   // ```\n▼m → ▼m
  fixed = fixed.replace(/((?:[▲◀]m|M[▲◀])\[[^\]\n]+\])\r?\n```[ \t]*$/gm, '$1'); // ▲m\n``` → ▲m
  // \▲[CN=3094_repairMupSpan.CODEFENCE_UNWRAP]

  // \▼[CN=1920_repairMupSpan.BACKSLASH] // バックスラッシュ増殖修復（Joplinの悪名高きバグ対策）
  // コードブロック・LaTeX数式を一時保護して⑤⑥の影響から除外
  // 保護対象: ```...```（コードフェンス）/ `...`（インラインコード）
  //           $$...$$（LaTeXブロック数式）/ $...$（LaTeXインライン数式）
  // 理由: ⑥の全削除が$\frac{a}{b}$等のLaTeX数式内\fracバックスラッシュを削除するため
  const _bsSlots: string[] = [];
  fixed = fixed.replace(/```[\s\S]*?```|`[^`\n]+`|\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g, (m: string) => {
    _bsSlots.push(m);
    return '\x00BS' + (_bsSlots.length - 1) + '\x00';
  });
  // ⑤ バックティック前のバックスラッシュ除去: \` → `（コードフェンス残骸）
  fixed = fixed.replace(/\\`/g, '`');
  // ⑥ M記法以外の不要バックスラッシュを削除（LaTeX数式はスロット保護済み）
  //    M記法にバックスラッシュなし → TinyMCE増殖残骸のみ対象
  fixed = fixed.replace(/\\/g, '');
  // コードブロック・数式スロットを復元
  fixed = fixed.replace(/\x00BS(\d+)\x00/g, (_: string, i: string) => _bsSlots[Number(i)]);
  // \▲[CN=1920_repairMupSpan.BACKSLASH]

  // \▼[CN=6537_repairMupSpan.NBSP] // &nbsp;無限増殖修復
  fixed = fixed.replace(/<p>\s*&nbsp;\s*<\/p>/g, '<p></p>');
  fixed = fixed.replace(/(<p><\/p>\s*){3,}/g, '<p></p>\n<p></p>');
  // 単独行&nbsp;は削除せずスペースに変換（罫線間の空行として機能するため保持）
  fixed = fixed.replace(/&nbsp;/g, ' ');                 // &nbsp;→スペース（全箇所）
  // \▲[CN=6537_repairMupSpan.NBSP]

  // \▼[CN=3819_repairMupSpan.HR] // * * * 前後の空行を保証（Markdown HR正規化）
  // * * * はMarkdown正規HRで、markdown-itが実<hr>要素としてWYSIWYGに描画する。
  // <hr>/<&lt;hr&gt;テキストも* * *に戻して統一（旧ノートの残留テキスト対応）。
  // TinyMCEのシリアライズで前後の空行が消えるため、毎回補完する。
  fixed = fixed.replace(/^<hr>$/gm, '* * *');       // <hr>テキスト → * * * に正規化
  fixed = fixed.replace(/^&lt;hr&gt;$/gm, '* * *'); // HTML実体 → * * *
  // TinyMCEが</div>* * *<div>のように改行なしで連結した場合に改行を補完
  fixed = fixed.replace(/([^\n])(\* \* \*)/g, '$1\n$2');       // * * * の直前に改行挿入
  fixed = fixed.replace(/(\* \* \*)([^\n])/g, '$1\n$2');       // * * * の直後に改行挿入
  fixed = fixed.replace(/([^\n])\n(\* \* \*)/g, '$1\n\n$2');  // * * * の前に空行を保証
  fixed = fixed.replace(/(\* \* \*)\n([^\n])/g, '$1\n\n$2');  // * * * の後に空行を保証
  // \▲[CN=3819_repairMupSpan.HR]

  // \▼[CN=8052_repairMupSpan.LATEX] // コード囲み→LaTeX復旧（TinyMCEによる数式変換の逆）
  // パターン①②: シングルバックティック → TinyMCEが$...$をインラインコードに変換
  fixed = fixed.replace(/`(\$\$[\s\S]+?\$\$)`/g, '$1'); // ① $$...$$ ブロック数式
  fixed = fixed.replace(/`(\$(?!\$)[^`\n]+?\$)`/g, '$1'); // ② $...$ インライン数式
  // パターン③④: トリプルフェンス → TinyMCEが\\\でコードブロック化→CN=1920で```変換後の残骸
  // 例: ```\n$\frac{a}{b}$\n``` → $\frac{a}{b}$
  fixed = fixed.replace(/^```\r?\n(\$(?!\$)[^\n]+\$)\r?\n```$/gm, '$1'); // ③ $...$ 単行
  fixed = fixed.replace(/^```\r?\n(\$\$[\s\S]*?\$\$)\r?\n```$/gm, '$1'); // ④ $$...$$ 複数行
  // \▲[CN=8052_repairMupSpan.LATEX]

  // \▼[CN=4392_repairMupSpan.CODEFENCE] // 連続コードフェンス統合
  // ```フェンスは膜・栞の選択境界として有用なので保持する。
  // 膜や栞を2つ連続ペーストすると```\n```が生じるため、これだけ1つに統合する。
  fixed = fixed.replace(/^```[ \t]*\n[ \t]*```$/gm, '```');
  // \▲[CN=4392_repairMupSpan.CODEFENCE]

  return fixed;
}
// \▲[CN=9043_repairMupSpan]

// \▼[CN=1473_plugin] // プラグイン本体
joplin.plugins.register({
  onStart: async function() {

    // \▼[CN=6924_renderer] // markMupレンダラー登録
    await joplin.contentScripts.register(
      ContentScriptType.MarkdownItPlugin,
      'markMupRenderer',
      './markdownItRenderer.js',
    );
    // \▲[CN=6924_renderer]

    // \▼[CN=3518_editorScript] // CodeMirrorプラグイン登録（左ペイン同期用）
    await joplin.contentScripts.register(
      ContentScriptType.CodeMirrorPlugin,
      'markMupEditor',
      './mupEditor.js',
    );
    // \▲[CN=3518_editorScript]

    // \▼[CN=7201_modeCheck] // mupCheckMode応答受信→isMarkdown判定プロミス解決（v7.26動作実績）
    // ⇒ Me ⇒ {2847_isMarkdownMode}
    // mupEditor.js(CodeMirror)がwebviewApi.postMessageで応答→Markdownモード確定
    // WYSIWYGでは応答なし→300msタイムアウト→WYSIWYGモード確定
    let _modeCheckResolve: ((v: boolean) => void) | null = null;
    // \▼[CN=4721_scrollTarget] // Markdown→WYSIWYG切替時のCNアンカー（スクロール復元用）
    let _pendingScrollCN: string | null = null;
    // \▲[CN=4721_scrollTarget]
    await joplin.contentScripts.onMessage('markMupEditor', async (msg: any) => {
      if (msg?.type === 'mupCheckMode' && _modeCheckResolve) {
        const resolve = _modeCheckResolve;
        _modeCheckResolve = null;
        resolve(true);
      }
    });
    // \▲[CN=7201_modeCheck]

    // \▼[CN=4896_onMessage] // contentScriptからのメッセージ受信（mupToggle / mupToggleEditor）
    // ⇒ Me ⇒ {5139_onMessage.TOGGLE_EDITOR, 8347_onMessage.PROBE, 2091_onMessage.REGEX, 5763_onMessage.PUT, 9412_onMessage.EDITOR}
    await joplin.contentScripts.onMessage('markMupRenderer', async (msg: any) => {
      if (!msg) return;

      // \▼[CN=5139_onMessage.TOGGLE_EDITOR] // 🔖しおりボタン: エディタ切替＋自動復旧
      // {4896_onMessage, 4471_mupInsertBookmark.EXEC} ⇒ Me ⇒ {9043_repairMupSpan, 2847_isMarkdownMode}
      if (msg.type === 'mupToggleEditor') {
        // \▼[CN=6302_onMessage.TOGGLE_EDITOR.REPAIR] // WYSIWYG→Markdown時: 全破壊を自動復旧
        const wasWYSIWYG = !(await isMarkdownMode());
        // CN=4721: 両方向でアンカーCNを保存（v0.9.56〜）
        // Markdown→WYSIWYG: WYSIWYG mupFold.js が起動後に mupGetScrollTarget で照会
        // WYSIWYG→Markdown: Markdownプレビュー mupFold.js がDOM更新後に照会
        if (msg.cn) _pendingScrollCN = msg.cn;
        await joplin.commands.execute('toggleEditors');
        if (wasWYSIWYG) {
          // ① Markdownモードに切り替わるまで待つ
          for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 100));
            if (await isMarkdownMode()) break;
          }
          // ② TinyMCE→Markdown変換がDBに届くまでポーリング
          // isMarkdownMode()=true の時点ではDB書き込みが未完了な場合がある
          let note = await joplin.workspace.selectedNote();
          for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 200));
            note = await joplin.workspace.selectedNote();
            if (note && (
              note.body.includes('<span') ||
              /^\\{3}$/m.test(note.body) ||
              /^🔖 .+$/m.test(note.body)
            )) break;
          }
          if (note) {
            // ③ しおりプレーンテキスト復旧: "🔖 label" → "\🔖[label]"
            let repaired = note.body.replace(/^🔖 (.+)$/gm, '$🔖m[$1]$');
            // ④ span破壊・バックスラッシュ増殖・\\\を repairMupSpan で一括修復
            repaired = repairMupSpan(repaired);
            if (repaired !== note.body) {
              await joplin.data.put(['notes', note.id], null, { body: repaired });
            }
          }
          // \▼[CN=4722_editorScroll] // CodeMirrorカーソルを対象CN行に移動
          // JoplinのSync Scroll（左右同期）がズレているとプレビューが誤った位置に引きずられる。
          // mupScrollToCnコマンドでCodeMirrorを正しい行に移動→Sync Scrollのズレを根絶。
          if (msg.cn) {
            await new Promise(r => setTimeout(r, 200));
            try {
              await joplin.commands.execute('editor.execCommand', {
                name: 'mupScrollToCn', value: msg.cn,
              });
            } catch(_e) { /* CodeMirror未初期化の場合は無視 */ }
          }
          // \▲[CN=4722_editorScroll]
        }
        // \▲[CN=6302_onMessage.TOGGLE_EDITOR.REPAIR]
        return;
      }
      // \▲[CN=5139_onMessage.TOGGLE_EDITOR]

      // \▼[CN=4721_onMessage.SCROLL_TARGET] // WYSIWYG起動時: アンカーCNを返して消費
      if (msg.type === 'mupGetScrollTarget') {
        const cn = _pendingScrollCN;
        _pendingScrollCN = null;
        return { cn };
      }
      // \▲[CN=4721_onMessage.SCROLL_TARGET]

      if (msg.type !== 'mupToggle') return;

      // \▼[CN=3901_onMessage.ANTISPOOFING] // 成済まし防止: メッセージ受信時点のノートIDを保存
      // 300msプローブ中にユーザーがノートを切り替えると selectedNote() が別ノートを返す → 成済まし発生。
      // 解決: プローブ開始前にノートIDを取得し、以降の各処理で照合する。
      const _antiSpoofNote = await joplin.workspace.selectedNote();
      const _antiSpoofId = _antiSpoofNote?.id;
      if (!_antiSpoofId) return;
      // \▲[CN=3901_onMessage.ANTISPOOFING]

      // \▼[CN=8347_onMessage.PROBE] // mupCheckModeでMarkdown/WYSIWYGモード判定
      // CodeMirrorならpostMessage応答→true / WYSIWYGなら300ms後タイムアウト→false
      const isMarkdown = await new Promise<boolean>(resolve => {
        const timer = setTimeout(() => {
          _modeCheckResolve = null;
          resolve(false);
        }, 300);
        _modeCheckResolve = (v: boolean) => { clearTimeout(timer); resolve(v); };
        joplin.commands.execute('editor.execCommand', { name: 'mupCheckMode' }).catch(() => {});
      });
      // \▲[CN=8347_onMessage.PROBE]

      // \▼[CN=2091_onMessage.REGEX] // 開始膜行のバッジを置換（v2.0: pfx対応・旧形式\▼・新形式`$\▼両対応）
      const note = await joplin.workspace.selectedNote();
      if (!note) return;
      // 成済まし防止: プローブ中にノート切替が起きていないか確認
      if (note.id !== _antiSpoofId) return;
      const mupPfx = String(msg.pfx || 'CN'); // v2.0: CN/H1/H2/H3
      const rawCn = String(msg.cn);
      const escapedCn = rawCn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // 固有値（4桁プレフィックス）がないCN値は、repairMupSpanが先行してプレフィックスを付加済みの
      // 場合にも対応するため (?:\d{4}_)? をオプション前置する（レースコンディション対策）
      const cnPattern = /^\d{4}/.test(rawCn) ? escapedCn : '(?:\\d{4}_)?' + escapedCn;
      const lineRe = new RegExp(
        '((?:[▼▶]m|M[▼▶]|[▼▶]_M)\\[' + mupPfx + '=' + cnPattern + '\\][^\\n]*)(?:\\[(⊕|⊖|⊘)(?:∞|♾️|\\d+)(?:\\+\\d+)?\\]|\\[∞\\]|\\[♾️\\]|\\[\\d+\\])([^\\n]*)',
        'mg'
      );
      const badge = msg.count === '∞'
        ? '[' + msg.state + '∞]'
        : '[' + msg.state + msg.count + '+' + msg.exp + ']';
      // 同名膜が複数あるとき occurrenceIndex 番目のマッチのみ更新
      const occIdx = typeof msg.occurrenceIndex === 'number' ? msg.occurrenceIndex : 0;
      let matchCount = 0;
      const newBody = note.body.replace(lineRe, (match, g1, _g2, g3) => {
        const result = (matchCount === occIdx) ? g1 + badge + (g3 || '') : match;
        matchCount++;
        return result;
      });
      // \▲[CN=2091_onMessage.REGEX]

      // \▼[CN=5763_onMessage.PUT] // DBへ書き戻し（WYSIWYGフォールバック兼用）
      if (newBody !== note.body) {
        // 成済まし防止: 書き込み直前にも再確認
        const _finalCheck = await joplin.workspace.selectedNote();
        if (_finalCheck?.id !== _antiSpoofId) return;
        await joplin.data.put(['notes', note.id], null, { body: newBody });
      }
      // \▲[CN=5763_onMessage.PUT]

      // \▼[CN=9412_onMessage.EDITOR] // CM6エディタ左ペインを同期（Markdownモードのみ）
      // WYSIWYGで呼ぶとTinyMCEがstateキャラクタ(⊕/⊖)をドキュメントに挿入するため禁止
      if (isMarkdown) {
        try {
          await joplin.commands.execute('editor.execCommand', {
            name: 'mupUpdateBadge',
            args: [msg.cn, msg.state, msg.count, msg.exp, msg.pfx || 'CN'], // v2.0: pfx追加
          });
        } catch (_e) { /* エディタ非アクティブ時は無視 */ }
      }
      // \▲[CN=9412_onMessage.EDITOR]
    });
    // \▲[CN=4896_onMessage]

    // \▼[CN=6174_hasDmg] // ノートbodyの破損パターン検出（共有ユーティリティ）
    // {7538_modeWatcher.AUTOREPAIR, 3417_noteSelectWatcher} ⇒ Me
    // WYSIWYG由来のHTML破損 + 旧バージョンDB保存済み破損の両方を検出する
    const _hasDmg = (b: string): boolean =>
      b.includes('&lt;span') ||                          // エンティティ化span（TinyMCE二重エスケープ）
      b.includes('&lt;div') ||                           // エンティティ化div（TinyMCE二重エスケープ）
      b.includes('data-mup="bookmark"') ||               // 栞HTML形式（Markdownモードで\🔖記法に変換が必要）
      b.includes('<span') ||                              // mup-span残存（WYSIWYG直後）
      /^\\`+[ \t]*$/m.test(b) ||                         // \` バリア残骸（TinyMCEが<p>```</p>→\`にシリアライズ）
      /^```[^\n]*\n[ \t]*(?:[▼▶▲◀]m|M[▼▶▲◀])\[/.test(b) || // ```直後が膜行（WYSIWYGペースト由来バリア）
      /^\\{3}$/m.test(b) ||                              // \\\ （バックスラッシュ3連）
      /^🔖 .+$/m.test(b) ||                              // 栞タグ未修復
      /\\{2}/.test(b) ||                                 // 二重バックスラッシュ（膜外テキストへの増殖を含む）
      /(?:[▲◀]m|M[▲◀])\[[^\]\n]+\]\S/.test(b) ||         // 閉じ膜直後にテキスト
      /^\* \* \*\n\* \* \*$/m.test(b) ||                // 隣接HR（空行なし）
      /\]\n\(:\/[a-f0-9]/.test(b) ||                    // ]\n(:/id) 分断リンク（旧バージョン破損）
      /\]\n\(file:\/\/\//.test(b) ||                    // ]\n(file:///) 分断画像（旧バージョン破損）
      /file:\/\/\/[^)]*\/resources\/[a-f0-9]/.test(b) || // file:///パス残存（旧バージョン破損）
      b.includes('joplin-table-wrapper') ||               // HTMLテーブル残存（旧バージョン破損）
      /`[⇄⇒]*\[🛒\]`/.test(b);                          // 🛒インジケーターbacktick残骸（v0.9.28-31破損ノート）
    // \▲[CN=6174_hasDmg]

    // \▼[CN=2847_isMarkdownMode] // エディタモード判定ユーティリティ
    // {5139_onMessage.TOGGLE_EDITOR, 7538_modeWatcher.AUTOREPAIR, 7125_insertTemplate.MODECHECK, 7201_modeCheck} ⇒ Me
    /** editor.codeView設定値でMarkdownモードか判定。true=Markdown / false=WYSIWYG */
    async function isMarkdownMode(): Promise<boolean> {
      try {
        return !!(await joplin.settings.globalValue('editor.codeView'));
      } catch(e) { return false; }
    }
    // \▲[CN=2847_isMarkdownMode]

    // \▼[CN=7538_modeWatcher.AUTOREPAIR] // モード変化監視: 双方向遷移検出→自動修復
    // ⇒ Me ⇒ {9043_repairMupSpan, 2847_isMarkdownMode, 6174_hasDmg}
    // editor.codeViewを5000msごとに監視し、モード遷移に応じた修復を実行する。
    // Cmd+S保存時(onNoteChange)にも同じ処理を実行。
    // false→true (WYSIWYG→Markdown): span修復
    // true→false (Markdown→WYSIWYG): HR自動変換
    // WYSIWYG内ノート切替 (CN=9031): 切替先ノートにspanあり → toggleEditors往復修復
    let _autoRepairPrev = await isMarkdownMode();
    let _isAutoRepairing = false;
    const _initNoteForMW = await joplin.workspace.selectedNote();
    let _autoRepairPrevNoteId: string | null = _initNoteForMW?.id ?? null;
    // CN=9031用: ノートを初めて開いたときの updated_time を保持（編集検出に使用）
    const _noteLastSeenTime = new Map<string, number>();
    const _runModeCheck = async () => {
      if (_isAutoRepairing) return;
      const nowMarkdown = await isMarkdownMode();
      const note = await joplin.workspace.selectedNote();
      const nowNoteId = note?.id ?? null;
      const switchedToMarkdown = !_autoRepairPrev && nowMarkdown; // false→true = WYSIWYG→Markdown
      const switchedToWYSIWYG = _autoRepairPrev && !nowMarkdown;  // true→false = Markdown→WYSIWYG
      // \▼[CN=9031_modeWatcher.NOTE_SWITCH] // WYSIWYG内ノート切替検出
      // onNoteSelectionChangeのレースコンディション（DB書込み前に発火）に対するフォールバック。
      // modeWatcherは500ms後に発火するため、その時点でspanが残っていれば確実に修復する。
      const noteChangedInWYSIWYG = !nowMarkdown && _autoRepairPrevNoteId !== null && nowNoteId !== _autoRepairPrevNoteId;
      // \▲[CN=9031_modeWatcher.NOTE_SWITCH]
      _autoRepairPrev = nowMarkdown;
      _autoRepairPrevNoteId = nowNoteId;
      if (!switchedToMarkdown && !switchedToWYSIWYG && !noteChangedInWYSIWYG) return;

      if (switchedToMarkdown) {
        // WYSIWYG→Markdown切替を検出 → CN=6302と同じ修復ロジック
        // 事前フェッチ済みnoteにすでに破壊パターンあり → 即修復（v7.68相当）
        // なければポーリング（TinyMCEのシリアライズDB書込み待ち）
        // _hasDmg は CN=6174 で共有定義（split link / file:/// / table も検出）
        let noteM = note;
        let _foundDmg = noteM?.body ? _hasDmg(noteM.body) : false;
        if (!_foundDmg) {
          for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 200));
            noteM = await joplin.workspace.selectedNote();
            if (noteM?.body && _hasDmg(noteM.body)) { _foundDmg = true; break; }
          }
        }
        // 破損パターン未検出 → クリーンなノートに修復を加えない（副作用防止）
        if (!_foundDmg || !noteM) return;

        _isAutoRepairing = true;
        try {
          let repaired = noteM.body.replace(/^🔖 (.+)$/gm, '$🔖m[$1]$');
          repaired = repairMupSpan(repaired);
          if (repaired !== noteM.body) {
            // 成済まし防止: data.put前に選択ノートが変わっていないか確認
            const _checkNote = await joplin.workspace.selectedNote();
            if (_checkNote?.id !== noteM.id) return;
            await joplin.data.put(['notes', noteM.id], null, { body: repaired });
            // CodeMirrorエディタ（左ペイン）とプレビュー（右ペイン）を即時更新
            // DB保存だけではCodeMirrorは更新されないため、editor.setTextで強制リフレッシュ
            try { await joplin.commands.execute('editor.setText', repaired); } catch (_e) { /* 無視 */ }
          }
        } finally {
          _autoRepairPrev = true; // 修復後の再トリガー防止（Markdownモード確定）
          await new Promise(r => setTimeout(r, 500));
          _isAutoRepairing = false;
        }
      }

      // [CN=3291 廃止 v0.9.55] mceAddStyleSheetをここで実行するとTinyMCEがフォーカスを取り
      // カーソルが先頭に移動→スクロールが先頭に戻るバグの根本原因だった。
      // bookmarkCSSはmupFold.jsのWYSIWYG _stブロックに移動し、mceAddStyleSheet不要になった。

      // \▼[CN=9031_modeWatcher.NOTE_SWITCH.REPAIR] // WYSIWYG内ノート切替: updated_time変化時のみ再描画
      // v7.99で無効化していたが v8.17で復活（updated_time比較方式）。
      // 理由: WYSIWYGで編集後ノート切替→戻ると、データは正常($▼m[...]$, KaTeX保護で破壊なし)なのに
      //       TinyMCEが正しく再描画しないJoplinバグの回避策。
      // 方式: ノートを最初に開いたときのupdated_timeを_noteLastSeenTimeに保存。
      //       返ってきたとき(noteChangedInWYSIWYG)に現在のupdated_timeと比較。
      //       変わっていれば編集があったと判断→editor.setTextで再描画。変わっていなければスキップ。
      if (noteChangedInWYSIWYG && nowNoteId) {
        const _savedTime = _noteLastSeenTime.get(nowNoteId);
        if (_savedTime !== undefined) {
          try {
            const _curNote = await joplin.data.get(['notes', nowNoteId], { fields: ['id', 'body', 'updated_time'] });
            if (_curNote?.updated_time && _curNote.updated_time !== _savedTime) {
              // updated_time変化 = 編集あり → 再描画
              const _hasM = _curNote.body && (/(?:[▼▶▲◀]m|M[▼▶▲◀]|[▼▶▲◀]_M)/.test(_curNote.body) || /^🔖 /.test(_curNote.body));
              if (_hasM) {
                await joplin.commands.execute('editor.setText', _curNote.body);
              }
              // 新しいtimestampをベースラインに更新
              _noteLastSeenTime.set(nowNoteId, _curNote.updated_time);
            }
          } catch(_e) {}
        }
      }
      // \▲[CN=9031_modeWatcher.NOTE_SWITCH.REPAIR]

      // \▼[CN=1647_modeWatcher.HR_RESTORE] // [無効化 v7.76] Markdown→WYSIWYG: <hr>テキストを実罫線に自動変換
      // v7.74以降: CN=3819が* * *のまま保持 → markdown-itが<hr>要素として描画 → CN=1647不要
      // mceSetContentはWYSIWYG→Markdown往復で空行を失う副作用があったため廃止。
      // \▲[CN=1647_modeWatcher.HR_RESTORE]
    };
    // 5秒ごとに監視（旧500ms→5000msに緩和）
    setInterval(_runModeCheck, 5000);
    // Cmd+S保存時（onNoteChange）にも即時実行（デバウンス500ms）
    let _saveDebounce: ReturnType<typeof setTimeout> | null = null;
    await joplin.workspace.onNoteChange(async () => {
      if (_isAutoRepairing) return; // 自プラグイン修復中は無視
      if (_saveDebounce) clearTimeout(_saveDebounce);
      _saveDebounce = setTimeout(() => _runModeCheck(), 500);
    });
    // ノート切替時: デバウンスをキャンセル（成済まし防止）
    await joplin.workspace.onNoteSelectionChange(async () => {
      if (_saveDebounce) { clearTimeout(_saveDebounce); _saveDebounce = null; }
    });
    // \▲[CN=7538_modeWatcher.AUTOREPAIR]

    // \▼[CN=3417_noteSelectWatcher] // ノート切替時: 送出ノートをバックグラウンドで自動修復
    // ⇒ Me ⇒ {9043_repairMupSpan, 6174_hasDmg}
    // WYSIWYGモードでノートを切り替えると、TinyMCEが送出ノートをMarkdownにシリアライズしてDB保存する。
    // このシリアライズでspan破壊が発生するため、切替直後に送出ノートをDB修復する（ユーザーに不可視）。
    // ユーザーが新しいノートを閲覧している間に、元のノートが静かに修復される。
    // 受信ノートにspan破壊があれば先行修復（次回このノートに戻ったとき綺麗に表示）。
    {
      let _prevNoteId: string | null = null;
      const _initNote = await joplin.workspace.selectedNote();
      _prevNoteId = _initNote?.id ?? null;

      await joplin.workspace.onNoteSelectionChange(async () => {
        const incoming = await joplin.workspace.selectedNote();
        const incomingId = incoming?.id ?? null;
        const outgoingId = _prevNoteId;
        _prevNoteId = incomingId;

        // CN=9031用: incomingノートを初めて見るときだけupdated_timeを保存（ベースライン）
        // 既にmapにあれば上書きしない（初回開封時の時刻を保持し、編集後の比較に使う）
        if (incomingId && !_noteLastSeenTime.has(incomingId)) {
          joplin.data.get(['notes', incomingId], { fields: ['updated_time'] }).then((n: any) => {
            if (n?.updated_time) _noteLastSeenTime.set(incomingId, n.updated_time);
          }).catch(() => {});
        }

        if (!outgoingId || outgoingId === incomingId) return;
        // CN=9031(toggleEditors往復)と並列実行しない（同時操作でJoplin IPC過負荷防止）
        if (_isAutoRepairing) return;

        // ① 送出ノートをポーリング修復（レースコンディション対策）
        // 問題: onNoteSelectionChangeはJoplinのノート自動保存(TinyMCEシリアライズ)より先に発火する場合がある。
        //       直後にfetchしてもclean版しか取れず「修復不要」と判断 → その後Joplinがbroken版を書き込む。
        // 解決: <span>を検出するまでポーリング。膜なし/タイムアウトなら終了。
        //       v7.92以降のTinyMCEはクリーンなMarkdownを生成するため、通常は1〜2回で完了。
        //       最大5回(1秒)に削減。万一間に合わなかった場合はCN=9031が500ms後にフォールバック修復。
        for (let _i = 0; _i < 5; _i++) {
          await new Promise(r => setTimeout(r, 200));
          try {
            const outNote = await joplin.data.get(['notes', outgoingId], { fields: ['id', 'body'] });
            if (!outNote?.body) break;
            // 破損検出 → 即修復（_hasMemberaneより先にチェック）
            // 理由: WYSIWYGで編集後、TinyMCEが$▼m[CN=xxx]$→<span>▼</span>...<span class="mup-pfx-CN">xxx</span>に
            //       シリアライズすると▼m[パターンが消える → _hasMembrane=falseで早期breakしてしまう根本バグを修正。
            //       _hasDmgが<span>を検出できていれば膜の有無に関わらず修復を試みる。
            if (_hasDmg(outNote.body)) {
              let repaired = outNote.body.replace(/^🔖 (.+)$/gm, '$🔖m[$1]$');
              repaired = repairMupSpan(repaired);
              if (repaired !== outNote.body) {
                await joplin.data.put(['notes', outgoingId], null, { body: repaired });
              }
              break;
            }
            // 破損なし → 膜記法なし → 修復不要・ポーリング不要
            const _hasMembrane = /(?:[▼▶▲◀]m|M[▼▶▲◀]|[▼▶▲◀]_M)/.test(outNote.body) || /^🔖 /.test(outNote.body);
            if (!_hasMembrane) break;
            // 膜あり + 破損パターンなし → まだJoplinの自動保存前かもしれない → ループ継続
          } catch(_e: any) { break; }
        }

        // ② 受信ノートに破損があれば先行修復（次回このノートに戻ったとき綺麗に表示）
        // _hasDmg(CN=6174)で検出: mup-span破壊 + 旧バージョンDB保存済み破損（分断リンク・file:///・HTMLテーブル）
        // _hasMembrane2チェック廃止: spanform破損後は▼m[パターンが消えるため、_hasDmgのみで判定
        if (incoming?.body && _hasDmg(incoming!.body)) {
          try {
            let repaired = incoming.body.replace(/^🔖 (.+)$/gm, '$🔖m[$1]$');
            repaired = repairMupSpan(repaired);
            if (repaired !== incoming.body) {
              await joplin.data.put(['notes', incoming.id], null, { body: repaired });
              const _stillSelected = await joplin.workspace.selectedNote();
              if (_stillSelected?.id === incoming.id) {
                await joplin.commands.execute('editor.setText', repaired);
              }
            }
          } catch(_e: any) {}
        }
      });
    }
    // \▲[CN=3417_noteSelectWatcher]

    // \▼[CN=3658_insertTemplate] // 膜テンプレート挿入関数
    // {8530_commands} ⇒ Me ⇒ {7125_insertTemplate.MODECHECK}
    /**
     * v7.35: isMarkdownMode()関数化。
     * true  → Markdownモード: mupInsertAtCursorでカーソル位置に直接挿入
     * false → WYSIWYGモード: osascript§MK§→TinyMCE自動保存待ち→data.put（toggleEditors不要）
     */
    async function insertTemplate(template: string) {

      // \▼[CN=7125_insertTemplate.MODECHECK] // isMarkdownMode()でMarkdown/WYSIWYG判定
      // {3658_insertTemplate} ⇒ Me ⇒ {2847_isMarkdownMode}
      const isMarkdown = await isMarkdownMode();
      // \▲[CN=7125_insertTemplate.MODECHECK]

      // \▼[CN=4983_insertTemplate.MARKDOWN] // Markdownモード: mupInsertAtCursorでカーソル位置に直接挿入
      if (isMarkdown) {
        try {
          await joplin.commands.execute('editor.execCommand', {
            name: 'mupInsertAtCursor', args: [template],
          });
        } catch(e) {}
        return;
      }
      // \▲[CN=4983_insertTemplate.MARKDOWN]

      // \▼[CN=6247_insertTemplate.WYSIWYG] // WYSIWYGモード: joplin.clipboard HTML→<p>行×N→osascript Cmd+V
      // require('electron')はプラグインサブプロセスから不可。joplin.clipboard.write({html})を使用。
      // <pre><code>（コードブロック）を使うとTinyMCEが```コードフェンスとしてシリアライズ→バリア残骸の原因。
      // <p>行ごとに分けることでコードフェンスを生成せず、膜記法をプレーンテキストとして挿入する。
      // TinyMCEがMarkdownにシリアライズする際、\▼の\はエスケープされることがあるが
      // repairMupSpan(CN=1920)のstep②⑥で自動修復される。
      const escHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const _lines = template.trim().split('\n');
      const _paras = _lines.map(l => `<p>${escHtml(l)}</p>`).join('');
      const htmlForClip = `<html><body>${_paras}</body></html>`;
      try {
        await (joplin.clipboard as any).write({ text: template, html: htmlForClip });
      } catch(e) {
        await joplin.clipboard.writeText(template);
      }
      try {
        const { exec } = require('child_process');
        const { platform } = require('process');
        if (platform === 'darwin') {
          exec('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
        } else if (platform === 'win32') {
          exec('powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^v\')"');
        } else {
          exec('xdotool key ctrl+v');
        }
      } catch(e) {}
      // \▲[CN=6247_insertTemplate.WYSIWYG]
    }
    // \▲[CN=3658_insertTemplate]

    // \▼[CN=8530_commands] // コマンド登録
    // {2384_menu} ⇒ Me ⇒ {3658_insertTemplate, 4471_mupInsertBookmark.EXEC, 9015_mupRepairSpan.EXEC, 5274_mupInsertHR.EXEC}
    await joplin.commands.register({
      name: 'mupInsertV',
      label: 'Insert Membrane ▼▲',
      iconName: 'fas fa-caret-down',
      execute: async () => {
        await insertTemplate('\n$▼m[CN=new]$ // comment [⊕0+0]\n\n$▲m[CN=new]$\n');
      },
    });

    await joplin.commands.register({
      name: 'mupInsertH',
      label: 'Insert Membrane ▶◀ (default fold)',
      iconName: 'fas fa-caret-right',
      execute: async () => {
        await insertTemplate('\n$▶m[CN=new]$ // comment [⊕0+0]\n\n$◀m[CN=new]$\n');
      },
    });

    await joplin.commands.register({
      name: 'mupInsertLatexInline',
      label: 'Insert LaTeX Inline',
      iconName: 'fas fa-dollar-sign',
      execute: async () => {
        // \▼[CN=1849_mupInsertLatexInline.EXEC] // インラインLaTeX: `$\formula$` をカーソル位置に挿入
        await insertTemplate('\n`$\\alpha + \\beta = \\gamma$`\n');
        // \▲[CN=1849_mupInsertLatexInline.EXEC]
      },
    });

    await joplin.commands.register({
      name: 'mupInsertLatexBlock',
      label: 'Insert LaTeX Block',
      iconName: 'fas fa-square-root-alt',
      execute: async () => {
        // \▼[CN=3726_mupInsertLatexBlock.EXEC] // ブロックLaTeX: ```\n$$\formula$$\n``` をカーソル位置に挿入
        await insertTemplate('\n```\n$$\\sum_{i=0}^{n} x_i = \\frac{n(n+1)}{2}$$\n```\n');
        // \▲[CN=3726_mupInsertLatexBlock.EXEC]
      },
    });

    await joplin.commands.register({
      name: 'mupRepairSpan',
      label: 'Repair Membranes ✨',
      iconName: 'fas fa-wrench',
      execute: async () => {
        // \▼[CN=9015_mupRepairSpan.EXEC] // Repair Membranes: CN=6302と同じロジックでWYSIWYG対応
        // {8530_commands} ⇒ Me ⇒ {9043_repairMupSpan}
        if (!(await isMarkdownMode())) {
          // WYSIWYGモード: CN=6302と同じ手順 (toggleEditors→ポーリング→修復)
          await joplin.commands.execute('toggleEditors');
          for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 100));
            if (await isMarkdownMode()) break;
          }
          let note = await joplin.workspace.selectedNote();
          for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 200));
            note = await joplin.workspace.selectedNote();
            if (note && (note.body.includes('<span') || /^\\{3}$/m.test(note.body) || /^🔖 .+$/m.test(note.body) || /\\{2,}[▼▶▲◀]/.test(note.body))) break;
          }
          if (!note) return;
          let repaired = note.body.replace(/^🔖 (.+)$/gm, '$🔖m[$1]$');
          repaired = repairMupSpan(repaired);
          if (repaired !== note.body) await joplin.data.put(['notes', note.id], null, { body: repaired });
        } else {
          // Markdownモード: 直接修復
          const note = await joplin.workspace.selectedNote();
          if (!note) return;
          let repaired = note.body.replace(/^🔖 (.+)$/gm, '$🔖m[$1]$');
          repaired = repairMupSpan(repaired);
          if (repaired !== note.body) await joplin.data.put(['notes', note.id], null, { body: repaired });
        }
        // \▲[CN=9015_mupRepairSpan.EXEC]
      },
    });

    await joplin.commands.register({
      name: 'mupRepairEntities',
      label: 'Repair HTML Entities 🔧',
      iconName: 'fas fa-code',
      execute: async () => {
        // \▼[CN=5293_mupRepairEntities.EXEC] // HTMLエンティティ修復（暫定メニュー）
        // TinyMCEが&lt;div&gt;形式にエスケープしたmup関連HTMLをMarkdownモードで修復する。
        // ver0.1新アーキテクチャ（WYSIWYG書き込みなし）完成後に不要になったらメニューから削除。
        // {2384_menu} ⇒ Me ⇒ {9043_repairMupSpan}
        if (!(await isMarkdownMode())) {
          await joplin.commands.execute('toggleEditors');
          for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 100));
            if (await isMarkdownMode()) break;
          }
        }
        const note = await joplin.workspace.selectedNote();
        if (!note) return;
        let repaired = note.body.replace(/^🔖 (.+)$/gm, '$🔖m[$1]$');
        repaired = repairMupSpan(repaired); // CN=4821エンティティデコードも内包
        if (repaired !== note.body) {
          await joplin.data.put(['notes', note.id], null, { body: repaired });
          try { await joplin.commands.execute('editor.setText', repaired); } catch (_e) {}
        }
        // \▲[CN=5293_mupRepairEntities.EXEC]
      },
    });

    await joplin.commands.register({
      name: 'mupInsertBookmark',
      label: 'Insert Bookmark 🔖',
      iconName: 'fas fa-bookmark',
      execute: async () => {
        // \▼[CN=4471_mupInsertBookmark.EXEC] // 🔖しおり＆エディタ切替ボタン挿入
        // {8530_commands} ⇒ Me ⇒ {5139_onMessage.TOGGLE_EDITOR}
        if (await isMarkdownMode()) {
          // Markdownモード: 🔖m記法をそのまま挿入（左ペインに表示・右ペインはボタン描画）
          await insertTemplate('\n$🔖m[Here 🔖!!]$\n');
        } else {
          // WYSIWYGモード: $🔖m[label]$プレーンテキストをmceInsertContentで直接挿入
          // TinyMCEのKaTeXウィジェットとして保護される
          try {
            await joplin.commands.execute('editor.execCommand', {
              name: 'mceInsertContent',
              value: '$🔖m[Here 🔖!!]$',
              ui: false,
            });
          } catch(e) {
            await insertTemplate('\n$🔖m[Here 🔖!!]$\n');
          }
        }
        // \▲[CN=4471_mupInsertBookmark.EXEC]
      },
    });
    await joplin.commands.register({
      name: 'mupInsertHR',
      label: 'Insert HR ―',
      iconName: 'fas fa-minus',
      execute: async () => {
        // \▼[CN=5274_mupInsertHR.EXEC] // 罫線挿入: Markdown=* * *, WYSIWYG=<hr>をHTML貼付け
        const isMarkdown = await isMarkdownMode();
        if (isMarkdown) {
          try {
            await joplin.commands.execute('editor.execCommand', {
              name: 'mupInsertAtCursor', args: ['\n* * *\n'],
            });
          } catch(e) {}
        } else {
          // WYSIWYGモード: <hr>をHTMLとして直接ペースト（コードブロックに包まない）
          const htmlForClip = '<html><body><hr></body></html>';
          try {
            await (joplin.clipboard as any).write({ text: '* * *', html: htmlForClip });
          } catch(e) {
            await joplin.clipboard.writeText('* * *');
          }
          try {
            const { exec } = require('child_process');
            const { platform } = require('process');
            if (platform === 'darwin') {
              exec('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
            } else if (platform === 'win32') {
              exec('powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^v\')"');
            } else {
              exec('xdotool key ctrl+v');
            }
          } catch(e) {}
        }
        // \▲[CN=5274_mupInsertHR.EXEC]
      },
    });
    await joplin.commands.register({
      name: 'mupRepairBackslash',
      label: 'Repair Backslash ∞ 🔧',
      iconName: 'fas fa-broom',
      execute: async () => {
        // \▼[CN=6483_mupRepairBackslash.EXEC] // バックスラッシュ∞地獄の核オプション修復
        // 正規表現 \\{2,} → \ （2個以上の連続バックスラッシュを1個に削減）
        // コードブロック・インラインコードは保護してから適用
        const note = await joplin.workspace.selectedNote();
        if (!note) return;
        let body = note.body;
        // コードブロックとインラインコードを一時保護
        const _bsInfSlots: string[] = [];
        body = body.replace(/```[\s\S]*?```|`[^`\n]+`/g, (m: string) => {
          _bsInfSlots.push(m);
          return '\x00INF' + (_bsInfSlots.length - 1) + '\x00';
        });
        // \\{2,} → \ （2個以上のバックスラッシュを1個に削減）
        body = body.replace(/\\{2,}/g, '\\');
        // 保護したブロックを復元
        body = body.replace(/\x00INF(\d+)\x00/g, (_: string, i: string) => _bsInfSlots[Number(i)]);
        // repairMupSpanで膜記法を正規化
        body = repairMupSpan(body);
        await joplin.data.put(['notes', note.id], null, { body });
        try { await joplin.commands.execute('editor.setText', body); } catch (_e) {}
        // \▲[CN=6483_mupRepairBackslash.EXEC]
      },
    });
    await joplin.commands.register({
      name: 'mupMigrateToM',
      label: 'Migrate 旧記法 → ▼m 記法 ⚡',
      iconName: 'fas fa-exchange-alt',
      execute: async () => {
        // \▼[CN=3891_mupMigrateToM.EXEC] // 旧記法→▼m記法 一括移行
        if (!(await isMarkdownMode())) {
          await joplin.commands.execute('toggleEditors');
          for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 100));
            if (await isMarkdownMode()) break;
          }
        }
        const note = await joplin.workspace.selectedNote();
        if (!note) return;
        let body = note.body;
        // コードブロック・インラインコードを保護
        const _migSlots: string[] = [];
        body = body.replace(/```[\s\S]*?```|`[^`\n]+`/g, (m: string) => {
          _migSlots.push(m);
          return '\x00MIG' + (_migSlots.length - 1) + '\x00';
        });
        // \▼[ → $▼m[$  等（旧バックスラッシュ記法）
        body = body.replace(/\$?\\([▼▶▲◀])\[([^\]]*)\]\$?/g, '$$1m[$2]$$');
        // A▼[ / M▼[ / $▼_M[$ → $▼m[$ 等（A記法・M記法・$▼_M$からの移行）
        body = body.replace(/\$?[AM]([▼▶▲◀])\[([^\]]*)\]\$?/g, '$$1m[$2]$$');
        body = body.replace(/\$?([▼▶▲◀])_[Mm🄼]\[([^\]]*)\]\$?/g, '$$1m[$2]$$');
        // $なし ▼m[ → $▼m[$ （$なし記法を$付きに統一）
        body = body.replace(/(?<!\$)([▼▶▲◀])m\[([^\]]*)\](?!\$)/g, '$$1m[$2]$$');
        // \🔖[label] / A🔖[label] / M🔖[label] / $🔖_M[label]$ → $🔖m[label]$
        body = body.replace(/\$?\\🔖\[([^\]]*)\]\$?/g, '$🔖m[$1]$$');
        body = body.replace(/\$?(?:[AM]🔖|🔖_[Mm🄼])\[([^\]]*)\]\$?/g, '$🔖m[$1]$$');
        // $なし 🔖m[ → $🔖m[$
        body = body.replace(/(?<!\$)🔖m\[([^\]]*)\](?!\$)/g, '$🔖m[$1]$$');
        // 保護解除
        body = body.replace(/\x00MIG(\d+)\x00/g, (_: string, i: string) => _migSlots[Number(i)]);
        if (body !== note.body) {
          await joplin.data.put(['notes', note.id], null, { body });
          try { await joplin.commands.execute('editor.setText', body); } catch (_e) {}
        }
        // \▲[CN=3891_mupMigrateToM.EXEC]
      },
    });
    // \▲[CN=8530_commands]

    // \▼[CN=2384_menu] // ツールメニュー登録
    // ⇒ Me ⇒ {8530_commands}
    await joplin.views.menus.create('mupMenu', 'Fold Membrane', [
      { commandName: 'mupInsertV' },
      { commandName: 'mupInsertH' },
      { commandName: 'mupInsertBookmark' },
      { commandName: 'mupRepairSpan' },
      { commandName: 'mupRepairEntities' },
      { commandName: 'mupRepairBackslash' },
      { commandName: 'mupMigrateToM' },
      { commandName: 'mupInsertLatexInline' },
      { commandName: 'mupInsertLatexBlock' },
      { commandName: 'mupInsertHR' },
    ], MenuItemLocation.Tools);
    // \▲[CN=2384_menu]

  },
});
// \▲[CN=1473_plugin]
