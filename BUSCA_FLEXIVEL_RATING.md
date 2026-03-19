# 🔍 Busca Flexível com Filtro de Estrelas

## ✨ Melhorias Implementadas

### 1. **Busca Flexível (Não Obrigatória)**

Todos os filtros são **opcionais** - você pode buscar por:

- ✅ Apenas **cidade**
- ✅ Apenas **quartos**
- ✅ Apenas **hóspedes**
- ✅ Apenas **avaliação**
- ✅ Qualquer **combinação** dos filtros
- ✅ Sem nenhum filtro (retorna todas as acomodações)

### 2. **Novo Dropdown de Estrelas** ⭐

- Filtro por avaliação mínima
- Opções: 1+, 2+, 3+, 4+, 5 estrelas
- Disponível em ambas as versões (compacta e completa)
- Estilização consistente com o resto da SearchBar

---

## 📡 Exemplos de Requisições Flexíveis

### Buscar apenas por cidade

```
GET /places?city=Rio
```

### Buscar apenas por quartos

```
GET /places?rooms=2
```

### Buscar apenas por avaliação

```
GET /places?minRating=4
```

### Buscar apenas por hóspedes

```
GET /places?guests=3
```

### Combinações diversas

```
# Quartos + Avaliação
GET /places?rooms=2&minRating=4

# Cidade + Avaliação
GET /places?city=São Paulo&minRating=3

# Quartos + Hóspedes
GET /places?rooms=1&guests=2

# Todos os filtros
GET /places?city=Rio&guests=2&rooms=1&minRating=4

# Sem filtros (retorna tudo)
GET /places
```

---

## 🗂️ Arquivos Modificados

### Frontend

#### 1. **`front-end/src/components/schemas/searchSchema.jsx`**

- ✅ Adicionado validação para `minRating`
  - Tipo: number (0-5)
  - Campo opcional
  - Aceita valores decimais (ex: 4.5)

#### 2. **`front-end/src/components/layout/SearchBar.jsx`**

- ✅ Importado ícone `Star` do lucide-react
- ✅ **Versão Compacta (Header)**:
  - Adicionado campo de quartos
  - Adicionado dropdown de avaliação (compacto)
  - Labels abreviados: "1+", "2+", etc.
- ✅ **Versão Padrão (Página)**:
  - Adicionado dropdown de avaliação (completo)
  - Labels descritivos com emojis de estrelas
- ✅ Atualizado `onSubmit`:
  - Adicionado `minRating` aos query params
  - Mantém flexibilidade: só envia se tem valor

#### 3. **`front-end/src/pages/Home.jsx`**

- ✅ Adicionado `minRating: null` aos defaultValues
- ✅ Atualizado `onSubmit`:
  - Adicionado `minRating` aos query params

### Backend

#### 1. **`back-end/domains/places/routes.js`**

- ✅ Rota `GET /` atualizada:
  - Adicionado filtro `minRating`
  - Query MongoDB: `averageRating: { $gte: parseFloat(minRating) }`
  - Comportamento: só aplica filtro se valor > 0

---

## 🎨 UI/UX

### Dropdown de Estrelas

```
┌─────────────────────────────────┐
│ Todas as avaliações       ▼     │
├─────────────────────────────────┤
│ ⭐ 1+ Estrela                    │
│ ⭐⭐ 2+ Estrelas                 │
│ ⭐⭐⭐ 3+ Estrelas               │
│ ⭐⭐⭐⭐ 4+ Estrelas             │
│ ⭐⭐⭐⭐⭐ 5 Estrelas            │
└─────────────────────────────────┘
```

**Versão Compacta (Header)**:

- Rótulos curtos: "Avaliação" no placeholder
- Opções reduzidas: "1+", "2+", etc.
- Melhor proporção para telas pequenas

**Versão Completa (Página)**:

- Rótulos descritivos com emojis
- Maior clareza sobre o que cada opção significa
- Melhor para ler e entender

---

## 🧪 Cenários de Teste

### Teste 1: Buscar só por Quartos

```
1. Deixe cidade, hóspedes e avaliação vazios
2. Selecione apenas "Salas: 2"
3. Clique em buscar
4. Resultado: Todos os imóveis com 2+ quartos
```

### Teste 2: Buscar só por Avaliação

```
1. Deixe cidade, hóspedes e quartos vazios
2. Selecione "⭐⭐⭐⭐ 4+ Estrelas"
3. Clique em buscar
4. Resultado: Todos os imóveis com avaliação ≥ 4
```

### Teste 3: Combinação de Filtros

```
1. Cidade: "Rio"
2. Quartos: 2
3. Hóspedes: 3
4. Avaliação: 3+ Estrelas
5. Resultado: Rio + 2+ quartos + 3+ hóspedes + ≥3.0 rating
```

### Teste 4: Sem Filtro (Padrão)

```
1. Deixe todos os campos vazios
2. Clique em buscar
3. Resultado: Lista completa de acomodações
```

### Teste 5: Validações

```
Tentando valores inválidos:
- minRating: -1 (deve ser ignorado/validado)
- minRating: 6 (máximo é 5, deve ser bloqueado)
- minRating: "abc" (deve converter para número)
```

---

## 📊 Estrutura de Dados

### Query Params Suportados

```javascript
{
  city: string,           // Filtro por cidade (regex)
  guests: number,         // Mínimo de hóspedes ($gte)
  rooms: number,          // Mínimo de quartos ($gte)
  minRating: number       // Avaliação mínima ($gte) - NOVO
}
```

### Todos são opcionais - a query não exige nenhum deles

---

## 🔧 Configurações Ajustáveis

### Limites de Rating (em `searchSchema.jsx`)

```javascript
minRating: z.coerce
    .number()
    .min(0, "Mínimo de 0 estrelas")    // ← Pode mudar
    .max(5, "Máximo de 5 estrelas")    // ← Pode mudar
    .optional()
    .nullable(),
```

### Opções do Dropdown (em `SearchBar.jsx`)

```javascript
<option value="1">⭐ 1+ Estrela</option>      // ← Customize aqui
<option value="2">⭐⭐ 2+ Estrelas</option>
<option value="3">⭐⭐⭐ 3+ Estrelas</option>
<option value="4">⭐⭐⭐⭐ 4+ Estrelas</option>
<option value="5">⭐⭐⭐⭐⭐ 5 Estrelas</option>
```

---

## ✅ Checklist de Implementação

- [x] Schema Zod com validação de rating
- [x] Backend aceita `minRating` via query param
- [x] MongoDB query implementada ($gte)
- [x] SearchBar compacta com dropdown
- [x] SearchBar completa com dropdown
- [x] Home.jsx integrada
- [x] Query params construídos corretamente
- [x] Todos os filtros são opcionais
- [x] Comportamento de "sem filtro" funciona

---

## 🚀 Próximas Melhorias Sugeridas

- [ ] Filtro de preço (min/max)
- [ ] Filtro de amenidades (piscina, wifi, etc)
- [ ] Ordenação dos resultados (por preço, rating, etc)
- [ ] Histórico de buscas recentes
- [ ] URL params persistem ao recarregar página
- [ ] Dark mode para o dropdown
- [ ] Animação de transição nos drops

---

## 📞 Troubleshooting

### Dropdown não mostra os valores

- ✅ Verifique se o `select` tem estilos CSS adequados
- ✅ Confirme que o `value` de cada `option` é uma string

### Filtro de rating não está filtrando

- ✅ Verifique se `averageRating` existe no banco de dados
- ✅ Confirme que o backend está recebendo `minRating` no query param
- ✅ Teste com: `curl /places?minRating=4`

### Busca vazia não retorna nada

- ✅ Todos os filtros são opcionais - query vazia deve retornar tudo
- ✅ Verifique se `Place.find({})` retorna todos os documentos
