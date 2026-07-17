const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

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
    console.warn(`Unable to open the test report automatically: ${error.message}`)
  })
  browser.unref()
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;')

const normalizeTests = (results) => (results.runs || []).flatMap((run) =>
  (run.tests || []).map((test) => ({
    spec: run.spec?.relative || run.spec?.name || 'Unknown spec',
    title: test.title?.at(-1) || 'Untitled test',
    state: test.state,
    duration: test.wallClockDuration || test.attempts?.reduce(
      (total, attempt) => total + (attempt.wallClockDuration || attempt.duration || 0),
      0
    ) || 0
  }))
)

function generateTestReport(results) {
  if (!results || !Array.isArray(results.runs)) return
  const reportDir = path.resolve('reports')
  const tests = normalizeTests(results)
  const summary = {
    total: tests.length,
    passed: tests.filter(({ state }) => state === 'passed').length,
    failed: tests.filter(({ state }) => state === 'failed').length,
    skipped: tests.filter(({ state }) => ['pending', 'skipped'].includes(state)).length,
    duration: results.totalDuration || 0,
    generatedAt: new Date().toISOString()
  }
  const max = Math.max(summary.total, 1)
  const bars = [['Passed', summary.passed, 'passed'], ['Failed', summary.failed, 'failed'], ['Skipped', summary.skipped, 'skipped']]
    .map(([label, value, className]) => `<div class="bar-row"><span>${label}</span><div class="track"><div class="bar ${className}" style="width:${(value / max) * 100}%"></div></div><strong>${value}</strong></div>`).join('')
  const rows = tests.map((test) => `<tr><td>${escapeHtml(test.spec)}</td><td>${escapeHtml(test.title)}</td><td><span class="status ${escapeHtml(test.state)}">${escapeHtml(test.state)}</span></td><td>${test.duration ? `${test.duration} ms` : 'Not available'}</td></tr>`).join('')
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cypress Test Report - ServeRest</title><style>
body{font-family:Arial,sans-serif;background:#f5f7fb;color:#172033;margin:0;padding:32px}.container{max-width:1100px;margin:auto}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.card,.panel{background:white;border-radius:10px;padding:20px;box-shadow:0 2px 10px #17203314}.card strong{display:block;font-size:28px;margin-top:8px}.panel{margin-top:20px}.bar-row{display:grid;grid-template-columns:90px 1fr 35px;gap:12px;align-items:center;margin:14px 0}.track{height:22px;background:#edf0f5;border-radius:6px;overflow:hidden}.bar{height:100%}.passed{background:#16865c}.failed{background:#d14343}.skipped{background:#8b95a7}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid #e7eaf0}.status{color:white;padding:4px 8px;border-radius:12px;font-size:12px}.status.pending{background:#8b95a7}@media(max-width:700px){.cards{grid-template-columns:1fr 1fr}body{padding:16px}}</style></head><body><main class="container"><h1>Cypress Test Execution Report</h1><p>Generated at ${escapeHtml(summary.generatedAt)}</p><section class="cards"><div class="card">Total<strong>${summary.total}</strong></div><div class="card">Passed<strong>${summary.passed}</strong></div><div class="card">Failed<strong>${summary.failed}</strong></div><div class="card">Duration<strong>${(summary.duration / 1000).toFixed(1)} s</strong></div></section><section class="panel"><h2>Results chart</h2>${bars}</section><section class="panel"><h2>Details</h2><table><thead><tr><th>Spec</th><th>Test case</th><th>Status</th><th>Duration</th></tr></thead><tbody>${rows}</tbody></table></section></main></body></html>`
  fs.mkdirSync(reportDir, { recursive: true })
  const reportPath = path.join(reportDir, 'test-report.html')
  fs.writeFileSync(path.join(reportDir, 'test-results.json'), JSON.stringify({ summary, tests }, null, 2))
  fs.writeFileSync(reportPath, html)
  console.log(`\nReport generated at ${reportPath}`)
  openReport(reportPath)
}

module.exports = { generateTestReport }
