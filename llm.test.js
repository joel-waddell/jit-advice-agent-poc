const { test } = require("node:test");
const assert = require("node:assert/strict");
const llm = require("./llm.js");
const config = { protocol: "openai", endpoint: "https://example.com/chat", model: "custom-model", apiKey: "test-key", headers: {}, parameters: {} };
const messages = [{ role: "user", content: "Review this incident" }, { role: "assistant", content: "Which incident?" }];

test("OpenAI-compatible requests support arbitrary models, endpoints, headers and parameters", () => {
  const request = llm.buildRequest({ ...config, headers: { "api-key": "azure-key" }, parameters: { temperature: 0.3, stream: true, model: "wrong", messages: [] } }, messages, "Allowed context");
  const body = JSON.parse(request.options.body);
  assert.equal(request.endpoint, config.endpoint);
  assert.equal(body.model, config.model);
  assert.equal(body.temperature, 0.3);
  assert.equal(body.stream, false);
  assert.deepEqual(body.messages, [{ role: "system", content: "Allowed context" }, ...messages]);
  assert.equal(request.options.headers.Authorization, "Bearer test-key");
  assert.equal(request.options.headers["api-key"], "azure-key");
  assert.equal(request.options.credentials, "omit");
  assert.equal(request.options.redirect, "error");
});

test("Anthropic uses native authentication, system and text blocks", () => {
  const request = llm.buildRequest({ ...config, protocol: "anthropic" }, messages, "Context");
  assert.equal(request.options.headers["x-api-key"], "test-key");
  assert.equal(JSON.parse(request.options.body).system, "Context");
  assert.equal(JSON.parse(request.options.body).max_tokens, 1024);
  assert.equal(llm.readResponse("anthropic", { content: [{ type: "text", text: "Advice" }] }), "Advice");
});

test("Gemini substitutes model IDs and maps roles to native contents", () => {
  const request = llm.buildRequest({ ...config, protocol: "gemini", endpoint: "https://example.com/models/{model}:generateContent" }, messages, "Context");
  assert.equal(request.endpoint, "https://example.com/models/custom-model:generateContent");
  assert.equal(request.options.headers["x-goog-api-key"], "test-key");
  assert.equal(JSON.parse(request.options.body).contents[1].role, "model");
  assert.equal(llm.readResponse("gemini", { candidates: [{ content: { parts: [{ text: "Advice" }] } }] }), "Advice");
});

test("Ollama works without a key and reads native chat responses", async () => {
  const result = await llm.complete({ ...config, protocol: "ollama", apiKey: "" }, messages, "Context", undefined, async (url, options) => {
    assert.equal(options.headers.Authorization, undefined);
    return { ok: true, json: async () => ({ message: { content: "Local advice" } }) };
  });
  assert.equal(result, "Local advice");
});

test("Provider errors, invalid responses, and CORS failures remain explicit", async () => {
  await assert.rejects(llm.complete(config, messages, "", undefined, async () => ({ ok: false, status: 401 })), /HTTP 401/);
  await assert.rejects(llm.complete(config, messages, "", undefined, async () => { throw new TypeError("Failed to fetch"); }), /CORS/);
  await assert.rejects(llm.complete(config, messages, "", undefined, async () => ({ ok: true, json: async () => ({}) })), /no text/);
  assert.throws(() => llm.validate({ ...config, endpoint: "file:///etc/passwd" }), /HTTP/);
  assert.throws(() => llm.validate({ ...config, model: "" }), /model ID/);
  assert.throws(() => llm.validate({ ...config, headers: [] }), /JSON object/);
});