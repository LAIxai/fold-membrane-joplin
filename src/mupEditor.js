// \▼[CN=EDITOR] // CodeMirrorプラグイン - エディタ同期 v2.1
/**
 * @file    mupEditor.js
 * @version 2.2
 * @date    2026.04.10(金)
 * @desc    v2.2: mupScrollToCnを強化: EditorView.scrollIntoView effect + 300ms再スクロール
 *          v2.1: mupScrollToCn追加: WYSIWYG→Markdown切替後にCodeMirrorカーソルをCN行に移動
 *          v2.0: 膜名前自動同期機能追加（開始膜↔閉じ膜のCN名をリアルタイム同期）
 *               addExtension + EditorView.updateListenerで実装。
 *               mupUpdateBadge正規表現を$▼m[CN=...]$形式に修正（旧\▼[形式バグ修正）。
 * @author  俊克 + Claude (Anthropic)
 */
'use strict';

// \▼[CN=EDITOR.MODULE]
module.exports = {
  default: function(context) {
    return {

      // \▼[CN=EDITOR.PLUGIN]
      plugin: function(editorControl) {

        // \▼[CN=EDITOR.CHECKMODE]
        editorControl.registerCommand('mupCheckMode', function() {
          webviewApi.postMessage({ type: 'mupCheckMode' });
        });
        // \▲[CN=EDITOR.CHECKMODE]

        // \▼[CN=EDITOR.CHECKMODE_INSERT]
        editorControl.registerCommand('mupCheckModeInsert', function() {
          webviewApi.postMessage({ type: 'mupCheckModeInsert' });
        });
        // \▲[CN=EDITOR.CHECKMODE_INSERT]

        // \▼[CN=EDITOR.INSERT]
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

        // \▼[CN=EDITOR.SCROLL_TO_CN] // mupScrollToCn: WYSIWYG→Markdown切替後にCN行へカーソル+スクロール
        // index.tsがeditor.execCommand('mupScrollToCn', cn)で呼ぶ。
        // CodeMirrorが正しい行にいないとJoplinのSync Scrollがプレビューを引きずるため必須。
        // scrollIntoView:true と EditorView.scrollIntoView effect の両方を試みる（Joplinバージョン差吸収）。
        editorControl.registerCommand('mupScrollToCn', function(cn) {
          if (!cn) return;
          var editor = editorControl.editor;
          if (!editor) return;
          var doc = editor.state.doc;
          var escapedCn = String(cn).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var RE = new RegExp('\\[(?:CN|H[1-3])=' + escapedCn + '\\]');
          for (var i = 1; i <= doc.lines; i++) {
            if (RE.test(doc.line(i).text)) {
              var pos = doc.line(i).from;
              // CM6: scrollIntoView:true + EditorView.scrollIntoView effect（両方試みる）
              var effects = [];
              try {
                var EV = editor.constructor;
                if (EV && typeof EV.scrollIntoView === 'function') {
                  effects = [EV.scrollIntoView(pos, { y: 'center' })];
                }
              } catch(e) {}
              editor.dispatch({
                selection: { anchor: pos, head: pos },
                scrollIntoView: true,
                effects: effects.length ? effects : undefined
              });
              // 念のため300ms後にも再スクロール（他のトランザクションに上書きされた場合の保険）
              setTimeout(function() {
                var doc2 = editor.state.doc;
                for (var j = 1; j <= doc2.lines; j++) {
                  if (RE.test(doc2.line(j).text)) {
                    var pos2 = doc2.line(j).from;
                    var effects2 = [];
                    try {
                      var EV2 = editor.constructor;
                      if (EV2 && typeof EV2.scrollIntoView === 'function') {
                        effects2 = [EV2.scrollIntoView(pos2, { y: 'center' })];
                      }
                    } catch(e) {}
                    editor.dispatch({
                      selection: { anchor: pos2, head: pos2 },
                      scrollIntoView: true,
                      effects: effects2.length ? effects2 : undefined
                    });
                    break;
                  }
                }
              }, 300);
              return;
            }
          }
        });
        // \▲[CN=EDITOR.SCROLL_TO_CN]

        // \▼[CN=EDITOR.CMD] // mupUpdateBadge: クリック後のバッジをCM6エディタに同期
        editorControl.registerCommand('mupUpdateBadge', function(cn, state, count, exp, pfx) {

          // \▼[CN=EDITOR.CMD.GUARD]
          if (!cn || !state) return;
          var editor = editorControl.editor;
          if (!editor) return;
          // \▲[CN=EDITOR.CMD.GUARD]

          // \▼[CN=EDITOR.CMD.REGEX] // $▼m[CN=name]$形式に対応（v2.0修正: 旧\▼[形式バグ修正）
          var escapedCn = String(cn).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var mupPfx = pfx || 'CN';
          var lineRe = new RegExp(
            '(\\$?(?:[▼▶])m\\[' + mupPfx + '=' + escapedCn + '\\][^\\n]*)\\[(⊕|⊖|⊘)(?:∞|\\d+)(?:\\+\\d+)?\\]'
          );
          var badge = count === '∞'
            ? '[' + state + '∞]'
            : '[' + state + count + '+' + exp + ']';
          // \▲[CN=EDITOR.CMD.REGEX]

          // \▼[CN=EDITOR.CMD.SCAN]
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

        // \▼[CN=EDITOR.NAME_SYNC] // 膜名前自動同期（開始膜↔閉じ膜のCN名をリアルタイム同期）
        // 開始膜を編集→対応する閉じ膜を前方検索して同期 / 閉じ膜を編集→後方検索して同期
        // addExtension + EditorView.updateListenerで変更検知（CM6ネイティブ方式）
        var RE_SYNC_OPEN  = /^[ \t]*\$?(▼|▶)m\[(CN|H[1-3])=([^\]]+)\]\$?/;
        var RE_SYNC_CLOSE = /^[ \t]*\$?(▲|◀)m\[(CN|H[1-3])=([^\]]+)\]\$?/;
        var _syncGuard = false;

        // \▼[CN=EDITOR.NAME_SYNC.DISPATCH] // 対になる膜のCN名を書き換えて dispatch
        function _syncDispatch(view, doc, targetRE, oldPfx, oldCn, newPfx, newCn, fromLine, forward) {
          var oldPart = '[' + oldPfx + '=' + oldCn + ']';
          var newPart = '[' + newPfx + '=' + newCn + ']';
          var start = forward ? fromLine + 1 : fromLine - 1;
          var stop  = forward ? doc.lines + 1 : 0;
          var step  = forward ? 1 : -1;
          for (var i = start; forward ? (i < stop) : (i > stop); i += step) {
            var line = doc.line(i);
            var m = targetRE.exec(line.text);
            if (!m || m[2] !== oldPfx || m[3].trim() !== oldCn) continue;
            var updated = line.text.replace(oldPart, newPart);
            if (updated !== line.text) {
              _syncGuard = true;
              view.dispatch({ changes: [{ from: line.from, to: line.to, insert: updated }] });
              _syncGuard = false;
            }
            return; // 最初に見つかった対を1つだけ更新
          }
        }
        // \▲[CN=EDITOR.NAME_SYNC.DISPATCH]

        // \▼[CN=EDITOR.NAME_SYNC.HANDLER] // ドキュメント変更を検知→変更行を比較→必要なら同期
        function _onDocChange(view, startDoc, endDoc) {
          var maxLine = Math.min(startDoc.lines, endDoc.lines);
          for (var i = 1; i <= maxLine; i++) {
            var oldText = startDoc.line(i).text;
            var newText = endDoc.line(i).text;
            if (oldText === newText) continue;

            var oldOpen  = RE_SYNC_OPEN.exec(oldText);
            var newOpen  = RE_SYNC_OPEN.exec(newText);
            var oldClose = RE_SYNC_CLOSE.exec(oldText);
            var newClose = RE_SYNC_CLOSE.exec(newText);

            if (oldOpen && newOpen) {
              // 開始膜のCN名が変わった → 前方検索で閉じ膜を同期
              var oPfx = oldOpen[2], oCn = oldOpen[3].trim();
              var nPfx = newOpen[2], nCn = newOpen[3].trim();
              if (oPfx !== nPfx || oCn !== nCn) {
                _syncDispatch(view, endDoc, RE_SYNC_CLOSE, oPfx, oCn, nPfx, nCn, i, true);
              }
            } else if (oldClose && newClose) {
              // 閉じ膜のCN名が変わった → 後方検索で開始膜を同期
              var oPfx2 = oldClose[2], oCn2 = oldClose[3].trim();
              var nPfx2 = newClose[2], nCn2 = newClose[3].trim();
              if (oPfx2 !== nPfx2 || oCn2 !== nCn2) {
                _syncDispatch(view, endDoc, RE_SYNC_OPEN, oPfx2, oCn2, nPfx2, nCn2, i, false);
              }
            }
          }
        }
        // \▲[CN=EDITOR.NAME_SYNC.HANDLER]

        // \▼[CN=EDITOR.NAME_SYNC.REGISTER] // addExtension + updateListenerで登録
        try {
          var _EV = editorControl.editor.constructor; // EditorViewクラス
          if (typeof editorControl.addExtension === 'function' && _EV && _EV.updateListener) {
            editorControl.addExtension(
              _EV.updateListener.of(function(update) {
                if (!update.docChanged || _syncGuard) return;
                _onDocChange(update.view, update.startState.doc, update.state.doc);
              })
            );
          }
        } catch(e) {
          // addExtension非対応バージョンは同期なし（エラーは無視）
        }
        // \▲[CN=EDITOR.NAME_SYNC.REGISTER]
        // \▲[CN=EDITOR.NAME_SYNC]

      },
      // \▲[CN=EDITOR.PLUGIN]

    };
  }
};
// \▲[CN=EDITOR.MODULE]

// \▲[CN=EDITOR]
