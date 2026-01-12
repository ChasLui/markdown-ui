# @markdown-ui/vanilla

Lightweight Vanilla JS renderer for markdown-ui widgets. No framework dependencies.

## Installation

```bash
npm install @markdown-ui/vanilla @markdown-ui/marked-ext
```

## Usage

### ESM (with bundler)

```typescript
import { MarkdownUI } from '@markdown-ui/vanilla';
import '@markdown-ui/vanilla/widgets.css';
import { Marked } from 'marked';
import { markedUiExtension } from '@markdown-ui/marked-ext';

// Parse markdown with widgets
const marked = new Marked().use(markedUiExtension);
const html = marked.parse(`
# My Form

\`\`\`markdown-ui-widget
button-group env [dev staging prod] dev
\`\`\`
`);

// Render and initialize
document.getElementById('content').innerHTML = html;

const mdui = MarkdownUI.init('#content', {
  onWidgetEvent: (e) => {
    console.log('Widget changed:', e.detail.id, e.detail.value);
  }
});
```

### CDN (no build step)

```html
<link rel="stylesheet" href="https://unpkg.com/@markdown-ui/vanilla/dist/widgets.css">
<script src="https://unpkg.com/@markdown-ui/vanilla/dist/index.umd.js"></script>

<div id="content">
  <markdown-ui-widget
    id="env"
    content="%7B%22type%22%3A%22button-group%22%2C%22choices%22%3A%5B%22dev%22%2C%22prod%22%5D%7D">
  </markdown-ui-widget>
</div>

<script>
  const mdui = MarkdownUIVanilla.MarkdownUI.init('#content', {
    onWidgetEvent: (e) => console.log(e.detail)
  });
</script>
```

## Supported Widgets

- **text-input** - Text field with label and placeholder
- **button-group** - Multiple choice buttons
- **select** - Dropdown selection
- **select-multi** - Multi-select with checkboxes
- **slider** - Range input with min/max/step
- **form** - Container for multiple widgets with submit button

## API

### `MarkdownUI.init(container, options)`

Static factory method to initialize markdown-ui on a container.

```typescript
const mdui = MarkdownUI.init('#content', {
  onWidgetEvent: (e: CustomEvent<WidgetEventDetail>) => {
    console.log(e.detail.id, e.detail.value);
  }
});
```

### `mdui.render(html)`

Render HTML content containing widget elements.

### `mdui.destroy()`

Cleanup event listeners and remove widget-container class.

## Event System

Widget interactions emit `widget-event` custom events with the following detail:

```typescript
interface WidgetEventDetail {
  id: string;    // Widget ID
  value: unknown; // Current value (type depends on widget)
}
```

## Styling

Import the optional CSS for consistent styling:

```javascript
import '@markdown-ui/vanilla/widgets.css';
```

Or via CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@markdown-ui/vanilla/dist/widgets.css">
```

The CSS uses the same class names as `@markdown-ui/react` for consistency.

## License

MIT
