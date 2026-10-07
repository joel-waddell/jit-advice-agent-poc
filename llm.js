(function (root) {
  "use strict";
  const protocols = ["openai", "anthropic", "gemini", "ollama"];

  function validate(config) {
    if (!protocols.includes(config.protocol)) throw new Error("Select a supported API protocol.");
    const url = new URL(config.endpoint);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Use an HTTP(S) endpoint without embedded credentials.");
    if (!config.model?.trim()) throw new Error("Enter a model ID.");
    for (const name of ["headers", "parameters"]) {
      const value = config[name] || {};
      if (typeof value !== "object" || Array.isArray(value)) throw new Error(`${name} must be a JSON object.`);
    }
    if (Object.values(config.headers || {}).some(value => typeof value !== "string")) throw new Error("Header values must be strings.");
    return config;
  }

  function buildRequest(config, messages, system) {
    validate(config);
    const headers = { "Content-Type": "application/json" };
    const key = config.apiKey?.trim();
    let body;
    if (config.protocol === "anthropic") {
      headers["anthropic-version"] = "2023-06-01";
      headers["anthropic-dangerous-direct-browser-access"] = "true";
      if (key) headers["x-api-key"] = key;
      body = { max_tokens: 1024, ...config.parameters, model: config.model, system, messages, stream: false };
    } else if (config.protocol === "gemini") {
      if (key) headers["x-goog-api-key"] = key;
      body = { ...config.parameters, systemInstruction: { parts: [{ text: system }] }, contents: messages.map(message => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] })) };
    } else {
      if (key) headers.Authorization = `Bearer ${key}`;
      body = { ...config.parameters, model: config.model, messages: [{ role: "system", content: system }, ...messages], stream: false };
    }
    const endpoint = config.endpoint.replaceAll("{model}", encodeURIComponent(config.model));
    return { endpoint, options: { method: "POST", headers: { ...headers, ...config.headers }, body: JSON.stringify(body), credentials: "omit", redirect: "error" } };
  }

  function readResponse(protocol, data) {
    let text;
    if (protocol === "anthropic") text = data.content?.filter(part => part.type === "text").map(part => part.text).join("\n");
    else if (protocol === "gemini") text = data.candidates?.[0]?.content?.parts?.filter(part => typeof part.text === "string").map(part => part.text).join("\n");
    else if (protocol === "ollama") text = data.message?.content;
    else text = data.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) throw new Error("The provider returned no text. Check the model and API protocol.");
    return text;
  }

  async function complete(config, messages, system, signal, fetcher = fetch) {
    const request = buildRequest(config, messages, system);
    let response;
    try {
      response = await fetcher(request.endpoint, { ...request.options, signal });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new Error("Cannot reach the provider. Check the endpoint, network, and browser CORS permissions; a same-origin gateway may be required.");
    }
    if (!response.ok) throw new Error(`Provider request failed (HTTP ${response.status}). Check credentials, model access, endpoint, and quota.`);
    let data;
    try { data = await response.json(); } catch { throw new Error("The endpoint did not return JSON. Check the API endpoint."); }
    return readResponse(config.protocol, data);
  }

  const api = { validate, buildRequest, readResponse, complete };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NorthstarLLM = api;
})(globalThis);