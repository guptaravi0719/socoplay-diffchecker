(() => {
  const before = document.querySelector('#before-text');
  const after = document.querySelector('#after-text');
  const beforeCount = document.querySelector('#before-count');
  const afterCount = document.querySelector('#after-count');
  const ignoreSpace = document.querySelector('#ignore-space');
  const ignoreCase = document.querySelector('#ignore-case');
  const resultIgnoreSpace = document.querySelector('#result-ignore-space');
  const resultIgnoreCase = document.querySelector('#result-ignore-case');
  const hideUnchanged = document.querySelector('#hide-unchanged');
  const disableWrap = document.querySelector('#disable-wrap');
  const message = document.querySelector('#input-message');
  const workspace = document.querySelector('#workspace');
  const editorStage = document.querySelector('#editor-stage');
  const results = document.querySelector('#result-section');
  const output = document.querySelector('#diff-output');
  const summary = document.querySelector('#summary');
  const example = [
    'A good comparison tool should be quick and easy to use.',
    'It should make every meaningful change obvious.',
    'Your work stays private in the browser.',
  ];
  const revision = [
    'A great comparison tool should be quick and simple to use.',
    'It should make each meaningful change easy to find.',
    'Your work stays private on your device.',
    'No account is required.',
  ];

  const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
  const normalise = (line) => {
    let result = line;
    if (ignoreSpace.checked) result = result.replace(/\s+/g, ' ').trim();
    if (ignoreCase.checked) result = result.toLocaleLowerCase();
    return result;
  };
  const updateCounts = () => {
    beforeCount.textContent = `${before.value.length.toLocaleString()} character${before.value.length === 1 ? '' : 's'}`;
    afterCount.textContent = `${after.value.length.toLocaleString()} character${after.value.length === 1 ? '' : 's'}`;
  };
  const makeLcs = (first, second) => {
    const rows = first.length + 1;
    const columns = second.length + 1;
    const matrix = Array.from({ length: rows }, () => new Uint16Array(columns));
    for (let row = 1; row < rows; row += 1) {
      for (let column = 1; column < columns; column += 1) {
        matrix[row][column] = first[row - 1] === second[column - 1]
          ? matrix[row - 1][column - 1] + 1
          : Math.max(matrix[row - 1][column], matrix[row][column - 1]);
      }
    }
    const actions = [];
    let row = first.length;
    let column = second.length;
    while (row || column) {
      if (row && column && first[row - 1] === second[column - 1]) { actions.push({ type: 'same', first: row - 1, second: column - 1 }); row -= 1; column -= 1; }
      else if (column && (!row || matrix[row][column - 1] >= matrix[row - 1][column])) { actions.push({ type: 'add', second: column - 1 }); column -= 1; }
      else { actions.push({ type: 'remove', first: row - 1 }); row -= 1; }
    }
    return actions.reverse();
  };
  const renderCell = (lineNumber, text, type) => `<div class="diff-cell ${type ? `${type}-cell` : 'same-cell'}"><span class="line-number">${lineNumber || ''}</span><span class="line-text${text === '' ? ' empty' : ''}">${text === '' ? ' ' : escapeHtml(text)}</span></div>`;
  const compare = () => {
    message.textContent = '';
    if (!before.value.trim() && !after.value.trim()) { message.textContent = 'Add text to at least one box to compare.'; before.focus(); return; }
    const first = before.value.replace(/\r\n/g, '\n').split('\n');
    const second = after.value.replace(/\r\n/g, '\n').split('\n');
    const actions = makeLcs(first.map(normalise), second.map(normalise));
    const rows = [];
    let originalLine = 0;
    let revisedLine = 0;
    let removed = 0;
    let added = 0;
    for (let position = 0; position < actions.length; ) {
      if (actions[position].type === 'same') {
        const action = actions[position]; originalLine += 1; revisedLine += 1;
        rows.push(`<div class="diff-row same-row">${renderCell(originalLine, first[action.first])}${renderCell(revisedLine, second[action.second])}</div>`);
        position += 1; continue;
      }
      const removals = []; const additions = [];
      while (position < actions.length && actions[position].type !== 'same') { if (actions[position].type === 'remove') removals.push(actions[position]); else additions.push(actions[position]); position += 1; }
      const amount = Math.max(removals.length, additions.length);
      for (let index = 0; index < amount; index += 1) {
        const remove = removals[index]; const add = additions[index];
        if (remove) { originalLine += 1; removed += 1; }
        if (add) { revisedLine += 1; added += 1; }
        rows.push(`<div class="diff-row changed-row">${renderCell(remove ? originalLine : '', remove ? first[remove.first] : '', remove ? 'removed' : '')}${renderCell(add ? revisedLine : '', add ? second[add.second] : '', add ? 'added' : '')}</div>`);
      }
    }
    const same = actions.filter((action) => action.type === 'same').length;
    summary.innerHTML = `<span class="same">${same} unchanged line${same === 1 ? '' : 's'}</span><span class="removed">− ${removed} removed</span><span class="added">+ ${added} added</span>`;
    output.innerHTML = rows.join('');
    results.hidden = false;
    editorStage.hidden = true;
    workspace.classList.add('is-comparing');
    requestAnimationFrame(() => {
      const top = workspace.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      output.focus({ preventScroll: true });
    });
  };
  document.querySelectorAll('textarea').forEach((area) => area.addEventListener('input', updateCounts));
  document.querySelector('#compare').addEventListener('click', compare);
  document.querySelector('#swap').addEventListener('click', () => { const current = before.value; before.value = after.value; after.value = current; updateCounts(); });
  document.querySelectorAll('.clear-editor').forEach((button) => button.addEventListener('click', () => { const target = button.dataset.target === 'before' ? before : after; target.value = ''; target.focus(); updateCounts(); }));
  document.querySelectorAll('.example-button').forEach((button) => button.addEventListener('click', () => { const target = button.dataset.target === 'before' ? before : after; target.value = (button.dataset.target === 'before' ? example : revision).join('\n'); updateCounts(); target.focus(); }));
  document.querySelector('#clear-all').addEventListener('click', () => { before.value = ''; after.value = ''; results.hidden = true; editorStage.hidden = false; workspace.classList.remove('is-comparing'); message.textContent = ''; updateCounts(); before.focus(); });
  document.querySelector('#new-comparison').addEventListener('click', () => { results.hidden = true; editorStage.hidden = false; workspace.classList.remove('is-comparing'); before.focus(); });
  hideUnchanged.addEventListener('change', () => output.classList.toggle('hide-unchanged', hideUnchanged.checked));
  disableWrap.addEventListener('change', () => output.classList.toggle('disable-wrap', disableWrap.checked));
  resultIgnoreSpace.addEventListener('change', () => { ignoreSpace.checked = resultIgnoreSpace.checked; compare(); });
  resultIgnoreCase.addEventListener('change', () => { ignoreCase.checked = resultIgnoreCase.checked; compare(); });
  document.querySelector('#first-change').addEventListener('click', () => output.querySelector('.changed-row')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  document.querySelector('#copy-result').addEventListener('click', async (event) => { const text = summary.textContent.replace(/\s+/g, ' ').trim(); try { await navigator.clipboard.writeText(`SocoTools Diff Checker: ${text}`); event.currentTarget.textContent = 'Copied!'; setTimeout(() => { event.currentTarget.textContent = 'Copy summary'; }, 1300); } catch { event.currentTarget.textContent = 'Copy unavailable'; } });
  updateCounts();
})();
