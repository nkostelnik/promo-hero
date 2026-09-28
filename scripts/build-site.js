/* Assembles the files the live site needs into a folder (default _site). Only what index.html loads, plus the
 * social image, robots.txt, sitemap.xml and llms.txt. Internal material (docs/, scripts/, test/, js/sources.js,
 * README.md) is left out on purpose. Run: node scripts/build-site.js [outDir] */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const EXTRA = ['assets/social.png', 'robots.txt', 'sitemap.xml', 'llms.txt'];

function localRefs(html) {
  return [...html.matchAll(/(?:src|href)="([^"#?:]+)"/g)]
    .map((m) => m[1])
    .filter((r) => !r.startsWith('/') && !r.startsWith('//'));
}

function build(outDir) {
  const out = path.resolve(outDir || path.join(root, '_site'));
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const files = Array.from(new Set(['index.html'].concat(localRefs(html), EXTRA)));
  files.forEach((rel) => {
    const src = path.join(root, rel);
    if (!fs.existsSync(src)) throw new Error('index.html or the site list refers to a missing file: ' + rel);
    const dest = path.join(out, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  });
  fs.writeFileSync(path.join(out, '.nojekyll'), '');
  return { out, files };
}

if (require.main === module) {
  const { out, files } = build(process.argv[2]);
  console.log('site written to ' + out + ' (' + files.length + ' files): ' + files.join(', '));
}
module.exports = { build, localRefs };
