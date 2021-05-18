# Watch Animation Frame

This is a watcher factory, which creates (conditional) event listeners and listens by every tick of an animation frame and possibly fires the provided callbacks.

## Examples

### Create Watchers

```javascript
// create a watcher listening for vertical scrolling/pageYOffset
window.__scrollWatcher__ =
  window.__scrollWatcher__ || new Watcher(() => w.pageYOffset);

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
    console.log(`Scrolled ${currentValue}`);
  },
});
```
