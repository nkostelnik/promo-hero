/* Promo Hero: UI. Renders the questionnaire, live legal flags, and the drafted rules. */
(function () {
  const NS = globalThis.PromoHero;
  const STORE = 'promo-hero-v1';
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const REVIEW = 'REVIEW';

  let answers = NS.defaults();
  let cur = null; // current question id, or REVIEW
  let path = []; // ids of questions already answered, in order

  function load() {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const saved = JSON.parse(raw);
        answers = Object.assign(NS.defaults(), saved.answers || {});
        cur = saved.cur || null;
        path = Array.isArray(saved.path) ? saved.path : [];
      }
    } catch (e) { /* storage unavailable: start fresh */ }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify({ answers, cur, path })); } catch (e) { /* ignore */ }
  }

  // ---------- field renderers
  function fieldHTML(q) {
    const v = answers[q.id];
    const name = 'f_' + q.id;
    const help = q.help ? '<p class="help">' + esc(q.help) + '</p>' : '';
    const req = q.required ? ' <span class="req" aria-label="required">*</span>' : '';
    let body = '';
    if (q.type === 'text' || q.type === 'date' || q.type === 'number') {
      const extra = q.type === 'number' ? ' min="' + (q.min || 0) + '"' : '';
      body = '<input type="' + q.type + '" id="' + name + '" data-q="' + q.id + '"' + extra + ' value="' + esc(v == null ? '' : v) + '"' + (q.placeholder ? ' placeholder="' + esc(q.placeholder) + '"' : '') + '>';
      return '<div class="q"><label for="' + name + '">' + esc(q.label) + req + '</label>' + help + body + '</div>';
    }
    if (q.type === 'textarea') {
      body = '<textarea id="' + name + '" data-q="' + q.id + '">' + esc(v || '') + '</textarea>';
      return '<div class="q"><label for="' + name + '">' + esc(q.label) + req + '</label>' + help + body + '</div>';
    }
    if (q.type === 'select') {
      const opts = (q.allowBlank ? '<option value="">Select...</option>' : '') + q.options.map((o) => '<option value="' + esc(o.value) + '"' + (v === o.value ? ' selected' : '') + '>' + esc(o.label) + '</option>').join('');
      body = '<select id="' + name + '" data-q="' + q.id + '">' + opts + '</select>';
      return '<div class="q"><label for="' + name + '">' + esc(q.label) + req + '</label>' + help + body + '</div>';
    }
    if (q.type === 'radio') {
      body = '<div class="opts">' + q.options.map((o) => '<label class="opt"><input type="radio" name="' + name + '" data-q="' + q.id + '" value="' + esc(o.value) + '"' + (v === o.value ? ' checked' : '') + '><span>' + esc(o.label) + (o.hint ? '<small>' + esc(o.hint) + '</small>' : '') + '</span></label>').join('') + '</div>';
      return '<fieldset class="q"><legend>' + esc(q.label) + req + '</legend>' + help + body + '</fieldset>';
    }
    if (q.type === 'multi') {
      const cur = v || [];
      body = '<div class="opts">' + q.options.map((o) => '<label class="opt"><input type="checkbox" data-multi="' + q.id + '" value="' + esc(o.value) + '"' + (cur.includes(o.value) ? ' checked' : '') + '><span>' + esc(o.label) + '</span></label>').join('') + '</div>';
      return '<fieldset class="q"><legend>' + esc(q.label) + req + '</legend>' + help + body + '</fieldset>';
    }
    if (q.type === 'states') {
      const cur = v || [];
      body = '<button type="button" class="btn ghost small" data-act="excl-reg">Exclude NY, FL, RI</button> <button type="button" class="btn ghost small" data-act="excl-clear">Clear</button>' +
        '<details class="states"' + (cur.length ? ' open' : '') + '><summary>' + cur.length + ' selected. Show all states</summary><div class="grid-states">' +
        q.options.map((o) => '<label><input type="checkbox" data-multi="' + q.id + '" value="' + esc(o.value) + '"' + (cur.includes(o.value) ? ' checked' : '') + '>' + esc(o.label) + '</label>').join('') + '</div></details>';
      return '<fieldset class="q"><legend>' + esc(q.label) + req + '</legend>' + help + body + '</fieldset>';
    }
    if (q.type === 'prizes') {
      const rows = (v || []).map((p, i) => '<div class="prize-row"><input type="text" data-prize="' + i + '" data-k="desc" value="' + esc(p.desc) + '" placeholder="e.g. 2-person kayak" aria-label="Prize description">' +
        '<input type="number" min="0" data-prize="' + i + '" data-k="qty" value="' + esc(p.qty) + '" aria-label="Quantity">' +
        '<input type="number" min="0" step="0.01" data-prize="' + i + '" data-k="arv" value="' + esc(p.arv) + '" aria-label="Retail value each">' +
        '<button type="button" class="btn ghost small" data-act="rm-prize" data-i="' + i + '" aria-label="Remove prize">x</button></div>').join('');
      body = '<div class="prize-head">Description, quantity, retail value each ($)</div>' + rows +
        '<button type="button" class="btn ghost small" data-act="add-prize">Add prize</button><div class="total" id="totalARV"></div>';
      return '<fieldset class="q"><legend>' + esc(q.label) + req + '</legend>' + help + body + '</fieldset>';
    }
    return '';
  }

  // ---------- flags panel
  function flagHTML(f) {
    const lvl = { stop: 'Likely illegal as designed', action: 'Legal requirement', note: 'Good practice' }[f.level];
    return '<div class="flag ' + f.level + '"><span class="lvl">' + lvl + '</span><b>' + esc(f.title) + '</b>' + esc(f.detail) + '<span class="lawyer">' + esc(f.note) + '</span></div>';
  }
  function renderFlags() {
    const flags = NS.evaluate(answers);
    const n = (l) => flags.filter((f) => f.level === l).length;
    $('flags').innerHTML = '<h2>Legal flags</h2><div class="counts"><span class="pill stop">' + n('stop') + ' stop</span><span class="pill action">' + n('action') + ' action</span><span class="pill note">' + n('note') + ' notes</span></div>' +
      (flags.length ? flags.map(flagHTML).join('') : '<div class="empty">No issues spotted yet. That does not mean the promotion is lawful. Consult a lawyer. This is not legal advice.</div>');
  }
  function updateTotal() {
    const el = $('totalARV');
    if (el) el.textContent = 'Total prize value: ' + NS.usd(NS.totalARV(answers.prizes));
  }

  // ---------- decision tree: one question at a time
  const qById = (id) => NS.QUESTIONS.find((q) => q.id === id);

  function answerText(q) {
    const v = answers[q.id];
    const label = (val) => ((q.options || []).find((o) => o.value === val) || {}).label || val;
    if (q.type === 'multi') return (v || []).length ? v.map(label).join(', ') : 'None';
    if (q.type === 'states') return (v || []).length ? v.length + ' excluded' : 'None excluded';
    if (q.type === 'prizes') return NS.usd(NS.totalARV(v)) + ' total value';
    if (q.type === 'radio' || q.type === 'select') return v ? label(v) : '(blank)';
    return v === undefined || v === '' ? '(blank)' : String(v);
  }

  function canAdvance(q) {
    return !NS.missingRequired(answers).some((m) => m.id === q.id);
  }

  function renderPath() {
    const rows = path.map((id) => qById(id)).filter(Boolean).map((q) =>
      '<button type="button" class="step done" data-jump="' + q.id + '"><span class="n">&#10003;</span><span class="pq">' + esc(q.label) + '<small>' + esc(answerText(q)) + '</small></span></button>');
    const now = cur === REVIEW ? '<div class="step active"><span class="n">*</span><span class="pq">Review and terms</span></div>'
      : (qById(cur) ? '<div class="step active"><span class="n">&gt;</span><span class="pq">' + esc(qById(cur).label) + '</span></div>' : '');
    $('steps').innerHTML = '<div class="path-title">Your path</div>' + rows.join('') + now;
  }

  function renderQuestion() {
    const q = qById(cur);
    const fl = NS.flow(answers);
    const idx = fl.findIndex((x) => x.id === cur);
    const total = path.length + (idx < 0 ? 1 : fl.length - idx);
    const sec = NS.SECTIONS.find((x) => x.id === q.section);
    const last = idx >= 0 && idx === fl.length - 1;
    $('main').innerHTML = '<div class="progress"><span>' + esc(sec.title) + '</span><span>Question ' + (path.length + 1) + ' of about ' + total + '</span></div>' +
      '<div class="bar"><i style="width:' + Math.round(((path.length + 1) / total) * 100) + '%"></i></div>' +
      fieldHTML(q) +
      (q.why ? '<div class="why"><b>Why we ask.</b> ' + esc(q.why) + '</div>' : '') +
      '<div class="nav-row"><button type="button" class="btn ghost" data-act="back"' + (path.length ? '' : ' disabled') + '>Back</button>' +
      '<button type="button" class="btn" data-act="next"' + (canAdvance(q) ? '' : ' disabled') + '>' + (last ? 'Draft my terms' : 'Next') + '</button></div>';
    updateTotal();
    const first = $('main').querySelector('input[type=text], input[type=date], input[type=number], textarea, select');
    if (first && document.activeElement === document.body) first.focus();
  }

  function nextId() {
    const fl = NS.flow(answers);
    const idx = fl.findIndex((x) => x.id === cur);
    return idx >= 0 && idx + 1 < fl.length ? fl[idx + 1].id : REVIEW;
  }

  // ---------- review and export
  function termsHTML(doc) {
    let n = 0;
    const ph = (s) => esc(s).replace(/\[([A-Z][^\]]*)\]/g, '<span class="ph">[$1]</span>');
    let html = '<h1>' + esc(doc.title) + '</h1>';
    doc.sections.forEach((s) => {
      if (s.title) html += '<h3>' + ++n + '. ' + esc(s.title) + '</h3>';
      s.blocks.forEach((b) => {
        if (b.caps) html += '<p class="caps">' + ph(b.caps) + '</p>';
        else if (b.p) html += '<p>' + ph(b.p) + '</p>';
        else if (b.ul) html += '<ul>' + b.ul.map((i) => '<li>' + ph(i) + '</li>').join('') + '</ul>';
        else if (b.table) html += '<table><tr>' + b.table.head.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr>' + b.table.rows.map((r) => '<tr>' + r.map((c) => '<td>' + ph(c) + '</td>').join('') + '</tr>').join('') + '</table>';
      });
    });
    return html;
  }

  function renderReview() {
    const structure = NS.classify(answers);
    const doc = NS.generateTerms(answers);
    const missing = NS.missingRequired(answers);
    const el = (label, on) => '<span class="el ' + (on ? 'on' : 'off') + '">' + label + ': ' + (on ? 'yes' : 'no') + '</span>';
    let html = '<h1>Review and terms</h1><p class="blurb">The structure below is what your answers add up to. Resolve every stop flag before using the draft.</p>';
    html += '<div class="structure"><h3>' + esc(structure.label) + '</h3><div class="elements">' + el('Prize', true) + el('Chance', structure.chance) + el('Payment or effort', structure.consideration) + '</div><div>' + esc(structure.detail) + '</div></div>';
    if (doc.stops.length) {
      html += '<div class="warnbox"><b>' + doc.stops.length + ' unresolved stop issue(s).</b> The draft below is not usable as is.<ul>' + doc.stops.map((f) => '<li>' + esc(f.title) + '</li>').join('') + '</ul></div>';
    }
    if (missing.length) {
      html += '<div class="warnbox"><b>Missing required answers:</b> ' + missing.map((q) => esc(q.label)).join('; ') + '. They appear as highlighted placeholders.</div>';
    }
    html += '<div class="export"><button type="button" class="btn" data-act="doc">Download Word (.doc)</button><button type="button" class="btn ghost" data-act="copy">Copy text</button><button type="button" class="btn ghost" data-act="print">Print or save PDF</button><button type="button" class="btn ghost" data-act="back">Back to questions</button></div>';
    if (doc.placeholders.length) {
      html += '<p class="help review-extra">Fill in before publishing: ' + doc.placeholders.map((p) => '[' + esc(p) + ']').join(', ') + '</p>';
    }
    html += '<div class="terms" id="terms">' + termsHTML(doc) + '</div>';
    $('main').innerHTML = html;
  }

  function coverHTML(doc) {
    const flags = NS.evaluate(answers);
    return '<div style="border:2px solid #b3261e;padding:12px;font-family:Arial,sans-serif;font-size:11pt">' +
      '<p><b>READ FIRST AND DELETE THIS PAGE BEFORE PUBLISHING.</b></p>' +
      '<p>This draft was generated by an automated tool. It is not legal advice and is not a substitute for a licensed attorney. Promotion laws differ by state and change often. Have a lawyer review and approve these rules before you launch.</p>' +
      '<p><b>Legal flags (' + flags.length + ')</b></p><ul>' + flags.map((f) => '<li><b>[' + f.level.toUpperCase() + '] ' + esc(f.title) + '.</b> ' + esc(f.detail) + '</li>').join('') + '</ul>' +
      (doc.placeholders.length ? '<p><b>Fill in:</b> ' + doc.placeholders.map((p) => '[' + esc(p) + ']').join(', ') + '</p>' : '') + '</div><br style="page-break-before:always">';
  }

  function downloadDoc() {
    const doc = NS.generateTerms(answers);
    const inner = termsHTML(doc).replace(/<span class="ph">/g, '<span style="background:#fff2a8">');
    const html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>' + esc(doc.title) + '</title></head><body style="font-family:Georgia,serif;font-size:11pt">' + coverHTML(doc) + inner + '</body></html>';
    const blob = new Blob(['﻿', html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (answers.promoName || 'promotion').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() + '-official-rules-DRAFT.doc';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }

  // ---------- render loop and events
  function render() {
    if (cur !== REVIEW && !qById(cur)) { cur = NS.flow(answers)[0].id; path = []; }
    save();
    
    renderPath();
    if (cur === REVIEW) renderReview(); else renderQuestion();
    renderFlags();
  }

  function refreshNext() {
    const b = $('main').querySelector('[data-act="next"]');
    if (b && qById(cur)) b.disabled = !canAdvance(qById(cur));
  }

  function next() {
    const q = qById(cur);
    if (!q || !canAdvance(q)) return;
    if (path[path.length - 1] !== cur) path.push(cur);
    cur = nextId();
    render();
    window.scrollTo({ top: 0 });
  }

  function back() {
    if (cur === REVIEW || path.length) {
      cur = path.pop() || cur;
      render();
      window.scrollTo({ top: 0 });
    }
  }

  function jump(id) {
    const i = path.indexOf(id);
    if (i < 0) return;
    path = path.slice(0, i);
    cur = id;
    render();
  }

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.q && ['text', 'textarea', 'number', 'date'].includes(t.type === 'textarea' ? 'textarea' : t.type)) {
      answers[t.dataset.q] = t.type === 'number' ? (t.value === '' ? '' : Number(t.value)) : t.value;
    } else if (t.dataset.prize !== undefined) {
      const p = answers.prizes[Number(t.dataset.prize)];
      p[t.dataset.k] = t.dataset.k === 'desc' ? t.value : Number(t.value) || 0;
      updateTotal();
    } else {
      return;
    }
    save();
    renderFlags();
    refreshNext();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input[type=text], input[type=date], input[type=number]') && !e.target.dataset.prize) { e.preventDefault(); next(); }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.multi) {
      const cur = new Set(answers[t.dataset.multi] || []);
      if (t.checked) cur.add(t.value); else cur.delete(t.value);
      answers[t.dataset.multi] = Array.from(cur);
      render();
    } else if (t.type === 'radio' && t.dataset.q) {
      answers[t.dataset.q] = t.value;
      render();
    } else if (t.tagName === 'SELECT' && t.dataset.q) {
      answers[t.dataset.q] = t.value;
      render();
    }
    // Text-like fields are handled on 'input'. Re-rendering on blur would swallow the click on Next.
  });

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act], [data-jump]');
    if (!b) return;
    if (b.dataset.jump) return jump(b.dataset.jump);
    const act = b.dataset.act;
    if (act === 'next') next();
    else if (act === 'back') back();
    else if (act === 'add-prize') { answers.prizes.push({ desc: '', qty: 1, arv: 0 }); render(); }
    else if (act === 'rm-prize') { answers.prizes.splice(Number(b.dataset.i), 1); if (!answers.prizes.length) answers.prizes.push({ desc: '', qty: 1, arv: 0 }); render(); }
    else if (act === 'excl-reg') { answers.excludedStates = Array.from(new Set((answers.excludedStates || []).concat(['NY', 'FL', 'RI']))); render(); }
    else if (act === 'excl-clear') { answers.excludedStates = []; render(); }
    else if (act === 'doc') downloadDoc();
    else if (act === 'print') window.print();
    else if (act === 'copy') {
      const text = NS.termsToText(NS.generateTerms(answers));
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast('Rules copied'), () => toast('Copy failed. Select the text manually.'));
    }
  });

  $('reset').addEventListener('click', () => {
    if (!window.confirm('Clear all answers and start over?')) return;
    answers = NS.defaults();
    path = [];
    cur = NS.flow(answers)[0].id;
    render();
  });

  // Carnival mode is the default; the toggle switches to a plain theme and remembers the choice.
  function syncThemeButton() {
    const plain = document.documentElement.dataset.theme === 'plain';
    $('theme').textContent = 'Carnival mode: ' + (plain ? 'off' : 'on');
    $('theme').setAttribute('aria-pressed', String(!plain));
  }
  $('theme').addEventListener('click', () => {
    const plain = document.documentElement.dataset.theme !== 'plain';
    if (plain) document.documentElement.dataset.theme = 'plain'; else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('promo-hero-theme', plain ? 'plain' : 'carnival'); } catch (e) { /* ignore */ }
    syncThemeButton();
  });
  syncThemeButton();

  load();
  if (!cur) cur = NS.flow(answers)[0].id;
  render();
})();
