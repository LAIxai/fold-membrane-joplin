// \▼[CN=EDITOR] // CodeMirrorプラグイン - エディタ同期 v2.0
/**
 * @file    mupEditor.js
 * @version 2.1
 * @date    2026.04.08(水)
 * @desc    v1.2: mupUpdateBadgeにpfx第5引数追加（H1=/H2=/H3=対応）
 *          v1.3: mupCheckModeInsert追加（insertTemplate専用、競合解消）
 *          v2.0: 膜名前自動同期機能追加（開始膜↔閉じ膜のCN名をリアルタイム同期）
 *               addExtension + EditorView.updateListenerで実装。
 *               mupUpdateBadge正規表現を$▼m[CN=...]$形式に修正（旧\▼[形式バグ修正）。
 *          v2.1: _syncDispatch深さカウンター方式に変更（同名入れ子膜で内側膜を誤更新するバグ修正）。
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
        // v2.1: 深さカウンター方式で同名入れ子膜を正しくブラケットマッチングする
        // forward=true: 開始膜変更→閉じ膜を前方検索。同名開始膜でdepth++、閉じ膜でdepth--。depth=0が真の対応膜。
        // forward=false: 閉じ膜変更→開始膜を後方検索。同名閉じ膜でdepth++、開始膜でdepth--。depth=0が真の対応膜。
        function _syncDispatch(view, doc, targetRE, oldPfx, oldCn, newPfx, newCn, fromLine, forward) {
          var oldPart = '[' + oldPfx + '=' + oldCn + ']';
          var newPart = '[' + newPfx + '=' + newCn + ']';
          var start = forward ? fromLine + 1 : fromLine - 1;
          var stop  = forward ? doc.lines + 1 : 0;
          var step  = forward ? 1 : -1;
          // 入れ子深さカウンター（同名同pfx膜のネスト追跡）
          var depth = 0;
          // 前方検索時は入れ子の開始膜(OPEN)をカウント、後方検索時は入れ子の閉じ膜(CLOSE)をカウント
          var depthRE = forward ? RE_SYNC_OPEN : RE_SYNC_CLOSE;
          for (var i = start; forward ? (i < stop) : (i > stop); i += step) {
            var line = doc.line(i);
            var mt = targetRE.exec(line.text);
            var md = depthRE.exec(line.text);
            if (md && md[2] === oldPfx && md[3].trim() === oldCn) {
              // 同名同pfxの入れ子膜 → 深さ増加
              depth++;
            } else if (mt && mt[2] === oldPfx && mt[3].trim() === oldCn) {
              if (depth > 0) {
                depth--; // 入れ子内の対応膜 → スキップ
              } else {
                // depth === 0: 真の対応膜
                var updated = line.text.replace(oldPart, newPart);
                if (updated !== line.text) {
                  _syncGuard = true;
                  view.dispatch({ changes: [{ from: line.from, to: line.to, insert: updated }] });
                  _syncGuard = false;
                }
                return;
              }
            }
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
