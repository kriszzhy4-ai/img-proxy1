const express = require('express');
const axios = require('axios');
const app = express();

const C1 = 'https://cf.tiyanstores.workers.dev/?url='
const C2 = 'https://cf.elainaa.workers.dev/'
const C3 = 'https://cors.siputzx.my.id/'
const C4 = `${C2}https://px.zeroplay.my.id/`

const PROXY_DOMAINS = [
  'https://s4.anilist.co',
  'https://nimegami.id',
  'https://myanimelist.net',
  'https://cdn.myanimelist.net',
  `${C4}img?url=https://xyz-api.animein.net`,
  `${C4}img?url=https://animein.net`,
  `${C4}img?url=https://api.animein.net`,
  'https://kuronime.sbs',
  `${C4}img?url=https://otakudesu.blog`
];

const NOT_FOUND_IMAGE = 'https://kemii.my.id/files/2tYerH.png';

app.get('/', (req, res) => {
  res.send('numpang tanya, yang jual sparepart motor siapa ya');
});

app.use(async (req, res) => {
  const path = req.originalUrl;

  for (const domain of PROXY_DOMAINS) {
    const targetUrl = `${domain}${path}`;

    try {
      console.log(`Mencoba: ${targetUrl}`);

      const response = await axios.get(targetUrl, {
        responseType: 'stream',
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': domain,
          'Accept': req.headers['accept'] || '*/*',
          'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9'
        },
        validateStatus: (status) => status < 500
      });

      if (response.status === 403 || response.status === 404) {
        console.log(`❌ ${domain} => ${response.status}, lanjut...`);
        continue;
      }

      console.log(`✅ ${domain} => ${response.status}`);

      if (response.headers['content-type']) {
        res.set('Content-Type', response.headers['content-type']);
      }
      res.set('Cache-Control', 'public, max-age=86400');

      response.data.pipe(res);
      return;

    } catch (err) {
      console.log(`⚠️ Error di ${domain}: ${err.message}`);
      continue;
    }
  }

  const fallback = await axios.get(NOT_FOUND_IMAGE, {
    responseType: 'stream',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  res.set('Content-Type', 'image/png');
  res.set('Cache-Control', 'public, max-age=86400');
  fallback.data.pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy jalan di http://localhost:${PORT}`);
});
