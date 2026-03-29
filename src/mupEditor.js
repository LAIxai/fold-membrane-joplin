// \▼[CN=EDITOR] // CodeMirrorプラグイン - エディタのステータスバッジ同期 v1.0
/**
 * @file    mupEditor.js
 * @version 1.3
 * @date    2026.03.23(月)
 * @desc    v1.2: mupUpdateBadgeにpfx第5引数追加（v2.0 H1=/H2=/H3=対応）
 *          v1.3: mupCheckModeInsert追加（insertTemplate専用、_modeCheckResolve競合解消）
 * @author  俊克 + Claude (Anthropic)
 * @desc    mupUpdateBadgeコマンドを登録。
 *          index.tsのonMessageハンドラから呼ばれ、
 *          CM6エディタの該当行バッジをreplaceRangeで書き換える。
 */
'use strict';

// \▼[CN=EDITOR.MODULE] // モジュール定義
module.exports = {
  default: function(context) {
    return {

      // \▼[CN=EDITOR.PLUGIN] // CodeMirrorControl受取→コマンド登録
      plugin: function(editorControl) {

        // \▼[CN=EDITOR.CHECKMODE] // mupCheckMode コマンド登録（onMessage mupToggle専用）
        // WYSIWYGでは呼ばれないためpostMessageは届かない→index.ts側でタイムアウト→WYSIWYG判定
        editorControl.registerCommand('mupCheckMode', function() {
          webviewApi.postMessage({ type: 'mupCheckMode' });
        });
        // \▲[CN=EDITOR.CHECKMODE]

        // \▼[CN=EDITOR.CHECKMODE_INSERT] // mupCheckModeInsert コマンド登録（insertTemplate専用）
        // mupCheckModeと分離することで_modeCheckResolve競合（Bug#1）を解消
        editorControl.registerCommand('mupCheckModeInsert', function() {
          webviewApi.postMessage({ type: 'mupCheckModeInsert' });
        });
        // \▲[CN=EDITOR.CHECKMODE_INSERT]

        // \▼[CN=EDITOR.INSERT] // mupInsertAtCursor コマンド登録（WYSIWYGからtoggleEditors後に呼ぶ）
        editorControl.registerCommand('mupInsertAtCursor', function(text) {
          if (!text) return;
          var editor = editorControl.editor;
          if (!editor) return;
          var pos = editor.state.selection.main.head;
          editor.dispatch({
            changes: { from: pos, to: pos, insert: text },
            selection: { anchor: pos + text.length }
          });
        });
        // \▲[CN=EDITOR.INSERT]

        // \▼[CN=EDITOR.CMD] // mupUpdateBadge コマンド登録
        editorControl.registerCommand('mupUpdateBadge', function(cn, state, count, exp, pfx) {

          // \▼[CN=EDITOR.CMD.GUARD] // 引数チェック
          if (!cn || !state) return;
          var editor = editorControl.editor; // CM6 EditorView
          if (!editor) return;
          // \▲[CN=EDITOR.CMD.GUARD]

          // \▼[CN=EDITOR.CMD.REGEX] // 正規表現構築（v1.2: pfx第5引数でCN/H1/H2/H3を切替）
          var escapedCn = String(cn).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var mupPfx = pfx || 'CN';
          var lineRe = new RegExp(
            '(\\\\[▼▶]\\[' + mupPfx + '=' + escapedCn + '\\][^\\n]*)\\[(⊕|⊖|⊘)(?:∞|\\d+)(?:\\+\\d+)?\\]'
          );
          var badge = count === '∞'
            ? '[' + state + '∞]'
            : '[' + state + count + '+' + exp + ']';
          // \▲[CN=EDITOR.CMD.REGEX]

          // \▼[CN=EDITOR.CMD.SCAN] // 該当行を検索してreplaceRange
          var doc = editor.state.doc;
          for (var i = 1; i <= doc.lines; i++) {
            var line = doc.line(i);
            if (lineRe.test(line.text)) {
              var newText = line.text.replace(lineRe, '$1' + badge);
              editor.dispatch({
                changes: { from: line.from, to: line.to, insert: newText }
              });
              break;
            }
          }
          // \▲[CN=EDITOR.CMD.SCAN]

        });
        // \▲[CN=EDITOR.CMD]

      },
      // \▲[CN=EDITOR.PLUGIN]

    };
  }
};
// \▲[CN=EDITOR.MODULE]

// \▲[CN=EDITOR]
