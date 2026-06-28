# GoHighLevel Integration Preparation

This folder is mapping-only for now. It prepares clean payloads for contacts,
appointment intent, notes, and opportunities, but does not send data to
GoHighLevel.

Live sending should only be added after:

- `GHL_API_KEY` or `GOHIGHLEVEL_API_KEY` is configured server-side.
- `GHL_LOCATION_ID` or `GOHIGHLEVEL_LOCATION_ID` is configured when using a global location.
- The employee has the relevant calendar, pipeline, stage, and source settings.
- The user explicitly approves activating outbound GoHighLevel writes.

Current status values:

- `not_connected`: no usable credentials.
- `credentials_present`: at least one credential is present, but the setup is incomplete.
- `ready_for_test`: API key and location are present; still no live sends from this app.
