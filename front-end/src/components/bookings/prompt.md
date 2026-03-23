Você está refatorando um sistema que atualmente usa AWS S3 para armazenamento de arquivos.

Sua tarefa é substituir completamente o S3 por Supabase Storage, sem alterar a lógica de negócio.

Passos:

1. Identifique onde o S3 é usado (upload, download, delete, geração de URL)
2. Remova dependências do AWS SDK
3. Implemente equivalente usando Supabase Storage
4. Garanta que o retorno das funções continue compatível com o código existente

Requisitos:

- Código deve continuar funcionando sem mudanças no restante da aplicação
- URLs devem continuar sendo públicas
- Estrutura de pastas deve ser mantida (se houver)
- Código deve ser limpo e moderno

Tecnologia alvo:

- Supabase Storage com @supabase/supabase-js

Saída esperada:

- Código refatorado completo
- Arquivo readme.md explicando como será usado o novo modelo, incluindo tutoriais e as variaveis de ambiente
