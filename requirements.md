---

# UI/UX Design Requirements: In-Tool Expert LLM Agent POC

## 1. Executive Summary & Purpose

This application serves as an interactive Proof of Concept (POC) demonstrating varying architectural and UX approaches for integrating an expert LLM agent into a third-party web application (simulating an Enablon environment).

The primary goal is to allow stakeholders to physically experience the UX friction and seamlessness associated with different integration depths, ranging from superficial DOM overlays to natively embedded SDKs. The designer must visually differentiate the host application from the LLM agent, particularly in the lower tiers, to highlight the integration gaps.

## 2. Global POC Interface Requirements

Because this is a meta-application (a POC demonstrating tools inside a simulated host tool), the overarching UI requires specific global controls that sit entirely outside the simulated experience.

* **Global "POC Status" Callout (Required):**
* **Location:** Persistent banner at the top of the screen or a fixed floating badge in the bottom-left corner.
* **Copy:** "Demo Environment: The host application interface is mocked/stubbed. The LLM Agent implementation and its responses are fully functional."
* **Visuals:** Use a high-contrast color (e.g., warning yellow, deep purple, or magenta) to ensure it is never confused with the simulated host app's UI.


* **Integration Switcher:**
* **Location:** A persistent, easily accessible control (floating toggle or global top-bar dropdown).
* **Function:** Allows the user to seamlessly switch the current view between the four Integration Tiers. Changing this toggle should instantly re-render the agent's UI footprint and capabilities.



## 3. The Integration Spectrum (Core Demos)

The designer must create distinct UI footprints for the agent across four tiers. The design should visually communicate the technical constraints of each tier.

### Tier 1: The "Bolt-On" (Unsupported Superficial Overlay)

* **Concept:** A simulated browser extension or proxy-injected JavaScript operating entirely outside the host app's lifecycle.
* **Data Access constraint:** Strict DOM scraping.
* **UI/UX Requirements:**
* **Visuals:** A Floating Action Button (FAB) that opens a persistent Sidebar or Chat Bubble.
* **Styling:** Deliberately uses its own styling system that clashes slightly with the host app to demonstrate its external nature.
* **Interaction:** Must include a prominent "Scrape Screen" or "Read Page" button. The user must manually copy/paste the agent's output back into the host app's form fields.



### Tier 2: The "Sidecar" (Mild Integration)

* **Concept:** The host app provides a dedicated window/container, but the agent runs externally via an iFrame.
* **Data Access constraint:** Reads URL parameters (e.g., parsing `pm=1` for Page Mode or `rid` for Record ID) for basic context, but lacks direct form control.


* **UI/UX Requirements:**
* **Visuals:** Rendered in a fixed, dedicated panel (e.g., a docked right-hand drawer).
* **Styling:** Matches the host app's basic fonts and colors, but feels confined to its "box."
* **Interaction:** Context updates automatically as the user navigates the host app. However, execution remains disconnected; the agent cannot inject buttons or data directly into the host app's main content area.



### Tier 3: The "Supported Plugin" (API-Backed Injection)

* **Concept:** An authorized plugin utilizing official extension points and JavaScript kits.
* **Data Access constraint:** Reads form context natively using functions like `thd.table().field().value()` and writes data back into the form.


* **UI/UX Requirements:**
* **Visuals:** Agent UI components are injected directly into the host app's interface. Design small, inline `<GhostButton/>` or `<ActionTooltip/>` elements adjacent to standard form inputs.
* **Styling:** Inherits the host app's CSS variables for a near-native look.
* **Interaction:** Include native action triggers (e.g., an "Ask AI" button placed via the simulated `AddButton()` function). The agent can natively populate fields or surface custom validation warnings directly on the form fields.





### Tier 4: The "Native Symbiote" (Deep Integration)

* **Concept:** Natively embedded solution utilizing the vendor's deep SDK, operating as an ambient, event-driven assistant.
* **Data Access constraint:** Direct access to application state, backend database actions (via simulated JSON Services and `EAPI.sendUpdate`), and native event listeners (`EJ.EventManager`).


* **UI/UX Requirements:**
* **Visuals:** The agent is not restricted to a chat box. Design an ambient Command Palette (Cmd+K interface), inline ghost-text autocomplete, and contextual hover-cards. Utilize the host's native modal styling (e.g., simulating `ui.widget.popup.open()` or `ajpp` dialog objects).


* **Styling:** Pixel-perfect native UI.
* **Interaction:** Zero friction. The agent proactively suggests actions based on user behavior without requiring explicit prompting.



## 4. UI Component Architecture (React Strategy)

The designer should structure the Figma/design files to match the planned React component hierarchy:

1. **`POCWrapper` (The Meta Layer):** Contains the global banner and Tier Switcher.
2. **`MockEnablonHost`:** A simplified representation of a standard record/form page. Requires standard inputs for Tier 1, and visually identical but "smart" inputs for Tiers 3 & 4.
3. **`AgentController` (The UI Shapeshifter):** Designs are needed for the following states based on the active Tier:
* *Tier 1 State:* Standalone `<FloatingActionPanel/>`
* *Tier 2 State:* Docked `<IframeDrawer/>`
* *Tier 3 State:* Inline `<ActionTooltip/>` and `<GhostButton/>` components injected into the `MockEnablonHost`.
* *Tier 4 State:* `<CommandPalette/>` and ambient contextual overlays.



## 5. Stubbed vs. Functional Mapping

This table guides the designer on what needs deep interaction design versus what is simply aesthetic scaffolding.

| Feature | Implementation Status | Note for Design |
| --- | --- | --- |
| **Host App UI** (Dashboards, forms) | **Mocked** | Design static views. No need for complex data-table interaction flows. |
| **Host App Navigation** | **Stubbed** | Clicks may change views, but routing is superficial. Design basic active/inactive states. |
| **Agent Chat/Prompting** | **Fully Functional** | Requires full interaction design (typing states, error handling, message bubbles). |
| **Agent Context Awareness** | **Fully Functional** | Design visual indicators showing *what* the agent is looking at (e.g., highlighting a scraped field). |
| **Agent Action Execution** | **Hybrid** | Agent decides the action, but execution is mocked. Design the "success/failure" feedback loops in the UI. |