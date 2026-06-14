# PetApp — Design do MVP

**Data:** 2026-06-14
**Status:** Aprovado para planejamento
**Origem:** "App Pet v1.pdf" (visão completa do produto)

## 1. Resumo

PetApp é um aplicativo para tutores organizarem a vida e a saúde dos seus pets.
A visão completa (no PDF) é ampla — saúde, alertas, gamificação, comunidade,
marketplace, IA, integração com veterinários e adoção. Este documento descreve
apenas o **MVP**, definido pelo próprio cliente: histórico de saúde, alertas
inteligentes, painel visual ("Dash Pet") e rotina diária.

O MVP será publicado no **GitHub Pages** (hospedagem estática, sem backend).

## 2. Objetivos e critérios de sucesso

1. **Funcional:** o tutor consegue cadastrar um ou mais pets, registrar todo o
   histórico de saúde, acompanhar peso e rotina, e ver alertas do que está
   vencendo — tudo localmente, funcionando offline.
2. **Visual / design (primeira classe):** uma das razões do MVP é **validar o
   design**. A interface precisa ser **bonita e caprichada**, não só funcional.
   Isso é um critério de sucesso explícito, com a mesma prioridade do
   funcional. Inclui: sistema de design coeso, hierarquia visual clara, estados
   vazios bem desenhados, transições suaves e microinterações.
3. **Publicável já:** deve subir no GitHub Pages sem etapa de build.

## 3. Restrições

- **Hospedagem estática (GitHub Pages):** sem servidor, sem banco de dados, sem
  backend. Consequências:
  - Dados ficam **no navegador** do usuário (IndexedDB). Sem login/nuvem.
  - **Sem alertas externos** (WhatsApp/e-mail/SMS) e sem garantia de
    notificação com o app fechado. Os alertas do MVP são in-app + notificação
    do navegador ao abrir o app.
- **Sem etapa de build:** HTML/CSS/JS puro, ES modules. Sem Node, sem bundler.
- **Sem dependências externas em runtime:** tudo self-contained para funcionar
  offline (gráficos em SVG, ícones em sprite SVG, "exportar PDF" via impressão
  do navegador).

## 4. Decisões travadas (do brainstorming)

| Tema | Decisão |
|------|---------|
| Dados / contas | Local no navegador (IndexedDB), sem login, com exportar/importar backup |
| Escopo v1 | Os 4 pilares do MVP, cada um enxuto |
| Stack | HTML/CSS/JS puro, sem build, PWA instalável e offline |
| Visual | Verde-água ("saúde serena"), mobile-first, navegação por abas inferiores |

## 5. Arquitetura

SPA (single-page app) com **roteamento por hash** e **ES modules**, sem
dependências externas em runtime.

- **Rotas:** `#/` (início), `#/saude`, `#/rotina`, `#/alertas`, `#/pet/:id`,
  `#/pet/novo`, `#/tutor`.
- **Gráfico de peso:** SVG desenhado à mão (sem biblioteca).
- **Ícones:** sprite SVG embutido (sem CDN, offline-friendly).
- **Exportar histórico (PDF):** folha de estilo de impressão + `window.print()`;
  o usuário salva como PDF pelo próprio navegador.
- **Persistência:** módulo `db.js` encapsula o IndexedDB com uma API simples
  (`getAll`, `get`, `put`, `delete` por store). Toda a UI passa por essa camada,
  para no futuro ser possível trocar por uma fonte na nuvem com pouco esforço.

## 6. Modelo de dados (IndexedDB)

Object stores, ligados por `petId` quando aplicável:

- **pets** — `id`, nome, sexo (macho/fêmea), nascimento (data) **ou** idade
  aproximada, espécie, raça, porte (pequeno/médio/grande), cor, foto (blob/base64),
  comportamento, preferências, restrições.
- **tutor** — registro único global: nome, telefone, e-mail, endereço (opcional).
- **pesos** — `id`, `petId`, data, valor (kg). Série temporal que alimenta o
  gráfico e o "peso atual".
- **saude** — `petId`, condições pré-existentes, alergias conhecidas, medicação
  contínua (lista de: nome, dosagem, frequência).
- **vacinas** — `id`, `petId`, nome, data de aplicação, próxima dose,
  clínica/veterinário.
- **vermifugos** — `id`, `petId`, produto, data da última aplicação, frequência,
  próxima aplicação.
- **consultas** — `id`, `petId`, data, motivo, diagnóstico, tratamento, observações.
- **cirurgias** — `id`, `petId`, tipo de procedimento, data, veterinário/clínica,
  observações/pós-operatório.
- **exames** — `id`, `petId`, tipo (sangue/imagem/outros), data, resultado
  (texto ou arquivo anexado como blob).
- **rotina** — itens recorrentes (`petId`, tipo: ração/passeio/remédio/outro,
  horário/frequência) e registros diários de conclusão (`petId`, itemId, data).

Campos obrigatórios mínimos: **nome do pet** e **espécie**. O restante é opcional
para reduzir atrito no cadastro.

## 7. Telas e navegação

Navegação principal por **4 abas inferiores** + perfil do pet acessível pelo
cabeçalho (toque no avatar). Seletor de pet no topo permite múltiplos pets.

1. **Início (Dash Pet)** — seletor de pet; pílulas de status (em dia / atenção /
   atrasado); gráfico de peso; resumo da rotina de hoje; próximos alertas.
2. **Saúde** — layout em **acordeão** por seção (saúde geral, vacinas,
   vermífugo/antipulgas, consultas, cirurgias, exames). Cada seção: lista +
   "＋ adicionar" + editar/excluir por item. Botão **Exportar histórico (PDF)**.
3. **Rotina** — checklist do dia ("Hoje o [pet] já recebeu: ✔ ração ✔ passeio
   ○ remédio") + configuração dos itens recorrentes.
4. **Alertas** — lista de tudo que está vencendo/atrasado, calculado a partir das
   "próximas datas" dos registros; agrupado por urgência.
5. **Perfil do pet** — cadastro/edição completo; troca entre pets; cadastro do
   tutor acessível a partir daqui.

### Diretrizes de UX (do PDF)
- Layout em **abas/acordeão** para não sobrecarregar.
- **Ícone por seção** (vacina, consulta, exame...).
- **Cores suaves** associadas à saúde animal (verde-água).
- **Responsivo, mobile-first.**

## 8. Sistema de design (requisito de qualidade visual)

Como o MVP valida o design, definimos um sistema de design explícito:

- **Tokens de cor:** paleta verde-água como primária, neutros suaves, e cores
  semânticas para status (em dia = verde, atenção = âmbar, atrasado = vermelho).
  Definidos como CSS custom properties; suporte a tema claro (dark mode é
  desejável mas opcional no MVP).
- **Tipografia:** uma escala tipográfica consistente (títulos, corpo, legendas).
- **Espaçamento:** escala de espaçamento consistente (ex.: múltiplos de 4px).
- **Componentes:** cards suaves com cantos arredondados, pílulas de status,
  botões, campos de formulário, acordeão, abas inferiores, avatar do pet,
  modais/folhas de ação — todos visualmente coerentes.
- **Estados vazios** desenhados com carinho (ex.: "Nenhum pet ainda — cadastre o
  primeiro" com ilustração/ícone e chamada para ação).
- **Microinterações:** transições suaves de navegação, feedback ao salvar,
  animação leve ao marcar item da rotina.
- **Acessibilidade básica:** contraste adequado, alvos de toque ≥ 44px, foco
  visível.

## 9. Alertas (sem backend)

- **Cálculo por datas:** o app deriva alertas das "próximas datas" (próxima
  vacina, próxima dose de vermífugo, remédio do dia, check-up anual) e dos itens
  da rotina.
- **Exibição:** aba **Alertas** com destaque + badge no ícone de notificação.
- **Notificação do navegador:** com permissão do usuário, dispara notificações
  para itens vencidos/do dia **quando o app é aberto**.
- **Fora do MVP:** canais externos (WhatsApp/e-mail/SMS) e push com app fechado —
  dependem de backend futuro.

## 10. Backup (exportar/importar)

Como os dados ficam só no navegador:
- **Exportar backup:** baixa um arquivo `.json` com todos os stores (incluindo
  fotos/anexos codificados).
- **Importar backup:** restaura o estado em outro navegador/aparelho.

É o mecanismo de portabilidade/segurança do MVP, substituindo a sincronização
em nuvem.

## 11. PWA, offline e deploy

- **PWA:** `manifest.json` + ícones → app instalável na tela inicial.
- **Offline:** `service worker` cacheia os próprios arquivos (app-shell) para
  funcionar sem internet.
- **Deploy:** repositório Git + **GitHub Pages** servindo os arquivos estáticos.
  Sem build — basta publicar a pasta. Atenção a caminhos relativos para funcionar
  sob `usuario.github.io/repo/`.

## 12. Estrutura de arquivos (proposta)

```
index.html
manifest.json
sw.js
icons/                 (ícones do PWA)
css/
  styles.css           (tokens + componentes do sistema de design)
js/
  app.js               (bootstrap + router por hash)
  db.js                (camada IndexedDB)
  alerts.js            (regras de cálculo de alertas/status — testável)
  dates.js             (utilidades de data/idade — testável)
  backup.js            (exportar/importar JSON)
  icons.js             (sprite SVG de ícones)
  components/          (card, pill, accordion, bottom-nav, modal, chart...)
  views/               (inicio, saude, rotina, alertas, pet, tutor)
docs/
  superpowers/specs/   (este documento)
```

## 13. Qualidade e testes

A lógica de regras de negócio fica isolada em módulos puros e testáveis:
- `alerts.js` — dado o estado, calcular o que está em dia / atenção / atrasado e
  os próximos alertas.
- `dates.js` — cálculo de idade, "próxima data", vencimentos.

Esses módulos terão testes durante a implementação. A camada de UI e o IndexedDB
são verificados manualmente rodando o app.

## 14. Fora do escopo do MVP (YAGNI)

Ficam para iterações futuras: gamificação, conteúdo personalizado, comunidade,
marketplace, IA, integração/agendamento com veterinários, adoção, login e
sincronização em nuvem, e alertas por canais externos (WhatsApp/e-mail/SMS).

## 15. Riscos e mitigações

- **Limite de armazenamento do navegador** (fotos/anexos grandes): comprimir
  imagens no upload; avisar o usuário; backup como válvula de escape.
- **Perda de dados** (limpar dados do navegador): deixar o backup bem visível e
  incentivar exportação periódica.
- **Caminhos no GitHub Pages** (subpasta do repo): usar caminhos relativos e
  testar o deploy cedo.
- **Notificações** (suporte/permissão variável entre navegadores): degradar com
  elegância para alertas in-app quando indisponível.
