#!/usr/bin/env python3
"""
LinkedIn Scraper Anti-Detecção — Vagas com email
Modo: python3 linkedin_scraper.py [--cron]
"""

import requests
import re
import json
import time
import os
import random
import hashlib
from datetime import datetime

# ── Config ──
API_URL = os.getenv("API_URL", "http://136.248.109.21:3001")
API_USER = os.getenv("API_USER", "vssousa")
API_PASS = os.getenv("API_PASS", "Iphone5s.@")
COOKIES_FILE = os.path.join(os.path.dirname(__file__), "linkedin_cookies.txt")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "vagas_encontradas.json")
HISTORY_FILE = os.path.join(os.path.dirname(__file__), "scrape_history.json")
LOG_FILE = os.path.join(os.path.dirname(__file__), "scrape.log")

# ── User Agents rotativos ──
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
]

# ── Pool de queries (rotaciona e combina) ──
QUERY_POOL = [
    '"Vaga" AND "Desenvolvedor" AND "Email"',
    '"Vaga" AND "React" AND "Email"',
    '"Vaga" AND "Node" AND "Email"',
    '"Vaga" AND "Full Stack" AND "Email"',
    '"Vaga" AND "Frontend" AND "Email"',
    '"Vaga" AND "Backend" AND "Email"',
    '"Vaga" AND "Mobile" AND "Email"',
    '"Vaga" AND "React Native" AND "Email"',
    '"Vaga" AND "Typescript" AND "Email"',
    '"Vaga" AND "Next.js" AND "Email"',
    '"Vaga" AND "Python" AND "Email"',
    '"Vaga" AND "Java" AND "Email"',
    '"Vaga" AND "PHP" AND "Email"',
    '"Vaga" AND ".NET" AND "Email"',
    '"Vaga" AND "Flutter" AND "Email"',
    '"Vaga" AND "Angular" AND "Email"',
    '"Vaga" AND "Vue" AND "Email"',
    '"Vaga" AND "DevOps" AND "Email"',
    '"Vaga" AND "AWS" AND "Email"',
    '"Vaga" AND "Docker" AND "Email"',
    '"vagas" "enviar currículo" "email"',
    '"oportunidade" "desenvolvedor" "email"',
    '"contratação" "programador" "email"',
    '"requisição" "engenheiro" "email"',
]

# ── Filtros de data rotativos ──
DATE_FILTERS = [
    '["past-week"]',
    '["past-month"]',
    '["past-24h"]',
]

# ── anti-detecção ──
def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def carregar_historico():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE) as f:
            return json.load(f)
    return {"emails_ja_enviados": [], "queries_usadas": [], "ultima_execucao": None}

def salvar_historico(historico):
    with open(HISTORY_FILE, "w") as f:
        json.dump(historico, f, ensure_ascii=False)

def escolher_queries(n=4):
    """Escolhe N queries aleatórias, evitando as últimas usadas"""
    historico = carregar_historico()
    usadas = set(historico.get("queries_usadas", [])[-8:])
    disponiveis = [q for q in QUERY_POOL if q not in usadas]
    if len(disponiveis) < n:
        disponiveis = QUERY_POOL[:]
    escolhidas = random.sample(disponiveis, min(n, len(disponiveis)))
    historico["queries_usadas"] = historico.get("queries_usadas", []) + escolhidas
    if len(historico["queries_usadas"]) > 20:
        historico["queries_usadas"] = historico["queries_usadas"][-20:]
    salvar_historico(historico)
    return escolhidas

def delay_aleatorio(min_s=4, max_s=12):
    """Delay anti-detecção: 4-12 segundos"""
    t = random.uniform(min_s, max_s)
    log(f"⏳ Aguardando {t:.1f}s...")
    time.sleep(t)

def get_headers(cookies_str):
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": random.choice([
            "pt-BR,pt;q=0.9,en;q=0.8",
            "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "en-US,en;q=0.9,pt;q=0.8",
        ]),
        "Cookie": cookies_str,
        "Referer": random.choice([
            "https://www.linkedin.com/feed/",
            "https://www.linkedin.com/",
            "https://www.linkedin.com/search/",
        ]),
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
    }

# ── Email extraction ──
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
IGNORE = {"linkedin.com", "sentry.io", "example.com", "email.com", "domain.com", "company.com"}

def extrair_emails(texto):
    emails = EMAIL_REGEX.findall(texto)
    return list({e for e in emails if not any(e.lower().endswith(d) for d in IGNORE)})

def extrair_titulo(texto):
    """Extrai título da vaga com mais precisão"""
    padroes = [
        r"(?:TEMOS VAGA|VAGA|Vaga|🚀|💼)[:\s]*(.*?)(?:\n|<br|📍|$)",
        r"(?:Vaga[:\s])(.*?)(?:\n|📍|Remoto|Híbrido|Presencial|CLT|PJ|$)",
        r"(?:Contratação|Oportunidade|Buscamos|Procuramos)[:\s]*(.*?)(?:\n|$)",
        r"(Desenvolvedor\s+[\w\s]+?)(?:\s*[-–—]|\s*\n|📍|$)",
        r"(Engineer\s+[\w\s]+?)(?:\s*[-–—]|\s*\n|📍|$)",
        r"(Developer\s+[\w\s]+?)(?:\s*[-–—]|\s*\n|📍|$)",
        r"(Analista\s+[\w\s]+?)(?:\s*[-–—]|\s*\n|📍|$)",
        r"(Programador\s+[\w\s]+?)(?:\s*[-–—]|\s*\n|📍|$)",
    ]
    for p in padroes:
        m = re.search(p, texto, re.IGNORECASE)
        if m:
            titulo = m.group(1).strip()
            # Limpar lixo do título
            titulo = re.sub(r"<[^>]+>", "", titulo)
            titulo = re.sub(r"\s+", " ", titulo).strip()
            titulo = titulo[:120]
            if len(titulo) > 5:
                return titulo
    # Fallback: primeira linha significativa
    linhas = [l.strip() for l in texto.split("\n") if len(l.strip()) > 10]
    if linhas:
        return linhas[0][:120]
    return "Vaga"

def limpar_html(html):
    t = re.sub(r"<[^>]+>", " ", html).replace("&nbsp;", " ").replace("&amp;", "&")
    return re.sub(r"\s+", " ", t).strip()

# ── Busca LinkedIn ──
def buscar_linkedin(query, cookies_str, date_filter, page=0):
    url = "https://www.linkedin.com/search/results/content/"
    params = {
        "keywords": query,
        "origin": "FACETED_SEARCH",
        "sortBy": '["relevance"]',
        "datePosted": date_filter,
        "start": page * 10,
    }
    try:
        resp = requests.get(url, params=params, headers=get_headers(cookies_str), timeout=15)
        if resp.status_code == 200: return resp.text
        if resp.status_code == 429:
            log(f"🚫 Rate limit! Aguardando 60s...")
            time.sleep(60)
            return None
        log(f"⚠️ Status {resp.status_code}")
        return None
    except Exception as e:
        log(f"❌ Erro: {e}")
        return None

def parsear_posts(html):
    posts = []
    for m in re.finditer(r'data-testid="expandable-text-box"[^>]*>(.*?)</span>', html, re.DOTALL | re.IGNORECASE):
        texto = limpar_html(m.group(1))
        emails = extrair_emails(texto)
        if emails:
            posts.append({"titulo": extrair_titulo(texto), "descricao": texto[:1500], "emails": emails, "fonte": "linkedin"})
    return posts

# ── API ──
def login_api():
    try:
        r = requests.post(f"{API_URL}/api/auth/login", json={"username": API_USER, "password": API_PASS}, timeout=10)
        if r.status_code == 200:
            log("✅ API login OK")
            return r.cookies.get_dict()
        log(f"❌ Login falhou: {r.status_code}")
    except Exception as e:
        log(f"❌ API offline: {e}")
    return None

def enviar_para_api(posts, api_cookies):
    """Envia posts para a API com título + descrição completos para gerar currículo"""
    if not posts: return
    html_parts = []
    for p in posts:
        # Enviar título + descrição completa + email para a API gerar currículo personalizado
        titulo = p["titulo"]
        desc = p["descricao"]
        for email in p["emails"]:
            html_parts.append(
                f'<span data-testid="expandable-text-box">'
                f'💼 {titulo}\n'
                f'{desc}\n'
                f'Interessados enviar currículo para '
                f'<a href="mailto:{email}">{email}</a>'
                f'</span>'
            )
    try:
        r = requests.post(f"{API_URL}/api/curriculo/buscar-vagas/linkedin", json={"html": "\n".join(html_parts)}, cookies=api_cookies, timeout=30)
        if r.status_code == 200:
            d = r.json()
            log(f"📤 API: {d.get('total', 0)} vagas processadas")
            return d
    except Exception as e:
        log(f"❌ Erro API: {e}")
    return None

# ── Main ──
def main():
    log("=" * 50)
    log("🔗 LinkedIn Scraper — Ciclo iniciado")
    log("=" * 50)

    cookies_str = ""
    if os.path.exists(COOKIES_FILE):
        with open(COOKIES_FILE) as f: cookies_str = f.read().strip()

    if not cookies_str:
        log("⚠️ Sem cookies — modo offline")
        return

    historico = carregar_historico()
    emails_enviados = set(historico.get("emails_ja_enviados", []))

    queries = escolher_queries(random.randint(3, 5))
    date_filter = random.choice(DATE_FILTERS)
    log(f"📋 Queries: {len(queries)} | Filtro data: {date_filter}")

    api_cookies = login_api()
    todos_posts = []

    for i, query in enumerate(queries):
        log(f"🔍 [{i+1}/{len(queries)}] {query[:50]}...")
        delay_aleatorio(3, 8)

        for page in range(random.randint(1, 3)):
            html = buscar_linkedin(query, cookies_str, date_filter, page)
            if not html: break
            posts = parsear_posts(html)
            novos = [p for p in posts if not any(e in emails_enviados for e in p["emails"])]
            if novos:
                log(f"   📧 {len(novos)} novos com email")
                todos_posts.extend(novos)
                for p in novos:
                    for e in p["emails"]: emails_enviados.add(e)
            else:
                log(f"   📭 Novos: 0")
            delay_aleatorio(5, 15)

    # Deduplicar
    vistos = set()
    unicos = []
    for p in todos_posts:
        key = hashlib.md5(json.dumps(p["emails"]).encode()).hexdigest()
        if key not in vistos:
            vistos.add(key)
            unicos.append(p)

    log(f"📊 Total: {len(unicos)} vagas novas com email")

    # Salvar
    historico["emails_ja_enviados"] = list(emails_enviados)[-200:]
    historico["ultima_execucao"] = datetime.now().isoformat()
    salvar_historico(historico)

    if unicos:
        with open(OUTPUT_FILE, "w") as f: json.dump(unicos, f, ensure_ascii=False, indent=2)
        log(f"💾 Salvo: {OUTPUT_FILE}")

        if api_cookies:
            log("📤 Enviando para API...")
            enviar_para_api(unicos, api_cookies)

    log(f"✅ Ciclo finalizado — {len(unicos)} vagas processadas")

if __name__ == "__main__":
    main()
