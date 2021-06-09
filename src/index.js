import { nanoid } from "nanoid";

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

const events = [
  "onchange",
  "onappear",
  "ondisappear",
  "onmatch",
  "ondismatch",
  "onmatchchange",
];

/**
 * Represents a watcher.
 * @constructor
 * @param {function} valueFunction - Triggered with every tick and return a value which will be parameter of all subscribed callback functions.
 */
export default function Watcher(valueFunction) {
  this.subscriptions = {};
  this.namespaces = {};

  // flag for pausing the loop
  this.paused = false;
  // holding the current rAF id
  let rafId;

  let value = undefined;
  const checkWatcher = () => {
    const newValue = valueFunction();
    // if nothing changed we don’t have to do anything
    if (isEqualTo(value, newValue)) return;
    // else execute all functions
    for (const key in this.subscriptions) {
      const subscription = this.subscriptions[key];
      if (subscription.onchange) subscription.onchange(newValue);
      if (subscription.isMatch) {
        const isAMatch = subscription.isMatch(newValue);
        if (isAMatch) {
          // execute onmatch callback
          if (subscription.onmatch) subscription.onmatch(newValue);
          // execute onappear callback if wasn’t a match before
          if (isAMatch != subscription.matchState) {
            if (subscription.onappear) subscription.onappear(newValue);
            if (subscription.onmatchchange)
              subscription.onmatchchange(isAMatch, newValue);
          }
        } else {
          // execute ondismatch callback
          if (subscription.ondismatch) subscription.ondismatch(newValue);
          // execute ondisappear callback if wasn’t a match before
          if (isAMatch != subscription.matchState) {
            if (subscription.ondisappear) subscription.ondisappear(newValue);
            if (subscription.onmatchchange)
              subscription.onmatchchange(isAMatch, newValue);
          }
        }
        subscription.matchState = isAMatch;
      }
    }
    value = newValue;
  };

  const loop = () => {
    // requesting the next frame
    rafId = requestAnimationFrame(loop);
    // but do maybe something before
    if (!this.paused) checkWatcher();
  };

  /**
   * Subscribe to a given watcher and receive a value with every tick if condition matches.
   * @param {{namespace: string, matchCondition: function, onchange: function, onappear: function, ondisappear: function, onmatch: function, ondismatch: function, onmatchchange: function}} options - Triggered with every tick and return a value which will be parameter of all subscribed callback functions.
   * @returns {string} - Return the subscription id which can be used to unsubscribe later.
   */
  this.subscribe = (options = {}) => {
    const subscription = {};
    const id = nanoid();

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
      subscription[events[i]] = options[events[i]];
    }
    // passed all tests
    if (matchEvent) {
      subscription.isMatch = options.matchCondition;
      subscription.matchState = undefined;
    }

    subscription.id = id;

    if (options.namespace) {
      subscription.namespace = options.namespace;
      if (!this.namespaces.hasOwnProperty(options.namespace))
        this.namespaces[options.namespace] = [];
      this.namespaces[options.namespace].push(id);
    }

    this.subscriptions[id] = subscription;

    value = undefined; // make checkWatches believe the value changed
    if (!this.paused) checkWatches();
    return id;
  };

  this.unsubscribe = (id) => {
    if (this.subscriptions.hasOwnProperty(id)) {
      delete this.subscriptions[id];
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
  this.togglePlayPause = () => {
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
