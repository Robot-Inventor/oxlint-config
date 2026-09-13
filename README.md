# oxlint-config

[@Robot-Inventor](https://github.com/Robot-Inventor/)'s OXLint config presets.

## Installation

```bash
npm install --save-dev @robot-inventor/oxlint-config
```

## Usage

Create an `oxlint.config.ts` file and export one of the six presets:

```ts
import { oxlintConfig } from "@robot-inventor/oxlint-config";

export default oxlintConfig;
```

The available presets are:

- `oxlintConfig`
- `oxlintConfigNoJSDoc`
- `oxlintReactConfig`
- `oxlintReactConfigNoJSDoc`
- `oxlintNextConfig`
- `oxlintNextConfigNoJSDoc`

The `NoJSDoc` presets check existing JSDoc comments but do not require JSDoc on every declaration.

## Overriding rules

OXLint only inherits `rules`, `plugins`, and `overrides` through its `extends` property. Use object spread so
that type-aware linting, settings, and JavaScript plugin registrations are retained:

```ts
import { oxlintNextConfigNoJSDoc } from "@robot-inventor/oxlint-config";
import { defineConfig } from "oxlint";

export default defineConfig({
    ...oxlintNextConfigNoJSDoc,
    rules: {
        "no-console": "off"
    }
});
```

Do not use a preset only through `extends: [preset]`; root-level options and settings would not be inherited.
