// Run: node test/engine.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
require('../js/questions.js');
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

console.log('\n' + passed + ' tests passed');
