const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");

test("Pages configuration does not attempt site enablement with GITHUB_TOKEN", () => {
  const workflow = readFileSync(path.join(__dirname, ".github/workflows/pages.yml"), "utf8");
  const configureStep = workflow.split(/^      - /m).find(step => /uses: actions\/configure-pages@/.test(step));
  assert.ok(configureStep, "The workflow must configure the existing Pages site");
  assert.doesNotMatch(configureStep, /enablement:\s*['"]?true['"]?/, "Pages must be enabled by an administrator, not GITHUB_TOKEN");
  assert.match(workflow, /pages: write/);
  assert.match(workflow, /id-token: write/);
});

test("Pages setup uses an authorized token and only enables the site when it is provided", () => {
  const workflow = readFileSync(path.join(__dirname, ".github/workflows/pages.yml"), "utf8");
  const steps = workflow.split(/^      - /m);
  const configureStep = steps.find(step => /uses: actions\/configure-pages@/.test(step));
  assert.ok(configureStep, "The workflow must configure Pages");
  assert.match(configureStep, /token:\s*\$\{\{\s*secrets\.PAGES_SETUP_TOKEN\s*\|\|\s*github\.token\s*\}\}/);
  assert.match(configureStep, /enablement:\s*\$\{\{\s*secrets\.PAGES_SETUP_TOKEN\s*!=\s*''\s*\}\}/);
  for (const step of steps.filter(step => step !== configureStep)) {
    assert.doesNotMatch(step, /secrets\.PAGES_SETUP_TOKEN/, "The setup token must be limited to Pages configuration");
  }
});
