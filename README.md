# Demos de GitHub Agentic Workflows (`gh-aw`)

Repositorio de demostración de **[GitHub Agentic Workflows](https://github.com/github/gh-aw)** (`gh-aw`): una extensión de GitHub CLI que permite definir automatizaciones impulsadas por IA para tu repositorio **en Markdown + YAML**, que se compilan a workflows normales de GitHub Actions.

> 📝 **Nota de idioma**: la documentación, los comentarios de los prompts y las salidas generadas por los agentes (issues, comentarios) están en **español**. Los artefactos técnicos (nombres de archivo, claves YAML, etiquetas de GitHub, nombres de workflows) se mantienen en **inglés**, tal como lo requiere la herramienta y las convenciones de GitHub Actions.

## ¿Qué es `gh-aw`?

`gh-aw` = **Actions + Agente + Seguridad**. Cada workflow agéntico tiene dos partes:

1. **Frontmatter YAML** — configura disparadores (`on:`), permisos, herramientas y el motor de IA (GitHub Copilot, Claude Code, OpenAI Codex, Gemini, Pi).
2. **Cuerpo en Markdown** — le indica al agente, en lenguaje natural, qué debe hacer.

El comando `gh aw compile` valida ese `.md` y genera un archivo `.lock.yml` (el workflow real de GitHub Actions) que corre en Actions.

**Modelo de seguridad**: el job del agente corre en modo **solo lectura y aislado** por defecto. Cualquier escritura real (crear un issue, comentar, etiquetar) se declara en `safe-outputs:` y se ejecuta en un job separado, con permisos mínimos y validación — el agente nunca tiene permisos de escritura directos sobre tu repositorio.

## Las 3 demos incluidas

| # | Demo | Se dispara con | Qué hace |
|---|------|-----------------|----------|
| 1 | **Reporte Diario del Repositorio** (`demo-1-reporte-diario.md`) | Cron diario o manual (`workflow_dispatch`) | Analiza la actividad reciente (issues, PRs, commits) y publica un issue con un resumen de estado, en español. |
| 2 | **Bot de Triage de Issues** (`demo-2-triage-issues.md`) | Se abre/reabre un issue | Evalúa si el issue tiene información suficiente, sugiere etiquetas existentes, busca duplicados y publica un comentario con el veredicto. |
| 3 | **Investigador de Fallos de CI** (`demo-3-ci-doctor.md`) | El workflow `CI` termina en fallo | Investiga los logs de la ejecución fallida, identifica la causa raíz probable y abre un issue con el diagnóstico y pasos de remediación. |

Cada demo es **solo lectura por diseño**: únicamente pueden crear/comentar issues o añadir etiquetas ya existentes (ver `safe-outputs:` en cada archivo `.md`), nunca modifican código ni configuración directamente.

Por defecto, las 3 demos usan **GitHub Copilot** como motor de IA (es el motor por defecto de `gh-aw`, no requiere declarar `engine:`).

## Estructura del repositorio

```
.
├── .github/workflows/
│   ├── demo-1-reporte-diario.md   # Demo 1 (fuente agéntica)
│   ├── demo-2-triage-issues.md    # Demo 2 (fuente agéntica)
│   ├── demo-3-ci-doctor.md        # Demo 3 (fuente agéntica)
│   └── ci.yml                     # Workflow de CI real (corre las pruebas de loans-api)
├── apps/loans-api/                # App sintética: API REST de préstamos bancarios (Node + Express + Jest)
├── scripts/
│   ├── instalar-y-compilar.sh     # Instala gh-aw y compila los .md a .lock.yml
│   └── probar-demo.sh             # Dispara cada demo manualmente para probarla
└── README.md
```

## App sintética: `loans-api`

Para darle a las 3 demos actividad realista sobre la que trabajar, el repositorio
incluye una pequeña **API REST de préstamos bancarios** (datos y código
100% sintéticos, sin conexión a ningún sistema real): creación de solicitudes,
flujo de aprobación/rechazo y cálculo de tabla de amortización.

Ver el detalle completo en [`apps/loans-api/README.md`](apps/loans-api/README.md).

### Historial de ramas (siguiendo GitFlow)

El repositorio simula un ciclo de desarrollo completo con las convenciones de
**GitFlow**:

| Rama | Tipo | Destino | Estado |
|---|---|---|---|
| `develop` | integración | — | activa |
| `feature/loan-application` | feature | `develop` | mergeada (PR #6) |
| `feature/loan-approval-workflow` | feature | `develop` | mergeada (PR #7) |
| `feature/interest-calculator` | feature | `develop` | **PR abierto** (#8, en revisión) |
| `release/1.0.0` | release | `main` | mergeada y tag `v1.0.0` (PR #9) |
| `hotfix/1.0.1-validacion-monto` | hotfix | `main` | mergeada y tag `v1.0.1` (PR #10), back-merge a `develop` |
| `chore/ci-loans-api-tests` | chore | `main` | mergeada (PR #11) |

Cada release y hotfix fue etiquetado (`v1.0.0`, `v1.0.1`) y back-mergeado a
`develop`, siguiendo el flujo estándar de GitFlow.

### Issues sintéticos

También se crearon issues de ejemplo (bugs, features, preguntas, un caso de
spam y un posible duplicado) para que la **Demo 2 (Bot de Triage)** tenga
contenido real sobre el cual clasificar y responder.

Los archivos `.lock.yml` (generados por `gh aw compile`) **no están commiteados** porque se regeneran localmente y pueden cambiar de versión en versión de `gh-aw`. Los generas tú en el primer paso de instalación (abajo).

## Requisitos

- **GitHub CLI** (`gh`) v2.0.0+, autenticado (`gh auth status`).
- Acceso de escritura al repositorio donde lo instales.
- **GitHub Actions habilitado** en el repositorio (Settings → Actions).
- Una cuenta de IA: lo más simple es **GitHub Copilot** (si ya tienes una suscripción activa, no necesitas configurar nada adicional aparte del token/billing descrito abajo).

## Cómo probarlo y ejecutarlo (clonando el repo)

### 1. Clona el repositorio

```bash
git clone https://github.com/armandoblanco/gh-aw-agentic-demos.git
cd gh-aw-agentic-demos
```

### 2. Instala la extensión `gh-aw` y compila las demos

```bash
./scripts/instalar-y-compilar.sh
```

Esto instala `gh extension install github/gh-aw` y corre `gh aw compile`, generando un `.lock.yml` por cada demo dentro de `.github/workflows/`.

> Si `gh extension install` falla por políticas de SSO/SAML de tu organización, usa el instalador standalone indicado en la salida del script (`curl -sL https://raw.githubusercontent.com/github/gh-aw/main/install-gh-aw.sh | bash`).

### 3. Configura la autenticación del motor de IA

Con **GitHub Copilot** (recomendado, motor por defecto), tienes dos rutas:

- **Facturación de organización**: si tu organización tiene Copilot con facturación centralizada, no necesitas ningún secreto adicional (se usa el token de Actions con `copilot-requests: write`).
- **Token personal**: crea un *fine-grained PAT* con permiso "Copilot Requests: Read" en https://github.com/settings/personal-access-tokens/new y guárdalo como secreto:

  ```bash
  gh secret set COPILOT_GITHUB_TOKEN < /ruta/a/tu/token.txt
  ```

También puedes usar Claude, Codex o Gemini declarando `engine:` en el frontmatter de cada `.md` y configurando el secreto correspondiente (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.).

### 4. Sube los workflows compilados y haz push

```bash
git add .github/workflows/*.lock.yml
git commit -m "Compilar workflows de demo gh-aw"
git push
```

### 5. Prueba cada demo

Con los cambios ya en GitHub, dispara cada demo manualmente:

```bash
./scripts/probar-demo.sh 1   # Reporte Diario: lo ejecuta vía workflow_dispatch
./scripts/probar-demo.sh 2   # Triage de Issues: crea un issue de prueba con gh issue create
./scripts/probar-demo.sh 3   # CI Doctor: fuerza un fallo en el workflow CI
```

O de forma equivalente, sin el script:

```bash
# Demo 1 — manual
gh workflow run "demo-1-reporte-diario.lock.yml"

# Demo 2 — crea cualquier issue nuevo, se dispara automáticamente
gh issue create --title "Bug de prueba" --body "Descripción del problema..."

# Demo 3 — fuerza un fallo de CI para disparar la investigación
gh workflow run "ci.yml" -f force_fail=true
```

Sigue el progreso desde la terminal con `gh run watch` o `gh run list`, o desde la pestaña **Actions** del repositorio en GitHub.com. Cada demo exitosa termina creando (o comentando) un **Issue** en español — revísalo en la pestaña **Issues**.

### 6. (Opcional) Recompilar tras editar un `.md`

Si modificas el frontmatter YAML de alguna demo, vuelve a compilar:

```bash
gh aw compile
git add .github/workflows/*.lock.yml
git commit -m "Recompilar workflows tras cambios"
git push
```

Los cambios que solo tocan el cuerpo Markdown (las instrucciones del agente) **no requieren recompilar** — se leen en tiempo de ejecución.

## Solución de problemas

- `gh aw status` — lista el estado de todos los workflows agénticos del repo.
- `gh run watch` / `gh run list` — sigue las ejecuciones de Actions.
- Si una demo no se dispara, confirma que **Actions esté habilitado** y que el archivo `.lock.yml` correspondiente exista y esté commiteado.
- Revisa los logs del job en la pestaña **Actions** para ver el detalle de la ejecución del agente.

## Referencias

- Repositorio oficial: https://github.com/github/gh-aw
- Documentación: https://github.github.com/gh-aw/
- Ejemplos oficiales adicionales: https://github.com/githubnext/agentics

## Licencia

MIT — ver [LICENSE](LICENSE).
