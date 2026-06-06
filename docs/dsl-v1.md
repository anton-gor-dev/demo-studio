# DSL v1 Specification

demo-studio scenarios are described as JSON documents. This file is the canonical reference for version `1.0`.

---

## Top-level schema

```json
{
  "version": "1.0",
  "name": "string (required, non-empty)",
  "description": "string (optional)",
  "networkMocks": [ /* NetworkMock[] (optional) */ ],
  "steps": [ /* Step[] (required, min 1) */ ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | `"1.0"` | ✓ | Literal version string. Must be exactly `"1.0"`. |
| `name` | string | ✓ | Human-readable scenario name. |
| `description` | string | | Optional longer description. |
| `networkMocks` | NetworkMock[] | | Intercept and stub network requests during playback. |
| `steps` | Step[] | ✓ | Ordered list of actions to execute. Minimum one step. |

---

## Actions

All steps share an `action` discriminant field. Unknown action types are rejected at parse time.

### `goto`

Navigate to a URL and wait for the page to load.

```json
{ "action": "goto", "url": "https://example.com", "waitUntil": "load", "timeout": 10000 }
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `url` | string (URL) | ✓ | — |
| `waitUntil` | `"load"` \| `"domcontentloaded"` \| `"networkidle"` | | driver default |
| `timeout` | integer ms > 0 | | `defaultTimeout` |

---

### `click`

Click an element.

```json
{ "action": "click", "selector": "[data-testid='submit']", "button": "left", "modifiers": ["Shift"] }
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `selector` | string (non-empty) | ✓ | — |
| `button` | `"left"` \| `"right"` \| `"middle"` | | `"left"` |
| `modifiers` | `Array<"Alt"\|"Control"\|"Meta"\|"Shift">` | | `[]` |
| `timeout` | integer ms > 0 | | `defaultTimeout` |

---

### `type`

Type text into an input element.

```json
{ "action": "type", "selector": "#email", "value": "user@example.com", "delay": 50, "clear": true }
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `selector` | string (non-empty) | ✓ | — |
| `value` | string | ✓ | — |
| `delay` | integer ms ≥ 0 | | `0` (instant fill) |
| `clear` | boolean | | `false` |
| `timeout` | integer ms > 0 | | `defaultTimeout` |

When `delay > 0` the driver types character-by-character at the given interval, producing a realistic typing animation. When `delay` is omitted or `0`, the value is filled instantly via `fill()`.

---

### `waitFor`

Wait for an element to reach the specified state.

```json
{ "action": "waitFor", "selector": ".dashboard", "state": "visible", "timeout": 10000 }
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `selector` | string (non-empty) | ✓ | — |
| `state` | `"visible"` \| `"hidden"` \| `"attached"` \| `"detached"` | | `"visible"` |
| `timeout` | integer ms > 0 | | `defaultTimeout` |

---

### `hover`

Move the mouse over an element.

```json
{ "action": "hover", "selector": "[data-testid='tooltip-trigger']" }
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `selector` | string (non-empty) | ✓ | — |
| `timeout` | integer ms > 0 | | `defaultTimeout` |

---

### `scroll`

Scroll an element by a pixel amount.

```json
{ "action": "scroll", "selector": ".feed", "direction": "down", "amount": 300 }
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `selector` | string (non-empty) | ✓ | — |
| `direction` | `"up"` \| `"down"` \| `"left"` \| `"right"` | | `"down"` |
| `amount` | number > 0 (pixels) | | `300` |

---

### `switchContext`

Switch the active browser context. Required for Chrome extension automation (M4).

```json
{ "action": "switchContext", "to": "popup" }
```

| Field | Type | Required |
|-------|------|----------|
| `to` | `"page"` \| `"popup"` \| `"background"` | ✓ |

---

## Network mocks

Intercept requests matching a URL pattern and return a stubbed response. Applied before the first step.

```json
{
  "networkMocks": [
    {
      "url": "**/api/user",
      "method": "GET",
      "response": {
        "status": 200,
        "body": { "id": 1, "name": "Alice" },
        "headers": { "x-demo": "true" }
      }
    }
  ]
}
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `url` | string (glob pattern) | ✓ | — |
| `method` | `"GET"` \| `"POST"` \| `"PUT"` \| `"PATCH"` \| `"DELETE"` \| `"HEAD"` \| `"OPTIONS"` | | any |
| `response.status` | integer 100–599 | | `200` |
| `response.body` | any JSON-serialisable value | | — |
| `response.headers` | `Record<string, string>` | | — |

---

## Selector strategy

Prefer selectors in this order (most stable → least stable):

1. **`[data-testid="…"]`** — explicit test hook, never changes from refactors
2. **`role=button[name="Submit"]`** — ARIA role + accessible name, semantic
3. **`#id`** — stable only when id is not auto-generated (skip patterns like `item-42`)
4. **`button:text("Login")`** — visible text content, breaks on i18n changes
5. **CSS path** — last resort; avoid `:nth-child` chains with more than one level

---

## Complete example

```json
{
  "version": "1.0",
  "name": "Onboarding — account creation",
  "description": "Creates a new account and verifies the dashboard appears.",
  "networkMocks": [
    {
      "url": "**/api/register",
      "method": "POST",
      "response": { "status": 201, "body": { "token": "test-token" } }
    }
  ],
  "steps": [
    { "action": "goto",    "url": "https://app.example.com/register" },
    { "action": "type",    "selector": "[data-testid='email']",    "value": "alice@example.com" },
    { "action": "type",    "selector": "[data-testid='password']", "value": "correct-horse", "delay": 40 },
    { "action": "click",   "selector": "[data-testid='register-btn']" },
    { "action": "waitFor", "selector": "[data-testid='dashboard']", "state": "visible", "timeout": 8000 },
    { "action": "hover",   "selector": "[data-testid='user-menu']" },
    { "action": "scroll",  "selector": "[data-testid='activity-feed']", "direction": "down", "amount": 400 }
  ]
}
```

---

## Versioning rules

| Change type | Impact | Version bump |
|-------------|--------|--------------|
| Add optional field to existing action | Non-breaking | Minor (`1.1`) |
| Add new action type | Non-breaking | Minor (`1.1`) |
| Add top-level optional field | Non-breaking | Minor (`1.1`) |
| Rename or remove a field | **Breaking** | Major (`2.0`) |
| Change field type or semantics | **Breaking** | Major (`2.0`) |

**Forward compatibility rule:** engines must silently ignore unknown fields and unknown action types when running in lenient mode. This allows scenarios written for a newer minor version to run on an older engine without crashing.
