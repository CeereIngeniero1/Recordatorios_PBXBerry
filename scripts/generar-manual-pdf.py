"""Genera MANUAL_USO_API_DATOS_WPP.pdf desde GUIA_USO.md."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MD_PATH = ROOT / "GUIA_USO.md"
PDF_PATH = ROOT / "MANUAL_USO_API_DATOS_WPP.pdf"
HTML_PATH = ROOT / "MANUAL_USO_API_DATOS_WPP.html"

MERMAID_REPLACEMENT = """
<div class="flow">
  <ol>
    <li><strong>Cliente</strong> → POST /auth/login</li>
    <li><strong>API</strong> valida usuario en SQL Server → devuelve <code>access_token</code></li>
    <li><strong>Cliente</strong> → POST /citas/confirmacion o /cancelacion (Bearer token)</li>
    <li><strong>API</strong> consulta vista → lista citas con <code>consecutivo</code></li>
    <li><strong>Cliente</strong> → PATCH /citas/estado-chatbot (Bearer token)</li>
    <li><strong>API</strong> actualiza <code>CompromisoVI.[Id Estado Chatbot]</code></li>
  </ol>
</div>
"""

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Manual de uso - API Datos WPP</title>
  <style>
    @page {{
      size: A4;
      margin: 2cm 1.8cm;
    }}
    body {{
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.45;
      color: #1a1a1a;
    }}
    h1 {{
      color: #0d47a1;
      font-size: 22pt;
      border-bottom: 3px solid #0d47a1;
      padding-bottom: 8px;
      margin-top: 0;
    }}
    h2 {{
      color: #1565c0;
      font-size: 14pt;
      margin-top: 1.4em;
      page-break-after: avoid;
    }}
    h3 {{
      color: #1976d2;
      font-size: 11.5pt;
      page-break-after: avoid;
    }}
    code, pre {{
      font-family: Consolas, "Courier New", monospace;
      font-size: 9pt;
    }}
    pre {{
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      white-space: pre-wrap;
      word-wrap: break-word;
      page-break-inside: avoid;
    }}
    code {{
      background: #f0f4f8;
      padding: 1px 4px;
      border-radius: 3px;
    }}
    table {{
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }}
    th, td {{
      border: 1px solid #bbb;
      padding: 6px 8px;
      text-align: left;
    }}
    th {{
      background: #e3f2fd;
      color: #0d47a1;
    }}
    tr:nth-child(even) td {{
      background: #fafafa;
    }}
    ul {{
      margin: 0.4em 0;
    }}
    li {{
      margin: 0.25em 0;
    }}
    .cover {{
      text-align: center;
      padding: 3cm 0 2cm;
      page-break-after: always;
    }}
    .cover h1 {{
      border: none;
      font-size: 26pt;
    }}
    .cover p {{
      color: #555;
      font-size: 12pt;
    }}
    .flow {{
      background: #e8f4fd;
      border-left: 4px solid #1976d2;
      padding: 12px 16px;
      margin: 12px 0;
    }}
    .footer-note {{
      margin-top: 2em;
      font-size: 9pt;
      color: #666;
      border-top: 1px solid #ccc;
      padding-top: 8px;
    }}
  </style>
</head>
<body>
  <div class="cover">
    <h1>Manual de uso</h1>
    <p><strong>API Datos WPP</strong></p>
    <p>Integracion de citas, JWT y estados chatbot</p>
    <p>Ceere — Documento generado desde GUIA_USO.md</p>
  </div>
  {content}
  <p class="footer-note">API Datos WPP — Manual de uso. Endpoint de estado: PATCH /citas/estado-chatbot</p>
</body>
</html>
"""


def prepare_markdown(text: str) -> str:
    text = re.sub(
        r"```mermaid[\s\S]*?```",
        MERMAID_REPLACEMENT,
        text,
        count=1,
    )
    return text


def main() -> int:
    try:
        import markdown
        from xhtml2pdf import pisa
    except ImportError:
        print("Instalando dependencias: markdown, xhtml2pdf...")
        import subprocess

        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "markdown", "xhtml2pdf", "-q"],
        )
        import markdown
        from xhtml2pdf import pisa

    if not MD_PATH.exists():
        print(f"No se encontro {MD_PATH}")
        return 1

    raw = MD_PATH.read_text(encoding="utf-8")
    prepared = prepare_markdown(raw)
    body = markdown.markdown(
        prepared,
        extensions=["tables", "fenced_code", "nl2br", "sane_lists"],
    )
    full_html = HTML_TEMPLATE.format(content=body)
    HTML_PATH.write_text(full_html, encoding="utf-8")

    with PDF_PATH.open("wb") as pdf_file:
        status = pisa.CreatePDF(full_html, dest=pdf_file, encoding="utf-8")

    if status.err:
        print(f"Error generando PDF: {status.err}")
        return 1

    print(f"PDF generado: {PDF_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
