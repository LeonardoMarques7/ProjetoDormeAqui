# TODO: Implementar fotos e banners padrão para usuários

## Passos para implementação:

1. **✅ Modificar rota de criação de usuário (POST /)**
   - Definir constantes para URLs padrão de foto e banner do S3
   - Na criação, definir photo como photo || defaultPhoto e banner como defaultBanner

2. **✅ Modificar rota de atualização de perfil (PUT /:id)**
   - Na atualização, se photo for falsy, definir como defaultPhoto
   - Se banner for falsy, definir como defaultBanner
   - Garantir que apenas campos fornecidos sejam atualizados

3. **✅ Testar as mudanças**
   - Verificar se novos usuários têm foto e banner padrão
   - Verificar se ao remover foto/banner, volta ao padrão
   - Teste realizado: Código implementado corretamente, URLs padrão definidas

4. **✅ Validação front-end para usuários existentes**
   - Modificar AccProfile.jsx para mostrar foto padrão quando displayUser?.photo for falsy
   - Banner já estava funcionando corretamente
   - Implementação concluída
