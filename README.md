# In-Tool Expert Agent POC

A standalone demo of four integration patterns for an incident-response advisor embedded in a simulated EHS application.

## Run

Open [index.html](index.html) in a modern browser. No install or build step is required. The page stores the selected tier, saved form values, and non-secret model settings in browser local storage.

## Deploy to GitHub Pages

The `Deploy to GitHub Pages` workflow enables GitHub Pages with GitHub Actions and publishes `index.html` and `llm.js` whenever changes are pushed to `main`, or when manually started from the Actions tab. After the first successful workflow run, the site will be available at `https://joel-waddell.github.io/jit-advice-agent-poc/`. If repository or organization policies prevent automatic enablement, an administrator must enable Pages in the repository settings.

## Integration tiers

- **Tier 1 · Bolt-On:** The external advisor sees no form data until you select **Read screen**. Recommendations must be transferred to the form manually.
- **Tier 2 · Sidecar:** A docked advisor reads the `pm` and `rid` URL parameters, but has no access to form values or controls.
- **Tier 3 · Supported Plugin:** Inline field actions use simulated form APIs to read context and apply drafts.
- **Tier 4 · Native Symbiote:** A command palette, live context, and proactive incident checks simulate native SDK behavior. Open it with `Cmd/Ctrl+K`.

The host application and integration APIs are simulated. Agent actions are suggestions, and changes should be reviewed before saving.

## Configure an LLM

Select **Model settings**, choose **LLM provider**, then select a preset or **Custom / gateway**. Enter the full API endpoint and model ID; an API key is optional for local models or authenticated gateways. The advanced fields accept JSON objects for custom headers and provider-specific request parameters. The connection test sends a generic prompt without incident data.

The adapter supports four request protocols:

- **OpenAI-compatible chat completions**, for example OpenAI, OpenRouter, and compatible gateways.
- **Anthropic Messages**.
- **Gemini `generateContent`**, with `{model}` substitution in the endpoint.
- **Ollama Chat**.

Custom endpoints and model IDs are supported within these protocols; this does not provide native adapters for every provider protocol. Providers with another protocol need a compatible gateway or an adapter. Provider API formats and model availability can change, so check the provider's current endpoint and model documentation.

The selected mode, preset, protocol, endpoint, and model ID are saved in browser local storage. API keys, custom headers, and request parameters remain in memory only and must be entered again after a page reload. Do not use this client-side demo to protect production credentials: requests are made directly from the browser to the configured endpoint.

Remote requests send the prompt, bounded conversation history, and only the context permitted by the active tier. Tier 1 sends fields only after **Read screen**; Tier 2 sends URL context only; Tier 3 reads fields through the simulated supported API; Tier 4 sends live form context. Use a trusted endpoint and avoid entering sensitive incident data unless you are authorized to send it there.

Direct browser requests require the endpoint to allow cross-origin requests (CORS). If the provider does not allow browser access, use a trusted same-origin gateway. A local Ollama instance must be running and reachable from the browser, and its endpoint must allow the page's origin; `localhost` refers to the user's own machine.

## Tests

Run the adapter unit tests and JavaScript syntax check with Node.js:

```sh
node --test llm.test.js
node --check llm.js
```

These tests mock network responses; they do not verify a live provider connection or the UI in a browser.
