const fs = require('fs')
const path = require('path')

const resultsPath = path.resolve('reports', 'test-results.json')
const summaryPath = process.env.GITHUB_STEP_SUMMARY

if (!fs.existsSync(resultsPath)) {
  console.error(`Test results not found at ${resultsPath}`)
  process.exit(1)
}

const { summary, tests = [] } = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
const failedTests = tests.filter(({ state }) => state === 'failed')
const layer = [...new Set(tests.map(({ layer }) => layer).filter(Boolean))].join(' + ') || 'No tests executed'
const status = summary.failed === 0 ? '✅ Passed' : '❌ Failed'

const lines = [
  `## Cypress quality report — ${layer}`,
  '',
  '| Status | Passed | Failed | Skipped | Flaky | P0 pass rate | Duration |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  `| ${status} | ${summary.passed}/${summary.total} | ${summary.failed} | ${summary.skipped} | ${summary.flaky || 0} | ${summary.criticalPassRate}% | ${(summary.duration / 1000).toFixed(1)} s |`
]

if (failedTests.length) {
  lines.push('', '### Failures', '')
  failedTests.forEach(({ id, title, spec }) => lines.push(`- **${id}** — ${title} (\`${spec}\`)`))
}

const output = `${lines.join('\n')}\n`

if (summaryPath) {
  fs.appendFileSync(summaryPath, output)
  console.log(`GitHub step summary written to ${summaryPath}`)
} else {
  console.log(output)
}
