import { importShared } from './__federation_fn_import-JrT3xvdd.js';

const React$1 = await importShared('react');

function useMemo(getValue, condition, shouldUpdate) {
  const cacheRef = React$1.useRef({});
  if (!('value' in cacheRef.current) || shouldUpdate(cacheRef.current.condition, condition)) {
    cacheRef.current.value = getValue();
    cacheRef.current.condition = condition;
  }
  return cacheRef.current.value;
}

let warned = {};
const preMessage = (fn) => {
};
function warning(valid, message) {
}
function note(valid, message) {
}
function resetWarned() {
  warned = {};
}
function call(method, valid, message) {
  if (!valid && !warned[message]) {
    method(false, message);
    warned[message] = true;
  }
}
function warningOnce(valid, message) {
  call(warning, valid, message);
}
function noteOnce(valid, message) {
  call(note, valid, message);
}
warningOnce.preMessage = preMessage;
warningOnce.resetWarned = resetWarned;
warningOnce.noteOnce = noteOnce;

/**
 * Deeply compares two object literals.
 * @param obj1 object 1
 * @param obj2 object 2
 * @param shallow shallow compare
 * @returns
 */
function isEqual(obj1, obj2, shallow = false) {
  // https://github.com/mapbox/mapbox-gl-js/pull/5979/files#diff-fde7145050c47cc3a306856efd5f9c3016e86e859de9afbd02c879be5067e58f
  const refSet = new Set();
  function deepEqual(a, b, level = 1) {
    const circular = refSet.has(a);
    warningOnce(!circular, 'Warning: There may be circular references');
    if (circular) {
      return false;
    }
    if (a === b) {
      return true;
    }
    if (shallow && level > 1) {
      return false;
    }
    refSet.add(a);
    const newLevel = level + 1;
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i], newLevel)) {
          return false;
        }
      }
      return true;
    }
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const keys = Object.keys(a);
      if (keys.length !== Object.keys(b).length) {
        return false;
      }
      return keys.every(key => deepEqual(a[key], b[key], newLevel));
    }
    // other
    return false;
  }
  return deepEqual(obj1, obj2);
}

// [times, realValue]

const SPLIT = '%';

/** Connect key with `SPLIT` */
function pathKey(keys) {
  return keys.join(SPLIT);
}

/** Record update id for extract static style order. */
let updateId = 0;
class Entity {
  instanceId;
  constructor(instanceId) {
    this.instanceId = instanceId;
  }

  /** @private Internal cache map. Do not access this directly */
  cache = new Map();

  /** @private Record update times for each key */
  updateTimes = new Map();
  extracted = new Set();
  get(keys) {
    return this.opGet(pathKey(keys));
  }

  /** A fast get cache with `get` concat. */
  opGet(keyPathStr) {
    return this.cache.get(keyPathStr) || null;
  }
  update(keys, valueFn) {
    return this.opUpdate(pathKey(keys), valueFn);
  }

  /** A fast get cache with `get` concat. */
  opUpdate(keyPathStr, valueFn) {
    const prevValue = this.cache.get(keyPathStr);
    const nextValue = valueFn(prevValue);
    if (nextValue === null) {
      this.cache.delete(keyPathStr);
      this.updateTimes.delete(keyPathStr);
    } else {
      this.cache.set(keyPathStr, nextValue);
      this.updateTimes.set(keyPathStr, updateId);
      updateId += 1;
    }
  }
}

const AUTO_PREFIX = {};

const React = await importShared('react');
const ATTR_TOKEN = 'data-token-hash';
const ATTR_MARK = 'data-css-hash';

// Mark css-in-js instance in style element
const CSS_IN_JS_INSTANCE = '__cssinjs_instance__';
function createCache() {
  const cssinjsInstanceId = Math.random().toString(12).slice(2);

  // Tricky SSR: Move all inline style to the head.
  // PS: We do not recommend tricky mode.
  if (typeof document !== 'undefined' && document.head && document.body) {
    const styles = document.body.querySelectorAll(`style[${ATTR_MARK}]`) || [];
    const {
      firstChild
    } = document.head;
    Array.from(styles).forEach(style => {
      style[CSS_IN_JS_INSTANCE] = style[CSS_IN_JS_INSTANCE] || cssinjsInstanceId;

      // Not force move if no head
      if (style[CSS_IN_JS_INSTANCE] === cssinjsInstanceId) {
        document.head.insertBefore(style, firstChild);
      }
    });

    // Deduplicate of moved styles
    const styleHash = {};
    Array.from(document.querySelectorAll(`style[${ATTR_MARK}]`)).forEach(style => {
      const hash = style.getAttribute(ATTR_MARK);
      if (styleHash[hash]) {
        if (style[CSS_IN_JS_INSTANCE] === cssinjsInstanceId) {
          style.parentNode?.removeChild(style);
        }
      } else {
        styleHash[hash] = true;
      }
    });
  }
  return new Entity(cssinjsInstanceId);
}
const StyleContext = /*#__PURE__*/React.createContext({
  hashPriority: 'low',
  cache: createCache(),
  defaultCache: true,
  autoPrefix: false
});
const StyleProvider = props => {
  const {
    children,
    ...restProps
  } = props;
  const parentContext = React.useContext(StyleContext);
  const context = useMemo(() => {
    const mergedContext = {
      ...parentContext
    };
    Object.keys(restProps).forEach(key => {
      const value = restProps[key];
      if (restProps[key] !== undefined) {
        mergedContext[key] = value;
      }
    });
    const {
      cache,
      transformers = []
    } = restProps;
    mergedContext.cache = mergedContext.cache || createCache();
    mergedContext.defaultCache = !cache && parentContext.defaultCache;

    // autoPrefix
    if (transformers.includes(AUTO_PREFIX)) {
      mergedContext.autoPrefix = true;
    }
    return mergedContext;
  }, [parentContext, restProps], (prev, next) => !isEqual(prev[0], next[0], true) || !isEqual(prev[1], next[1], true));
  return /*#__PURE__*/React.createElement(StyleContext.Provider, {
    value: context
  }, children);
};

export { ATTR_TOKEN as A, CSS_IN_JS_INSTANCE as C, StyleContext as S, ATTR_MARK as a, warningOnce as b, StyleProvider as c, isEqual as i, pathKey as p, useMemo as u, warning as w };
