/* Promo Hero: state survey, batches 2 to 5 (all remaining states, surveyed 2026-09-27).
 * Same rules as states.js. The 15 states that had only secondary evidence here (IL, IN, KY, ME, NV, NH, NJ, NM, OH, OK, PA, SD, UT, WY, DC) were re-verified and moved to states3.js. Extra note on evidence quality:
 *   Iowa and North Dakota text was read directly from the official legislature PDFs.
 *   Most other "verified" findings were read through a summarizing fetch tool, so a human should re-read the cited text.
 *   "secondary" findings rest on law-firm or vendor blogs or search snippets and must not be relied on.
 * Nothing here is legal advice. reviewedBy stays null until an attorney signs off. */
(function () {
  const NS = (globalThis.PromoHero = globalThis.PromoHero || {});
  const ON = '2026-09-27';
  const f = (status, topic, summary, cite, url, excerpt) => ({ status, topic, summary, cite: cite || '', url: url || '', excerpt: excerpt || '' });
  const s = (name, batch, registration, findings) => ({ name, batch, surveyedOn: ON, reviewedBy: null, registration, findings });

  const NO_REG = 'No registration or bond rule found for a general consumer sweepstakes.';

  const MORE = {
    ID: s('Idaho', 2, 'notfound', [
      f('verified', 'free entry rule', 'It is unlawful for sellers to run any game of chance, contest, sweepstakes or promotion that requires an entry fee, service charge, purchase or other obligation to enter or participate. No registration, bond or filing. Charitable bingo and raffles under Title 67, ch. 77 are exempt.', 'IDAPA 04.02.01.080',
        'https://www.law.cornell.edu/regulations/idaho/IDAPA-04.02.01.080',
        'requires any kind of entry fee, service charge, purchase, payments to information providers, or other obligation in order to enter or participate'),
      f('secondary', 'gambling definition', 'Idaho Code 18-3801 defines gambling as risking a thing of value on a contest of chance. Seen only in search results.', 'Idaho Code 18-3801', 'https://legislature.idaho.gov/statutesrules/idstat/title18/t18ch38/sect18-3801/'),
      f('secondary', 'telecom offers', 'A secondary source says sweepstakes may not be combined with telecommunication service offers.'),
    ]),
    IA: s('Iowa', 3, 'notfound', [
      f('verified', 'prize promotions chapter', 'Text read directly from the official code PDF. A sponsor may not require a purchase, payment or donation to award or compete for a prize (or create that impression) unless the person first gets a written prize notice with sponsor name, retail value, odds ("__ out of __"), fees, restrictions, eligibility and sales presentation details. Prohibited practices include false winner or finalist claims, false urgency and claims that multiple purchases raise the odds. Prizes must be provided within 30 days of a representation that a person won. The chapter has no registration or bond.', 'Iowa Code 714B.2, 714B.3, 714B.4',
        'https://www.legis.iowa.gov/docs/code/2023/714B.pdf',
        'A sponsor of a prize shall not require a person to purchase merchandise or pay or donate money as a condition of awarding a prize'),
      f('verified', 'winner records on request', 'On the attorney general\'s request made within one year after the promotion ends, a sponsor must provide names and addresses of winners of prizes of $100 or more.', 'Iowa Code 714B.5', 'https://www.legis.iowa.gov/docs/code/2023/714B.pdf',
        'a record of the names and addresses of all winners of prizes of one hundred dollars or more'),
      f('verified', 'exemptions', 'The chapter does not apply to advertising by sponsors registered under ch. 557B, licensed under ch. 99B, or regulated under ch. 99D to 99G, among others. Violations are an aggravated misdemeanor if intentional, and a private action recovers the greater of $500 or twice the loss.', 'Iowa Code 714B.6, 714B.8, 714B.10', 'https://www.legis.iowa.gov/docs/code/2023/714B.pdf'),
    ]),
    KS: s('Kansas', 3, 'notfound', [
      f('verified', 'prize notification', 'Solicitors and sponsors may not request or accept payment before delivering a written prize notice with sponsor name and address, verifiable retail value, odds, sales presentation details, fees, restrictions and eligibility limits. Misleading envelopes and false government-style notices are barred. No registration or bond.', 'K.S.A. 50-692', 'https://ksrevisor.gov/statutes/chapters/ch50/050_006_0092.html'),
      f('secondary', 'electronic machines', 'Secondary sources say electronic machines that enter a person in a sweepstakes while offering a game of chance are barred. Not verified.'),
    ]),
    LA: s('Louisiana', 3, 'partial', [
      f('verified', 'sweepstakes promotions', 'The attorney general regulates sweepstakes promotions, which the statute defines broadly to include any game or contest offered in connection with promoting a business or product, whether entry is free or through a bargained-for exchange. It prescribes how winners may be revealed (printed list, scratch-off, pull-tab, or written or telephone contact). No registration or bond in the text read.', 'La. R.S. 51:1726', 'https://legis.la.gov/legis/LawPrint.aspx?d=815644',
        'The Department of Justice, office of attorney general, shall regulate sweepstakes promotions'),
      f('verified', 'prize offers tied to sales presentations', 'Written prize or gift offers that invite or require a sales presentation must describe the exact prize and its cash value and terms, and the prize must be delivered whether or not the person buys. Contracts over $500 carry a three business day cancellation right. No registration or bond.', 'La. R.S. 51:1721', 'https://www.legis.la.gov/legis/Law.aspx?d=104108'),
      f('secondary', 'attorney general filings', 'R.S. 51:1732 (titled registration requirements for prizes, sweepstakes, games of chance, job lines and loans) is described in a search snippet as requiring sponsors that solicit calls to provide the attorney general with ad scripts and recordings, in a chapter about pay-per-call services. Text not read; treat as a possible filing duty for phone-based promotions.', 'La. R.S. 51:1732', 'https://legis.la.gov/legis/LawPrint.aspx?d=104115'),
    ]),
    MD: s('Maryland', 3, 'partial', [
      f('verified', 'alcohol sweepstakes and contests (registration-like)', 'For sweepstakes and contests tied to alcoholic beverages, proposals must be submitted to the Executive Director in time to be approved 14 days before the start; a purchase of alcohol cannot be required; an alternative means of entry is required; participants must be of legal drinking age. Some secondary sources describe a general Maryland ban on purchase requirements; this alcohol regulation may be the source.', 'COMAR 14.23.04.08', 'https://regs.maryland.gov/us/md/exec/comar/14.23.04.08',
        'Proposals for conducting a sweepstakes or contest in the State shall be submitted to the Executive Director in time to be approved 14 days before the start'),
      f('verified', 'charitable solicitation promotions', 'Promotions connected with a written charitable solicitation must disclose in writing the retail price of each prize, conditions to receive it, number of prizes per category and how to get a winners list, on the first page of the prize notification. County-regulated charitable raffles are excluded.', 'Md. Code, Gen. Bus. Reg. 6-503', 'https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gbr&section=6-503&enactments=false',
        'Each disclosure required under this section shall appear on the first page of the prize notification document.'),
      f('notfound', 'general registration', NO_REG),
    ]),
    MA: s('Massachusetts', 3, 'notfound', [
      f('verified', 'payment for a chance', 'It is an unfair and deceptive practice to solicit or accept payment for a chance to win a prize, or to run a business or transaction where a gambling purpose predominates over the bona fide sale of goods or services. No registration.', '940 CMR 30.04', 'https://www.law.cornell.edu/regulations/massachusetts/940-CMR-30-04',
        'a gambling purpose predominates over the bona fide sale of bona fide goods or services'),
      f('verified', 'prize advertising', 'Sellers offering prizes must clearly identify the prize and its value, disclose material conditions (geography, dates, entry requirements, eligibility, tax responsibility), make official rules available at entry, disclose quantities, and deliver prizes when conditions are met. No registration or filing.', '940 CMR 6.08', 'https://www.law.cornell.edu/regulations/massachusetts/940-CMR-6-08'),
    ]),
    MI: s('Michigan', 3, 'notfound', [
      f('verified', 'game promotions', 'A game promotion (chance and prize with no consideration) requires disclosure of the geographic area or outlets, an accurate description of each prize type, and the minimum number and amount of cash prizes and of other prizes. The winner may not be predetermined. Violations are a misdemeanor. No registration or bond.', 'MCL 750.372a', 'https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-750-372a',
        'any game or contest in which the elements of chance and prize are present but in which the element of consideration is not present'),
      f('verified', 'promotional lottery exception', 'A lottery or gift enterprise is allowed as a promotional activity that is clearly occasional and ancillary to the primary business, calculated to promote it, with no payment solely for the chance and no purchase at substantially inflated prices.', 'MCL 750.372', 'https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-750-372'),
      f('secondary', 'alcohol on-premises promotions', 'A secondary source and a Liquor Control Commission form indicate on-premises promotions at licensed establishments need an entertainment permit and approval above $250. Not verified.'),
    ]),
    MN: s('Minnesota', 3, 'notfound', [
      f('verified', 'prize notices', 'A sponsor may not require payment to award or compete for a prize unless the person first receives a written prize notice with sponsor name and address, retail value, odds, fees, restrictions and eligibility, presented in immediate proximity in matching type. Violations carry criminal penalties up to $10,000 or two years and civil recovery of the greater of $500 or twice the loss. No registration or bond.', 'Minn. Stat. 325F.755', 'https://www.revisor.mn.gov/statutes/cite/325F.755'),
    ]),
    MS: s('Mississippi', 4, 'notfound', [
      f('verified', 'internet sweepstakes cafes', 'Bans electronic video monitors that offer simulated gambling for consideration. Lawful marketing promotions, contests, prizes or sweepstakes designed to attract attention to a product or service are excluded.', 'Miss. Code 97-33-8', 'https://codes.findlaw.com/ms/title-97-crimes/ms-code-sect-97-33-8/',
        'Any lawful marketing promotion, contest, prize or sweepstakes that is designed to attract consumer attention to a specific product or service'),
      f('notfound', 'registration', NO_REG),
    ]),
    MO: s('Missouri', 4, 'partial', [
      f('verified', 'attorney general notice (narrow)', 'Anyone using a promotional device or program, including sweepstakes, gift awards, drawings or prize inducements, to advertise or sell time-share properties or tourist-related services must notify the Missouri attorney general in writing at least 14 days before release. Promised gifts not delivered within 10 days can support damages of at least five times the retail value of the most expensive gift, up to $1,000.', 'RSMo 407.610', 'https://revisor.mo.gov/main/OneSection.aspx?section=407.610',
        'shall notify the Missouri attorney general in writing of this intention not less than fourteen days prior to release of such materials to the public'),
      f('notfound', 'general registration', NO_REG),
    ]),
    MT: s('Montana', 4, 'notfound', [
      f('verified', 'attorney general guidance', 'The Department of Justice says a sweepstakes is a free promotional game of chance, defined in MCA 23-5-112(38) as distribution of property among people who have not paid or been expected to pay consideration. It says paying for a membership or donating cannot be a prerequisite and that a sweepstakes must not unfairly predetermine winners (ARM 23.16.3501(5)). The FAQ also says ARM 42.13.212 requires the promoter to be a registered industry member and bars alcohol as a prize, which reads as an alcohol-industry rule; confirm scope by reading the rule.', 'Mont. DOJ Sweepstakes FAQ; MCA 23-5-112; ARM 42.13.212',
        'https://dojmt.gov/wp-content/uploads/2026/03/Sweepstakes-FAQs.pdf',
        'Sweepstakes must be free to enter throughout the promotion.'),
      f('notfound', 'registration', NO_REG),
    ]),
    NE: s('Nebraska', 4, 'notfound', [
      f('verified', 'prize promotion definition', 'A prize promotion means a sweepstakes or other game of chance, or a representation that a person has won, has been selected, or may be eligible to receive a prize. The fetch summary read the definition as applying to all prize promotions, not only telemarketing.', 'Neb. Rev. Stat. 86-218', 'https://nebraskalegislature.gov/laws/statutes.php?statute=86-218&print=true',
        'a sweepstakes or other game of chance or an oral or written express or implied representation that a person has won, has been selected to receive, or may be eligible to receive a prize or purported prize'),
      f('secondary', 'act requirements', 'Secondary sources list duties in the Telemarketing and Prize Promotions Act (86-212 to 86-235): odds, no-purchase message, material costs, free-entry method, sponsor identity and verifiable retail value. The sections were not read.'),
      f('notfound', 'registration', NO_REG),
    ]),
    NC: s('North Carolina', 4, 'notfound', [
      f('verified', 'electronic sweepstakes machines', 'It is unlawful to operate an electronic machine or device to conduct or promote a sweepstakes through an entertaining display, including the entry process or prize reveal. The section does not address ordinary non-electronic sweepstakes.', 'N.C.G.S. 14-306.4', 'https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_14/GS_14-306.4.html',
        'operate, or place into operation, an electronic machine or device'),
      f('secondary', 'server-based promotions', 'G.S. 14-306.3 bans certain server-based electronic game promotions tied to prepaid cards. Seen in search snippets only.', 'N.C.G.S. 14-306.3', 'https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_14/GS_14-306.3.html'),
      f('notfound', 'registration', NO_REG),
    ]),
    ND: s('North Dakota', 4, 'notfound', [
      f('verified', 'contest prize notices', 'Text read directly from the official PDF. A sponsor is one who requires payment to award or compete for a prize, or creates that impression; it must first deliver a written prize notice with sponsor identity, retail value, odds, fees, restrictions and eligibility. A promised prize must be provided within 30 days. Intentional violation is a class C felony. No registration or bond.', 'N.D.C.C. 53-11-01 to 53-11-05', 'https://ndlegis.gov/cencode/t53c11.pdf',
        'a sponsor who represents to a person that the person has been awarded a prize shall provide the person with the prize'),
    ]),
    OR: s('Oregon', 5, 'notfound', [
      f('verified', 'contest and sweepstakes solicitations', 'Requires disclosures (for sweepstakes: odds in Arabic numerals, sponsor name and address, no-purchase entry procedure; for contests: rounds, cost, judging and final winner date) and bars false winner or selection claims, including when more than 25 percent of recipients have the same chance. No registration or bond.', 'ORS 646A.803', 'https://oregon.public.law/statutes/ors_646a.803',
        'The odds of winning in Arabic numerals'),
    ]),
    SC: s('South Carolina', 5, 'notfound', [
      f('verified', 'prizes and gifts act', 'For prizes offered in connection with sales or solicitations: the prize must be given without monetary obligation and delivered within ten days at no expense; retail value, number of prizes and odds must be disclosed; handling charges are capped at the lesser of $5 or the actual cost. No registration or bond.', 'S.C. Code 37-15-10 to 37-15-70', 'https://www.scstatehouse.gov/code/t37c015.php',
        'must be delivered to the recipient at no expense to the recipient within ten days'),
    ]),
    TN: s('Tennessee', 5, 'notfound', [
      f('verified', 'prizes', 'No sponsor may require payment to award or compete for a prize unless the person first gets a written prize notice with sponsor identity, retail value, odds ("__ out of __ notices distributed"), fees, restrictions and eligibility. Exempts time-share and membership camping promotions and on-site retail savings offers. Penalties run from $1,000 up to ten times the amount collected per violation. No registration or bond.', 'Tenn. Code 47-18-124', 'https://codes.findlaw.com/tn/title-47-commercial-instruments-and-transactions/tn-code-sect-47-18-124/',
        'No sponsor shall require a person in Tennessee to pay the sponsor money as a condition of awarding the person a prize'),
    ]),
    TX: s('Texas', 5, 'notfound', [
      f('verified', 'sweepstakes by mail', 'Chapter 622 applies to sweepstakes conducted through the mail (with exceptions, including mail used only to return entries). Operators may not require a purchase to enter, may not accept entries at more than one address, must disclose "Buying Will Not Help You Win" style language where entry links to purchasing, and may not ask for information consistent with winning unless the person has won. No registration or bond.', 'Tex. Bus. & Com. Code ch. 622', 'https://tcss.legis.texas.gov/docs/BC/htm/BC.622.htm',
        'require an individual to order, purchase, or promise to purchase a good or service to enter'),
      f('secondary', 'contests and gift giveaways', 'Chapter 621 covers contests and gift giveaways, including required prize disclosures (621.102), drawings (621.106) and disclosure of major prizes and winners on request (621.204). Only section titles and a search snippet were seen; the text was not read.', 'Tex. Bus. & Com. Code ch. 621', 'https://texas.public.law/statutes/tex._bus._and_com._code_title_13_chapter_621'),
    ]),
    VT: s('Vermont', 5, 'notfound', [
      f('verified', 'contests and prizes rule', 'It is unlawful to solicit participation in contests, sweepstakes or promotions that are deceptive about odds, winners, prize value or availability, that require an entry fee, purchase or similar consideration to enter, or that use false promotional materials. No registration or filing.', 'Vt. Consumer Protection Rule CF 109 (109.01, 109.02)', 'https://www.law.cornell.edu/regulations/vermont/06-003-Code-Vt-R-06-031-003-X',
        'requires any kind of entry fee, service charge, purchase or similar consideration in order to enter'),
      f('verified', 'games of chance statute', 'A person may run a contest or game of chance, including a sweepstakes, if entrants are not required to venture money or other valuable things; the cost of mailing an entry is not a venture. Contests that are not contests of chance are not prohibited. Secondary sources say a 2013 amendment allows fees for skill contests; not confirmed.', '13 V.S.A. 2143b', 'https://legislature.vermont.gov/statutes/section/13/051/02143b'),
    ]),
    VA: s('Virginia', 5, 'notfound', [
      f('verified', 'prizes and gifts act', 'No one may represent that another has a chance to win a prize without clearly disclosing on whose behalf the promotion runs and all material conditions. Retail value, number of prizes and odds must be disclosed (retail value is the substantial-sales price within 90 days or cost plus no more than 700 percent). Scope covers representations in connection with sales or leases; simple entry blanks and no-payment offers are exempt. No registration or bond.', 'Va. Code 59.1-417', 'https://law.lis.virginia.gov/vacode/title59.1/chapter31/section59.1-417/',
        'without clearly and conspicuously disclosing on whose behalf the contest or promotion is conducted'),
    ]),
    WA: s('Washington', 5, 'notfound', [
      f('verified', 'promotional contests of chance', 'A business may run a promotional contest of chance if no person must pay consideration to participate; visiting the business, phone calls, entry forms and surveys are not consideration. The section does not permit noncompliance with the prize promotion chapter or the consumer protection act. No license or registration in the section text.', 'RCW 9.46.0356', 'https://app.leg.wa.gov/rcw/default.aspx?cite=9.46.0356',
        'No person eligible to receive a prize'),
      f('verified', 'promotional advertising of prizes', 'Promoters must disclose names and addresses, verifiable retail value of each prize, odds as a ratio, any sales presentation requirement, restrictions and the need to present a winning ticket; items requiring payment cannot be called prizes. No registration or bond.', 'RCW 19.170.030, 19.170.040', 'https://app.leg.wa.gov/rcw/default.aspx?cite=19.170&full=true'),
    ]),
    WV: s('West Virginia', 5, 'notfound', [
      f('verified', 'prizes and gifts', 'No one may represent that another has a chance to win without clearly disclosing on whose behalf the promotion is conducted and all material conditions; true retail value, number of prizes and odds must be disclosed. No registration or bond in the section read.', 'W. Va. Code 46A-6D-4', 'https://code.wvlegislature.gov/46a-6D-4/',
        'without clearly and conspicuously disclosing on whose behalf the contest or promotion is conducted'),
    ]),
    WI: s('Wisconsin', 5, 'notfound', [
      f('verified', 'prize notices', 'A solicitor may not request or accept payment before delivering a written prize notice with solicitor and sponsor names and addresses, verifiable retail value, odds, sales presentation details, fees, restrictions and eligibility limits, in prescribed type. No registration or bond.', 'Wis. Stat. 100.171', 'https://docs.legis.wisconsin.gov/document/statutes/100.171'),
      f('secondary', 'gambling chapter', 'Chapter 945 (gambling) was cited by a search result and not read.'),
    ]),
    NY: s('New York', 0, 'required', [
      f('verified', 'registration and bond', 'Chance-based promotions with total announced prizes over $5,000 must register at least 30 days before the start and post a bond equal to the total prize value. The statute covers promotions in connection with the sale of consumer products.', 'N.Y. Gen. Bus. Law 369-e', 'https://www.nysenate.gov/legislation/laws/GBS/369-E', 'total announced value of the prizes offered is in excess of five thousand dollars'),
    ]),
    FL: s('Florida', 0, 'required', [
      f('verified', 'registration and bond', 'Game promotions with total announced prizes greater than $5,000 must register at least 7 days before the start and establish a trust account or surety bond for the total prize value. The statute covers promotions in connection with and incidental to the sale of consumer products or services, and has exemptions such as nonprofits.', 'Fla. Stat. 849.094', 'http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0800-0899/0849/Sections/0849.094.html', 'at least 7 days before the commencement of the game promotion'),
    ]),
    RI: s('Rhode Island', 0, 'required', [
      f('verified', 'registration', 'The statute requires a filing with the Secretary of State ($150 fee, misdemeanor if not filed) for a game, contest or promotion in which a retail establishment offers a chance-based opportunity to receive prizes to promote its retail business, with total announced prizes over $500. The Department of State\'s filing instructions go further: all games offering over $500 in prizes must register, including games offered to Rhode Island residents from other states, and a winners list must be kept for at least one year. No filing deadline appears in the statute.', 'R.I. Gen. Laws 11-50-1; RI Dept. of State Form 660 instructions', 'https://docs.sos.ri.gov/documents/BusinessServices/660-games-of-chance.pdf', 'ALL games offering over $500.00 in prizes MUST register with our office.'),
    ]),
  };

  MORE.LA.registrationNote = 'Possible Attorney General filing for phone-based prize promotions. The statute text was not read.';
  MORE.MD.registrationNote = 'Alcohol-related sweepstakes and contests must be submitted for approval 14 days before the start.';
  MORE.MO.registrationNote = 'Promotions used to sell time-share or tourist services need 14 days written notice to the Attorney General.';

  NS.STATE_SURVEY = Object.assign(NS.STATE_SURVEY || {}, MORE);
  if (typeof module !== 'undefined') module.exports = NS;
})();
