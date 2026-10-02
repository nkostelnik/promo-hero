/* Promo Hero: attorney review markers.
 * Any flag or state note that rests on a question nobody has resolved is marked "Recommended for attorney review",
 * with the reason. The marker takes no side on the question. "ref" is the id of the maintainer's tracked open question
 * (D01 and up) when one exists in the attorney review packet kept outside this repository, or null when the issue
 * is a single sourcing gap rather than a multi-option decision. Remove an entry only after an attorney resolves it.
 * A test in test/engine.test.js enforces that every flag whose source record is not "verified" has an entry here,
 * so a new or edited source cannot silently lose its review marker. Not legal advice. */
(function () {
  const NS = (globalThis.PromoHero = globalThis.PromoHero || {});

  const LABEL = 'Recommended for attorney review';

  // Flag id -> why it is recommended for review. "when" narrows it to the answers that actually raise the question.
  const FLAGS = {
    REG_RI: { ref: 'D01', reason: 'The Rhode Island statute is worded for retail establishments, but the Department of State instructions say all games over $500 must file. Which reading applies is unresolved.' },
    NJ_PAID: { ref: 'D02', reason: 'How New Jersey\'s $20 ancillary-purchase limit applies to a purchase-linked promotion with a free entry route is unresolved.' },
    REG_NY: { ref: 'D04', reason: 'Whether the New York trigger reaches a promotion with no connection to selling consumer products, and whether a trust may replace the bond, is unresolved.' },
    NY_DEADLINE: { ref: 'D04', reason: 'The New York filing timing depends on the unresolved scope of the New York registration duty.' },
    REG_FL: { ref: 'D04', reason: 'Whether the Florida trigger reaches a promotion with no connection to selling consumer products or services, and which statutory exemptions apply, is unresolved.' },
    FL_DEADLINE: { ref: 'D04', reason: 'The Florida filing timing depends on the unresolved scope of the Florida registration duty.' },
    LOTTERY: { ref: 'D05', reason: 'Treating substantial effort as payment is a conservative default in this tool with no statute behind it.', when: (a) => a.consideration === 'effort' },
    EFFORT: { ref: 'D05', reason: 'No statute reviewed says substantial effort is consideration. The tool treats it that way as a conservative default.' },
    VOTE_PAY: { ref: 'D06', reason: 'Whether a public vote counts as chance depends on each state\'s test and was not confirmed from primary sources.' },
    VOTES: { ref: 'D06', reason: 'Whether a public vote counts as chance depends on each state\'s test and was not confirmed from primary sources.' },
    FIRSTCOME_PAY: { ref: 'D07', reason: 'That network lag or ties turn a first-come promotion into chance is an inference from the statutes, not a stated rule.' },
    AZ_CONTEST: { ref: 'D08', reason: 'Which contests are "amusement gambling intellectual contests" under Arizona law was not confirmed.' },
    FEE_SKILL: { ref: 'D09', reason: 'Only some states\' rules on paid skill contests were surveyed in detail (Idaho and Vermont are verified).' },
    ALCOHOL: { ref: 'D13', reason: 'State alcohol promotion rules were confirmed for only a few states (Maryland, Maine).' },
    CANNABIS: { ref: 'D14', reason: 'Whether hemp-derived CBD should be handled differently from marijuana is unresolved.' },
    TOBACCO: { ref: null, reason: 'Whether the FDA gift ban reaches vapes and other covered tobacco products is unresolved.' },
    FIREARMS: { ref: null, reason: 'The federal dealer-transfer rules were confirmed; in-state private transfers and state law were not.' },
    FINANCIAL: { ref: null, reason: 'Credit advertising and broker-dealer rules were confirmed; securities adviser and state rules were not.' },
    PHARMA: { ref: null, reason: 'The federal anti-kickback and FDA advertising rules were confirmed; state law was not.' },
    CHARITY: { ref: null, reason: 'Commercial co-venturer rules were confirmed for California and Florida only.' },
    TRAVEL: { ref: null, reason: 'Whether awarding a trip makes a sponsor a seller of travel under state law is unresolved.' },
    MINORS: { ref: null, reason: 'The age of majority was confirmed for Alabama and Nebraska only (19); other states were not surveyed.' },
    TCPA: { ref: null, reason: 'The federal consent rule was confirmed; state telemarketing laws were not.' },
    // Issues that have their own flags only so the question is raised when it applies.
    CT_REVIEW: { ref: 'D03', reason: 'Whether Connecticut 42-301 covers a standalone giveaway is unresolved.' },
    MA_REVIEW: { ref: 'D10', reason: 'How the Massachusetts "gambling purpose predominates" test applies to a purchase-linked promotion is unresolved.' },
    GA_REVIEW: { ref: 'D11', reason: 'The exact conditions of Georgia\'s exclusions from "lottery" were not confirmed.' },
    ID_VT_FEES: { ref: 'D09', reason: 'How Idaho and Vermont apply their entry fee and purchase bans to a given promotion was not confirmed.' },
    LA_KY_REVIEW: { ref: 'D12', reason: 'The Louisiana filing statute was not read, and the Kentucky mailed-offer rule was not confirmed as enacted.' },
    PRIZE_NOTICE: { ref: 'D15', reason: 'Whether state prize-notice rules reach an online promotion with a required payment is unresolved.' },
    // Added 2026-10-01 by the second-layer source/review cross-check (see test/engine.test.js): these flag ids
    // had a source record with a status other than "verified" but no review marker. Each was already worded to
    // match what the source confirms; only the review marker was missing.
    FB_RULES: { ref: null, reason: 'Meta\'s current policy wording is broader than this flag (it also covers reposting and incentivizing, not just sharing or tagging on a timeline), and no last-updated date was shown on the policy page.' },
    TAX: { ref: null, reason: 'The IRS prize-reporting threshold is unresolved: one IRS instructions page showed $2,000 while the 1099-MISC overview page still showed $600.' },
    AMOE_QUALITY: { ref: null, reason: 'The additional good-practice conditions this note lists (same deadlines, no extra hurdles) are not separately sourced to a statute or opinion.' },
    CRITERIA: { ref: null, reason: 'The requirement for defined, weighted judging criteria is treated as good practice here; it was not sourced to a statute.' },
    WINNER_PAYS: { ref: null, reason: 'State rules against requiring a winner to pay were confirmed only for Nevada, Iowa, and North Dakota; other states were not surveyed.' },
    AGE_MAJORITY: { ref: null, reason: 'The age of majority was confirmed at 19 for Alabama and Nebraska only. Mississippi is commonly cited at 21 but its statute could not be read, and other states were not surveyed.' },
    ALCOHOL_AGE: { ref: null, reason: 'State alcohol promotion rules were confirmed only for Maryland and Maine; other states were not surveyed, and the federal 21-year rule is a highway-funding condition, not a direct advertising rule.' },
    MARKETING_REQUIRED: { ref: null, reason: 'The consent-validity risk rests on the CCPA definition of consent; state privacy laws beyond California were not surveyed.' },
  };

  // State code -> why the state's notes are recommended for review. Shown in the state notes on the review page.
  const STATES = {
    RI: { ref: 'D01', reason: 'Statute versus agency reading of who must file.' },
    NJ: { ref: 'D02', reason: 'How the $20 ancillary-purchase limit applies.' },
    CT: { ref: 'D03', reason: 'Whether 42-301 covers a standalone giveaway.' },
    NY: { ref: 'D04', reason: 'Scope of the trigger and bond versus trust.' },
    FL: { ref: 'D04', reason: 'Scope of the trigger and statutory exemptions.' },
    AZ: { ref: 'D08', reason: 'Which contests must register.' },
    ID: { ref: 'D09', reason: 'Application of the entry fee and purchase ban.' },
    VT: { ref: 'D09', reason: 'Application of the entry fee and purchase ban.' },
    MA: { ref: 'D10', reason: '"Gambling purpose predominates" test.' },
    GA: { ref: 'D11', reason: 'Conditions of the exclusions from "lottery".' },
    LA: { ref: 'D12', reason: 'Filing statute 51:1732 was not read.' },
    KY: { ref: 'D12', reason: 'Mailed-offer rule not confirmed as enacted.' },
    MD: { ref: 'D13', reason: 'Alcohol approval rule and other alcohol rules.' },
  };

  /** The review record for a flag given the promotion's answers, or null when the flag needs no review marker. */
  function reviewFor(flagId, answers) {
    const r = FLAGS[flagId];
    if (!r) return null;
    if (r.when && !r.when(answers || {})) return null;
    return { reason: r.reason, ref: r.ref };
  }

  NS.REVIEW_LABEL = LABEL;
  NS.REVIEW_FLAGS = FLAGS;
  NS.REVIEW_STATES = STATES;
  NS.reviewFor = reviewFor;
  NS.reviewStateFor = (code) => STATES[code] || null;
  if (typeof module !== 'undefined') module.exports = NS;
})();
