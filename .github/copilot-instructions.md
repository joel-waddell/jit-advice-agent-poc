# Project Guidance

## Purpose and requirements

- This is a proof of concept for comparing four ways to integrate an expert LLM agent into a simulated Enablon host: Tier 1 Bolt-On, Tier 2 Sidecar, Tier 3 Supported Plugin, and Tier 4 Native Symbiote.
- Treat `requirements.md` as the product and interaction source of truth. Preserve the distinct integration limits and visual footprints of all four tiers.
- The host application is mocked or stubbed. Agent prompting, context awareness, and feedback for agent actions are the functional focus.
- Keep the global POC status notice and integration-tier switcher visible and usable across the experience; use the exact status copy specified in `requirements.md`.
- `design.html` is the current standalone HTML artifact. Check for an established source/build workflow before changing its structure or introducing a framework.

## Implementation practices

- Keep changes focused and follow the existing project structure and conventions. Avoid adding dependencies or build tooling without a demonstrated need.
- Make tier-specific behavior explicit: DOM scraping and manual transfer in Tier 1, URL context without form control in Tier 2, supported form APIs in Tier 3, and event-driven/native actions in Tier 4.
- Keep the agent interface visually distinct from the host in lower tiers; use host-native styling and inline affordances in the higher tiers, as described in `requirements.md`.
- No build, test, or lint command is currently defined. When adding one, document it and run the narrowest relevant check for each change.