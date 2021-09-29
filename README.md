# web-shell-engine
Small, lightweight web shell engine. Blank slate for controlling a page via a 
configurable shell-like interface.

Uses Typescript, ESLint, and esbuild. No dependencies.

## Usage
Download the latest release from the releases page, or `npm run build` to generate `dist/main.js`.

```html
<script type="module" src="/path/to/web_shell.js"></script>
```

```javascript
import Webshell from './web_shell.js'

const myWebshell = new Webshell();
myWebshell.start();
```

## Compatibility
This project uses ES2021 features.

## Development

`yarn install` to install dev dependencies.

`npm run build` to build.