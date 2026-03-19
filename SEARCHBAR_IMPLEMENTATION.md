# 🔍 Implementação Completa da SearchBar Melhorada

## 📋 Resumo das Mudanças

Foi implementada uma busca avançada no DormeAqui com suporte a filtros de **cidade**, **hóspedes** e **número de quartos** com validações robustas.

---

## 🎯 Funcionalidades Implementadas

### 1. **Novo Campo de Quartos**

- ✅ Campo de entrada numérico para filtrar por mínimo de quartos
- ✅ Ícone `DoorOpen` do lucide-react
- ✅ Validações: mínimo 1, máximo 10 quartos
- ✅ Tanto na versão compacta (header) quanto na versão padrão (página)

### 2. **Backend - Filtros Dinâmicos**

- ✅ Rota `GET /places` atualizada
- ✅ Suporte completo para filtros: `city`, `guests`, `rooms`
- ✅ Filtros são opcionais e podem ser combinados
- ✅ Consulta MongoDB com operadores `$regex` e `$gte`

### 3. **Validações**

- Schema Zod atualizado em `searchSchema.jsx`:
  - City: máximo 100 caracteres (opcional)
  - Checkin: data para hoje ou futuro (opcional)
  - Checkout: data valid (opcional)
  - Guests: 1-20 hóspedes (opcional)
  - **Rooms: 1-10 quartos (novo - opcional)**

---

## 📡 Exemplos de Requisições

### Buscar por Cidade

```
GET /places?city=Rio+de+Janeiro
```

### Buscar por Hóspedes

```
GET /places?guests=4
```

### Buscar por Quartos

```
GET /places?rooms=3
```

### Buscar com Múltiplos Filtros

```
GET /places?city=São+Paulo&guests=2&rooms=2
```

### Sem Filtros (Retorna Todas)

```
GET /places
```

---

## 🗂️ Arquivos Modificados

### Frontend

1. **`front-end/src/components/schemas/searchSchema.jsx`**
   - Adicionado validação para `rooms`

2. **`front-end/src/components/layout/SearchBar.jsx`**
   - Importado `DatePickerAirbnb` e `DoorOpen`
   - Adicionado campo de quartos (versão compacta)
   - Adicionado campo de quartos (versão padrão)
   - Atualizado `onSubmit` para fazer requisições ao backend

3. **`front-end/src/pages/Home.jsx`**
   - Adicionado `rooms` aos `defaultValues`
   - Atualizado `onSubmit` para fazer requisições ao backend
   - Removido filtro local (agora é feito no backend)

### Backend

1. **`back-end/domains/places/routes.js`**
   - Rota `GET /` atualizada com filtros dinâmicos
   - Suporte para `city`, `guests`, `rooms` via query params

---

## 🎨 Componentes UI Utilizados

- **Ícones**: `DoorOpen`, `Users`, `Search`, `AlertCircle`, `MapPin` (lucide-react)
- **Inputs**: Number input nativo do HTML
- **Botão**: `ShimmerButton` (efeito shimmer customizado)
- **Datepickers**: `DatePickerSearch` e `DatePickerAirbnb`
- **Google Places**: `GooglePlacesInput`

---

## 🧪 Como Testar

### 1. **Teste Local na SearchBar Compacta**

```
1. Abra a aplicação no navegador
2. Na barra do header, preencha os campos:
   - Cidade: "Rio de Janeiro"
   - Datas: Selecione check-in e check-out
   - Hóspedes: 2
   - Quartos: 1 (NOVO)
3. Clique em buscar
4. Verifique se os resultados têm pelo menos 2 hóspedes e 1 quarto
```

### 2. **Teste na Home Page**

```
1. Clique em "Buscar" em uma SearchBar da página
2. Preencha todos os campos incluindo quartos
3. Verifique se a requisição é feita ao backend e os filtros são aplicados
```

### 3. **Teste de Requisição via cURL/Postman**

```bash
# Teste simples
curl "http://localhost:3000/places"

# Com filtro de cidade
curl "http://localhost:3000/places?city=Rio"

# Com múltiplos filtros
curl "http://localhost:3000/places?city=São%20Paulo&guests=3&rooms=2"
```

### 4. **Teste de Validações**

```
1. Tente inserir:
   - Número de quartos: 0 (deve falhar - mínimo é 1)
   - Número de quartos: 11 (deve falhar - máximo é 10)
   - Número de quartos: 2.5 (deve falhar - deve ser inteiro)
2. Valores válidos: 1, 2, 3... 10
```

---

## 📊 Fluxo de Dados

```
SearchBar (Frontend)
    ↓
Form Submission
    ↓
onSubmit (valida com Zod schema)
    ↓
Axios GET /places?city=...&guests=...&rooms=...
    ↓
Backend Route Handler
    ↓
Construir MongoDB query ({city: regex, guests: $gte, rooms: $gte})
    ↓
Place.find(query)
    ↓
JSON Response
    ↓
Navigate com results no state
    ↓
Home Component atualiza placesSearch
    ↓
Grid de Items renderizado
```

---

## 🔧 Configurações de Limites

Os limites podem ser ajustados no schema (`searchSchema.jsx`):

```javascript
rooms: z.coerce
    .number()
    .int()
    .min(1, "Mínimo de 1 quarto")      // ← Ajuste aqui
    .max(10, "Máximo de 10 quartos")   // ← Ou aqui
    .optional()
    .nullable(),
```

---

## 📝 Notas Importantes

1. **Filtros são Opcionais**: Usuários podem deixar em branco
2. **Query Backend**: Só adiciona à query os filtros que têm valor
3. **Sem Cache Local**: A busca sempre vai ao backend (mais correto, menos performance)
4. **Validação Dupla**: Zod no frontend + validação implícita no backend

---

## 🚀 Próximos Passos (Opcional)

- [ ] Adicionar filtro de datas com verificação de disponibilidade
- [ ] Implementar filtro por preço
- [ ] Adicionar paginação
- [ ] Cache de resultados recentes
- [ ] Sugestões de autocomplete para cidades
- [ ] Filtros de amenidades/perks

---

## 📞 Suporte

Qualquer dúvida sobre a implementação, verifique:

- `searchSchema.jsx` para validações
- `SearchBar.jsx` para UI
- `places/routes.js` para lógica backend
- `Home.jsx` para integração
