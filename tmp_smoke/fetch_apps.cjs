const fs = require('fs');
const http = require('http');
try {
  const data = JSON.parse(fs.readFileSync('tmp_smoke/comp_res.json','utf8'));
  const token = data.token || '';
  if (!token) { console.log('NO_TOKEN'); process.exit(0); }
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/company/applications',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json'
    }
  };
  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('HTTP_STATUS:' + res.statusCode);
      try { console.log(body); } catch(e) { console.log(body); }
    });
  });
  req.on('error', e => { console.error('REQUEST_ERROR', e.message); });
  req.end();
} catch (e) { console.error('ERR', e.message); }
