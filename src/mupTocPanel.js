// \▼[CN=TOC_PANEL] // Fold Membrane - 膜目次パネル v1.1
// Joplin panels API webviewで動作。index.tsと双方向メッセージ通信。
// Pull: 600msごとにrequestTocでindex.tsから最新データを取得（確実）
// Push: updateToc受信でも即時更新（補助）
// 送信: tocClick { cn } → index.tsが_pendingTocCNを更新→mupFold.jsがポーリングで受取

(function() {
  'use strict';

  var _activeCN = null;
  var _lastKey = '';  // 変化なし時の再描画を防ぐ

  // \▼[CN=TOC_PANEL.RECEIVE] // Push受信: index.tsからpostMessageで来た場合（補助）
  webviewApi.onMessage(function(message) {
    if (message && message.type === 'updateToc') {
      _applyData(message);
    }
  });
  // \▲[CN=TOC_PANEL.RECEIVE]

  // \▼[CN=TOC_PANEL.POLL] // Pull: 600msごとにindex.tsから最新TOCデータを取得（確実）
  // パネル開時のレースコンディション（onMessage未登録）を回避するためポーリング方式を採用
  setInterval(function() {
    webviewApi.postMessage({ type: 'requestToc' })
      .then(function(data) {
        if (!data) return;
        _applyData(data);
      })
      .catch(function() {});
  }, 600);
  // \▲[CN=TOC_PANEL.POLL]

  function _applyData(data) {
    var key = JSON.stringify([data.membranes, data.activeCN]);
    if (key === _lastKey) return; // 変化なし → 描画スキップ
    _lastKey = key;
    _activeCN = data.activeCN || null;
    renderList(data.membranes || []);
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
