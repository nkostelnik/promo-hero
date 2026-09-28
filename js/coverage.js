/* Promo Hero: summarizes how much of the state survey backs the tool, computed from the survey data so it cannot drift.
 * Feeds the "State rules reviewed" note. Not legal advice. */
(function () {
  const NS = (globalThis.PromoHero = globalThis.PromoHero || {});

  /** excluded: state codes the promotion excludes (may include codes outside the survey). */
  function coverage(excluded) {
    const S = NS.STATE_SURVEY || {};
    const codes = Object.keys(S).sort();
    const out = new Set(excluded || []);
    const by = (r) => codes.filter((c) => S[c].registration === r);
    const required = by('required');
    const narrow = by('partial');
    const noneFound = codes.filter((c) => !required.includes(c) && !narrow.includes(c));
    const eligible = codes.filter((c) => !out.has(c));
    const dates = codes.map((c) => S[c].surveyedOn).filter(Boolean).sort();
    return {
      total: codes.length,
      asOf: dates.length ? dates[dates.length - 1] : null,
      required,
      narrow,
      noneFound,
      narrowNotes: narrow.map((c) => ({ code: c, name: S[c].name, note: S[c].registrationNote || '' })),
      eligibleCount: eligible.length,
      eligibleRequired: required.filter((c) => !out.has(c)),
      eligibleNarrow: narrow.filter((c) => !out.has(c)),
      attorneyReviewed: codes.filter((c) => S[c].reviewedBy).length,
    };
  }

  /** Findings for the states a promotion can reach, registration states first, then alphabetical. */
  function stateNotes(excluded) {
    const S = NS.STATE_SURVEY || {};
    const out = new Set(excluded || []);
    const rank = { required: 0, partial: 1 };
    const r = (c) => (S[c].registration in rank ? rank[S[c].registration] : 2);
    return Object.keys(S)
      .filter((c) => !out.has(c))
      .sort((a, b) => r(a) - r(b) || a.localeCompare(b))
      .map((c) => ({ code: c, name: S[c].name, registration: S[c].registration, registrationNote: S[c].registrationNote || '', surveyedOn: S[c].surveyedOn, findings: S[c].findings.slice() }));
  }

  NS.coverage = coverage;
  NS.stateNotes = stateNotes;
  if (typeof module !== 'undefined') module.exports = NS;
})();
