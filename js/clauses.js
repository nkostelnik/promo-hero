/* Promo Hero: clause library and assembler.
 * generateTerms(answers) returns { title, sections: [{ title, blocks }], placeholders, stops }.
 * Block shapes: { p }, { caps }, { ul: [] }, { table: { head: [], rows: [[]] } }.
 * Anything the user has not supplied becomes a [BRACKETED PLACEHOLDER]. */
(function () {
  const NS = (globalThis.PromoHero = globalThis.PromoHero || {});
  const ZONES = { ET: 'Eastern Time', CT: 'Central Time', MT: 'Mountain Time', PT: 'Pacific Time' };
  const PLATFORM_NAMES = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', x: 'X', youtube: 'YouTube', linkedin: 'LinkedIn' };

  const has = (list, v) => Array.isArray(list) && list.includes(v);

  function usd(n) {
    n = Number(n) || 0;
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
  }

  function fmtDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null;
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function addDays(iso, n) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null;
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
  }

  function joinList(items, conj) {
    if (items.length <= 1) return items.join('');
    if (items.length === 2) return items[0] + ' ' + conj + ' ' + items[1];
    return items.slice(0, -1).join(', ') + ', ' + conj + ' ' + items[items.length - 1];
  }

  function generateTerms(a) {
    const placeholders = [];
    const ph = (label) => {
      if (!placeholders.includes(label)) placeholders.push(label);
      return '[' + label + ']';
    };
    const val = (v, label) => (v && String(v).trim() ? String(v).trim() : ph(label));

    const stops = (NS.evaluate ? NS.evaluate(a) : []).filter((f) => f.level === 'stop');
    const det = a.determination;
    const S = val(a.sponsorName, 'SPONSOR NAME');
    const promo = val(a.promoName, 'PROMOTION NAME');
    const zone = ZONES[a.timeZone] || ZONES.ET;
    const start = fmtDate(a.startDate) || ph('START DATE');
    const end = fmtDate(a.endDate) || ph('END DATE');
    const site = val(a.website, 'PROMOTION WEB ADDRESS');
    const email = val(a.contactEmail, 'CONTACT EMAIL');
    const govState = NS.stateName(a.governingLaw || a.sponsorState) || ph('GOVERNING LAW STATE');
    const structure = NS.classify(a);
    const paid = ['purchase', 'fee'].includes(a.consideration);
    const regs = NS.registrations(a);
    const total = NS.totalARV(a.prizes);
    const totalWinners = (a.prizes || []).reduce((n, p) => n + (Number(p.qty) || 0), 0);
    const platforms = a.platforms || [];
    const social = has(a.entryChannels, 'social');
    const submits = det === 'judged' || det === 'votes' || (social && has(a.socialActions, 'post'));
    const sections = [];
    const sec = (title, blocks) => sections.push({ title, blocks: blocks.filter(Boolean) });

    // ---- preface
    let caps;
    if (det === 'random') {
      if (!structure.lottery) {
        caps = a.consideration === 'none'
          ? 'NO PURCHASE OR PAYMENT OF ANY KIND IS NECESSARY TO ENTER OR WIN. THIS PROMOTION IS A SWEEPSTAKES. A PURCHASE OR PAYMENT WILL NOT INCREASE YOUR CHANCES OF WINNING. VOID WHERE PROHIBITED BY LAW.'
          : 'NO PURCHASE NECESSARY TO ENTER OR WIN. A PURCHASE OR PAYMENT OF ANY KIND WILL NOT INCREASE YOUR CHANCES OF WINNING. VOID WHERE PROHIBITED BY LAW.';
      } else {
        caps = ph('UNRESOLVED: this structure needs a free method of entry with equal odds. See the legal flags');
      }
    } else if (det === 'judged') {
      caps = 'THIS PROMOTION IS A CONTEST OF SKILL, NOT A GAME OF CHANCE. ' + (a.consideration === 'none' ? 'NO PURCHASE NECESSARY TO ENTER OR WIN. ' : '') + 'VOID WHERE PROHIBITED BY LAW.';
    } else if (det === 'votes') {
      caps = structure.lottery
        ? ph('UNRESOLVED: paid entry or voting in a popularity contest is high risk. See the legal flags')
        : 'NO PURCHASE NECESSARY TO ENTER, VOTE, OR WIN. VOID WHERE PROHIBITED BY LAW.';
    } else {
      caps = (a.consideration === 'none' ? 'NO PURCHASE NECESSARY TO ENTER OR WIN. ' : '') + 'VOID WHERE PROHIBITED BY LAW.';
    }
    const preface = [
      { caps },
      { caps: 'BY PARTICIPATING, YOU AGREE TO BE BOUND BY THESE OFFICIAL RULES AND BY THE DECISIONS OF SPONSOR, WHICH ARE FINAL AND BINDING IN ALL MATTERS RELATING TO THE PROMOTION.' },
    ];
    if (a.disputeResolution === 'arbitration') {
      preface.push({ caps: 'THESE RULES CONTAIN AN ARBITRATION AGREEMENT AND CLASS ACTION WAIVER THAT AFFECT YOUR LEGAL RIGHTS. SEE THE SECTION TITLED GOVERNING LAW AND DISPUTES.' });
    }
    sections.push({ title: null, blocks: preface });

    // ---- sponsor
    sec('Sponsor and Administrator', [
      { p: 'The ' + promo + ' (the "Promotion") is sponsored by ' + S + ', ' + val(a.sponsorAddress, 'SPONSOR ADDRESS') + ' ("Sponsor").' },
      a.adminName && a.adminName.trim() ? { p: 'The Promotion is administered on behalf of Sponsor by ' + a.adminName.trim() + ' ("Administrator").' } : null,
      { p: 'Questions about the Promotion may be sent to ' + email + '.' },
    ]);

    // ---- eligibility
    let ageText;
    if (a.minAge === '21') ageText = 'who are at least twenty-one (21) years old at the time of entry';
    else if (a.minAge === '13') ageText = 'who are at least thirteen (13) years old at the time of entry. Entrants who have not reached the age of majority in their state of residence must have the permission of a parent or legal guardian to enter, and if such an entrant wins, the prize will be awarded in the name of the parent or legal guardian, who must sign all required documents';
    else if (a.minAge === 'u13') ageText = ph('UNRESOLVED: collecting information from children under 13 requires verifiable parental consent. Revise the age limit');
    else ageText = 'who are at least eighteen (18) years old, or the age of majority in their state of residence, whichever is older, at the time of entry';
    const excluded = (a.excludedStates || []).map(NS.stateName);
    const geo = 'the fifty (50) United States and the District of Columbia' + (excluded.length ? ', excluding residents of ' + joinList(excluded, 'and') : '');
    sec('Eligibility', [
      { p: 'The Promotion is open only to legal residents of ' + geo + ' ' + ageText + '. Residents of U.S. territories and possessions and of all other countries are not eligible.' },
      { p: 'Employees, officers, directors, contractors, and agents of Sponsor, Administrator, and their respective parents, subsidiaries, affiliates, advertising and promotion agencies, and prize suppliers, and the members of their immediate families and persons living in the same household, are not eligible.' },
      { p: 'The Promotion is subject to all applicable federal, state, and local laws and regulations and is void where prohibited.' },
    ]);

    // ---- period
    sec('Promotion Period', [
      { p: 'The Promotion begins at 12:00:00 a.m. ' + zone + ' on ' + start + ' and ends at 11:59:59 p.m. ' + zone + ' on ' + end + ' (the "Promotion Period"). Sponsor\'s computer is the official timekeeping device for the Promotion.' },
    ]);

    // ---- how to enter
    const entryBlocks = [];
    const steps = [];
    if (has(a.entryChannels, 'form') || !(a.entryChannels || []).length) {
      steps.push('Online form: Visit ' + site + ' during the Promotion Period and complete the entry form with the required information.');
    }
    if (has(a.entryChannels, 'email')) {
      steps.push('Email: Send an email to ' + email + ' during the Promotion Period with the subject line "' + promo + ' Entry" and your full name, mailing address, and telephone number.');
    }
    if (social) {
      const plat = platforms.length ? joinList(platforms.map((p) => PLATFORM_NAMES[p] || 'the applicable social media platform'), 'or') : ph('SOCIAL PLATFORM');
      const acts = [];
      if (has(a.socialActions, 'follow')) acts.push('follow Sponsor\'s account, ' + ph('SPONSOR ACCOUNT'));
      if (has(a.socialActions, 'like')) acts.push('like the Promotion post');
      if (has(a.socialActions, 'comment')) acts.push('comment on the Promotion post');
      if (has(a.socialActions, 'post')) {
        const kind = { photo: 'photo', video: 'video', essay: 'written post', other: 'creative post' }[a.submissionType] || 'photo or video';
        acts.push('publicly post an original ' + kind + ' that follows the theme of the Promotion');
      }
      if (has(a.socialActions, 'hashtag')) acts.push('include the hashtag ' + val(a.hashtag, 'HASHTAG'));
      if (has(a.socialActions, 'tag')) acts.push('tag ' + ph('ACCOUNT TO TAG'));
      if (has(a.socialActions, 'share')) acts.push('share or repost the Promotion post');
      steps.push('Social media: During the Promotion Period, on ' + plat + ', ' + (acts.length ? joinList(acts, 'and') : 'follow the instructions in the Promotion post') + '.');
    }
    if (paid || a.consideration === 'effort') {
      steps.push('Additional requirement: ' + val(a.considerationDescription, 'DESCRIBE WHAT ENTRANTS MUST BUY, PAY, OR DO') + (det === 'random' ? ' A purchase or payment does not increase your chances of winning.' : ''));
    }
    entryBlocks.push({ p: 'To enter, use one of the following methods during the Promotion Period:' });
    entryBlocks.push({ ul: steps });
    if (social && (has(a.socialActions, 'post') || has(a.socialActions, 'hashtag') || has(a.socialActions, 'share'))) {
      entryBlocks.push({ p: 'Your account must be public through the end of the drawing or judging period so Sponsor can verify your entry. To comply with advertising disclosure rules, your post must clearly disclose that it is part of a promotion, for example by including ' + (det === 'judged' ? '#contest' : '#sweepstakes') + '.' });
    }
    entryBlocks.push({ p: { once: 'Limit one (1) entry per person for the entire Promotion Period.', daily: 'Limit one (1) entry per person per day during the Promotion Period.', unlimited: 'There is no limit on the number of entries per person, but each entry must be submitted separately and in accordance with these Official Rules.' }[a.entryLimit || 'once'] });
    entryBlocks.push({ p: 'Entries generated by script, macro, bot, or other automated means, or by any means that subverts the entry process, are void. Entries that are incomplete, illegible, late, forged, or submitted by anyone other than the entrant are void. Sponsor may treat the authorized account holder of the email address or social account used to enter as the entrant.' });
    sec('How to Enter', entryBlocks);

    // ---- AMOE
    if (a.hasAmoe === 'yes' && a.consideration !== 'none' && (det === 'random' || det === 'votes')) {
      const amoe = [];
      const m = a.amoeMethod || 'mail';
      if (m === 'mail' || m === 'both') {
        amoe.push({ p: 'By mail: Hand-print your name, complete address, telephone number, email address (if any), and the name of the Promotion on a 3" x 5" piece of paper and mail it in a stamped envelope to ' + ph('FREE ENTRY MAILING ADDRESS') + '. Mail-in requests must be postmarked by ' + end + ' and received within seven (7) days after the end of the Promotion Period. Each request must be mailed separately.' });
      }
      if (m === 'online' || m === 'both') {
        amoe.push({ p: 'Online: Visit ' + site + ' during the Promotion Period and select the free entry option, then complete the form. No purchase or payment is required.' });
      }
      amoe.push({ p: 'Free entries receive the same number of chances to win as entries made with a purchase, and are subject to the same deadlines and limits.' });
      sec('Free Method of Entry', amoe);
    }

    // ---- submissions
    if (submits) {
      const rules = [
        'is your original work and does not infringe the copyright, trademark, privacy, publicity, or other rights of anyone;',
        'does not contain third-party materials, including music, logos, or artwork, unless you have all necessary permissions;',
        'if it depicts any identifiable person, is accompanied by that person\'s consent;',
        'is not obscene, defamatory, hateful, unlawful, or otherwise objectionable, as determined by Sponsor in its sole discretion; and',
        'does not promote alcohol, tobacco, firearms, drugs, or any political or religious message.',
      ];
      sec('Submission Requirements and License', [
        { p: 'Each submission must comply with the following. Your submission:' },
        { ul: rules },
        { p: 'You keep ownership of your submission. By submitting it, you grant Sponsor and its designees a non-exclusive, worldwide, perpetual, irrevocable, royalty-free, sublicensable license to use, reproduce, display, edit, and distribute the submission in any media in connection with the Promotion and the promotion of Sponsor and its products, without notice, approval, or compensation, except where prohibited by law. Sponsor may disqualify or remove any submission that does not comply with these rules.' },
      ]);
    }

    // ---- winner selection
    const sel = [];
    if (det === 'random') {
      const drawIso = addDays(a.endDate, Number(a.drawDays) || 7);
      const drawDate = fmtDate(drawIso);
      sel.push({ p: 'Winner(s) will be selected in a random drawing from all eligible entries received during the Promotion Period. The drawing will be conducted on or about ' + (drawDate || ph('DRAWING DATE')) + ' by Sponsor or Administrator, whose decisions are final. The odds of winning depend on the number of eligible entries received.' });
    } else if (det === 'judged') {
      sel.push({ p: 'Eligible entries will be judged by ' + val(a.judgesDescription, 'JUDGES') + ' on the following criteria: ' + val(a.judgingCriteria, 'JUDGING CRITERIA') + '.' });
      sel.push({ p: 'The eligible entry with the highest total score in each prize category will be the winner. Judging is based solely on skill, and chance plays no role in selecting winners. In the event of a tie, the tied entries will be re-reviewed by the judges to determine the winner. Judges\' decisions are final.' });
    } else if (det === 'votes') {
      sel.push({ p: 'Winner(s) will be determined by voting as follows: ' + val(a.voteMethod, 'HOW VOTES ARE CAST AND COUNTED') + '. The eligible entry with the most valid votes will win. Sponsor may disqualify votes and entries it believes, in its sole discretion, were generated by bots, purchased, or obtained through fraud or any other unfair means. In the event of a tie, a panel selected by Sponsor will determine the winner.' });
    } else {
      sel.push({ p: 'The first ' + (totalWinners || ph('NUMBER')) + ' eligible entrant(s) who ' + val(a.firstcomeRule, 'WHAT ENTRANTS MUST DO AND HOW FIRST IS MEASURED') + ' will win. Sponsor\'s records and timestamps are final and binding.' });
    }
    sec('Winner Selection', sel);

    // ---- prizes
    const rows = (a.prizes || []).filter((p) => p.desc && p.desc.trim()).map((p) => [p.desc.trim(), String(Number(p.qty) || 0), usd(p.arv)]);
    const prizeBlocks = [];
    prizeBlocks.push(rows.length ? { table: { head: ['Prize', 'Quantity', 'Approximate retail value (ARV) each'], rows } } : { p: ph('PRIZE DESCRIPTIONS') });
    prizeBlocks.push({ p: 'Total ARV of all prizes: ' + usd(total) + '. If the actual value of a prize is less than the stated ARV, the difference will not be awarded.' });
    prizeBlocks.push({ p: 'Prizes are not transferable and cannot be exchanged or redeemed for cash except at Sponsor\'s discretion. Sponsor may substitute a prize of equal or greater value if a prize becomes unavailable. The winner is solely responsible for all federal, state, and local taxes and for any costs or expenses associated with the prize that are not expressly stated in these Official Rules. Winners may be required to complete tax forms before receiving a prize.' });
    if (has(a.prizeTypes, 'cash')) prizeBlocks.push({ p: 'Cash prizes will be paid by check or electronic transfer within sixty (60) days after the winner is verified.' });
    if (has(a.prizeTypes, 'giftcard')) prizeBlocks.push({ p: 'Gift cards are subject to the issuer\'s terms and conditions. Sponsor is not responsible for lost, stolen, or expired cards.' });
    if (has(a.prizeTypes, 'travel')) prizeBlocks.push({ p: 'Travel prizes: Unless stated above, the winner is responsible for ground transportation, meals, incidentals, and all other travel costs. Travel is subject to availability and blackout dates, must be completed by ' + ph('TRAVEL COMPLETION DATE') + ', and any travel companion must be an eligible adult who signs Sponsor\'s release. Sponsor is not responsible for cancelled or delayed travel.' });
    if (has(a.prizeTypes, 'experience')) prizeBlocks.push({ p: 'Experience and event prizes are subject to availability. The winner and any guest must sign a release, and Sponsor is not responsible if an event is cancelled, postponed, or changed.' });
    if (has(a.restricted, 'alcohol')) prizeBlocks.push({ p: 'Alcohol prizes: The winner must be at least twenty-one (21) years old and must show valid identification. Alcohol prizes will not be shipped to any location where such shipment is prohibited by law.' });
    sec('Prizes', prizeBlocks);

    // ---- notification
    const via = { email: 'by email', dm: 'by direct message on the platform used to enter', phone: 'by telephone' }[a.notifyMethod] || 'by email';
    const claim = Number(a.claimDays) || 7;
    const alt = a.unclaimed === 'forfeit'
      ? 'the prize will be forfeited and will not be awarded'
      : (det === 'judged' || det === 'votes' ? 'the prize will be forfeited and Sponsor may award it to the next-highest ranked eligible entrant' : 'the prize will be forfeited and Sponsor may select an alternate winner from the remaining eligible entries');
    sec('Winner Notification and Verification', [
      { p: 'Potential winners will be notified ' + via + ' using the contact information provided at entry. A potential winner must respond within ' + claim + ' days after the first notification attempt and, if requested, return a signed Affidavit of Eligibility and Liability Release' + (a.publicityRelease === 'no' ? '' : ' (and, where permitted by law, Publicity Release)') + ', and any required tax forms, within the time stated by Sponsor. Winners may be required to verify their age and residency. If a potential winner does not respond in time, cannot be reached, is found to be ineligible, or does not comply with these Official Rules, ' + alt + '. Winners are not required to pay anything to receive a prize.' },
    ]);

    // ---- general conditions
    sec('General Conditions', [
      { p: 'Sponsor reserves the right, in its sole discretion, to disqualify any person it believes is tampering with the entry process or the operation of any website or platform, violating these Official Rules, or acting in a way that is unsportsmanlike or disruptive or intended to annoy, abuse, threaten, or harass any other person.' },
      { p: 'If fraud, technical failures, or any other factor beyond Sponsor\'s reasonable control impairs the integrity or proper functioning of the Promotion, Sponsor may, in its sole discretion, cancel, terminate, modify, or suspend the Promotion and, where applicable, select winners from among all eligible, non-suspect entries received before the action was taken. Sponsor is not required to award more prizes than stated in these Official Rules.' },
      { caps: 'ANY ATTEMPT TO DELIBERATELY DAMAGE ANY WEBSITE OR UNDERMINE THE LEGITIMATE OPERATION OF THE PROMOTION MAY BE A VIOLATION OF CRIMINAL AND CIVIL LAW.' },
      { p: 'If any provision of these Official Rules is held unenforceable, the remaining provisions remain in effect.' },
    ]);

    // ---- release
    sec('Release and Limitation of Liability', [
      { p: 'To the fullest extent permitted by law, by participating you release and hold harmless Sponsor, Administrator, any social media platform used in the Promotion, and their respective parents, subsidiaries, affiliates, prize suppliers, and advertising and promotion agencies, and each of their officers, directors, employees, and agents, from any claims, losses, or damages of any kind arising out of your participation in the Promotion or your receipt, use, or misuse of any prize, including personal injury, death, and property damage.' },
      { p: 'Sponsor is not responsible for late, lost, misdirected, incomplete, or garbled entries, for technical, hardware, software, or network failures of any kind, or for any error in these Official Rules. Nothing in these Official Rules excludes liability that cannot be excluded under applicable law.' },
    ]);

    // ---- publicity
    if (a.publicityRelease !== 'no') {
      sec('Publicity', [
        { p: 'Except where prohibited by law, participation in the Promotion constitutes each winner\'s consent to Sponsor\'s and its designees\' use of the winner\'s name, city and state of residence, likeness, statements, and prize information' + (submits ? ', and the winner\'s submission,' : '') + ' for advertising and promotional purposes in any media, without further notice, compensation, or approval.' },
      ]);
    }

    // ---- privacy
    const privacy = [{ p: 'Information collected in connection with the Promotion will be used to administer the Promotion and will be handled under Sponsor\'s Privacy Policy at ' + val(a.privacyUrl, 'PRIVACY POLICY WEB ADDRESS') + '.' }];
    if (a.marketing === 'optional') privacy.push({ p: 'Entrants may choose to receive marketing communications from Sponsor by selecting a separate, unchecked opt-in box. Opting in is not required to enter and does not affect your chances of winning.' });
    if (a.marketing === 'required') privacy.push({ p: 'By entering, you agree to receive marketing emails from Sponsor. You may unsubscribe at any time using the link in any message.' });
    if (a.smsUsed === 'yes') privacy.push({ p: 'If you separately opt in to receive text messages, message and data rates may apply and you may reply STOP at any time to opt out. Consent to receive text messages is not a condition of entering the Promotion' + (paid ? ' or of making any purchase' : '') + '.' });
    sec('Privacy', privacy);

    // ---- platforms
    if (social && platforms.length) {
      const names = joinList(platforms.map((p) => PLATFORM_NAMES[p] || 'the applicable social media platform'), 'and');
      sec('Social Media Platforms', [
        { p: 'The Promotion is in no way sponsored, endorsed, administered by, or associated with ' + names + '. You are providing your information to Sponsor and not to any platform. Your participation is subject to each platform\'s terms of use, and you release each platform from any liability arising from the Promotion.' },
      ]);
    }

    // ---- winners list
    sec('Winners List and Official Rules', [
      { p: 'For the name of the winner(s), visit ' + site + ' or send a self-addressed, stamped envelope to ' + val(a.sponsorAddress, 'SPONSOR ADDRESS') + ', Attn: ' + promo + ' Winners List, within sixty (60) days after the end of the Promotion Period. For a copy of these Official Rules, visit ' + site + '.' },
    ]);

    // ---- registration
    if (regs.length) {
      const items = [];
      if (regs.includes('NY')) items.push('New York: Registered with the New York Department of State, Registration No. ' + ph('NEW YORK REGISTRATION NUMBER') + '.');
      if (regs.includes('FL')) items.push('Florida: Registered with the Florida Department of Agriculture and Consumer Services, Registration No. ' + ph('FLORIDA REGISTRATION NUMBER') + '.');
      if (regs.includes('RI')) items.push('Rhode Island: Registered with the Rhode Island Secretary of State, Registration No. ' + ph('RHODE ISLAND REGISTRATION NUMBER') + '.');
      sec('State Registrations', [{ ul: items }]);
    }

    // ---- governing law
    if (a.disputeResolution === 'arbitration') {
      sec('Governing Law and Disputes', [
        { p: 'These Official Rules and the Promotion are governed by the laws of the State of ' + govState + ', without regard to conflict of law principles, and the Federal Arbitration Act.' },
        { p: 'Except where prohibited by law, and except for claims that qualify for small claims court, any dispute arising out of the Promotion or these Official Rules will be resolved by binding individual arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules. YOU AND SPONSOR WAIVE ANY RIGHT TO A JURY TRIAL AND TO PARTICIPATE IN A CLASS ACTION OR CLASS ARBITRATION. If this class waiver is held unenforceable, this arbitration agreement will not apply.' },
        { p: 'You may opt out of arbitration by emailing ' + email + ' within thirty (30) days after you first enter the Promotion.' },
        { p: 'To the extent permitted by law, you waive any right to punitive, incidental, or consequential damages and any right to have damages multiplied or increased.' },
      ]);
    } else {
      sec('Governing Law and Disputes', [
        { p: 'These Official Rules and the Promotion are governed by the laws of the State of ' + govState + ', without regard to conflict of law principles. Except where prohibited by law, any dispute arising out of the Promotion or these Official Rules must be brought exclusively in the state or federal courts located in the State of ' + govState + ', and you consent to the jurisdiction of those courts.' },
        { p: 'To the extent permitted by law, you waive any right to punitive, incidental, or consequential damages and any right to have damages multiplied or increased.' },
      ]);
    }

    return { title: promo + ' Official Rules', sections, placeholders, stops };
  }

  function plain(b) {
    if (b.caps) return b.caps;
    if (b.p) return b.p;
    if (b.ul) return b.ul.map((i) => '  - ' + i).join('\n');
    if (b.table) return [b.table.head.join(' | ')].concat(b.table.rows.map((r) => r.join(' | '))).join('\n');
    return '';
  }

  function toText(doc) {
    let n = 0;
    const out = [doc.title.toUpperCase(), ''];
    doc.sections.forEach((s) => {
      if (s.title) out.push(++n + '. ' + s.title.toUpperCase());
      s.blocks.forEach((b) => out.push(plain(b), ''));
    });
    return out.join('\n').trim() + '\n';
  }

  NS.generateTerms = generateTerms;
  NS.termsToText = toText;
  NS.usd = usd;
  if (typeof module !== 'undefined') module.exports = NS;
})();
