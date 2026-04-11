const fs   = require('fs');
const path = require('path');

let cached = null;

module.exports = async (req, res) => {
  // HTML 파일 읽기 (cold start 이후 캐시)
  if (!cached) {
    const filePath = path.join(process.cwd(), 'public', 'index.html');
    cached = fs.readFileSync(filePath, 'utf8');
  }

  const SUPABASE_URL  = process.env.SUPABASE_URL  || '';
  const SUPABASE_ANON = process.env.SUPABASE_ANON || '';

  // <head> 바로 뒤에 환경변수 주입 스크립트 삽입
  const injected = cached.replace(
    '<head>',
    `<head>
<script>
  window.__SUPABASE_URL__  = ${JSON.stringify(SUPABASE_URL)};
  window.__SUPABASE_ANON__ = ${JSON.stringify(SUPABASE_ANON)};
</script>`
  );

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(injected);
};
