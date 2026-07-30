const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const catalogPath = path.resolve('cypress', 'fixtures', 'testCatalog.json')

const openReport = (reportPath) => {
  if (process.env.CI) return

  const commands = {
    darwin: ['open', [reportPath]],
    linux: ['xdg-open', [reportPath]],
    win32: ['cmd.exe', ['/c', 'start', '', reportPath]]
  }
  const [command, args] = commands[process.platform] || commands.linux
  const browser = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  })

  browser.on('error', (error) => {
    console.warn(`Não foi possível abrir o relatório automaticamente: ${error.message}`)
  })
  browser.unref()
}

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;')

const readCatalog = () => {
  try {
    return JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
  } catch (error) {
    console.warn(`Catálogo de testes indisponível: ${error.message}`)
    return []
  }
}

const normalizeTests = (results, catalog) => {
  const catalogById = new Map(catalog.map((entry) => [entry.id, entry]))

  return (results.runs || []).flatMap((run) =>
    (run.tests || []).map((test) => {
      const title = test.title?.at(-1) || 'Teste sem título'
      const id = title.match(/^CT-[A-Z]+-[A-Z]+-\d+/)?.[0] || 'SEM-ID'
      const metadata = catalogById.get(id) || {}
      const lastAttempt = test.attempts?.at(-1)

      return {
        id,
        spec: run.spec?.relative || run.spec?.name || 'Spec desconhecida',
        title: title.replace(`${id} - `, ''),
        state: test.state,
        duration: test.wallClockDuration || test.attempts?.reduce(
          (total, attempt) => total + (attempt.wallClockDuration || attempt.duration || 0),
          0
        ) || 0,
        error: lastAttempt?.error?.message || '',
        ...metadata
      }
    })
  )
}

const countBy = (items, field) => Object.entries(items.reduce((counts, item) => {
  const key = item[field] || 'Não classificado'
  counts[key] = (counts[key] || 0) + 1
  return counts
}, {}))

function generateTestReport(results) {
  if (!results || !Array.isArray(results.runs)) return

  const reportDir = path.resolve('reports')
  const catalog = readCatalog()
  const tests = normalizeTests(results, catalog)
  const criticalTests = tests.filter(({ priority }) => priority === 'P0')
  const criticalPassed = criticalTests.filter(({ state }) => state === 'passed').length
  const executedIds = new Set(tests.map(({ id }) => id))
  const catalogNotExecuted = catalog.filter(({ id }) => !executedIds.has(id))
  const summary = {
    total: tests.length,
    passed: tests.filter(({ state }) => state === 'passed').length,
    failed: tests.filter(({ state }) => state === 'failed').length,
    skipped: tests.filter(({ state }) => ['pending', 'skipped'].includes(state)).length,
    criticalTotal: criticalTests.length,
    criticalPassed,
    criticalPassRate: criticalTests.length ? Math.round((criticalPassed / criticalTests.length) * 100) : 0,
    duration: results.totalDuration || 0,
    generatedAt: new Date().toISOString(),
    catalogTotal: catalog.length,
    catalogNotExecuted: catalogNotExecuted.length
  }

  const max = Math.max(summary.total, 1)
  const bars = [
    ['Aprovados', summary.passed, 'passed'],
    ['Falhos', summary.failed, 'failed'],
    ['Ignorados', summary.skipped, 'skipped']
  ].map(([label, value, className]) =>
    `<div class="bar-row"><span>${label}</span><div class="track"><div class="bar ${className}" style="width:${(value / max) * 100}%"></div></div><strong>${value}</strong></div>`
  ).join('')

  const domainCards = countBy(tests, 'domain').map(([name, total]) => {
    const passed = tests.filter((test) => test.domain === name && test.state === 'passed').length
    return `<div class="mini-card"><strong>${escapeHtml(name)}</strong><span>${passed}/${total} aprovados</span></div>`
  }).join('')

  const techniqueRows = countBy(tests, 'technique')
    .map(([technique, total]) => `<tr><td>${escapeHtml(technique)}</td><td>${total}</td></tr>`)
    .join('')

  const rows = tests.map((test) => `<tr>
    <td><strong>${escapeHtml(test.id)}</strong><small>${escapeHtml(test.layer)} · ${escapeHtml(test.domain)}</small></td>
    <td>${escapeHtml(test.title)}<small>Risco: ${escapeHtml(test.risk)}</small>${test.error ? `<details><summary>Erro</summary><pre>${escapeHtml(test.error)}</pre></details>` : ''}</td>
    <td><span class="priority ${escapeHtml(test.priority)}">${escapeHtml(test.priority)}</span></td>
    <td>${escapeHtml(test.technique)}</td>
    <td><span class="status ${escapeHtml(test.state)}">${escapeHtml(test.state)}</span></td>
    <td>${test.duration ? `${test.duration} ms` : 'N/D'}</td>
  </tr>`).join('')

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatório Cypress - ServeRest</title><style>
:root{--ink:#172033;--muted:#647089;--bg:#f4f7fb;--line:#e3e8f1;--green:#16865c;--red:#d14343;--amber:#b36b00;--blue:#3157c8}*{box-sizing:border-box}body{font-family:Inter,Segoe UI,Arial,sans-serif;background:var(--bg);color:var(--ink);margin:0;padding:32px}.container{max-width:1280px;margin:auto}h1{margin-bottom:4px}h2{margin-top:0}.muted,small{color:var(--muted)}.cards{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-top:24px}.card,.panel,.mini-card{background:white;border-radius:12px;padding:20px;box-shadow:0 2px 12px #17203312}.card strong{display:block;font-size:28px;margin-top:8px}.card.critical{border-top:4px solid var(--blue)}.panel{margin-top:20px}.grid{display:grid;grid-template-columns:2fr 1fr;gap:20px}.domain-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.mini-card{border:1px solid var(--line);box-shadow:none}.mini-card strong,.mini-card span,td small{display:block}.bar-row{display:grid;grid-template-columns:90px 1fr 35px;gap:12px;align-items:center;margin:14px 0}.track{height:22px;background:#edf0f5;border-radius:6px;overflow:hidden}.bar{height:100%}.passed{background:var(--green)}.failed{background:var(--red)}.skipped{background:#8b95a7}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--line);vertical-align:top}.status,.priority{display:inline-block;color:white;padding:4px 9px;border-radius:12px;font-size:12px;font-weight:700}.status.pending,.status.skipped{background:#8b95a7}.priority.P0{background:var(--red)}.priority.P1{background:var(--amber)}.priority.P2{background:var(--blue)}details{margin-top:8px}pre{white-space:pre-wrap;color:var(--red)}@media(max-width:900px){.cards{grid-template-columns:repeat(2,1fr)}.grid,.domain-grid{grid-template-columns:1fr}body{padding:16px}.table-wrap{overflow:auto}}</style></head><body><main class="container">
  <h1>Relatório de Qualidade ServeRest</h1>
  <p class="muted">Execução gerada em ${escapeHtml(summary.generatedAt)} · Frontend e API · Referência CTFL</p>
  <section class="cards">
    <div class="card">Executados<strong>${summary.total}</strong></div>
    <div class="card">Aprovados<strong>${summary.passed}</strong></div>
    <div class="card">Falhos<strong>${summary.failed}</strong></div>
    <div class="card critical">Críticos P0<strong>${summary.criticalPassed}/${summary.criticalTotal}</strong></div>
    <div class="card critical">Aprovação P0<strong>${summary.criticalPassRate}%</strong></div>
    <div class="card">Duração<strong>${(summary.duration / 1000).toFixed(1)} s</strong></div>
  </section>
  <section class="panel"><h2>Cobertura por domínio</h2><div class="domain-grid">${domainCards}</div></section>
  <section class="grid"><div class="panel"><h2>Resultado da execução</h2>${bars}</div><div class="panel"><h2>Técnicas CTFL</h2><table><tbody>${techniqueRows}</tbody></table></div></section>
  <section class="panel"><h2>Rastreabilidade e validações</h2><p class="muted">${summary.catalogTotal} casos catalogados; ${summary.catalogNotExecuted} fora do escopo desta execução.</p><div class="table-wrap"><table><thead><tr><th>ID / camada</th><th>Cenário e risco</th><th>Prioridade</th><th>Técnica</th><th>Status</th><th>Duração</th></tr></thead><tbody>${rows}</tbody></table></div></section>
</main></body></html>`

  fs.mkdirSync(reportDir, { recursive: true })
  const reportPath = path.join(reportDir, 'test-report.html')
  fs.writeFileSync(
    path.join(reportDir, 'test-results.json'),
    JSON.stringify({ summary, tests, catalogNotExecuted }, null, 2)
  )
  fs.writeFileSync(reportPath, html)
  console.log(`\nRelatório gerado em ${reportPath}`)
  openReport(reportPath)
}

module.exports = { generateTestReport }
