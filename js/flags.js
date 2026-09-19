/* Promo Hero: legal structure classification and flag rules.
 * Levels: "stop" = likely unlawful as designed, "action" = a legal requirement to satisfy, "note" = good practice.
 * This is an issue-spotting aid, not legal advice. */
(function () {
  const NS = (globalThis.PromoHero = globalThis.PromoHero || {});

  const FLAG_NOTE = 'Consult a licensed attorney before proceeding. This is not legal advice.';
  const REG_THRESHOLD = 5000; // NY and FL total ARV trigger
  const RI_THRESHOLD = 500;

  const has = (list, v) => Array.isArray(list) && list.includes(v);
  const hasConsideration = (a) => ['purchase', 'fee'].includes(a.consideration);

  function totalARV(prizes) {
    return (prizes || []).reduce((sum, p) => sum + (Number(p.qty) || 0) * (Number(p.arv) || 0), 0);
  }

  function parseISO(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return null;
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  }

  function daysUntil(iso, today) {
    const t = parseISO(iso);
    if (t === null) return null;
    const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.round((t - now) / 86400000);
  }

  /** Which registration regimes are triggered by the current answers. */
  function registrations(a) {
    const total = totalARV(a.prizes);
    const excluded = a.excludedStates || [];
    const chance = a.determination === 'random' || a.determination === 'votes';
    const out = [];
    if (chance && total > REG_THRESHOLD && !excluded.includes('NY')) out.push('NY');
    if (chance && total > REG_THRESHOLD && !excluded.includes('FL')) out.push('FL');
    if (a.determination === 'random' && a.consideration === 'purchase' && total > RI_THRESHOLD && !excluded.includes('RI')) out.push('RI');
    return out;
  }

  /** The three lottery elements plus a plain-English label for the structure. */
  function classify(a) {
    const det = a.determination;
    const chance = det === 'random' || det === 'votes';
    const paid = hasConsideration(a);
    const effort = a.consideration === 'effort';
    const amoe = a.hasAmoe === 'yes';
    const consideration = (paid || effort) && !(chance && amoe);
    let label;
    let detail;
    if (det === 'random') {
      if (!consideration) {
        label = paid || effort ? 'Sweepstakes with a free alternate method of entry' : 'No-purchase sweepstakes';
        detail = paid || effort
          ? 'Prize and chance are present, but a free entry route with equal odds removes the payment element.'
          : 'Prize and chance are present, and nothing is required from entrants, so it is not a lottery.';
      } else {
        label = 'Potential illegal lottery';
        detail = 'Prize, chance, and payment or effort are all present. Add a free entry route or change the mechanism.';
      }
    } else if (det === 'judged') {
      label = 'Skill contest';
      detail = 'Winners are picked on merit by judges, so chance is not the deciding factor. That is what makes payment-linked entry more defensible, but some states still restrict entry fees.';
    } else if (det === 'votes') {
      label = consideration ? 'Potential illegal lottery (paid voting)' : 'Popularity vote contest';
      detail = 'Vote outcomes are often treated as at least partly chance. Payment for entries or votes is high risk.';
    } else {
      label = 'First-come giveaway';
      detail = 'Speed decides the winner instead of chance, but ties and platform lag can reintroduce chance.';
    }
    return {
      label,
      detail,
      prize: true,
      chance,
      consideration,
      lottery: chance && consideration,
    };
  }

  function evaluate(a, opts) {
    const today = (opts && opts.today) || new Date();
    const flags = [];
    const add = (id, level, title, detail) => flags.push({ id, level, title, detail, note: FLAG_NOTE });

    const total = totalARV(a.prizes);
    const chance = a.determination === 'random' || a.determination === 'votes';
    const restricted = a.restricted || [];
    const platforms = a.platforms || [];
    const actions = a.socialActions || [];
    const social = has(a.entryChannels, 'social');
    const regs = registrations(a);

    // ---- stop: likely unlawful as designed
    const structure = classify(a);
    if (a.determination === 'random' && structure.lottery) {
      add('LOTTERY', 'stop', 'Prize + chance + payment: an illegal lottery',
        'A random drawing where entrants must pay, buy, or make a significant effort is treated as an illegal lottery in most states. Fix it by adding a free alternate method of entry with equal odds and equal prominence, by removing the purchase or fee, or by switching to a judged skill contest.');
    }
    if (a.determination === 'votes' && (hasConsideration(a) || a.consideration === 'effort') && a.hasAmoe !== 'yes') {
      add('VOTE_PAY', 'stop', 'Paid or effort-based entry in a popularity vote',
        'Winners chosen by votes are frequently treated as chance-based, and paid entries or paid votes can convert the promotion into an unlawful lottery. Remove payment, add a free entry route, or use judged selection.');
    }
    if (a.minAge === 'u13') {
      add('COPPA', 'stop', 'Collecting data from children under 13',
        'The Children\'s Online Privacy Protection Act requires verifiable parental consent before collecting personal information from children under 13. Set the minimum age to 13 or 18, or require a parent to enter on the child\'s behalf.');
    }
    if (a.winnerPays === 'yes') {
      add('WINNER_PAYS', 'stop', 'Winners must pay to claim the prize',
        'Requiring winners to pay a fee, deposit, or purchase to receive a prize is deceptive under FTC and state law and can turn a lawful promotion into a lottery. Sponsors may pass on taxes and incidental costs only, and must say so up front.');
    }
    if (has(restricted, 'cannabis')) {
      add('CANNABIS', 'stop', 'Cannabis or CBD promotion',
        'Cannabis remains illegal under federal law, state rules vary widely and often ban giveaways, and every major social platform prohibits these promotions. Do not proceed without counsel who handles cannabis marketing.');
    }
    if (has(restricted, 'alcohol') && a.minAge !== '21') {
      add('ALCOHOL_AGE', 'stop', 'Alcohol promotion open to people under 21',
        'Alcohol-related promotions must be limited to adults of legal drinking age (21 in the U.S.). Set the minimum age to 21.');
    }
    const startIn = daysUntil(a.startDate, today);
    if (startIn !== null && regs.includes('NY') && startIn < 30) {
      add('NY_DEADLINE', 'stop', 'Not enough time to register in New York',
        'New York registration and bonding is generally required well before launch (commonly at least 30 days). With this start date you either miss the window or must exclude New York residents. Confirm current deadlines with counsel.');
    }
    if (startIn !== null && regs.includes('FL') && startIn < 7) {
      add('FL_DEADLINE', 'stop', 'Not enough time to register in Florida',
        'Florida registration is generally required before launch (commonly at least 7 days ahead). Move the start date or exclude Florida residents. Confirm current deadlines with counsel.');
    }
    const s = parseISO(a.startDate);
    const e = parseISO(a.endDate);
    if (s !== null && e !== null && e < s) {
      add('DATES', 'stop', 'End date is before the start date', 'Fix the promotion period before drafting.');
    }

    // ---- action: legal requirements to satisfy
    if (regs.includes('NY')) {
      add('REG_NY', 'action', 'New York registration and bond',
        'Games of chance with total prizes above $5,000 generally require registration with the New York Department of State and a bond or trust for the prize value, filed before the start. Total prize value here is $' + total.toLocaleString('en-US') + '. Excluding New York residents avoids this.');
    }
    if (regs.includes('FL')) {
      add('REG_FL', 'action', 'Florida registration and bond',
        'Game promotions with total prizes above $5,000 generally require registration with the Florida Department of Agriculture and Consumer Services and a bond or trust account for the prize value. Some exemptions exist. Excluding Florida residents avoids this.');
    }
    if (regs.includes('RI')) {
      add('REG_RI', 'action', 'Rhode Island retail promotion registration',
        'Retail-linked games of chance in Rhode Island with total prizes above $500 may require registration with the Secretary of State. Excluding Rhode Island residents avoids this.');
    }
    if (a.determination === 'random' && a.consideration === 'effort' && a.hasAmoe !== 'yes') {
      add('EFFORT', 'action', 'Substantial effort can count as payment',
        'In some states, requiring significant time, effort, or personal data (long surveys, store visits, video creation) is treated as consideration. Offer a free, simple alternate route or reduce the effort.');
    }
    if (a.hasAmoe === 'yes' && a.consideration !== 'none') {
      add('AMOE_QUALITY', 'note', 'Keep the free entry route truly equal',
        'The free route must give identical odds, be disclosed as prominently as the paid route, have no extra hurdles, and share the same deadlines. The draft includes standard language for this.');
    }
    if (a.determination === 'votes' && !hasConsideration(a)) {
      add('VOTES', 'action', 'Popularity votes carry chance and fraud risk',
        'Vote-based winners may be treated as chance in some jurisdictions and are easy to manipulate with bots. Many sponsors use judges to pick finalists and a public vote only as one input. The draft reserves the right to void suspicious votes.');
    }
    if (a.determination === 'judged' && !(a.judgingCriteria || '').trim()) {
      add('CRITERIA', 'action', 'Judging criteria are missing',
        'A skill contest needs defined, ideally weighted and objective criteria. Without them the promotion may be treated as a game of chance or a disguised discretionary giveaway.');
    }
    if (a.determination === 'judged' && a.consideration === 'fee') {
      add('FEE_SKILL', 'action', 'Entry fees for skill contests',
        'Some states restrict or regulate paid skill contests and may treat them as gambling. Verify each state where you accept entrants.');
    }
    if (a.determination === 'firstcome' && (hasConsideration(a) || a.consideration === 'effort')) {
      add('FIRSTCOME_PAY', 'action', 'First-come promotion tied to a purchase',
        'Speed-based winners can be treated as chance when latency or ties decide the outcome, which becomes a lottery once payment is involved. Consider a free route or a different mechanism.');
    }
    if (a.minAge === '13') {
      add('MINORS', 'action', 'Minors can enter',
        'People under the age of majority need parent or guardian permission, prizes must go to the parent or guardian, and state privacy laws add duties for teen data. The draft includes minor-entry terms.');
    }
    if (has(restricted, 'alcohol') && a.minAge === '21') {
      add('ALCOHOL', 'action', 'Alcohol rules apply',
        'Federal (TTB) and state alcohol laws limit inducements, purchase-linked promotions, and shipping. Verify with alcohol regulatory counsel, especially if entry involves buying.');
    }
    if (has(restricted, 'tobacco')) {
      add('TOBACCO', 'action', 'Tobacco and vape promotions are heavily restricted',
        'FDA and state rules restrict giveaways and promotions for tobacco and vapes, and platforms ban most of them. Get specialist review.');
    }
    if (has(restricted, 'firearms')) {
      add('FIREARMS', 'action', 'Firearm prizes',
        'Awarding a firearm requires a licensed dealer transfer and background check, and social platforms prohibit these promotions.');
    }
    if (has(restricted, 'financial')) {
      add('FINANCIAL', 'action', 'Financial products',
        'Promotions for credit, loans, or investments trigger extra advertising and inducement rules. Get regulatory review.');
    }
    if (has(restricted, 'pharma')) {
      add('PHARMA', 'action', 'Prescription drug or medical promotions',
        'Giveaways connected to prescription drugs or medical services can implicate anti-kickback, FDA advertising, and state law. Get regulatory review.');
    }
    if (has(restricted, 'kids')) {
      add('KIDS', 'action', 'Marketing to children',
        'Children\'s advertising standards (such as CARU guidance) and COPPA apply to promotions aimed at children. Have parents enter and receive prizes.');
    }
    if (social && platforms.includes('facebook') && (actions.includes('share') || actions.includes('tag'))) {
      add('FB_RULES', 'action', 'Facebook prohibits sharing and tagging as an entry method',
        'Meta\'s promotion guidelines prohibit requiring entrants to share on personal timelines or tag friends to enter. Use commenting, or a form.');
    }
    if (social && platforms.includes('instagram') && actions.includes('tag')) {
      add('IG_RULES', 'action', 'Instagram tagging rules',
        'Instagram\'s guidelines prohibit inaccurately tagging content or encouraging users to tag people who are not in the photo.');
    }
    if (social && (actions.includes('post') || actions.includes('hashtag') || actions.includes('share'))) {
      add('FTC_DISCLOSE', 'note', 'Entrant posts need an advertising disclosure',
        'When entering by posting about your brand, the FTC expects a clear disclosure such as #sweepstakes or #contest. The draft requires it.');
    }
    if (social && platforms.length) {
      add('PLATFORM_TERMS', 'note', 'Check each platform\'s current promotion rules',
        'Platforms change their guidelines. The draft includes a platform release and non-affiliation statement, but confirm the latest rules before launch.');
    }
    if (a.smsUsed === 'yes') {
      add('TCPA', 'action', 'Texting entrants triggers the TCPA',
        'Marketing texts require prior express written consent, which cannot be buried in the rules or forced as a condition of entry without risk. Use a separate consent checkbox and state carrier-rate and STOP language.');
    }
    if (a.marketing === 'required') {
      add('MARKETING_REQUIRED', 'action', 'Marketing consent as a condition of entry',
        'Making marketing consent mandatory to enter raises consent-validity risk under state privacy laws and CAN-SPAM practice, and is unwise if a purchase is involved. Prefer an optional, unchecked opt-in.');
    }
    if (!(a.privacyUrl || '').trim()) {
      add('PRIVACY', 'action', 'No privacy policy linked',
        'Collecting names and contact details generally requires a notice at collection (for example under California law). Link your privacy policy in the rules and on the entry form.');
    }
    if (a.charity === 'yes') {
      add('CHARITY', 'action', 'Charity tie-in',
        'Tying a purchase or donation to a charity can trigger commercial co-venturer and charitable solicitation registration and disclosure rules in many states. This tool does not draft those terms.');
    }

    // ---- notes
    if (a.influencers === 'yes') {
      add('INFLUENCER', 'note', 'Influencer disclosures',
        'Influencers must clearly disclose their connection to the brand under the FTC Endorsement Guides. Give them written instructions and monitor posts.');
    }
    if (has(a.prizeTypes, 'travel')) {
      add('TRAVEL', 'note', 'Travel prizes',
        'Spell out what is and is not included, blackout dates, and companion rules. Some states regulate sellers of travel, and requiring a sales presentation changes the analysis.');
    }
    if (total > 0) {
      add('TAX', 'note', 'Prize taxes and reporting',
        'Winners owe tax on prizes. The Sponsor may need to collect tax forms (such as a W-9) and report prizes above IRS thresholds. Confirm treatment with a tax advisor.');
    } else {
      add('ARV_ZERO', 'note', 'Prize value is not set', 'Enter each prize\'s approximate retail value. Total value determines registration and bonding requirements.');
    }
    if (a.disputeResolution === 'arbitration') {
      add('ARBITRATION', 'note', 'Arbitration and class waiver',
        'Enforceability varies by state and by how clearly the clause is presented. The draft includes an opt-out and a small-claims carve-out to help.');
    }

    const order = { stop: 0, action: 1, note: 2 };
    flags.sort((x, y) => order[x.level] - order[y.level]);
    return flags;
  }

  NS.FLAG_NOTE = FLAG_NOTE;
  NS.totalARV = totalARV;
  NS.registrations = registrations;
  NS.classify = classify;
  NS.evaluate = evaluate;
  NS.daysUntil = daysUntil;
  if (typeof module !== 'undefined') module.exports = NS;
})();
