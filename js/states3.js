/* Promo Hero: state survey, verification pass for the 15 states that had no primary text (IL, IN, KY, ME, NV, NH, NJ, NM, OH, OK, PA, SD, UT, WY, DC).
 * These records replace the earlier secondary-only entries in states2.js. Loaded after states2.js.
 * Evidence notes: NJ, KY (telemarketing sections), SD, UT (ch. 13-28 and 76-10-1110) and WY text was read directly from official PDFs.
 * The rest were read through a summarizing fetch tool from official or public code sites, so a human should re-read the cited text.
 * Corrections to earlier entries: Utah Code 13-48 is the Motor Vehicle Rental Company Disclosure Act (not a sweepstakes act),
 * and KRS 367.175 is a restraint-of-trade section (not a promotional offer statute).
 * Nothing here is legal advice. reviewedBy stays null until an attorney signs off. */
(function () {
  const NS = (globalThis.PromoHero = globalThis.PromoHero || {});
  const ON = '2026-09-27';
  const f = (status, topic, summary, cite, url, excerpt) => ({ status, topic, summary, cite: cite || '', url: url || '', excerpt: excerpt || '' });
  const s = (name, batch, registration, findings) => ({ name, batch, surveyedOn: ON, reviewedBy: null, registration, findings });
  const NO_REG = 'No registration or bond rule found for a general consumer sweepstakes.';

  const FIXED = {
    IL: s('Illinois', 6, 'notfound', [
      f('verified', 'prizes and gifts act: scope', 'The Act applies to a written promotional offer made to a person in Illinois, or used to induce a person to come to Illinois to claim a prize, attend a sales presentation or meet a promoter, or to contact a promoter, sponsor or salesperson in Illinois.', '815 ILCS 525/15',
        'https://codes.findlaw.com/il/chapter-815-business-transactions/il-st-sect-815-525-15/',
        'used to induce or invite a person to come to this State to claim a prize'),
      f('verified', 'prizes and gifts act: prohibitions', 'A sponsor may not require payment to award, receive, compete for or get information about a prize. A sponsor may not say a person won unless the prize is given without obligation, notice is at no cost within 15 days, and the statement is truthful.', '815 ILCS 525/20',
        'https://codes.findlaw.com/il/chapter-815-business-transactions/il-st-sect-815-525-20/',
        'as a condition of allowing the person to receive, use, compete for, or obtain information about a prize'),
      f('verified', 'prizes and gifts act: disclosures', 'A written promotional prize offer must state at its onset: sponsor name and address, retail value, that no purchase is necessary, that a purchase will not improve winning chances, odds, fees, restrictions and eligibility limits, plus the size of any special-selection group.', '815 ILCS 525/25',
        'https://codes.findlaw.com/il/chapter-815-business-transactions/il-st-sect-815-525-25/'),
      f('notfound', 'registration', NO_REG + ' The gambling article (720 ILCS 5/28) was not read.'),
    ]),
    IN: s('Indiana', 6, 'notfound', [
      f('verified', 'promotional gifts and contests: scope', 'Article 8 applies to a promotion offer made by a person in Indiana or to a person in Indiana, excluding certain prize-linked savings programs of financial institutions.', 'Ind. Code 24-8-1-1',
        'https://codes.findlaw.com/in/title-24-trade-regulation/in-code-sect-24-8-1-1/',
        'This article applies to a promotion offer made: (1) by a person in Indiana; or (2) to a person in Indiana.'),
      f('verified', 'sales presentations', 'Before a demonstration, seminar or sales presentation begins, the promoter must tell the person the prize, if any, they will receive.', 'Ind. Code 24-8-4-1',
        'https://codes.findlaw.com/in/title-24-trade-regulation/in-code-sect-24-8-4-1/',
        'Before a demonstration, seminar, or sales presentation begins, the promoter shall inform the person of the prize, if any, the person will receive.'),
      f('verified', 'unavailable prizes', 'If a described prize is unavailable, the recipient may choose an equal or greater prize, the verifiable retail value in cash or check, or a voucher for delivery within 30 days at no cost. No registration in the section.', 'Ind. Code 24-8-5-1',
        'https://codes.findlaw.com/in/title-24-trade-regulation/in-code-sect-24-8-5-1/'),
      f('verified', 'notice delivery', 'Chapter 3 begins with methods of delivering notice (hand, mail, newspaper, periodical, electronic). The prize notice content sections (24-8-3-3 retail value, 24-8-3-6 sales presentation) were seen only as titles, so the required notice contents were not read.', 'Ind. Code 24-8-3-1',
        'https://codes.findlaw.com/in/title-24-trade-regulation/in-code-sect-24-8-3-1/'),
      f('secondary', 'alcohol promotions', 'A secondary source says alcohol-based sweepstakes need alcohol control board pre-approval. Not verified.'),
      f('notfound', 'registration', NO_REG),
    ]),
    KY: s('Kentucky', 6, 'notfound', [
      f('verified', 'telephone solicitations offering prizes', 'Telephone solicitation includes offering a prize or gift when payment or other consideration is required to get it, or offering a prize as an incentive to attend a sales presentation. A caller who implies the consumer will receive a prize from a number of prizes must, in the sales presentation, give the number awarded, the item value, the conditions, the odds, and a statement that no purchase is necessary. Violations are unfair or deceptive acts enforced by the Attorney General.', 'KRS 367.46951, 367.46977, 367.46967',
        'https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=54552',
        'the statement that no purchase is necessary to win the prize or to participate in the promotion'),
      f('secondary', 'mailed promotional offers (unconfirmed)', 'Bill text of 2000 HB 67 (and a related SB 212 amendment) would create KRS 367 sections requiring promotional offers to disclose sponsor contact details, verifiable fair market value, "no purchase necessary" and an expiration date, with a retail-location exemption. Whether it was enacted, and under which section number, was not confirmed. KRS 367.175, which is sometimes cited for this, is actually the restraint-of-trade provision and not a promotional offer statute.', '2000 Ky. HB 67', 'https://apps.legislature.ky.gov/record/00rs/HB67/bill.doc'),
      f('secondary', 'electronic machines', 'Secondary sources say sweepstakes machines are barred (KRS ch. 528). Not read.'),
      f('notfound', 'registration', NO_REG),
    ]),
    ME: s('Maine', 6, 'notfound', [
      f('verified', 'gambling definitions', 'A lottery is an unlawful scheme where players pay something of value for chances. Gambling is staking something of value on a contest of chance. "Unlawful" means not expressly authorized by statute, even if authorized under federal or other-state law.', '17-A M.R.S. 952', 'https://legislature.maine.gov/statutes/17-a/title17-asec952.html',
        'An activity not expressly authorized by statute does not cease to be unlawful solely because it is authorized under federal law'),
      f('verified', 'alcohol in-pack sweepstakes', 'Licensees may offer sweepstakes, games and contests inside liquor packages if the offer is not contingent on the purchase of liquor, with a sign or package notice about access to participate.', '28-A M.R.S. 708-A', 'https://legislature.maine.gov/statutes/28-A/title28-Asec708-A.html',
        'if that offer is not contingent on the purchase of liquor'),
      f('secondary', 'minors', 'A secondary source says verifiable parent consent is needed before collecting personal information from under-18s in promotions marketed to minors. Not verified.'),
      f('notfound', 'registration', NO_REG + ' Title 17 chapter 62 (games of chance) was not read.'),
    ]),
    NV: s('Nevada', 6, 'notfound', [
      f('verified', 'representing that a person has won', 'An advertiser may not say a person has won a prize unless conditions are met, including displaying the advertiser name and address, delivering the prize at no expense within 30 days after the representation, avoiding "you have won" language otherwise, selecting no more than 10 percent of names considered as winners, and disclosing the probability of receiving each premium. No registration in the text read.', 'NRS 598.136', 'https://nevada.public.law/statutes/nrs_598.136',
        'delivered to the recipient at no expense to him or her within 30 days after the representation'),
      f('verified', 'purchase-conditioned prize notices', 'It is a deceptive trade practice to notify a person that they have won a prize and that they must purchase or lease goods or services to receive it.', 'NRS 598.092(7)', 'https://www.leg.state.nv.us/nrs/nrs-598.html',
        'that as a condition of receiving the prize he or she must purchase or lease goods or services'),
      f('secondary', 'travel and gaming', 'Secondary sources say travel prizes need Seller of Travel registration and gaming-related promotions need Gaming Control Board approval. Not verified.'),
      f('notfound', 'registration', NO_REG + ' NRS 598.137 and 598.138 text was not read.'),
    ]),
    NH: s('New Hampshire', 6, 'notfound', [
      f('verified', 'prizes and gifts act', 'In connection with a sale, lease or solicitation, a person may not say someone has won anything of value unless the prize is delivered at no expense within 10 days. A person may not say someone has a chance to win without disclosing on whose behalf the promotion is run and all material conditions. Retail value and odds must be disclosed. Handling charges are capped at the lesser of $5 or actual cost. Violations are prohibited practices under RSA 358-A. No registration or bond.', 'RSA 358-O:3, 358-O:4, 358-O:7, 358-O:9', 'https://gc.nh.gov/rsa/html/xxxi/358-O/358-O-mrg.htm',
        'The prize, gift or item of value shall be delivered to the recipient at no expense to the recipient, within 10 days of the representation.'),
      f('verified', 'gambling offenses', 'RSA 647:2 defines gambling as risking something of value on a future contingent event and lists exemptions such as lottery-commission-approved charitable sweepstakes dispensers and sports wagering. The summary found no separate lottery or gift enterprise provision in that section.', 'RSA 647:2', 'https://gc.nh.gov/rsa/html/LXII/647/647-2.htm'),
      f('notfound', 'registration', NO_REG),
    ]),
    NJ: s('New Jersey', 6, 'notfound', [
      f('verified', 'paid-entry sweepstakes are unlawful gambling unless a safe harbor applies', 'Text read directly from the enacted PDF (approved August 15, 2025). Offering a sweepstakes in which a person present in New Jersey may participate by paying or proffering something of value is unlawful gambling, unless: there is a free method of entry; any non-free entry is ancillary to buying food, non-alcoholic beverages or merchandise not exceeding $20 (or another amount set by the Director); winners are not chosen by sports results unless entry is entirely free; rules and odds are disclosed (or unlimited entry is disclosed); prize value is income for NJ income tax; minors need parent consent to claim prizes over $1,000; and odds are identical for paid and free entries. The definition covers a sweepstakes "whether played online or in person", so the law reaches in-person promotions as well as online sweepstakes casinos. It took effect immediately, with civil penalties up to $100,000 for a first offense and $250,000 for later ones, each day a separate offense. How the $20 ancillary-purchase limit applies to purchase-linked promotions needs a lawyer\'s read.', 'P.L. 2025, c.128 (C.52:17B-139.14 to 139.26), sections 2 and 3',
        'https://pub.njleg.state.nj.us/Bills/2024/AL25/128_.PDF',
        'there exists a method of entry to participate in the sweepstakes at no cost to the participant'),
      f('verified', 'automatic entry rule (bill text only)', 'A 2010 bill (A2402, second reprint) would bar a sponsor from automatically entering a consumer because of a purchase unless a no-purchase alternative is offered, and would require notifying winners within 15 days at no expense. Its enactment and codified location were not confirmed.', 'A2402 (2010 session)', 'https://pub.njleg.gov/bills/2010/A2500/2402_R2.HTM',
        'No sponsor shall conduct a sweepstakes in which a consumer is automatically entered because the consumer purchased goods or services unless the sponsor provides an alternative means of entry.'),
      f('notfound', 'registration', NO_REG + ' Charitable games of chance are regulated separately and were not read.'),
    ]),
    NM: s('New Mexico', 6, 'notfound', [
      f('verified', 'gambling definitions', 'A lottery is an enterprise where, for a consideration, participants get an opportunity to win a prize determined by chance. A bet excludes offers of purses or prizes to contestants in a bona fide contest of skill, speed, strength or endurance.', 'NMSA 30-19-1', 'https://codes.findlaw.com/nm/chapter-30-criminal-offenses/nm-st-sect-30-19-1/',
        'an enterprise wherein, for a consideration, the participants are given an opportunity to win a prize, the award of which is determined by chance'),
      f('secondary', 'unfair practices act', 'Secondary sources say the Unfair Practices Act (57-12-1 et seq.) covers deceptive promotions. Not read.'),
      f('notfound', 'registration', NO_REG),
    ]),
    OH: s('Ohio', 6, 'notfound', [
      f('verified', 'sweepstakes definition', 'A sweepstakes is any game, contest, advertising scheme or plan, or other promotion where consideration is not required to enter and winners are determined by chance. A scheme of chance is one where a participant gives valuable consideration for a chance to win a prize.', 'Ohio Rev. Code 2915.01', 'https://codes.ohio.gov/ohio-revised-code/section-2915.01',
        'where consideration is not required for a person to enter to win or become eligible to receive any prize'),
      f('verified', 'attorney general registration is for terminal device facilities', 'The Attorney General registration application read is the Sweepstakes Terminal Device Facility Operator Registration, for entities that run sweepstakes at facilities offering sweepstakes terminal devices unless they hold a certificate of compliance under ORC 2915.02(G). It is not a registration for ordinary consumer promotions.', 'Ohio AG sweepstakes registration application; ORC 2915.02(G)',
        'https://www.ohioattorneygeneral.gov/Files/Services/Services-for-Internet-Cafe/Final-Sweepstakes-Registration-Entity-Filer.aspx',
        'SWEEPSTAKES TERMINAL DEVICE FACILITY OPERATOR REGISTRATION APPLICATION'),
      f('notfound', 'registration', NO_REG + ' Ohio consumer sales practice rules (ORC ch. 1345) were not read.'),
    ]),
    OK: s('Oklahoma', 6, 'notfound', [
      f('verified', 'lottery definition', 'A lottery is any scheme distributing property by chance among persons who have paid or agreed to pay valuable consideration; valuable consideration means money or goods of actual pecuniary value. Listed exceptions include the state lottery, merchant free-ticket drawings run with Chamber of Commerce representatives, qualified organization raffles and savings promotion raffles.', '21 O.S. 1051', 'https://www.oscn.net/applications/oscn/DeliverDocument.asp?CiteID=69564',
        'any scheme for the disposal or distribution of property by chance among persons who have paid, or promised, or agreed to pay any valuable consideration'),
      f('secondary', 'consumer rules', 'Secondary sources say it is illegal to tell someone they won and require payment, and that free entries must be drawn with paid entries. Not verified.'),
      f('notfound', 'registration', NO_REG),
    ]),
    PA: s('Pennsylvania', 6, 'notfound', [
      f('verified', 'liquor licensee contests', 'The prize limits found in secondary sources come from a Liquor Control Board rule for licensees: total prize value for any event, tournament or contest may not exceed $2,000, and total prizes in any 7-day period may not exceed $35,000, with exemptions for golf, skiing, tennis, pocket billiards, bowling and sanctioned events. The secondary sources cited $1,000 and $25,000, which do not match the current text. This rule applies to licensed premises, not to general sweepstakes.', '40 Pa. Code 5.32', 'https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/040/chapter5/s5.32.html&d=reduce',
        'The total value of all prizes for any given event, tournament or contest may not exceed $2,000.'),
      f('verified', 'lottery offense', 'It is a first-degree misdemeanor to set up or maintain any lottery or numbers game. The FindLaw page showed no promotional contest exception; exceptions elsewhere in Pennsylvania law were not searched.', '18 Pa.C.S. 5512', 'https://codes.findlaw.com/pa/title-18-pacsa-crimes-and-offenses/pa-csa-sect-18-5512/',
        'sets up, or maintains, any lottery or numbers game'),
      f('notfound', 'registration', NO_REG + ' The definition of lottery in 18 Pa.C.S. 5512 and the consideration test were not read in full.'),
    ]),
    SD: s('South Dakota', 6, 'notfound', [
      f('verified', 'sweepstake prizes', 'Text read directly from the state consumer protection compilation of chapter 37-32. A solicitor who says a person has won or will receive a prize may not request or accept payment before the person receives a written prize notice with solicitor and sponsor name, address and phone, verifiable retail value, odds ("__ out of __ written prize notices") when more than one prize, sales presentation details, fees, restrictions, eligibility and call details. Prizes unavailable must be replaced by an equal prize, cash value, or a voucher honored within 30 days. Civil penalties and a Class 1 misdemeanor for knowing violations with intent to defraud. The chapter does not apply to a merchant with an established fixed location that offers goods for sale on a continuing basis. No registration.', 'SDCL 37-32-1 to 37-32-18', 'https://consumer.sd.gov/docs/Sweepstakes_Statutes.pdf',
        '___ (number of prizes) out of ___ written prize notices.'),
    ]),
    UT: s('Utah', 6, 'notfound', [
      f('verified', 'prize notices regulation act', 'Text read directly from the official Utah Code PDF. A solicitor who says a person has been selected or may be eligible for a prize may not request or accept payment before delivering a written prize notice with solicitor and sponsor names, verifiable retail value, odds if more than one prize, sales presentation details, fees, restrictions and eligibility, in prescribed type. Prizes must be provided or replaced within 30 days. Penalties include cease and desist orders, fines of $100 to $5,000 per violation and a class A misdemeanor for intentional violations; private action for the greater of $500 or twice the loss. No registration or bond.', 'Utah Code 13-28-1 to 13-28-9', 'https://le.utah.gov/xcode/Title13/Chapter28/C13-28_1800010118000101.pdf',
        'may not request, and the solicitor or sponsor may not accept, a payment from the individual in any form before the individual receives a written prize notice'),
      f('verified', 'fringe gaming devices', 'It is unlawful to derive an economic benefit from a fringe gaming device, including devices that reveal sweepstakes results, require payment or a related purchase, or include a skill-based game. First offense is a class A misdemeanor.', 'Utah Code 76-10-1110', 'https://le.utah.gov/xcode/Title76/Chapter10/C76-10-S1110_2020032820200328.pdf',
        'it is unlawful for any person to derive or intend to derive an economic benefit from a fringe gaming device'),
      f('verified', 'correction', 'Utah Code Title 13 Chapter 48 is the Motor Vehicle Rental Company Disclosure Act. Some secondary sources cite 13-48-201 as a sweepstakes act; it is not one, and no sweepstakes registration act was found.', 'Utah Code 13-48-101', 'https://le.utah.gov/xcode/Title13/Chapter48/C13-48_1800010118000101.pdf',
        'This chapter is known as the "Motor Vehicle Rental Company Disclosure Act."'),
      f('notfound', 'registration', NO_REG),
    ]),
    WY: s('Wyoming', 6, 'notfound', [
      f('verified', 'promotional advertising of prizes', 'Text read directly from the official statutes PDF. A solicitor who says a person has been selected or may be eligible for a prize may not request or accept payment before the person receives a written prize notice with solicitor and sponsor name and address, verifiable retail value, odds if more than one prize, sales presentation details, fees, restrictions and eligibility limits, in prescribed type. If a prize is unavailable the person may choose an equal prize, cash value, or a voucher honored within 30 days. Intentional violation is a misdemeanor up to $10,000 or one year; private action for the greater of $500 or twice the loss. No registration or bond.', 'Wyo. Stat. 40-12-201 to 40-12-209', 'https://wyoleg.gov/statutes/compress/title40.pdf',
        'shall not request, and the solicitor or sponsor shall not accept, a payment from the individual in any form before the individual receives a written prize notice'),
      f('notfound', 'registration and lottery law', NO_REG + ' The gambling statutes (Wyo. Stat. 6-7-101 et seq.) were not read.'),
    ]),
    DC: s('District of Columbia', 6, 'notfound', [
      f('verified', 'lottery offense', 'It is an offense to keep, set up or promote, or manage or advertise, any lottery, and to sell any ticket or device guaranteeing a chance of drawing a prize. Penalties include up to 3 years. Consideration and promotional exceptions were not shown in the text read.', 'D.C. Code 22-1701', 'https://code.dccouncil.gov/us/dc/council/code/sections/22-1701',
        'keep, set up, or promote, or be concerned as owner, agent, or clerk'),
      f('verified', 'consumer protection procedures act', 'The unfair or deceptive trade practices list in 28-3904 (subsections a through mm) has no subsection on prizes, sweepstakes, contests or winning, according to the fetch summary. General deceptive practice rules still apply.', 'D.C. Code 28-3904', 'https://code.dccouncil.gov/us/dc/council/code/sections/28-3904'),
      f('notfound', 'registration', NO_REG + ' The lottery and charitable games control law (D.C. Code title 3, ch. 13) was not read.'),
    ]),
  };

  NS.STATE_SURVEY = Object.assign(NS.STATE_SURVEY || {}, FIXED);
  if (typeof module !== 'undefined') module.exports = NS;
})();
