# oxlint-config

[@Robot-Inventor](https://github.com/Robot-Inventor/)'s Oxlint config presets.

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

Do not use a preset only through `extends: [preset]`; root-level options and settings would not be inherited.

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
