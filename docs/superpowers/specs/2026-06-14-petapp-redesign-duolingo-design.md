# PetApp — Redesign visual "Duolingo-grade" + tema escuro + pet-demo

**Data:** 2026-06-14
**Status:** Aprovado para planejamento
**Iteração:** 2 (sobre o MVP já publicado)
**Relacionado:** [MVP design](2026-06-14-petapp-mvp-design.md)

## 1. Resumo

Elevar o MVP a um visual **bonito, profissional e divertido no estilo Duolingo**,
sem alterar funcionalidades. Inclui três frentes:

1. **Overhaul visual/UX** de todas as telas (encorpado, redondo, carismático).
2. **Tema escuro** com toggle.
3. **Pet-demo pré-carregado** ("Thor", Dobermann macho) com dados fictícios
   realistas, para quem abrir o MVP no GitHub Pages já ver o app populado.

Restrições do MVP continuam valendo: **sem build, sem dependências em runtime**
(exceção: fontes vendorizadas como arquivos estáticos), **offline/PWA**, dados
locais em IndexedDB.

## 2. Objetivos e critérios de sucesso

- **Visual de produto, não de protótipo.** Validar o design (objetivo do MVP):
  a interface deve parecer um app comercial polido.
- **Mesma funcionalidade.** Nenhuma regra de negócio muda; os 9 testes
  (`node --test`) continuam passando.
- **Primeiro acesso encantador.** Quem abre a página vê o "Thor" populado,
  com um painel vivo (peso, rotina parcialmente concluída, um alerta próximo).
- **Acessível em claro e escuro**, com contraste adequado nos dois temas.

## 3. Princípios de design

- **Cor é semântica.** 🟢 Verde = positivo/avançar (todas as ações primárias).
  🟡 Âmbar = atenção. 🔴 Vermelho = atrasado / destrutivo (excluir). Nunca usar
  tom quente em ação positiva.
- **Encorpado e redondo.** Cantos grandes, tipografia arredondada bold,
  profundidade por "lip" 3D (sombra sólida deslocada, sem blur).
- **Deleite com moderação.** Microinterações que dão feedback e alegria sem
  atrapalhar (press dos botões, "pop" no check, confete ao concluir a rotina).
- **Mascote dá alma.** Um personagem-pet aparece onde antes havia vazio.

## 4. Sistema de design renovado (tokens)

### Tipografia (vendorizada, offline)
- **Fredoka** (pesos 600/700) — títulos, números de destaque e botões.
- **Nunito** (pesos 600/700/800) — corpo e rótulos.
- Servidas localmente em `fonts/` via `@font-face` (formato woff2), licença
  **SIL OFL** (incluir `fonts/OFL.txt`). Adicionadas ao cache do service worker.
- Boot anti-FOUC: a fonte e o tema são definidos antes da primeira pintura.

### Cores — tema claro
- Primária (positivo): `--green:#19B888`, lip `--green-lip:#0F8A66`,
  tinta forte `--green-ink:#0F6E56`, fundo suave `--green-50:#E1F5EE`.
- Superfícies: `--bg:#F2FBF7`, `--surface:#FFFFFF`, `--line:#E4F3EC`.
- Texto: `--text:#16241F`, `--text-2:#5B6B66`, `--text-3:#8A9A95`.
- Atenção: `--warn:#EF9F27` / `--warn-bg:#FAEEDA` / `--warn-ink:#854F0B`.
- Atrasado/destrutivo: `--late:#E24B4A` / `--late-bg:#FBE9E7` / `--late-ink:#7A241B`.

### Cores — tema escuro (`[data-theme="dark"]`)
- Superfícies: `--bg:#0E1A16`, `--surface:#16241F`, `--line:#243A32`.
- Texto: `--text:#EAF3EF`, `--text-2:#9DB3AB`, `--text-3:#6E847C`.
- Primária mantém `#19B888`; lip mais escuro `#0C6B50`; destaques/realces de
  texto usam verde mais claro `#5DD6AE`. Âmbar/vermelho ajustados para contraste.

### Forma e profundidade
- Raios: `--r-md:14px`, `--r-lg:18px`, `--r-xl:22px`, `--r-pill:999px`.
- "Lip" 3D: botões `box-shadow:0 4px 0 var(--…-lip)`; cards `0 4px 0 var(--line)`.
- Estado `:active` dos botões: `translateY(2px)` e lip reduzido (afunda).
- Alvos de toque ≥ 48px.

## 5. Componentes repaginados

Todos visualmente coerentes, em claro e escuro:
- **Botão 3D** (`.btn` + variantes `primary`/positivo verde, `danger` vermelho,
  `ghost`/secundário) com afundar no toque.
- **Check-rows** da rotina chunky, com "pop" ao marcar e estado concluído verde.
- **Cards** redondos com lip; **pílulas** de status maiores.
- **Nav inferior** com aba ativa em "pílula" preenchida.
- **Inputs/*selects*/textarea** maiores (≥48px), foco com anel verde.
- **Modais/sheets** arredondados.
- **Estados vazios** com o mascote + chamada para ação amigável.

## 6. Mascote

- Módulo `js/mascots.js` → `mascot(especie)` devolve um SVG (sem dependências).
- Variantes: **cão**, **gato** e **genérico** (escolhido pela espécie do pet).
- Usos: avatar no cabeçalho quando o pet não tem foto; ilustração dos estados
  vazios; **micro-comemoração** ao concluir 100% da rotina do dia.

## 7. Tema escuro + toggle

- Todas as cores são variáveis CSS; o tema é trocado por
  `document.documentElement.dataset.theme = 'dark' | 'light'`.
- `js/theme.js`: lê `localStorage['petapp.theme']`; se ausente, segue
  `prefers-color-scheme`. Expõe `initTheme()` e `toggleTheme()`.
- Toggle **sol/lua** no cabeçalho; a escolha **persiste**.
- Boot inline no `<head>` define o tema antes da primeira pintura (evita flash).

## 8. Microinterações

- Press dos botões (afundar), transição suave ao trocar de tela.
- "Pop" ao marcar item da rotina; feedback (toast) ao salvar.
- **Confete** leve (CSS/JS sem dependência, `js/confetti.js` → `celebrate()`)
  ao concluir 100% da rotina do dia. Respeita `prefers-reduced-motion`.

## 9. Pet-demo pré-carregado

### Comportamento
- `js/demo-seed.js` roda no boot **antes da primeira renderização**.
- Semeia **apenas uma vez**, quando o banco está vazio (`pets` vazio) e a flag
  `localStorage['petapp.seeded']` não existe. Define a flag após semear.
- **Datas relativas a "hoje"** no momento da semeadura (usando `addMonths`/
  `addDays`), para o demo nunca parecer desatualizado e sempre exibir um mix de
  "em dia" + um alerta próximo.
- **"Começar do zero":** botão nas configurações/tutor que limpa todos os stores
  (`ALL_STORES`), mantém a flag `seeded` (não re-semeia) e recarrega — saída
  limpa do modo demo para quem quer usar com o próprio pet.

### Dados do Thor (Dobermann macho) — fictícios e realistas
Offsets são relativos à data de semeadura.

- **Pet:** nome "Thor", espécie "Cão", sexo "Macho", raça "Dobermann",
  nascimento −36 meses, porte "Grande", cor "Preto e castanho", sem foto
  (mostra o mascote), comportamento "Leal, protetor, muito enérgico e
  inteligente.", preferências "Corridas no parque, brinquedos de morder e ficar
  perto do tutor.", restrições "Sensível ao frio (pelo curto); evitar exercício
  intenso logo após comer."
- **Tutor (fictício):** Maria Oliveira · (11) 98888-7777 · maria.demo@petapp.app ·
  "Rua das Acácias, 123 — São Paulo/SP".
- **Saúde geral:** condições "Raça predisposta a cardiomiopatia dilatada (DCM) —
  acompanhamento cardiológico anual."; alergias "Nenhuma conhecida."; medicação
  "Suplemento de ômega-3 (apoio cardiovascular), 1x ao dia."
- **Peso (kg):** −10m → 34,0 · −7m → 37,5 · −4m → 39,8 · −2m → 41,0 · hoje → 41,5.
- **Vacinas:** "V10 (múltipla)" aplicada −11m, próxima +1m, Clínica VetSaúde ·
  "Antirrábica" aplicada −11m, próxima +1m · "Tosse dos canis (Bordetella)"
  aplicada −6m, próxima +6m.
- **Vermífugo/antipulgas:** "NexGard" (antipulgas/carrapatos), última −25 dias,
  frequência "Mensal", próxima **+5 dias** (dentro da janela de 7 dias → vira o
  alerta "em breve" visível no painel) · "Drontal Plus" (vermífugo), última −2m,
  frequência "A cada 3 meses", próxima +1m.
- **Consultas:** −2m "Check-up anual" (diagnóstico "Saudável", tratamento "Manter
  rotina", obs "Peso ideal para a raça") · −6m "Avaliação cardiológica (rastreio
  DCM)" (diagnóstico "Coração sem alterações", tratamento "Reavaliar em 12 meses").
- **Cirurgias:** "Castração" −24m, Clínica VetSaúde, "Recuperação sem
  intercorrências".
- **Exames:** −6m tipo "Imagem", resultado "Ecocardiograma de rastreio de DCM —
  sem alterações" · −2m tipo "Sangue", resultado "Hemograma completo dentro da
  normalidade".
- **Rotina:** "Ração da manhã" (Alimentação, 07:00) · "Passeio matinal" (Passeio,
  08:00) · "Ração da noite" (Alimentação, 19:00) · "Suplemento ômega-3"
  (Medicamento, 20:00). **rotinaLog de hoje:** "Ração da manhã" e "Passeio
  matinal" concluídos (progresso 2/4).

## 10. Arquitetura e arquivos afetados

- **Reescrever** `css/styles.css` (tokens claro/escuro + componentes + lip 3D +
  `@font-face`).
- **Novos:** `js/theme.js`, `js/mascots.js`, `js/demo-seed.js`, `js/confetti.js`,
  `fonts/` (woff2 + `OFL.txt`).
- **`js/dates.js`:** adicionar `addDays(iso, n)` (com teste).
- **`index.html`:** boot inline de tema no `<head>`, botão de toggle no
  cabeçalho, `@font-face`/preload.
- **`js/app.js`:** chamar `initTheme()` e `await seedDemo()` no boot antes da
  primeira renderização; wiring do toggle.
- **Views:** ajustes pontuais de classe/markup + uso do mascote nos estados
  vazios/cabeçalho; `rotina.js` dispara `celebrate()` ao chegar a 100%;
  `tutor.js` ganha "Começar do zero".
- **`sw.js`:** incluir fontes e novos JS no cache; **subir a versão do cache**
  (`petapp-v1` → `petapp-v2`).

A lógica (db, alerts, dates exceto o novo `addDays`, router, comportamento das
views) permanece intacta.

## 11. Qualidade e testes

- `node --test` continua verde; `addDays` ganha teste novo.
- `demo-seed` é idempotente (semeia uma vez) — verificável: recarregar não
  duplica dados.
- Verificação visual no navegador (claro e escuro) de todas as telas, incluindo
  contraste e a comemoração da rotina.

## 12. Fora de escopo (continua no roadmap)

Gamificação real (sequências/streaks, XP, níveis, conquistas), comunidade,
marketplace, IA, integração com vet, conteúdo personalizado, login/nuvem,
alertas externos. O mascote aqui é **decorativo**, não um sistema de jogo.

## 13. Riscos e mitigações

- **FOUC / flash de tema ou fonte:** boot inline define tema antes da pintura;
  `font-display: swap`; manter um fallback `system-ui` na pilha.
- **Contraste no escuro:** validar tinta/realces (usar `#5DD6AE` para texto-acento
  em superfícies escuras).
- **Licença das fontes:** Fredoka e Nunito são SIL OFL; versionar `fonts/OFL.txt`.
- **Demo sobrescrever dados do usuário:** semear só com banco vazio + flag
  `seeded`; "Começar do zero" mantém a flag.
- **Cache do PWA servindo versão antiga:** subir a versão do cache no `sw.js`.
- **Excesso de movimento:** respeitar `prefers-reduced-motion` no confete/transições.
