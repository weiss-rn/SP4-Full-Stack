const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, '..', 'src', 'screens');

fs.writeFileSync(path.join(screensDir, 'test-success.txt'), 'ok', 'utf8');
console.log('test-success.txt created:', fs.existsSync(path.join(screensDir, 'test-success.txt')));
