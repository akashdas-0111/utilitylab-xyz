const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://utilitylabs.xyz';
const TODAY = new Date().toISOString().split('T')[0];

const EXCLUDED = [
  'admin',
  'content',
  '404.html',
  'privacy-policy.html',
  'blog/post.html'
];

const PRIORITIES = {
  'index.html': '1.0',
  'timer.html': '0.9',
  'tools.html': '0.9',
  'tools/cgpa-calculator.html': '0.8',
  'tools/percentage-calculator.html': '0.8',
  'tools/word-counter.html': '0.8',
  'blog/index.html': '0.8'
};

const CHANGE_FREQ = {
  'index.html': 'daily',
  'blog/index.html': 'daily',
  'timer.html': 'weekly',
  'tools.html': 'weekly'
};

// ─── GET ALL HTML FILES ───────────────────────
function getAllHtmlFiles(dir, base = '') {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = base
      ? `${base}/${item}` : item;

    const isExcluded = EXCLUDED.some(ex =>
      relativePath.startsWith(ex) || item === ex
    );
    if (isExcluded) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(
        ...getAllHtmlFiles(fullPath, relativePath)
      );
    } else if (item.endsWith('.html')) {
      files.push(relativePath);
    }
  }
  return files;
}

// ─── CONVERT FILE TO URL ──────────────────────
function toUrl(filePath) {
  if (filePath === 'index.html') return '/';
  return '/' + filePath
    .replace(/\.html$/, '')
    .replace(/\/index$/, '');
}

// ─── GET BLOG POSTS ───────────────────────────
function getBlogPostUrls() {
  const indexPath = path.join(
    __dirname, 'content', 'blog', 'index.json'
  );

  if (!fs.existsSync(indexPath)) return [];

  try {
    const posts = JSON.parse(
      fs.readFileSync(indexPath, 'utf8')
    );

    return posts.map(post => ({
      url: `/blog/${post.slug}`,
      lastmod: post.date || TODAY,
      changefreq: 'monthly',
      priority: '0.7'
    }));
  } catch(e) {
    return [];
  }
}

// ─── BUILD SITEMAP ENTRIES ────────────────────
const htmlFiles = getAllHtmlFiles('.');
const staticUrls = htmlFiles.map(file => {
  const url = toUrl(file);
  const priority = PRIORITIES[file] || '0.7';
  const changefreq = CHANGE_FREQ[file] || 'weekly';

  return {
    url,
    lastmod: TODAY,
    changefreq,
    priority
  };
});

const blogUrls = getBlogPostUrls();
const allUrls = [...staticUrls, ...blogUrls];

// ─── GENERATE XML ─────────────────────────────
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(entry => `  <url>
    <loc>${BASE_URL}${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync('sitemap.xml', sitemap);

console.log(
  `✅ Sitemap generated with ${allUrls.length} URLs`
);
console.log(
  `   Static pages: ${staticUrls.length}`
);
console.log(
  `   Blog posts: ${blogUrls.length}`
);