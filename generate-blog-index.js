// ═══════════════════════════════════════════════
// BLOG INDEX GENERATOR
// Runs on every Netlify deploy
// Scans content/blog/*.md and builds index.json
// ═══════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'content', 'blog');
const OUTPUT = path.join(__dirname, 'content', 'blog', 'index.json');

// ─── PARSE FRONTMATTER ───────────────────────
function parseFrontmatter(raw) {
  const match = raw.match(
    /^---\n([\s\S]*?)\n---/
  );

  if (!match) return {};

  const fm = {};
  const lines = match[1].split('\n');

  lines.forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;

    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    // Remove surrounding quotes
    val = val.replace(/^["']|["']$/g, '');

    // Parse booleans
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    // Parse numbers
    else if (!isNaN(val) && val !== '')
      val = Number(val);

    fm[key] = val;
  });

  return fm;
}

// ─── GET EXCERPT FROM BODY ────────────────────
function getExcerpt(raw, maxLength = 160) {
  // Remove frontmatter
  const body = raw.replace(
    /^---[\s\S]*?---\n/, ''
  );

  // Remove markdown syntax
  const plain = body
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + '...';
}

// ─── COUNT WORDS ──────────────────────────────
function countWords(raw) {
  const body = raw.replace(
    /^---[\s\S]*?---\n/, ''
  );
  const plain = body
    .replace(/[#*`\[\]()!]/g, '')
    .trim();
  return plain.split(/\s+/).filter(
    w => w.length > 0
  ).length;
}

// ─── MAIN ─────────────────────────────────────
function generateIndex() {
  console.log('📝 Generating blog index...');

  // Ensure directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT, '[]');
    console.log('✅ No posts yet — empty index created');
    return;
  }

  // Get all markdown files
  const files = fs.readdirSync(BLOG_DIR).filter(
    f => f.endsWith('.md')
  );

  if (files.length === 0) {
    fs.writeFileSync(OUTPUT, '[]');
    console.log('✅ No posts yet — empty index created');
    return;
  }

  const posts = [];

  files.forEach(file => {
    try {
      const filePath = path.join(BLOG_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const fm = parseFrontmatter(raw);

      // Skip if no title or slug
      if (!fm.title || !fm.slug) {
        console.warn(
          `⚠️  Skipping ${file} — missing title or slug`
        );
        return;
      }

      // Auto-calculate read time if not set
      const wordCount = countWords(raw);
      const autoReadTime = Math.max(
        1, Math.round(wordCount / 200)
      );

      // Get excerpt from description or body
      const excerpt = fm.description
        || getExcerpt(raw);

      posts.push({
        slug: fm.slug,
        title: fm.title,
        date: fm.date || '',
        category: fm.category || 'general',
        thumbnail: fm.thumbnail || '',
        description: excerpt,
        author: fm.author || 'UtilityLab Team',
        read_time: fm.read_time || autoReadTime,
        featured: fm.featured || false,
        affiliate_url: fm.affiliate_url || '',
        affiliate_text: fm.affiliate_text || '',
        word_count: wordCount
      });

      console.log(`  ✓ ${fm.title}`);
    } catch(e) {
      console.error(`  ✗ Error reading ${file}:`, e.message);
    }
  });

  // Sort by date newest first
  posts.sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  // Write index
  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(posts, null, 2)
  );

  console.log(
    `\n✅ Blog index generated — ${posts.length} post(s)\n`
  );

  // Log summary
  posts.forEach(p => {
    console.log(
      `   → /blog/${p.slug} (${p.category})`
    );
  });
}

// ─── RUN ──────────────────────────────────────
generateIndex();