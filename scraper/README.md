# LinkedIn Scraper — Vagas com Email

Busca vagas no LinkedIn que possuem email de contato e envia para o sistema de currículos.

## Como usar

### 1. Instalar dependências

```bash
cd scraper
pip3 install -r requirements.txt
```

### 2. Obter cookies do LinkedIn

1. Abra LinkedIn no Chrome
2. Faça login
3. Abra DevTools (F12) → Application → Cookies → linkedin.com
4. Copie todos os cookies como string
5. Salve em `scraper/linkedin_cookies.txt`

Ou defina a variável:

```bash
export LINKEDIN_COOKIES='li_at=...; li_mc=...'
```

### 3. Rodar

```bash
python3 linkedin_scraper.py
```

### 4. Resultado

- `vagas_encontradas.json` — vagas extraídas localmente
- Enviado automaticamente para a API do curriculos

## Queries de busca

O scraper busca por vagas com palavras-chave:

- Desenvolvedor + Email
- React + Email
- Node + Email
- Full Stack + Email
- Frontend/Backend + Email
- Mobile/React Native + Email
- TypeScript/Next.js + Email

## Limitações

- **LinkedIn bloqueia scraping** — cookies expiram, conta pode ser limitada
- **Rate limit** — script faz pausas entre requisições
- **Resultados variam** — depende da busca do LinkedIn
- **Alternativa mais segura**: usar o parser HTML do frontend (colar o HTML manualmente)

## Segurança

- Cookies ficam apenas localmente (não enviados para servidor)
- Script roda localmente, não no servidor
- Respeita rate limits do LinkedIn
