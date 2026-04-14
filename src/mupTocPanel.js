// \▼[CN=TOC_PANEL] // Fold Membrane - 膜目次パネル v2.2
// Joplin panels API webviewで動作。index.tsと双方向メッセージ通信。
// Pull: 600msごとにrequestTocでindex.tsから最新データを取得（確実）
// Push: updateToc受信でも即時更新（補助）
// 送信: tocClick { cn } → index.tsが_pendingTocCNを更新→mupFold.jsがポーリングで受取

(function() {
  'use strict';

  var _activeCN = null;
  var _lastKey = '';     // 変化なし時の再描画を防ぐ
  var _recalcChars = null; // 再計算後の文字数（null=通常表示, N=差分表示）
  var _targetChars = null; // 目標文字数（null=未設定）

  // \▼[CN=TOC_PANEL.RECEIVE] // Push受信: index.tsからpostMessageで来た場合（補助）
  webviewApi.onMessage(function(message) {
    if (message && message.type === 'updateToc') {
      _applyData(message, false);
    }
  });
  // \▲[CN=TOC_PANEL.RECEIVE]

  // \▼[CN=TOC_PANEL.POLL] // Pull: 600msごとにindex.tsから最新TOCデータを取得（確実）
  setInterval(function() {
    webviewApi.postMessage({ type: 'requestToc' })
      .then(function(data) {
        if (!data) return;
        _applyData(data, false);
      })
      .catch(function() {});
  }, 600);
  // \▲[CN=TOC_PANEL.POLL]

  function _applyData(data, isManualRefresh) {
    var ns = data.noteSize || { str: '—', level: 'ok', chars: 0, ratio: 0 };
    var rc = (data.recalcChars !== undefined && data.recalcChars !== null) ? data.recalcChars : null;
    var tc = (data.targetChars !== undefined && data.targetChars !== null && data.targetChars > 0) ? data.targetChars : null;
    var key = JSON.stringify([data.membranes, data.activeCN, ns.str, ns.ratio, rc, tc]);
    if (key === _lastKey) {
      if (!isManualRefresh) return; // 変化なし+ポーリング → スキップ
    } else {
      _lastKey = key;
    }
    _recalcChars = rc; // データから受け取る（index.tsが管理）
    _targetChars = tc;
    _activeCN = data.activeCN || null;
    _renderNoteSize(ns);
    renderList(data.membranes || []);
  }

  // ratio → プログレスバー色（ファイルサイズモード）
  function _barColor(ratio) {
    if (ratio >= 1.0) return '#F44336'; // 赤: 1MB+
    if (ratio >= 0.5) return '#FF9800'; // 橙: 500KB+
    if (ratio >= 0.1) return '#FFC107'; // 黄: 100KB+
    return '#2196F3';                   // 青: 100KB未満
  }

  // ratio → ポップアップメッセージ（ファイルサイズモード）
  function _barMsg(ratio, str, currentChars) {
    if (_targetChars !== null) {
      var remaining = Math.max(_targetChars - currentChars, 0);
      var pct = Math.min(Math.round(currentChars / _targetChars * 100), 100);
      if (currentChars >= _targetChars) {
        return '🎉 目標達成！\n' + currentChars.toLocaleString() + ' / ' + _targetChars.toLocaleString() + ' chars (100%)';
      }
      return '📝 目標まで残り ' + remaining.toLocaleString() + ' chars\n'
        + '(' + pct + '% 達成 / 目標: ' + _targetChars.toLocaleString() + ' chars)\n'
        + 'ファイルサイズ: ' + str;
    }
    if (ratio <= 0)   return 'ノートが空です。';
    if (ratio < 0.1)  return '✓ サイズは良好です（' + str + '）';
    if (ratio < 0.5)  return '⚠️ 大きめです（' + str + '）\n100KB未満を推奨します。';
    if (ratio < 1.0)  return '⚠️ かなり大きいです（' + str + '）\n不要な内容を整理することをお勧めします。';
    return '🔴 1MB以上です（' + str + '）\nファイルサイズを小さくしてください。';
  }

  // ポップアップ表示（クリックで開閉）
  var _popup = null;
  function _closePopup() { if (_popup) { _popup.remove(); _popup = null; } }
  function _showPopup(ratio, str, currentChars) {
    if (_popup) { _closePopup(); return; }
    _popup = document.createElement('div');
    _popup.style.cssText = [
      'position:fixed','z-index:99999',
      'background:rgba(240,240,240,0.97)',
      'border:1px solid #ccc','border-radius:6px',
      'padding:8px 14px 10px','font-size:11px','line-height:1.7',
      'color:#444','white-space:pre','box-shadow:0 2px 8px rgba(0,0,0,0.12)',
      'pointer-events:auto'
    ].join(';');
    // メッセージ行
    var msg = document.createElement('div');
    msg.textContent = _barMsg(ratio, str, currentChars);
    _popup.appendChild(msg);
    // ボタン行（再計算/更新）
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'margin-top:8px;display:flex;gap:8px;justify-content:flex-end';
    // キャンセル
    var btnCancel = document.createElement('button');
    btnCancel.textContent = 'キャンセル';
    btnCancel.style.cssText = 'font-size:11px;padding:2px 8px;cursor:pointer;border:1px solid #ccc;border-radius:3px;background:#fff';
    btnCancel.onclick = function() { _closePopup(); };
    // 再計算
    var btnRecalc = document.createElement('button');
    btnRecalc.textContent = '再計算';
    btnRecalc.style.cssText = 'font-size:11px;padding:2px 8px;cursor:pointer;border:1px solid #4CAF50;border-radius:3px;background:#4CAF50;color:#fff;font-weight:bold';
    btnRecalc.onclick = function() {
      _closePopup();
      webviewApi.postMessage({ type: 'recalcNoteSize' })
        .then(function(data) {
          if (!data) return;
          _recalcChars = data.current.chars;
          _renderNoteSize(_currentNs);
        })
        .catch(function() {});
    };
    // 更新
    var btnUpdate = document.createElement('button');
    btnUpdate.textContent = '更新';
    btnUpdate.style.cssText = 'font-size:11px;padding:2px 8px;cursor:pointer;border:1px solid #2196F3;border-radius:3px;background:#2196F3;color:#fff;font-weight:bold';
    btnUpdate.onclick = function() {
      _closePopup();
      webviewApi.postMessage({ type: 'refreshNoteSize' })
        .then(function(data) { if (data) _applyData(data, true); })
        .catch(function() {});
    };
    btnRow.appendChild(btnCancel);
    btnRow.appendChild(btnRecalc);
    btnRow.appendChild(btnUpdate);
    _popup.appendChild(btnRow);

    // \▼[CN=TOC_PANEL.TARGET_INPUT] // 目標文字数入力セクション
    var targetSection = document.createElement('div');
    targetSection.style.cssText = 'margin-top:10px;padding-top:8px;border-top:1px solid #ddd;white-space:normal';
    var targetLabel = document.createElement('div');
    targetLabel.textContent = '目標文字数:';
    targetLabel.style.cssText = 'font-size:11px;color:#666;margin-bottom:4px';
    targetSection.appendChild(targetLabel);
    var targetRow = document.createElement('div');
    targetRow.style.cssText = 'display:flex;gap:6px;align-items:center';
    var targetInput = document.createElement('input');
    targetInput.type = 'number';
    targetInput.min = '1';
    targetInput.value = _targetChars !== null ? String(_targetChars) : '';
    targetInput.placeholder = '例: 2000';
    targetInput.style.cssText = 'width:90px;font-size:11px;padding:2px 4px;border:1px solid #ccc;border-radius:3px;outline:none';
    var btnSetTarget = document.createElement('button');
    btnSetTarget.textContent = '設定';
    btnSetTarget.style.cssText = 'font-size:11px;padding:2px 8px;cursor:pointer;border:1px solid #9C27B0;border-radius:3px;background:#9C27B0;color:#fff;font-weight:bold';
    btnSetTarget.onclick = function() {
      var v = parseInt(targetInput.value, 10);
      if (!v || v <= 0) return;
      _closePopup();
      webviewApi.postMessage({ type: 'setTargetChars', targetChars: v })
        .then(function(data) { if (data) _applyData(data, true); })
        .catch(function() {});
    };
    var btnClearTarget = document.createElement('button');
    btnClearTarget.textContent = '解除';
    btnClearTarget.style.cssText = 'font-size:11px;padding:2px 8px;cursor:pointer;border:1px solid #999;border-radius:3px;background:#fff;color:#666';
    btnClearTarget.onclick = function() {
      _closePopup();
      webviewApi.postMessage({ type: 'setTargetChars', targetChars: 0 })
        .then(function(data) { if (data) _applyData(data, true); })
        .catch(function() {});
    };
    targetRow.appendChild(targetInput);
    targetRow.appendChild(btnSetTarget);
    targetRow.appendChild(btnClearTarget);
    targetSection.appendChild(targetRow);
    _popup.appendChild(targetSection);
    // \▲[CN=TOC_PANEL.TARGET_INPUT]

    // note-size-barの直下に配置
    var bar = document.getElementById('note-size-bar');
    var rect = bar ? bar.getBoundingClientRect() : { left: 8, bottom: 30 };
    _popup.style.left = rect.left + 'px';
    _popup.style.top  = (rect.bottom + 4) + 'px';
    document.documentElement.appendChild(_popup);
  }

  // ノートサイズバー描画
  var _currentNs = { str: '—', level: 'ok', chars: 0, ratio: 0 };
  function _renderNoteSize(ns) {
    _currentNs = ns;
    var bar = document.getElementById('note-size-bar');
    if (!bar) return;

    // 表示する実際の文字数（再計算済みならそちらを優先）
    var currentChars = (_recalcChars !== null) ? _recalcChars : ns.chars;

    // chars表示HTML（差分あり/なし）
    var charsHtml;
    if (_recalcChars !== null) {
      var diff = _recalcChars - ns.chars;
      var diffStr = (diff > 0 ? '+' : '') + diff.toLocaleString();
      var diffColor = diff > 0 ? '#4CAF50' : diff < 0 ? '#F44336' : '#999';
      charsHtml = _recalcChars.toLocaleString()
        + ' chars <span style="color:' + diffColor + ';font-weight:bold">(' + diffStr + ')</span>';
    } else {
      charsHtml = ns.chars.toLocaleString() + ' chars';
    }

    // 目標文字数モード: 達成率を付加
    if (_targetChars !== null && _targetChars > 0) {
      var pct = Math.min(Math.round(currentChars / _targetChars * 100), 100);
      var reached = currentChars >= _targetChars;
      charsHtml += ' / ' + _targetChars.toLocaleString()
        + ' <span style="color:' + (reached ? '#4CAF50' : '#999') + ';font-weight:bold">'
        + (reached ? '🎉' : '(' + pct + '%)')
        + '</span>';
    }

    var chars = '<span class="sz-chars">' + charsHtml + '</span>';
    bar.innerHTML =
      '<span class="sz-label">📄</span>' +
      '<span class="sz-' + ns.level + '">' + ns.str + '</span>' +
      chars +
      '<div id="sz-progress"></div>';

    // プログレスバー更新
    var prog = document.getElementById('sz-progress');
    if (prog) {
      if (_targetChars !== null && _targetChars > 0) {
        // 目標モード: 文字数ベース（青→達成で緑）
        var charRatio = Math.min(currentChars / _targetChars, 1.0);
        prog.style.width = (charRatio * 100).toFixed(1) + '%';
        prog.style.backgroundColor = (currentChars >= _targetChars) ? '#4CAF50' : '#2196F3';
      } else {
        // ファイルサイズモード（従来）
        var r = ns.ratio || 0;
        prog.style.width = (r * 100).toFixed(1) + '%';
        prog.style.backgroundColor = _barColor(r);
      }
    }

    // クリックでポップアップ
    bar.style.cursor = 'pointer';
    bar.onclick = function() { _showPopup(_currentNs.ratio, _currentNs.str, currentChars); };
  }

  // \▼[CN=TOC_PANEL.RENDER] // 膜一覧描画
  function renderList(membranes) {
    var list = document.getElementById('toc-list');
    if (!list) return;
    list.innerHTML = '';

    if (!membranes.length) {
      var empty = document.createElement('div');
      empty.style.cssText = 'padding:20px;color:#aaa;font-size:12px;text-align:center';
      empty.textContent = 'No membranes';
      list.appendChild(empty);
      return;
    }

    membranes.forEach(function(m) {
      var isActive = (m.cn === _activeCN);
      var row = document.createElement('div');
      row.className = 'toc-row' + (isActive ? ' active' : '');
      row.style.cssText = [
        'padding:5px 10px 5px ' + (8 + m.depth * 14) + 'px',
        'cursor:pointer',
        'border-left:3px solid ' + (isActive ? m.color : 'transparent'),
        'border-bottom:1px solid #f3f3f3',
        'display:flex','align-items:center','gap:5px',
        'background:' + (isActive ? '#e8f0fe' : 'transparent'),
        'font-size:12px','line-height:1.5','user-select:none'
      ].join(';');

      // CN名（膜の色で表示）
      var nameSpan = document.createElement('span');
      nameSpan.style.cssText = 'font-family:monospace;font-weight:bold;color:' + m.color
        + ';flex-shrink:0';
      nameSpan.textContent = m.cn;
      row.appendChild(nameSpan);

      // 🟢アクティブマーク（名前の後ろ）
      if (isActive) {
        var activeSpan = document.createElement('span');
        activeSpan.textContent = '🟢';
        activeSpan.style.cssText = 'font-size:0.9em;flex-shrink:0';
        row.appendChild(activeSpan);
      }

      // コメント
      if (m.comment) {
        var cmtSpan = document.createElement('span');
        cmtSpan.style.cssText = 'color:#999;font-size:0.85em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1';
        cmtSpan.textContent = '// ' + m.comment;
        row.appendChild(cmtSpan);
      }

      row.addEventListener('mouseenter', function() {
        if (!isActive) row.style.background = '#f5f5f5';
        row.style.borderLeftColor = m.color;
      });
      row.addEventListener('mouseleave', function() {
        row.style.background = isActive ? '#e8f0fe' : 'transparent';
        row.style.borderLeftColor = isActive ? m.color : 'transparent';
      });
      row.addEventListener('click', function() {
        webviewApi.postMessage({ type: 'tocClick', cn: m.cn });
      });

      list.appendChild(row);
    });
  }
  // \▲[CN=TOC_PANEL.RENDER]

}());
// \▲[CN=TOC_PANEL]
