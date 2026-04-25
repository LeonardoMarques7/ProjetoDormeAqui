const fs = require('fs');
const path = require('path');

const basePath = 'C:\\Users\\leona\\Desktop\\ProjetoDormeAqui\\front-end\\src\\components\\dashboard';
const dirs = ['utils', 'hooks', 'atoms', 'sections', 'styles'];

dirs.forEach(dir => {
  const fullPath = path.join(basePath, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ Criado: ${fullPath}`);
  } else {
    console.log(`✓ Já existe: ${fullPath}`);
  }
});

console.log('\n✓ Todos os diretórios foram processados com sucesso!');
