/* Promo Hero: question schema.
 * Each question can be conditionally shown via showIf(answers).
 * Plain script (no modules) so index.html works from file:// or any static server. */
(function () {
  const NS = (globalThis.PromoHero = globalThis.PromoHero || {});

  const STATES = [
    ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
    ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
    ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
    ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
    ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
    ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
    ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
    ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
    ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
    ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
    ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
  ].map(([code, name]) => ({ value: code, label: name }));

  // Order matters: the interview walks these top to bottom, starting with the biggest legal driver.
  const SECTIONS = [
    { id: 'structure', title: 'How winners are chosen', blurb: 'This is the single biggest legal driver: chance, skill, votes, or speed.' },
    { id: 'entry', title: 'How people enter', blurb: 'Anything an entrant has to buy, pay, or do can change the legal analysis.' },
    { id: 'eligibility', title: 'Who can enter', blurb: 'Age and location limits.' },
    { id: 'prizes', title: 'Prizes', blurb: 'Total prize value decides whether state registration and bonding apply.' },
    { id: 'data', title: 'Data and marketing', blurb: 'Privacy, texting, influencers, and charity tie-ins.' },
    { id: 'legal', title: 'Legal terms', blurb: 'Governing law and how disputes are handled.' },
    { id: 'basics', title: 'Sponsor and dates', blurb: 'Who is running the promotion and when.' },
  ];

  const yesNo = [
    { value: 'no', label: 'No' },
    { value: 'yes', label: 'Yes' },
  ];

  const QUESTIONS = [
    // ---- basics
    { id: 'sponsorName', section: 'basics', type: 'text', required: true, label: 'Sponsor legal name', placeholder: 'Acme Widgets, Inc.' },
    { id: 'sponsorAddress', section: 'basics', type: 'text', required: true, label: 'Sponsor mailing address', placeholder: '123 Main St, Springfield, IL 62701' },
    { id: 'sponsorState', section: 'basics', type: 'select', required: true, label: 'Sponsor state', help: 'Used as the default governing law.', options: STATES, allowBlank: true },
    { id: 'contactEmail', section: 'basics', type: 'text', label: 'Contact email for questions', placeholder: 'promo@acme.com' },
    { id: 'adminName', section: 'basics', type: 'text', label: 'Third-party administrator (optional)', help: 'Leave blank if Sponsor runs it in-house.' },
    { id: 'promoName', section: 'basics', type: 'text', required: true, label: 'Promotion name', placeholder: 'Summer Splash Sweepstakes' },
    { id: 'startDate', section: 'basics', type: 'date', required: true, label: 'Start date' },
    { id: 'endDate', section: 'basics', type: 'date', required: true, label: 'End date' },
    {
      id: 'timeZone', section: 'basics', type: 'select', label: 'Time zone', default: 'ET',
      options: [
        { value: 'ET', label: 'Eastern Time (ET)' }, { value: 'CT', label: 'Central Time (CT)' },
        { value: 'MT', label: 'Mountain Time (MT)' }, { value: 'PT', label: 'Pacific Time (PT)' },
      ],
    },
    { id: 'website', section: 'basics', type: 'text', label: 'Promotion web address', placeholder: 'https://acme.com/summer' },

    // ---- structure
    {
      id: 'determination', section: 'structure', type: 'radio', required: true, default: 'random',
      label: 'How is the winner chosen?',
      help: 'Prize + chance + payment is an illegal lottery. Choosing the mechanism decides which of those elements you have.',
      options: [
        { value: 'random', label: 'Random drawing', hint: 'Sweepstakes or giveaway. Pure chance.' },
        { value: 'judged', label: 'Judged on merit', hint: 'Skill contest. Judges score entries against criteria.' },
        { value: 'votes', label: 'Most votes wins', hint: 'Popularity contest. Public or fan voting.' },
        { value: 'firstcome', label: 'First to do something wins', hint: 'First-come giveaway, e.g. first 100 to comment.' },
      ],
    },
    { id: 'drawDays', section: 'structure', type: 'number', default: 7, min: 1, label: 'Days after the end date the drawing is held', showIf: (a) => a.determination === 'random' },
    { id: 'judgesDescription', section: 'structure', type: 'text', default: 'a panel of judges selected by Sponsor', label: 'Who judges?', showIf: (a) => a.determination === 'judged' },
    {
      id: 'judgingCriteria', section: 'structure', type: 'textarea', label: 'Judging criteria',
      help: 'Use objective, weighted criteria, e.g. "Creativity (40%), Originality (30%), Fit with theme (30%)".',
      showIf: (a) => a.determination === 'judged',
    },
    {
      id: 'voteMethod', section: 'structure', type: 'textarea', label: 'How are votes cast and counted?',
      help: 'e.g. "One vote per person per day through the contest page."', showIf: (a) => a.determination === 'votes',
    },
    {
      id: 'firstcomeRule', section: 'structure', type: 'text', label: 'What must entrants do, and how is "first" measured?',
      placeholder: 'comment on the launch post; first is determined by the platform timestamp', showIf: (a) => a.determination === 'firstcome',
    },

    // ---- entry
    {
      id: 'consideration', section: 'entry', type: 'radio', required: true, default: 'none',
      label: 'Does anyone have to buy, pay, or do something significant to enter or win?',
      help: 'This is "consideration". Free entry with a simple form is not consideration.',
      options: [
        { value: 'none', label: 'No, free to enter' },
        { value: 'purchase', label: 'Yes, a purchase or payment is required' },
        { value: 'fee', label: 'Yes, an entry fee is charged' },
        { value: 'effort', label: 'Yes, substantial effort (long survey, store visit, video, etc.)' },
      ],
    },
    {
      id: 'considerationDescription', section: 'entry', type: 'textarea', label: 'Describe what entrants must buy, pay, or do',
      showIf: (a) => a.consideration && a.consideration !== 'none',
    },
    {
      id: 'hasAmoe', section: 'entry', type: 'radio', default: 'no', label: 'Will you offer a free alternate method of entry (AMOE)?',
      help: 'An AMOE with equal odds is the standard fix that turns a purchase-linked drawing into a legal sweepstakes.',
      options: yesNo, showIf: (a) => (a.determination === 'random' || a.determination === 'votes') && a.consideration && a.consideration !== 'none',
    },
    {
      id: 'amoeMethod', section: 'entry', type: 'radio', default: 'mail', label: 'How can people enter for free?',
      options: [
        { value: 'mail', label: 'By mail' }, { value: 'online', label: 'Online' }, { value: 'both', label: 'Both' },
      ],
      showIf: (a) => a.hasAmoe === 'yes' && a.consideration !== 'none',
    },
    {
      id: 'entryChannels', section: 'entry', type: 'multi', default: ['form'], label: 'Entry channels',
      options: [
        { value: 'form', label: 'Web entry form' }, { value: 'social', label: 'Social media post' }, { value: 'email', label: 'Email' },
      ],
    },
    {
      id: 'platforms', section: 'entry', type: 'multi', label: 'Which social platforms?',
      options: [
        { value: 'instagram', label: 'Instagram' }, { value: 'facebook', label: 'Facebook' }, { value: 'tiktok', label: 'TikTok' },
        { value: 'x', label: 'X' }, { value: 'youtube', label: 'YouTube' }, { value: 'linkedin', label: 'LinkedIn' }, { value: 'other', label: 'Other' },
      ],
      showIf: (a) => (a.entryChannels || []).includes('social'),
    },
    {
      id: 'socialActions', section: 'entry', type: 'multi', label: 'What must entrants do on social?',
      options: [
        { value: 'post', label: 'Post their own content' }, { value: 'hashtag', label: 'Use a hashtag' }, { value: 'tag', label: 'Tag an account or friends' },
        { value: 'follow', label: 'Follow Sponsor' }, { value: 'like', label: 'Like the promo post' }, { value: 'comment', label: 'Comment on the promo post' },
        { value: 'share', label: 'Share or repost' },
      ],
      showIf: (a) => (a.entryChannels || []).includes('social'),
    },
    { id: 'hashtag', section: 'entry', type: 'text', label: 'Required hashtag(s)', placeholder: '#SummerSplash', showIf: (a) => (a.entryChannels || []).includes('social') && (a.socialActions || []).includes('hashtag') },
    {
      id: 'submissionType', section: 'entry', type: 'select', default: 'photo', label: 'What do entrants submit?',
      options: [
        { value: 'photo', label: 'Photo' }, { value: 'video', label: 'Video' }, { value: 'essay', label: 'Written entry' }, { value: 'other', label: 'Other creative work' },
      ],
      showIf: (a) => a.determination === 'judged' || a.determination === 'votes',
    },
    {
      id: 'entryLimit', section: 'entry', type: 'radio', default: 'once', label: 'Entry limit',
      options: [
        { value: 'once', label: 'One entry per person, total' }, { value: 'daily', label: 'One entry per person per day' }, { value: 'unlimited', label: 'No limit' },
      ],
    },

    // ---- eligibility
    {
      id: 'minAge', section: 'eligibility', type: 'radio', required: true, default: '18', label: 'Minimum age',
      options: [
        { value: 'u13', label: 'Under 13 allowed' }, { value: '13', label: '13 and up (minors need parent or guardian permission)' },
        { value: '18', label: '18 and up (or age of majority)' }, { value: '21', label: '21 and up' },
      ],
    },
    {
      id: 'excludedStates', section: 'eligibility', type: 'states', default: [], label: 'States to exclude',
      help: 'Excluding NY, FL and RI is a common way to avoid their registration and bonding rules. Territories are excluded automatically.',
      options: STATES,
    },

    // ---- prizes
    { id: 'prizes', section: 'prizes', type: 'prizes', required: true, label: 'Prizes', default: [{ desc: '', qty: 1, arv: 0 }] },
    {
      id: 'prizeTypes', section: 'prizes', type: 'multi', default: ['goods'], label: 'Prize kinds (adds the right prize terms)',
      options: [
        { value: 'goods', label: 'Products or goods' }, { value: 'cash', label: 'Cash' }, { value: 'giftcard', label: 'Gift cards' },
        { value: 'travel', label: 'Travel' }, { value: 'experience', label: 'Experience or event tickets' },
        { value: 'realproperty', label: 'Real estate or other real property' },
      ],
    },
    {
      id: 'restricted', section: 'prizes', type: 'multi', default: [], label: 'Does anything here involve a regulated product or audience?',
      help: 'Leave empty if none apply.',
      options: [
        { value: 'alcohol', label: 'Alcohol' }, { value: 'tobacco', label: 'Tobacco or vapes' }, { value: 'cannabis', label: 'Cannabis or CBD' },
        { value: 'firearms', label: 'Firearms' }, { value: 'financial', label: 'Credit, loans, or investments' },
        { value: 'pharma', label: 'Prescription drugs or medical' }, { value: 'kids', label: 'Products marketed to children' },
      ],
    },
    { id: 'winnerPays', section: 'prizes', type: 'radio', default: 'no', label: 'Must winners pay anything (besides taxes) to claim the prize?', options: yesNo },
    {
      id: 'notifyMethod', section: 'prizes', type: 'select', default: 'email', label: 'How will winners be notified?',
      options: [{ value: 'email', label: 'Email' }, { value: 'dm', label: 'Direct message on the platform' }, { value: 'phone', label: 'Phone' }],
    },
    { id: 'claimDays', section: 'prizes', type: 'number', default: 7, min: 1, label: 'Days a winner has to respond' },
    {
      id: 'unclaimed', section: 'prizes', type: 'radio', default: 'alternate', label: 'If a winner is unreachable or ineligible',
      options: [{ value: 'alternate', label: 'Select an alternate winner' }, { value: 'forfeit', label: 'Prize is not awarded' }],
    },
    { id: 'publicityRelease', section: 'prizes', type: 'radio', default: 'yes', label: 'Use winners name and likeness for publicity?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },

    // ---- data
    {
      id: 'marketing', section: 'data', type: 'radio', default: 'none', label: 'Marketing to entrants',
      options: [
        { value: 'none', label: 'Entry data used only to run the promotion' },
        { value: 'optional', label: 'Optional marketing opt-in (unchecked box)' },
        { value: 'required', label: 'Entering means agreeing to marketing' },
      ],
    },
    { id: 'smsUsed', section: 'data', type: 'radio', default: 'no', label: 'Will you send text messages to entrants?', options: yesNo },
    { id: 'privacyUrl', section: 'data', type: 'text', label: 'Privacy policy web address', placeholder: 'https://acme.com/privacy' },
    { id: 'influencers', section: 'data', type: 'radio', default: 'no', label: 'Will influencers or ambassadors promote it?', options: yesNo },
    { id: 'charity', section: 'data', type: 'radio', default: 'no', label: 'Is any part of a purchase or donation tied to a charity?', options: yesNo },

    // ---- legal
    { id: 'governingLaw', section: 'legal', type: 'select', label: 'Governing law state', help: 'Defaults to the Sponsor state.', options: STATES, allowBlank: true },
    {
      id: 'disputeResolution', section: 'legal', type: 'radio', default: 'courts', label: 'Disputes',
      options: [{ value: 'courts', label: 'Courts in the governing state' }, { value: 'arbitration', label: 'Individual arbitration with class action waiver' }],
    },
  ];

  // "Why we ask": shown under a question so the user sees how the answer changes the outcome.
  const WHY = {
    determination: 'A random drawing needs a free way to enter. A judged contest can ask for more from entrants. A vote or a race sits in between. Your answer decides which branch of questions comes next.',
    consideration: 'A prize awarded by chance is only lawful if nobody has to pay for the chance. If entrants must buy or pay, the next question asks about a free alternative.',
    hasAmoe: 'Yes keeps a purchase-linked drawing lawful and adds a "Free Method of Entry" section to your rules. No leaves an illegal lottery flagged.',
    amoeMethod: 'Determines the free-entry wording that is drafted into the rules.',
    minAge: 'Under 13 triggers children\'s privacy law (COPPA). 13 to 17 adds parent and guardian terms. 21 is required for alcohol.',
    excludedStates: 'Excluding a state removes that state\'s registration and bonding requirements from your flags.',
    prizes: 'Total prize value drives registration: over $5,000 in NY and FL for chance-based promotions, and over $500 in RI for chance-based promotions. Real property prizes add a Hawaii bond.',
    restricted: 'Regulated products bring extra rules, and some are stop items. Alcohol forces a 21+ age limit.',
    winnerPays: 'Charging winners to claim a prize is a stop item.',
    marketing: 'Forcing marketing consent as a condition of entry is flagged. An optional checkbox is safest.',
    disputeResolution: 'Arbitration adds a class action waiver and opt-out clause.',
  };
  QUESTIONS.forEach((q) => { if (WHY[q.id]) q.why = WHY[q.id]; });

  function defaults() {
    const a = {};
    QUESTIONS.forEach((q) => {
      if (q.default !== undefined) a[q.id] = JSON.parse(JSON.stringify(q.default));
    });
    return a;
  }

  function isVisible(q, a) {
    return !q.showIf || !!q.showIf(a);
  }

  function visibleQuestions(a, sectionId) {
    return QUESTIONS.filter((q) => (!sectionId || q.section === sectionId) && isVisible(q, a));
  }

  /** The interview order: every currently visible question, sections in SECTIONS order. Recomputed after each answer, which is what makes it branch. */
  function flow(a) {
    return SECTIONS.reduce((out, s) => out.concat(visibleQuestions(a, s.id)), []);
  }

  function missingRequired(a) {
    const out = [];
    visibleQuestions(a).forEach((q) => {
      if (!q.required) return;
      const v = a[q.id];
      if (q.type === 'prizes') {
        const ok = (v || []).some((p) => p.desc && p.desc.trim() && Number(p.qty) > 0);
        if (!ok) out.push(q);
      } else if (v === undefined || v === null || String(v).trim() === '') {
        out.push(q);
      }
    });
    return out;
  }

  NS.STATES = STATES;
  NS.SECTIONS = SECTIONS;
  NS.QUESTIONS = QUESTIONS;
  NS.defaults = defaults;
  NS.visibleQuestions = visibleQuestions;
  NS.missingRequired = missingRequired;
  NS.flow = flow;
  NS.stateName = (code) => (STATES.find((s) => s.value === code) || {}).label || code;
  if (typeof module !== 'undefined') module.exports = NS;
})();
