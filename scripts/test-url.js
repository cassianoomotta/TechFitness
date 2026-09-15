const https = require('https');

const url = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1336-WVD66ff.gif';

https.get(url, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
}).on('error', (e) => {
  console.error(e);
});
