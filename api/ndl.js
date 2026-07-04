// 演習用のAPI窓口：国立国会図書館サーチ（NDLサーチ）の OpenSearch API を中継する。
// 演習ページで発行した APIキー（demo-xxxxxxxx）が無いと 401 を返す。
// ※NDLサーチのAPI自体はキー不要。ここでは「キーを確認する窓口」を体験するために挟んでいる。

function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const appkey = String((req.query && req.query.appkey) || '');
  const title = String((req.query && req.query.title) || '').trim();

  if (!appkey) {
    res.status(401).json({
      status: 401,
      error: 'APIキーが指定されていません。手順1でキーを発行し、appkey を付けて送ってください。',
    });
    return;
  }
  if (!/^demo-[0-9a-f]{4,16}$/.test(appkey)) {
    res.status(401).json({ status: 401, error: 'APIキーが正しくありません。' });
    return;
  }
  if (!title) {
    res.status(400).json({ status: 400, error: '検索する書名（title）を指定してください。' });
    return;
  }

  try {
    const url = 'https://ndlsearch.ndl.go.jp/api/opensearch?cnt=5&title=' + encodeURIComponent(title);
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error('upstream ' + r.status);
    const xml = await r.text();

    const totalMatch = xml.match(/<openSearch:totalResults>(\d+)<\/openSearch:totalResults>/);
    const total = totalMatch ? Number(totalMatch[1]) : 0;

    const pick = (block, tag) => {
      const m = block.match(new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>'));
      return m ? decodeEntities(m[1]) : '';
    };
    const books = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g))
      .slice(0, 5)
      .map((m) => {
        const item = m[1];
        return {
          title: pick(item, 'title'),
          author: pick(item, 'author') || pick(item, 'dc:creator'),
          publisher: pick(item, 'dc:publisher'),
          year: (pick(item, 'dcterms:issued') || pick(item, 'pubDate')).slice(0, 10),
          link: pick(item, 'guid') || pick(item, 'link'),
        };
      });

    res.status(200).json({
      status: 200,
      api: '国立国会図書館サーチ（NDLサーチ）',
      query: title,
      totalResults: total,
      books,
    });
  } catch (e) {
    res.status(502).json({
      status: 502,
      error: '国立国会図書館サーチへの問い合わせに失敗しました。時間をおいて試してください。',
    });
  }
};
