# Watch Animation Frame

![npm](https://img.shields.io/npm/v/@fuckingdigital/watch-animation-frame) ![license](https://img.shields.io/npm/l/@fuckingdigital/watch-animation-frame) ![npm](https://img.shields.io/npm/dt/@fuckingdigital/watch-animation-frame)

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
// subscribe scroll watcher
const subscriptionId = window.__scrollWatcher__.subscribe({
  onchange(currentValue) {
    // gets triggered with every value change
    console.log(`Scrolled to ${currentValue}`);
  },
});
```

The most simple subscription is one with the option `onchange`

## List of subscription options

| option           | type                | description                                                                                                                                                        |
| ---------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `namespace`      | string (optional)   | Can group subscriptions under one namespace. Helps to unsubscribe multiple subscriptions at once.                                                                  |
| `matchCondition` | function (optional) | Gives back `true` or `false` and is the controller for `onappear`, `ondisappear`, `onmatch`, `ondismatch`, `onmatchchange`                                         |
| `onchange`       | function (optional) | Will be triggered with every tick if the value (calculated by the value function given at the watcher construction). Can be used for custom event logic.           |
| `onappear`       | function (optional) | Will be executed if the condition is fullfilled (`true`) and wasn’t before (the last tick). Requires `matchCondition`. a                                           |
| `ondisappear`    | function (optional) | Will be executed if the condition is not fullfilled (`false`), but was before (the last tick). Requires `matchConditioa n`.                                        |
| `onmatch`        | function (optional) | Will be executed every tick the condition is fullfilled (`true`). Requires `matchCondition`. a                                                                     |
| `ondismatch`     | function (optional) | Will be executed every tick the condition is not fullfilled (`false`). Requires `matchCondition`. a                                                                |
| `onmatchchange`  | function (optional) | Will be executed if condition was `true` and is `false` now or was `false` and is `true` now (on every `onappear` and `ondisappear`). Requires a `matchCondition`. |
