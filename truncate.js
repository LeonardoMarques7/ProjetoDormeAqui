const fs = require('fs');
const content = fs.readFileSync('C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/components/layout/Sidebar.jsx', 'utf8');
const lines = content.split('\n');
const truncated = lines.slice(0, 289).join('\n') + '\n';
fs.writeFileSync('C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/components/layout/Sidebar.jsx', truncated);
console.log('Done. Lines written:', lines.slice(0, 289).length);
