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
