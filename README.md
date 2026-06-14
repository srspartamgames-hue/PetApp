# PetApp

PWA de organização da saúde e rotina de pets. App estático (sem backend),
dados locais no navegador (IndexedDB). Publicável no GitHub Pages.

## Desenvolvimento
- Servir: `npm run dev` (python -m http.server 8080) e abrir http://localhost:8080
- Testes da lógica pura: `npm test` (node --test)

Spec e plano em `docs/superpowers/`.

## Deploy (GitHub Pages)
1. Crie um repositório no GitHub e envie o código:
   `git remote add origin https://github.com/<usuario>/<repo>.git`
   `git push -u origin main`
2. No GitHub: Settings → Pages → Source: "Deploy from a branch" → branch `main` / pasta `/ (root)`.
3. Acesse `https://<usuario>.github.io/<repo>/`.

Como o app é estático, não há build. Cada `git push` atualiza o site.
Após publicar uma nova versão, suba o número do cache em `sw.js` (`petapp-v1` → `petapp-v2`)
para forçar a atualização do service worker.
