// \▼[CN=CM_PLUGIN] // CodeMirror5 カーソル位置挿入プラグイン
/**
 * @file    codeMirrorPlugin.js
 * @version 2.0
 * @date    2026.03.19(木) am11:58
 * @author  俊克 + Claude (Anthropic)
 * @desc    v1.0 Markdownモードでカーソル位置に膜テンプレートを直接挿入
 *          v2.0 膜記法で書き直し
 */
'use strict';

// \▼[CN=CM_PLUGIN.MAIN] // プラグイン本体
module.exports = {
  default: function(_ctx) {
    return {

      // \▼[CN=CM_PLUGIN.COMMANDS] // コマンド定義
      plugin: function(CodeMirror) {

        // \▼[CN=CM_PLUGIN.COMMANDS.V] // 縦膜（展開デフォルト）挿入
        CodeMirror.commands.mupInsertV = function(cm) {
          var cursor = cm.getCursor();
          var template = '\\▼[CN=新膜] // コメント\n内容をここに書く\n\\▲[CN=新膜]\n';
          cm.replaceRange(template, cursor);
          cm.setCursor({ line: cursor.line, ch: 5 });
        };
        // \▲[CN=CM_PLUGIN.COMMANDS.V]

        // \▼[CN=CM_PLUGIN.COMMANDS.H] // 横膜（折畳デフォルト）挿入
        CodeMirror.commands.mupInsertH = function(cm) {
          var cursor = cm.getCursor();
          var template = '\\▶[CN=新膜] // コメント\n内容をここに書く\n\\◀[CN=新膜]\n';
          cm.replaceRange(template, cursor);
          cm.setCursor({ line: cursor.line, ch: 5 });
        };
        // \▲[CN=CM_PLUGIN.COMMANDS.H]

      },
      // \▲[CN=CM_PLUGIN.COMMANDS]

      codeMirrorOptions: {},
      assets: function() { return []; },
    };
  }
};
// \▲[CN=CM_PLUGIN.MAIN]
// \▲[CN=CM_PLUGIN]