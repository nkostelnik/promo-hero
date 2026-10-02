// Run: node test/engine.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
require('../js/questions.js');
require('../js/review.js');
require('../js/flags.js');
const NS = require('../js/clauses.js');

const TODAY = new Date(2026, 8, 19);
const base = () => Object.assign(NS.defaults(), {
  sponsorName: 'Acme Widgets, Inc.', sponsorAddress: '1 Main St, Springfield, IL 62701', sponsorState: 'IL',
  promoName: 'Summer Splash', startDate: '2026-12-01', endDate: '2026-12-31', privacyUrl: 'https://acme.com/privacy',
  prizes: [{ desc: 'Kayak', qty: 1, arv: 400 }],
});
const ids = (a) => NS.evaluate(a, { today: TODAY }).map((f) => f.id);
let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log('ok  ' + name); };

t('no-purchase sweepstakes has no stop flags and NPN language', () => {
  const a = base();
  assert.strictEqual(NS.evaluate(a, { today: TODAY }).filter((f) => f.level === 'stop').length, 0);
  const txt = NS.termsToText(NS.generateTerms(a));
  assert.ok(txt.includes('NO PURCHASE OR PAYMENT OF ANY KIND IS NECESSARY'));
  assert.ok(txt.includes('Kayak'));
});

t('purchase + random + no AMOE is an illegal lottery stop', () => {
  const a = Object.assign(base(), { consideration: 'purchase', hasAmoe: 'no' });
  assert.ok(ids(a).includes('LOTTERY'));
  assert.ok(NS.classify(a).lottery);
  assert.ok(NS.generateTerms(a).placeholders.some((p) => p.startsWith('UNRESOLVED')));
});

t('adding a free AMOE clears the lottery flag', () => {
  const a = Object.assign(base(), { consideration: 'purchase', hasAmoe: 'yes', amoeMethod: 'both' });
  assert.ok(!ids(a).includes('LOTTERY'));
  const txt = NS.termsToText(NS.generateTerms(a));
  assert.ok(txt.includes('FREE METHOD OF ENTRY'));
});

t('judged contest with purchase is not a lottery', () => {
  const a = Object.assign(base(), { determination: 'judged', consideration: 'purchase', judgingCriteria: 'Creativity 100%' });
  assert.ok(!ids(a).includes('LOTTERY'));
  assert.ok(NS.termsToText(NS.generateTerms(a)).includes('CONTEST OF SKILL'));
});

t('missing judging criteria is flagged', () => {
  assert.ok(ids(Object.assign(base(), { determination: 'judged' })).includes('CRITERIA'));
});

t('registration triggers at $5,000+ and excluding NY/FL removes them', () => {
  const a = Object.assign(base(), { prizes: [{ desc: 'Car', qty: 1, arv: 30000 }], startDate: '2027-03-01', endDate: '2027-03-31' });
  const f = ids(a);
  assert.ok(f.includes('REG_NY') && f.includes('REG_FL'));
  a.excludedStates = ['NY', 'FL'];
  const g = ids(a);
  assert.ok(!g.includes('REG_NY') && !g.includes('REG_FL'));
});

t('short runway for NY registration is a stop', () => {
  const a = Object.assign(base(), { prizes: [{ desc: 'Car', qty: 1, arv: 30000 }], startDate: '2026-09-25' });
  assert.ok(ids(a).includes('NY_DEADLINE'));
});

t('RI applies to purchase-linked drawings over $500', () => {
  const a = Object.assign(base(), { consideration: 'purchase', hasAmoe: 'yes', prizes: [{ desc: 'TV', qty: 1, arv: 900 }] });
  assert.ok(ids(a).includes('REG_RI'));
});

t('RI applies to any chance-based promotion over $500, not to skill contests, small prizes or excluded RI', () => {
  const chance = Object.assign(base(), { prizes: [{ desc: 'TV', qty: 1, arv: 900 }] });
  assert.ok(ids(chance).includes('REG_RI'), 'no purchase needed');
  assert.ok(ids(Object.assign({}, chance, { determination: 'votes', voteMethod: 'x' })).includes('REG_RI'));
  assert.ok(!ids(Object.assign({}, chance, { prizes: [{ desc: 'Mug', qty: 1, arv: 400 }] })).includes('REG_RI'));
  assert.ok(!ids(Object.assign({}, chance, { excludedStates: ['RI'] })).includes('REG_RI'));
  assert.ok(!ids(Object.assign({}, chance, { determination: 'judged', judgingCriteria: 'Creativity' })).includes('REG_RI'));
  const flag = NS.evaluate(chance, { today: TODAY }).find((f) => f.id === 'REG_RI');
  assert.ok(flag.detail.includes('$150') && flag.detail.includes('winners list'));
});

t('AZ, HI and NJ flags fire on their triggers and respect exclusions', () => {
  const az = Object.assign(base(), { determination: 'judged', judgingCriteria: 'Creativity', consideration: 'purchase' });
  assert.ok(ids(az).includes('AZ_CONTEST'));
  assert.ok(!ids(Object.assign({}, az, { excludedStates: ['AZ'] })).includes('AZ_CONTEST'));
  assert.ok(!ids(Object.assign({}, az, { consideration: 'none' })).includes('AZ_CONTEST'));

  const hi = Object.assign(base(), { prizeTypes: ['goods', 'realproperty'] });
  assert.ok(ids(hi).includes('HI_REALTY'));
  assert.ok(!ids(Object.assign({}, hi, { excludedStates: ['HI'] })).includes('HI_REALTY'));
  assert.ok(!ids(base()).includes('HI_REALTY'));

  const nj = Object.assign(base(), { consideration: 'purchase', hasAmoe: 'yes' });
  assert.ok(ids(nj).includes('NJ_PAID'));
  assert.ok(!ids(Object.assign({}, nj, { excludedStates: ['NJ'] })).includes('NJ_PAID'));
  assert.ok(!ids(Object.assign({}, nj, { hasAmoe: 'no' })).includes('NJ_PAID'), 'no AMOE is already a lottery stop');
  assert.ok(!ids(Object.assign({}, nj, { determination: 'judged', judgingCriteria: 'x' })).includes('NJ_PAID'));
  const fee = NS.evaluate(Object.assign({}, nj, { consideration: 'fee' }), { today: TODAY }).find((f) => f.id === 'NJ_PAID');
  assert.ok(fee.detail.includes('entry fee is not a purchase'));
});

t('state-specific notices are drafted only when their flag fires', () => {
  const text = (a) => NS.termsToText(NS.generateTerms(a));
  assert.ok(!text(base()).includes('State-Specific Notices'), 'a plain promotion has no state notices');

  const nj = Object.assign(base(), { consideration: 'purchase', hasAmoe: 'yes' });
  assert.ok(text(nj).includes('New Jersey: The odds of winning any prize are identical'));
  assert.ok(!text(Object.assign({}, nj, { excludedStates: ['NJ'] })).includes('New Jersey:'));

  const az = Object.assign(base(), { determination: 'judged', judgingCriteria: 'Creativity', consideration: 'purchase' });
  assert.ok(text(az).includes('Arizona: No increment has been added'));

  const hi = Object.assign(base(), { prizeTypes: ['goods', 'realproperty'] });
  const hiTerms = NS.generateTerms(hi);
  assert.ok(NS.termsToText(hiTerms).includes('Hawaii: A bond of not less than $10,000'));
  assert.ok(hiTerms.placeholders.includes('HAWAII BOND NUMBER'));

  const forfeit = Object.assign(base(), { unclaimed: 'forfeit' });
  assert.ok(text(forfeit).includes('Hawaii: Some or all prizes may not be awarded'));
  assert.ok(!text(Object.assign({}, forfeit, { excludedStates: ['HI'] })).includes('Hawaii:'));

  const ri = Object.assign(base(), { prizes: [{ desc: 'TV', qty: 1, arv: 900 }] });
  const riTerms = NS.generateTerms(ri);
  assert.ok(NS.termsToText(riTerms).includes('Rhode Island: A statement for this game of chance has been filed'));
  assert.ok(!riTerms.placeholders.some((p) => /RHODE ISLAND/.test(p)));
});

t('flags that rest on an unresolved question are marked for attorney review, with a reason', () => {
  const find = (a, id) => NS.evaluate(a, { today: TODAY }).find((f) => f.id === id);
  const ri = find(Object.assign(base(), { prizes: [{ desc: 'TV', qty: 1, arv: 900 }] }), 'REG_RI');
  assert.ok(ri.review && ri.review.reason && ri.review.ref === 'D01');
  assert.ok(find(Object.assign(base(), { consideration: 'purchase', hasAmoe: 'yes' }), 'NJ_PAID').review);
  // LOTTERY is only marked when the trigger is the unsourced effort default, not for a plain purchase requirement.
  assert.ok(!find(Object.assign(base(), { consideration: 'purchase', hasAmoe: 'no' }), 'LOTTERY').review);
  assert.ok(find(Object.assign(base(), { consideration: 'effort', hasAmoe: 'no' }), 'LOTTERY').review);
  // A flag resting on a verified, settled point carries no marker.
  const coppa = find(Object.assign(base(), { minAge: 'u13' }), 'COPPA');
  assert.ok(coppa && !coppa.review);
  assert.strictEqual(NS.REVIEW_LABEL, 'Recommended for attorney review');
});

t('open state questions raise a review note only when they apply, and take no side', () => {
  const ids2 = (o) => NS.evaluate(Object.assign(base(), o), { today: TODAY });
  const has2 = (o, id) => ids2(o).some((f) => f.id === id);
  // Connecticut: a chance promotion with no purchase link, unless excluded.
  assert.ok(has2({}, 'CT_REVIEW'));
  assert.ok(!has2({ excludedStates: ['CT'] }, 'CT_REVIEW'));
  assert.ok(!has2({ consideration: 'purchase', hasAmoe: 'yes' }, 'CT_REVIEW'));
  assert.ok(!has2({ determination: 'judged', judgingCriteria: 'x' }, 'CT_REVIEW'));
  // Massachusetts and Georgia: payment-linked chance promotions.
  assert.ok(has2({ consideration: 'purchase', hasAmoe: 'yes' }, 'MA_REVIEW') && !has2({ consideration: 'purchase', hasAmoe: 'yes', excludedStates: ['MA'] }, 'MA_REVIEW'));
  assert.ok(has2({ consideration: 'purchase', hasAmoe: 'yes' }, 'GA_REVIEW') && !has2({}, 'GA_REVIEW'));
  // Idaho and Vermont: a required payment with no free route (or any judged contest with payment).
  assert.ok(has2({ consideration: 'purchase', hasAmoe: 'no' }, 'ID_VT_FEES'));
  assert.ok(has2({ determination: 'judged', judgingCriteria: 'x', consideration: 'fee' }, 'ID_VT_FEES'));
  assert.ok(!has2({ consideration: 'purchase', hasAmoe: 'yes' }, 'ID_VT_FEES'));
  assert.ok(!has2({ consideration: 'purchase', hasAmoe: 'no', excludedStates: ['ID', 'VT'] }, 'ID_VT_FEES'));
  assert.ok(ids2({ consideration: 'fee', determination: 'judged', judgingCriteria: 'x', excludedStates: ['VT'] }).find((f) => f.id === 'ID_VT_FEES').detail.includes('Idaho'));
  // Louisiana and Kentucky: promotions by text. Prize notices: any required payment.
  assert.ok(has2({ smsUsed: 'yes' }, 'LA_KY_REVIEW') && !has2({ smsUsed: 'yes', excludedStates: ['LA', 'KY'] }, 'LA_KY_REVIEW') && !has2({}, 'LA_KY_REVIEW'));
  assert.ok(has2({ consideration: 'fee' }, 'PRIZE_NOTICE') && !has2({}, 'PRIZE_NOTICE'));
  // Every one of them is marked, states the question as unresolved, and does not pick an outcome.
  ['CT_REVIEW', 'MA_REVIEW', 'GA_REVIEW', 'ID_VT_FEES', 'LA_KY_REVIEW', 'PRIZE_NOTICE'].forEach((id) => {
    const f = NS.evaluate(Object.assign(base(), { consideration: 'purchase', hasAmoe: 'no', smsUsed: 'yes' }), { today: TODAY }).find((x) => x.id === id) ||
      NS.evaluate(base(), { today: TODAY }).find((x) => x.id === id);
    assert.ok(f, id + ' should fire in one of the probe scenarios');
    assert.strictEqual(f.level, 'note');
    assert.ok(f.review, id + ' must be marked for attorney review');
    assert.ok(/attorney review/.test(f.detail), id + ' text must recommend attorney review');
  });
});

t('review registry entries point at real flags and real states, with reasons and tracking ids', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'flags.js'), 'utf8');
  const flagIds = [...src.matchAll(/add\('([A-Z_]+)'/g)].map((m) => m[1]);
  const isRef = (r) => /^D[0-9]{2}$/.test(r);
  Object.entries(NS.REVIEW_FLAGS).forEach(([id, r]) => {
    assert.ok(flagIds.includes(id), id + ' is not a flag');
    assert.ok(r.reason && r.reason.length > 20, id + ' needs a reason');
    assert.ok(r.ref === null || isRef(r.ref), id + ' has a malformed tracking id ' + r.ref);
  });
  require('../js/states.js'); require('../js/states2.js'); require('../js/states3.js');
  Object.entries(NS.REVIEW_STATES).forEach(([code, r]) => {
    assert.ok(NS.STATE_SURVEY[code], code + ' is not in the survey');
    assert.ok(r.reason && isRef(r.ref), code + ' needs a reason and a tracking id');
  });
});

t('page has the tagline, a visible description, and social metadata that points at a real image', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const tagline = 'Sweepstakes and contests and giveaways, ';
  assert.ok(html.includes('<title>Promo Hero: ' + tagline + 'oh my!</title>'));
  assert.ok(html.includes('class="tagline">' + tagline + '<em>oh my!</em>'), 'visible tagline');
  assert.ok(/<section class="intro"[\s\S]*Promo Hero asks a few questions[\s\S]*<\/section>/.test(html), 'visible description');
  ['og:image', 'twitter:image'].forEach((k) => assert.ok(new RegExp('(property|name)="' + k + '" content="https://[^"]+/assets/social\\.png"').test(html), k + ' must be an absolute URL'));
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  assert.ok(html.includes('property="og:image:width" content="1280"') && html.includes('property="og:image:height" content="640"'));
  const png = fs.readFileSync(path.join(__dirname, '..', 'assets', 'social.png'));
  assert.strictEqual(png.slice(1, 4).toString(), 'PNG');
  assert.strictEqual(png.readUInt32BE(16), 1280, 'social image width');
  assert.strictEqual(png.readUInt32BE(20), 640, 'social image height');
  assert.ok(fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8').includes('**' + tagline + 'oh my!**'), 'README tagline');
});

t('the published site contains what the app loads and none of the internal material', () => {
  const os = require('os');
  const { build, localRefs } = require('../scripts/build-site.js');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'promo-hero-site-'));
  try {
    const { files } = build(dir);
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    localRefs(html).forEach((r) => assert.ok(fs.existsSync(path.join(dir, r)), r + ' is loaded by index.html but missing from the site'));
    ['index.html', 'assets/social.png', 'robots.txt', 'sitemap.xml', 'llms.txt', '.nojekyll'].forEach((f) => assert.ok(fs.existsSync(path.join(dir, f)), f + ' missing'));
    ['docs', 'scripts', 'test', 'README.md', 'js/sources.js', 'package.json', 'assets/social.html'].forEach((f) => assert.ok(!fs.existsSync(path.join(dir, f)), f + ' must not be published'));
    assert.ok(files.length >= 14, 'unexpectedly small site');
    // every runtime script the page needs is present, so the deployed app cannot load half a tool
    ['questions', 'review', 'flags', 'clauses', 'states', 'states2', 'states3', 'coverage', 'app'].forEach((n) => assert.ok(fs.existsSync(path.join(dir, 'js', n + '.js')), 'js/' + n + '.js missing'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  const wf = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'pages.yml'), 'utf8');
  assert.ok(wf.includes('node test/engine.test.js') && wf.includes('deploy-pages') && wf.includes('build-site.js'));
});

t('user-visible survey text has no first-person or self-correction wording', () => {
  ['js/states.js', 'js/states2.js', 'js/states3.js', 'js/flags.js', 'js/review.js', 'js/coverage.js', 'js/questions.js', 'js/clauses.js'].forEach((f) => {
    const src = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    assert.ok(!/\bMy (earlier|attempt|citation)|\bmy (earlier|attempt|citation)|earlier citation/.test(src), f + ' contains self-referential wording');
  });
});

t('age of majority note fires for an 18+ minimum unless AL and NE are both excluded', () => {
  assert.ok(ids(base()).includes('AGE_MAJORITY'));
  assert.ok(ids(Object.assign(base(), { excludedStates: ['AL'] })).includes('AGE_MAJORITY'));
  assert.ok(!ids(Object.assign(base(), { excludedStates: ['AL', 'NE'] })).includes('AGE_MAJORITY'));
  assert.ok(!ids(Object.assign(base(), { minAge: '21' })).includes('AGE_MAJORITY'));
});

t('reworded flags keep only what the sources support', () => {
  const eff = NS.evaluate(Object.assign(base(), { consideration: 'effort', hasAmoe: 'no' }), { today: TODAY });
  assert.strictEqual(eff.find((f) => f.id === 'EFFORT').level, 'note');
  assert.ok(eff.some((f) => f.id === 'LOTTERY'), 'effort without a free route is still a conservative lottery stop');
  const fc = NS.evaluate(Object.assign(base(), { determination: 'firstcome', firstcomeRule: 'x', consideration: 'purchase' }), { today: TODAY });
  assert.ok(fc.find((f) => f.id === 'FIRSTCOME_PAY').detail.includes('New Mexico'));
  const mk = NS.evaluate(Object.assign(base(), { marketing: 'required' }), { today: TODAY }).find((f) => f.id === 'MARKETING_REQUIRED');
  assert.ok(!mk.detail.includes('CAN-SPAM'), 'CAN-SPAM has no consent requirement, so it must not be cited for consent validity');
});

t('state notes list only eligible states, registration states first', () => {
  require('../js/states.js');
  require('../js/states2.js');
  require('../js/states3.js');
  require('../js/coverage.js');
  const all = NS.stateNotes([]);
  assert.strictEqual(all.length, 51);
  assert.deepStrictEqual(all.slice(0, 3).map((s) => s.code), ['FL', 'NY', 'RI']);
  assert.deepStrictEqual(all.slice(3, 8).map((s) => s.code), ['AZ', 'HI', 'LA', 'MD', 'MO']);
  const ex = NS.stateNotes(['NY', 'FL', 'RI', 'AZ']);
  assert.strictEqual(ex.length, 47);
  assert.ok(!ex.some((s) => ['NY', 'FL', 'RI', 'AZ'].includes(s.code)));
  all.forEach((s) => assert.ok(s.findings.length > 0 && s.name, s.code + ' has no findings'));
});

t('under-13, winner-pays, cannabis, and alcohol under 21 are stops', () => {
  assert.ok(ids(Object.assign(base(), { minAge: 'u13' })).includes('COPPA'));
  assert.ok(ids(Object.assign(base(), { winnerPays: 'yes' })).includes('WINNER_PAYS'));
  assert.ok(ids(Object.assign(base(), { restricted: ['cannabis'] })).includes('CANNABIS'));
  assert.ok(ids(Object.assign(base(), { restricted: ['alcohol'], minAge: '18' })).includes('ALCOHOL_AGE'));
});

t('Facebook share/tag entry is flagged', () => {
  const a = Object.assign(base(), { entryChannels: ['social'], platforms: ['facebook'], socialActions: ['share'] });
  assert.ok(ids(a).includes('FB_RULES'));
  assert.ok(NS.termsToText(NS.generateTerms(a)).includes('SOCIAL MEDIA PLATFORMS'));
});

t('every flag carries the lawyer and not-legal-advice note', () => {
  const a = Object.assign(base(), { consideration: 'purchase', minAge: 'u13' });
  NS.evaluate(a, { today: TODAY }).forEach((f) => assert.ok(/attorney/i.test(f.note) && /not legal advice/i.test(f.note)));
});

t('arbitration switches the dispute clause', () => {
  const txt = NS.termsToText(NS.generateTerms(Object.assign(base(), { disputeResolution: 'arbitration' })));
  assert.ok(txt.includes('CLASS ACTION WAIVER') && txt.includes('opt out of arbitration'));
});

t('missing required fields are reported and become placeholders', () => {
  const a = NS.defaults();
  assert.ok(NS.missingRequired(a).length > 0);
  assert.ok(NS.generateTerms(a).placeholders.includes('SPONSOR NAME'));
});

t('interview flow branches on answers', () => {
  const a = base();
  const f = () => NS.flow(a).map((q) => q.id);
  assert.strictEqual(f()[0], 'determination');
  assert.ok(!f().includes('hasAmoe') && !f().includes('judgingCriteria'));
  a.consideration = 'purchase';
  assert.ok(f().includes('hasAmoe'));
  a.hasAmoe = 'yes';
  assert.ok(f().includes('amoeMethod'));
  a.determination = 'judged';
  assert.ok(f().includes('judgingCriteria') && f().includes('submissionType') && !f().includes('drawDays'));
  assert.strictEqual(f()[f().length - 1], 'website');
});

t('no em-dashes anywhere in the source', () => {
  ['js/questions.js', 'js/flags.js', 'js/clauses.js', 'js/app.js', 'index.html', 'css/style.css'].forEach((f) => {
    const p = path.join(__dirname, '..', f);
    if (fs.existsSync(p)) assert.ok(!fs.readFileSync(p, 'utf8').includes('—'), f + ' contains an em-dash');
  });
});

t('every flag id is tracked in the source registry with a well-formed record', () => {
  require('../js/sources.js');
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'flags.js'), 'utf8');
  const flagIds = [...src.matchAll(/add\('([A-Z_]+)'/g)].map((m) => m[1]);
  assert.ok(flagIds.length > 30, 'flag id scan looks broken');
  flagIds.forEach((id) => {
    assert.ok(NS.NO_LEGAL_CLAIM.includes(id) || NS.sourcesFor(id).length > 0, id + ' has no source record');
  });
  NS.SOURCES.forEach((s) => {
    assert.ok(['verified', 'partial', 'incorrect', 'unchecked'].includes(s.status), s.id + ' has a bad status');
    if (s.status !== 'unchecked') {
      ['cite', 'url', 'excerpt', 'verifiedOn'].forEach((k) => assert.ok(s[k], s.id + ' is missing ' + k));
    }
  });
  const count = (st) => NS.SOURCES.filter((s) => s.status === st).reduce((n, s) => n + s.flagIds.length, 0);
  console.log('    source coverage by flag: verified ' + count('verified') + ', partial ' + count('partial') +
    ', incorrect ' + count('incorrect') + ', unchecked ' + count('unchecked'));
});

// Second layer of review: the tests above check that the source registry and the review-marker registry are each
// individually well formed. These two cross-check one against the other, and against the engine's own constants,
// so a wrong or missing marker is a test failure, not something only a reader of the live site would notice.
t('second layer: every flag whose source is not "verified" has a review marker', () => {
  require('../js/sources.js');
  require('../js/review.js');
  const missing = [];
  NS.SOURCES.filter((s) => s.status !== 'verified').forEach((s) => {
    s.flagIds.forEach((id) => { if (!NS.REVIEW_FLAGS[id]) missing.push(id + ' (source ' + s.id + ', status "' + s.status + '")'); });
  });
  assert.deepStrictEqual(missing, [], 'flagged in sources.js as not fully verified, but missing from REVIEW_FLAGS: ' + missing.join('; '));
});

t('second layer: dollar thresholds in the engine match the dollar amounts in their citation', () => {
  const flagsSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'flags.js'), 'utf8');
  const constant = (name) => {
    const m = flagsSrc.match(new RegExp(name + '\\s*=\\s*(\\d+)'));
    assert.ok(m, name + ' constant not found in js/flags.js; this check needs updating too');
    return Number(m[1]);
  };
  const amountsIn = (id) => {
    const s = NS.SOURCES.find((x) => x.id === id);
    assert.ok(s, id + ' source record not found');
    return (s.claim + ' ' + s.excerpt).match(/\$[\d,]+/g).map((x) => Number(x.replace(/[$,]/g, '')));
  };
  const regThreshold = constant('REG_THRESHOLD');
  ['NY_GBL_369E', 'FL_849_094'].forEach((id) => {
    assert.ok(amountsIn(id).includes(regThreshold), id + ' does not cite $' + regThreshold + ', but js/flags.js REG_THRESHOLD is ' + regThreshold);
  });
  const riThreshold = constant('RI_THRESHOLD');
  assert.ok(amountsIn('RI_11_50_1').includes(riThreshold), 'RI_11_50_1 does not cite $' + riThreshold + ', but js/flags.js RI_THRESHOLD is ' + riThreshold);
});

t('state survey records are well formed', () => {
  require('../js/states.js');
  require('../js/states2.js');
  require('../js/states3.js');
  const entries = Object.entries(NS.STATE_SURVEY);
  const appStates = [...fs.readFileSync(path.join(__dirname, '..', 'js', 'questions.js'), 'utf8').matchAll(/\['([A-Z]{2})', '/g)].map((m) => m[1]);
  assert.strictEqual(appStates.length, 51, 'state list scan looks broken');
  appStates.forEach((c) => assert.ok(NS.STATE_SURVEY[c], c + ' is in the app but missing from the state survey'));
  entries.forEach(([code, s]) => {
    assert.ok(/^[A-Z]{2}$/.test(code) && s.name && s.surveyedOn, code + ' is missing name or surveyedOn');
    assert.ok(['none', 'notfound', 'partial', 'required'].includes(s.registration), code + ' has a bad registration value');
    assert.ok(s.findings.length > 0, code + ' has no findings');
    s.findings.forEach((x) => {
      assert.ok(['verified', 'secondary', 'notfound'].includes(x.status), code + ' has a bad finding status');
      if (x.status === 'verified') ['cite', 'url'].forEach((k) => assert.ok(x[k], code + ' verified finding is missing ' + k));
    });
  });
  console.log('    states surveyed: ' + entries.map(([c]) => c).join(', '));
});

t('coverage summary is computed from the survey and respects excluded states', () => {
  require('../js/coverage.js');
  const all = NS.coverage([]);
  assert.strictEqual(all.total, 51);
  assert.deepStrictEqual(all.required, ['FL', 'NY', 'RI']);
  assert.deepStrictEqual(all.narrow, ['AZ', 'HI', 'LA', 'MD', 'MO']);
  assert.strictEqual(all.required.length + all.narrow.length + all.noneFound.length, 51);
  all.narrowNotes.forEach((x) => assert.ok(x.note, x.code + ' is missing a registrationNote'));
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(all.asOf));
  const ex = NS.coverage(['NY', 'FL', 'RI', 'HI']);
  assert.deepStrictEqual(ex.eligibleRequired, []);
  assert.deepStrictEqual(ex.eligibleNarrow, ['AZ', 'LA', 'MD', 'MO']);
  assert.strictEqual(ex.eligibleCount, 47);
  assert.strictEqual(ex.attorneyReviewed, 0);
});

t('no em-dashes in the survey and coverage files', () => {
  ['js/sources.js', 'js/states.js', 'js/states2.js', 'js/states3.js', 'js/coverage.js', 'js/review.js', 'README.md', 'scripts/build-site.js', 'llms.txt', '.github/workflows/pages.yml'].forEach((f) => {
    const p = path.join(__dirname, '..', f);
    if (fs.existsSync(p)) assert.ok(!fs.readFileSync(p, 'utf8').includes('—'), f + ' contains an em-dash');
  });
});

console.log('\n' + passed + ' tests passed');
