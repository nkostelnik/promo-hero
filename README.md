# Promo Hero

![Promo Hero: Sweepstakes and contests and giveaways, oh my!](assets/social.png)

**Sweepstakes and contests and giveaways, oh my!**

Answer a few questions, get draft Official Rules, and see the legal red flags called out, with notes for all 50 states and DC.

Promo Hero is a decision-tree tool for companies setting up promotions. It asks one question at a time, branches on each answer to work out the legal structure, flags anything that looks unlawful, and drafts matching Official Rules you can export to Word.

> **Not legal advice. Beta.** Promo Hero is an issue-spotting and drafting aid. Promotion law is state-specific and changes often. The rules in this tool were checked against primary sources (statutes, regulations, agency guidance) but **no attorney has reviewed them yet**, and most were read through a summarizing tool. Have a licensed attorney review anything before you launch a promotion.

## What it does

- **Decision tree interview.** One question at a time. Each answer decides which questions come next, and a "Your path" panel lets you jump back and change an answer.
- **Legal structure.** It sorts the promotion into a no-purchase sweepstakes, a sweepstakes with a free alternate method of entry (AMOE), a skill contest, a vote contest, or a first-come giveaway, and shows the three lottery elements: prize, chance, and payment or effort.
- **Legal flags, live.** Each flag is ranked *stop* (likely illegal as designed), *action* (a legal requirement to satisfy), or *note* (good practice). Every flag says to consult a lawyer and that this is not legal advice.
- **Drafted terms.** A clause library assembles Official Rules from your answers. Anything you have not supplied becomes a highlighted `[PLACEHOLDER]`.
- **Export.** Download a Word `.doc` (with a "read first, delete before publishing" cover page), copy the text, or print to PDF.
- **Carnival mode.** A game-booth theme by default, with a toggle to a plain theme.

### Examples of what it flags

| Level | Examples |
| --- | --- |
| Stop | Random drawing that requires a purchase with no free entry route, paid vote contests, entrants under 13, winners paying to claim a prize, cannabis, alcohol with an under-21 age limit, too little time to register in NY or FL |
| Action | NY and FL registration and bonding above $5,000 in prizes, a Rhode Island filing above $500 for chance-based promotions, a New Jersey paid-entry warning, Arizona contest registration, a Hawaii bond for real property prizes, Facebook and Instagram entry rules, TCPA for text messages, missing privacy policy, missing judging criteria, charity tie-ins |
| Note | FTC disclosure for entry posts and influencers, prize taxes, travel prizes, arbitration clauses, age of majority (19 in Alabama and Nebraska) |

### State rules reviewed

A survey of all 50 states plus DC backs the flags. The app shows a "State rules reviewed" box under the flags (which states need registration or bonding, which have narrower filing rules, and how many findings an attorney has reviewed), and a "State notes" section on the review page with each eligible state's findings, citations, and quoted text. Every finding is labeled **Read from source**, **Unconfirmed (secondary source)**, or **Searched, none found**. "None found" is not proof that no rule exists.

The drafted Official Rules add a "State-Specific Notices" section only when a flag fires (New Jersey, Arizona, Hawaii), and the state registration section lists New York, Florida, and Rhode Island filings.

## Scope of v1

- Sweepstakes, skill contests, vote contests, and giveaways
- United States only, state-aware (registration triggers and state exclusions)
- Deterministic rules engine and clause library, with no AI drafting and no network calls

Not yet covered: instant win games, loyalty, referral and rebate programs, charity co-venturer terms, U.S. territories, Canada, and per-state void-where-prohibited lists.

## Accuracy and status

- **Sources.** Each flag has a record in `js/sources.js` with a citation, a short quoted excerpt, the date checked, and a status of `verified`, `partial`, `incorrect`, or `unchecked`. A test fails if a flag has no record. State findings live in `js/states.js`, `js/states2.js`, and `js/states3.js`.
- **What "verified" means.** The cited text was read. Iowa, North Dakota, New Jersey, South Dakota, Utah, Wyoming, and two California Attorney General opinions were read directly from official PDFs. Most other statutes were read through a summarizing fetch tool, so a person should re-read them.
- **Corrections found along the way.** Several claims from secondary sources were wrong when checked against the statute (for example a Colorado registration rule, a Delaware winner-records rule, and two mis-cited sections), which is why every claim now carries a source record and a status.
- **No attorney review yet.** `reviewedBy` is empty on every record, and the app says so.
- **"Recommended for attorney review" markers.** When a flag or a state note rests on a question nobody has resolved, the app marks it and shows the reason (registry in `js/review.js`). The flag pill row counts them, the review page lists them and shows them on the matching state notes, the Word export's cover page repeats them, and a few state issues that had no flag (Connecticut, Massachusetts, Georgia, Idaho and Vermont fees, Louisiana and Kentucky phone promotions, prize-notice rules) raise a review note when they apply to the promotion. The marker takes no side on the question. Remove an entry only after an attorney resolves it.
- **Open questions for counsel** (for example Rhode Island scope, the New Jersey $20 rule, and Connecticut 42-301) are the items behind the "Recommended for attorney review" markers. Their reasons are in `js/review.js`.

## Run it

No build step. Serve the folder with any static server:

```bash
npx --yes serve -l 5190 .
```

Then open http://localhost:5190. Your answers are saved in the browser.

## Live site

**https://nkostelnik.github.io/promo-hero/**

GitHub Pages deploys from `main` through `.github/workflows/pages.yml`: it runs the tests, then publishes only the files the app loads (built by `node scripts/build-site.js`). The `scripts/` and `test/` folders, the README, and the source registry are not published. To preview exactly what will go live, run `node scripts/build-site.js _site` and serve that folder.

## Test

```bash
npm test
```

The engine tests cover the lottery logic, registration triggers, interview branching, and the clause output.

## Project layout

| Path | Purpose |
| --- | --- |
| `js/questions.js` | Question schema, branching (`showIf`), and the interview order |
| `js/flags.js` | Structure classification and legal flag rules |
| `js/clauses.js` | Clause library and Official Rules assembler |
| `js/sources.js` | Source registry: citation, excerpt, date, and status for each flag claim |
| `js/review.js` | Which flags and states are marked "Recommended for attorney review", and why |
| `js/states.js`, `js/states2.js`, `js/states3.js` | State survey, exported as `PromoHero.STATE_SURVEY` |
| `js/coverage.js` | Computes the "State rules reviewed" summary and per-state notes |
| `js/app.js` | Decision tree UI, live flags, exports, theme toggle |
| `css/style.css` | Carnival theme and plain theme |
| `test/engine.test.js` | Engine, source registry, survey, and clause tests |
| `.github/workflows/pages.yml` | Runs the tests and deploys the live site from `main` |
| `scripts/build-site.js` | Builds the folder that is published (only what the app loads) |
| `assets/` | Social preview image and its source |

## Contributing changes to the rules

Legal logic lives in `js/flags.js` and the clause text in `js/clauses.js`. Do not add a legal claim from memory or from a blog: add a record to `js/sources.js` with the citation, an excerpt, and the date, and link it to the flag id. If you are a lawyer or compliance professional, corrections are especially welcome, and the flags marked "Recommended for attorney review" are the best place to start.

## License

No license has been chosen yet. All rights reserved until one is added.
