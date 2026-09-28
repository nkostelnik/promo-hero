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
    // RI 11-50-1 is worded for retail establishments, but the RI Department of State's filing instructions say all games offering over $500 in prizes to RI residents must file.
    if (chance && total > RI_THRESHOLD && !excluded.includes('RI')) out.push('RI');
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
    const add = (id, level, title, detail) => flags.push({ id, level, title, detail, note: FLAG_NOTE, review: NS.reviewFor ? NS.reviewFor(id, a) : null });

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
        'A random drawing where entrants must pay or buy is an illegal lottery under the state lottery statutes reviewed for this tool, and this tool also treats significant effort as payment as a conservative default. Fix it by adding a free alternate method of entry with equal odds and equal prominence, by removing the purchase or fee, or by switching to a judged skill contest.');
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
        'Requiring winners to pay a fee, deposit, or purchase to receive a prize is restricted by many state prize statutes (Nevada treats requiring a purchase to claim a prize as a deceptive practice, and Iowa and North Dakota bar payment without a prior written prize notice) and can turn a lawful promotion into a lottery. Sponsors may pass on taxes and incidental costs only, and must say so up front.');
    }
    if (has(restricted, 'cannabis')) {
      add('CANNABIS', 'stop', 'Cannabis or CBD promotion',
        'Marijuana remains a Schedule I controlled substance under federal law, state rules vary widely, and platform policies such as Meta\'s require compliance with laws on age-restricted products and may prohibit these promotions outright. Hemp-derived CBD (0.3 percent delta-9 THC or less) is defined separately under federal law but is still tightly regulated, so treat it the same way until counsel says otherwise. Do not proceed without counsel who handles cannabis marketing.');
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
      add('REG_RI', 'action', 'Rhode Island games of chance filing',
        'Rhode Island requires a filing with the Secretary of State (a $150 fee applies, and failure to file is a misdemeanor) for chance-based promotions with total announced prizes above $500. The statute is worded for a retail establishment promoting its retail business, but the Department of State\'s filing instructions say all games offering over $500 in prizes must file, including games offered to Rhode Island residents from other states, and that a winners list must be kept for at least one year. No filing deadline appears in the statute. Total prize value here is $' + total.toLocaleString('en-US') + '. Excluding Rhode Island residents avoids this.');
    }
    if (a.determination === 'judged' && a.consideration === 'purchase' && !(a.excludedStates || []).includes('AZ')) {
      add('AZ_CONTEST', 'action', 'Arizona contest registration',
        'Arizona requires registration with the Attorney General before running an "amusement gambling intellectual contest" tied to a product sale, plus a sworn statement that the product price was not increased for the contest and a winner list filed within 10 days after prizes are awarded. Whether your contest qualifies depends on a definition that has not been confirmed. Excluding Arizona residents avoids this.');
    }
    if (has(a.prizeTypes, 'realproperty') && !(a.excludedStates || []).includes('HI')) {
      add('HI_REALTY', 'action', 'Hawaii bond for real property prizes',
        'Hawaii requires a bond of at least $10,000, naming the director of commerce and consumer affairs as obligee, to offer a real property prize. Excluding Hawaii residents avoids this.');
    }
    if (chance && hasConsideration(a) && a.hasAmoe === 'yes' && !(a.excludedStates || []).includes('NJ')) {
      add('NJ_PAID', 'action', 'New Jersey paid-entry sweepstakes limits',
        'A 2025 New Jersey law treats a sweepstakes that a person in New Jersey can enter by paying or proffering something of value as unlawful gambling unless conditions are met: a free method of entry exists; any non-free entry is ancillary to buying food, non-alcoholic beverages or merchandise worth no more than $20 (or another amount set by the Director); odds are identical for free and paid entries; rules and odds are disclosed; winners are not picked by sports results unless all entry is free; and minors need parent consent to claim prizes over $1,000.' +
        (a.consideration === 'fee' ? ' An entry fee is not a purchase of merchandise, so a fee-based entry is unlikely to fit.' : '') +
        ' The law defines a sweepstakes as an event, contest or game "whether played online or in person", took effect immediately in August 2025, and carries civil penalties up to $100,000 for a first violation and $250,000 for later ones, each day a separate violation. How the $20 limit applies to purchase-linked promotions is a question for counsel, so confirm it or exclude New Jersey residents.');
    }

    // ---- open questions: raised when they apply, marked for attorney review in js/review.js. None of these takes a side.
    const notExcluded = (code) => !(a.excludedStates || []).includes(code);
    if (chance && a.consideration !== 'purchase' && notExcluded('CT')) {
      add('CT_REVIEW', 'note', 'Connecticut: standalone sweepstakes',
        'Connecticut General Statutes 42-301 restricts sweepstakes and promotional drawings. The text read bars one that is "not related to the bona fide sale of goods, services or property", or one that uses a simulated gambling device, with an exception for grocery chains. Whether those two conditions are alternatives or must both be met is unresolved, so a giveaway by a business that is not selling to entrants may or may not be covered. Have an attorney review this, or exclude Connecticut residents.');
    }
    if (chance && hasConsideration(a) && notExcluded('MA')) {
      add('MA_REVIEW', 'note', 'Massachusetts: payment for a chance and prize advertising',
        'Massachusetts regulation 940 CMR 30.04 makes it an unfair and deceptive practice to solicit or accept payment for a chance to win a prize, and to run a transaction where a gambling purpose predominates over the bona fide sale of goods or services. 940 CMR 6.08 requires prize advertising to identify the prize and its value and material conditions, to make official rules available at entry, and to deliver prizes when conditions are met. How the predominance test applies to a purchase-linked promotion is unresolved. Have an attorney review this, or exclude Massachusetts residents.');
    }
    if (chance && (hasConsideration(a) || a.consideration === 'effort') && notExcluded('GA')) {
      add('GA_REVIEW', 'note', 'Georgia: exclusions from the lottery definition',
        'Georgia defines a lottery as a scheme distributing prizes by chance among persons who have paid or promised consideration (O.C.G.A. 16-12-20) and lists exclusions, including lawful promotional giveaways and no-purchase giveaways. The exact conditions of those exclusions were not confirmed, so whether a paid or effort-based entry with a free route fits one is unresolved. Have an attorney review this, or exclude Georgia residents.');
    }
    if (hasConsideration(a) && (a.determination === 'judged' || a.hasAmoe !== 'yes') && (notExcluded('ID') || notExcluded('VT'))) {
      const which = [notExcluded('ID') ? 'Idaho' : null, notExcluded('VT') ? 'Vermont' : null].filter(Boolean).join(' and ');
      add('ID_VT_FEES', 'note', 'Idaho and Vermont: entry fees and required purchases',
        'Idaho (IDAPA 04.02.01.080) makes it unlawful for sellers to run any game of chance, contest, sweepstakes or promotion that requires an entry fee, purchase or other obligation to enter, and Vermont Consumer Protection Rule CF 109 bars soliciting participation in contests, sweepstakes or promotions that require an entry fee, purchase or similar consideration. A required payment therefore matters in these states even for a skill contest. Your promotion can reach ' + which + '. Have an attorney review this, or exclude ' + which + ' residents.');
    }
    if (a.smsUsed === 'yes' && (notExcluded('LA') || notExcluded('KY'))) {
      add('LA_KY_REVIEW', 'note', 'Louisiana and Kentucky: promotions by phone or text',
        'Louisiana R.S. 51:1732 is described as requiring sponsors that solicit calls for a prize, contest or sweepstakes to give the Attorney General ad scripts and recordings (the statute text was not read), and Kentucky regulates prize offers made by telephone (KRS 367.46951 to 367.46999). Whether a text-message promotion is covered is unresolved. Have an attorney review this, or exclude Louisiana and Kentucky residents.');
    }
    if (hasConsideration(a)) {
      add('PRIZE_NOTICE', 'note', 'Prize-notice rules where payment is required',
        'Many states (for example Iowa, North Dakota, Minnesota, Tennessee, Wisconsin, Kansas, South Dakota, Utah, Wyoming, Illinois and Virginia) regulate prize notices where payment or a sales presentation is involved. They generally bar requesting payment before a written prize notice with the sponsor\'s identity, the retail value of each prize, the odds and any fees, and they set prize delivery times. These rules are aimed at solicitations that invite payment or a sales presentation, and whether they reach an online promotion with a required purchase is unresolved. Have an attorney review this.');
    }
    if (a.determination === 'random' && a.consideration === 'effort' && a.hasAmoe !== 'yes') {
      add('EFFORT', 'note', 'Substantial effort may be treated as payment',
        'Some states say ordinary steps such as visiting a store, making a call or filling out an entry form are not consideration (Washington, for example), and several define "something of value" as money or property. No statute reviewed says substantial effort is payment, but this tool treats it that way as a conservative default, and children\'s advertising guidance warns against requiring excessive time, content creation or in-game tasks. Offer a free, simple alternate route or reduce the effort.');
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
        'New Mexico excepts bona fide contests of speed from its definition of a bet, but Alaska and Alabama treat a contest as one of chance when chance materially affects the outcome even if skill or speed also matters. Network lag or ties broken at random can bring chance in, and chance plus payment is a lottery. Consider a free route or a different mechanism.');
    }
    if (a.minAge === '13') {
      add('MINORS', 'action', 'Minors can enter',
        'People under the age of majority need parent or guardian permission, prizes must go to the parent or guardian, and state privacy laws add duties for teen data. The draft includes minor-entry terms.');
    }
    if (a.minAge === '18' && !(['AL', 'NE'].every((c) => (a.excludedStates || []).includes(c)))) {
      add('AGE_MAJORITY', 'note', 'Age of majority is 19 in some states',
        'Alabama and Nebraska set the age of majority at 19. The draft rules say 18 or the age of majority in the entrant\'s state, whichever is older, which covers this. If you need a flat 18 minimum, exclude those states.');
    }
    if (has(restricted, 'alcohol') && a.minAge === '21') {
      add('ALCOHOL', 'action', 'Alcohol rules apply',
        'Alcohol promotions are regulated mainly by state law, and some states require advance approval (Maryland requires 14 days for sweepstakes and contests and an alternative entry that needs no alcohol purchase). Federal law bars industry inducements to retailers (27 CFR 6.21) and shipping liquor into a state where it violates that state\'s law (27 U.S.C. 122). Verify with alcohol regulatory counsel, especially if entry involves buying.');
    }
    if (has(restricted, 'tobacco')) {
      add('TOBACCO', 'action', 'Tobacco and vape promotions are heavily restricted',
        'FDA rules bar gifts given in consideration of buying cigarettes or smokeless tobacco (21 CFR 1140.34), state rules add more, and platform policies require compliance with laws on age-restricted products. Vapes and other tobacco products need specialist review to confirm which rules apply.');
    }
    if (has(restricted, 'firearms')) {
      add('FIREARMS', 'action', 'Firearm prizes',
        'Federal law bars unlicensed transfers of firearms to residents of other states and requires a licensed dealer to run a background check before transferring a firearm, so a firearm prize is normally transferred through a licensed dealer. Platform policies require compliance with applicable laws and may prohibit these promotions outright.');
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
        'Making marketing consent mandatory to enter raises consent-validity risk: under the California privacy law, consent bundled into general terms is not valid consent, and consent to marketing texts cannot be a condition of purchase under the TCPA rules. It is unwise if a purchase is involved. Prefer an optional, unchecked opt-in.');
    }
    if (!(a.privacyUrl || '').trim()) {
      add('PRIVACY', 'action', 'No privacy policy linked',
        'Collecting names and contact details generally requires a posted privacy policy (California requires one from any online operator that collects personal information from California residents) and, for businesses over the CCPA thresholds, a notice at collection. Link your privacy policy in the rules and on the entry form.');
    }
    if (a.charity === 'yes') {
      add('CHARITY', 'action', 'Charity tie-in',
        'Tying a purchase or donation to a charity can trigger commercial co-venturer and charitable solicitation registration and disclosure rules in states such as California. This tool does not draft those terms.');
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
