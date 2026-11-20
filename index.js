require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

const urls = [];

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const original = req.body.url;

  let hostname;
  try {
    const parsedUrl = new urlparser.URL(original);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }
    hostname = parsedUrl.hostname;
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, function(err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    urls.push(original);
    const short = urls.length - 1;
    res.json({ original_url: original, short_url: short });
  });
});

app.get('/api/shorturl/:short', function(req, res) {
  const original = urls[req.params.short];
  if (original) {
    return res.redirect(original);
  }

  res.json({ error: 'invalid url' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
