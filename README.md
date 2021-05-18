# Watch Animation Frame

This is a watcher factory, which creates (conditional) event listeners and listens by every tick of an animation frame and possibly fires the provided callbacks.

## Examples

### Create Watchers

```javascript
// create a watcher listening for vertical scrolling/pageYOffset
window.__scrollWatcher__ =
  window.__scrollWatcher__ || new Watcher(() => window.pageYOffset);

// create a watcher listening for changes of horizontal document width
window.__dimensionWatcher__ =
  window.__dimensionWatcher__ || new Watcher(() => window.innerWidth);
```

### Subscribe to Watchers

```javascript
// add scroll watcher
window.__scrollWatcher__.subscribe({
  onchange(currentValue) {
    // gets triggered with every value change
    console.log(`Scrolled to ${currentValue}`);
  },
});
```

The most simple subscription is one with the option `onchange`

## List of subscription options

| option          | type     | description                                                                                                                            |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `onchange`      | function | Will be triggered with every tick if the value (calculated by the value function given at the watcher construction).                   |
| `onappear`      | function | Will be executed if the condition is fullfilled (`true`) and wasn’t before (the last tick).                                            |
| `ondisappear`   | function | Will be executed if the condition is not fullfilled (`false`), but was before (the last tick).                                         |
| `onmatch`       | function | Will be executed every tick the condition is fullfilled (`true`).                                                                      |
| `ondismatch`    | function | Will be executed every tick the condition is not fullfilled (`false`).                                                                 |
| `onmatchchange` | function | Will be executed if condition was `true` and is `false` now or was `false` and is `true` now (on every `onappear` and `ondisappear`).. |
