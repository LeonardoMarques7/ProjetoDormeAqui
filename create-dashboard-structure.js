#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'front-end', 'src', 'components', 'dashboard');

const dirs = [
  path.join(basePath, 'utils'),
  path.join(basePath, 'hooks'),
  path.join(basePath, 'atoms'),
  path.join(basePath, 'sections'),
  path.join(basePath, 'styles'),
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Criado: ${dir}`);
  } else {
    console.log(`✓ Já existe: ${dir}`);
  }
});

console.log('\n✅ Estrutura de diretórios criada com sucesso!');
