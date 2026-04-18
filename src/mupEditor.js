// \▼[CN=EDITOR] // CodeMirrorプラグイン - エディタ同期 v2.3
/**
 * @file    mupEditor.js
 * @version 2.3
 * @date    2026.04.18(土)
 * @desc    v2.3: NAME_SYNC を全文ペアリング方式に刷新。①m/M タグ文字も同期対象に追加（不可侵膜 M 対応）
 *               ②CN↔H1 双方向切替の中間状態バグ修正（C→H→H1 の段階編集で同期されない問題）
 *               ③全ての「開閉膜タグ全体」（tag letter + pfx + cn）を統一的に同期。
 *               アルゴリズム: 変更検知 → 全膜タグ収集 → Pass1(完全一致消費) → Pass2(cn一致で孤立ペアリング)
 *               → 孤立ペアの tagLetter/pfx/cn を開き膜に合わせて閉じ膜を書き換え。
 *          v2.2: mupScrollToCnを強化: EditorView.scrollIntoView effect + 300ms再スクロール
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

        // \▼[CN=EDITOR.NAME_SYNC] // 膜タグ全体自動同期（開閉膜の tag[pfx=cn] を一括同期）
        // v2.3: m/M タグ文字 + CN/H1-3 プレフィックス + cn名 の3要素すべてを同期対象に。
        // アルゴリズム: 全膜タグ収集 → Pass1 完全一致(tag+pfx+cn)消費 → Pass2 孤立同士を cn 一致でペアリング
        // Pass2 で閉じ膜の tag/pfx/cn を開き膜の値に合わせて書き換え。中間状態での段階編集にも強い。
        var RE_SYNC_OPEN  = /^[ \t]*\$?(▼|▶)([mM])\[(CN|H[1-3])=([^\]]+)\]\$?/;
        var RE_SYNC_CLOSE = /^[ \t]*\$?(▲|◀)([mM])\[(CN|H[1-3])=([^\]]+)\]\$?/;
        var _syncGuard = false;

        // \▼[CN=EDITOR.NAME_SYNC.PAIR] // 全文ペアリング＆同期
        function _pairAndSync(view, doc) {
          var opens  = [];
          var closes = [];
          for (var i = 1; i <= doc.lines; i++) {
            var text = doc.line(i).text;
            var om = RE_SYNC_OPEN.exec(text);
            var cm = RE_SYNC_CLOSE.exec(text);
            if (om) {
              opens.push({ lineIdx: i, tag: om[2], pfx: om[3], cn: om[4].trim(), consumed: false });
            } else if (cm) {
              closes.push({ lineIdx: i, tag: cm[2], pfx: cm[3], cn: cm[4].trim(), consumed: false });
            }
          }
          // Pass 1: 完全一致 (tag + pfx + cn) を消費（最近接スタック方式でネスト順保持）
          for (var c = 0; c < closes.length; c++) {
            var cl = closes[c];
            for (var k = opens.length - 1; k >= 0; k--) {
              var op = opens[k];
              if (!op.consumed && op.lineIdx < cl.lineIdx &&
                  op.tag === cl.tag && op.pfx === cl.pfx && op.cn === cl.cn) {
                op.consumed = true;
                cl.consumed = true;
                break;
              }
            }
          }
          // Pass 2: 孤立同士をドキュメント順でペアリング。cn一致を優先、無ければ順序のみ。
          var orphanOpens  = opens.filter(function(o) { return !o.consumed; });
          var orphanCloses = closes.filter(function(c) { return !c.consumed; });
          var usedClose = {};
          var fixes = [];
          // 2a: cn一致で pfx/tag 違いのペア（例: m→M書換、CN→H1書換）
          for (var p = 0; p < orphanOpens.length; p++) {
            var opp = orphanOpens[p];
            for (var q = 0; q < orphanCloses.length; q++) {
              var clp = orphanCloses[q];
              if (usedClose[clp.lineIdx]) continue;
              if (clp.lineIdx <= opp.lineIdx) continue;
              if (clp.cn !== opp.cn) continue;
              usedClose[clp.lineIdx] = true;
              opp.consumed = true;
              fixes.push({
                lineIdx: clp.lineIdx,
                oldTag: clp.tag, oldPfx: clp.pfx, oldCn: clp.cn,
                newTag: opp.tag, newPfx: opp.pfx, newCn: opp.cn
              });
              break;
            }
          }
          // 2b: まだ孤立してる同士を順序だけで結び、cn を開き膜に合わせる
          // （中間状態で cn まで変化したケース用）
          var stillOpens  = orphanOpens.filter(function(o) { return !o.consumed; });
          var stillCloses = orphanCloses.filter(function(c) { return !usedClose[c.lineIdx]; });
          for (var r = 0; r < stillOpens.length && r < stillCloses.length; r++) {
            var opp2 = stillOpens[r];
            var clp2 = stillCloses[r];
            if (clp2.lineIdx <= opp2.lineIdx) continue;
            fixes.push({
              lineIdx: clp2.lineIdx,
              oldTag: clp2.tag, oldPfx: clp2.pfx, oldCn: clp2.cn,
              newTag: opp2.tag, newPfx: opp2.pfx, newCn: opp2.cn
            });
          }
          // 適用
          if (fixes.length === 0) return;
          var changes = [];
          for (var f = 0; f < fixes.length; f++) {
            var fx = fixes[f];
            var lineObj = doc.line(fx.lineIdx);
            var oldPart = fx.oldTag + '[' + fx.oldPfx + '=' + fx.oldCn + ']';
            var newPart = fx.newTag + '[' + fx.newPfx + '=' + fx.newCn + ']';
            var updated = lineObj.text.replace(oldPart, newPart);
            if (updated !== lineObj.text) {
              changes.push({ from: lineObj.from, to: lineObj.to, insert: updated });
            }
          }
          if (changes.length === 0) return;
          _syncGuard = true;
          try { view.dispatch({ changes: changes }); }
          finally { _syncGuard = false; }
        }
        // \▲[CN=EDITOR.NAME_SYNC.PAIR]

        // \▼[CN=EDITOR.NAME_SYNC.HANDLER] // 変更検知: 膜タグ行が触れられたら全文ペアリング
        function _onDocChange(view, startDoc, endDoc) {
          // 膜タグを含む行が変化したかだけを検出（軽量ガード）
          var touched = false;
          var maxLine = Math.max(startDoc.lines, endDoc.lines);
          for (var i = 1; i <= maxLine; i++) {
            var oldText = i <= startDoc.lines ? startDoc.line(i).text : '';
            var newText = i <= endDoc.lines ? endDoc.line(i).text : '';
            if (oldText === newText) continue;
            if (RE_SYNC_OPEN.test(oldText) || RE_SYNC_OPEN.test(newText) ||
                RE_SYNC_CLOSE.test(oldText) || RE_SYNC_CLOSE.test(newText)) {
              touched = true;
              break;
            }
          }
          if (!touched) return;
          _pairAndSync(view, endDoc);
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
