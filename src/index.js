// TODO: rAF polyfill

import uuid from "uuid/v1";

function isEqualTo(value1, value2) {
  let type = typeof value1;
  if (value1 instanceof Array) type = "array";
  switch (type) {
    case "string":
    case "number":
      return value1 === value2;
    // break;
    case "array":
      if (!(value2 instanceof Array) || value1.length != value2.length)
        return false;
      for (let i = 0, l = value1.length; i < l; i++) {
        if (value1[i] !== value2[i]) {
          return false;
        }
      }
      return true;
    // break;
    default:
      return false;
    // break;
  }
}

export default function Watcher(valueFunction) {
  // the mighty watcher list.
  this.watches = {};
  this.namespaces = {};

  // setting for pausing the execution of the watches check
  this.paused = false;
  // holding the current rAF id
  let rafId;

  let value = undefined;
  const checkWatches = () => {
    const newValue = valueFunction();
    // if nothing changed we don’t have to do anything
    if (isEqualTo(value, newValue)) return;
    // else execute all functions
    for (const key in this.watches) {
      const watch = this.watches[key];
      if (watch.onchange) watch.onchange(newValue);
      if (watch.isMatch) {
        const isAMatch = watch.isMatch(newValue);
        if (isAMatch) {
          // execute onmatch callback
          if (watch.onmatch) watch.onmatch(newValue);
          // execute onappear callback if wasn’t a match before
          if (isAMatch != watch.matchState) {
            if (watch.onappear) watch.onappear(newValue);
            if (watch.onmatchchange) watch.onmatchchange(isAMatch, newValue);
          }
        } else {
          // execute ondismatch callback
          if (watch.ondismatch) watch.ondismatch(newValue);
          // execute ondisappear callback if wasn’t a match before
          if (isAMatch != watch.matchState) {
            if (watch.ondisappear) watch.ondisappear(newValue);
            if (watch.onmatchchange) watch.onmatchchange(isAMatch, newValue);
          }
        }
        watch.matchState = isAMatch;
      }
    }
    value = newValue;
  };

  const loop = () => {
    // requesting the next frame
    rafId = requestAnimationFrame(loop);
    // but do maxybe something before
    if (!this.paused) checkWatches();
  };

  // subscribe
  // options {
  //     namespace: string — (optional) can be helpful later to delete all watches within the same namespace,
  //     matchCondition: function — (optional) validates a match
  //     onchange: function — (optional) will be executed if the current value is not equal to old one
  //     onappear: function - (optional) just works, if matchCondition is set
  //     ondisappear: function - (optional) just works, if matchCondition is set
  //     onmatch: function - (optional) just works, if matchCondition is set
  //     ondismatch: function - (optional) just works, if matchCondition is set
  //     onmatchchange: function - (optional) if appears or disappears
  // }
  const events = [
    "onchange",
    "onappear",
    "ondisappear",
    "onmatch",
    "ondismatch",
    "onmatchchange",
  ];
  this.subscribe = (options = {}) => {
    const watcher = {};
    const id = uuid();

    let matchEvent = false,
      isMatch = typeof options.matchCondition === "function";
    for (let i = 0, len = events.length; i < len; i++) {
      if (typeof options[events[i]] !== "function") continue;
      if (events[i] !== "onchange") {
        // there is a match event/callback
        if (isMatch) {
          matchEvent = true;
        } else {
          // events only make sense with a condition
          continue;
        }
      }
      watcher[events[i]] = options[events[i]];
    }
    // passed all tests
    if (matchEvent) {
      watcher.isMatch = options.matchCondition;
      watcher.matchState = undefined;
    }

    watcher.id = id;

    if (options.namespace) {
      watcher.namespace = options.namespace;
      if (!this.namespaces.hasOwnProperty(options.namespace))
        this.namespaces[options.namespace] = [];
      this.namespaces[options.namespace].push(id);
    }

    this.watches[id] = watcher;

    value = undefined; // make checkWatches believe the value changed
    if (!this.paused) checkWatches();
    return id;
  };

  this.unsubscribe = (id) => {
    if (this.watches.hasOwnProperty(id)) {
      delete this.watches[id];
    }
  };

  this.unsubscribeNamespace = (namespace) => {
    if (!this.namespaces.hasOwnProperty(namespace)) return;
    for (let i = 0, len = this.namespaces[namespace].length; i < len; i++)
      this.unsubscribe(this.namespaces[namespace][i]);
    delete this.namespaces[namespace];
  };

  this.play = () => {
    value = undefined;
    this.paused = false;
    checkWatches();
  };
  this.pause = () => {
    this.paused = true;
  };
  this.playPause = () => {
    if (this.paused) this.play();
    else this.pause();
  };
  const initalize = () => {
    if (typeof valueFunction !== "function") return false;
    loop();
  };

  this.kill = () => {
    if (rafId) cancelAnimationFrame(rafId);
  };

  initalize();
}
