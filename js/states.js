/* Promo Hero: state survey. One record per state, filled in batches of 10 from primary sources.
 * Each finding has a status:
 *   "verified"   primary statute or regulation text was read (via a summarizing fetch tool, so a human should re-read the cited text)
 *   "secondary"  only a secondary source (law firm or platform blog) or a search snippet supports it; do not rely on it
 *   "notfound"   searched and nothing found; this is NOT proof that no rule exists
 * "registration" is the answer to: does a general consumer sweepstakes need state registration or a bond?
 * reviewedBy stays null until an attorney signs off. Nothing here is legal advice. */
(function () {
  const NS = (globalThis.PromoHero = globalThis.PromoHero || {});

  const SURVEYED_ON = '2026-09-27';
  const f = (status, topic, summary, cite, url, excerpt) => ({ status, topic, summary, cite: cite || '', url: url || '', excerpt: excerpt || '' });

  const STATES = {
    AL: {
      name: 'Alabama', batch: 1, surveyedOn: SURVEYED_ON, reviewedBy: null,
      registration: 'notfound',
      findings: [
        f('notfound', 'registration', 'No registration or bond rule found for general sweepstakes. Secondary sources say none.'),
        f('verified', 'lottery definition', 'Gambling and contest of chance are defined; a lottery involves payment for chances.', 'Ala. Code 13A-12-20',
          'https://codes.findlaw.com/al/title-13a-criminal-code/al-code-sect-13a-12-20/',
          'Contest of chance: any contest, game, gaming scheme or gaming device in which the outcome depends in a material degree upon an element of chance, notwithstanding that skill of the contestants may also be a factor therein.'),
        f('secondary', 'deceptive mail solicitations', 'Civil action for solicitations by mail that say the recipient has won or been selected unless qualifying language is conspicuous.', 'Ala. Code 8-19D-2 (chapter 19D)',
          'https://law.justia.com/codes/alabama/title-8/chapter-19d/'),
        f('secondary', 'alcohol promotions', 'Alcohol-related promotions may need pre-approval by the state alcohol control board.'),
      ],
    },
    AK: {
      name: 'Alaska', batch: 1, surveyedOn: SURVEYED_ON, reviewedBy: null,
      registration: 'notfound',
      findings: [
        f('notfound', 'registration', 'No registration or bond rule found for general sweepstakes. Secondary sources say none. A 2000 Attorney General opinion (00-027) on this topic was not read.'),
        f('verified', 'lottery definition', 'Gambling means staking something of value on a contest of chance; a contest of chance is one where chance is a material factor even if skill also matters.', 'Alaska Stat. 11.66.280',
          'https://codes.findlaw.com/ak/title-11-criminal-law/ak-st-sect-11-66-280/',
          'Contest of chance: a contest, game, gaming scheme, or gaming device in which the outcome depends in a material degree upon an element of chance, notwithstanding that the skill of the contestants may also be a factor'),
      ],
    },
    AZ: {
      name: 'Arizona', batch: 1, surveyedOn: SURVEYED_ON, reviewedBy: null,
      registration: 'partial',
      findings: [
        f('verified', 'registration (narrow)', 'Amusement gambling intellectual contests must register with the Attorney General before running, file rules and a sworn statement that no increment was added to the product price, and file winner names within 10 days after prizes are awarded. 501 organizations and school academic competitions are exempt. The statute does not cover ordinary random-draw sweepstakes. The definition of an amusement gambling intellectual contest (13-3301(1)(d)(iii)) was not read, so which contests qualify is unconfirmed.',
          'A.R.S. 13-3311', 'https://www.azleg.gov/ars/13/03311.htm',
          'Before any person conducts an amusement gambling intellectual contest or event ... the person shall register with the attorney general\'s office.'),
        f('verified', 'gambling definition', 'Gambling is risking or giving something of value for the opportunity to obtain a benefit from a game or contest of chance or skill.', 'A.R.S. 13-3301', 'https://www.azleg.gov/ars/13/03301.htm',
          'one act of risking or giving something of value for the opportunity to obtain a benefit from a game or contest of chance or skill or a future contingent event'),
        f('verified', 'exclusions', 'No exclusion for contests or sweepstakes in 13-3302; it lists amusement, social and regulated gambling, fairs, and nonprofit raffles.', 'A.R.S. 13-3302', 'https://www.azleg.gov/ars/13/03302.htm'),
      ],
    },
    AR: {
      name: 'Arkansas', batch: 1, surveyedOn: SURVEYED_ON, reviewedBy: null,
      registration: 'notfound',
      findings: [
        f('verified', 'prize promotion act: prohibited practices', 'Bans misleading prize notices, false winner or finalist claims, false urgency, and claims that multiple purchases raise the chance of winning. No registration or bond in the section read.', 'Ark. Code 4-102-105',
          'https://codes.findlaw.com/ar/title-4-business-and-commercial-law/ar-code-sect-4-102-105/',
          'Representing that a person will have an increased chance of receiving a prize by making multiple or duplicate purchases'),
        f('verified', 'prize promotion act: disclosures and timing', 'Required information must be clearly and conspicuously in the rules of any solicitation with sweepstakes entry materials, and prize notification and delivery steps must begin within 30 days of a prize award.', 'Ark. Code 4-102-104',
          'https://codes.findlaw.com/ar/title-4-business-and-commercial-law/ar-code-sect-4-102-104/',
          'the notification and steps to deliver a prize are commenced within thirty (30) days of a prize award'),
        f('verified', 'prize promotion act: odds disclosure', 'A written prize notice must show sponsor name and address, retail value, odds per prize in the form "___ out of ___" next to each prize in the same size and boldness of type, fees, restrictions and eligibility.', 'Ark. Code 4-102-106(b), (c)',
          'https://codes.findlaw.com/ar/title-4-business-and-commercial-law/ar-code-sect-4-102-106/',
          '___ (number of prizes) out of ___ (notices distributed)'),
        f('notfound', 'scope', 'Whether the Act reaches online promotions with no written prize notice was not confirmed.'),
      ],
    },
    CA: {
      name: 'California', batch: 1, surveyedOn: SURVEYED_ON, reviewedBy: null,
      registration: 'notfound',
      findings: [
        f('verified', 'sweepstakes solicitation materials', 'Rules must carry a clear no-purchase-necessary message in a separate paragraph, in capitals, in contrasting type; no-purchase entries must not be disadvantaged in winner selection; the date winners will be determined must be disclosed; false winner, special selection and urgency claims are barred. No registration or bond in this section.', 'Cal. Bus. & Prof. Code 17539.15',
          'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=17539.15',
          'Sweepstakes entries not accompanied by an order for products or services shall not be subjected to any disability or disadvantage in the winner selection process.'),
        f('secondary', 'other sections', 'Section 17539.1 (winner and increased-odds representations) and 17539.3 were seen only in search snippets. Contest disclosure of contestant numbers and solve rates was seen only in a snippet.', 'Cal. Bus. & Prof. Code 17539.1',
          'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=17539.1'),
      ],
    },
    CO: {
      name: 'Colorado', batch: 1, surveyedOn: SURVEYED_ON, reviewedBy: null,
      registration: 'notfound',
      findings: [
        f('verified', 'registration', 'Section 6-1-803 contains no registration, bond or filing requirement. A secondary source claims registration and a bond above $5,000, seven days before start; that claim is not supported by this section and looks like a mix-up with Florida.', 'C.R.S. 6-1-803',
          'https://codes.findlaw.com/co/title-6-consumer-and-commercial-affairs/co-rev-st-sect-6-1-803/'),
        f('verified', 'disclosures and prohibitions', 'Sponsors must disclose the no purchase necessary message, the retail value of each prize, estimated odds, sponsor name and address, restrictions, entry deadline and official rules. Payment as a condition of awarding a prize, unconditional winner claims, false special selection and false urgency are barred.', 'C.R.S. 6-1-803',
          'https://codes.findlaw.com/co/title-6-consumer-and-commercial-affairs/co-rev-st-sect-6-1-803/'),
        f('verified', 'scope', 'The article defines sweepstakes, contests and prize notices (written notices delivered by mail or courier). Whether 6-1-803 applies to online promotions without a prize notice was not confirmed.', 'C.R.S. 6-1-802',
          'https://codes.findlaw.com/co/title-6-consumer-and-commercial-affairs/co-rev-st-sect-6-1-802/',
          'Prize notice: a written notice ... delivered by the United States postal service or by a private carrier'),
      ],
    },
    CT: {
      name: 'Connecticut', batch: 1, surveyedOn: SURVEYED_ON, reviewedBy: null,
      registration: 'notfound',
      findings: [
        f('verified', 'sweepstakes restriction (needs human read)', 'The fetch summary says the statute bars a sweepstakes not related to the bona fide sale of goods, services or property, or one using a simulated gambling device, with an exception for grocery chains of five or more establishments. Whether the two conditions are alternatives or combined must be confirmed in the statute text, because the first reading would be significant for standalone giveaways.', 'Conn. Gen. Stat. 42-301',
          'https://codes.findlaw.com/ct/title-42-business-selling-trading-and-collection-practices/ct-gen-st-sect-42-301/'),
        f('verified', 'deceptive representations', 'Regulation limits misleading prize language ("finalist", "has won" without qualifying language, "held" or "reserved" prizes, forfeiture threats). No registration or bond.', 'Conn. Agencies Regs. 42-295-1',
          'https://www.law.cornell.edu/regulations/connecticut/Regs-Conn-State-Agencies-SS-42-295-1'),
        f('notfound', 'registration', 'A secondary source claims registration and a bond above $10,000, 10 days before start. Not found in 42-301, in the regulation, or on the Department of Consumer Protection game promotion page. Treat as unconfirmed.'),
      ],
    },
    DE: {
      name: 'Delaware', batch: 1, surveyedOn: SURVEYED_ON, reviewedBy: null,
      registration: 'notfound',
      findings: [
        f('verified', 'winner records (telemarketing only)', 'Sellers using telemarketing must keep the name and last known address of prize recipients and a description of the prize for prizes valued at $25 or more, for 24 months. Secondary sources describe this as a general sweepstakes rule; it is not.', '6 Del. C. Ch. 25A (2504A)',
          'https://delcode.delaware.gov/title6/c025a/index.html',
          'The name and last known address of each prize recipient and the description of the prize awarded for prizes represented to have a value of $25 or more'),
        f('notfound', 'registration and lottery law', 'No registration or bond rule found for general sweepstakes. The general gambling statutes in Title 11 and the consumer fraud act were not read.'),
      ],
    },
    GA: {
      name: 'Georgia', batch: 1, surveyedOn: SURVEYED_ON, reviewedBy: null,
      registration: 'notfound',
      findings: [
        f('verified', 'lottery definition and exclusions (needs human read)', 'A lottery is a scheme where prizes are distributed by chance among persons who have paid or promised consideration. The summary lists exclusions including lawful promotional giveaways, no-purchase prize giveaways, authorized raffles and certain large-company sweepstakes. The exact subsections and conditions of each exclusion must be read in the statute.', 'O.C.G.A. 16-12-20',
          'https://codes.findlaw.com/ga/title-16-crimes-and-offenses/ga-code-sect-16-12-20/',
          'any scheme or procedure whereby one or more prizes are distributed by chance among persons who have paid or promised consideration for a chance to win such prize'),
        f('notfound', 'registration', 'No registration or bond rule found in the section read. The Fair Business Practices Act and Attorney General regulations mentioned by secondary sources were not read.'),
      ],
    },
    HI: {
      name: 'Hawaii', batch: 1, surveyedOn: SURVEYED_ON, reviewedBy: null,
      registration: 'partial',
      findings: [
        f('verified', 'real property prize bond', 'A prize of real property requires a bond of not less than $10,000 filed and maintained with the director of commerce and consumer affairs.', 'Haw. Rev. Stat. 481B-1.6(e)',
          'https://codes.findlaw.com/hi/division-2-business/hi-rev-st-sect-481b-1-6/',
          'not less than $10,000'),
        f('verified', 'prize disclosures', 'If some or all prizes may not be awarded, that fact and the dates winners will be determined must be disclosed in writing before entry, and handling, shipping, delivery or other fees must be clearly disclosed.', 'Haw. Rev. Stat. 481B-1.6',
          'https://codes.findlaw.com/hi/division-2-business/hi-rev-st-sect-481b-1-6/',
          'That some or all of the prizes may not be awarded; and The date or dates on which a determination of winners will be made'),
        f('secondary', 'travel prizes', 'Secondary sources say travel prizes trigger Sellers of Travel registration. Not verified.'),
        f('notfound', 'registration', 'No registration or bond rule found for general sweepstakes other than the real property bond.'),
      ],
    },
  };

  STATES.AZ.registrationNote = 'Judged contests that qualify as amusement gambling intellectual contests must register with the Attorney General. Which contests qualify is unconfirmed.';
  STATES.HI.registrationNote = 'A real property prize needs a bond of at least $10,000 filed with the director of commerce and consumer affairs.';

  NS.STATE_SURVEY = STATES;
  if (typeof module !== 'undefined') module.exports = NS;
})();
