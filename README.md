# Documento Preenchível

App estático (sem servidor) que converte um **PDF** ou **DOCX** em uma página HTML com **campos preenchíveis** e botão de **imprimir** pelo navegador.

## Como funciona

1. Carregue um arquivo `.pdf` ou `.docx`.
2. O documento é convertido para HTML no próprio navegador:
   - **DOCX** via [mammoth.js](https://github.com/mwilliamson/mammoth.js)
   - **PDF** via [PDF.js](https://github.com/mozilla/pdf.js) (extração de texto)
3. Marcadores no documento viram campos `<input>`:
   - `{{nome_do_campo}}` → campo com placeholder
   - `___` (3+ sublinhados) → campo em branco
4. Usuário preenche e clica em **Imprimir** (`window.print()`).

## Como usar

Como é 100% client-side, basta servir os arquivos estáticos:

```bash
# qualquer servidor estático funciona, p.ex.:
npx serve .
# ou
python -m http.server 8000
```

Ou publique direto no **GitHub Pages**: faça push em `main` e ative Pages nas configurações do repositório.

## Limitações conhecidas

- A conversão de PDF não preserva o layout exato — extrai apenas o texto linha a linha. Para layout fiel, seria necessário algo como [pdf2htmlEX](https://github.com/pdf2htmlEX/pdf2htmlEX) (server-side).
- DOCX preserva formatação básica (negrito, listas, títulos, tabelas).
- Documento de origem precisa conter os marcadores (`{{...}}` ou `___`) para que os campos sejam detectados.

## Licença

MIT
