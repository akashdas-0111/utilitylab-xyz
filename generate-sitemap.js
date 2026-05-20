const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://utilitylabs.xyz';
const TODAY = new Date().toISOString().split('T')[0];

const EXCLUDED = [
  'admin',
  'content',
  '404.html',
  'privacy-policy.html'
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

function getAllHtmlFiles(dir, base = '') {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = base ? `${base}/${item}` : item;
    
    const isExcluded = EXCLUDED.some(ex => 
      relativePath.startsWith(ex) || item === ex
    );
    if (isExcluded) continue;
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllHtmlFiles(fullPath, relativePath));
    } else if (item.endsWith('.html')) {
      files.push(relativePath);
    }
  }
  return files;
}

function toUrl(filePath) {
  if (filePath === 'index.html') return '/';
  return '/' + filePath.replace(/\.html$/, '').replace(/\/index$/, '');
}

const htmlFiles = getAllHtmlFiles('.');
const urls = htmlFiles.map(file => {
  const url = toUrl(file);
  const priority = PRIORITIES[file] || '0.7';
  const changefreq = CHANGE_FREQ[file] || 'weekly';
  
  return `  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

fs.writeFileSync('sitemap.xml', sitemap);
console.log('Sitemap generated with ' + urls.length + ' URLs');
