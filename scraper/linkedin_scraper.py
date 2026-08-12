#!/usr/bin/env python3
"""
LinkedIn Job Scraper — Busca vagas com email de contato
Uso: python3 linkedin_scraper.py

ATENÇÃO: Usa cookies do navegador. Não automatiza cliques.
Apenas lê páginas públicas de busca.
"""

import requests
import re
import json
import time
import os
from datetime import datetime

# ── Config ──
API_URL = os.getenv("API_URL", "http://localhost:3001")
API_USER = os.getenv("API_USER", "vssousa")
API_PASS = os.getenv("API_PASS", "Iphone5s.@")

# Queries de busca (vagas com email)
SEARCH_QUERIES = [
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
]

# ── LinkedIn Headers ──
def get_linkedin_headers(cookies_str):
    """Converte cookies de navegador para headers"""
    return {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "Cookie": cookies_str,
        "Referer": "https://www.linkedin.com/",
    }


# ── Extração de email ──
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
IGNORE_DOMAINS = {"linkedin.com", "sentry.io", "example.com", "email.com", "domain.com"}


def extrair_emails(texto):
    """Extrai emails válidos de texto"""
    emails = EMAIL_REGEX.findall(texto)
    return list({
        e for e in emails
        if not any(e.lower().endswith(d) for d in IGNORE_DOMAINS)
    })


def extrair_titulo(texto):
    """Extrai título da vaga do texto"""
    padroes = [
        r"(?:TEMOS VAGA|VAGA|Vaga)[:\s]*(.*?)(?:\n|<br|$)",
        r"(?:Desenvolvedor|Engineer|Developer|Analista)[\w\s.,()-]{5,80}",
    ]
    for p in padroes:
        m = re.search(p, texto, re.IGNORECASE)
        if m:
            return m.group(1).strip()[:100] if m.lastindex else m.group(0).strip()[:100]
    return "Vaga"


def limpar_html(html):
    """Remove tags HTML"""
    texto = re.sub(r"<[^>]+>", " ", html)
    texto = texto.replace("&nbsp;", " ").replace("&amp;", "&")
    return re.sub(r"\s+", " ", texto).strip()


# ── Busca LinkedIn ──
def buscar_linkedin(query, cookies_str, page=0):
    """Busca posts no LinkedIn"""
    url = "https://www.linkedin.com/search/results/content/"
    params = {
        "keywords": query,
        "origin": "FACETED_SEARCH",
        "sortBy": '["relevance"]',
        "datePosted": '["past-week"]',
        "start": page * 10,
    }
    headers = get_linkedin_headers(cookies_str)

    try:
        resp = requests.get(url, params=params, headers=headers, timeout=15)
        if resp.status_code == 200:
            return resp.text
        print(f"  ⚠️ LinkedIn retornou {resp.status_code}")
        return None
    except Exception as e:
        print(f"  ❌ Erro na requisição: {e}")
        return None


def parsear_posts(html):
    """Extrai posts de busca do LinkedIn"""
    posts = []
    # Padrão para blocos de texto expandível
    padrao = re.compile(
        r'data-testid="expandable-text-box"[^>]*>(.*?)</span>',
        re.DOTALL | re.IGNORECASE,
    )
    for m in padrao.finditer(html):
        conteudo = m.group(1)
        texto = limpar_html(conteudo)
        emails = extrair_emails(texto)

        if emails:
            titulo = extrair_titulo(texto)
            posts.append({
                "titulo": titulo,
                "descricao": texto[:500],
                "emails": emails,
                "fonte": "linkedin",
                "data": datetime.now().isoformat(),
            })

    return posts


# ── Envio para API ──
def login_api():
    """Login na API do curriculos"""
    try:
        resp = requests.post(
            f"{API_URL}/api/auth/login",
            json={"username": API_USER, "password": API_PASS},
            timeout=10,
        )
        if resp.status_code == 200:
            cookies = resp.cookies.get_dict()
            print(f"✅ Login na API OK")
            return cookies
        print(f"❌ Login falhou: {resp.status_code}")
        return None
    except Exception as e:
        print(f"❌ Erro ao conectar na API: {e}")
        return None


def enviar_para_api(posts, api_cookies):
    """Envia posts extraídos para o parser LinkedIn da API"""
    if not posts:
        return

    # Montar HTML fake para o parser da API
    html_parts = []
    for p in posts:
        for email in p["emails"]:
            html_parts.append(
                f'<span data-testid="expandable-text-box">'
                f'{p["titulo"]}<br>{p["descricao"][:200]}<br>'
                f'Enviar email para <a href="mailto:{email}">{email}</a>'
                f'</span>'
            )

    html_fake = "\n".join(html_parts)

    try:
        resp = requests.post(
            f"{API_URL}/api/curriculo/buscar-vagas/linkedin",
            json={"html": html_fake},
            cookies=api_cookies,
            timeout=30,
        )
        if resp.status_code == 200:
            data = resp.json()
            print(f"📤 Enviado para API: {data.get('total', 0)} vagas")
        else:
            print(f"⚠️ API retornou {resp.status_code}")
    except Exception as e:
        print(f"❌ Erro ao enviar para API: {e}")


# ── Main ──
def main():
    print("=" * 60)
    print("🔗 LinkedIn Job Scraper — Vagas com Email")
    print("=" * 60)
    print()

    # Ler cookies do arquivo ou pedir
    cookies_file = os.path.join(os.path.dirname(__file__), "linkedin_cookies.txt")
    if os.path.exists(cookies_file):
        with open(cookies_file) as f:
            cookies_str = f.read().strip()
        print(f"🍪 Cookies carregados de {cookies_file}")
    else:
        print("📋 Para usar, salve seus cookies do LinkedIn em:")
        print(f"   {cookies_file}")
        print()
        print("   Como obter:")
        print("   1. Abra LinkedIn no Chrome")
        print("   2. Abra DevTools (F12) → Application → Cookies")
        print("   3. Copie todos os cookies como string")
        print("   4. Cole no arquivo acima")
        print()
        print("   Ou defina a variável: export LINKEDIN_COOKIES='seus_cookies'")
        cookies_str = os.getenv("LINKEDIN_COOKIES", "")

    if not cookies_str:
        print("⚠️ Sem cookies. Usando modo demonstração (parse local)")
        print()
        # Modo demonstração: parse de HTML de exemplo
        demo_html = """
        <span data-testid="expandable-text-box">💼 TEMOS VAGA: Desenvolvedor React
        📍 Remoto<br>Interessados enviar email para
        <a href="mailto:rh@empresa.com">rh@empresa.com</a></span>
        <span data-testid="expandable-text-box">🚀 Vaga: Node.js Backend
        📍 São Paulo<br>Enviar CV para
        <a href="mailto:jobs@techcorp.com.br">jobs@techcorp.com.br</a></span>
        """
        posts = parsear_posts(demo_html)
        print(f"📝 Demo: {len(posts)} posts com email")
        for p in posts:
            print(f"   • {p['titulo']} → {', '.join(p['emails'])}")
        return

    # Login na API
    api_cookies = login_api()

    # Buscar em cada query
    todos_posts = []
    for i, query in enumerate(SEARCH_QUERIES):
        print(f"\n🔍 [{i+1}/{len(SEARCH_QUERIES)}] Buscando: {query}")

        for page in range(3):  # 3 páginas por query
            html = buscar_linkedin(query, cookies_str, page)
            if not html:
                break

            posts = parsear_posts(html)
            if posts:
                print(f"   📧 {len(posts)} posts com email encontrados")
                todos_posts.extend(posts)
            else:
                print(f"   📭 Nenhum email nesta página")

            time.sleep(2)  # Rate limit gentil

        time.sleep(3)  # Pausa entre queries

    # Deduplicar por email
    emails_unicos = {}
    for p in todos_posts:
        for email in p["emails"]:
            if email not in emails_unicos:
                emails_unicos[email] = p

    posts_finais = list(emails_unicos.values())

    print(f"\n{'='*60}")
    print(f"📊 Resultado: {len(posts_finais)} vagas com email único")
    print(f"{'='*60}")

    for p in posts_finais:
        print(f"  📧 {p['titulo']}")
        print(f"     → {', '.join(p['emails'])}")

    # Salvar localmente
    output_file = os.path.join(os.path.dirname(__file__), "vagas_encontradas.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(posts_finais, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Salvo em: {output_file}")

    # Enviar para API
    if api_cookies:
        print(f"\n📤 Enviando para API...")
        enviar_para_api(posts_finais, api_cookies)

    print("\n✅ Concluído!")


if __name__ == "__main__":
    main()
