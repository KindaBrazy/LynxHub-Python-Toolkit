import { importShared } from './__federation_fn_import-JrT3xvdd.js';
import { j as jsxRuntimeExports, a as TRANSITION_EASINGS } from './chunk-736YWA4T-Da4CYBw8.js';
import { c as commonjsGlobal, g as getDefaultExportFromCjs, a as getAugmentedNamespace } from './_commonjsHelpers-D5KtpA0t.js';

function isPlainObject$2(obj) {
  if (typeof obj !== "object" || obj === null)
    return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
}
function isAction(action) {
  return isPlainObject$2(action) && "type" in action && typeof action.type === "string";
}

var NOTHING = Symbol.for("immer-nothing");
var DRAFTABLE = Symbol.for("immer-draftable");
var DRAFT_STATE = Symbol.for("immer-state");
function die(error, ...args) {
  throw new Error(
    `[Immer] minified error nr: ${error}. Full error at: https://bit.ly/3cXEKWf`
  );
}
var getPrototypeOf = Object.getPrototypeOf;
function isDraft(value) {
  return !!value && !!value[DRAFT_STATE];
}
function isDraftable(value) {
  if (!value)
    return false;
  return isPlainObject$1(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor?.[DRAFTABLE] || isMap(value) || isSet(value);
}
var objectCtorString = Object.prototype.constructor.toString();
function isPlainObject$1(value) {
  if (!value || typeof value !== "object")
    return false;
  const proto = getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  const Ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  if (Ctor === Object)
    return true;
  return typeof Ctor == "function" && Function.toString.call(Ctor) === objectCtorString;
}
function each$1(obj, iter) {
  if (getArchtype(obj) === 0) {
    Reflect.ownKeys(obj).forEach((key) => {
      iter(key, obj[key], obj);
    });
  } else {
    obj.forEach((entry, index) => iter(index, entry, obj));
  }
}
function getArchtype(thing) {
  const state = thing[DRAFT_STATE];
  return state ? state.type_ : Array.isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
}
function has(thing, prop) {
  return getArchtype(thing) === 2 ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
}
function set(thing, propOrOldValue, value) {
  const t = getArchtype(thing);
  if (t === 2)
    thing.set(propOrOldValue, value);
  else if (t === 3) {
    thing.add(value);
  } else
    thing[propOrOldValue] = value;
}
function is$1(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
function isMap(target) {
  return target instanceof Map;
}
function isSet(target) {
  return target instanceof Set;
}
function latest(state) {
  return state.copy_ || state.base_;
}
function shallowCopy(base, strict) {
  if (isMap(base)) {
    return new Map(base);
  }
  if (isSet(base)) {
    return new Set(base);
  }
  if (Array.isArray(base))
    return Array.prototype.slice.call(base);
  const isPlain = isPlainObject$1(base);
  if (strict === true || strict === "class_only" && !isPlain) {
    const descriptors = Object.getOwnPropertyDescriptors(base);
    delete descriptors[DRAFT_STATE];
    let keys = Reflect.ownKeys(descriptors);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const desc = descriptors[key];
      if (desc.writable === false) {
        desc.writable = true;
        desc.configurable = true;
      }
      if (desc.get || desc.set)
        descriptors[key] = {
          configurable: true,
          writable: true,
          // could live with !!desc.set as well here...
          enumerable: desc.enumerable,
          value: base[key]
        };
    }
    return Object.create(getPrototypeOf(base), descriptors);
  } else {
    const proto = getPrototypeOf(base);
    if (proto !== null && isPlain) {
      return { ...base };
    }
    const obj = Object.create(proto);
    return Object.assign(obj, base);
  }
}
function freeze(obj, deep = false) {
  if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj))
    return obj;
  if (getArchtype(obj) > 1) {
    obj.set = obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
  }
  Object.freeze(obj);
  if (deep)
    Object.entries(obj).forEach(([key, value]) => freeze(value, true));
  return obj;
}
function dontMutateFrozenCollections() {
  die(2);
}
function isFrozen(obj) {
  return Object.isFrozen(obj);
}
var plugins = {};
function getPlugin(pluginKey) {
  const plugin = plugins[pluginKey];
  if (!plugin) {
    die(0, pluginKey);
  }
  return plugin;
}
var currentScope;
function getCurrentScope() {
  return currentScope;
}
function createScope(parent_, immer_) {
  return {
    drafts_: [],
    parent_,
    immer_,
    // Whenever the modified draft contains a draft from another scope, we
    // need to prevent auto-freezing so the unowned draft can be finalized.
    canAutoFreeze_: true,
    unfinalizedDrafts_: 0
  };
}
function usePatchesInScope(scope, patchListener) {
  if (patchListener) {
    getPlugin("Patches");
    scope.patches_ = [];
    scope.inversePatches_ = [];
    scope.patchListener_ = patchListener;
  }
}
function revokeScope(scope) {
  leaveScope(scope);
  scope.drafts_.forEach(revokeDraft);
  scope.drafts_ = null;
}
function leaveScope(scope) {
  if (scope === currentScope) {
    currentScope = scope.parent_;
  }
}
function enterScope(immer2) {
  return currentScope = createScope(currentScope, immer2);
}
function revokeDraft(draft) {
  const state = draft[DRAFT_STATE];
  if (state.type_ === 0 || state.type_ === 1)
    state.revoke_();
  else
    state.revoked_ = true;
}
function processResult(result, scope) {
  scope.unfinalizedDrafts_ = scope.drafts_.length;
  const baseDraft = scope.drafts_[0];
  const isReplaced = result !== void 0 && result !== baseDraft;
  if (isReplaced) {
    if (baseDraft[DRAFT_STATE].modified_) {
      revokeScope(scope);
      die(4);
    }
    if (isDraftable(result)) {
      result = finalize(scope, result);
      if (!scope.parent_)
        maybeFreeze(scope, result);
    }
    if (scope.patches_) {
      getPlugin("Patches").generateReplacementPatches_(
        baseDraft[DRAFT_STATE].base_,
        result,
        scope.patches_,
        scope.inversePatches_
      );
    }
  } else {
    result = finalize(scope, baseDraft, []);
  }
  revokeScope(scope);
  if (scope.patches_) {
    scope.patchListener_(scope.patches_, scope.inversePatches_);
  }
  return result !== NOTHING ? result : void 0;
}
function finalize(rootScope, value, path) {
  if (isFrozen(value))
    return value;
  const state = value[DRAFT_STATE];
  if (!state) {
    each$1(
      value,
      (key, childValue) => finalizeProperty(rootScope, state, value, key, childValue, path)
    );
    return value;
  }
  if (state.scope_ !== rootScope)
    return value;
  if (!state.modified_) {
    maybeFreeze(rootScope, state.base_, true);
    return state.base_;
  }
  if (!state.finalized_) {
    state.finalized_ = true;
    state.scope_.unfinalizedDrafts_--;
    const result = state.copy_;
    let resultEach = result;
    let isSet2 = false;
    if (state.type_ === 3) {
      resultEach = new Set(result);
      result.clear();
      isSet2 = true;
    }
    each$1(
      resultEach,
      (key, childValue) => finalizeProperty(rootScope, state, result, key, childValue, path, isSet2)
    );
    maybeFreeze(rootScope, result, false);
    if (path && rootScope.patches_) {
      getPlugin("Patches").generatePatches_(
        state,
        path,
        rootScope.patches_,
        rootScope.inversePatches_
      );
    }
  }
  return state.copy_;
}
function finalizeProperty(rootScope, parentState, targetObject, prop, childValue, rootPath, targetIsSet) {
  if (isDraft(childValue)) {
    const path = rootPath && parentState && parentState.type_ !== 3 && // Set objects are atomic since they have no keys.
    !has(parentState.assigned_, prop) ? rootPath.concat(prop) : void 0;
    const res = finalize(rootScope, childValue, path);
    set(targetObject, prop, res);
    if (isDraft(res)) {
      rootScope.canAutoFreeze_ = false;
    } else
      return;
  } else if (targetIsSet) {
    targetObject.add(childValue);
  }
  if (isDraftable(childValue) && !isFrozen(childValue)) {
    if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
      return;
    }
    finalize(rootScope, childValue);
    if ((!parentState || !parentState.scope_.parent_) && typeof prop !== "symbol" && Object.prototype.propertyIsEnumerable.call(targetObject, prop))
      maybeFreeze(rootScope, childValue);
  }
}
function maybeFreeze(scope, value, deep = false) {
  if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
    freeze(value, deep);
  }
}
function createProxyProxy(base, parent) {
  const isArray = Array.isArray(base);
  const state = {
    type_: isArray ? 1 : 0,
    // Track which produce call this is associated with.
    scope_: parent ? parent.scope_ : getCurrentScope(),
    // True for both shallow and deep changes.
    modified_: false,
    // Used during finalization.
    finalized_: false,
    // Track which properties have been assigned (true) or deleted (false).
    assigned_: {},
    // The parent draft state.
    parent_: parent,
    // The base state.
    base_: base,
    // The base proxy.
    draft_: null,
    // set below
    // The base copy with any updated values.
    copy_: null,
    // Called by the `produce` function.
    revoke_: null,
    isManual_: false
  };
  let target = state;
  let traps = objectTraps;
  if (isArray) {
    target = [state];
    traps = arrayTraps;
  }
  const { revoke, proxy } = Proxy.revocable(target, traps);
  state.draft_ = proxy;
  state.revoke_ = revoke;
  return proxy;
}
var objectTraps = {
  get(state, prop) {
    if (prop === DRAFT_STATE)
      return state;
    const source = latest(state);
    if (!has(source, prop)) {
      return readPropFromProto(state, source, prop);
    }
    const value = source[prop];
    if (state.finalized_ || !isDraftable(value)) {
      return value;
    }
    if (value === peek(state.base_, prop)) {
      prepareCopy(state);
      return state.copy_[prop] = createProxy(value, state);
    }
    return value;
  },
  has(state, prop) {
    return prop in latest(state);
  },
  ownKeys(state) {
    return Reflect.ownKeys(latest(state));
  },
  set(state, prop, value) {
    const desc = getDescriptorFromProto(latest(state), prop);
    if (desc?.set) {
      desc.set.call(state.draft_, value);
      return true;
    }
    if (!state.modified_) {
      const current2 = peek(latest(state), prop);
      const currentState = current2?.[DRAFT_STATE];
      if (currentState && currentState.base_ === value) {
        state.copy_[prop] = value;
        state.assigned_[prop] = false;
        return true;
      }
      if (is$1(value, current2) && (value !== void 0 || has(state.base_, prop)))
        return true;
      prepareCopy(state);
      markChanged(state);
    }
    if (state.copy_[prop] === value && // special case: handle new props with value 'undefined'
    (value !== void 0 || prop in state.copy_) || // special case: NaN
    Number.isNaN(value) && Number.isNaN(state.copy_[prop]))
      return true;
    state.copy_[prop] = value;
    state.assigned_[prop] = true;
    return true;
  },
  deleteProperty(state, prop) {
    if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
      state.assigned_[prop] = false;
      prepareCopy(state);
      markChanged(state);
    } else {
      delete state.assigned_[prop];
    }
    if (state.copy_) {
      delete state.copy_[prop];
    }
    return true;
  },
  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
  // the same guarantee in ES5 mode.
  getOwnPropertyDescriptor(state, prop) {
    const owner = latest(state);
    const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
    if (!desc)
      return desc;
    return {
      writable: true,
      configurable: state.type_ !== 1 || prop !== "length",
      enumerable: desc.enumerable,
      value: owner[prop]
    };
  },
  defineProperty() {
    die(11);
  },
  getPrototypeOf(state) {
    return getPrototypeOf(state.base_);
  },
  setPrototypeOf() {
    die(12);
  }
};
var arrayTraps = {};
each$1(objectTraps, (key, fn) => {
  arrayTraps[key] = function() {
    arguments[0] = arguments[0][0];
    return fn.apply(this, arguments);
  };
});
arrayTraps.deleteProperty = function(state, prop) {
  return arrayTraps.set.call(this, state, prop, void 0);
};
arrayTraps.set = function(state, prop, value) {
  return objectTraps.set.call(this, state[0], prop, value, state[0]);
};
function peek(draft, prop) {
  const state = draft[DRAFT_STATE];
  const source = state ? latest(state) : draft;
  return source[prop];
}
function readPropFromProto(state, source, prop) {
  const desc = getDescriptorFromProto(source, prop);
  return desc ? `value` in desc ? desc.value : (
    // This is a very special case, if the prop is a getter defined by the
    // prototype, we should invoke it with the draft as context!
    desc.get?.call(state.draft_)
  ) : void 0;
}
function getDescriptorFromProto(source, prop) {
  if (!(prop in source))
    return void 0;
  let proto = getPrototypeOf(source);
  while (proto) {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (desc)
      return desc;
    proto = getPrototypeOf(proto);
  }
  return void 0;
}
function markChanged(state) {
  if (!state.modified_) {
    state.modified_ = true;
    if (state.parent_) {
      markChanged(state.parent_);
    }
  }
}
function prepareCopy(state) {
  if (!state.copy_) {
    state.copy_ = shallowCopy(
      state.base_,
      state.scope_.immer_.useStrictShallowCopy_
    );
  }
}
var Immer2 = class {
  constructor(config) {
    this.autoFreeze_ = true;
    this.useStrictShallowCopy_ = false;
    this.produce = (base, recipe, patchListener) => {
      if (typeof base === "function" && typeof recipe !== "function") {
        const defaultBase = recipe;
        recipe = base;
        const self = this;
        return function curriedProduce(base2 = defaultBase, ...args) {
          return self.produce(base2, (draft) => recipe.call(this, draft, ...args));
        };
      }
      if (typeof recipe !== "function")
        die(6);
      if (patchListener !== void 0 && typeof patchListener !== "function")
        die(7);
      let result;
      if (isDraftable(base)) {
        const scope = enterScope(this);
        const proxy = createProxy(base, void 0);
        let hasError = true;
        try {
          result = recipe(proxy);
          hasError = false;
        } finally {
          if (hasError)
            revokeScope(scope);
          else
            leaveScope(scope);
        }
        usePatchesInScope(scope, patchListener);
        return processResult(result, scope);
      } else if (!base || typeof base !== "object") {
        result = recipe(base);
        if (result === void 0)
          result = base;
        if (result === NOTHING)
          result = void 0;
        if (this.autoFreeze_)
          freeze(result, true);
        if (patchListener) {
          const p = [];
          const ip = [];
          getPlugin("Patches").generateReplacementPatches_(base, result, p, ip);
          patchListener(p, ip);
        }
        return result;
      } else
        die(1, base);
    };
    this.produceWithPatches = (base, recipe) => {
      if (typeof base === "function") {
        return (state, ...args) => this.produceWithPatches(state, (draft) => base(draft, ...args));
      }
      let patches, inversePatches;
      const result = this.produce(base, recipe, (p, ip) => {
        patches = p;
        inversePatches = ip;
      });
      return [result, patches, inversePatches];
    };
    if (typeof config?.autoFreeze === "boolean")
      this.setAutoFreeze(config.autoFreeze);
    if (typeof config?.useStrictShallowCopy === "boolean")
      this.setUseStrictShallowCopy(config.useStrictShallowCopy);
  }
  createDraft(base) {
    if (!isDraftable(base))
      die(8);
    if (isDraft(base))
      base = current(base);
    const scope = enterScope(this);
    const proxy = createProxy(base, void 0);
    proxy[DRAFT_STATE].isManual_ = true;
    leaveScope(scope);
    return proxy;
  }
  finishDraft(draft, patchListener) {
    const state = draft && draft[DRAFT_STATE];
    if (!state || !state.isManual_)
      die(9);
    const { scope_: scope } = state;
    usePatchesInScope(scope, patchListener);
    return processResult(void 0, scope);
  }
  /**
   * Pass true to automatically freeze all copies created by Immer.
   *
   * By default, auto-freezing is enabled.
   */
  setAutoFreeze(value) {
    this.autoFreeze_ = value;
  }
  /**
   * Pass true to enable strict shallow copy.
   *
   * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
   */
  setUseStrictShallowCopy(value) {
    this.useStrictShallowCopy_ = value;
  }
  applyPatches(base, patches) {
    let i;
    for (i = patches.length - 1; i >= 0; i--) {
      const patch = patches[i];
      if (patch.path.length === 0 && patch.op === "replace") {
        base = patch.value;
        break;
      }
    }
    if (i > -1) {
      patches = patches.slice(i + 1);
    }
    const applyPatchesImpl = getPlugin("Patches").applyPatches_;
    if (isDraft(base)) {
      return applyPatchesImpl(base, patches);
    }
    return this.produce(
      base,
      (draft) => applyPatchesImpl(draft, patches)
    );
  }
};
function createProxy(value, parent) {
  const draft = isMap(value) ? getPlugin("MapSet").proxyMap_(value, parent) : isSet(value) ? getPlugin("MapSet").proxySet_(value, parent) : createProxyProxy(value, parent);
  const scope = parent ? parent.scope_ : getCurrentScope();
  scope.drafts_.push(draft);
  return draft;
}
function current(value) {
  if (!isDraft(value))
    die(10, value);
  return currentImpl(value);
}
function currentImpl(value) {
  if (!isDraftable(value) || isFrozen(value))
    return value;
  const state = value[DRAFT_STATE];
  let copy;
  if (state) {
    if (!state.modified_)
      return state.base_;
    state.finalized_ = true;
    copy = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
  } else {
    copy = shallowCopy(value, true);
  }
  each$1(copy, (key, childValue) => {
    set(copy, key, currentImpl(childValue));
  });
  if (state) {
    state.finalized_ = false;
  }
  return copy;
}
var immer = new Immer2();
var produce = immer.produce;
immer.produceWithPatches.bind(
  immer
);
immer.setAutoFreeze.bind(immer);
immer.setUseStrictShallowCopy.bind(immer);
immer.applyPatches.bind(immer);
immer.createDraft.bind(immer);
immer.finishDraft.bind(immer);

function createAction(type, prepareAction) {
  function actionCreator(...args) {
    if (prepareAction) {
      let prepared = prepareAction(...args);
      if (!prepared) {
        throw new Error(formatProdErrorMessage(0) );
      }
      return {
        type,
        payload: prepared.payload,
        ..."meta" in prepared && {
          meta: prepared.meta
        },
        ..."error" in prepared && {
          error: prepared.error
        }
      };
    }
    return {
      type,
      payload: args[0]
    };
  }
  actionCreator.toString = () => `${type}`;
  actionCreator.type = type;
  actionCreator.match = (action) => isAction(action) && action.type === type;
  return actionCreator;
}
function freezeDraftable(val) {
  return isDraftable(val) ? produce(val, () => {
  }) : val;
}
function getOrInsertComputed(map, key, compute) {
  if (map.has(key)) return map.get(key);
  return map.set(key, compute(key)).get(key);
}
function executeReducerBuilderCallback(builderCallback) {
  const actionsMap = {};
  const actionMatchers = [];
  let defaultCaseReducer;
  const builder = {
    addCase(typeOrActionCreator, reducer) {
      const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
      if (!type) {
        throw new Error(formatProdErrorMessage(28) );
      }
      if (type in actionsMap) {
        throw new Error(formatProdErrorMessage(29) );
      }
      actionsMap[type] = reducer;
      return builder;
    },
    addMatcher(matcher, reducer) {
      actionMatchers.push({
        matcher,
        reducer
      });
      return builder;
    },
    addDefaultCase(reducer) {
      defaultCaseReducer = reducer;
      return builder;
    }
  };
  builderCallback(builder);
  return [actionsMap, actionMatchers, defaultCaseReducer];
}
function isStateFunction(x) {
  return typeof x === "function";
}
function createReducer(initialState, mapOrBuilderCallback) {
  let [actionsMap, finalActionMatchers, finalDefaultCaseReducer] = executeReducerBuilderCallback(mapOrBuilderCallback);
  let getInitialState;
  if (isStateFunction(initialState)) {
    getInitialState = () => freezeDraftable(initialState());
  } else {
    const frozenInitialState = freezeDraftable(initialState);
    getInitialState = () => frozenInitialState;
  }
  function reducer(state = getInitialState(), action) {
    let caseReducers = [actionsMap[action.type], ...finalActionMatchers.filter(({
      matcher
    }) => matcher(action)).map(({
      reducer: reducer2
    }) => reducer2)];
    if (caseReducers.filter((cr) => !!cr).length === 0) {
      caseReducers = [finalDefaultCaseReducer];
    }
    return caseReducers.reduce((previousState, caseReducer) => {
      if (caseReducer) {
        if (isDraft(previousState)) {
          const draft = previousState;
          const result = caseReducer(draft, action);
          if (result === void 0) {
            return previousState;
          }
          return result;
        } else if (!isDraftable(previousState)) {
          const result = caseReducer(previousState, action);
          if (result === void 0) {
            if (previousState === null) {
              return previousState;
            }
            throw Error("A case reducer on a non-draftable value must not return undefined");
          }
          return result;
        } else {
          return produce(previousState, (draft) => {
            return caseReducer(draft, action);
          });
        }
      }
      return previousState;
    }, state);
  }
  reducer.getInitialState = getInitialState;
  return reducer;
}
var asyncThunkSymbol = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
function getType(slice, actionKey) {
  return `${slice}/${actionKey}`;
}
function buildCreateSlice({
  creators
} = {}) {
  const cAT = creators?.asyncThunk?.[asyncThunkSymbol];
  return function createSlice2(options) {
    const {
      name,
      reducerPath = name
    } = options;
    if (!name) {
      throw new Error(formatProdErrorMessage(11) );
    }
    const reducers = (typeof options.reducers === "function" ? options.reducers(buildReducerCreators()) : options.reducers) || {};
    const reducerNames = Object.keys(reducers);
    const context = {
      sliceCaseReducersByName: {},
      sliceCaseReducersByType: {},
      actionCreators: {},
      sliceMatchers: []
    };
    const contextMethods = {
      addCase(typeOrActionCreator, reducer2) {
        const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
        if (!type) {
          throw new Error(formatProdErrorMessage(12) );
        }
        if (type in context.sliceCaseReducersByType) {
          throw new Error(formatProdErrorMessage(13) );
        }
        context.sliceCaseReducersByType[type] = reducer2;
        return contextMethods;
      },
      addMatcher(matcher, reducer2) {
        context.sliceMatchers.push({
          matcher,
          reducer: reducer2
        });
        return contextMethods;
      },
      exposeAction(name2, actionCreator) {
        context.actionCreators[name2] = actionCreator;
        return contextMethods;
      },
      exposeCaseReducer(name2, reducer2) {
        context.sliceCaseReducersByName[name2] = reducer2;
        return contextMethods;
      }
    };
    reducerNames.forEach((reducerName) => {
      const reducerDefinition = reducers[reducerName];
      const reducerDetails = {
        reducerName,
        type: getType(name, reducerName),
        createNotation: typeof options.reducers === "function"
      };
      if (isAsyncThunkSliceReducerDefinition(reducerDefinition)) {
        handleThunkCaseReducerDefinition(reducerDetails, reducerDefinition, contextMethods, cAT);
      } else {
        handleNormalReducerDefinition(reducerDetails, reducerDefinition, contextMethods);
      }
    });
    function buildReducer() {
      const [extraReducers = {}, actionMatchers = [], defaultCaseReducer = void 0] = typeof options.extraReducers === "function" ? executeReducerBuilderCallback(options.extraReducers) : [options.extraReducers];
      const finalCaseReducers = {
        ...extraReducers,
        ...context.sliceCaseReducersByType
      };
      return createReducer(options.initialState, (builder) => {
        for (let key in finalCaseReducers) {
          builder.addCase(key, finalCaseReducers[key]);
        }
        for (let sM of context.sliceMatchers) {
          builder.addMatcher(sM.matcher, sM.reducer);
        }
        for (let m of actionMatchers) {
          builder.addMatcher(m.matcher, m.reducer);
        }
        if (defaultCaseReducer) {
          builder.addDefaultCase(defaultCaseReducer);
        }
      });
    }
    const selectSelf = (state) => state;
    const injectedSelectorCache = /* @__PURE__ */ new Map();
    const injectedStateCache = /* @__PURE__ */ new WeakMap();
    let _reducer;
    function reducer(state, action) {
      if (!_reducer) _reducer = buildReducer();
      return _reducer(state, action);
    }
    function getInitialState() {
      if (!_reducer) _reducer = buildReducer();
      return _reducer.getInitialState();
    }
    function makeSelectorProps(reducerPath2, injected = false) {
      function selectSlice(state) {
        let sliceState = state[reducerPath2];
        if (typeof sliceState === "undefined") {
          if (injected) {
            sliceState = getOrInsertComputed(injectedStateCache, selectSlice, getInitialState);
          }
        }
        return sliceState;
      }
      function getSelectors(selectState = selectSelf) {
        const selectorCache = getOrInsertComputed(injectedSelectorCache, injected, () => /* @__PURE__ */ new WeakMap());
        return getOrInsertComputed(selectorCache, selectState, () => {
          const map = {};
          for (const [name2, selector] of Object.entries(options.selectors ?? {})) {
            map[name2] = wrapSelector(selector, selectState, () => getOrInsertComputed(injectedStateCache, selectState, getInitialState), injected);
          }
          return map;
        });
      }
      return {
        reducerPath: reducerPath2,
        getSelectors,
        get selectors() {
          return getSelectors(selectSlice);
        },
        selectSlice
      };
    }
    const slice = {
      name,
      reducer,
      actions: context.actionCreators,
      caseReducers: context.sliceCaseReducersByName,
      getInitialState,
      ...makeSelectorProps(reducerPath),
      injectInto(injectable, {
        reducerPath: pathOpt,
        ...config
      } = {}) {
        const newReducerPath = pathOpt ?? reducerPath;
        injectable.inject({
          reducerPath: newReducerPath,
          reducer
        }, config);
        return {
          ...slice,
          ...makeSelectorProps(newReducerPath, true)
        };
      }
    };
    return slice;
  };
}
function wrapSelector(selector, selectState, getInitialState, injected) {
  function wrapper(rootState, ...args) {
    let sliceState = selectState(rootState);
    if (typeof sliceState === "undefined") {
      if (injected) {
        sliceState = getInitialState();
      }
    }
    return selector(sliceState, ...args);
  }
  wrapper.unwrapped = selector;
  return wrapper;
}
var createSlice = /* @__PURE__ */ buildCreateSlice();
function buildReducerCreators() {
  function asyncThunk(payloadCreator, config) {
    return {
      _reducerDefinitionType: "asyncThunk",
      payloadCreator,
      ...config
    };
  }
  asyncThunk.withTypes = () => asyncThunk;
  return {
    reducer(caseReducer) {
      return Object.assign({
        // hack so the wrapping function has the same name as the original
        // we need to create a wrapper so the `reducerDefinitionType` is not assigned to the original
        [caseReducer.name](...args) {
          return caseReducer(...args);
        }
      }[caseReducer.name], {
        _reducerDefinitionType: "reducer"
        /* reducer */
      });
    },
    preparedReducer(prepare, reducer) {
      return {
        _reducerDefinitionType: "reducerWithPrepare",
        prepare,
        reducer
      };
    },
    asyncThunk
  };
}
function handleNormalReducerDefinition({
  type,
  reducerName,
  createNotation
}, maybeReducerWithPrepare, context) {
  let caseReducer;
  let prepareCallback;
  if ("reducer" in maybeReducerWithPrepare) {
    if (createNotation && !isCaseReducerWithPrepareDefinition(maybeReducerWithPrepare)) {
      throw new Error(formatProdErrorMessage(17) );
    }
    caseReducer = maybeReducerWithPrepare.reducer;
    prepareCallback = maybeReducerWithPrepare.prepare;
  } else {
    caseReducer = maybeReducerWithPrepare;
  }
  context.addCase(type, caseReducer).exposeCaseReducer(reducerName, caseReducer).exposeAction(reducerName, prepareCallback ? createAction(type, prepareCallback) : createAction(type));
}
function isAsyncThunkSliceReducerDefinition(reducerDefinition) {
  return reducerDefinition._reducerDefinitionType === "asyncThunk";
}
function isCaseReducerWithPrepareDefinition(reducerDefinition) {
  return reducerDefinition._reducerDefinitionType === "reducerWithPrepare";
}
function handleThunkCaseReducerDefinition({
  type,
  reducerName
}, reducerDefinition, context, cAT) {
  if (!cAT) {
    throw new Error(formatProdErrorMessage(18) );
  }
  const {
    payloadCreator,
    fulfilled,
    pending,
    rejected,
    settled,
    options
  } = reducerDefinition;
  const thunk = cAT(type, payloadCreator, options);
  context.exposeAction(reducerName, thunk);
  if (fulfilled) {
    context.addCase(thunk.fulfilled, fulfilled);
  }
  if (pending) {
    context.addCase(thunk.pending, pending);
  }
  if (rejected) {
    context.addCase(thunk.rejected, rejected);
  }
  if (settled) {
    context.addMatcher(thunk.settled, settled);
  }
  context.exposeCaseReducer(reducerName, {
    fulfilled: fulfilled || noop$1,
    pending: pending || noop$1,
    rejected: rejected || noop$1,
    settled: settled || noop$1
  });
}
function noop$1() {
}
function formatProdErrorMessage(code) {
  return `Minified Redux Toolkit error #${code}; visit https://redux-toolkit.js.org/Errors?code=${code} for the full message or use the non-minified dev environment for full errors. `;
}

function Add_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { fill: "none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "M10.5 20a1.5 1.5 0 0 0 3 0v-6.5H20a1.5 1.5 0 0 0 0-3h-6.5V4a1.5 1.5 0 0 0-3 0v6.5H4a1.5 1.5 0 0 0 0 3h6.5z"
      }
    )
  ] }) });
}
function Circle_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1em", viewBox: "0 0 256 256", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      fill: "currentColor",
      d: "M128 20a108 108 0 1 0 108 108A108.12 108.12 0 0 0 128 20m0 192a84 84 0 1 1 84-84a84.09 84.09 0 0 1-84 84"
    }
  ) });
}
function Close_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { fill: "none", fillRule: "evenodd", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "m12 14.122l5.303 5.303a1.5 1.5 0 0 0 2.122-2.122L14.12 12l5.304-5.303a1.5 1.5 0 1 0-2.122-2.121L12 9.879L6.697 4.576a1.5 1.5 0 1 0-2.122 2.12L9.88 12l-5.304 5.304a1.5 1.5 0 1 0 2.122 2.12z"
      }
    )
  ] }) });
}
function Download2_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        fill: "currentColor",
        d: "M12 1.25a.75.75 0 0 0-.75.75v10.973l-1.68-1.961a.75.75 0 1 0-1.14.976l3 3.5a.75.75 0 0 0 1.14 0l3-3.5a.75.75 0 1 0-1.14-.976l-1.68 1.96V2a.75.75 0 0 0-.75-.75"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "M14.25 9v.378a2.249 2.249 0 0 1 2.458 3.586l-3 3.5a2.25 2.25 0 0 1-3.416 0l-3-3.5A2.25 2.25 0 0 1 9.75 9.378V9H8c-2.828 0-4.243 0-5.121.879C2 10.757 2 12.172 2 15v1c0 2.828 0 4.243.879 5.121C3.757 22 5.172 22 8 22h8c2.828 0 4.243 0 5.121-.879C22 20.243 22 18.828 22 16v-1c0-2.828 0-4.243-.879-5.121C20.243 9 18.828 9 16 9z"
      }
    )
  ] });
}
function File_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { fill: "none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "M12 2v6.5a1.5 1.5 0 0 0 1.356 1.493L13.5 10H20v10a2 2 0 0 1-1.85 1.995L18 22H6a2 2 0 0 1-1.995-1.85L4 20V4a2 2 0 0 1 1.85-1.995L6 2zm2 .043a2 2 0 0 1 .877.43l.123.113L19.414 7a2 2 0 0 1 .502.84l.04.16H14z"
      }
    )
  ] }) });
}
function Filter_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      fill: "currentColor",
      d: "M19 3H5c-1.414 0-2.121 0-2.56.412C2 3.824 2 4.488 2 5.815v.69c0 1.037 0 1.556.26 1.986c.26.43.733.698 1.682 1.232l2.913 1.64c.636.358.955.537 1.183.735c.474.411.766.895.898 1.49c.064.284.064.618.064 1.285v2.67c0 .909 0 1.364.252 1.718c.252.355.7.53 1.594.88c1.879.734 2.818 1.101 3.486.683c.668-.417.668-1.372.668-3.282v-2.67c0-.666 0-1 .064-1.285a2.68 2.68 0 0 1 .899-1.49c.227-.197.546-.376 1.182-.735l2.913-1.64c.948-.533 1.423-.8 1.682-1.23c.26-.43.26-.95.26-1.988v-.69c0-1.326 0-1.99-.44-2.402C21.122 3 20.415 3 19 3"
    }
  ) });
}
function MenuDots_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      fill: "currentColor",
      d: "M7 12a2 2 0 1 1-4 0a2 2 0 0 1 4 0m7 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0m7 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0"
    }
  ) });
}
function Play_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      fill: "currentColor",
      d: "M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"
    }
  ) });
}
function Refresh_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { fill: "none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036c-.01-.003-.019 0-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "M4 9.5A1.5 1.5 0 0 1 5.5 11a5.5 5.5 0 0 0 5.279 5.496L11 16.5h2.382a1.5 1.5 0 0 1 2.065-2.164l.114.103l2.5 2.5a1.494 1.494 0 0 1 .43.89l.009.157v.028a1.49 1.49 0 0 1-.348.947l-.097.105l-2.494 2.495a1.5 1.5 0 0 1-2.272-1.947l.093-.114H11A8.5 8.5 0 0 1 2.5 11A1.5 1.5 0 0 1 4 9.5m4.44-7.06a1.5 1.5 0 0 1 2.27 1.946l-.092.114H13a8.5 8.5 0 0 1 8.5 8.5a1.5 1.5 0 1 1-3 0a5.5 5.5 0 0 0-5.279-5.496L13 7.5h-2.382a1.5 1.5 0 0 1-2.065 2.164L8.44 9.56l-2.5-2.5a1.5 1.5 0 0 1-.103-2.008l.103-.114l2.5-2.5Z"
      }
    )
  ] }) });
}
function Trash_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      fill: "currentColor",
      d: "M2.75 6.167c0-.46.345-.834.771-.834h2.665c.529-.015.996-.378 1.176-.916l.03-.095l.115-.372c.07-.228.131-.427.217-.605c.338-.702.964-1.189 1.687-1.314c.184-.031.377-.031.6-.031h3.478c.223 0 .417 0 .6.031c.723.125 1.35.612 1.687 1.314c.086.178.147.377.217.605l.115.372l.03.095c.18.538.74.902 1.27.916h2.57c.427 0 .772.373.772.834c0 .46-.345.833-.771.833H3.52c-.426 0-.771-.373-.771-.833M11.607 22h.787c2.707 0 4.06 0 4.941-.863c.88-.864.97-2.28 1.15-5.111l.26-4.081c.098-1.537.147-2.305-.295-2.792c-.442-.487-1.187-.487-2.679-.487H8.23c-1.491 0-2.237 0-2.679.487c-.441.487-.392 1.255-.295 2.792l.26 4.08c.18 2.833.27 4.248 1.15 5.112C7.545 22 8.9 22 11.607 22"
    }
  ) });
}
function OpenFolder_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "M16.07 9.952c1.329 0 2.462 0 3.366.102c.154.017.306.038.458.064c.532.09 1.05.235 1.53.488v-.85c0-.91 0-1.663-.085-2.264c-.09-.635-.286-1.197-.756-1.66a3.082 3.082 0 0 0-.241-.214c-.512-.408-1.126-.575-1.82-.652c-.67-.074-1.512-.074-2.545-.074h-.353c-.982 0-1.335-.006-1.653-.087a2.717 2.717 0 0 1-.536-.196c-.285-.14-.532-.351-1.228-.968l-.474-.42a6.91 6.91 0 0 0-.48-.403a4.289 4.289 0 0 0-2.182-.803A8.075 8.075 0 0 0 8.413 2h-.116c-.641 0-1.064 0-1.431.061c-1.605.268-2.903 1.39-3.219 2.875c-.072.337-.071.724-.071 1.283v4.387c.48-.253.998-.399 1.53-.488c.151-.026.304-.047.458-.064c.904-.102 2.037-.102 3.367-.102z"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        fill: "currentColor",
        d: "M3.358 12.779c-.61.941-.358 2.25.145 4.868c.363 1.885.544 2.827 1.172 3.452c.163.163.346.306.544.429C5.982 22 6.995 22 9.022 22h6.956c2.027 0 3.04 0 3.803-.472c.199-.123.38-.266.544-.429c.628-.625.81-1.567 1.172-3.452c.503-2.618.755-3.927.145-4.868a2.937 2.937 0 0 0-.57-.646c-.87-.735-2.279-.735-5.094-.735H9.022c-2.815 0-4.223 0-5.094.735a2.936 2.936 0 0 0-.57.646m6.337 4.402c0-.4.343-.723.765-.723h4.08c.422 0 .765.324.765.723c0 .399-.343.723-.765.723h-4.08c-.422 0-.765-.324-.765-.723"
      }
    )
  ] });
}
function Magnifier_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        opacity: "0.5",
        fill: "currentColor",
        d: "M20.313 11.157a9.157 9.157 0 1 1-18.313 0a9.157 9.157 0 0 1 18.313 0"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "m17.1 18.122l3.666 3.666a.723.723 0 0 0 1.023-1.022L18.122 17.1a9 9 0 0 1-1.022 1.022"
      }
    )
  ] });
}
function Refresh3_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, height: "1em", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "M12.079 2.25c-4.794 0-8.734 3.663-9.118 8.333H2a.75.75 0 0 0-.528 1.283l1.68 1.666a.75.75 0 0 0 1.056 0l1.68-1.666a.75.75 0 0 0-.528-1.283h-.893c.38-3.831 3.638-6.833 7.612-6.833a7.66 7.66 0 0 1 6.537 3.643a.75.75 0 1 0 1.277-.786A9.16 9.16 0 0 0 12.08 2.25"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        opacity: "0.5",
        fill: "currentColor",
        d: "M20.841 10.467a.75.75 0 0 0-1.054 0L18.1 12.133a.75.75 0 0 0 .527 1.284h.899c-.381 3.83-3.651 6.833-7.644 6.833a7.7 7.7 0 0 1-6.565-3.644a.75.75 0 1 0-1.276.788a9.2 9.2 0 0 0 7.84 4.356c4.809 0 8.766-3.66 9.151-8.333H22a.75.75 0 0 0 .527-1.284z"
      }
    )
  ] });
}

const fileChannels = {
  getAppDirectories: "app:getAppDirectories",
  dialog: "app:openDialog",
  openPath: "app:openPath",
  removeDir: "app:removeDir",
  trashDir: "app:trashDir",
  listDir: "app:listDir",
  checkFilesExist: "app:checkFilesExist",
  calcFolderSize: "app:calcFolderSize",
  getRelativePath: "app:getRelativePath",
  getAbsolutePath: "app:getAbsolutePath"
};
const ptyChannels = {
  process: "pty-process",
  customProcess: "pty-custom-process",
  emptyProcess: "pty-custom-process",
  customCommands: "pty-custom-commands",
  write: "pty-write",
  resize: "pty-resize",
  onData: "pty-on-data",
  onTitle: "pty-on-title"
};
const browserChannels = {
  createBrowser: "browser:create-browser",
  removeBrowser: "browser:remove-browser",
  loadURL: "browser:load-url",
  setVisible: "browser:set-visible",
  openFindInPage: "browser:openFindInPage",
  openZoom: "browser:openZoom",
  findInPage: "browser:findInPage",
  stopFindInPage: "browser:stopFindInPage",
  setZoomFactor: "browser:setZoomFactor",
  focusWebView: "browser:focus-webview",
  clearCache: "browser:clear-cache",
  clearCookies: "browser:clear-cookies",
  reload: "browser:reload",
  goBack: "browser:goBack",
  goForward: "browser:goForward",
  onCanGo: "browser:on-can-go",
  isLoading: "browser:is-loading",
  onTitleChange: "browser:on-title-change",
  onFavIconChange: "browser:on-favicon-change",
  onUrlChange: "browser:on-url-change",
  onDomReady: "browser:on-dom-ready",
  getUserAgent: "browser:get-user-agent",
  updateUserAgent: "browser:update-user-agent",
  addOffset: "browser:add-offset"
};

const ipc$1 = window.electron.ipcRenderer;
const rendererIpc = {
  /** Managing files and directories */
  file: {
    openDlg: (option) => ipc$1.invoke(fileChannels.dialog, option),
    openPath: (dir) => ipc$1.send(fileChannels.openPath, dir),
    getAppDirectories: (name) => ipc$1.invoke(fileChannels.getAppDirectories, name),
    removeDir: (dir) => ipc$1.invoke(fileChannels.removeDir, dir),
    trashDir: (dir) => ipc$1.invoke(fileChannels.trashDir, dir),
    listDir: (dirPath, relatives) => ipc$1.invoke(fileChannels.listDir, dirPath, relatives),
    checkFilesExist: (dir, fileNames) => ipc$1.invoke(fileChannels.checkFilesExist, dir, fileNames),
    calcFolderSize: (dir) => ipc$1.invoke(fileChannels.calcFolderSize, dir),
    getRelativePath: (basePath, targetPath) => ipc$1.invoke(fileChannels.getRelativePath, basePath, targetPath),
    getAbsolutePath: (basePath, targetPath) => ipc$1.invoke(fileChannels.getAbsolutePath, basePath, targetPath)
  },
  /** Managing and using node-pty(Pseudo Terminal ) */
  pty: {
    process: (id, opt, cardId) => ipc$1.send(ptyChannels.process, id, opt, cardId),
    customProcess: (id, opt, dir, file) => ipc$1.send(ptyChannels.customProcess, id, opt, dir, file),
    emptyProcess: (id, opt, dir) => ipc$1.send(ptyChannels.emptyProcess, id, opt, dir),
    customCommands: (id, opt, commands, dir) => ipc$1.send(ptyChannels.customCommands, id, opt, commands, dir),
    write: (id, data) => ipc$1.send(ptyChannels.write, id, data),
    resize: (id, cols, rows) => ipc$1.send(ptyChannels.resize, id, cols, rows),
    onData: (result) => ipc$1.on(ptyChannels.onData, result),
    onTitle: (result) => ipc$1.on(ptyChannels.onTitle, result),
    offData: () => ipc$1.removeAllListeners(ptyChannels.onData),
    offTitle: () => ipc$1.removeAllListeners(ptyChannels.onTitle)
  },
  browser: {
    createBrowser: (id) => ipc$1.send(browserChannels.createBrowser, id),
    removeBrowser: (id) => ipc$1.send(browserChannels.removeBrowser, id),
    loadURL: (id, url) => ipc$1.send(browserChannels.loadURL, id, url),
    setVisible: (id, visible) => ipc$1.send(browserChannels.setVisible, id, visible),
    openFindInPage: (id, customPosition) => ipc$1.send(browserChannels.openFindInPage, id, customPosition),
    openZoom: (id) => ipc$1.send(browserChannels.openZoom, id),
    findInPage: (id, value, options) => ipc$1.send(browserChannels.findInPage, id, value, options),
    stopFindInPage: (id, action) => ipc$1.send(browserChannels.stopFindInPage, id, action),
    focusWebView: (id) => ipc$1.send(browserChannels.focusWebView, id),
    clearCache: () => ipc$1.send(browserChannels.clearCache),
    clearCookies: () => ipc$1.send(browserChannels.clearCookies),
    setZoomFactor: (id, factor) => ipc$1.send(browserChannels.setZoomFactor, id, factor),
    reload: (id) => ipc$1.send(browserChannels.reload, id),
    goBack: (id) => ipc$1.send(browserChannels.goBack, id),
    goForward: (id) => ipc$1.send(browserChannels.goForward, id),
    onCanGo: (result) => ipc$1.on(browserChannels.onCanGo, result),
    offCanGo: () => ipc$1.removeAllListeners(browserChannels.onCanGo),
    onIsLoading: (result) => ipc$1.on(browserChannels.isLoading, result),
    offIsLoading: () => ipc$1.removeAllListeners(browserChannels.isLoading),
    onTitleChange: (result) => ipc$1.on(browserChannels.onTitleChange, result),
    offTitleChange: () => ipc$1.removeAllListeners(browserChannels.onTitleChange),
    onFavIconChange: (result) => ipc$1.on(browserChannels.onFavIconChange, result),
    offFavIconChange: () => ipc$1.removeAllListeners(browserChannels.onFavIconChange),
    onUrlChange: (result) => ipc$1.on(browserChannels.onUrlChange, result),
    offUrlChange: () => ipc$1.removeAllListeners(browserChannels.onUrlChange),
    onDomReady: (result) => ipc$1.on(browserChannels.onDomReady, result),
    offDomReady: () => ipc$1.removeAllListeners(browserChannels.onDomReady),
    getUserAgent: (type) => ipc$1.invoke(browserChannels.getUserAgent, type),
    updateUserAgent: () => ipc$1.send(browserChannels.updateUserAgent),
    addOffset: (id, offset) => ipc$1.send(browserChannels.addOffset, id, offset)
  }
};

const {includes} = await importShared('lodash');

const {useSelector: useSelector$3} = await importShared('react-redux');
const initialState$3 = {
  autoUpdate: [],
  installedCards: [],
  pinnedCards: [],
  updateAvailable: [],
  updatingCards: [],
  runningCard: [],
  recentlyUsedCards: [],
  homeCategory: [],
  autoUpdateExtensions: [],
  updatingExtensions: void 0,
  duplicates: [],
  checkUpdateInterval: 30,
  activeTab: ""
};
createSlice({
  initialState: initialState$3,
  name: "cards",
  reducers: {
    addUpdateAvailable: (state, action) => {
      if (!includes(state.updateAvailable, action.payload)) {
        state.updateAvailable = [...state.updateAvailable, action.payload];
      }
    },
    setUpdateAvailable: (state, action) => {
      state.updateAvailable = action.payload;
    },
    removeUpdateAvailable: (state, action) => {
      state.updateAvailable = state.updateAvailable.filter((card) => card !== action.payload);
    },
    setUpdatingExtensions: (state, action) => {
      state.updatingExtensions = action.payload;
    },
    setUpdateInterval: (state, action) => {
      state.checkUpdateInterval = action.payload;
    },
    addUpdatingCard: (state, action) => {
      if (!includes(state.updatingCards, action.payload)) {
        state.updatingCards = [...state.updatingCards, action.payload];
      }
    },
    removeUpdatingCard: (state, action) => {
      const cardId = action.payload;
      state.updatingCards = state.updatingCards.filter((card) => card.id !== cardId);
    },
    setAutoUpdate: (state, action) => {
      state.autoUpdate = action.payload;
    },
    setAutoUpdateExtensions: (state, action) => {
      state.autoUpdateExtensions = action.payload;
    },
    setInstalledCards: (state, action) => {
      state.installedCards = action.payload;
    },
    setPinnedCards: (state, action) => {
      state.pinnedCards = action.payload;
    },
    setHomeCategory: (state, action) => {
      state.homeCategory = action.payload;
    },
    setRecentlyUsedCards: (state, action) => {
      state.recentlyUsedCards = action.payload;
    },
    setDuplicates: (state, action) => {
      state.duplicates = action.payload;
    },
    addRunningEmpty: (state, action) => {
      const { tabId, type } = action.payload;
      const id = `${tabId}_${type}`;
      const currentView = type === "browser" ? "browser" : "terminal";
      state.runningCard = [
        ...state.runningCard,
        {
          tabId,
          type,
          id,
          currentView,
          webUIAddress: "",
          customAddress: "",
          currentAddress: "",
          browserTitle: "Browser",
          startTime: (/* @__PURE__ */ new Date()).toString(),
          isEmptyRunning: true
        }
      ];
      if (type !== "terminal") rendererIpc.browser.createBrowser(id);
      if (type !== "browser") rendererIpc.pty.emptyProcess(id, "start");
    },
    addRunningCard: (state, action) => {
      const { tabId, id } = action.payload;
      state.runningCard = [
        ...state.runningCard,
        {
          tabId,
          id,
          type: "both",
          webUIAddress: "",
          customAddress: "",
          currentAddress: "",
          browserTitle: "Browser",
          currentView: "terminal",
          startTime: (/* @__PURE__ */ new Date()).toString(),
          isEmptyRunning: false
        }
      ];
      rendererIpc.browser.createBrowser(id);
    },
    setRunningCardAddress: (state, action) => {
      const { tabId, address } = action.payload;
      state.runningCard = state.runningCard.map(
        (card) => card.tabId === tabId ? {
          ...card,
          webUIAddress: address
        } : card
      );
    },
    setRunningCardCustomAddress: (state, action) => {
      const { tabId, address } = action.payload;
      state.runningCard = state.runningCard.map(
        (card) => card.tabId === tabId ? {
          ...card,
          customAddress: address
        } : card
      );
    },
    setRunningCardCurrentAddress: (state, action) => {
      const { tabId, address } = action.payload;
      state.runningCard = state.runningCard.map(
        (card) => card.tabId === tabId ? {
          ...card,
          currentAddress: address
        } : card
      );
    },
    setRunningCardView: (state, action) => {
      const { tabId, view } = action.payload;
      state.runningCard = state.runningCard.map((card) => card.tabId === tabId ? { ...card, currentView: view } : card);
    },
    setRunningCardBrowserTitle: (state, action) => {
      const { tabId, title } = action.payload;
      state.runningCard = state.runningCard.map((card) => card.tabId === tabId ? { ...card, browserTitle: title } : card);
    },
    toggleRunningCardView: (state, action) => {
      if (!state.runningCard) return;
      const { tabId } = action.payload;
      state.runningCard = state.runningCard.map((card) => {
        const currentView = card.currentView === "browser" ? "terminal" : "browser";
        return card.tabId === tabId ? { ...card, currentView } : card;
      });
    },
    stopRunningCard: (state, action) => {
      const id = state.runningCard.find((card) => card.tabId === action.payload.tabId)?.id;
      if (id) rendererIpc.browser.removeBrowser(id);
      state.runningCard = state.runningCard.filter((card) => card.tabId !== action.payload.tabId);
    }
  }
});
const useCardsState = (name) => useSelector$3((state) => state.cards[name]);

function formatSize(size) {
  if (!size) return "0KB";
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

const {addToast} = await importShared('@heroui/react');

const {isEmpty: isEmpty$g,isNil: isNil$5} = await importShared('lodash');

const {Fragment,useMemo: useMemo$b} = await importShared('react');
function useInstalledCard(cardId) {
  const installedCards = useCardsState("installedCards");
  return useMemo$b(() => installedCards.find((card) => card.id === cardId), [installedCards, cardId]);
}

/** Detect free variable `global` from Node.js. */

var _freeGlobal;
var hasRequired_freeGlobal;

function require_freeGlobal () {
	if (hasRequired_freeGlobal) return _freeGlobal;
	hasRequired_freeGlobal = 1;
	var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

	_freeGlobal = freeGlobal;
	return _freeGlobal;
}

var _root;
var hasRequired_root;

function require_root () {
	if (hasRequired_root) return _root;
	hasRequired_root = 1;
	var freeGlobal = /*@__PURE__*/ require_freeGlobal();

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	_root = root;
	return _root;
}

var _Symbol;
var hasRequired_Symbol;

function require_Symbol () {
	if (hasRequired_Symbol) return _Symbol;
	hasRequired_Symbol = 1;
	var root = /*@__PURE__*/ require_root();

	/** Built-in value references. */
	var Symbol = root.Symbol;

	_Symbol = Symbol;
	return _Symbol;
}

var _getRawTag;
var hasRequired_getRawTag;

function require_getRawTag () {
	if (hasRequired_getRawTag) return _getRawTag;
	hasRequired_getRawTag = 1;
	var Symbol = /*@__PURE__*/ require_Symbol();

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	      tag = value[symToStringTag];

	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}

	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}

	_getRawTag = getRawTag;
	return _getRawTag;
}

/** Used for built-in method references. */

var _objectToString;
var hasRequired_objectToString;

function require_objectToString () {
	if (hasRequired_objectToString) return _objectToString;
	hasRequired_objectToString = 1;
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString.call(value);
	}

	_objectToString = objectToString;
	return _objectToString;
}

var _baseGetTag;
var hasRequired_baseGetTag;

function require_baseGetTag () {
	if (hasRequired_baseGetTag) return _baseGetTag;
	hasRequired_baseGetTag = 1;
	var Symbol = /*@__PURE__*/ require_Symbol(),
	    getRawTag = /*@__PURE__*/ require_getRawTag(),
	    objectToString = /*@__PURE__*/ require_objectToString();

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag && symToStringTag in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}

	_baseGetTag = baseGetTag;
	return _baseGetTag;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */

var isObjectLike_1;
var hasRequiredIsObjectLike;

function requireIsObjectLike () {
	if (hasRequiredIsObjectLike) return isObjectLike_1;
	hasRequiredIsObjectLike = 1;
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}

	isObjectLike_1 = isObjectLike;
	return isObjectLike_1;
}

var isBoolean_1;
var hasRequiredIsBoolean;

function requireIsBoolean () {
	if (hasRequiredIsBoolean) return isBoolean_1;
	hasRequiredIsBoolean = 1;
	var baseGetTag = /*@__PURE__*/ require_baseGetTag(),
	    isObjectLike = /*@__PURE__*/ requireIsObjectLike();

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]';

	/**
	 * Checks if `value` is classified as a boolean primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
	 * @example
	 *
	 * _.isBoolean(false);
	 * // => true
	 *
	 * _.isBoolean(null);
	 * // => false
	 */
	function isBoolean(value) {
	  return value === true || value === false ||
	    (isObjectLike(value) && baseGetTag(value) == boolTag);
	}

	isBoolean_1 = isBoolean;
	return isBoolean_1;
}

var isBooleanExports = /*@__PURE__*/ requireIsBoolean();
const isBoolean$1 = /*@__PURE__*/getDefaultExportFromCjs(isBooleanExports);

const {useSelector: useSelector$2} = await importShared('react-redux');

const initialState$2 = {
  darkMode: true,
  fullscreen: false,
  isOnline: false,
  maximized: false,
  onFocus: true,
  navBar: true,
  appTitle: void 0
};
createSlice({
  name: "app",
  initialState: initialState$2,
  reducers: {
    setAppState: (state, action) => {
      state[action.payload.key] = action.payload.value;
    },
    setAppTitle: (state, action) => {
      state.appTitle = action.payload;
    },
    toggleAppState: (state, action) => {
      const key = action.payload;
      if (isBoolean$1(state[key])) {
        state[key] = !state[key];
      }
    }
  }
});
const useAppState = (key) => useSelector$2((state) => state.app[key]);

const {isEmpty: isEmpty$f} = await importShared('lodash');
function convertBlobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
function searchInStrings(searchText, targetTexts) {
  if (isEmpty$f(searchText) || !targetTexts) return true;
  const searchWords = searchText.toLowerCase().split(/\s+/);
  const lowerTargetTexts = targetTexts.filter(Boolean).map((text) => text.toLowerCase());
  return searchWords.every((word) => lowerTargetTexts.some((text) => text.includes(word)));
}

/*!
 * OverlayScrollbars
 * Version: 2.11.4
 *
 * Copyright (c) Rene Haas | KingSora.
 * https://github.com/KingSora
 *
 * Released under the MIT license.
 */
const createCache = (t, n) => {
  const {o: o, i: s, u: e} = t;
  let c = o;
  let r;
  const cacheUpdateContextual = (t, n) => {
    const o = c;
    const i = t;
    const l = n || (s ? !s(o, i) : o !== i);
    if (l || e) {
      c = i;
      r = o;
    }
    return [ c, l, r ];
  };
  const cacheUpdateIsolated = t => cacheUpdateContextual(n(c, r), t);
  const getCurrentCache = t => [ c, !!t, r ];
  return [ n ? cacheUpdateIsolated : cacheUpdateContextual, getCurrentCache ];
};

const t = typeof window !== "undefined" && typeof HTMLElement !== "undefined" && !!window.document;

const n = t ? window : {};

const o = Math.max;

const s = Math.min;

const e = Math.round;

const c = Math.abs;

const r = Math.sign;

const i = n.cancelAnimationFrame;

const l = n.requestAnimationFrame;

const a = n.setTimeout;

const u = n.clearTimeout;

const getApi = t => typeof n[t] !== "undefined" ? n[t] : void 0;

const f = getApi("MutationObserver");

const _ = getApi("IntersectionObserver");

const d$1 = getApi("ResizeObserver");

const p$1 = getApi("ScrollTimeline");

const isUndefined = t => t === void 0;

const isNull = t => t === null;

const isNumber = t => typeof t === "number";

const isString = t => typeof t === "string";

const isBoolean = t => typeof t === "boolean";

const isFunction = t => typeof t === "function";

const isArray = t => Array.isArray(t);

const isObject = t => typeof t === "object" && !isArray(t) && !isNull(t);

const isArrayLike = t => {
  const n = !!t && t.length;
  const o = isNumber(n) && n > -1 && n % 1 == 0;
  return isArray(t) || !isFunction(t) && o ? n > 0 && isObject(t) ? n - 1 in t : true : false;
};

const isPlainObject = t => !!t && t.constructor === Object;

const isHTMLElement = t => t instanceof HTMLElement;

const isElement = t => t instanceof Element;

function each(t, n) {
  if (isArrayLike(t)) {
    for (let o = 0; o < t.length; o++) {
      if (n(t[o], o, t) === false) {
        break;
      }
    }
  } else if (t) {
    each(Object.keys(t), (o => n(t[o], o, t)));
  }
  return t;
}

const inArray = (t, n) => t.indexOf(n) >= 0;

const concat = (t, n) => t.concat(n);

const push = (t, n, o) => {
  if (!isString(n) && isArrayLike(n)) {
    Array.prototype.push.apply(t, n);
  } else {
    t.push(n);
  }
  return t;
};

const from = t => Array.from(t || []);

const createOrKeepArray = t => {
  if (isArray(t)) {
    return t;
  }
  return !isString(t) && isArrayLike(t) ? from(t) : [ t ];
};

const isEmptyArray = t => !!t && !t.length;

const deduplicateArray = t => from(new Set(t));

const runEachAndClear = (t, n, o) => {
  const runFn = t => t ? t.apply(void 0, n || []) : true;
  each(t, runFn);
  if (!o) {
    t.length = 0;
  }
};

const v = "paddingTop";

const g$1 = "paddingRight";

const h = "paddingLeft";

const b = "paddingBottom";

const w$1 = "marginLeft";

const y = "marginRight";

const S$1 = "marginBottom";

const m = "overflowX";

const O$1 = "overflowY";

const $ = "width";

const C$1 = "height";

const x = "visible";

const H = "hidden";

const E$1 = "scroll";

const capitalizeFirstLetter = t => {
  const n = String(t || "");
  return n ? n[0].toUpperCase() + n.slice(1) : "";
};

const equal = (t, n, o, s) => {
  if (t && n) {
    let s = true;
    each(o, (o => {
      const e = t[o];
      const c = n[o];
      if (e !== c) {
        s = false;
      }
    }));
    return s;
  }
  return false;
};

const equalWH = (t, n) => equal(t, n, [ "w", "h" ]);

const equalXY = (t, n) => equal(t, n, [ "x", "y" ]);

const equalTRBL = (t, n) => equal(t, n, [ "t", "r", "b", "l" ]);

const bind = (t, ...n) => t.bind(0, ...n);

const selfClearTimeout = t => {
  let n;
  const o = t ? a : l;
  const s = t ? u : i;
  return [ e => {
    s(n);
    n = o((() => e()), isFunction(t) ? t() : t);
  }, () => s(n) ];
};

const getDebouncer = t => {
  const n = isFunction(t) ? t() : t;
  if (isNumber(n)) {
    const t = n ? a : l;
    const o = n ? u : i;
    return s => {
      const e = t((() => s()), n);
      return () => {
        o(e);
      };
    };
  }
  return n && n._;
};

const debounce = (t, n) => {
  const {p: o, v: s, S: e, m: c} = n || {};
  let r;
  let i;
  let l;
  let a;
  let u;
  const f = function invokeFunctionToDebounce(n) {
    if (i) {
      i();
    }
    if (r) {
      r();
    }
    u = i = r = l = void 0;
    t.apply(this, n);
  };
  const mergeParms = t => c && l ? c(l, t) : t;
  const flush = () => {
    if (i) {
      f(mergeParms(a) || a);
    }
  };
  const _ = function debouncedFn() {
    const t = from(arguments);
    const n = getDebouncer(o);
    if (n) {
      const o = getDebouncer(s);
      const c = mergeParms(t);
      const _ = c || t;
      const d = f.bind(0, _);
      if (i) {
        i();
      }
      if (e && !u) {
        d();
        u = true;
        i = n((() => u = void 0));
      } else {
        i = n(d);
        if (o && !r) {
          r = o(flush);
        }
      }
      l = a = _;
    } else {
      f(t);
    }
  };
  _.O = flush;
  return _;
};

const hasOwnProperty = (t, n) => Object.prototype.hasOwnProperty.call(t, n);

const keys = t => t ? Object.keys(t) : [];

const assignDeep = (t, n, o, s, e, c, r) => {
  const i = [ n, o, s, e, c, r ];
  if ((typeof t !== "object" || isNull(t)) && !isFunction(t)) {
    t = {};
  }
  each(i, (n => {
    each(n, ((o, s) => {
      const e = n[s];
      if (t === e) {
        return true;
      }
      const c = isArray(e);
      if (e && isPlainObject(e)) {
        const n = t[s];
        let o = n;
        if (c && !isArray(n)) {
          o = [];
        } else if (!c && !isPlainObject(n)) {
          o = {};
        }
        t[s] = assignDeep(o, e);
      } else {
        t[s] = c ? e.slice() : e;
      }
    }));
  }));
  return t;
};

const removeUndefinedProperties = (t, n) => each(assignDeep({}, t), ((t, n, o) => {
  if (t === void 0) {
    delete o[n];
  } else if (t && isPlainObject(t)) {
    o[n] = removeUndefinedProperties(t);
  }
}));

const isEmptyObject = t => !keys(t).length;

const noop = () => {};

const capNumber = (t, n, e) => o(t, s(n, e));

const getDomTokensArray = t => deduplicateArray((isArray(t) ? t : (t || "").split(" ")).filter((t => t)));

const getAttr = (t, n) => t && t.getAttribute(n);

const hasAttr = (t, n) => t && t.hasAttribute(n);

const setAttrs = (t, n, o) => {
  each(getDomTokensArray(n), (n => {
    if (t) {
      t.setAttribute(n, String(o || ""));
    }
  }));
};

const removeAttrs = (t, n) => {
  each(getDomTokensArray(n), (n => t && t.removeAttribute(n)));
};

const domTokenListAttr = (t, n) => {
  const o = getDomTokensArray(getAttr(t, n));
  const s = bind(setAttrs, t, n);
  const domTokenListOperation = (t, n) => {
    const s = new Set(o);
    each(getDomTokensArray(t), (t => {
      s[n](t);
    }));
    return from(s).join(" ");
  };
  return {
    $: t => s(domTokenListOperation(t, "delete")),
    C: t => s(domTokenListOperation(t, "add")),
    H: t => {
      const n = getDomTokensArray(t);
      return n.reduce(((t, n) => t && o.includes(n)), n.length > 0);
    }
  };
};

const removeAttrClass = (t, n, o) => {
  domTokenListAttr(t, n).$(o);
  return bind(addAttrClass, t, n, o);
};

const addAttrClass = (t, n, o) => {
  domTokenListAttr(t, n).C(o);
  return bind(removeAttrClass, t, n, o);
};

const addRemoveAttrClass = (t, n, o, s) => (s ? addAttrClass : removeAttrClass)(t, n, o);

const hasAttrClass = (t, n, o) => domTokenListAttr(t, n).H(o);

const createDomTokenListClass = t => domTokenListAttr(t, "class");

const removeClass = (t, n) => {
  createDomTokenListClass(t).$(n);
};

const addClass = (t, n) => {
  createDomTokenListClass(t).C(n);
  return bind(removeClass, t, n);
};

const find = (t, n) => {
  const o = n ? isElement(n) && n : document;
  return o ? from(o.querySelectorAll(t)) : [];
};

const findFirst = (t, n) => {
  const o = n ? isElement(n) && n : document;
  return o && o.querySelector(t);
};

const is = (t, n) => isElement(t) && t.matches(n);

const isBodyElement = t => is(t, "body");

const contents = t => t ? from(t.childNodes) : [];

const parent = t => t && t.parentElement;

const closest = (t, n) => isElement(t) && t.closest(n);

const getFocusedElement = t => document.activeElement;

const liesBetween = (t, n, o) => {
  const s = closest(t, n);
  const e = t && findFirst(o, s);
  const c = closest(e, n) === s;
  return s && e ? s === t || e === t || c && closest(closest(t, o), n) !== s : false;
};

const removeElements = t => {
  each(createOrKeepArray(t), (t => {
    const n = parent(t);
    if (t && n) {
      n.removeChild(t);
    }
  }));
};

const appendChildren = (t, n) => bind(removeElements, t && n && each(createOrKeepArray(n), (n => {
  if (n) {
    t.appendChild(n);
  }
})));

let z;

const getTrustedTypePolicy = () => z;

const setTrustedTypePolicy = t => {
  z = t;
};

const createDiv = t => {
  const n = document.createElement("div");
  setAttrs(n, "class", t);
  return n;
};

const createDOM = t => {
  const n = createDiv();
  const o = getTrustedTypePolicy();
  const s = t.trim();
  n.innerHTML = o ? o.createHTML(s) : s;
  return each(contents(n), (t => removeElements(t)));
};

const getCSSVal = (t, n) => t.getPropertyValue(n) || t[n] || "";

const validFiniteNumber = t => {
  const n = t || 0;
  return isFinite(n) ? n : 0;
};

const parseToZeroOrNumber = t => validFiniteNumber(parseFloat(t || ""));

const roundCssNumber = t => Math.round(t * 1e4) / 1e4;

const numberToCssPx = t => `${roundCssNumber(validFiniteNumber(t))}px`;

function setStyles(t, n) {
  t && n && each(n, ((n, o) => {
    try {
      const s = t.style;
      const e = isNull(n) || isBoolean(n) ? "" : isNumber(n) ? numberToCssPx(n) : n;
      if (o.indexOf("--") === 0) {
        s.setProperty(o, e);
      } else {
        s[o] = e;
      }
    } catch (s) {}
  }));
}

function getStyles(t, o, s) {
  const e = isString(o);
  let c = e ? "" : {};
  if (t) {
    const r = n.getComputedStyle(t, s) || t.style;
    c = e ? getCSSVal(r, o) : from(o).reduce(((t, n) => {
      t[n] = getCSSVal(r, n);
      return t;
    }), c);
  }
  return c;
}

const topRightBottomLeft = (t, n, o) => {
  const s = n ? `${n}-` : "";
  const e = o ? `-${o}` : "";
  const c = `${s}top${e}`;
  const r = `${s}right${e}`;
  const i = `${s}bottom${e}`;
  const l = `${s}left${e}`;
  const a = getStyles(t, [ c, r, i, l ]);
  return {
    t: parseToZeroOrNumber(a[c]),
    r: parseToZeroOrNumber(a[r]),
    b: parseToZeroOrNumber(a[i]),
    l: parseToZeroOrNumber(a[l])
  };
};

const getTrasformTranslateValue = (t, n) => `translate${isObject(t) ? `(${t.x},${t.y})` : `${n ? "X" : "Y"}(${t})`}`;

const elementHasDimensions = t => !!(t.offsetWidth || t.offsetHeight || t.getClientRects().length);

const T = {
  w: 0,
  h: 0
};

const getElmWidthHeightProperty = (t, n) => n ? {
  w: n[`${t}Width`],
  h: n[`${t}Height`]
} : T;

const getWindowSize = t => getElmWidthHeightProperty("inner", t || n);

const I = bind(getElmWidthHeightProperty, "offset");

const A = bind(getElmWidthHeightProperty, "client");

const D = bind(getElmWidthHeightProperty, "scroll");

const getFractionalSize = t => {
  const n = parseFloat(getStyles(t, $)) || 0;
  const o = parseFloat(getStyles(t, C$1)) || 0;
  return {
    w: n - e(n),
    h: o - e(o)
  };
};

const getBoundingClientRect = t => t.getBoundingClientRect();

const hasDimensions = t => !!t && elementHasDimensions(t);

const domRectHasDimensions = t => !!(t && (t[C$1] || t[$]));

const domRectAppeared = (t, n) => {
  const o = domRectHasDimensions(t);
  const s = domRectHasDimensions(n);
  return !s && o;
};

const removeEventListener = (t, n, o, s) => {
  each(getDomTokensArray(n), (n => {
    if (t) {
      t.removeEventListener(n, o, s);
    }
  }));
};

const addEventListener = (t, n, o, s) => {
  var e;
  const c = (e = s && s.T) != null ? e : true;
  const r = s && s.I || false;
  const i = s && s.A || false;
  const l = {
    passive: c,
    capture: r
  };
  return bind(runEachAndClear, getDomTokensArray(n).map((n => {
    const s = i ? e => {
      removeEventListener(t, n, s, r);
      if (o) {
        o(e);
      }
    } : o;
    if (t) {
      t.addEventListener(n, s, l);
    }
    return bind(removeEventListener, t, n, s, r);
  })));
};

const stopPropagation = t => t.stopPropagation();

const preventDefault = t => t.preventDefault();

const stopAndPrevent = t => stopPropagation(t) || preventDefault(t);

const scrollElementTo = (t, n) => {
  const {x: o, y: s} = isNumber(n) ? {
    x: n,
    y: n
  } : n || {};
  isNumber(o) && (t.scrollLeft = o);
  isNumber(s) && (t.scrollTop = s);
};

const getElementScroll = t => ({
  x: t.scrollLeft,
  y: t.scrollTop
});

const getZeroScrollCoordinates = () => ({
  D: {
    x: 0,
    y: 0
  },
  M: {
    x: 0,
    y: 0
  }
});

const sanitizeScrollCoordinates = (t, n) => {
  const {D: o, M: s} = t;
  const {w: e, h: i} = n;
  const sanitizeAxis = (t, n, o) => {
    let s = r(t) * o;
    let e = r(n) * o;
    if (s === e) {
      const o = c(t);
      const r = c(n);
      e = o > r ? 0 : e;
      s = o < r ? 0 : s;
    }
    s = s === e ? 0 : s;
    return [ s + 0, e + 0 ];
  };
  const [l, a] = sanitizeAxis(o.x, s.x, e);
  const [u, f] = sanitizeAxis(o.y, s.y, i);
  return {
    D: {
      x: l,
      y: u
    },
    M: {
      x: a,
      y: f
    }
  };
};

const isDefaultDirectionScrollCoordinates = ({D: t, M: n}) => {
  const getAxis = (t, n) => t === 0 && t <= n;
  return {
    x: getAxis(t.x, n.x),
    y: getAxis(t.y, n.y)
  };
};

const getScrollCoordinatesPercent = ({D: t, M: n}, o) => {
  const getAxis = (t, n, o) => capNumber(0, 1, (t - o) / (t - n) || 0);
  return {
    x: getAxis(t.x, n.x, o.x),
    y: getAxis(t.y, n.y, o.y)
  };
};

const focusElement = t => {
  if (t && t.focus) {
    t.focus({
      preventScroll: true
    });
  }
};

const manageListener = (t, n) => {
  each(createOrKeepArray(n), t);
};

const createEventListenerHub = t => {
  const n = new Map;
  const removeEvent = (t, o) => {
    if (t) {
      const s = n.get(t);
      manageListener((t => {
        if (s) {
          s[t ? "delete" : "clear"](t);
        }
      }), o);
    } else {
      n.forEach((t => {
        t.clear();
      }));
      n.clear();
    }
  };
  const addEvent = (t, o) => {
    if (isString(t)) {
      const s = n.get(t) || new Set;
      n.set(t, s);
      manageListener((t => {
        if (isFunction(t)) {
          s.add(t);
        }
      }), o);
      return bind(removeEvent, t, o);
    }
    if (isBoolean(o) && o) {
      removeEvent();
    }
    const s = keys(t);
    const e = [];
    each(s, (n => {
      const o = t[n];
      if (o) {
        push(e, addEvent(n, o));
      }
    }));
    return bind(runEachAndClear, e);
  };
  const triggerEvent = (t, o) => {
    each(from(n.get(t)), (t => {
      if (o && !isEmptyArray(o)) {
        t.apply(0, o);
      } else {
        t();
      }
    }));
  };
  addEvent(t || {});
  return [ addEvent, removeEvent, triggerEvent ];
};

const M = {};

const k = {};

const addPlugins = t => {
  each(t, (t => each(t, ((n, o) => {
    M[o] = t[o];
  }))));
};

const registerPluginModuleInstances = (t, n, o) => keys(t).map((s => {
  const {static: e, instance: c} = t[s];
  const [r, i, l] = o || [];
  const a = o ? c : e;
  if (a) {
    const t = o ? a(r, i, n) : a(n);
    return (l || k)[s] = t;
  }
}));

const getStaticPluginModuleInstance = t => k[t];

const R = "__osOptionsValidationPlugin";

const V = `data-overlayscrollbars`;

const L = "os-environment";

const U = `${L}-scrollbar-hidden`;

const P = `${V}-initialize`;

const N = "noClipping";

const q$1 = `${V}-body`;

const B = V;

const F$1 = "host";

const j = `${V}-viewport`;

const X = m;

const Y = O$1;

const W = "arrange";

const J = "measuring";

const G = "scrolling";

const K = "scrollbarHidden";

const Q = "noContent";

const Z = `${V}-padding`;

const tt = `${V}-content`;

const nt = "os-size-observer";

const ot = `${nt}-appear`;

const st = `${nt}-listener`;

const it = "os-trinsic-observer";

const lt = "os-theme-none";

const at = "os-scrollbar";

const ut = `${at}-rtl`;

const ft = `${at}-horizontal`;

const _t = `${at}-vertical`;

const dt = `${at}-track`;

const pt = `${at}-handle`;

const vt = `${at}-visible`;

const gt = `${at}-cornerless`;

const ht = `${at}-interaction`;

const bt = `${at}-unusable`;

const wt = `${at}-auto-hide`;

const yt = `${wt}-hidden`;

const St = `${at}-wheel`;

const mt = `${dt}-interactive`;

const Ot = `${pt}-interactive`;

const $t = "__osSizeObserverPlugin";

const getShowNativeOverlaidScrollbars = (t, n) => {
  const {k: o} = n;
  const [s, e] = t("showNativeOverlaidScrollbars");
  return [ s && o.x && o.y, e ];
};

const overflowIsVisible = t => t.indexOf(x) === 0;

const overflowBehaviorToOverflowStyle = t => t.replace(`${x}-`, "");

const overflowCssValueToOverflowStyle = (t, n) => {
  if (t === "auto") {
    return n ? E$1 : H;
  }
  const o = t || H;
  return [ H, E$1, x ].includes(o) ? o : H;
};

const getElementOverflowStyle = (t, n) => {
  const {overflowX: o, overflowY: s} = getStyles(t, [ m, O$1 ]);
  return {
    x: overflowCssValueToOverflowStyle(o, n.x),
    y: overflowCssValueToOverflowStyle(s, n.y)
  };
};

const xt = "__osScrollbarsHidingPlugin";

const Et = "__osClickScrollPlugin";

const opsStringify = t => JSON.stringify(t, ((t, n) => {
  if (isFunction(n)) {
    throw 0;
  }
  return n;
}));

const getPropByPath = (t, n) => t ? `${n}`.split(".").reduce(((t, n) => t && hasOwnProperty(t, n) ? t[n] : void 0), t) : void 0;

const Tt = {
  paddingAbsolute: false,
  showNativeOverlaidScrollbars: false,
  update: {
    elementEvents: [ [ "img", "load" ] ],
    debounce: [ 0, 33 ],
    attributes: null,
    ignoreMutation: null
  },
  overflow: {
    x: "scroll",
    y: "scroll"
  },
  scrollbars: {
    theme: "os-theme-dark",
    visibility: "auto",
    autoHide: "never",
    autoHideDelay: 1300,
    autoHideSuspend: false,
    dragScroll: true,
    clickScroll: false,
    pointers: [ "mouse", "touch", "pen" ]
  }
};

const getOptionsDiff = (t, n) => {
  const o = {};
  const s = concat(keys(n), keys(t));
  each(s, (s => {
    const e = t[s];
    const c = n[s];
    if (isObject(e) && isObject(c)) {
      assignDeep(o[s] = {}, getOptionsDiff(e, c));
      if (isEmptyObject(o[s])) {
        delete o[s];
      }
    } else if (hasOwnProperty(n, s) && c !== e) {
      let t = true;
      if (isArray(e) || isArray(c)) {
        try {
          if (opsStringify(e) === opsStringify(c)) {
            t = false;
          }
        } catch (r) {}
      }
      if (t) {
        o[s] = c;
      }
    }
  }));
  return o;
};

const createOptionCheck = (t, n, o) => s => [ getPropByPath(t, s), o || getPropByPath(n, s) !== void 0 ];

let It;

const getNonce = () => It;

const setNonce = t => {
  It = t;
};

let At;

const createEnvironment = () => {
  const getNativeScrollbarSize = (t, n, o) => {
    appendChildren(document.body, t);
    appendChildren(document.body, t);
    const s = A(t);
    const e = I(t);
    const c = getFractionalSize(n);
    if (o) {
      removeElements(t);
    }
    return {
      x: e.h - s.h + c.h,
      y: e.w - s.w + c.w
    };
  };
  const getNativeScrollbarsHiding = t => {
    let n = false;
    const o = addClass(t, U);
    try {
      n = getStyles(t, "scrollbar-width") === "none" || getStyles(t, "display", "::-webkit-scrollbar") === "none";
    } catch (s) {}
    o();
    return n;
  };
  const t = `.${L}{scroll-behavior:auto!important;position:fixed;opacity:0;visibility:hidden;overflow:scroll;height:200px;width:200px;z-index:-1}.${L} div{width:200%;height:200%;margin:10px 0}.${U}{scrollbar-width:none!important}.${U}::-webkit-scrollbar,.${U}::-webkit-scrollbar-corner{appearance:none!important;display:none!important;width:0!important;height:0!important}`;
  const o = createDOM(`<div class="${L}"><div></div><style>${t}</style></div>`);
  const s = o[0];
  const e = s.firstChild;
  const c = s.lastChild;
  const r = getNonce();
  if (r) {
    c.nonce = r;
  }
  const [i, , l] = createEventListenerHub();
  const [a, u] = createCache({
    o: getNativeScrollbarSize(s, e),
    i: equalXY
  }, bind(getNativeScrollbarSize, s, e, true));
  const [f] = u();
  const _ = getNativeScrollbarsHiding(s);
  const d = {
    x: f.x === 0,
    y: f.y === 0
  };
  const v = {
    elements: {
      host: null,
      padding: !_,
      viewport: t => _ && isBodyElement(t) && t,
      content: false
    },
    scrollbars: {
      slot: true
    },
    cancel: {
      nativeScrollbarsOverlaid: false,
      body: null
    }
  };
  const g = assignDeep({}, Tt);
  const h = bind(assignDeep, {}, g);
  const b = bind(assignDeep, {}, v);
  const w = {
    P: f,
    k: d,
    U: _,
    J: !!p$1,
    G: bind(i, "r"),
    K: b,
    Z: t => assignDeep(v, t) && b(),
    tt: h,
    nt: t => assignDeep(g, t) && h(),
    ot: assignDeep({}, v),
    st: assignDeep({}, g)
  };
  removeAttrs(s, "style");
  removeElements(s);
  addEventListener(n, "resize", (() => {
    l("r", []);
  }));
  if (isFunction(n.matchMedia) && !_ && (!d.x || !d.y)) {
    const addZoomListener = t => {
      const o = n.matchMedia(`(resolution: ${n.devicePixelRatio}dppx)`);
      addEventListener(o, "change", (() => {
        t();
        addZoomListener(t);
      }), {
        A: true
      });
    };
    addZoomListener((() => {
      const [t, n] = a();
      assignDeep(w.P, t);
      l("r", [ n ]);
    }));
  }
  return w;
};

const getEnvironment = () => {
  if (!At) {
    At = createEnvironment();
  }
  return At;
};

const createEventContentChange = (t, n, o) => {
  let s = false;
  const e = o ? new WeakMap : false;
  const destroy = () => {
    s = true;
  };
  const updateElements = c => {
    if (e && o) {
      const r = o.map((n => {
        const [o, s] = n || [];
        const e = s && o ? (c || find)(o, t) : [];
        return [ e, s ];
      }));
      each(r, (o => each(o[0], (c => {
        const r = o[1];
        const i = e.get(c) || [];
        const l = t.contains(c);
        if (l && r) {
          const t = addEventListener(c, r, (o => {
            if (s) {
              t();
              e.delete(c);
            } else {
              n(o);
            }
          }));
          e.set(c, push(i, t));
        } else {
          runEachAndClear(i);
          e.delete(c);
        }
      }))));
    }
  };
  updateElements();
  return [ destroy, updateElements ];
};

const createDOMObserver = (t, n, o, s) => {
  let e = false;
  const {et: c, ct: r, rt: i, it: l, lt: a, ut: u} = s || {};
  const _ = debounce((() => e && o(true)), {
    p: 33,
    v: 99
  });
  const [d, p] = createEventContentChange(t, _, i);
  const v = c || [];
  const g = r || [];
  const h = concat(v, g);
  const observerCallback = (e, c) => {
    if (!isEmptyArray(c)) {
      const r = a || noop;
      const i = u || noop;
      const f = [];
      const _ = [];
      let d = false;
      let v = false;
      each(c, (o => {
        const {attributeName: e, target: c, type: a, oldValue: u, addedNodes: p, removedNodes: h} = o;
        const b = a === "attributes";
        const w = a === "childList";
        const y = t === c;
        const S = b && e;
        const m = S && getAttr(c, e || "");
        const O = isString(m) ? m : null;
        const $ = S && u !== O;
        const C = inArray(g, e) && $;
        if (n && (w || !y)) {
          const n = b && $;
          const a = n && l && is(c, l);
          const _ = a ? !r(c, e, u, O) : !b || n;
          const d = _ && !i(o, !!a, t, s);
          each(p, (t => push(f, t)));
          each(h, (t => push(f, t)));
          v = v || d;
        }
        if (!n && y && $ && !r(c, e, u, O)) {
          push(_, e);
          d = d || C;
        }
      }));
      p((t => deduplicateArray(f).reduce(((n, o) => {
        push(n, find(t, o));
        return is(o, t) ? push(n, o) : n;
      }), [])));
      if (n) {
        if (!e && v) {
          o(false);
        }
        return [ false ];
      }
      if (!isEmptyArray(_) || d) {
        const t = [ deduplicateArray(_), d ];
        if (!e) {
          o.apply(0, t);
        }
        return t;
      }
    }
  };
  const b = new f(bind(observerCallback, false));
  return [ () => {
    b.observe(t, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: h,
      subtree: n,
      childList: n,
      characterData: n
    });
    e = true;
    return () => {
      if (e) {
        d();
        b.disconnect();
        e = false;
      }
    };
  }, () => {
    if (e) {
      _.O();
      return observerCallback(true, b.takeRecords());
    }
  } ];
};

let Dt = null;

const createSizeObserver = (t, n, o) => {
  const {ft: s} = o || {};
  const e = getStaticPluginModuleInstance($t);
  const [c] = createCache({
    o: false,
    u: true
  });
  return () => {
    const o = [];
    const r = createDOM(`<div class="${nt}"><div class="${st}"></div></div>`);
    const i = r[0];
    const l = i.firstChild;
    const onSizeChangedCallbackProxy = t => {
      const o = isArray(t) && !isEmptyArray(t);
      let s = false;
      let e = false;
      if (o) {
        const n = t[0];
        const [o, , r] = c(n.contentRect);
        const i = domRectHasDimensions(o);
        e = domRectAppeared(o, r);
        s = !e && !i;
      } else {
        e = t === true;
      }
      if (!s) {
        n({
          _t: true,
          ft: e
        });
      }
    };
    if (d$1) {
      if (!isBoolean(Dt)) {
        const n = new d$1(noop);
        n.observe(t, {
          get box() {
            Dt = true;
          }
        });
        Dt = Dt || false;
        n.disconnect();
      }
      const n = debounce(onSizeChangedCallbackProxy, {
        p: 0,
        v: 0
      });
      const resizeObserverCallback = t => n(t);
      const s = new d$1(resizeObserverCallback);
      s.observe(Dt ? t : l);
      push(o, [ () => {
        s.disconnect();
      }, !Dt && appendChildren(t, i) ]);
      if (Dt) {
        const n = new d$1(resizeObserverCallback);
        n.observe(t, {
          box: "border-box"
        });
        push(o, (() => n.disconnect()));
      }
    } else if (e) {
      const [n, c] = e(l, onSizeChangedCallbackProxy, s);
      push(o, concat([ addClass(i, ot), addEventListener(i, "animationstart", n), appendChildren(t, i) ], c));
    } else {
      return noop;
    }
    return bind(runEachAndClear, o);
  };
};

const createTrinsicObserver = (t, n) => {
  let o;
  const isHeightIntrinsic = t => t.h === 0 || t.isIntersecting || t.intersectionRatio > 0;
  const s = createDiv(it);
  const [e] = createCache({
    o: false
  });
  const triggerOnTrinsicChangedCallback = (t, o) => {
    if (t) {
      const s = e(isHeightIntrinsic(t));
      const [, c] = s;
      return c && !o && n(s) && [ s ];
    }
  };
  const intersectionObserverCallback = (t, n) => triggerOnTrinsicChangedCallback(n.pop(), t);
  return [ () => {
    const n = [];
    if (_) {
      o = new _(bind(intersectionObserverCallback, false), {
        root: t
      });
      o.observe(s);
      push(n, (() => {
        o.disconnect();
      }));
    } else {
      const onSizeChanged = () => {
        const t = I(s);
        triggerOnTrinsicChangedCallback(t);
      };
      push(n, createSizeObserver(s, onSizeChanged)());
      onSizeChanged();
    }
    return bind(runEachAndClear, push(n, appendChildren(t, s)));
  }, () => o && intersectionObserverCallback(true, o.takeRecords()) ];
};

const createObserversSetup = (t, n, o, s) => {
  let e;
  let c;
  let r;
  let i;
  let l;
  let a;
  const u = `[${B}]`;
  const f = `[${j}]`;
  const _ = [ "id", "class", "style", "open", "wrap", "cols", "rows" ];
  const {dt: p, vt: v, L: g, gt: h, ht: b, V: w, bt: y, wt: S, yt: m, St: O} = t;
  const getDirectionIsRTL = t => getStyles(t, "direction") === "rtl";
  const $ = {
    Ot: false,
    B: getDirectionIsRTL(p)
  };
  const C = getEnvironment();
  const x = getStaticPluginModuleInstance(xt);
  const [H] = createCache({
    i: equalWH,
    o: {
      w: 0,
      h: 0
    }
  }, (() => {
    const s = x && x.R(t, n, $, C, o).Y;
    const e = y && w;
    const c = !e && hasAttrClass(v, B, N);
    const r = !w && S(W);
    const i = r && getElementScroll(h);
    const l = i && O();
    const a = m(J, c);
    const u = r && s && s();
    const f = D(g);
    const _ = getFractionalSize(g);
    if (u) {
      u();
    }
    scrollElementTo(h, i);
    if (l) {
      l();
    }
    if (c) {
      a();
    }
    return {
      w: f.w + _.w,
      h: f.h + _.h
    };
  }));
  const E = debounce(s, {
    p: () => e,
    v: () => c,
    m(t, n) {
      const [o] = t;
      const [s] = n;
      return [ concat(keys(o), keys(s)).reduce(((t, n) => {
        t[n] = o[n] || s[n];
        return t;
      }), {}) ];
    }
  });
  const setDirection = t => {
    const n = getDirectionIsRTL(p);
    assignDeep(t, {
      $t: a !== n
    });
    assignDeep($, {
      B: n
    });
    a = n;
  };
  const onTrinsicChanged = (t, n) => {
    const [o, e] = t;
    const c = {
      Ct: e
    };
    assignDeep($, {
      Ot: o
    });
    if (!n) {
      s(c);
    }
    return c;
  };
  const onSizeChanged = ({_t: t, ft: n}) => {
    const o = t && !n;
    const e = !o && C.U ? E : s;
    const c = {
      _t: t || n,
      ft: n
    };
    setDirection(c);
    e(c);
  };
  const onContentMutation = (t, n) => {
    const [, o] = H();
    const e = {
      xt: o
    };
    setDirection(e);
    const c = t ? s : E;
    if (o && !n) {
      c(e);
    }
    return e;
  };
  const onHostMutation = (t, n, o) => {
    const s = {
      Ht: n
    };
    setDirection(s);
    if (n && !o) {
      E(s);
    }
    return s;
  };
  const [z, T] = b ? createTrinsicObserver(v, onTrinsicChanged) : [];
  const I = !w && createSizeObserver(v, onSizeChanged, {
    ft: true
  });
  const [A, M] = createDOMObserver(v, false, onHostMutation, {
    ct: _,
    et: _
  });
  const k = w && d$1 && new d$1((t => {
    const n = t[t.length - 1].contentRect;
    onSizeChanged({
      _t: true,
      ft: domRectAppeared(n, l)
    });
    l = n;
  }));
  const R = debounce((() => {
    const [, t] = H();
    s({
      xt: t
    });
  }), {
    p: 222,
    S: true
  });
  return [ () => {
    if (k) {
      k.observe(v);
    }
    const t = I && I();
    const n = z && z();
    const o = A();
    const s = C.G((t => {
      if (t) {
        E({
          Et: t
        });
      } else {
        R();
      }
    }));
    return () => {
      if (k) {
        k.disconnect();
      }
      if (t) {
        t();
      }
      if (n) {
        n();
      }
      if (i) {
        i();
      }
      o();
      s();
    };
  }, ({zt: t, Tt: n, It: o}) => {
    const s = {};
    const [l] = t("update.ignoreMutation");
    const [a, d] = t("update.attributes");
    const [p, v] = t("update.elementEvents");
    const [h, y] = t("update.debounce");
    const S = v || d;
    const m = n || o;
    const ignoreMutationFromOptions = t => isFunction(l) && l(t);
    if (S) {
      if (r) {
        r();
      }
      if (i) {
        i();
      }
      const [t, n] = createDOMObserver(b || g, true, onContentMutation, {
        et: concat(_, a || []),
        rt: p,
        it: u,
        ut: (t, n) => {
          const {target: o, attributeName: s} = t;
          const e = !n && s && !w ? liesBetween(o, u, f) : false;
          return e || !!closest(o, `.${at}`) || !!ignoreMutationFromOptions(t);
        }
      });
      i = t();
      r = n;
    }
    if (y) {
      E.O();
      if (isArray(h)) {
        const t = h[0];
        const n = h[1];
        e = isNumber(t) && t;
        c = isNumber(n) && n;
      } else if (isNumber(h)) {
        e = h;
        c = false;
      } else {
        e = false;
        c = false;
      }
    }
    if (m) {
      const t = M();
      const n = T && T();
      const o = r && r();
      if (t) {
        assignDeep(s, onHostMutation(t[0], t[1], m));
      }
      if (n) {
        assignDeep(s, onTrinsicChanged(n[0], m));
      }
      if (o) {
        assignDeep(s, onContentMutation(o[0], m));
      }
    }
    setDirection(s);
    return s;
  }, $ ];
};

const resolveInitialization = (t, n) => isFunction(n) ? n.apply(0, t) : n;

const staticInitializationElement = (t, n, o, s) => {
  const e = isUndefined(s) ? o : s;
  const c = resolveInitialization(t, e);
  return c || n.apply(0, t);
};

const dynamicInitializationElement = (t, n, o, s) => {
  const e = isUndefined(s) ? o : s;
  const c = resolveInitialization(t, e);
  return !!c && (isHTMLElement(c) ? c : n.apply(0, t));
};

const cancelInitialization = (t, n) => {
  const {nativeScrollbarsOverlaid: o, body: s} = n || {};
  const {k: e, U: c, K: r} = getEnvironment();
  const {nativeScrollbarsOverlaid: i, body: l} = r().cancel;
  const a = o != null ? o : i;
  const u = isUndefined(s) ? l : s;
  const f = (e.x || e.y) && a;
  const _ = t && (isNull(u) ? !c : u);
  return !!f || !!_;
};

const createScrollbarsSetupElements = (t, n, o, s) => {
  const e = "--os-viewport-percent";
  const c = "--os-scroll-percent";
  const r = "--os-scroll-direction";
  const {K: i} = getEnvironment();
  const {scrollbars: l} = i();
  const {slot: a} = l;
  const {dt: u, vt: f, L: _, At: d, gt: v, bt: g, V: h} = n;
  const {scrollbars: b} = d ? {} : t;
  const {slot: w} = b || {};
  const y = [];
  const S = [];
  const m = [];
  const O = dynamicInitializationElement([ u, f, _ ], (() => h && g ? u : f), a, w);
  const initScrollTimeline = t => {
    if (p$1) {
      let n = null;
      let s = [];
      const e = new p$1({
        source: v,
        axis: t
      });
      const cancelAnimation = () => {
        if (n) {
          n.cancel();
        }
        n = null;
      };
      const _setScrollPercentAnimation = c => {
        const {Dt: r} = o;
        const i = isDefaultDirectionScrollCoordinates(r)[t];
        const l = t === "x";
        const a = [ getTrasformTranslateValue(0, l), getTrasformTranslateValue(`calc(100cq${l ? "w" : "h"} + -100%)`, l) ];
        const u = i ? a : a.reverse();
        if (s[0] === u[0] && s[1] === u[1]) {
          return cancelAnimation;
        }
        cancelAnimation();
        s = u;
        n = c.Mt.animate({
          clear: [ "left" ],
          transform: u
        }, {
          timeline: e
        });
        return cancelAnimation;
      };
      return {
        kt: _setScrollPercentAnimation
      };
    }
  };
  const $ = {
    x: initScrollTimeline("x"),
    y: initScrollTimeline("y")
  };
  const getViewportPercent = () => {
    const {Rt: t, Vt: n} = o;
    const getAxisValue = (t, n) => capNumber(0, 1, t / (t + n) || 0);
    return {
      x: getAxisValue(n.x, t.x),
      y: getAxisValue(n.y, t.y)
    };
  };
  const scrollbarStructureAddRemoveClass = (t, n, o) => {
    const s = o ? addClass : removeClass;
    each(t, (t => {
      s(t.Lt, n);
    }));
  };
  const scrollbarStyle = (t, n) => {
    each(t, (t => {
      const [o, s] = n(t);
      setStyles(o, s);
    }));
  };
  const scrollbarsAddRemoveClass = (t, n, o) => {
    const s = isBoolean(o);
    const e = s ? o : true;
    const c = s ? !o : true;
    if (e) {
      scrollbarStructureAddRemoveClass(S, t, n);
    }
    if (c) {
      scrollbarStructureAddRemoveClass(m, t, n);
    }
  };
  const refreshScrollbarsHandleLength = () => {
    const t = getViewportPercent();
    const createScrollbarStyleFn = t => n => [ n.Lt, {
      [e]: roundCssNumber(t) + ""
    } ];
    scrollbarStyle(S, createScrollbarStyleFn(t.x));
    scrollbarStyle(m, createScrollbarStyleFn(t.y));
  };
  const refreshScrollbarsHandleOffset = () => {
    if (!p$1) {
      const {Dt: t} = o;
      const n = getScrollCoordinatesPercent(t, getElementScroll(v));
      const createScrollbarStyleFn = t => n => [ n.Lt, {
        [c]: roundCssNumber(t) + ""
      } ];
      scrollbarStyle(S, createScrollbarStyleFn(n.x));
      scrollbarStyle(m, createScrollbarStyleFn(n.y));
    }
  };
  const refreshScrollbarsScrollCoordinates = () => {
    const {Dt: t} = o;
    const n = isDefaultDirectionScrollCoordinates(t);
    const createScrollbarStyleFn = t => n => [ n.Lt, {
      [r]: t ? "0" : "1"
    } ];
    scrollbarStyle(S, createScrollbarStyleFn(n.x));
    scrollbarStyle(m, createScrollbarStyleFn(n.y));
    if (p$1) {
      S.forEach($.x.kt);
      m.forEach($.y.kt);
    }
  };
  const refreshScrollbarsScrollbarOffset = () => {
    if (h && !g) {
      const {Rt: t, Dt: n} = o;
      const s = isDefaultDirectionScrollCoordinates(n);
      const e = getScrollCoordinatesPercent(n, getElementScroll(v));
      const styleScrollbarPosition = n => {
        const {Lt: o} = n;
        const c = parent(o) === _ && o;
        const getTranslateValue = (t, n, o) => {
          const s = n * t;
          return numberToCssPx(o ? s : -s);
        };
        return [ c, c && {
          transform: getTrasformTranslateValue({
            x: getTranslateValue(e.x, t.x, s.x),
            y: getTranslateValue(e.y, t.y, s.y)
          })
        } ];
      };
      scrollbarStyle(S, styleScrollbarPosition);
      scrollbarStyle(m, styleScrollbarPosition);
    }
  };
  const generateScrollbarDOM = t => {
    const n = t ? "x" : "y";
    const o = t ? ft : _t;
    const e = createDiv(`${at} ${o}`);
    const c = createDiv(dt);
    const r = createDiv(pt);
    const i = {
      Lt: e,
      Ut: c,
      Mt: r
    };
    const l = $[n];
    push(t ? S : m, i);
    push(y, [ appendChildren(e, c), appendChildren(c, r), bind(removeElements, e), l && l.kt(i), s(i, scrollbarsAddRemoveClass, t) ]);
    return i;
  };
  const C = bind(generateScrollbarDOM, true);
  const x = bind(generateScrollbarDOM, false);
  const appendElements = () => {
    appendChildren(O, S[0].Lt);
    appendChildren(O, m[0].Lt);
    return bind(runEachAndClear, y);
  };
  C();
  x();
  return [ {
    Pt: refreshScrollbarsHandleLength,
    Nt: refreshScrollbarsHandleOffset,
    qt: refreshScrollbarsScrollCoordinates,
    Bt: refreshScrollbarsScrollbarOffset,
    Ft: scrollbarsAddRemoveClass,
    jt: {
      Xt: S,
      Yt: C,
      Wt: bind(scrollbarStyle, S)
    },
    Jt: {
      Xt: m,
      Yt: x,
      Wt: bind(scrollbarStyle, m)
    }
  }, appendElements ];
};

const createScrollbarsSetupEvents = (t, n, o, s) => (r, i, l) => {
  const {vt: u, L: f, V: _, gt: d, Gt: p, St: v} = n;
  const {Lt: g, Ut: h, Mt: b} = r;
  const [w, y] = selfClearTimeout(333);
  const [S, m] = selfClearTimeout(444);
  const scrollOffsetElementScrollBy = t => {
    if (isFunction(d.scrollBy)) {
      d.scrollBy({
        behavior: "smooth",
        left: t.x,
        top: t.y
      });
    }
  };
  const createInteractiveScrollEvents = () => {
    const n = "pointerup pointercancel lostpointercapture";
    const s = `client${l ? "X" : "Y"}`;
    const r = l ? $ : C$1;
    const i = l ? "left" : "top";
    const a = l ? "w" : "h";
    const u = l ? "x" : "y";
    const createRelativeHandleMove = (t, n) => s => {
      const {Rt: e} = o;
      const c = I(h)[a] - I(b)[a];
      const r = n * s / c;
      const i = r * e[u];
      scrollElementTo(d, {
        [u]: t + i
      });
    };
    const f = [];
    return addEventListener(h, "pointerdown", (o => {
      const l = closest(o.target, `.${pt}`) === b;
      const _ = l ? b : h;
      const g = t.scrollbars;
      const w = g[l ? "dragScroll" : "clickScroll"];
      const {button: y, isPrimary: O, pointerType: $} = o;
      const {pointers: C} = g;
      const x = y === 0 && O && w && (C || []).includes($);
      if (x) {
        runEachAndClear(f);
        m();
        const t = !l && (o.shiftKey || w === "instant");
        const g = bind(getBoundingClientRect, b);
        const y = bind(getBoundingClientRect, h);
        const getHandleOffset = (t, n) => (t || g())[i] - (n || y())[i];
        const O = e(getBoundingClientRect(d)[r]) / I(d)[a] || 1;
        const $ = createRelativeHandleMove(getElementScroll(d)[u], 1 / O);
        const C = o[s];
        const x = g();
        const H = y();
        const E = x[r];
        const z = getHandleOffset(x, H) + E / 2;
        const T = C - H[i];
        const A = l ? 0 : T - z;
        const releasePointerCapture = t => {
          runEachAndClear(k);
          _.releasePointerCapture(t.pointerId);
        };
        const D = l || t;
        const M = v();
        const k = [ addEventListener(p, n, releasePointerCapture), addEventListener(p, "selectstart", (t => preventDefault(t)), {
          T: false
        }), addEventListener(h, n, releasePointerCapture), D && addEventListener(h, "pointermove", (t => $(A + (t[s] - C)))), D && (() => {
          const t = getElementScroll(d);
          M();
          const n = getElementScroll(d);
          const o = {
            x: n.x - t.x,
            y: n.y - t.y
          };
          if (c(o.x) > 3 || c(o.y) > 3) {
            v();
            scrollElementTo(d, t);
            scrollOffsetElementScrollBy(o);
            S(M);
          }
        }) ];
        _.setPointerCapture(o.pointerId);
        if (t) {
          $(A);
        } else if (!l) {
          const t = getStaticPluginModuleInstance(Et);
          if (t) {
            const n = t($, A, E, (t => {
              if (t) {
                M();
              } else {
                push(k, M);
              }
            }));
            push(k, n);
            push(f, bind(n, true));
          }
        }
      }
    }));
  };
  let O = true;
  return bind(runEachAndClear, [ addEventListener(b, "pointermove pointerleave", s), addEventListener(g, "pointerenter", (() => {
    i(ht, true);
  })), addEventListener(g, "pointerleave pointercancel", (() => {
    i(ht, false);
  })), !_ && addEventListener(g, "mousedown", (() => {
    const t = getFocusedElement();
    if (hasAttr(t, j) || hasAttr(t, B) || t === document.body) {
      a(bind(focusElement, f), 25);
    }
  })), addEventListener(g, "wheel", (t => {
    const {deltaX: n, deltaY: o, deltaMode: s} = t;
    if (O && s === 0 && parent(g) === u) {
      scrollOffsetElementScrollBy({
        x: n,
        y: o
      });
    }
    O = false;
    i(St, true);
    w((() => {
      O = true;
      i(St);
    }));
    preventDefault(t);
  }), {
    T: false,
    I: true
  }), addEventListener(g, "pointerdown", (() => {
    const t = addEventListener(p, "click", (t => {
      n();
      stopAndPrevent(t);
    }), {
      A: true,
      I: true,
      T: false
    });
    const n = addEventListener(p, "pointerup pointercancel", (() => {
      n();
      setTimeout(t, 150);
    }), {
      I: true,
      T: true
    });
  }), {
    I: true,
    T: true
  }), createInteractiveScrollEvents(), y, m ]);
};

const createScrollbarsSetup = (t, n, o, s, e, c) => {
  let r;
  let i;
  let l;
  let a;
  let u;
  let f = noop;
  let _ = 0;
  const d = [ "mouse", "pen" ];
  const isHoverablePointerType = t => d.includes(t.pointerType);
  const [p, v] = selfClearTimeout();
  const [g, h] = selfClearTimeout(100);
  const [b, w] = selfClearTimeout(100);
  const [y, S] = selfClearTimeout((() => _));
  const [m, O] = createScrollbarsSetupElements(t, e, s, createScrollbarsSetupEvents(n, e, s, (t => isHoverablePointerType(t) && manageScrollbarsAutoHideInstantInteraction())));
  const {vt: $, Kt: C, bt: H} = e;
  const {Ft: z, Pt: T, Nt: I, qt: A, Bt: D} = m;
  const manageScrollbarsAutoHide = (t, n) => {
    S();
    if (t) {
      z(yt);
    } else {
      const t = bind(z, yt, true);
      if (_ > 0 && !n) {
        y(t);
      } else {
        t();
      }
    }
  };
  const manageScrollbarsAutoHideInstantInteraction = () => {
    if (l ? !r : !a) {
      manageScrollbarsAutoHide(true);
      g((() => {
        manageScrollbarsAutoHide(false);
      }));
    }
  };
  const manageAutoHideSuspension = t => {
    z(wt, t, true);
    z(wt, t, false);
  };
  const onHostMouseEnter = t => {
    if (isHoverablePointerType(t)) {
      r = l;
      if (l) {
        manageScrollbarsAutoHide(true);
      }
    }
  };
  const M = [ S, h, w, v, () => f(), addEventListener($, "pointerover", onHostMouseEnter, {
    A: true
  }), addEventListener($, "pointerenter", onHostMouseEnter), addEventListener($, "pointerleave", (t => {
    if (isHoverablePointerType(t)) {
      r = false;
      if (l) {
        manageScrollbarsAutoHide(false);
      }
    }
  })), addEventListener($, "pointermove", (t => {
    if (isHoverablePointerType(t) && i) {
      manageScrollbarsAutoHideInstantInteraction();
    }
  })), addEventListener(C, "scroll", (t => {
    p((() => {
      I();
      manageScrollbarsAutoHideInstantInteraction();
    }));
    c(t);
    D();
  })) ];
  return [ () => bind(runEachAndClear, push(M, O())), ({zt: t, It: n, Qt: e, Zt: c}) => {
    const {tn: r, nn: d, sn: p, en: v} = c || {};
    const {$t: g, ft: h} = e || {};
    const {B: w} = o;
    const {k: y} = getEnvironment();
    const {cn: S, j: m} = s;
    const [O, $] = t("showNativeOverlaidScrollbars");
    const [M, k] = t("scrollbars.theme");
    const [R, V] = t("scrollbars.visibility");
    const [L, U] = t("scrollbars.autoHide");
    const [P, N] = t("scrollbars.autoHideSuspend");
    const [q] = t("scrollbars.autoHideDelay");
    const [B, F] = t("scrollbars.dragScroll");
    const [j, X] = t("scrollbars.clickScroll");
    const [Y, W] = t("overflow");
    const J = h && !n;
    const G = m.x || m.y;
    const K = r || d || v || g || n;
    const Q = p || V || W;
    const Z = O && y.x && y.y;
    const setScrollbarVisibility = (t, n, o) => {
      const s = t.includes(E$1) && (R === x || R === "auto" && n === E$1);
      z(vt, s, o);
      return s;
    };
    _ = q;
    if (J) {
      if (P && G) {
        manageAutoHideSuspension(false);
        f();
        b((() => {
          f = addEventListener(C, "scroll", bind(manageAutoHideSuspension, true), {
            A: true
          });
        }));
      } else {
        manageAutoHideSuspension(true);
      }
    }
    if ($) {
      z(lt, Z);
    }
    if (k) {
      z(u);
      z(M, true);
      u = M;
    }
    if (N && !P) {
      manageAutoHideSuspension(true);
    }
    if (U) {
      i = L === "move";
      l = L === "leave";
      a = L === "never";
      manageScrollbarsAutoHide(a, true);
    }
    if (F) {
      z(Ot, B);
    }
    if (X) {
      z(mt, !!j);
    }
    if (Q) {
      const t = setScrollbarVisibility(Y.x, S.x, true);
      const n = setScrollbarVisibility(Y.y, S.y, false);
      const o = t && n;
      z(gt, !o);
    }
    if (K) {
      I();
      T();
      D();
      if (v) {
        A();
      }
      z(bt, !m.x, true);
      z(bt, !m.y, false);
      z(ut, w && !H);
    }
  }, {}, m ];
};

const createStructureSetupElements = t => {
  const o = getEnvironment();
  const {K: s, U: e} = o;
  const {elements: c} = s();
  const {padding: r, viewport: i, content: l} = c;
  const a = isHTMLElement(t);
  const u = a ? {} : t;
  const {elements: f} = u;
  const {padding: _, viewport: d, content: p} = f || {};
  const v = a ? t : u.target;
  const g = isBodyElement(v);
  const h = v.ownerDocument;
  const b = h.documentElement;
  const getDocumentWindow = () => h.defaultView || n;
  const w = bind(staticInitializationElement, [ v ]);
  const y = bind(dynamicInitializationElement, [ v ]);
  const S = bind(createDiv, "");
  const $ = bind(w, S, i);
  const C = bind(y, S, l);
  const elementHasOverflow = t => {
    const n = I(t);
    const o = D(t);
    const s = getStyles(t, m);
    const e = getStyles(t, O$1);
    return o.w - n.w > 0 && !overflowIsVisible(s) || o.h - n.h > 0 && !overflowIsVisible(e);
  };
  const x = $(d);
  const H = x === v;
  const E = H && g;
  const z = !H && C(p);
  const T = !H && x === z;
  const A = E ? b : x;
  const M = E ? A : v;
  const k = !H && y(S, r, _);
  const R = !T && z;
  const V = [ R, A, k, M ].map((t => isHTMLElement(t) && !parent(t) && t));
  const elementIsGenerated = t => t && inArray(V, t);
  const L = !elementIsGenerated(A) && elementHasOverflow(A) ? A : v;
  const U = E ? b : A;
  const N = E ? h : A;
  const X = {
    dt: v,
    vt: M,
    L: A,
    rn: k,
    ht: R,
    gt: U,
    Kt: N,
    ln: g ? b : L,
    Gt: h,
    bt: g,
    At: a,
    V: H,
    an: getDocumentWindow,
    wt: t => hasAttrClass(A, j, t),
    yt: (t, n) => addRemoveAttrClass(A, j, t, n),
    St: () => addRemoveAttrClass(U, j, G, true)
  };
  const {dt: Y, vt: W, rn: J, L: Q, ht: nt} = X;
  const ot = [ () => {
    removeAttrs(W, [ B, P ]);
    removeAttrs(Y, P);
    if (g) {
      removeAttrs(b, [ P, B ]);
    }
  } ];
  let st = contents([ nt, Q, J, W, Y ].find((t => t && !elementIsGenerated(t))));
  const et = E ? Y : nt || Q;
  const ct = bind(runEachAndClear, ot);
  const appendElements = () => {
    const t = getDocumentWindow();
    const n = getFocusedElement();
    const unwrap = t => {
      appendChildren(parent(t), contents(t));
      removeElements(t);
    };
    const prepareWrapUnwrapFocus = t => addEventListener(t, "focusin focusout focus blur", stopAndPrevent, {
      I: true,
      T: false
    });
    const o = "tabindex";
    const s = getAttr(Q, o);
    const c = prepareWrapUnwrapFocus(n);
    setAttrs(W, B, H ? "" : F$1);
    setAttrs(J, Z, "");
    setAttrs(Q, j, "");
    setAttrs(nt, tt, "");
    if (!H) {
      setAttrs(Q, o, s || "-1");
      if (g) {
        setAttrs(b, q$1, "");
      }
    }
    appendChildren(et, st);
    appendChildren(W, J);
    appendChildren(J || W, !H && Q);
    appendChildren(Q, nt);
    push(ot, [ c, () => {
      const t = getFocusedElement();
      const n = elementIsGenerated(Q);
      const e = n && t === Q ? Y : t;
      const c = prepareWrapUnwrapFocus(e);
      removeAttrs(J, Z);
      removeAttrs(nt, tt);
      removeAttrs(Q, j);
      if (g) {
        removeAttrs(b, q$1);
      }
      if (s) {
        setAttrs(Q, o, s);
      } else {
        removeAttrs(Q, o);
      }
      if (elementIsGenerated(nt)) {
        unwrap(nt);
      }
      if (n) {
        unwrap(Q);
      }
      if (elementIsGenerated(J)) {
        unwrap(J);
      }
      focusElement(e);
      c();
    } ]);
    if (e && !H) {
      addAttrClass(Q, j, K);
      push(ot, bind(removeAttrs, Q, j));
    }
    focusElement(!H && g && n === Y && t.top === t ? Q : n);
    c();
    st = 0;
    return ct;
  };
  return [ X, appendElements, ct ];
};

const createTrinsicUpdateSegment = ({ht: t}) => ({Qt: n, un: o, It: s}) => {
  const {Ct: e} = n || {};
  const {Ot: c} = o;
  const r = t && (e || s);
  if (r) {
    setStyles(t, {
      [C$1]: c && "100%"
    });
  }
};

const createPaddingUpdateSegment = ({vt: t, rn: n, L: o, V: s}, e) => {
  const [c, r] = createCache({
    i: equalTRBL,
    o: topRightBottomLeft()
  }, bind(topRightBottomLeft, t, "padding", ""));
  return ({zt: t, Qt: i, un: l, It: a}) => {
    let [u, f] = r(a);
    const {U: _} = getEnvironment();
    const {_t: d, xt: p, $t: m} = i || {};
    const {B: O} = l;
    const [C, x] = t("paddingAbsolute");
    const H = a || p;
    if (d || f || H) {
      [u, f] = c(a);
    }
    const E = !s && (x || m || f);
    if (E) {
      const t = !C || !n && !_;
      const s = u.r + u.l;
      const c = u.t + u.b;
      const r = {
        [y]: t && !O ? -s : 0,
        [S$1]: t ? -c : 0,
        [w$1]: t && O ? -s : 0,
        top: t ? -u.t : 0,
        right: t ? O ? -u.r : "auto" : 0,
        left: t ? O ? "auto" : -u.l : 0,
        [$]: t && `calc(100% + ${s}px)`
      };
      const i = {
        [v]: t ? u.t : 0,
        [g$1]: t ? u.r : 0,
        [b]: t ? u.b : 0,
        [h]: t ? u.l : 0
      };
      setStyles(n || o, r);
      setStyles(o, i);
      assignDeep(e, {
        rn: u,
        fn: !t,
        F: n ? i : assignDeep({}, r, i)
      });
    }
    return {
      _n: E
    };
  };
};

const createOverflowUpdateSegment = (t, s) => {
  const e = getEnvironment();
  const {vt: c, rn: r, L: i, V: a, Kt: u, gt: f, bt: _, yt: d, an: p} = t;
  const {U: v} = e;
  const g = _ && a;
  const h = bind(o, 0);
  const b = {
    display: () => false,
    direction: t => t !== "ltr",
    flexDirection: t => t.endsWith("-reverse"),
    writingMode: t => t !== "horizontal-tb"
  };
  const w = keys(b);
  const y = {
    i: equalWH,
    o: {
      w: 0,
      h: 0
    }
  };
  const S = {
    i: equalXY,
    o: {}
  };
  const setMeasuringMode = t => {
    d(J, !g && t);
  };
  const getMeasuredScrollCoordinates = t => {
    const n = w.some((n => {
      const o = t[n];
      return o && b[n](o);
    }));
    if (!n) {
      return {
        D: {
          x: 0,
          y: 0
        },
        M: {
          x: 1,
          y: 1
        }
      };
    }
    setMeasuringMode(true);
    const o = getElementScroll(f);
    const s = d(Q, true);
    const e = addEventListener(u, E$1, (t => {
      const n = getElementScroll(f);
      if (t.isTrusted && n.x === o.x && n.y === o.y) {
        stopPropagation(t);
      }
    }), {
      I: true,
      A: true
    });
    scrollElementTo(f, {
      x: 0,
      y: 0
    });
    s();
    const c = getElementScroll(f);
    const r = D(f);
    scrollElementTo(f, {
      x: r.w,
      y: r.h
    });
    const i = getElementScroll(f);
    scrollElementTo(f, {
      x: i.x - c.x < 1 && -r.w,
      y: i.y - c.y < 1 && -r.h
    });
    const a = getElementScroll(f);
    scrollElementTo(f, o);
    l((() => e()));
    return {
      D: c,
      M: a
    };
  };
  const getOverflowAmount = (t, o) => {
    const s = n.devicePixelRatio % 1 !== 0 ? 1 : 0;
    const e = {
      w: h(t.w - o.w),
      h: h(t.h - o.h)
    };
    return {
      w: e.w > s ? e.w : 0,
      h: e.h > s ? e.h : 0
    };
  };
  const getViewportOverflowStyle = (t, n) => {
    const getAxisOverflowStyle = (t, n, o, s) => {
      const e = t === x ? H : overflowBehaviorToOverflowStyle(t);
      const c = overflowIsVisible(t);
      const r = overflowIsVisible(o);
      if (!n && !s) {
        return H;
      }
      if (c && r) {
        return x;
      }
      if (c) {
        const t = n ? x : H;
        return n && s ? e : t;
      }
      const i = r && s ? x : H;
      return n ? e : i;
    };
    return {
      x: getAxisOverflowStyle(n.x, t.x, n.y, t.y),
      y: getAxisOverflowStyle(n.y, t.y, n.x, t.x)
    };
  };
  const setViewportOverflowStyle = t => {
    const createAllOverflowStyleClassNames = t => [ x, H, E$1 ].map((n => createViewportOverflowStyleClassName(overflowCssValueToOverflowStyle(n), t)));
    const n = createAllOverflowStyleClassNames(true).concat(createAllOverflowStyleClassNames()).join(" ");
    d(n);
    d(keys(t).map((n => createViewportOverflowStyleClassName(t[n], n === "x"))).join(" "), true);
  };
  const [m, O] = createCache(y, bind(getFractionalSize, i));
  const [$, C] = createCache(y, bind(D, i));
  const [z, T] = createCache(y);
  const [I] = createCache(S);
  const [M, k] = createCache(y);
  const [R] = createCache(S);
  const [V] = createCache({
    i: (t, n) => equal(t, n, w),
    o: {}
  }, (() => hasDimensions(i) ? getStyles(i, w) : {}));
  const [L, U] = createCache({
    i: (t, n) => equalXY(t.D, n.D) && equalXY(t.M, n.M),
    o: getZeroScrollCoordinates()
  });
  const P = getStaticPluginModuleInstance(xt);
  const createViewportOverflowStyleClassName = (t, n) => {
    const o = n ? X : Y;
    return `${o}${capitalizeFirstLetter(t)}`;
  };
  return ({zt: n, Qt: o, un: l, It: a}, {_n: u}) => {
    const {_t: f, Ht: _, xt: b, $t: w, ft: y, Et: S} = o || {};
    const x = P && P.R(t, s, l, e, n);
    const {X: H, Y: E, W: D} = x || {};
    const [q, F] = getShowNativeOverlaidScrollbars(n, e);
    const [j, X] = n("overflow");
    const Y = overflowIsVisible(j.x);
    const W = overflowIsVisible(j.y);
    const J = f || u || b || w || S || F;
    let G = O(a);
    let Q = C(a);
    let tt = T(a);
    let nt = k(a);
    if (F && v) {
      d(K, !q);
    }
    if (J) {
      if (hasAttrClass(c, B, N)) {
        setMeasuringMode(true);
      }
      const t = E && E();
      const [n] = G = m(a);
      const [o] = Q = $(a);
      const s = A(i);
      const e = g && getWindowSize(p());
      const r = {
        w: h(o.w + n.w),
        h: h(o.h + n.h)
      };
      const l = {
        w: h((e ? e.w : s.w + h(s.w - o.w)) + n.w),
        h: h((e ? e.h : s.h + h(s.h - o.h)) + n.h)
      };
      if (t) {
        t();
      }
      nt = M(l);
      tt = z(getOverflowAmount(r, l), a);
    }
    const [ot, st] = nt;
    const [et, ct] = tt;
    const [rt, it] = Q;
    const [lt, at] = G;
    const [ut, ft] = I({
      x: et.w > 0,
      y: et.h > 0
    });
    const _t = Y && W && (ut.x || ut.y) || Y && ut.x && !ut.y || W && ut.y && !ut.x;
    const dt = u || w || S || at || it || st || ct || X || F || J || _ && g;
    const [pt, vt] = V(a);
    const gt = w || y || vt || ft || a;
    const [ht, bt] = gt ? L(getMeasuredScrollCoordinates(pt), a) : U();
    let wt = getViewportOverflowStyle(ut, j);
    setMeasuringMode(false);
    if (dt) {
      setViewportOverflowStyle(wt);
      wt = getElementOverflowStyle(i, ut);
      if (D && H) {
        H(wt, rt, lt);
        setStyles(i, D(wt));
      }
    }
    const [yt, St] = R(wt);
    addRemoveAttrClass(c, B, N, _t);
    addRemoveAttrClass(r, Z, N, _t);
    assignDeep(s, {
      cn: yt,
      Vt: {
        x: ot.w,
        y: ot.h
      },
      Rt: {
        x: et.w,
        y: et.h
      },
      j: ut,
      Dt: sanitizeScrollCoordinates(ht, et)
    });
    return {
      sn: St,
      tn: st,
      nn: ct,
      en: bt || ct,
      dn: gt
    };
  };
};

const createStructureSetup = t => {
  const [n, o, s] = createStructureSetupElements(t);
  const e = {
    rn: {
      t: 0,
      r: 0,
      b: 0,
      l: 0
    },
    fn: false,
    F: {
      [y]: 0,
      [S$1]: 0,
      [w$1]: 0,
      [v]: 0,
      [g$1]: 0,
      [b]: 0,
      [h]: 0
    },
    Vt: {
      x: 0,
      y: 0
    },
    Rt: {
      x: 0,
      y: 0
    },
    cn: {
      x: H,
      y: H
    },
    j: {
      x: false,
      y: false
    },
    Dt: getZeroScrollCoordinates()
  };
  const {dt: c, gt: r, V: i, St: l} = n;
  const {U: a, k: u} = getEnvironment();
  const f = !a && (u.x || u.y);
  const _ = [ createTrinsicUpdateSegment(n), createPaddingUpdateSegment(n, e), createOverflowUpdateSegment(n, e) ];
  return [ o, t => {
    const n = {};
    const o = f;
    const s = o && getElementScroll(r);
    const e = s && l();
    each(_, (o => {
      assignDeep(n, o(t, n) || {});
    }));
    scrollElementTo(r, s);
    if (e) {
      e();
    }
    if (!i) {
      scrollElementTo(c, 0);
    }
    return n;
  }, e, n, s ];
};

const createSetups = (t, n, o, s, e) => {
  let c = false;
  const r = createOptionCheck(n, {});
  const [i, l, a, u, f] = createStructureSetup(t);
  const [_, d, p] = createObserversSetup(u, a, r, (t => {
    update({}, t);
  }));
  const [v, g, , h] = createScrollbarsSetup(t, n, p, a, u, e);
  const updateHintsAreTruthy = t => keys(t).some((n => !!t[n]));
  const update = (t, e) => {
    if (o()) {
      return false;
    }
    const {pn: r, It: i, Tt: a, vn: u} = t;
    const f = r || {};
    const _ = !!i || !c;
    const v = {
      zt: createOptionCheck(n, f, _),
      pn: f,
      It: _
    };
    if (u) {
      g(v);
      return false;
    }
    const h = e || d(assignDeep({}, v, {
      Tt: a
    }));
    const b = l(assignDeep({}, v, {
      un: p,
      Qt: h
    }));
    g(assignDeep({}, v, {
      Qt: h,
      Zt: b
    }));
    const w = updateHintsAreTruthy(h);
    const y = updateHintsAreTruthy(b);
    const S = w || y || !isEmptyObject(f) || _;
    c = true;
    if (S) {
      s(t, {
        Qt: h,
        Zt: b
      });
    }
    return S;
  };
  return [ () => {
    const {ln: t, gt: n, St: o} = u;
    const s = getElementScroll(t);
    const e = [ _(), i(), v() ];
    const c = o();
    scrollElementTo(n, s);
    c();
    return bind(runEachAndClear, e);
  }, update, () => ({
    gn: p,
    hn: a
  }), {
    bn: u,
    wn: h
  }, f ];
};

const Mt = new WeakMap;

const addInstance = (t, n) => {
  Mt.set(t, n);
};

const removeInstance = t => {
  Mt.delete(t);
};

const getInstance = t => Mt.get(t);

const OverlayScrollbars = (t, n, o) => {
  const {tt: s} = getEnvironment();
  const e = isHTMLElement(t);
  const c = e ? t : t.target;
  const r = getInstance(c);
  if (n && !r) {
    let r = false;
    const i = [];
    const l = {};
    const validateOptions = t => {
      const n = removeUndefinedProperties(t);
      const o = getStaticPluginModuleInstance(R);
      return o ? o(n, true) : n;
    };
    const a = assignDeep({}, s(), validateOptions(n));
    const [u, f, _] = createEventListenerHub();
    const [d, p, v] = createEventListenerHub(o);
    const triggerEvent = (t, n) => {
      v(t, n);
      _(t, n);
    };
    const [g, h, b, w, y] = createSetups(t, a, (() => r), (({pn: t, It: n}, {Qt: o, Zt: s}) => {
      const {_t: e, $t: c, Ct: r, xt: i, Ht: l, ft: a} = o;
      const {tn: u, nn: f, sn: _, en: d} = s;
      triggerEvent("updated", [ S, {
        updateHints: {
          sizeChanged: !!e,
          directionChanged: !!c,
          heightIntrinsicChanged: !!r,
          overflowEdgeChanged: !!u,
          overflowAmountChanged: !!f,
          overflowStyleChanged: !!_,
          scrollCoordinatesChanged: !!d,
          contentMutation: !!i,
          hostMutation: !!l,
          appear: !!a
        },
        changedOptions: t || {},
        force: !!n
      } ]);
    }), (t => triggerEvent("scroll", [ S, t ])));
    const destroy = t => {
      removeInstance(c);
      runEachAndClear(i);
      r = true;
      triggerEvent("destroyed", [ S, t ]);
      f();
      p();
    };
    const S = {
      options(t, n) {
        if (t) {
          const o = n ? s() : {};
          const e = getOptionsDiff(a, assignDeep(o, validateOptions(t)));
          if (!isEmptyObject(e)) {
            assignDeep(a, e);
            h({
              pn: e
            });
          }
        }
        return assignDeep({}, a);
      },
      on: d,
      off: (t, n) => {
        if (t && n) {
          p(t, n);
        }
      },
      state() {
        const {gn: t, hn: n} = b();
        const {B: o} = t;
        const {Vt: s, Rt: e, cn: c, j: i, rn: l, fn: a, Dt: u} = n;
        return assignDeep({}, {
          overflowEdge: s,
          overflowAmount: e,
          overflowStyle: c,
          hasOverflow: i,
          scrollCoordinates: {
            start: u.D,
            end: u.M
          },
          padding: l,
          paddingAbsolute: a,
          directionRTL: o,
          destroyed: r
        });
      },
      elements() {
        const {dt: t, vt: n, rn: o, L: s, ht: e, gt: c, Kt: r} = w.bn;
        const {jt: i, Jt: l} = w.wn;
        const translateScrollbarStructure = t => {
          const {Mt: n, Ut: o, Lt: s} = t;
          return {
            scrollbar: s,
            track: o,
            handle: n
          };
        };
        const translateScrollbarsSetupElement = t => {
          const {Xt: n, Yt: o} = t;
          const s = translateScrollbarStructure(n[0]);
          return assignDeep({}, s, {
            clone: () => {
              const t = translateScrollbarStructure(o());
              h({
                vn: true
              });
              return t;
            }
          });
        };
        return assignDeep({}, {
          target: t,
          host: n,
          padding: o || s,
          viewport: s,
          content: e || s,
          scrollOffsetElement: c,
          scrollEventElement: r,
          scrollbarHorizontal: translateScrollbarsSetupElement(i),
          scrollbarVertical: translateScrollbarsSetupElement(l)
        });
      },
      update: t => h({
        It: t,
        Tt: true
      }),
      destroy: bind(destroy, false),
      plugin: t => l[keys(t)[0]]
    };
    push(i, [ y ]);
    addInstance(c, S);
    registerPluginModuleInstances(M, OverlayScrollbars, [ S, u, l ]);
    if (cancelInitialization(w.bn.bt, !e && t.cancel)) {
      destroy(true);
      return S;
    }
    push(i, g());
    triggerEvent("initialized", [ S ]);
    S.update();
    return S;
  }
  return r;
};

OverlayScrollbars.plugin = t => {
  const n = isArray(t);
  const o = n ? t : [ t ];
  const s = o.map((t => registerPluginModuleInstances(t, OverlayScrollbars)[0]));
  addPlugins(o);
  return n ? s : s[0];
};

OverlayScrollbars.valid = t => {
  const n = t && t.elements;
  const o = isFunction(n) && n();
  return isPlainObject(o) && !!getInstance(o.target);
};

OverlayScrollbars.env = () => {
  const {P: t, k: n, U: o, J: s, ot: e, st: c, K: r, Z: i, tt: l, nt: a} = getEnvironment();
  return assignDeep({}, {
    scrollbarsSize: t,
    scrollbarsOverlaid: n,
    scrollbarsHiding: o,
    scrollTimeline: s,
    staticDefaultInitialization: e,
    staticDefaultOptions: c,
    getDefaultInitialization: r,
    setDefaultInitialization: i,
    getDefaultOptions: l,
    setDefaultOptions: a
  });
};

OverlayScrollbars.nonce = setNonce;

OverlayScrollbars.trustedTypePolicy = setTrustedTypePolicy;

const w = await importShared('react');
const {useMemo:C,useRef:d,useEffect:p,forwardRef:E,useImperativeHandle:O} = w;
const S = () => {
  if (typeof window > "u") {
    const n = () => {
    };
    return [n, n];
  }
  let l, o;
  const t = window, c = typeof t.requestIdleCallback == "function", a = t.requestAnimationFrame, i = t.cancelAnimationFrame, r = c ? t.requestIdleCallback : a, u = c ? t.cancelIdleCallback : i, s = () => {
    u(l), i(o);
  };
  return [
    (n, e) => {
      s(), l = r(
        c ? () => {
          s(), o = a(n);
        } : n,
        typeof e == "object" ? e : { timeout: 2233 }
      );
    },
    s
  ];
}, F = (l) => {
  const { options: o, events: t, defer: c } = l || {}, [a, i] = C(S, []), r = d(null), u = d(c), s = d(o), n = d(t);
  return p(() => {
    u.current = c;
  }, [c]), p(() => {
    const { current: e } = r;
    s.current = o, OverlayScrollbars.valid(e) && e.options(o || {}, true);
  }, [o]), p(() => {
    const { current: e } = r;
    n.current = t, OverlayScrollbars.valid(e) && e.on(t || {}, true);
  }, [t]), p(
    () => () => {
      var e;
      i(), (e = r.current) == null || e.destroy();
    },
    []
  ), C(
    () => [
      (e) => {
        const v = r.current;
        if (OverlayScrollbars.valid(v))
          return;
        const f = u.current, y = s.current || {}, b = n.current || {}, m = () => r.current = OverlayScrollbars(e, y, b);
        f ? a(m, f) : m();
      },
      () => r.current
    ],
    []
  );
}, q = (l, o) => {
  const { element: t = "div", options: c, events: a, defer: i, children: r, ...u } = l, s = t, n = d(null), e = d(null), [v, f] = F({ options: c, events: a, defer: i });
  return p(() => {
    const { current: y } = n, { current: b } = e;
    if (!y)
      return;
    const m = y;
    return v(
      t === "body" ? {
        target: m,
        cancel: {
          body: null
        }
      } : {
        target: m,
        elements: {
          viewport: b,
          content: b
        }
      }
    ), () => {
      var R;
      return (R = f()) == null ? void 0 : R.destroy();
    };
  }, [v, t]), O(
    o,
    () => ({
      osInstance: f,
      getElement: () => n.current
    }),
    []
  ), // @ts-ignore
  /* @__PURE__ */ w.createElement(s, { "data-overlayscrollbars-initialize": "", ref: n, ...u }, t === "body" ? r : /* @__PURE__ */ w.createElement("div", { "data-overlayscrollbars-contents": "", ref: e }, r));
}, g = E(q);

const PageID = {
  home: "home_page"};
const modalMotionProps = {
  variants: {
    enter: {
      opacity: 1,
      scale: 1,
      transition: {
        opacity: {
          duration: 0.4,
          ease: TRANSITION_EASINGS.ease
        },
        scale: {
          duration: 0.4,
          ease: TRANSITION_EASINGS.ease
        },
        y: {
          bounce: 0,
          duration: 0.6,
          type: "spring"
        }
      },
      y: "var(--slide-enter)"
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      // HeroUI default 1.03
      transition: {
        duration: 0.3,
        ease: TRANSITION_EASINGS.ease
      },
      y: "var(--slide-exit)"
    }
  }
};
const defaultTabItem = {
  id: "tab",
  title: "Home",
  isLoading: false,
  isTerminal: false,
  pageID: PageID.home,
  favIcon: { show: false, url: "" }
};

const {useSelector: useSelector$1} = await importShared('react-redux');
const initialState$1 = {
  tabs: [defaultTabItem],
  activeTab: defaultTabItem.id,
  activePage: defaultTabItem.pageID,
  prevTab: ""
};
const tabsSlice = createSlice({
  name: "tabs",
  initialState: initialState$1,
  reducers: {
    setTabState: (state, action) => {
      state[action.payload.key] = action.payload.value;
    },
    addTab: (state, action) => {
      let newID = action.payload.id;
      let idNumber = 1;
      const checkDuplicateId = () => {
        const existTab = state.tabs.find((tab) => tab.id === newID);
        if (existTab) {
          newID = `${action.payload.id}_${idNumber}`;
          idNumber++;
          checkDuplicateId();
        }
      };
      checkDuplicateId();
      state.tabs.push({ ...action.payload, id: newID });
      state.activeTab = newID;
      state.activePage = action.payload.pageID;
    },
    removeTab: (state, action) => {
      const tabIdToRemove = action.payload;
      const tabIndexToRemove = state.tabs.findIndex((tab) => tab.id === tabIdToRemove);
      state.tabs = state.tabs.filter((tab) => tab.id !== tabIdToRemove);
      if (state.activeTab === tabIdToRemove) {
        if (state.tabs.length > 0) {
          const newActiveTabIndex = Math.min(tabIndexToRemove, state.tabs.length - 1);
          state.activeTab = state.tabs[newActiveTabIndex].id;
          state.activePage = state.tabs[newActiveTabIndex].pageID;
        } else {
          state.activeTab = defaultTabItem.id;
          state.activePage = defaultTabItem.pageID;
        }
      }
      if (state.tabs.length <= 0) {
        state.tabs = initialState$1.tabs;
      }
    },
    setActiveTab: (state, action) => {
      state.prevTab = state.activeTab;
      state.activeTab = action.payload;
      state.activePage = state.tabs.find((tab) => tab.id === action.payload)?.pageID || defaultTabItem.pageID;
    },
    switchTab: (state, action) => {
      if (state.tabs.length <= 1) return;
      const currentIndex = state.tabs.findIndex((tab) => tab.id === state.activeTab);
      if (currentIndex === -1) return;
      const direction = action.payload?.direction || "next";
      let nextIndex;
      if (direction === "next") {
        nextIndex = (currentIndex + 1) % state.tabs.length;
      } else {
        nextIndex = (currentIndex - 1 + state.tabs.length) % state.tabs.length;
      }
      state.prevTab = state.activeTab;
      state.activeTab = state.tabs[nextIndex].id;
      state.activePage = state.tabs[nextIndex].pageID;
    },
    setTabLoading: (state, action) => {
      const { tabID, isLoading } = action.payload;
      state.tabs = state.tabs.map((tab) => tab.id === tabID ? { ...tab, isLoading } : tab);
    },
    setActiveTabLoading: (state, action) => {
      state.tabs = state.tabs.map((tab) => tab.id === state.activeTab ? { ...tab, isLoading: action.payload } : tab);
    },
    setTabTitle: (state, action) => {
      const { tabID, title } = action.payload;
      state.tabs = state.tabs.map((tab) => tab.id === tabID ? { ...tab, title } : tab);
    },
    setTabIsTerminal: (state, action) => {
      const { tabID, isTerminal } = action.payload;
      state.tabs = state.tabs.map((tab) => tab.id === tabID ? { ...tab, isTerminal } : tab);
    },
    setActiveTabTitle: (state, action) => {
      state.tabs = state.tabs.map((tab) => tab.id === state.activeTab ? { ...tab, title: action.payload } : tab);
    },
    setTabFavIcon: (state, action) => {
      const { tabID, ...favIcon } = action.payload;
      state.tabs = state.tabs.map((tab) => tab.id === tabID ? { ...tab, favIcon } : tab);
    },
    setActivePage: (state, action) => {
      const index = state.tabs.findIndex((tab) => tab.id === state.activeTab);
      if (index !== -1) {
        const { pageID, title, isTerminal } = action.payload;
        state.tabs[index] = {
          ...state.tabs[index],
          pageID,
          title,
          isTerminal: isTerminal || false,
          favIcon: { show: false, url: "" }
        };
      }
      state.activePage = action.payload.pageID;
    }
  }
});
const useTabsState = (key) => useSelector$1((state) => state.tabs[key]);
const tabsActions = tabsSlice.actions;

const PYTHON_SUPPORTED_AI = [
  "LSHQQYTIGER_SD",
  "LSHQQYTIGER_Forge_SD",
  "Automatic1111_SD",
  "ComfyUI_SD",
  "ComfyUI_Zluda_ID",
  "VLADMANDIC_SD",
  "Lllyasviel_SD",
  "Nerogar_SD",
  "Anapnoe_SD",
  "Erew123_SD",
  "Oobabooga_TG",
  "Gitmylo_AG",
  "OpenWebUI_TG"
];

const {useSelector} = await importShared('react-redux');

const initialState = {
  menuModal: []
};
const pythonToolkitReducer = createSlice({
  initialState,
  name: "pythonToolkit",
  reducers: {
    openMenuModal: (state, action) => {
      state.menuModal.push({ isOpen: true, context: action.payload });
    },
    closeMenuModal: (state, action) => {
      state.menuModal = state.menuModal.map(
        (modal) => modal.context.tabID === action.payload.tabID ? { ...modal, isOpen: false } : modal
      );
    },
    removeMenuModal: (state, action) => {
      state.menuModal = state.menuModal.filter((item) => item.context.tabID !== action.payload.tabID);
    }
  }
});
const usePythonToolkitState = (name) => useSelector((state) => state.pythonToolkit[name]);
const PythonToolkitActions = pythonToolkitReducer.actions;
const pythonToolkitReducer$1 = pythonToolkitReducer.reducer;

function Warn_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, height: "1rem", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        opacity: "0.5",
        fill: "currentColor",
        d: "M3 10.417c0-3.198 0-4.797.378-5.335c.377-.537 1.88-1.052 4.887-2.081l.573-.196C10.405 2.268 11.188 2 12 2s1.595.268 3.162.805l.573.196c3.007 1.029 4.51 1.544 4.887 2.081C21 5.62 21 7.22 21 10.417v1.574c0 5.638-4.239 8.375-6.899 9.536C13.38 21.842 13.02 22 12 22s-1.38-.158-2.101-.473C7.239 20.365 3 17.63 3 11.991z"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "M12 7.25a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0V8a.75.75 0 0 1 .75-.75M12 16a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
      }
    )
  ] });
}
function Python_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, height: "1rem", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { fill: "none", height: "1rem" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { fill: "none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { fill: "currentColor", clipPath: "url(#akarIconsPythonFill0)", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969s3.403 5.96 3.403 5.96h2.03v-2.867s-.109-3.42 3.35-3.42h5.766s3.24.052 3.24-3.148V3.202S18.28 0 11.913 0M8.708 1.85c.578 0 1.046.47 1.046 1.052c0 .581-.468 1.051-1.046 1.051s-1.046-.47-1.046-1.051c0-.582.467-1.052 1.046-1.052" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12.087 24c6.092 0 5.712-2.656 5.712-2.656l-.007-2.752h-5.814v-.826h8.123s3.9.445 3.9-5.735s-3.404-5.96-3.404-5.96h-2.03v2.867s.109 3.42-3.35 3.42H9.452s-3.24-.052-3.24 3.148v5.292S5.72 24 12.087 24m3.206-1.85c-.579 0-1.046-.47-1.046-1.052c0-.581.467-1.051 1.046-1.051c.578 0 1.046.47 1.046 1.051c0 .582-.468 1.052-1.046 1.052" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("clipPath", { id: "akarIconsPythonFill0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#fff", d: "M0 0h24v24H0z" }) }) })
    ] })
  ] });
}
function Packages_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, height: "1rem", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { fill: "none", height: "1rem" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "m17.578 4.432l-2-1.05C13.822 2.461 12.944 2 12 2s-1.822.46-3.578 1.382l-.321.169l8.923 5.099l4.016-2.01c-.646-.732-1.688-1.279-3.462-2.21m4.17 3.534l-3.998 2V13a.75.75 0 0 1-1.5 0v-2.286l-3.5 1.75v9.44c.718-.179 1.535-.607 2.828-1.286l2-1.05c2.151-1.129 3.227-1.693 3.825-2.708c.597-1.014.597-2.277.597-4.8v-.117c0-1.893 0-3.076-.252-3.978M11.25 21.904v-9.44l-8.998-4.5C2 8.866 2 10.05 2 11.941v.117c0 2.525 0 3.788.597 4.802c.598 1.015 1.674 1.58 3.825 2.709l2 1.049c1.293.679 2.11 1.107 2.828 1.286M2.96 6.641l9.04 4.52l3.411-1.705l-8.886-5.078l-.103.054c-1.773.93-2.816 1.477-3.462 2.21"
      }
    )
  ] });
}
function Env_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, height: "1rem", viewBox: "0 0 32 32", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "linearGradient",
        {
          y1: "-202.91",
          y2: "-202.84",
          x1: "-133.268",
          x2: "-133.198",
          id: "vscodeIconsFileTypePyenv0",
          gradientUnits: "userSpaceOnUse",
          gradientTransform: "matrix(189.38 0 0 189.81 25243.061 38519.17)",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0", stopColor: "#6f6f6f" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "1", stopColor: "#5e5e5e" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "linearGradient",
        {
          x1: "-133.575",
          x2: "-133.495",
          y1: "-203.203",
          y2: "-203.133",
          id: "vscodeIconsFileTypePyenv1",
          gradientUnits: "userSpaceOnUse",
          gradientTransform: "matrix(189.38 0 0 189.81 25309.061 38583.42)",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0", stopColor: "#dadada" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "1", stopColor: "#c5c5c5" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "url(#vscodeIconsFileTypePyenv0)",
        d: "M15.885 2.1c-7.1 0-6.651 3.07-6.651 3.07v3.19h6.752v1H6.545S2 8.8 2 16.005s4.013 6.912 4.013 6.912H8.33v-3.361s-.13-4.013 3.9-4.013h6.762s3.772.06 3.772-3.652V5.8s.572-3.712-6.842-3.712Zm-3.732 2.137a1.214 1.214 0 1 1-1.183 1.244v-.02a1.214 1.214 0 0 1 1.214-1.214Z"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "url(#vscodeIconsFileTypePyenv1)",
        d: "M16.085 29.91c7.1 0 6.651-3.08 6.651-3.08v-3.18h-6.751v-1h9.47S30 23.158 30 15.995s-4.013-6.912-4.013-6.912H23.64V12.4s.13 4.013-3.9 4.013h-6.765S9.2 16.356 9.2 20.068V26.2s-.572 3.712 6.842 3.712h.04Zm3.732-2.147A1.214 1.214 0 1 1 21 26.519v.03a1.214 1.214 0 0 1-1.214 1.214z"
      }
    )
  ] });
}
function DoubleCheck_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1rem", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { fill: "none", strokeWidth: "1.5", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { opacity: "0.5", d: "m4 12.9l3.143 3.6L15 7.5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m20 7.563l-8.571 9L11 16" })
  ] }) });
}
function Checklist_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, height: "1rem", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { fill: "none", height: "1rem" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { fill: "none", strokeWidth: "1.5", stroke: "currentColor", strokeLinecap: "round", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinejoin: "round", d: "M2 5.5L3.214 7L7.5 3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { opacity: "0.5", strokeLinejoin: "round", d: "M2 12.5L3.214 14L7.5 10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinejoin: "round", d: "M2 19.5L3.214 21L7.5 17" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 19H12" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 12H12", opacity: "0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 5H12" })
    ] })
  ] });
}
function Save_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, height: "1rem", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { fill: "none", height: "1rem" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        fill: "currentColor",
        d: "M20.536 20.536C22 19.07 22 16.714 22 12c0-.341 0-.512-.015-.686a4.04 4.04 0 0 0-.921-2.224a8 8 0 0 0-.483-.504l-5.167-5.167a9 9 0 0 0-.504-.483a4.04 4.04 0 0 0-2.224-.92C12.512 2 12.342 2 12 2C7.286 2 4.929 2 3.464 3.464C2 4.93 2 7.286 2 12s0 7.071 1.464 8.535c.685.685 1.563 1.05 2.786 1.243v-.83c0-.899 0-1.648.08-2.242c.084-.628.27-1.195.725-1.65c.456-.456 1.023-.642 1.65-.726c.595-.08 1.345-.08 2.243-.08h2.104c.899 0 1.648 0 2.242.08c.628.084 1.195.27 1.65.726c.456.455.642 1.022.726 1.65c.08.594.08 1.343.08 2.242v.83c1.223-.194 2.102-.558 2.785-1.242M6.25 8A.75.75 0 0 1 7 7.25h6a.75.75 0 0 1 0 1.5H7A.75.75 0 0 1 6.25 8"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "M16.183 18.905c.065.483.067 1.131.067 2.095v.931C15.094 22 13.7 22 12 22s-3.094 0-4.25-.069V21c0-.964.002-1.612.067-2.095c.062-.461.169-.659.3-.789s.327-.237.788-.3c.483-.064 1.131-.066 2.095-.066h2c.964 0 1.612.002 2.095.067c.461.062.659.169.789.3s.237.327.3.788"
      }
    )
  ] });
}
function AltArrow_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1rem", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      fill: "currentColor",
      d: "m12.37 15.835l6.43-6.63C19.201 8.79 18.958 8 18.43 8H5.57c-.528 0-.771.79-.37 1.205l6.43 6.63c.213.22.527.22.74 0"
    }
  ) });
}
function SolarBoxMinimalisticBoldDuotone(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { height: "1rem", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "currentColor",
        d: "M8.422 20.618C10.178 21.54 11.056 22 12 22V12L2.638 7.073l-.04.067C2 8.154 2 9.417 2 11.942v.117c0 2.524 0 3.787.597 4.801c.598 1.015 1.674 1.58 3.825 2.709z"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        opacity: 0.7,
        fill: "currentColor",
        d: "m17.577 4.432l-2-1.05C13.822 2.461 12.944 2 12 2c-.945 0-1.822.46-3.578 1.382l-2 1.05C4.318 5.536 3.242 6.1 2.638 7.072L12 12l9.362-4.927c-.606-.973-1.68-1.537-3.785-2.641"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        opacity: 0.5,
        fill: "currentColor",
        d: "m21.403 7.14l-.041-.067L12 12v10c.944 0 1.822-.46 3.578-1.382l2-1.05c2.151-1.129 3.227-1.693 3.825-2.708c.597-1.014.597-2.277.597-4.8v-.117c0-2.525 0-3.788-.597-4.802"
      }
    )
  ] });
}
function HardDrive_Icon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { ...props, height: "1em", viewBox: "0 0 16 16", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      fill: "currentColor",
      d: "M12.5 8A1.5 1.5 0 0 1 14 9.5v1.002A1.5 1.5 0 0 1 12.5 12h-9A1.5 1.5 0 0 1 2 10.5v-1A1.5 1.5 0 0 1 3.5 8zm1.058-.766l-1.673-3.507V3.72A1.23 1.23 0 0 0 10.75 3h-5.5a1.23 1.23 0 0 0-1.134.72v.007L2.442 7.234A2.5 2.5 0 0 1 3.5 7h9c.378 0 .737.084 1.058.234M12 10.5a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1"
    }
  ) });
}

const {DropdownItem: DropdownItem$6,DropdownSection: DropdownSection$1} = await importShared('@heroui/react');

const {useCallback: useCallback$6} = await importShared('react');

const {useDispatch: useDispatch$3} = await importShared('react-redux');
function CardMenu({ context }) {
  const activeTab = useTabsState("activeTab");
  const dispatch = useDispatch$3();
  const onPress = useCallback$6(() => {
    dispatch(PythonToolkitActions.openMenuModal({ title: context.title, id: context.id, tabID: activeTab }));
    context?.setMenuIsOpen(false);
  }, [context, activeTab]);
  if (!PYTHON_SUPPORTED_AI.includes(context.id)) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownSection$1, { showDivider: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    DropdownItem$6,
    {
      onPress,
      title: "Dependencies",
      className: "cursor-default",
      startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Python_Icon, { className: "size-3" })
    },
    "python_deps"
  ) }, "python_toolkit");
}

const pythonChannels = {
  removeSavedPython: "remove-saved-python",
  addSavedPython: "add-saved-python",
  changePythonVersion: "change-python-version",
  getAvailableConda: "get-available-conda-pythons",
  downloadProgressConda: "download-conda-python-progress",
  installConda: "install-conda-python",
  isCondaInstalled: "is-conda-installed",
  getInstalledPythons: "get-installed-pythons",
  uninstallPython: "uninstall-python",
  setDefaultPython: "set-default-python",
  getAvailableOfficial: "get-available-pythons",
  downloadProgressOfficial: "download-python-progress",
  installOfficial: "install-official-python",
  createVenv: "create-venv",
  getVenvs: "get-venvs",
  locateVenv: "locate-venv",
  getPackagesInfo: "get-packages-info",
  installPackage: "install-package",
  uninstallPackage: "uninstall-package",
  getPackagesUpdateInfo: "get-packages-update-info",
  getUpdatesReq: "get-updates-req",
  updatePackage: "update-package",
  updateAllPackages: "update-all-packages",
  saveReqs: "save-requirements",
  readReqs: "read-requirements",
  setReqPath: "set-requirements-path",
  getReqPath: "get-requirements-path",
  findReq: "find-req-file",
  locateAIVenv: "locate-ai-venv",
  getAIVenv: "get-ai-venv",
  addAIVenv: "add-ai-venv",
  removeAIVenv: "remove-ai-venv",
  removeAIVenvPath: "remove-ai-venv-path",
  getAIVenvs: "get-ai-venvs",
  findAIVenv: "find-ai-venv",
  checkAIVenvEnabled: "check-ai-venv-enable",
  readFile: "read-file"
};

const ipc = window.electron.ipcRenderer;
const pIpc = {
  removeSavedPython: (pPath) => ipc.send(pythonChannels.removeSavedPython, pPath),
  addSavedPython: (pPath) => ipc.send(pythonChannels.addSavedPython, pPath),
  changePackageVersion: (pythonPath, packageName, currentVersion, targetVersion) => ipc.invoke(pythonChannels.changePythonVersion, pythonPath, packageName, currentVersion, targetVersion),
  getVenvs: () => ipc.invoke(pythonChannels.getVenvs),
  locateVenv: () => ipc.invoke(pythonChannels.locateVenv),
  createVenv: (options) => ipc.invoke(pythonChannels.createVenv, options),
  getPackagesInfo: (pythonPath) => ipc.invoke(pythonChannels.getPackagesInfo, pythonPath),
  getPackagesUpdateInfo: (packages) => ipc.invoke(pythonChannels.getPackagesUpdateInfo, packages),
  updateAllPackages: (pythonPath, packages) => ipc.invoke(pythonChannels.updateAllPackages, pythonPath, packages),
  installPackage: (pythonPath, command) => ipc.invoke(pythonChannels.installPackage, pythonPath, command),
  updatePackage: (pythonPath, packageName) => ipc.invoke(pythonChannels.updatePackage, pythonPath, packageName),
  uninstallPackage: (pythonPath, packageName) => ipc.invoke(pythonChannels.uninstallPackage, pythonPath, packageName),
  readReqs: (filePath) => ipc.invoke(pythonChannels.readReqs, filePath),
  saveReqs: (filePath, data) => ipc.invoke(pythonChannels.saveReqs, filePath, data),
  findReq: (dirPath) => ipc.invoke(pythonChannels.findReq, dirPath),
  setReqPath: (data) => ipc.send(pythonChannels.setReqPath, data),
  getReqPath: (id) => ipc.invoke(pythonChannels.getReqPath, id),
  getInstalledPythons: (refresh) => ipc.invoke(pythonChannels.getInstalledPythons, refresh),
  setDefaultPython: (pythonPath) => ipc.invoke(pythonChannels.setDefaultPython, pythonPath),
  uninstallPython: (path) => ipc.invoke(pythonChannels.uninstallPython, path),
  getAvailableOfficial: () => ipc.invoke(pythonChannels.getAvailableOfficial),
  off_DlProgressOfficial: () => ipc.removeAllListeners(pythonChannels.downloadProgressOfficial),
  on_DlProgressOfficial: (result) => ipc.on(pythonChannels.downloadProgressOfficial, result),
  installOfficial: (version) => ipc.invoke(pythonChannels.installOfficial, version),
  getAvailableConda: () => ipc.invoke(pythonChannels.getAvailableConda),
  off_DlProgressConda: () => ipc.removeAllListeners(pythonChannels.downloadProgressConda),
  on_DlProgressConda: (result) => ipc.on(pythonChannels.downloadProgressConda, result),
  installConda: (envName, version) => ipc.invoke(pythonChannels.installConda, envName, version),
  isCondaInstalled: () => ipc.invoke(pythonChannels.isCondaInstalled),
  locateAIVenv: (id) => ipc.invoke(pythonChannels.locateAIVenv, id),
  getAIVenv: (id) => ipc.invoke(pythonChannels.getAIVenv, id),
  addAIVenv: (id, pythonPath) => ipc.send(pythonChannels.addAIVenv, id, pythonPath),
  removeAIVenv: (id) => ipc.send(pythonChannels.removeAIVenv, id),
  removeAIVenvPath: (path) => ipc.send(pythonChannels.removeAIVenvPath, path),
  getAIVenvs: () => ipc.invoke(pythonChannels.getAIVenvs),
  findAIVenv: (id, folder) => ipc.invoke(pythonChannels.findAIVenv, id, folder),
  checkAIVenvEnabled: () => ipc.send(pythonChannels.checkAIVenvEnabled),
  getUpdatesReq: (reqFile, currentPackages) => ipc.invoke(pythonChannels.getUpdatesReq, reqFile, currentPackages),
  readFile: () => ipc.invoke(pythonChannels.readFile)
};

var re = {exports: {}};

var constants;
var hasRequiredConstants;

function requireConstants () {
	if (hasRequiredConstants) return constants;
	hasRequiredConstants = 1;
	// Note: this is the semver.org version of the spec that it implements
	// Not necessarily the package version of this code.
	const SEMVER_SPEC_VERSION = '2.0.0';

	const MAX_LENGTH = 256;
	const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
	/* istanbul ignore next */ 9007199254740991;

	// Max safe segment length for coercion.
	const MAX_SAFE_COMPONENT_LENGTH = 16;

	// Max safe length for a build identifier. The max length minus 6 characters for
	// the shortest version with a build 0.0.0+BUILD.
	const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;

	const RELEASE_TYPES = [
	  'major',
	  'premajor',
	  'minor',
	  'preminor',
	  'patch',
	  'prepatch',
	  'prerelease',
	];

	constants = {
	  MAX_LENGTH,
	  MAX_SAFE_COMPONENT_LENGTH,
	  MAX_SAFE_BUILD_LENGTH,
	  MAX_SAFE_INTEGER,
	  RELEASE_TYPES,
	  SEMVER_SPEC_VERSION,
	  FLAG_INCLUDE_PRERELEASE: 0b001,
	  FLAG_LOOSE: 0b010,
	};
	return constants;
}

var debug_1;
var hasRequiredDebug;

function requireDebug () {
	if (hasRequiredDebug) return debug_1;
	hasRequiredDebug = 1;
	var define_process_env_default = {};
	const debug = typeof process === "object" && define_process_env_default && define_process_env_default.NODE_DEBUG && /\bsemver\b/i.test(define_process_env_default.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
	};
	debug_1 = debug;
	return debug_1;
}

var hasRequiredRe;

function requireRe () {
	if (hasRequiredRe) return re.exports;
	hasRequiredRe = 1;
	(function (module, exports) {
		const {
		  MAX_SAFE_COMPONENT_LENGTH,
		  MAX_SAFE_BUILD_LENGTH,
		  MAX_LENGTH,
		} = /*@__PURE__*/ requireConstants();
		const debug = /*@__PURE__*/ requireDebug();
		exports = module.exports = {};

		// The actual regexps go on exports.re
		const re = exports.re = [];
		const safeRe = exports.safeRe = [];
		const src = exports.src = [];
		const safeSrc = exports.safeSrc = [];
		const t = exports.t = {};
		let R = 0;

		const LETTERDASHNUMBER = '[a-zA-Z0-9-]';

		// Replace some greedy regex tokens to prevent regex dos issues. These regex are
		// used internally via the safeRe object since all inputs in this library get
		// normalized first to trim and collapse all extra whitespace. The original
		// regexes are exported for userland consumption and lower level usage. A
		// future breaking change could export the safer regex only with a note that
		// all input should have extra whitespace removed.
		const safeRegexReplacements = [
		  ['\\s', 1],
		  ['\\d', MAX_LENGTH],
		  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
		];

		const makeSafeRegex = (value) => {
		  for (const [token, max] of safeRegexReplacements) {
		    value = value
		      .split(`${token}*`).join(`${token}{0,${max}}`)
		      .split(`${token}+`).join(`${token}{1,${max}}`);
		  }
		  return value
		};

		const createToken = (name, value, isGlobal) => {
		  const safe = makeSafeRegex(value);
		  const index = R++;
		  debug(name, index, value);
		  t[name] = index;
		  src[index] = value;
		  safeSrc[index] = safe;
		  re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
		  safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined);
		};

		// The following Regular Expressions can be used for tokenizing,
		// validating, and parsing SemVer version strings.

		// ## Numeric Identifier
		// A single `0`, or a non-zero digit followed by zero or more digits.

		createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
		createToken('NUMERICIDENTIFIERLOOSE', '\\d+');

		// ## Non-numeric Identifier
		// Zero or more digits, followed by a letter or hyphen, and then zero or
		// more letters, digits, or hyphens.

		createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);

		// ## Main Version
		// Three dot-separated numeric identifiers.

		createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
		                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
		                   `(${src[t.NUMERICIDENTIFIER]})`);

		createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
		                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
		                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`);

		// ## Pre-release Version Identifier
		// A numeric identifier, or a non-numeric identifier.

		createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
		}|${src[t.NONNUMERICIDENTIFIER]})`);

		createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
		}|${src[t.NONNUMERICIDENTIFIER]})`);

		// ## Pre-release Version
		// Hyphen, followed by one or more dot-separated pre-release version
		// identifiers.

		createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
		}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);

		createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
		}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);

		// ## Build Metadata Identifier
		// Any combination of digits, letters, or hyphens.

		createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`);

		// ## Build Metadata
		// Plus sign, followed by one or more period-separated build metadata
		// identifiers.

		createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
		}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);

		// ## Full Version String
		// A main version, followed optionally by a pre-release version and
		// build metadata.

		// Note that the only major, minor, patch, and pre-release sections of
		// the version string are capturing groups.  The build metadata is not a
		// capturing group, because it should not ever be used in version
		// comparison.

		createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
		}${src[t.PRERELEASE]}?${
		  src[t.BUILD]}?`);

		createToken('FULL', `^${src[t.FULLPLAIN]}$`);

		// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
		// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
		// common in the npm registry.
		createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
		}${src[t.PRERELEASELOOSE]}?${
		  src[t.BUILD]}?`);

		createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);

		createToken('GTLT', '((?:<|>)?=?)');

		// Something like "2.*" or "1.2.x".
		// Note that "x.x" is a valid xRange identifer, meaning "any version"
		// Only the first item is strictly required.
		createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
		createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);

		createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
		                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
		                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
		                   `(?:${src[t.PRERELEASE]})?${
		                     src[t.BUILD]}?` +
		                   `)?)?`);

		createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
		                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
		                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
		                        `(?:${src[t.PRERELEASELOOSE]})?${
		                          src[t.BUILD]}?` +
		                        `)?)?`);

		createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
		createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);

		// Coercion.
		// Extract anything that could conceivably be a part of a valid semver
		createToken('COERCEPLAIN', `${'(^|[^\\d])' +
		              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
		              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
		              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
		createToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
		createToken('COERCEFULL', src[t.COERCEPLAIN] +
		              `(?:${src[t.PRERELEASE]})?` +
		              `(?:${src[t.BUILD]})?` +
		              `(?:$|[^\\d])`);
		createToken('COERCERTL', src[t.COERCE], true);
		createToken('COERCERTLFULL', src[t.COERCEFULL], true);

		// Tilde ranges.
		// Meaning is "reasonably at or greater than"
		createToken('LONETILDE', '(?:~>?)');

		createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
		exports.tildeTrimReplace = '$1~';

		createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
		createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);

		// Caret ranges.
		// Meaning is "at least and backwards compatible with"
		createToken('LONECARET', '(?:\\^)');

		createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
		exports.caretTrimReplace = '$1^';

		createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
		createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);

		// A simple gt/lt/eq thing, or just "" to indicate "any version"
		createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
		createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);

		// An expression to strip any whitespace between the gtlt and the thing
		// it modifies, so that `> 1.2.3` ==> `>1.2.3`
		createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
		}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
		exports.comparatorTrimReplace = '$1$2$3';

		// Something like `1.2.3 - 1.2.4`
		// Note that these all use the loose form, because they'll be
		// checked against either the strict or loose comparator form
		// later.
		createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
		                   `\\s+-\\s+` +
		                   `(${src[t.XRANGEPLAIN]})` +
		                   `\\s*$`);

		createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
		                        `\\s+-\\s+` +
		                        `(${src[t.XRANGEPLAINLOOSE]})` +
		                        `\\s*$`);

		// Star ranges basically just allow anything at all.
		createToken('STAR', '(<|>)?=?\\s*\\*');
		// >=0.0.0 is like a star
		createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$');
		createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$'); 
	} (re, re.exports));
	return re.exports;
}

var parseOptions_1;
var hasRequiredParseOptions;

function requireParseOptions () {
	if (hasRequiredParseOptions) return parseOptions_1;
	hasRequiredParseOptions = 1;
	// parse out just the options we care about
	const looseOption = Object.freeze({ loose: true });
	const emptyOpts = Object.freeze({ });
	const parseOptions = options => {
	  if (!options) {
	    return emptyOpts
	  }

	  if (typeof options !== 'object') {
	    return looseOption
	  }

	  return options
	};
	parseOptions_1 = parseOptions;
	return parseOptions_1;
}

var identifiers;
var hasRequiredIdentifiers;

function requireIdentifiers () {
	if (hasRequiredIdentifiers) return identifiers;
	hasRequiredIdentifiers = 1;
	const numeric = /^[0-9]+$/;
	const compareIdentifiers = (a, b) => {
	  const anum = numeric.test(a);
	  const bnum = numeric.test(b);

	  if (anum && bnum) {
	    a = +a;
	    b = +b;
	  }

	  return a === b ? 0
	    : (anum && !bnum) ? -1
	    : (bnum && !anum) ? 1
	    : a < b ? -1
	    : 1
	};

	const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);

	identifiers = {
	  compareIdentifiers,
	  rcompareIdentifiers,
	};
	return identifiers;
}

var semver$2;
var hasRequiredSemver$1;

function requireSemver$1 () {
	if (hasRequiredSemver$1) return semver$2;
	hasRequiredSemver$1 = 1;
	const debug = /*@__PURE__*/ requireDebug();
	const { MAX_LENGTH, MAX_SAFE_INTEGER } = /*@__PURE__*/ requireConstants();
	const { safeRe: re, safeSrc: src, t } = /*@__PURE__*/ requireRe();

	const parseOptions = /*@__PURE__*/ requireParseOptions();
	const { compareIdentifiers } = /*@__PURE__*/ requireIdentifiers();
	class SemVer {
	  constructor (version, options) {
	    options = parseOptions(options);

	    if (version instanceof SemVer) {
	      if (version.loose === !!options.loose &&
	        version.includePrerelease === !!options.includePrerelease) {
	        return version
	      } else {
	        version = version.version;
	      }
	    } else if (typeof version !== 'string') {
	      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`)
	    }

	    if (version.length > MAX_LENGTH) {
	      throw new TypeError(
	        `version is longer than ${MAX_LENGTH} characters`
	      )
	    }

	    debug('SemVer', version, options);
	    this.options = options;
	    this.loose = !!options.loose;
	    // this isn't actually relevant for versions, but keep it so that we
	    // don't run into trouble passing this.options around.
	    this.includePrerelease = !!options.includePrerelease;

	    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);

	    if (!m) {
	      throw new TypeError(`Invalid Version: ${version}`)
	    }

	    this.raw = version;

	    // these are actually numbers
	    this.major = +m[1];
	    this.minor = +m[2];
	    this.patch = +m[3];

	    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
	      throw new TypeError('Invalid major version')
	    }

	    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
	      throw new TypeError('Invalid minor version')
	    }

	    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
	      throw new TypeError('Invalid patch version')
	    }

	    // numberify any prerelease numeric ids
	    if (!m[4]) {
	      this.prerelease = [];
	    } else {
	      this.prerelease = m[4].split('.').map((id) => {
	        if (/^[0-9]+$/.test(id)) {
	          const num = +id;
	          if (num >= 0 && num < MAX_SAFE_INTEGER) {
	            return num
	          }
	        }
	        return id
	      });
	    }

	    this.build = m[5] ? m[5].split('.') : [];
	    this.format();
	  }

	  format () {
	    this.version = `${this.major}.${this.minor}.${this.patch}`;
	    if (this.prerelease.length) {
	      this.version += `-${this.prerelease.join('.')}`;
	    }
	    return this.version
	  }

	  toString () {
	    return this.version
	  }

	  compare (other) {
	    debug('SemVer.compare', this.version, this.options, other);
	    if (!(other instanceof SemVer)) {
	      if (typeof other === 'string' && other === this.version) {
	        return 0
	      }
	      other = new SemVer(other, this.options);
	    }

	    if (other.version === this.version) {
	      return 0
	    }

	    return this.compareMain(other) || this.comparePre(other)
	  }

	  compareMain (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    return (
	      compareIdentifiers(this.major, other.major) ||
	      compareIdentifiers(this.minor, other.minor) ||
	      compareIdentifiers(this.patch, other.patch)
	    )
	  }

	  comparePre (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    // NOT having a prerelease is > having one
	    if (this.prerelease.length && !other.prerelease.length) {
	      return -1
	    } else if (!this.prerelease.length && other.prerelease.length) {
	      return 1
	    } else if (!this.prerelease.length && !other.prerelease.length) {
	      return 0
	    }

	    let i = 0;
	    do {
	      const a = this.prerelease[i];
	      const b = other.prerelease[i];
	      debug('prerelease compare', i, a, b);
	      if (a === undefined && b === undefined) {
	        return 0
	      } else if (b === undefined) {
	        return 1
	      } else if (a === undefined) {
	        return -1
	      } else if (a === b) {
	        continue
	      } else {
	        return compareIdentifiers(a, b)
	      }
	    } while (++i)
	  }

	  compareBuild (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    let i = 0;
	    do {
	      const a = this.build[i];
	      const b = other.build[i];
	      debug('build compare', i, a, b);
	      if (a === undefined && b === undefined) {
	        return 0
	      } else if (b === undefined) {
	        return 1
	      } else if (a === undefined) {
	        return -1
	      } else if (a === b) {
	        continue
	      } else {
	        return compareIdentifiers(a, b)
	      }
	    } while (++i)
	  }

	  // preminor will bump the version up to the next minor release, and immediately
	  // down to pre-release. premajor and prepatch work the same way.
	  inc (release, identifier, identifierBase) {
	    if (release.startsWith('pre')) {
	      if (!identifier && identifierBase === false) {
	        throw new Error('invalid increment argument: identifier is empty')
	      }
	      // Avoid an invalid semver results
	      if (identifier) {
	        const r = new RegExp(`^${this.options.loose ? src[t.PRERELEASELOOSE] : src[t.PRERELEASE]}$`);
	        const match = `-${identifier}`.match(r);
	        if (!match || match[1] !== identifier) {
	          throw new Error(`invalid identifier: ${identifier}`)
	        }
	      }
	    }

	    switch (release) {
	      case 'premajor':
	        this.prerelease.length = 0;
	        this.patch = 0;
	        this.minor = 0;
	        this.major++;
	        this.inc('pre', identifier, identifierBase);
	        break
	      case 'preminor':
	        this.prerelease.length = 0;
	        this.patch = 0;
	        this.minor++;
	        this.inc('pre', identifier, identifierBase);
	        break
	      case 'prepatch':
	        // If this is already a prerelease, it will bump to the next version
	        // drop any prereleases that might already exist, since they are not
	        // relevant at this point.
	        this.prerelease.length = 0;
	        this.inc('patch', identifier, identifierBase);
	        this.inc('pre', identifier, identifierBase);
	        break
	      // If the input is a non-prerelease version, this acts the same as
	      // prepatch.
	      case 'prerelease':
	        if (this.prerelease.length === 0) {
	          this.inc('patch', identifier, identifierBase);
	        }
	        this.inc('pre', identifier, identifierBase);
	        break
	      case 'release':
	        if (this.prerelease.length === 0) {
	          throw new Error(`version ${this.raw} is not a prerelease`)
	        }
	        this.prerelease.length = 0;
	        break

	      case 'major':
	        // If this is a pre-major version, bump up to the same major version.
	        // Otherwise increment major.
	        // 1.0.0-5 bumps to 1.0.0
	        // 1.1.0 bumps to 2.0.0
	        if (
	          this.minor !== 0 ||
	          this.patch !== 0 ||
	          this.prerelease.length === 0
	        ) {
	          this.major++;
	        }
	        this.minor = 0;
	        this.patch = 0;
	        this.prerelease = [];
	        break
	      case 'minor':
	        // If this is a pre-minor version, bump up to the same minor version.
	        // Otherwise increment minor.
	        // 1.2.0-5 bumps to 1.2.0
	        // 1.2.1 bumps to 1.3.0
	        if (this.patch !== 0 || this.prerelease.length === 0) {
	          this.minor++;
	        }
	        this.patch = 0;
	        this.prerelease = [];
	        break
	      case 'patch':
	        // If this is not a pre-release version, it will increment the patch.
	        // If it is a pre-release it will bump up to the same patch version.
	        // 1.2.0-5 patches to 1.2.0
	        // 1.2.0 patches to 1.2.1
	        if (this.prerelease.length === 0) {
	          this.patch++;
	        }
	        this.prerelease = [];
	        break
	      // This probably shouldn't be used publicly.
	      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
	      case 'pre': {
	        const base = Number(identifierBase) ? 1 : 0;

	        if (this.prerelease.length === 0) {
	          this.prerelease = [base];
	        } else {
	          let i = this.prerelease.length;
	          while (--i >= 0) {
	            if (typeof this.prerelease[i] === 'number') {
	              this.prerelease[i]++;
	              i = -2;
	            }
	          }
	          if (i === -1) {
	            // didn't increment anything
	            if (identifier === this.prerelease.join('.') && identifierBase === false) {
	              throw new Error('invalid increment argument: identifier already exists')
	            }
	            this.prerelease.push(base);
	          }
	        }
	        if (identifier) {
	          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
	          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
	          let prerelease = [identifier, base];
	          if (identifierBase === false) {
	            prerelease = [identifier];
	          }
	          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
	            if (isNaN(this.prerelease[1])) {
	              this.prerelease = prerelease;
	            }
	          } else {
	            this.prerelease = prerelease;
	          }
	        }
	        break
	      }
	      default:
	        throw new Error(`invalid increment argument: ${release}`)
	    }
	    this.raw = this.format();
	    if (this.build.length) {
	      this.raw += `+${this.build.join('.')}`;
	    }
	    return this
	  }
	}

	semver$2 = SemVer;
	return semver$2;
}

var parse_1;
var hasRequiredParse;

function requireParse () {
	if (hasRequiredParse) return parse_1;
	hasRequiredParse = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const parse = (version, options, throwErrors = false) => {
	  if (version instanceof SemVer) {
	    return version
	  }
	  try {
	    return new SemVer(version, options)
	  } catch (er) {
	    if (!throwErrors) {
	      return null
	    }
	    throw er
	  }
	};

	parse_1 = parse;
	return parse_1;
}

var valid_1;
var hasRequiredValid$1;

function requireValid$1 () {
	if (hasRequiredValid$1) return valid_1;
	hasRequiredValid$1 = 1;
	const parse = /*@__PURE__*/ requireParse();
	const valid = (version, options) => {
	  const v = parse(version, options);
	  return v ? v.version : null
	};
	valid_1 = valid;
	return valid_1;
}

var clean_1;
var hasRequiredClean;

function requireClean () {
	if (hasRequiredClean) return clean_1;
	hasRequiredClean = 1;
	const parse = /*@__PURE__*/ requireParse();
	const clean = (version, options) => {
	  const s = parse(version.trim().replace(/^[=v]+/, ''), options);
	  return s ? s.version : null
	};
	clean_1 = clean;
	return clean_1;
}

var inc_1;
var hasRequiredInc;

function requireInc () {
	if (hasRequiredInc) return inc_1;
	hasRequiredInc = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();

	const inc = (version, release, options, identifier, identifierBase) => {
	  if (typeof (options) === 'string') {
	    identifierBase = identifier;
	    identifier = options;
	    options = undefined;
	  }

	  try {
	    return new SemVer(
	      version instanceof SemVer ? version.version : version,
	      options
	    ).inc(release, identifier, identifierBase).version
	  } catch (er) {
	    return null
	  }
	};
	inc_1 = inc;
	return inc_1;
}

var diff_1;
var hasRequiredDiff;

function requireDiff () {
	if (hasRequiredDiff) return diff_1;
	hasRequiredDiff = 1;
	const parse = /*@__PURE__*/ requireParse();

	const diff = (version1, version2) => {
	  const v1 = parse(version1, null, true);
	  const v2 = parse(version2, null, true);
	  const comparison = v1.compare(v2);

	  if (comparison === 0) {
	    return null
	  }

	  const v1Higher = comparison > 0;
	  const highVersion = v1Higher ? v1 : v2;
	  const lowVersion = v1Higher ? v2 : v1;
	  const highHasPre = !!highVersion.prerelease.length;
	  const lowHasPre = !!lowVersion.prerelease.length;

	  if (lowHasPre && !highHasPre) {
	    // Going from prerelease -> no prerelease requires some special casing

	    // If the low version has only a major, then it will always be a major
	    // Some examples:
	    // 1.0.0-1 -> 1.0.0
	    // 1.0.0-1 -> 1.1.1
	    // 1.0.0-1 -> 2.0.0
	    if (!lowVersion.patch && !lowVersion.minor) {
	      return 'major'
	    }

	    // If the main part has no difference
	    if (lowVersion.compareMain(highVersion) === 0) {
	      if (lowVersion.minor && !lowVersion.patch) {
	        return 'minor'
	      }
	      return 'patch'
	    }
	  }

	  // add the `pre` prefix if we are going to a prerelease version
	  const prefix = highHasPre ? 'pre' : '';

	  if (v1.major !== v2.major) {
	    return prefix + 'major'
	  }

	  if (v1.minor !== v2.minor) {
	    return prefix + 'minor'
	  }

	  if (v1.patch !== v2.patch) {
	    return prefix + 'patch'
	  }

	  // high and low are preleases
	  return 'prerelease'
	};

	diff_1 = diff;
	return diff_1;
}

var major_1;
var hasRequiredMajor;

function requireMajor () {
	if (hasRequiredMajor) return major_1;
	hasRequiredMajor = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const major = (a, loose) => new SemVer(a, loose).major;
	major_1 = major;
	return major_1;
}

var minor_1;
var hasRequiredMinor;

function requireMinor () {
	if (hasRequiredMinor) return minor_1;
	hasRequiredMinor = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const minor = (a, loose) => new SemVer(a, loose).minor;
	minor_1 = minor;
	return minor_1;
}

var patch_1;
var hasRequiredPatch;

function requirePatch () {
	if (hasRequiredPatch) return patch_1;
	hasRequiredPatch = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const patch = (a, loose) => new SemVer(a, loose).patch;
	patch_1 = patch;
	return patch_1;
}

var prerelease_1;
var hasRequiredPrerelease;

function requirePrerelease () {
	if (hasRequiredPrerelease) return prerelease_1;
	hasRequiredPrerelease = 1;
	const parse = /*@__PURE__*/ requireParse();
	const prerelease = (version, options) => {
	  const parsed = parse(version, options);
	  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
	};
	prerelease_1 = prerelease;
	return prerelease_1;
}

var compare_1;
var hasRequiredCompare;

function requireCompare () {
	if (hasRequiredCompare) return compare_1;
	hasRequiredCompare = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const compare = (a, b, loose) =>
	  new SemVer(a, loose).compare(new SemVer(b, loose));

	compare_1 = compare;
	return compare_1;
}

var rcompare_1;
var hasRequiredRcompare;

function requireRcompare () {
	if (hasRequiredRcompare) return rcompare_1;
	hasRequiredRcompare = 1;
	const compare = /*@__PURE__*/ requireCompare();
	const rcompare = (a, b, loose) => compare(b, a, loose);
	rcompare_1 = rcompare;
	return rcompare_1;
}

var compareLoose_1;
var hasRequiredCompareLoose;

function requireCompareLoose () {
	if (hasRequiredCompareLoose) return compareLoose_1;
	hasRequiredCompareLoose = 1;
	const compare = /*@__PURE__*/ requireCompare();
	const compareLoose = (a, b) => compare(a, b, true);
	compareLoose_1 = compareLoose;
	return compareLoose_1;
}

var compareBuild_1;
var hasRequiredCompareBuild;

function requireCompareBuild () {
	if (hasRequiredCompareBuild) return compareBuild_1;
	hasRequiredCompareBuild = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const compareBuild = (a, b, loose) => {
	  const versionA = new SemVer(a, loose);
	  const versionB = new SemVer(b, loose);
	  return versionA.compare(versionB) || versionA.compareBuild(versionB)
	};
	compareBuild_1 = compareBuild;
	return compareBuild_1;
}

var sort_1;
var hasRequiredSort;

function requireSort () {
	if (hasRequiredSort) return sort_1;
	hasRequiredSort = 1;
	const compareBuild = /*@__PURE__*/ requireCompareBuild();
	const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
	sort_1 = sort;
	return sort_1;
}

var rsort_1;
var hasRequiredRsort;

function requireRsort () {
	if (hasRequiredRsort) return rsort_1;
	hasRequiredRsort = 1;
	const compareBuild = /*@__PURE__*/ requireCompareBuild();
	const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
	rsort_1 = rsort;
	return rsort_1;
}

var gt_1;
var hasRequiredGt;

function requireGt () {
	if (hasRequiredGt) return gt_1;
	hasRequiredGt = 1;
	const compare = /*@__PURE__*/ requireCompare();
	const gt = (a, b, loose) => compare(a, b, loose) > 0;
	gt_1 = gt;
	return gt_1;
}

var lt_1;
var hasRequiredLt;

function requireLt () {
	if (hasRequiredLt) return lt_1;
	hasRequiredLt = 1;
	const compare = /*@__PURE__*/ requireCompare();
	const lt = (a, b, loose) => compare(a, b, loose) < 0;
	lt_1 = lt;
	return lt_1;
}

var eq_1;
var hasRequiredEq;

function requireEq () {
	if (hasRequiredEq) return eq_1;
	hasRequiredEq = 1;
	const compare = /*@__PURE__*/ requireCompare();
	const eq = (a, b, loose) => compare(a, b, loose) === 0;
	eq_1 = eq;
	return eq_1;
}

var neq_1;
var hasRequiredNeq;

function requireNeq () {
	if (hasRequiredNeq) return neq_1;
	hasRequiredNeq = 1;
	const compare = /*@__PURE__*/ requireCompare();
	const neq = (a, b, loose) => compare(a, b, loose) !== 0;
	neq_1 = neq;
	return neq_1;
}

var gte_1;
var hasRequiredGte;

function requireGte () {
	if (hasRequiredGte) return gte_1;
	hasRequiredGte = 1;
	const compare = /*@__PURE__*/ requireCompare();
	const gte = (a, b, loose) => compare(a, b, loose) >= 0;
	gte_1 = gte;
	return gte_1;
}

var lte_1;
var hasRequiredLte;

function requireLte () {
	if (hasRequiredLte) return lte_1;
	hasRequiredLte = 1;
	const compare = /*@__PURE__*/ requireCompare();
	const lte = (a, b, loose) => compare(a, b, loose) <= 0;
	lte_1 = lte;
	return lte_1;
}

var cmp_1;
var hasRequiredCmp;

function requireCmp () {
	if (hasRequiredCmp) return cmp_1;
	hasRequiredCmp = 1;
	const eq = /*@__PURE__*/ requireEq();
	const neq = /*@__PURE__*/ requireNeq();
	const gt = /*@__PURE__*/ requireGt();
	const gte = /*@__PURE__*/ requireGte();
	const lt = /*@__PURE__*/ requireLt();
	const lte = /*@__PURE__*/ requireLte();

	const cmp = (a, op, b, loose) => {
	  switch (op) {
	    case '===':
	      if (typeof a === 'object') {
	        a = a.version;
	      }
	      if (typeof b === 'object') {
	        b = b.version;
	      }
	      return a === b

	    case '!==':
	      if (typeof a === 'object') {
	        a = a.version;
	      }
	      if (typeof b === 'object') {
	        b = b.version;
	      }
	      return a !== b

	    case '':
	    case '=':
	    case '==':
	      return eq(a, b, loose)

	    case '!=':
	      return neq(a, b, loose)

	    case '>':
	      return gt(a, b, loose)

	    case '>=':
	      return gte(a, b, loose)

	    case '<':
	      return lt(a, b, loose)

	    case '<=':
	      return lte(a, b, loose)

	    default:
	      throw new TypeError(`Invalid operator: ${op}`)
	  }
	};
	cmp_1 = cmp;
	return cmp_1;
}

var coerce_1;
var hasRequiredCoerce;

function requireCoerce () {
	if (hasRequiredCoerce) return coerce_1;
	hasRequiredCoerce = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const parse = /*@__PURE__*/ requireParse();
	const { safeRe: re, t } = /*@__PURE__*/ requireRe();

	const coerce = (version, options) => {
	  if (version instanceof SemVer) {
	    return version
	  }

	  if (typeof version === 'number') {
	    version = String(version);
	  }

	  if (typeof version !== 'string') {
	    return null
	  }

	  options = options || {};

	  let match = null;
	  if (!options.rtl) {
	    match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
	  } else {
	    // Find the right-most coercible string that does not share
	    // a terminus with a more left-ward coercible string.
	    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
	    // With includePrerelease option set, '1.2.3.4-rc' wants to coerce '2.3.4-rc', not '2.3.4'
	    //
	    // Walk through the string checking with a /g regexp
	    // Manually set the index so as to pick up overlapping matches.
	    // Stop when we get a match that ends at the string end, since no
	    // coercible string can be more right-ward without the same terminus.
	    const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
	    let next;
	    while ((next = coerceRtlRegex.exec(version)) &&
	        (!match || match.index + match[0].length !== version.length)
	    ) {
	      if (!match ||
	            next.index + next[0].length !== match.index + match[0].length) {
	        match = next;
	      }
	      coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
	    }
	    // leave it in a clean state
	    coerceRtlRegex.lastIndex = -1;
	  }

	  if (match === null) {
	    return null
	  }

	  const major = match[2];
	  const minor = match[3] || '0';
	  const patch = match[4] || '0';
	  const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : '';
	  const build = options.includePrerelease && match[6] ? `+${match[6]}` : '';

	  return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options)
	};
	coerce_1 = coerce;
	return coerce_1;
}

var lrucache;
var hasRequiredLrucache;

function requireLrucache () {
	if (hasRequiredLrucache) return lrucache;
	hasRequiredLrucache = 1;
	class LRUCache {
	  constructor () {
	    this.max = 1000;
	    this.map = new Map();
	  }

	  get (key) {
	    const value = this.map.get(key);
	    if (value === undefined) {
	      return undefined
	    } else {
	      // Remove the key from the map and add it to the end
	      this.map.delete(key);
	      this.map.set(key, value);
	      return value
	    }
	  }

	  delete (key) {
	    return this.map.delete(key)
	  }

	  set (key, value) {
	    const deleted = this.delete(key);

	    if (!deleted && value !== undefined) {
	      // If cache is full, delete the least recently used item
	      if (this.map.size >= this.max) {
	        const firstKey = this.map.keys().next().value;
	        this.delete(firstKey);
	      }

	      this.map.set(key, value);
	    }

	    return this
	  }
	}

	lrucache = LRUCache;
	return lrucache;
}

var range;
var hasRequiredRange;

function requireRange () {
	if (hasRequiredRange) return range;
	hasRequiredRange = 1;
	const SPACE_CHARACTERS = /\s+/g;

	// hoisted class for cyclic dependency
	class Range {
	  constructor (range, options) {
	    options = parseOptions(options);

	    if (range instanceof Range) {
	      if (
	        range.loose === !!options.loose &&
	        range.includePrerelease === !!options.includePrerelease
	      ) {
	        return range
	      } else {
	        return new Range(range.raw, options)
	      }
	    }

	    if (range instanceof Comparator) {
	      // just put it in the set and return
	      this.raw = range.value;
	      this.set = [[range]];
	      this.formatted = undefined;
	      return this
	    }

	    this.options = options;
	    this.loose = !!options.loose;
	    this.includePrerelease = !!options.includePrerelease;

	    // First reduce all whitespace as much as possible so we do not have to rely
	    // on potentially slow regexes like \s*. This is then stored and used for
	    // future error messages as well.
	    this.raw = range.trim().replace(SPACE_CHARACTERS, ' ');

	    // First, split on ||
	    this.set = this.raw
	      .split('||')
	      // map the range to a 2d array of comparators
	      .map(r => this.parseRange(r.trim()))
	      // throw out any comparator lists that are empty
	      // this generally means that it was not a valid range, which is allowed
	      // in loose mode, but will still throw if the WHOLE range is invalid.
	      .filter(c => c.length);

	    if (!this.set.length) {
	      throw new TypeError(`Invalid SemVer Range: ${this.raw}`)
	    }

	    // if we have any that are not the null set, throw out null sets.
	    if (this.set.length > 1) {
	      // keep the first one, in case they're all null sets
	      const first = this.set[0];
	      this.set = this.set.filter(c => !isNullSet(c[0]));
	      if (this.set.length === 0) {
	        this.set = [first];
	      } else if (this.set.length > 1) {
	        // if we have any that are *, then the range is just *
	        for (const c of this.set) {
	          if (c.length === 1 && isAny(c[0])) {
	            this.set = [c];
	            break
	          }
	        }
	      }
	    }

	    this.formatted = undefined;
	  }

	  get range () {
	    if (this.formatted === undefined) {
	      this.formatted = '';
	      for (let i = 0; i < this.set.length; i++) {
	        if (i > 0) {
	          this.formatted += '||';
	        }
	        const comps = this.set[i];
	        for (let k = 0; k < comps.length; k++) {
	          if (k > 0) {
	            this.formatted += ' ';
	          }
	          this.formatted += comps[k].toString().trim();
	        }
	      }
	    }
	    return this.formatted
	  }

	  format () {
	    return this.range
	  }

	  toString () {
	    return this.range
	  }

	  parseRange (range) {
	    // memoize range parsing for performance.
	    // this is a very hot path, and fully deterministic.
	    const memoOpts =
	      (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) |
	      (this.options.loose && FLAG_LOOSE);
	    const memoKey = memoOpts + ':' + range;
	    const cached = cache.get(memoKey);
	    if (cached) {
	      return cached
	    }

	    const loose = this.options.loose;
	    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
	    const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
	    range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
	    debug('hyphen replace', range);

	    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
	    range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
	    debug('comparator trim', range);

	    // `~ 1.2.3` => `~1.2.3`
	    range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
	    debug('tilde trim', range);

	    // `^ 1.2.3` => `^1.2.3`
	    range = range.replace(re[t.CARETTRIM], caretTrimReplace);
	    debug('caret trim', range);

	    // At this point, the range is completely trimmed and
	    // ready to be split into comparators.

	    let rangeList = range
	      .split(' ')
	      .map(comp => parseComparator(comp, this.options))
	      .join(' ')
	      .split(/\s+/)
	      // >=0.0.0 is equivalent to *
	      .map(comp => replaceGTE0(comp, this.options));

	    if (loose) {
	      // in loose mode, throw out any that are not valid comparators
	      rangeList = rangeList.filter(comp => {
	        debug('loose invalid filter', comp, this.options);
	        return !!comp.match(re[t.COMPARATORLOOSE])
	      });
	    }
	    debug('range list', rangeList);

	    // if any comparators are the null set, then replace with JUST null set
	    // if more than one comparator, remove any * comparators
	    // also, don't include the same comparator more than once
	    const rangeMap = new Map();
	    const comparators = rangeList.map(comp => new Comparator(comp, this.options));
	    for (const comp of comparators) {
	      if (isNullSet(comp)) {
	        return [comp]
	      }
	      rangeMap.set(comp.value, comp);
	    }
	    if (rangeMap.size > 1 && rangeMap.has('')) {
	      rangeMap.delete('');
	    }

	    const result = [...rangeMap.values()];
	    cache.set(memoKey, result);
	    return result
	  }

	  intersects (range, options) {
	    if (!(range instanceof Range)) {
	      throw new TypeError('a Range is required')
	    }

	    return this.set.some((thisComparators) => {
	      return (
	        isSatisfiable(thisComparators, options) &&
	        range.set.some((rangeComparators) => {
	          return (
	            isSatisfiable(rangeComparators, options) &&
	            thisComparators.every((thisComparator) => {
	              return rangeComparators.every((rangeComparator) => {
	                return thisComparator.intersects(rangeComparator, options)
	              })
	            })
	          )
	        })
	      )
	    })
	  }

	  // if ANY of the sets match ALL of its comparators, then pass
	  test (version) {
	    if (!version) {
	      return false
	    }

	    if (typeof version === 'string') {
	      try {
	        version = new SemVer(version, this.options);
	      } catch (er) {
	        return false
	      }
	    }

	    for (let i = 0; i < this.set.length; i++) {
	      if (testSet(this.set[i], version, this.options)) {
	        return true
	      }
	    }
	    return false
	  }
	}

	range = Range;

	const LRU = /*@__PURE__*/ requireLrucache();
	const cache = new LRU();

	const parseOptions = /*@__PURE__*/ requireParseOptions();
	const Comparator = /*@__PURE__*/ requireComparator();
	const debug = /*@__PURE__*/ requireDebug();
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const {
	  safeRe: re,
	  t,
	  comparatorTrimReplace,
	  tildeTrimReplace,
	  caretTrimReplace,
	} = /*@__PURE__*/ requireRe();
	const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = /*@__PURE__*/ requireConstants();

	const isNullSet = c => c.value === '<0.0.0-0';
	const isAny = c => c.value === '';

	// take a set of comparators and determine whether there
	// exists a version which can satisfy it
	const isSatisfiable = (comparators, options) => {
	  let result = true;
	  const remainingComparators = comparators.slice();
	  let testComparator = remainingComparators.pop();

	  while (result && remainingComparators.length) {
	    result = remainingComparators.every((otherComparator) => {
	      return testComparator.intersects(otherComparator, options)
	    });

	    testComparator = remainingComparators.pop();
	  }

	  return result
	};

	// comprised of xranges, tildes, stars, and gtlt's at this point.
	// already replaced the hyphen ranges
	// turn into a set of JUST comparators.
	const parseComparator = (comp, options) => {
	  debug('comp', comp, options);
	  comp = replaceCarets(comp, options);
	  debug('caret', comp);
	  comp = replaceTildes(comp, options);
	  debug('tildes', comp);
	  comp = replaceXRanges(comp, options);
	  debug('xrange', comp);
	  comp = replaceStars(comp, options);
	  debug('stars', comp);
	  return comp
	};

	const isX = id => !id || id.toLowerCase() === 'x' || id === '*';

	// ~, ~> --> * (any, kinda silly)
	// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
	// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
	// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
	// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
	// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
	// ~0.0.1 --> >=0.0.1 <0.1.0-0
	const replaceTildes = (comp, options) => {
	  return comp
	    .trim()
	    .split(/\s+/)
	    .map((c) => replaceTilde(c, options))
	    .join(' ')
	};

	const replaceTilde = (comp, options) => {
	  const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
	  return comp.replace(r, (_, M, m, p, pr) => {
	    debug('tilde', comp, _, M, m, p, pr);
	    let ret;

	    if (isX(M)) {
	      ret = '';
	    } else if (isX(m)) {
	      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
	    } else if (isX(p)) {
	      // ~1.2 == >=1.2.0 <1.3.0-0
	      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
	    } else if (pr) {
	      debug('replaceTilde pr', pr);
	      ret = `>=${M}.${m}.${p}-${pr
	      } <${M}.${+m + 1}.0-0`;
	    } else {
	      // ~1.2.3 == >=1.2.3 <1.3.0-0
	      ret = `>=${M}.${m}.${p
	      } <${M}.${+m + 1}.0-0`;
	    }

	    debug('tilde return', ret);
	    return ret
	  })
	};

	// ^ --> * (any, kinda silly)
	// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
	// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
	// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
	// ^1.2.3 --> >=1.2.3 <2.0.0-0
	// ^1.2.0 --> >=1.2.0 <2.0.0-0
	// ^0.0.1 --> >=0.0.1 <0.0.2-0
	// ^0.1.0 --> >=0.1.0 <0.2.0-0
	const replaceCarets = (comp, options) => {
	  return comp
	    .trim()
	    .split(/\s+/)
	    .map((c) => replaceCaret(c, options))
	    .join(' ')
	};

	const replaceCaret = (comp, options) => {
	  debug('caret', comp, options);
	  const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
	  const z = options.includePrerelease ? '-0' : '';
	  return comp.replace(r, (_, M, m, p, pr) => {
	    debug('caret', comp, _, M, m, p, pr);
	    let ret;

	    if (isX(M)) {
	      ret = '';
	    } else if (isX(m)) {
	      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
	    } else if (isX(p)) {
	      if (M === '0') {
	        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
	      } else {
	        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
	      }
	    } else if (pr) {
	      debug('replaceCaret pr', pr);
	      if (M === '0') {
	        if (m === '0') {
	          ret = `>=${M}.${m}.${p}-${pr
	          } <${M}.${m}.${+p + 1}-0`;
	        } else {
	          ret = `>=${M}.${m}.${p}-${pr
	          } <${M}.${+m + 1}.0-0`;
	        }
	      } else {
	        ret = `>=${M}.${m}.${p}-${pr
	        } <${+M + 1}.0.0-0`;
	      }
	    } else {
	      debug('no pr');
	      if (M === '0') {
	        if (m === '0') {
	          ret = `>=${M}.${m}.${p
	          }${z} <${M}.${m}.${+p + 1}-0`;
	        } else {
	          ret = `>=${M}.${m}.${p
	          }${z} <${M}.${+m + 1}.0-0`;
	        }
	      } else {
	        ret = `>=${M}.${m}.${p
	        } <${+M + 1}.0.0-0`;
	      }
	    }

	    debug('caret return', ret);
	    return ret
	  })
	};

	const replaceXRanges = (comp, options) => {
	  debug('replaceXRanges', comp, options);
	  return comp
	    .split(/\s+/)
	    .map((c) => replaceXRange(c, options))
	    .join(' ')
	};

	const replaceXRange = (comp, options) => {
	  comp = comp.trim();
	  const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
	  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
	    debug('xRange', comp, ret, gtlt, M, m, p, pr);
	    const xM = isX(M);
	    const xm = xM || isX(m);
	    const xp = xm || isX(p);
	    const anyX = xp;

	    if (gtlt === '=' && anyX) {
	      gtlt = '';
	    }

	    // if we're including prereleases in the match, then we need
	    // to fix this to -0, the lowest possible prerelease value
	    pr = options.includePrerelease ? '-0' : '';

	    if (xM) {
	      if (gtlt === '>' || gtlt === '<') {
	        // nothing is allowed
	        ret = '<0.0.0-0';
	      } else {
	        // nothing is forbidden
	        ret = '*';
	      }
	    } else if (gtlt && anyX) {
	      // we know patch is an x, because we have any x at all.
	      // replace X with 0
	      if (xm) {
	        m = 0;
	      }
	      p = 0;

	      if (gtlt === '>') {
	        // >1 => >=2.0.0
	        // >1.2 => >=1.3.0
	        gtlt = '>=';
	        if (xm) {
	          M = +M + 1;
	          m = 0;
	          p = 0;
	        } else {
	          m = +m + 1;
	          p = 0;
	        }
	      } else if (gtlt === '<=') {
	        // <=0.7.x is actually <0.8.0, since any 0.7.x should
	        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
	        gtlt = '<';
	        if (xm) {
	          M = +M + 1;
	        } else {
	          m = +m + 1;
	        }
	      }

	      if (gtlt === '<') {
	        pr = '-0';
	      }

	      ret = `${gtlt + M}.${m}.${p}${pr}`;
	    } else if (xm) {
	      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
	    } else if (xp) {
	      ret = `>=${M}.${m}.0${pr
	      } <${M}.${+m + 1}.0-0`;
	    }

	    debug('xRange return', ret);

	    return ret
	  })
	};

	// Because * is AND-ed with everything else in the comparator,
	// and '' means "any version", just remove the *s entirely.
	const replaceStars = (comp, options) => {
	  debug('replaceStars', comp, options);
	  // Looseness is ignored here.  star is always as loose as it gets!
	  return comp
	    .trim()
	    .replace(re[t.STAR], '')
	};

	const replaceGTE0 = (comp, options) => {
	  debug('replaceGTE0', comp, options);
	  return comp
	    .trim()
	    .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')
	};

	// This function is passed to string.replace(re[t.HYPHENRANGE])
	// M, m, patch, prerelease, build
	// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
	// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
	// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
	// TODO build?
	const hyphenReplace = incPr => ($0,
	  from, fM, fm, fp, fpr, fb,
	  to, tM, tm, tp, tpr) => {
	  if (isX(fM)) {
	    from = '';
	  } else if (isX(fm)) {
	    from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
	  } else if (isX(fp)) {
	    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
	  } else if (fpr) {
	    from = `>=${from}`;
	  } else {
	    from = `>=${from}${incPr ? '-0' : ''}`;
	  }

	  if (isX(tM)) {
	    to = '';
	  } else if (isX(tm)) {
	    to = `<${+tM + 1}.0.0-0`;
	  } else if (isX(tp)) {
	    to = `<${tM}.${+tm + 1}.0-0`;
	  } else if (tpr) {
	    to = `<=${tM}.${tm}.${tp}-${tpr}`;
	  } else if (incPr) {
	    to = `<${tM}.${tm}.${+tp + 1}-0`;
	  } else {
	    to = `<=${to}`;
	  }

	  return `${from} ${to}`.trim()
	};

	const testSet = (set, version, options) => {
	  for (let i = 0; i < set.length; i++) {
	    if (!set[i].test(version)) {
	      return false
	    }
	  }

	  if (version.prerelease.length && !options.includePrerelease) {
	    // Find the set of versions that are allowed to have prereleases
	    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
	    // That should allow `1.2.3-pr.2` to pass.
	    // However, `1.2.4-alpha.notready` should NOT be allowed,
	    // even though it's within the range set by the comparators.
	    for (let i = 0; i < set.length; i++) {
	      debug(set[i].semver);
	      if (set[i].semver === Comparator.ANY) {
	        continue
	      }

	      if (set[i].semver.prerelease.length > 0) {
	        const allowed = set[i].semver;
	        if (allowed.major === version.major &&
	            allowed.minor === version.minor &&
	            allowed.patch === version.patch) {
	          return true
	        }
	      }
	    }

	    // Version has a -pre, but it's not one of the ones we like.
	    return false
	  }

	  return true
	};
	return range;
}

var comparator;
var hasRequiredComparator;

function requireComparator () {
	if (hasRequiredComparator) return comparator;
	hasRequiredComparator = 1;
	const ANY = Symbol('SemVer ANY');
	// hoisted class for cyclic dependency
	class Comparator {
	  static get ANY () {
	    return ANY
	  }

	  constructor (comp, options) {
	    options = parseOptions(options);

	    if (comp instanceof Comparator) {
	      if (comp.loose === !!options.loose) {
	        return comp
	      } else {
	        comp = comp.value;
	      }
	    }

	    comp = comp.trim().split(/\s+/).join(' ');
	    debug('comparator', comp, options);
	    this.options = options;
	    this.loose = !!options.loose;
	    this.parse(comp);

	    if (this.semver === ANY) {
	      this.value = '';
	    } else {
	      this.value = this.operator + this.semver.version;
	    }

	    debug('comp', this);
	  }

	  parse (comp) {
	    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
	    const m = comp.match(r);

	    if (!m) {
	      throw new TypeError(`Invalid comparator: ${comp}`)
	    }

	    this.operator = m[1] !== undefined ? m[1] : '';
	    if (this.operator === '=') {
	      this.operator = '';
	    }

	    // if it literally is just '>' or '' then allow anything.
	    if (!m[2]) {
	      this.semver = ANY;
	    } else {
	      this.semver = new SemVer(m[2], this.options.loose);
	    }
	  }

	  toString () {
	    return this.value
	  }

	  test (version) {
	    debug('Comparator.test', version, this.options.loose);

	    if (this.semver === ANY || version === ANY) {
	      return true
	    }

	    if (typeof version === 'string') {
	      try {
	        version = new SemVer(version, this.options);
	      } catch (er) {
	        return false
	      }
	    }

	    return cmp(version, this.operator, this.semver, this.options)
	  }

	  intersects (comp, options) {
	    if (!(comp instanceof Comparator)) {
	      throw new TypeError('a Comparator is required')
	    }

	    if (this.operator === '') {
	      if (this.value === '') {
	        return true
	      }
	      return new Range(comp.value, options).test(this.value)
	    } else if (comp.operator === '') {
	      if (comp.value === '') {
	        return true
	      }
	      return new Range(this.value, options).test(comp.semver)
	    }

	    options = parseOptions(options);

	    // Special cases where nothing can possibly be lower
	    if (options.includePrerelease &&
	      (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')) {
	      return false
	    }
	    if (!options.includePrerelease &&
	      (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))) {
	      return false
	    }

	    // Same direction increasing (> or >=)
	    if (this.operator.startsWith('>') && comp.operator.startsWith('>')) {
	      return true
	    }
	    // Same direction decreasing (< or <=)
	    if (this.operator.startsWith('<') && comp.operator.startsWith('<')) {
	      return true
	    }
	    // same SemVer and both sides are inclusive (<= or >=)
	    if (
	      (this.semver.version === comp.semver.version) &&
	      this.operator.includes('=') && comp.operator.includes('=')) {
	      return true
	    }
	    // opposite directions less than
	    if (cmp(this.semver, '<', comp.semver, options) &&
	      this.operator.startsWith('>') && comp.operator.startsWith('<')) {
	      return true
	    }
	    // opposite directions greater than
	    if (cmp(this.semver, '>', comp.semver, options) &&
	      this.operator.startsWith('<') && comp.operator.startsWith('>')) {
	      return true
	    }
	    return false
	  }
	}

	comparator = Comparator;

	const parseOptions = /*@__PURE__*/ requireParseOptions();
	const { safeRe: re, t } = /*@__PURE__*/ requireRe();
	const cmp = /*@__PURE__*/ requireCmp();
	const debug = /*@__PURE__*/ requireDebug();
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const Range = /*@__PURE__*/ requireRange();
	return comparator;
}

var satisfies_1;
var hasRequiredSatisfies;

function requireSatisfies () {
	if (hasRequiredSatisfies) return satisfies_1;
	hasRequiredSatisfies = 1;
	const Range = /*@__PURE__*/ requireRange();
	const satisfies = (version, range, options) => {
	  try {
	    range = new Range(range, options);
	  } catch (er) {
	    return false
	  }
	  return range.test(version)
	};
	satisfies_1 = satisfies;
	return satisfies_1;
}

var toComparators_1;
var hasRequiredToComparators;

function requireToComparators () {
	if (hasRequiredToComparators) return toComparators_1;
	hasRequiredToComparators = 1;
	const Range = /*@__PURE__*/ requireRange();

	// Mostly just for testing and legacy API reasons
	const toComparators = (range, options) =>
	  new Range(range, options).set
	    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '));

	toComparators_1 = toComparators;
	return toComparators_1;
}

var maxSatisfying_1;
var hasRequiredMaxSatisfying;

function requireMaxSatisfying () {
	if (hasRequiredMaxSatisfying) return maxSatisfying_1;
	hasRequiredMaxSatisfying = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const Range = /*@__PURE__*/ requireRange();

	const maxSatisfying = (versions, range, options) => {
	  let max = null;
	  let maxSV = null;
	  let rangeObj = null;
	  try {
	    rangeObj = new Range(range, options);
	  } catch (er) {
	    return null
	  }
	  versions.forEach((v) => {
	    if (rangeObj.test(v)) {
	      // satisfies(v, range, options)
	      if (!max || maxSV.compare(v) === -1) {
	        // compare(max, v, true)
	        max = v;
	        maxSV = new SemVer(max, options);
	      }
	    }
	  });
	  return max
	};
	maxSatisfying_1 = maxSatisfying;
	return maxSatisfying_1;
}

var minSatisfying_1;
var hasRequiredMinSatisfying;

function requireMinSatisfying () {
	if (hasRequiredMinSatisfying) return minSatisfying_1;
	hasRequiredMinSatisfying = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const Range = /*@__PURE__*/ requireRange();
	const minSatisfying = (versions, range, options) => {
	  let min = null;
	  let minSV = null;
	  let rangeObj = null;
	  try {
	    rangeObj = new Range(range, options);
	  } catch (er) {
	    return null
	  }
	  versions.forEach((v) => {
	    if (rangeObj.test(v)) {
	      // satisfies(v, range, options)
	      if (!min || minSV.compare(v) === 1) {
	        // compare(min, v, true)
	        min = v;
	        minSV = new SemVer(min, options);
	      }
	    }
	  });
	  return min
	};
	minSatisfying_1 = minSatisfying;
	return minSatisfying_1;
}

var minVersion_1;
var hasRequiredMinVersion;

function requireMinVersion () {
	if (hasRequiredMinVersion) return minVersion_1;
	hasRequiredMinVersion = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const Range = /*@__PURE__*/ requireRange();
	const gt = /*@__PURE__*/ requireGt();

	const minVersion = (range, loose) => {
	  range = new Range(range, loose);

	  let minver = new SemVer('0.0.0');
	  if (range.test(minver)) {
	    return minver
	  }

	  minver = new SemVer('0.0.0-0');
	  if (range.test(minver)) {
	    return minver
	  }

	  minver = null;
	  for (let i = 0; i < range.set.length; ++i) {
	    const comparators = range.set[i];

	    let setMin = null;
	    comparators.forEach((comparator) => {
	      // Clone to avoid manipulating the comparator's semver object.
	      const compver = new SemVer(comparator.semver.version);
	      switch (comparator.operator) {
	        case '>':
	          if (compver.prerelease.length === 0) {
	            compver.patch++;
	          } else {
	            compver.prerelease.push(0);
	          }
	          compver.raw = compver.format();
	          /* fallthrough */
	        case '':
	        case '>=':
	          if (!setMin || gt(compver, setMin)) {
	            setMin = compver;
	          }
	          break
	        case '<':
	        case '<=':
	          /* Ignore maximum versions */
	          break
	        /* istanbul ignore next */
	        default:
	          throw new Error(`Unexpected operation: ${comparator.operator}`)
	      }
	    });
	    if (setMin && (!minver || gt(minver, setMin))) {
	      minver = setMin;
	    }
	  }

	  if (minver && range.test(minver)) {
	    return minver
	  }

	  return null
	};
	minVersion_1 = minVersion;
	return minVersion_1;
}

var valid;
var hasRequiredValid;

function requireValid () {
	if (hasRequiredValid) return valid;
	hasRequiredValid = 1;
	const Range = /*@__PURE__*/ requireRange();
	const validRange = (range, options) => {
	  try {
	    // Return '*' instead of '' so that truthiness works.
	    // This will throw if it's invalid anyway
	    return new Range(range, options).range || '*'
	  } catch (er) {
	    return null
	  }
	};
	valid = validRange;
	return valid;
}

var outside_1;
var hasRequiredOutside;

function requireOutside () {
	if (hasRequiredOutside) return outside_1;
	hasRequiredOutside = 1;
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const Comparator = /*@__PURE__*/ requireComparator();
	const { ANY } = Comparator;
	const Range = /*@__PURE__*/ requireRange();
	const satisfies = /*@__PURE__*/ requireSatisfies();
	const gt = /*@__PURE__*/ requireGt();
	const lt = /*@__PURE__*/ requireLt();
	const lte = /*@__PURE__*/ requireLte();
	const gte = /*@__PURE__*/ requireGte();

	const outside = (version, range, hilo, options) => {
	  version = new SemVer(version, options);
	  range = new Range(range, options);

	  let gtfn, ltefn, ltfn, comp, ecomp;
	  switch (hilo) {
	    case '>':
	      gtfn = gt;
	      ltefn = lte;
	      ltfn = lt;
	      comp = '>';
	      ecomp = '>=';
	      break
	    case '<':
	      gtfn = lt;
	      ltefn = gte;
	      ltfn = gt;
	      comp = '<';
	      ecomp = '<=';
	      break
	    default:
	      throw new TypeError('Must provide a hilo val of "<" or ">"')
	  }

	  // If it satisfies the range it is not outside
	  if (satisfies(version, range, options)) {
	    return false
	  }

	  // From now on, variable terms are as if we're in "gtr" mode.
	  // but note that everything is flipped for the "ltr" function.

	  for (let i = 0; i < range.set.length; ++i) {
	    const comparators = range.set[i];

	    let high = null;
	    let low = null;

	    comparators.forEach((comparator) => {
	      if (comparator.semver === ANY) {
	        comparator = new Comparator('>=0.0.0');
	      }
	      high = high || comparator;
	      low = low || comparator;
	      if (gtfn(comparator.semver, high.semver, options)) {
	        high = comparator;
	      } else if (ltfn(comparator.semver, low.semver, options)) {
	        low = comparator;
	      }
	    });

	    // If the edge version comparator has a operator then our version
	    // isn't outside it
	    if (high.operator === comp || high.operator === ecomp) {
	      return false
	    }

	    // If the lowest version comparator has an operator and our version
	    // is less than it then it isn't higher than the range
	    if ((!low.operator || low.operator === comp) &&
	        ltefn(version, low.semver)) {
	      return false
	    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
	      return false
	    }
	  }
	  return true
	};

	outside_1 = outside;
	return outside_1;
}

var gtr_1;
var hasRequiredGtr;

function requireGtr () {
	if (hasRequiredGtr) return gtr_1;
	hasRequiredGtr = 1;
	// Determine if version is greater than all the versions possible in the range.
	const outside = /*@__PURE__*/ requireOutside();
	const gtr = (version, range, options) => outside(version, range, '>', options);
	gtr_1 = gtr;
	return gtr_1;
}

var ltr_1;
var hasRequiredLtr;

function requireLtr () {
	if (hasRequiredLtr) return ltr_1;
	hasRequiredLtr = 1;
	const outside = /*@__PURE__*/ requireOutside();
	// Determine if version is less than all the versions possible in the range
	const ltr = (version, range, options) => outside(version, range, '<', options);
	ltr_1 = ltr;
	return ltr_1;
}

var intersects_1;
var hasRequiredIntersects;

function requireIntersects () {
	if (hasRequiredIntersects) return intersects_1;
	hasRequiredIntersects = 1;
	const Range = /*@__PURE__*/ requireRange();
	const intersects = (r1, r2, options) => {
	  r1 = new Range(r1, options);
	  r2 = new Range(r2, options);
	  return r1.intersects(r2, options)
	};
	intersects_1 = intersects;
	return intersects_1;
}

var simplify;
var hasRequiredSimplify;

function requireSimplify () {
	if (hasRequiredSimplify) return simplify;
	hasRequiredSimplify = 1;
	// given a set of versions and a range, create a "simplified" range
	// that includes the same versions that the original range does
	// If the original range is shorter than the simplified one, return that.
	const satisfies = /*@__PURE__*/ requireSatisfies();
	const compare = /*@__PURE__*/ requireCompare();
	simplify = (versions, range, options) => {
	  const set = [];
	  let first = null;
	  let prev = null;
	  const v = versions.sort((a, b) => compare(a, b, options));
	  for (const version of v) {
	    const included = satisfies(version, range, options);
	    if (included) {
	      prev = version;
	      if (!first) {
	        first = version;
	      }
	    } else {
	      if (prev) {
	        set.push([first, prev]);
	      }
	      prev = null;
	      first = null;
	    }
	  }
	  if (first) {
	    set.push([first, null]);
	  }

	  const ranges = [];
	  for (const [min, max] of set) {
	    if (min === max) {
	      ranges.push(min);
	    } else if (!max && min === v[0]) {
	      ranges.push('*');
	    } else if (!max) {
	      ranges.push(`>=${min}`);
	    } else if (min === v[0]) {
	      ranges.push(`<=${max}`);
	    } else {
	      ranges.push(`${min} - ${max}`);
	    }
	  }
	  const simplified = ranges.join(' || ');
	  const original = typeof range.raw === 'string' ? range.raw : String(range);
	  return simplified.length < original.length ? simplified : range
	};
	return simplify;
}

var subset_1;
var hasRequiredSubset;

function requireSubset () {
	if (hasRequiredSubset) return subset_1;
	hasRequiredSubset = 1;
	const Range = /*@__PURE__*/ requireRange();
	const Comparator = /*@__PURE__*/ requireComparator();
	const { ANY } = Comparator;
	const satisfies = /*@__PURE__*/ requireSatisfies();
	const compare = /*@__PURE__*/ requireCompare();

	// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
	// - Every simple range `r1, r2, ...` is a null set, OR
	// - Every simple range `r1, r2, ...` which is not a null set is a subset of
	//   some `R1, R2, ...`
	//
	// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
	// - If c is only the ANY comparator
	//   - If C is only the ANY comparator, return true
	//   - Else if in prerelease mode, return false
	//   - else replace c with `[>=0.0.0]`
	// - If C is only the ANY comparator
	//   - if in prerelease mode, return true
	//   - else replace C with `[>=0.0.0]`
	// - Let EQ be the set of = comparators in c
	// - If EQ is more than one, return true (null set)
	// - Let GT be the highest > or >= comparator in c
	// - Let LT be the lowest < or <= comparator in c
	// - If GT and LT, and GT.semver > LT.semver, return true (null set)
	// - If any C is a = range, and GT or LT are set, return false
	// - If EQ
	//   - If GT, and EQ does not satisfy GT, return true (null set)
	//   - If LT, and EQ does not satisfy LT, return true (null set)
	//   - If EQ satisfies every C, return true
	//   - Else return false
	// - If GT
	//   - If GT.semver is lower than any > or >= comp in C, return false
	//   - If GT is >=, and GT.semver does not satisfy every C, return false
	//   - If GT.semver has a prerelease, and not in prerelease mode
	//     - If no C has a prerelease and the GT.semver tuple, return false
	// - If LT
	//   - If LT.semver is greater than any < or <= comp in C, return false
	//   - If LT is <=, and LT.semver does not satisfy every C, return false
	//   - If GT.semver has a prerelease, and not in prerelease mode
	//     - If no C has a prerelease and the LT.semver tuple, return false
	// - Else return true

	const subset = (sub, dom, options = {}) => {
	  if (sub === dom) {
	    return true
	  }

	  sub = new Range(sub, options);
	  dom = new Range(dom, options);
	  let sawNonNull = false;

	  OUTER: for (const simpleSub of sub.set) {
	    for (const simpleDom of dom.set) {
	      const isSub = simpleSubset(simpleSub, simpleDom, options);
	      sawNonNull = sawNonNull || isSub !== null;
	      if (isSub) {
	        continue OUTER
	      }
	    }
	    // the null set is a subset of everything, but null simple ranges in
	    // a complex range should be ignored.  so if we saw a non-null range,
	    // then we know this isn't a subset, but if EVERY simple range was null,
	    // then it is a subset.
	    if (sawNonNull) {
	      return false
	    }
	  }
	  return true
	};

	const minimumVersionWithPreRelease = [new Comparator('>=0.0.0-0')];
	const minimumVersion = [new Comparator('>=0.0.0')];

	const simpleSubset = (sub, dom, options) => {
	  if (sub === dom) {
	    return true
	  }

	  if (sub.length === 1 && sub[0].semver === ANY) {
	    if (dom.length === 1 && dom[0].semver === ANY) {
	      return true
	    } else if (options.includePrerelease) {
	      sub = minimumVersionWithPreRelease;
	    } else {
	      sub = minimumVersion;
	    }
	  }

	  if (dom.length === 1 && dom[0].semver === ANY) {
	    if (options.includePrerelease) {
	      return true
	    } else {
	      dom = minimumVersion;
	    }
	  }

	  const eqSet = new Set();
	  let gt, lt;
	  for (const c of sub) {
	    if (c.operator === '>' || c.operator === '>=') {
	      gt = higherGT(gt, c, options);
	    } else if (c.operator === '<' || c.operator === '<=') {
	      lt = lowerLT(lt, c, options);
	    } else {
	      eqSet.add(c.semver);
	    }
	  }

	  if (eqSet.size > 1) {
	    return null
	  }

	  let gtltComp;
	  if (gt && lt) {
	    gtltComp = compare(gt.semver, lt.semver, options);
	    if (gtltComp > 0) {
	      return null
	    } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {
	      return null
	    }
	  }

	  // will iterate one or zero times
	  for (const eq of eqSet) {
	    if (gt && !satisfies(eq, String(gt), options)) {
	      return null
	    }

	    if (lt && !satisfies(eq, String(lt), options)) {
	      return null
	    }

	    for (const c of dom) {
	      if (!satisfies(eq, String(c), options)) {
	        return false
	      }
	    }

	    return true
	  }

	  let higher, lower;
	  let hasDomLT, hasDomGT;
	  // if the subset has a prerelease, we need a comparator in the superset
	  // with the same tuple and a prerelease, or it's not a subset
	  let needDomLTPre = lt &&
	    !options.includePrerelease &&
	    lt.semver.prerelease.length ? lt.semver : false;
	  let needDomGTPre = gt &&
	    !options.includePrerelease &&
	    gt.semver.prerelease.length ? gt.semver : false;
	  // exception: <1.2.3-0 is the same as <1.2.3
	  if (needDomLTPre && needDomLTPre.prerelease.length === 1 &&
	      lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
	    needDomLTPre = false;
	  }

	  for (const c of dom) {
	    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>=';
	    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<=';
	    if (gt) {
	      if (needDomGTPre) {
	        if (c.semver.prerelease && c.semver.prerelease.length &&
	            c.semver.major === needDomGTPre.major &&
	            c.semver.minor === needDomGTPre.minor &&
	            c.semver.patch === needDomGTPre.patch) {
	          needDomGTPre = false;
	        }
	      }
	      if (c.operator === '>' || c.operator === '>=') {
	        higher = higherGT(gt, c, options);
	        if (higher === c && higher !== gt) {
	          return false
	        }
	      } else if (gt.operator === '>=' && !satisfies(gt.semver, String(c), options)) {
	        return false
	      }
	    }
	    if (lt) {
	      if (needDomLTPre) {
	        if (c.semver.prerelease && c.semver.prerelease.length &&
	            c.semver.major === needDomLTPre.major &&
	            c.semver.minor === needDomLTPre.minor &&
	            c.semver.patch === needDomLTPre.patch) {
	          needDomLTPre = false;
	        }
	      }
	      if (c.operator === '<' || c.operator === '<=') {
	        lower = lowerLT(lt, c, options);
	        if (lower === c && lower !== lt) {
	          return false
	        }
	      } else if (lt.operator === '<=' && !satisfies(lt.semver, String(c), options)) {
	        return false
	      }
	    }
	    if (!c.operator && (lt || gt) && gtltComp !== 0) {
	      return false
	    }
	  }

	  // if there was a < or >, and nothing in the dom, then must be false
	  // UNLESS it was limited by another range in the other direction.
	  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
	  if (gt && hasDomLT && !lt && gtltComp !== 0) {
	    return false
	  }

	  if (lt && hasDomGT && !gt && gtltComp !== 0) {
	    return false
	  }

	  // we needed a prerelease range in a specific tuple, but didn't get one
	  // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
	  // because it includes prereleases in the 1.2.3 tuple
	  if (needDomGTPre || needDomLTPre) {
	    return false
	  }

	  return true
	};

	// >=1.2.3 is lower than >1.2.3
	const higherGT = (a, b, options) => {
	  if (!a) {
	    return b
	  }
	  const comp = compare(a.semver, b.semver, options);
	  return comp > 0 ? a
	    : comp < 0 ? b
	    : b.operator === '>' && a.operator === '>=' ? b
	    : a
	};

	// <=1.2.3 is higher than <1.2.3
	const lowerLT = (a, b, options) => {
	  if (!a) {
	    return b
	  }
	  const comp = compare(a.semver, b.semver, options);
	  return comp < 0 ? a
	    : comp > 0 ? b
	    : b.operator === '<' && a.operator === '<=' ? b
	    : a
	};

	subset_1 = subset;
	return subset_1;
}

var semver$1;
var hasRequiredSemver;

function requireSemver () {
	if (hasRequiredSemver) return semver$1;
	hasRequiredSemver = 1;
	// just pre-load all the stuff that index.js lazily exports
	const internalRe = /*@__PURE__*/ requireRe();
	const constants = /*@__PURE__*/ requireConstants();
	const SemVer = /*@__PURE__*/ requireSemver$1();
	const identifiers = /*@__PURE__*/ requireIdentifiers();
	const parse = /*@__PURE__*/ requireParse();
	const valid = /*@__PURE__*/ requireValid$1();
	const clean = /*@__PURE__*/ requireClean();
	const inc = /*@__PURE__*/ requireInc();
	const diff = /*@__PURE__*/ requireDiff();
	const major = /*@__PURE__*/ requireMajor();
	const minor = /*@__PURE__*/ requireMinor();
	const patch = /*@__PURE__*/ requirePatch();
	const prerelease = /*@__PURE__*/ requirePrerelease();
	const compare = /*@__PURE__*/ requireCompare();
	const rcompare = /*@__PURE__*/ requireRcompare();
	const compareLoose = /*@__PURE__*/ requireCompareLoose();
	const compareBuild = /*@__PURE__*/ requireCompareBuild();
	const sort = /*@__PURE__*/ requireSort();
	const rsort = /*@__PURE__*/ requireRsort();
	const gt = /*@__PURE__*/ requireGt();
	const lt = /*@__PURE__*/ requireLt();
	const eq = /*@__PURE__*/ requireEq();
	const neq = /*@__PURE__*/ requireNeq();
	const gte = /*@__PURE__*/ requireGte();
	const lte = /*@__PURE__*/ requireLte();
	const cmp = /*@__PURE__*/ requireCmp();
	const coerce = /*@__PURE__*/ requireCoerce();
	const Comparator = /*@__PURE__*/ requireComparator();
	const Range = /*@__PURE__*/ requireRange();
	const satisfies = /*@__PURE__*/ requireSatisfies();
	const toComparators = /*@__PURE__*/ requireToComparators();
	const maxSatisfying = /*@__PURE__*/ requireMaxSatisfying();
	const minSatisfying = /*@__PURE__*/ requireMinSatisfying();
	const minVersion = /*@__PURE__*/ requireMinVersion();
	const validRange = /*@__PURE__*/ requireValid();
	const outside = /*@__PURE__*/ requireOutside();
	const gtr = /*@__PURE__*/ requireGtr();
	const ltr = /*@__PURE__*/ requireLtr();
	const intersects = /*@__PURE__*/ requireIntersects();
	const simplifyRange = /*@__PURE__*/ requireSimplify();
	const subset = /*@__PURE__*/ requireSubset();
	semver$1 = {
	  parse,
	  valid,
	  clean,
	  inc,
	  diff,
	  major,
	  minor,
	  patch,
	  prerelease,
	  compare,
	  rcompare,
	  compareLoose,
	  compareBuild,
	  sort,
	  rsort,
	  gt,
	  lt,
	  eq,
	  neq,
	  gte,
	  lte,
	  cmp,
	  coerce,
	  Comparator,
	  Range,
	  satisfies,
	  toComparators,
	  maxSatisfying,
	  minSatisfying,
	  minVersion,
	  validRange,
	  outside,
	  gtr,
	  ltr,
	  intersects,
	  simplifyRange,
	  subset,
	  SemVer,
	  re: internalRe.re,
	  src: internalRe.src,
	  tokens: internalRe.t,
	  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
	  RELEASE_TYPES: constants.RELEASE_TYPES,
	  compareIdentifiers: identifiers.compareIdentifiers,
	  rcompareIdentifiers: identifiers.rcompareIdentifiers,
	};
	return semver$1;
}

var semverExports = /*@__PURE__*/ requireSemver();
const semver = /*@__PURE__*/getDefaultExportFromCjs(semverExports);

function getUpdateType(currentVersion, updateVersion) {
  const currentVersionNormalized = semver.coerce(currentVersion)?.version;
  const updateVersionNormalized = semver.coerce(updateVersion)?.version;
  if (!currentVersionNormalized || !updateVersionNormalized) {
    console.warn(`Invalid version(s): current=${currentVersion}, update=${updateVersion}`);
    return null;
  }
  return semver.diff(currentVersionNormalized, updateVersionNormalized);
}
function getUpdateVersionColor(currentVersion, updateVersion) {
  const updateType = getUpdateType(currentVersion, updateVersion);
  switch (updateType) {
    case "prerelease":
      return "text-blue-500";
    case "major":
      return "text-red-500";
    case "minor":
      return "text-yellow-500";
    case "patch":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
}
function formatSizeMB(mb) {
  if (mb > 1024) {
    return (mb / 1024).toFixed(2) + " GB";
  } else {
    return mb + " MB";
  }
}
function bytesToMegabytes(bytes) {
  if (bytes < 0) {
    throw new Error("Bytes value cannot be negative");
  }
  const megabytes = bytes / (1024 * 1024);
  return parseFloat(megabytes.toFixed(2));
}

const {Button: Button$m,Dropdown: Dropdown$5,DropdownItem: DropdownItem$5,DropdownMenu: DropdownMenu$5,DropdownTrigger: DropdownTrigger$5} = await importShared('@heroui/react');

const {capitalize: capitalize$1} = await importShared('lodash');

const {useEffect: useEffect$i,useState: useState$o} = await importShared('react');
function Body_SelectPythonV({ id, setPythonPath }) {
  const [installedPythons, setInstalledPythons] = useState$o([]);
  const handleSelectVersion = (python) => {
    pIpc.addAIVenv(id, python.installPath);
    setPythonPath?.(python.installPath);
  };
  useEffect$i(() => {
    pIpc.getInstalledPythons(false).then((result) => {
      setInstalledPythons(result);
    });
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dropdown$5, { size: "sm", showArrow: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownTrigger$5, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$m, { color: "secondary", children: "Select Python Version" }, "select_python_version") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenu$5, { children: installedPythons.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      DropdownItem$5,
      {
        onPress: () => handleSelectVersion(p),
        color: p.isDefault ? "secondary" : "default",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-x-1 items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: p.version }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground-500 font-semibold text-xs", children: capitalize$1(p.installationType) }),
          p.isDefault && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-secondary", children: "System Default" })
        ] })
      },
      p.version
    )) })
  ] });
}

const {Button: Button$l,Input: Input$7,Popover: Popover$4,PopoverContent: PopoverContent$4,PopoverTrigger: PopoverTrigger$4} = await importShared('@heroui/react');

const {message: message$8} = await importShared('antd');

const {isEmpty: isEmpty$e} = await importShared('lodash');

const {useCallback: useCallback$5,useEffect: useEffect$h,useMemo: useMemo$a,useState: useState$n} = await importShared('react');
function ActionButtons({ item, removed, pythonPath, isUninstalling, setIsUninstalling, updated }) {
  const [isUninstallOpen, setIsUninstallOpen] = useState$n(false);
  const [isChangeItemOpen, setIsChangeItemOpen] = useState$n(false);
  const [versionValue, setVersionValue] = useState$n(item.version);
  const [isChanging, setIsChanging] = useState$n(false);
  useEffect$h(() => {
    if (!isChangeItemOpen) setVersionValue(item.version);
  }, [isChangeItemOpen]);
  const remove = useCallback$5(() => {
    setIsUninstallOpen(false);
    setIsUninstalling(true);
    pIpc.uninstallPackage(pythonPath, item.name).then(() => {
      removed(item.name);
      message$8.success(`Package "${item.name}" removed successfully.`);
    }).catch(() => {
      message$8.error(`Failed to remove package "${item.name}".`);
    }).finally(() => {
      setIsUninstalling(false);
    });
  }, [item]);
  const changeVersion = useCallback$5(() => {
    setIsChanging(true);
    setIsChangeItemOpen(false);
    pIpc.changePackageVersion(pythonPath, item.name, item.version, versionValue).then(() => {
      updated(item.name, versionValue);
      message$8.success(`${item.name} package changed to ${versionValue}`);
    }).catch((e) => {
      message$8.error(e);
    }).finally(() => {
      setIsChanging(false);
    });
  }, [pythonPath, item, versionValue]);
  const upgradeProps = useMemo$a(() => {
    if (isEmpty$e(versionValue)) return { color: "default", title: "Invalid Version", disabled: true };
    const currentVersion = semver.coerce(item.version)?.version;
    const targetVersion = semver.coerce(versionValue)?.version;
    if (!currentVersion || !targetVersion) return { color: "default", title: "Change version", disabled: false };
    const areVersionsValid = semverExports.valid(currentVersion) && semverExports.valid(targetVersion);
    if (!areVersionsValid) {
      return { color: "default", title: "Change version", disabled: false };
    }
    const comparison = semverExports.compare(currentVersion, targetVersion);
    if (comparison === 0) {
      return { color: "default", title: "No Different", disabled: true };
    }
    const isUpgrade = comparison === -1;
    return {
      color: isUpgrade ? "success" : "warning",
      title: isUpgrade ? "Upgrade" : "Downgrade",
      disabled: false
    };
  }, [item, versionValue]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-center gap-x-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Popover$4,
      {
        size: "sm",
        color: "danger",
        placement: "left",
        isOpen: isUninstallOpen,
        className: "max-w-[15rem]",
        onOpenChange: setIsUninstallOpen,
        showArrow: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger$4, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$l, { size: "sm", color: "danger", variant: "flat", isLoading: isUninstalling, isIconOnly: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash_Icon, { className: "size-3.5" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent$4, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              'Are you sure you want to remove the package "',
              item.name,
              '"?'
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button$l, { size: "sm", onPress: remove, fullWidth: true, children: "Remove" })
          ] }) })
        ]
      },
      "uninstall"
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Popover$4,
      {
        size: "sm",
        placement: "left",
        isOpen: isChangeItemOpen,
        className: "max-w-[15rem]",
        onOpenChange: setIsChangeItemOpen,
        showArrow: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger$4, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$l, { size: "sm", variant: "flat", isLoading: isChanging, isIconOnly: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SolarBoxMinimalisticBoldDuotone, { className: "size-3.5" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent$4, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 space-y-2 flex flex-col items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: item.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input$7, { size: "sm", value: versionValue, onValueChange: setVersionValue }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button$l,
              {
                size: "sm",
                onPress: changeVersion,
                color: upgradeProps.color,
                isDisabled: upgradeProps.disabled,
                fullWidth: true,
                children: upgradeProps.title
              }
            )
          ] }) })
        ]
      },
      "change_item"
    )
  ] });
}

const {Button: Button$k} = await importShared('@heroui/react');

const {message: message$7} = await importShared('antd');

const {useCallback: useCallback$4,useState: useState$m} = await importShared('react');
function Body_TableItem({ item, pythonPath, updated, removed, columnKey, isSelected }) {
  const [isUpdating, setIsUpdating] = useState$m(false);
  const [isUninstalling, setIsUninstalling] = useState$m(false);
  const update = useCallback$4(() => {
    setIsUpdating(true);
    pIpc.updatePackage(pythonPath, item.name).then(() => {
      updated(item.name, item.updateVersion);
      message$7.success(`Package "${item.name}" updated successfully.`);
    }).catch(() => {
      message$7.error(`Failed to update package "${item.name}".`);
    }).finally(() => {
      setIsUpdating(false);
    });
  }, [item]);
  if (columnKey === "actions") {
    return !isUpdating && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ActionButtons,
      {
        item,
        updated,
        removed,
        pythonPath,
        isUninstalling,
        setIsUninstalling
      }
    );
  } else if (columnKey === "update") {
    return !isSelected && !isUninstalling && item.updateVersion && /* @__PURE__ */ jsxRuntimeExports.jsx(Button$k, { size: "sm", variant: "flat", color: "success", onPress: update, isLoading: isUpdating, children: isUpdating ? "Updating..." : "Update" }, "update");
  } else if (columnKey === "name") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-bold text-sm capitalize", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-x-1 text-medium font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.name }),
        item.updateVersion && /* @__PURE__ */ jsxRuntimeExports.jsx(Warn_Icon, { className: `${getUpdateVersionColor(item.version, item.updateVersion)} size-[1.1rem]` })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-bold text-sm capitalize text-default-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-x-1 text-tiny", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.version }),
        item.updateVersion && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "(",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: getUpdateVersionColor(item.version, item.updateVersion), children: item.updateVersion }),
          ")"
        ] })
      ] }) })
    ] }) });
  }
  return null;
}

const {Button: Button$j,ModalBody: ModalBody$4,Spinner: Spinner$3,Table: Table$1,TableBody: TableBody$1,TableCell: TableCell$1,TableColumn: TableColumn$1,TableHeader: TableHeader$1,TableRow: TableRow$1} = await importShared('@heroui/react');

const {Result: Result$2} = await importShared('antd');

const {cloneDeep,isEmpty: isEmpty$d} = await importShared('lodash');
const {useMemo: useMemo$9} = await importShared('react');
function PackageManagerBody({
  id,
  items,
  isLoading,
  pythonPath,
  updated,
  removed,
  isValidPython,
  isLocating,
  locateVenv,
  setSelectedKeys,
  packagesUpdate,
  selectedKeys,
  setPythonPath
}) {
  const isDarkMode = useAppState("darkMode");
  const anyUpdateAvailable = useMemo$9(() => packagesUpdate.length !== 0, [packagesUpdate]);
  const disabledKeys = useMemo$9(() => {
    if (isEmpty$d(packagesUpdate)) return [];
    return items.filter((item) => !packagesUpdate.some((update) => update.name === item.name)).map((item) => item.name);
  }, [items, packagesUpdate]);
  const columns = useMemo$9(() => {
    const data = [
      { key: "name", label: "Name" },
      { key: "actions", label: "Actions" }
    ];
    if (anyUpdateAvailable) data.splice(1, 0, { key: "update", label: "Update" });
    return data;
  }, [anyUpdateAvailable]);
  const refreshedItems = useMemo$9(() => cloneDeep(items), [items, selectedKeys]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ModalBody$4,
    {
      options: {
        overflow: { x: "hidden", y: "scroll" },
        scrollbars: {
          autoHide: "move",
          clickScroll: true,
          theme: isDarkMode ? "os-theme-light" : "os-theme-dark"
        }
      },
      className: "size-full p-4",
      as: g,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full flex flex-col gap-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row gap-8 flex-wrap justify-center", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Spinner$3,
        {
          size: "lg",
          className: "mb-4",
          label: "Please wait, loading package data...",
          classNames: { circle2: "border-b-[#ffe66e]", circle1: "border-b-[#ffe66e] " }
        }
      ) : isValidPython ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Table$1,
        {
          color: "success",
          "aria-label": "pacakges",
          disabledKeys,
          selectedKeys,
          onSelectionChange: setSelectedKeys,
          selectionMode: anyUpdateAvailable ? "multiple" : "none",
          classNames: { wrapper: "bg-foreground-200 dark:bg-black/50" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader$1, { columns, children: (column) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableColumn$1, { children: column.label }, column.key) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody$1, { items: refreshedItems, children: (item) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow$1, { children: (columnKey) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Body_TableItem,
              {
                item,
                removed,
                updated,
                pythonPath,
                columnKey,
                isSelected: selectedKeys === "all" || selectedKeys.has(item.name)
              }
            ) }) }, item.name) })
          ]
        }
      ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        Result$2,
        {
          subTitle: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Please ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "locate venv" }),
            " folder or",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "select python version" }),
            "."
          ] }),
          extra: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-x-2 justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button$j, { color: "primary", onPress: locateVenv, isLoading: isLocating, children: !isLocating && "Locate VENV" }, "locate_venv"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Body_SelectPythonV, { id, setPythonPath })
          ] }),
          status: "404",
          title: "Could not find a virtual environment."
        }
      ) }) })
    }
  );
}

const {Pagination} = await importShared('@heroui/react');

const {isEmpty: isEmpty$c} = await importShared('lodash');

const {useEffect: useEffect$g,useMemo: useMemo$8,useState: useState$l} = await importShared('react');

function Footer_TablePage({ searchData, setItems }) {
  const [page, setPage] = useState$l(1);
  const [rowsPerPage] = useState$l(50);
  const pages = useMemo$8(() => Math.ceil(searchData.length / rowsPerPage), [searchData, rowsPerPage]);
  useEffect$g(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const data = searchData.slice(start, end);
    setItems(data);
  }, [page, searchData]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full justify-center absolute left-1/2 -translate-x-1/2", children: !isEmpty$c(searchData) && /* @__PURE__ */ jsxRuntimeExports.jsx(Pagination, { size: "lg", page, total: pages, color: "secondary", onChange: setPage, isCompact: true, showControls: true }) });
}

const {Button: Button$i,getKeyValue,Input: Input$6,Select: Select$1,SelectItem: SelectItem$1,Table,TableBody,TableCell,TableColumn,TableHeader,TableRow} = await importShared('@heroui/react');
const {useEffect: useEffect$f,useState: useState$k} = await importShared('react');
const operators = [
  { key: "all", label: "Any" },
  { key: "==", label: "==" },
  { key: ">=", label: ">=" },
  { key: "<=", label: "<=" },
  { key: ">", label: ">" },
  { key: "<", label: "<" },
  { key: "!=", label: "!=" },
  { key: "~=", label: "~=" }
];
function RequirementsManager({ requirements, setRequirements, scrollRef }) {
  const darkMode = useAppState("darkMode");
  const [tableReq, setTableReq] = useState$k([]);
  const handleRequirementChange = (index, updatedRequirement) => {
    setRequirements((prevState) => prevState.map((req, i) => i === index ? updatedRequirement : req));
  };
  const handleDeleteRequirement = (name) => {
    setRequirements((prevState) => prevState.filter((item) => item.name !== name));
  };
  useEffect$f(() => {
    setTableReq(
      requirements.map((req, index) => {
        return {
          key: req.name,
          name: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input$6,
            {
              size: "sm",
              spellCheck: "false",
              autoFocus: req.autoFocus,
              defaultValue: req.name || "",
              onValueChange: (name) => handleRequirementChange(index, { ...req, name })
            }
          ),
          version: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input$6,
            {
              size: "sm",
              spellCheck: "false",
              defaultValue: req.version || "",
              onValueChange: (version) => handleRequirementChange(index, { ...req, version })
            }
          ),
          operator: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Select$1,
            {
              onSelectionChange: (selected) => handleRequirementChange(index, {
                ...req,
                versionOperator: selected.values().next().value || "all"
              }),
              size: "sm",
              "aria-label": "Operator selection",
              classNames: { mainWrapper: "!min-w-20" },
              defaultSelectedKeys: [req.versionOperator || "all"],
              children: operators.map((op) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem$1, { "aria-label": op.label, children: op.label }, op.key))
            }
          ),
          actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$i, { size: "sm", color: "danger", variant: "flat", onPress: () => handleDeleteRequirement(req.name), children: "Remove" })
        };
      })
    );
  }, [requirements]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    g,
    {
      options: {
        overflow: { x: "hidden", y: "scroll" },
        scrollbars: {
          autoHide: "move",
          clickScroll: true,
          theme: darkMode ? "os-theme-light" : "os-theme-dark"
        }
      },
      ref: scrollRef,
      className: "pr-4",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { "aria-label": "requirements data", classNames: { wrapper: "bg-foreground-200 dark:bg-black/50" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TableHeader,
          {
            columns: [
              { key: "name", label: "Name" },
              { key: "operator", label: "Operator" },
              { key: "version", label: "Version" },
              { key: "actions", label: "Actions" }
            ],
            children: (column) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableColumn, { children: column.label }, column.key)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { items: tableReq, children: (item) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: (columnKey) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getKeyValue(item, columnKey) }) }, item.key) })
      ] })
    }
  );
}

const {Button: Button$h,Input: Input$5,Modal: Modal$4,ModalBody: ModalBody$3,ModalContent: ModalContent$4,ModalFooter: ModalFooter$3,ModalHeader: ModalHeader$4} = await importShared('@heroui/react');

const {Empty: Empty$2,message: message$6,Result: Result$1} = await importShared('antd');

const {isEmpty: isEmpty$b} = await importShared('lodash');

const {useEffect: useEffect$e,useRef,useState: useState$j} = await importShared('react');
function RequirementsBtn({ id, projectPath, setIsReqAvailable, show }) {
  const [isOpen, setIsOpen] = useState$j(false);
  const [requirements, setRequirements] = useState$j([]);
  const [filePath, setFilePath] = useState$j("");
  const [isSaving, setIsSaving] = useState$j(false);
  const [searchValue, setSearchValue] = useState$j("");
  const [searchReqs, setSearchReqs] = useState$j([]);
  useEffect$e(() => {
    setIsReqAvailable(!!filePath);
  }, [filePath]);
  useEffect$e(() => {
    const findReqs = () => {
      if (projectPath) {
        pIpc.findReq(projectPath).then((reqPath) => {
          if (reqPath) {
            pIpc.setReqPath({ id, path: reqPath });
            setFilePath(reqPath);
          }
        });
      }
    };
    pIpc.getReqPath(id).then((reqPath) => {
      if (reqPath) {
        setFilePath(reqPath);
      } else {
        findReqs();
      }
    }).catch((err) => {
      console.log(err);
      findReqs();
    });
  }, [projectPath, id]);
  useEffect$e(() => {
    setSearchReqs(requirements.filter((item) => searchInStrings(searchValue, [item.name])));
  }, [searchValue, requirements]);
  const scrollRef = useRef(null);
  const scrollToBottom = () => {
    const { current } = scrollRef;
    const osInstance = current?.osInstance();
    if (!osInstance) {
      return;
    }
    const { scrollOffsetElement } = osInstance.elements();
    const { scrollHeight } = scrollOffsetElement;
    scrollOffsetElement.scrollTo({ behavior: "smooth", top: scrollHeight + 100 });
  };
  useEffect$e(() => {
    pIpc.readReqs(filePath).then((result) => {
      setRequirements(result);
    });
  }, [filePath]);
  const handleAddRequirement = () => {
    setRequirements((prevRequirements) => [
      ...prevRequirements,
      { name: "", versionOperator: null, version: null, originalLine: "", autoFocus: true }
    ]);
    scrollToBottom();
  };
  const handleSaveRequirements = () => {
    if (filePath) {
      setIsSaving(true);
      pIpc.saveReqs(filePath, requirements).then((success) => {
        if (success) {
          message$6.success("Requirements saved successfully!");
        } else {
          message$6.error("Failed to save requirements.");
        }
        setIsSaving(false);
      });
    }
  };
  const openFilePath = () => {
    rendererIpc.file.openDlg({
      properties: ["openFile"],
      filters: [{ name: "Text", extensions: ["txt"] }]
    }).then((file) => {
      if (file) {
        setFilePath(file);
        pIpc.setReqPath({ id, path: file });
      }
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal$4,
      {
        size: "2xl",
        isOpen,
        placement: "center",
        isDismissable: false,
        scrollBehavior: "inside",
        motionProps: modalMotionProps,
        onClose: () => setIsOpen(false),
        classNames: { backdrop: `!top-10 ${show}`, wrapper: `!top-10 pb-8 ${show}` },
        hideCloseButton: true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalContent$4, { className: "overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalHeader$4, { className: "bg-foreground-200 dark:bg-LynxRaisinBlack flex flex-col gap-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Manage Requirements" }),
              !isEmpty$b(filePath) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$h, { size: "sm", variant: "faded", startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Add_Icon, {}), onPress: handleAddRequirement, children: "Add" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button$h,
                  {
                    size: "sm",
                    variant: "faded",
                    color: "success",
                    isLoading: isSaving,
                    onPress: handleSaveRequirements,
                    startContent: !isSaving && /* @__PURE__ */ jsxRuntimeExports.jsx(Save_Icon, { className: "size-3.5" }),
                    children: !isSaving && "Save"
                  }
                ) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button$h,
              {
                size: "sm",
                variant: "flat",
                endContent: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
                onPress: openFilePath,
                startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(File_Icon, {}),
                className: "shrink-0 text-[10pt] justify-between",
                fullWidth: true,
                children: filePath || "Choose or Create requirements file..."
              }
            ) }),
            !isEmpty$b(requirements) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input$5,
              {
                size: "sm",
                type: "search",
                variant: "faded",
                value: searchValue,
                onValueChange: setSearchValue,
                placeholder: "Search requirements...",
                startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle_Icon, { className: "size-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ModalBody$3, { className: "pr-0 pl-2 pt-4 scrollbar-hide", children: isEmpty$b(filePath) ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-full text-center mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Result$1,
            {
              extra: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$h, { variant: "flat", color: "primary", onPress: openFilePath, children: "Choose or Create requirements file" }, "create_req_file"),
              title: "Select or create a requirements file to continue."
            }
          ) }) : isEmpty$b(requirements) ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-full text-center mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Empty$2,
            {
              description: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                'The file "',
                filePath.split("\\").pop(),
                '" is empty. Add requirements using the "Add" button.'
              ] })
            }
          ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RequirementsManager, { scrollRef, requirements: searchReqs, setRequirements }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ModalFooter$3, { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button$h,
            {
              size: "md",
              color: "warning",
              variant: "light",
              className: "w-fit cursor-default",
              onPress: () => setIsOpen(false),
              children: "Close"
            }
          ) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button$h,
      {
        size: "sm",
        radius: "sm",
        variant: "solid",
        onPress: () => setIsOpen(true),
        startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Checklist_Icon, { className: "size-3.5" }),
        children: "Manage Requirements"
      }
    )
  ] });
}

const {Button: Button$g,Dropdown: Dropdown$4,DropdownItem: DropdownItem$4,DropdownMenu: DropdownMenu$4,DropdownSection,DropdownTrigger: DropdownTrigger$4} = await importShared('@heroui/react');

const {useEffect: useEffect$d,useState: useState$i} = await importShared('react');
function Header_FilterButton({ setSelectedFilter, updateAvailable }) {
  const [selectedKeys, setSelectedKeys] = useState$i(/* @__PURE__ */ new Set(["all"]));
  useEffect$d(() => {
    setSelectedFilter(Array.from(selectedKeys).join(", ").replace(/_/g, ""));
  }, [selectedKeys]);
  useEffect$d(() => {
    if (updateAvailable) {
      setSelectedKeys(/* @__PURE__ */ new Set(["updates"]));
    } else {
      setSelectedKeys((prevState) => {
        if (prevState.values().next().value === "updates") {
          return /* @__PURE__ */ new Set(["all"]);
        }
        return prevState;
      });
    }
  }, [updateAvailable]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dropdown$4, { size: "sm", className: "border-1 border-foreground-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownTrigger$4, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$g, { size: "sm", variant: "faded", isIconOnly: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Filter_Icon, {}) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DropdownMenu$4,
      {
        variant: "faded",
        selectionMode: "single",
        selectedKeys,
        "aria-label": "Filter packages",
        onSelectionChange: setSelectedKeys,
        disabledKeys: !updateAvailable ? ["updates"] : void 0,
        disallowEmptySelection: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownSection, { showDivider: updateAvailable, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$4, { children: "All" }, "all"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$4, { children: "Updates" }, "updates")
          ] }),
          updateAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownSection, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$4, { className: "text-blue-500", children: "Pre Release" }, "prerelease"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$4, { className: "text-red-500", children: "Major" }, "major"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$4, { className: "text-yellow-500", children: "Minor" }, "minor"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$4, { className: "text-green-500", children: "Patch" }, "patch"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$4, { className: "text-gray-500", children: "Others" }, "others")
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$4, { className: "hidden" }, "nothing")
        ]
      }
    )
  ] });
}

const {Alert,Button: Button$f,Code,Input: Input$4} = await importShared('@heroui/react');

const {Divider: Divider$3,message: message$5} = await importShared('antd');

const {compact,isEmpty: isEmpty$a} = await importShared('lodash');

const {useState: useState$h} = await importShared('react');
function Header_Installer({ pythonPath, refresh, close }) {
  const [packageString, setPackageString] = useState$h("");
  const [packages, setPackages] = useState$h([]);
  const [indexUrl, setIndexUrl] = useState$h("");
  const [extraOptions, setExtraOptions] = useState$h("");
  const [installing, setInstalling] = useState$h(false);
  const handlePackageStringChange = (value) => {
    setPackageString(value);
    if (value.endsWith(" ") || value.endsWith("\n")) {
      const newPackages = value.trim().split(/\s+/).filter((pkg) => pkg).map((pkg) => {
        const [name, version] = pkg.split("@");
        return { name, version: version || "" };
      });
      setPackages([...packages, ...newPackages]);
      setPackageString("");
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = packageString.trim();
      if (value) {
        const newPackages = compact(
          value.split(/\s+/).filter((pkg) => pkg).map((pkg) => {
            const [name, version] = pkg.split("@");
            if (!packages.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
              return { name, version: version || "" };
            } else {
              return null;
            }
          })
        );
        setPackages([...packages, ...newPackages]);
        setPackageString("");
      }
    }
  };
  const removePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index));
  };
  const handleFileSelect = () => {
    rendererIpc.file.openDlg({ properties: ["openFile"] }).then((file) => {
      if (file) {
        pIpc.readReqs(file).then((result) => {
          setPackages(
            result.map((item) => {
              return { name: item.name, version: item.version || "" };
            })
          );
          message$5.success("Requirements file loaded successfully");
        });
      }
    }).catch(() => {
      message$5.error("Error reading requirements file");
    });
  };
  const generateInstallCommand = () => {
    if (packages.length === 0) return "";
    const packageStrings = packages.map((pkg) => `${pkg.name}${pkg.version ? `==${pkg.version}` : ""}`);
    let command = [];
    if (indexUrl.trim()) {
      command.push(`--index-url ${indexUrl.trim()}`);
    }
    if (extraOptions.trim()) {
      command.push(extraOptions.trim());
    }
    command = command.concat(packageStrings);
    return command.join(" ");
  };
  const handleInstall = async () => {
    setInstalling(true);
    pIpc.installPackage(pythonPath, generateInstallCommand()).then((result) => {
      if (result) {
        message$5.success("Packages installed successfully!");
      } else {
        message$5.error("Failed to install packages. Please check your inputs and try again.");
      }
      close();
      refresh();
    }).catch((err) => {
      message$5.error("Failed to install packages. Please check your inputs and try again.");
      console.error(err);
    }).finally(() => {
      setInstalling(false);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider$3, { children: "Package Input" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input$4,
          {
            value: packageString,
            onKeyDown: handleKeyDown,
            label: "Enter package names",
            onValueChange: handlePackageStringChange,
            placeholder: "e.g., 'torch torchvision torchaudio' or 'pandas@1.5.0'"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground-400 mt-1", children: "Press Space or Enter to add packages. Use '@' or '==' to specify version (e.g., pandas@1.5.0)" })
      ] }),
      !isEmpty$a(packages) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider$3, { children: "Selected Packages" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$f, { color: "danger", variant: "flat", startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Close_Icon, {}), onPress: () => setPackages([]), children: "Clear All" }) }),
        packages.map((pkg, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 rounded bg-foreground-100 animate-appearance-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1 font-mono", children: [
            pkg.name,
            pkg.version && `@${pkg.version}`
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$f, { className: "size-8", onPress: () => removePackage(index), isIconOnly: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash_Icon, { className: "size-4" }) }) })
        ] }, index))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider$3, { children: "Extra Options" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input$4, { value: indexUrl, label: "Index URL", placeholder: "(optional)", onValueChange: setIndexUrl }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input$4,
        {
          value: extraOptions,
          label: "Extra options",
          onValueChange: setExtraOptions,
          placeholder: "e.g., --user --no-cache-dir"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider$3, { children: "Requirements file selection" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button$f,
      {
        className: "cursor-pointer",
        onPress: handleFileSelect,
        startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Checklist_Icon, { className: "size-3.5" }),
        children: "Requirements File"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider$3, { children: "Preview" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Code, { className: "w-full p-3 overflow-hidden text-wrap break-words", children: [
      "pip install ",
      generateInstallCommand()
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider$3, { children: "Install" }),
    installing && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Alert,
      {
        description: "Installing packages... This may take several minutes depending on the number and size of the packages you selected.",
        color: "warning",
        isClosable: true
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button$f,
      {
        size: "md",
        variant: "flat",
        color: "success",
        isLoading: installing,
        onPress: handleInstall,
        className: "cursor-pointer",
        isDisabled: isEmpty$a(packages),
        children: installing ? "Installing..." : "Install Packages"
      }
    ) })
  ] });
}

const {Button: Button$e,Modal: Modal$3,ModalBody: ModalBody$2,ModalContent: ModalContent$3,ModalHeader: ModalHeader$3} = await importShared('@heroui/react');
const {useCallback: useCallback$3,useState: useState$g} = await importShared('react');
function Header_InstallerModal({ refresh, pythonPath, show }) {
  const [isOpen, setIsOpen] = useState$g(false);
  const isDarkMode = useAppState("darkMode");
  const close = useCallback$3(() => {
    setIsOpen(false);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button$e, { radius: "sm", variant: "solid", startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Add_Icon, {}), onPress: () => setIsOpen(true), children: "Install Package" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal$3,
      {
        size: "xl",
        isOpen,
        onClose: close,
        placement: "center",
        isDismissable: false,
        scrollBehavior: "inside",
        classNames: { backdrop: `!top-10 ${show}`, wrapper: `!top-10 pb-8 ${show}` },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalContent$3, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ModalHeader$3, { className: "pb-1 justify-center", children: "Python Package Installer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ModalBody$2, { className: "scrollbar-hide px-0 pt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            g,
            {
              options: {
                overflow: { x: "hidden", y: "scroll" },
                scrollbars: {
                  autoHide: "move",
                  clickScroll: true,
                  theme: isDarkMode ? "os-theme-light" : "os-theme-dark"
                }
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Header_Installer, { close, refresh, pythonPath })
            }
          ) })
        ] })
      }
    )
  ] });
}

const {Button: Button$d,ButtonGroup: ButtonGroup$1,Dropdown: Dropdown$3,DropdownItem: DropdownItem$3,DropdownMenu: DropdownMenu$3,DropdownTrigger: DropdownTrigger$3} = await importShared('@heroui/react');

const {isEmpty: isEmpty$9} = await importShared('lodash');

const {useEffect: useEffect$c,useMemo: useMemo$7,useState: useState$f} = await importShared('react');
function Header_UpdateButton({
  packagesUpdate,
  update,
  isUpdating,
  checkForUpdates,
  checkingUpdates,
  isReqAvailable,
  selectedKeys,
  visibleItems,
  selectedFilter
}) {
  const [selectedOption, setSelectedOption] = useState$f(/* @__PURE__ */ new Set([isReqAvailable ? "req" : "all"]));
  useEffect$c(() => {
    setSelectedOption(/* @__PURE__ */ new Set([isReqAvailable ? "req" : "all"]));
  }, [isReqAvailable]);
  const descriptionsMap = useMemo$7(() => {
    return {
      all: "Check all installed packages for updates.",
      req: `Check for updates based on your project's requirements file.`
    };
  }, []);
  const labelsMap = useMemo$7(() => {
    return {
      all: checkingUpdates ? "Checking (All)..." : `Check for Updates (All)`,
      req: checkingUpdates ? "Checking (Requirements)..." : `Check for Updates (Requirements)`
    };
  }, [checkingUpdates]);
  const selectedOptionValue = useMemo$7(() => {
    return Array.from(selectedOption)[0];
  }, [selectedOption]);
  const checkForUpdate = () => {
    if (selectedOptionValue === "all") {
      checkForUpdates("normal");
    } else {
      checkForUpdates("req");
    }
  };
  return !isEmpty$9(packagesUpdate) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button$d,
    {
      size: "sm",
      radius: "sm",
      variant: "flat",
      color: "success",
      onPress: update,
      className: "!min-w-40",
      isLoading: isUpdating,
      startContent: !isUpdating && /* @__PURE__ */ jsxRuntimeExports.jsx(Download2_Icon, {}),
      isDisabled: selectedKeys !== "all" && selectedKeys.size === 0,
      children: isUpdating ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Updating..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Update",
        " ",
        selectedKeys === "all" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "All (",
          selectedFilter === "all" ? packagesUpdate.length : visibleItems.length,
          ")"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Selected (",
          selectedKeys.size,
          ")"
        ] })
      ] })
    }
  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(ButtonGroup$1, { size: "sm", variant: "solid", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button$d,
      {
        onPress: checkForUpdate,
        isLoading: checkingUpdates,
        startContent: !checkingUpdates && /* @__PURE__ */ jsxRuntimeExports.jsx(Magnifier_Icon, {}),
        children: labelsMap[selectedOptionValue]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dropdown$3, { placement: "bottom-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownTrigger$3, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$d, { variant: "faded", isDisabled: !isReqAvailable || checkingUpdates, isIconOnly: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AltArrow_Icon, { className: "size-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DropdownMenu$3,
        {
          selectionMode: "single",
          "aria-label": "Merge options",
          selectedKeys: selectedOption,
          onSelectionChange: setSelectedOption,
          disallowEmptySelection: true,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$3, { description: descriptionsMap["all"], children: labelsMap["all"] }, "all"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$3, { description: descriptionsMap["req"], children: labelsMap["req"] }, "req")
          ]
        }
      )
    ] })
  ] });
}

const {ButtonGroup,Input: Input$3,ModalHeader: ModalHeader$2} = await importShared('@heroui/react');

const {message: message$4} = await importShared('antd');

const {isEmpty: isEmpty$8} = await importShared('lodash');

const {useState: useState$e} = await importShared('react');
function PackageManagerHeader({
  searchValue,
  setSearchValue,
  packages,
  packagesUpdate,
  checkingUpdates,
  pythonPath,
  allUpdated,
  refresh,
  title,
  actionButtons,
  isValidPython,
  checkForUpdates,
  id,
  projectPath,
  setSelectedFilter,
  selectedFilter,
  selectedKeys,
  visibleItems,
  show
}) {
  const [isUpdating, setIsUpdating] = useState$e(false);
  const [isReqAvailable, setIsReqAvailable] = useState$e(false);
  const update = () => {
    setIsUpdating(true);
    let updateList;
    if (selectedKeys === "all") {
      updateList = selectedFilter === "all" ? packagesUpdate.map((item) => item.name) : visibleItems.map((item) => item.name);
    } else {
      updateList = Array.from(selectedKeys);
    }
    pIpc.updateAllPackages(pythonPath, updateList).then(() => {
      message$4.success(`Successfully updated all selected packages (${updateList.length} total).`);
      allUpdated();
    }).catch(() => {
      message$4.error(`Failed to update packages.`);
    }).finally(() => {
      setIsUpdating(false);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalHeader$2, { className: "bg-foreground-200 dark:bg-LynxRaisinBlack items-center flex-col gap-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row justify-between w-full", children: isValidPython ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        title,
        " (",
        packages.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Header_FilterButton, { setSelectedFilter, updateAvailable: !isEmpty$8(packagesUpdate) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }) }),
    !isEmpty$8(packages) && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input$3,
      {
        size: "sm",
        radius: "sm",
        type: "search",
        className: "pt-1",
        value: searchValue,
        startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle_Icon, {}),
        onValueChange: setSearchValue,
        placeholder: "Search for packages..."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gap-x-2 flex items-center w-full mt-2", children: [
      isValidPython && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Header_UpdateButton,
        {
          update,
          isUpdating,
          visibleItems,
          selectedKeys,
          selectedFilter,
          isReqAvailable,
          packagesUpdate,
          checkForUpdates,
          checkingUpdates
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ButtonGroup, { size: "sm", fullWidth: true, children: isValidPython && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Header_InstallerModal, { show, refresh, pythonPath }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RequirementsBtn, { id, show, projectPath, setIsReqAvailable })
      ] }) }),
      isValidPython && actionButtons?.map((ActionButton) => ActionButton)
    ] })
  ] });
}

const {Button: Button$c,Modal: Modal$2,ModalContent: ModalContent$2,ModalFooter: ModalFooter$2} = await importShared('@heroui/react');

const {isEmpty: isEmpty$7} = await importShared('lodash');

const {useEffect: useEffect$b,useState: useState$d} = await importShared('react');
function PackageManagerModal({
  title = "Package Manager",
  size = "2xl",
  actionButtons,
  isOpen,
  setIsOpen,
  pythonPath,
  locateVenv,
  id,
  isLocating,
  projectPath,
  setPythonPath,
  show
}) {
  const [isLoading, setIsLoading] = useState$d(false);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState$d(false);
  const [packages, setPackages] = useState$d([]);
  const [filteredPackages, setFilteredPackages] = useState$d([]);
  const [packagesUpdate, setPackagesUpdate] = useState$d([]);
  const [searchValue, setSearchValue] = useState$d("");
  const [searchData, setSearchData] = useState$d([]);
  const [isValidPython, setIsValidPython] = useState$d(true);
  const [selectedFilter, setSelectedFilter] = useState$d("all");
  const [items, setItems] = useState$d(searchData);
  const [selectedKeys, setSelectedKeys] = useState$d(/* @__PURE__ */ new Set([]));
  useEffect$b(() => {
    switch (selectedFilter) {
      case "all":
        setFilteredPackages(packages);
        break;
      case "updates":
        setFilteredPackages(packages.filter((item) => packagesUpdate.some((update) => item.name === update.name)));
        break;
      case "prerelease":
        setFilteredPackages(
          packages.filter(
            (item) => packagesUpdate.some(
              (update) => item.name === update.name && getUpdateType(item.version, update.version) === "prerelease"
            )
          )
        );
        break;
      case "major":
        setFilteredPackages(
          packages.filter(
            (item) => packagesUpdate.some(
              (update) => item.name === update.name && getUpdateType(item.version, update.version) === "major"
            )
          )
        );
        break;
      case "minor":
        setFilteredPackages(
          packages.filter(
            (item) => packagesUpdate.some(
              (update) => item.name === update.name && getUpdateType(item.version, update.version) === "minor"
            )
          )
        );
        break;
      case "patch":
        setFilteredPackages(
          packages.filter(
            (item) => packagesUpdate.some(
              (update) => item.name === update.name && getUpdateType(item.version, update.version) === "patch"
            )
          )
        );
        break;
      case "others":
        setFilteredPackages(
          packages.filter(
            (item) => packagesUpdate.some(
              (update) => item.name === update.name && getUpdateType(item.version, update.version) === null
            )
          )
        );
        break;
    }
  }, [selectedFilter, packagesUpdate, packages]);
  useEffect$b(() => {
    if (isEmpty$7(pythonPath)) setIsValidPython(false);
  }, [pythonPath]);
  useEffect$b(() => {
    setSearchData(filteredPackages.filter((item) => searchInStrings(searchValue, [item.name])));
  }, [searchValue, filteredPackages]);
  const closePackageManager = () => {
    setIsOpen(false);
    setPackagesUpdate([]);
  };
  const checkForUpdates = (type) => {
    setIsLoadingUpdates(true);
    const updateData = (result) => {
      setPackagesUpdate(result);
      setPackages(
        (prevState) => prevState.map((item) => {
          const updateVersion = result.find((update) => update.name === item.name)?.version;
          return updateVersion ? { ...item, updateVersion } : item;
        })
      );
    };
    if (type === "req") {
      pIpc.getReqPath(id).then((reqPath) => {
        if (reqPath) {
          pIpc.getUpdatesReq(reqPath, packages).then(updateData).finally(() => {
            setIsLoadingUpdates(false);
          });
        }
      }).catch((err) => {
        console.log(err);
        setIsLoadingUpdates(false);
      });
    } else {
      pIpc.getPackagesUpdateInfo(packages).then(updateData).finally(() => {
        setIsLoadingUpdates(false);
      });
    }
  };
  const getPackageList = () => {
    setIsLoading(true);
    pIpc.getPackagesInfo(pythonPath).then((result) => {
      setPackages(result);
      setIsValidPython(true);
    }).catch((err) => {
      setIsValidPython(false);
      console.warn(err);
    }).finally(() => {
      setIsLoading(false);
    });
  };
  useEffect$b(() => {
    if (isOpen && !isEmpty$7(pythonPath)) {
      getPackageList();
    } else {
      setSearchData([]);
      setPackages([]);
    }
  }, [pythonPath, isOpen]);
  const updated = (name, newVersion) => {
    setPackagesUpdate((prevState) => prevState.filter((item) => item.name !== name));
    setPackages(
      (prevState) => prevState.map((item) => item.name === name ? { name, updateVersion: void 0, version: newVersion } : item)
    );
  };
  const removed = (name) => {
    setPackagesUpdate((prevState) => prevState.filter((item) => item.name !== name));
    setPackages((prevState) => prevState.filter((item) => item.name !== name));
  };
  const allUpdated = () => {
    setPackages(
      (prevState) => prevState.map((item) => {
        const newVersion = packagesUpdate.find((update) => update.name === item.name)?.version;
        return newVersion ? { name: item.name, updateVersion: void 0, version: newVersion } : item;
      })
    );
    setPackagesUpdate([]);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal$2,
    {
      size,
      isOpen,
      placement: "center",
      isDismissable: false,
      scrollBehavior: "inside",
      onClose: closePackageManager,
      motionProps: modalMotionProps,
      classNames: { backdrop: `!top-10 ${show}`, wrapper: `!top-10 pb-8 ${show}` },
      hideCloseButton: true,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalContent$2, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PackageManagerHeader,
          {
            id,
            show,
            title,
            packages,
            visibleItems: items,
            allUpdated,
            pythonPath,
            refresh: getPackageList,
            projectPath,
            searchValue,
            selectedKeys,
            isValidPython,
            actionButtons,
            selectedFilter,
            packagesUpdate,
            setSearchValue,
            checkForUpdates,
            setSelectedFilter,
            checkingUpdates: !isLoading && isLoadingUpdates
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PackageManagerBody,
          {
            id,
            items,
            removed,
            updated,
            isLoading,
            locateVenv,
            isLocating,
            pythonPath,
            selectedKeys,
            setPythonPath,
            isValidPython,
            packagesUpdate,
            setSelectedKeys
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalFooter$2, { className: "items-center py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Footer_TablePage, { setItems, searchData }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button$c, { variant: "light", color: "warning", className: "cursor-default", onPress: closePackageManager, children: "Close" })
        ] })
      ] })
    }
  );
}

const {ConfigProvider,theme} = await importShared('antd');

const {useMemo: useMemo$6} = await importShared('react');
function UIProvider({ children }) {
  const darkMode = useAppState("darkMode");
  const algorithm = useMemo$6(() => darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm, [darkMode]);
  const colorBgSpotlight = useMemo$6(() => darkMode ? "#424242" : "white", [darkMode]);
  const colorTextLightSolid = useMemo$6(() => darkMode ? "white" : "black", [darkMode]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ConfigProvider,
    {
      theme: {
        algorithm,
        components: {
          Button: { colorPrimaryBorder: "rgba(0,0,0,0)" },
          Tooltip: { colorBgSpotlight, colorTextLightSolid }
        },
        token: { colorBgMask: "rgba(0, 0, 0, 0.2)", fontFamily: "Nunito, sans-serif" }
      },
      children
    }
  );
}

const {Button: Button$b} = await importShared('@heroui/react');

const {isNil: isNil$4} = await importShared('lodash');

const {useEffect: useEffect$a,useMemo: useMemo$5,useState: useState$c} = await importShared('react');

const {useDispatch: useDispatch$2} = await importShared('react-redux');
function CardMenu_Modals({ isOpen, context, show }) {
  const activeTab = useTabsState("activeTab");
  const webUI = useInstalledCard(context.id);
  const dispatch = useDispatch$2();
  const tabs = useTabsState("tabs");
  const [prevTabTitle, setPrevTabTitle] = useState$c(
    tabs.find((tab) => tab.id === context.tabID)?.title
  );
  useEffect$a(() => {
    setPrevTabTitle(tabs.find((tab) => tab.id === context.tabID)?.title);
    dispatch(tabsActions.setTabTitle({ tabID: context.tabID, title: `${context.title} Dependencies` }));
  }, []);
  useEffect$a(() => {
    if (isOpen && context.tabID === activeTab)
      dispatch(tabsActions.setTabTitle({ tabID: context.tabID, title: `${context.title} Dependencies` }));
  }, [activeTab, context.tabID, isOpen]);
  const [pythonPath, setPythonPath] = useState$c("");
  const [isLocatingVenv, setIsLocatingVenv] = useState$c(false);
  const onOpenChange = (value) => {
    if (!value) {
      dispatch(PythonToolkitActions.closeMenuModal({ tabID: context.tabID }));
      setTimeout(() => {
        dispatch(PythonToolkitActions.removeMenuModal({ tabID: context.tabID }));
      }, 500);
      if (prevTabTitle) dispatch(tabsActions.setTabTitle({ tabID: context.tabID, title: prevTabTitle }));
    }
  };
  useEffect$a(() => {
    if (isOpen) {
      pIpc.getAIVenv(context.id).then((folder) => {
        if (isNil$4(folder)) {
          pIpc.findAIVenv(context.id, webUI?.dir).then((result) => {
            pIpc.checkAIVenvEnabled();
            setPythonPath(result);
          }).catch(console.log);
        } else {
          setPythonPath(folder);
          pIpc.checkAIVenvEnabled();
        }
      });
    } else {
      setPythonPath("");
    }
  }, [isOpen, webUI, context]);
  const locateVenv = () => {
    if (context) {
      setIsLocatingVenv(true);
      pIpc.locateAIVenv(context.id).then((result) => {
        pIpc.checkAIVenvEnabled();
        setPythonPath(result);
      }).catch(console.error).finally(() => {
        setIsLocatingVenv(false);
      });
    }
  };
  const handleDeselect = () => {
    pIpc.removeAIVenv(context.id);
    setPythonPath("");
  };
  const actionButtons = useMemo$5(() => {
    return pythonPath ? [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button$b,
        {
          size: "sm",
          variant: "flat",
          color: "danger",
          className: "!min-w-32",
          onPress: handleDeselect,
          children: "Deselect"
        },
        "reloacte_venv"
      )
    ] : [];
  }, [pythonPath, isLocatingVenv]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(UIProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    PackageManagerModal,
    {
      size: "4xl",
      show,
      isOpen,
      id: context.id,
      pythonPath,
      locateVenv,
      setIsOpen: onOpenChange,
      projectPath: webUI?.dir,
      isLocating: isLocatingVenv,
      setPythonPath,
      actionButtons,
      title: `${context.title} Dependencies`
    }
  ) });
}

const {useEffect: useEffect$9} = await importShared('react');

const {useDispatch: useDispatch$1} = await importShared('react-redux');
function CardMenuModal() {
  const dispatch = useDispatch$1();
  const activeTab = useTabsState("activeTab");
  const tabs = useTabsState("tabs");
  const cards = usePythonToolkitState("menuModal");
  useEffect$9(() => {
    cards.forEach((card) => {
      const exist = tabs.some((tab) => tab.id === card.context.tabID);
      if (!exist) {
        dispatch(PythonToolkitActions.closeMenuModal({ tabID: card.context.tabID }));
        setTimeout(() => {
          dispatch(PythonToolkitActions.removeMenuModal({ tabID: card.context.tabID }));
        }, 500);
      }
    });
  }, [tabs, cards, dispatch]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: cards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    CardMenu_Modals,
    {
      isOpen: card.isOpen,
      context: card.context,
      show: activeTab === card.context.tabID ? "flex" : "hidden"
    },
    `${card.context.id}_card`
  )) });
}

const {isEmpty: isEmpty$6} = await importShared('lodash');

const {useEffect: useEffect$8,useState: useState$b} = await importShared('react');
function useCacheImage(id, url) {
  const [imageSrc, setImageSrc] = useState$b("");
  useEffect$8(() => {
    if (isEmpty$6(url)) return;
    const fetchAndStoreImage = async () => {
      try {
        const response = await fetch(url);
        const data = await response.blob();
        const imageDataUrl = await convertBlobToDataUrl(data);
        localStorage.setItem(id, imageDataUrl);
        setImageSrc(imageDataUrl);
      } catch (error) {
        console.error("Error fetching and storing image:", error);
      }
    };
    const cachedImage = localStorage.getItem(id);
    if (cachedImage) {
      setImageSrc(cachedImage);
    } else {
      fetchAndStoreImage();
    }
  }, [id, url]);
  return imageSrc;
}

const {Button: Button$a,Chip: Chip$1,Dropdown: Dropdown$2,DropdownItem: DropdownItem$2,DropdownMenu: DropdownMenu$2,DropdownTrigger: DropdownTrigger$2,Popover: Popover$3,PopoverContent: PopoverContent$3,PopoverTrigger: PopoverTrigger$3,Progress: Progress$2} = await importShared('@heroui/react');

const {Card: Card$2,Divider: Divider$2,Spin: Spin$1} = await importShared('antd');

const {isNil: isNil$3,startCase} = await importShared('lodash');

const {useMemo: useMemo$4,useState: useState$a} = await importShared('react');
function InstalledCard({ python, diskUsage, maxDiskValue, updateDefault, refresh, show }) {
  const size = useMemo$4(() => {
    return diskUsage.find((usage) => usage.path === python.installFolder)?.value;
  }, [diskUsage]);
  const [isUninstalling, setIsUninstalling] = useState$a(false);
  const makeDefault = () => {
    pIpc.setDefaultPython(python.installFolder).then(() => {
      updateDefault(python.installFolder);
    }).catch((error) => {
      console.error(error);
    });
  };
  const uninstall = () => {
    setPopoverUninstaller(false);
    setIsUninstalling(true);
    pIpc.uninstallPython(python.installPath).catch((err) => {
      console.error(err);
    }).finally(() => {
      pIpc.removeSavedPython(python.installPath);
      refresh(false);
      setIsUninstalling(false);
    });
  };
  const openPath = () => {
    rendererIpc.file.openPath(python.installFolder);
  };
  const installTypeColor = useMemo$4(() => {
    switch (python.installationType) {
      case "official":
        return "text-[#28A745]";
      case "conda":
        return "text-[#007BFF]";
      case "other":
        return "text-[#FFA500]";
    }
  }, [python.installationType]);
  const [popoverUninstaller, setPopoverUninstaller] = useState$a(false);
  const [packageManagerOpen, setPackageManagerOpen] = useState$a(false);
  const packageManager = () => {
    setPackageManagerOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grow relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PackageManagerModal,
      {
        size: "3xl",
        show,
        id: python.installPath,
        isOpen: packageManagerOpen,
        pythonPath: python.installPath,
        setIsOpen: setPackageManagerOpen
      }
    ),
    isUninstalling && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute size-full dark:bg-black/50 bg-white/50 z-10 flex justify-center items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: " dark:bg-black/80 bg-white/80 p-4 rounded-lg flex flex-col space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Spin$1, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Uninstalling... Please wait." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card$2,
      {
        className: `min-w-[27rem] transition-colors duration-300 shadow-small ${python.isDefault ? "border-secondary border-opacity-60 hover:border-opacity-100" : "dark:hover:border-white/20 hover:border-black/20 "}`,
        title: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col my-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Python_Icon, { className: "size-4" }),
              "Python ",
              python.version,
              python.isDefault && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip$1,
                {
                  size: "sm",
                  radius: "sm",
                  variant: "light",
                  color: "secondary",
                  classNames: { content: "!font-semibold" },
                  children: "System Default"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-tiny text-foreground-500", children: python.architecture }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Divider$2, { type: "vertical" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-tiny " + installTypeColor, children: startCase(python.installationType) }),
              python.installationType === "conda" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Divider$2, { type: "vertical" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-tiny text-cyan-500", children: python.condaName })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-x-1 flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Dropdown$2, { className: "dark:bg-LynxRaisinBlack", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownTrigger$2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$a, { size: "sm", variant: "light", isIconOnly: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuDots_Icon, { className: "rotate-90 size-3.5" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu$2, { children: [
                window.osPlatform === "win32" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  DropdownItem$2,
                  {
                    onPress: makeDefault,
                    textValue: "Set as System Default",
                    startContent: python.isDefault ? /* @__PURE__ */ jsxRuntimeExports.jsx(Refresh3_Icon, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DoubleCheck_Icon, {}),
                    children: [
                      "Set as ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "System Default" })
                    ]
                  },
                  "system-default"
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$2, { className: "hidden", textValue: "system_default" }, "system-default"),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DropdownItem$2,
                  {
                    onPress: packageManager,
                    startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Packages_Icon, { className: "size-4" }),
                    children: "Manage Packages"
                  },
                  "package-manager"
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Popover$3,
              {
                size: "sm",
                color: "danger",
                placement: "left",
                className: "max-w-[15rem]",
                isOpen: popoverUninstaller,
                onOpenChange: setPopoverUninstaller,
                showArrow: true,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger$3, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$a, { size: "sm", color: "danger", variant: "light", isIconOnly: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash_Icon, { className: "size-[50%]" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent$3, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 space-y-2", children: [
                    python.installationType === "conda" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `Confirm deletion of the entire Conda environment "${python.condaName}" and all associated packages. This action is irreversible.` }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `Confirm uninstallation of Python version ${python.version} and deletion of all associated packages. This action is irreversible.` }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button$a, { size: "sm", onPress: uninstall, fullWidth: true, children: "Uninstall" })
                  ] }) })
                ]
              }
            )
          ] })
        ] }),
        classNames: { body: "gap-y-4" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gap-y-4 flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button$a, { size: "sm", variant: "light", onPress: openPath, className: "flex flex-row justify-start -ml-3 -mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(OpenFolder_Icon, { className: "flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: python.installFolder })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full justify-between flex flex-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-x-1 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Packages_Icon, { className: "size-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Installed Packages:" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: python.packages })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Progress$2,
            {
              label: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-x-2 items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive_Icon, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Disk Usage:" })
              ] }),
              size: "sm",
              minValue: 0,
              value: size,
              color: "primary",
              maxValue: maxDiskValue,
              isIndeterminate: isNil$3(size),
              valueLabel: formatSizeMB(size || 0),
              showValueLabel: true
            }
          )
        ] })
      }
    )
  ] });
}

const {Button: Button$9,CircularProgress: CircularProgress$1,Input: Input$2,Link: Link$1,Popover: Popover$2,PopoverContent: PopoverContent$2,PopoverTrigger: PopoverTrigger$2,Progress: Progress$1,Spinner: Spinner$2} = await importShared('@heroui/react');

const {List: List$1,Result,Tooltip: Tooltip$1} = await importShared('antd');

const {isEmpty: isEmpty$5,isNil: isNil$2} = await importShared('lodash');
const {useEffect: useEffect$7,useState: useState$9} = await importShared('react');
const CACHE_KEY$1 = "available-conda-pythons-list";
function InstallerConda({ refresh, installed, closeModal, isOpen, setCloseDisabled }) {
  const isDarkMode = useAppState("darkMode");
  const [versions, setVersions] = useState$9([]);
  const [searchVersions, setSearchVersions] = useState$9([]);
  const [inputValue, setInputValue] = useState$9("");
  const [loadingList, setLoadingList] = useState$9(false);
  const [installingVersion, setInstallingVersion] = useState$9("");
  const [percentage, setPercentage] = useState$9(0);
  const [envName, setEnvName] = useState$9("");
  const [isCondaInstalled, setIsCondaInstalled] = useState$9(void 0);
  useEffect$7(() => {
    pIpc.isCondaInstalled().then((result) => {
      setIsCondaInstalled(result);
    });
  }, []);
  useEffect$7(() => {
    if (isOpen && isEmpty$5(versions)) fetchPythonList(false);
  }, [isOpen, versions]);
  useEffect$7(() => {
    if (isEmpty$5(inputValue)) {
      setSearchVersions(versions);
    } else {
      setSearchVersions(versions.filter((version) => version.startsWith(inputValue)));
    }
  }, [inputValue, versions]);
  const fetchPythonList = (refresh2) => {
    setLoadingList(true);
    const cachedList = localStorage.getItem(CACHE_KEY$1);
    if (!refresh2 && !isNil$2(cachedList)) {
      setVersions(JSON.parse(cachedList).filter((item) => !installed.includes(item)));
      setLoadingList(false);
    } else {
      pIpc.getAvailableConda().then((result) => {
        localStorage.setItem(CACHE_KEY$1, JSON.stringify(result));
        const filteredVersions = result.filter((item) => !installed.includes(item));
        setVersions(filteredVersions);
        setLoadingList(false);
      });
    }
  };
  const installPython = (version) => {
    setInstallingVersion(version);
    setCloseDisabled(true);
    pIpc.off_DlProgressConda();
    pIpc.on_DlProgressConda((_, progress) => {
      setPercentage(progress);
    });
    pIpc.installConda(envName, version).then(() => {
      refresh(true);
      closeModal();
      console.log("installed", version);
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setInstallingVersion("");
      setCloseDisabled(false);
    });
  };
  if (isCondaInstalled === void 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress$1, { size: "lg", className: "mb-4 self-center", label: "Checking for Conda installation..." });
  } else if (!isCondaInstalled) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Result,
      {
        extra: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link$1,
          {
            as: Button$9,
            variant: "flat",
            color: "foreground",
            onPress: () => window.open("https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html"),
            isExternal: true,
            showAnchorIcon: true,
            children: "Conda Official Website"
          }
        ),
        status: "warning",
        className: "text-center",
        title: "Conda Installation Not Found",
        subTitle: "To proceed, please install Conda from the official website."
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    isEmpty$5(installingVersion) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-x-2 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input$2,
        {
          size: "sm",
          type: "search",
          value: inputValue,
          onValueChange: setInputValue,
          startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle_Icon, {}),
          placeholder: "Refresh available Conda Python versions"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip$1, { title: "Refresh from server", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button$9,
        {
          size: "sm",
          variant: "flat",
          startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Refresh_Icon, {}),
          onPress: () => fetchPythonList(true),
          isIconOnly: true
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      g,
      {
        options: {
          overflow: { x: "hidden", y: "scroll" },
          scrollbars: {
            autoHide: "move",
            clickScroll: true,
            theme: isDarkMode ? "os-theme-light" : "os-theme-dark"
          }
        },
        className: `pr-3 mr-1 pl-4 pb-4 text-center`,
        children: !isEmpty$5(installingVersion) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Progress$1,
          {
            value: percentage,
            className: "my-4 px-2",
            isIndeterminate: percentage === 0 || percentage === 100,
            label: `Installing Conda Python v${installingVersion}...`,
            showValueLabel: true
          }
        ) : loadingList ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Spinner$2,
          {
            size: "lg",
            className: "justify-self-center my-4",
            label: "Loading available Conda Python versions...",
            classNames: { circle2: "border-b-[#ffe66e]", circle1: "border-b-[#ffe66e] " }
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          List$1,
          {
            renderItem: (item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              List$1.Item,
              {
                actions: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover$2, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger$2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$9, { size: "sm", variant: "flat", children: "Install" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent$2, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 py-1 space-y-2 text-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input$2,
                        {
                          onKeyUp: (event) => {
                            if (event.key === "Enter") {
                              installPython(item);
                            }
                          },
                          size: "sm",
                          value: envName,
                          onValueChange: setEnvName,
                          placeholder: "Enter Conda environment name..."
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button$9, { size: "sm", onPress: () => installPython(item), fullWidth: true, children: [
                        "Install v",
                        item
                      ] })
                    ] }) })
                  ] }, "install_conda_python")
                ],
                className: "hover:bg-foreground-100 transition-colors duration-150",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item })
              }
            ),
            className: "overflow-hidden",
            dataSource: searchVersions,
            bordered: true
          }
        )
      }
    )
  ] });
}

const {Button: Button$8,CircularProgress,Input: Input$1,Link,Progress} = await importShared('@heroui/react');

const {List,message: message$3,Tooltip} = await importShared('antd');

const {isEmpty: isEmpty$4,isNil: isNil$1} = await importShared('lodash');
const {useEffect: useEffect$6,useState: useState$8} = await importShared('react');
const CACHE_KEY = "available-pythons-list";
function InstallerOfficial({ refresh, installed, closeModal, isOpen, setCloseDisabled }) {
  const isDarkMode = useAppState("darkMode");
  const [versions, setVersions] = useState$8([]);
  const [searchVersions, setSearchVersions] = useState$8([]);
  const [loadingList, setLoadingList] = useState$8(false);
  const [inputValue, setInputValue] = useState$8("");
  const [installStage, setInstallStage] = useState$8();
  const [downloadProgress, setDownloadProgress] = useState$8(void 0);
  const [installingVersion, setInstallingVersion] = useState$8(void 0);
  const fetchPythonList = (refresh2) => {
    setLoadingList(true);
    const cachedList = localStorage.getItem(CACHE_KEY);
    if (!refresh2 && !isNil$1(cachedList)) {
      setVersions(JSON.parse(cachedList).filter((item) => !installed.includes(item.version)));
      setLoadingList(false);
    } else {
      pIpc.getAvailableOfficial().then((result) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
        const filteredVersions = result.filter((item) => !installed.includes(item.version));
        setVersions(filteredVersions);
        setLoadingList(false);
      });
    }
  };
  useEffect$6(() => {
    if (isOpen && isEmpty$4(versions)) fetchPythonList(false);
  }, [isOpen, versions]);
  useEffect$6(() => {
    if (isEmpty$4(inputValue)) {
      setSearchVersions(versions);
    } else {
      setSearchVersions(versions.filter((version) => version.version.startsWith(inputValue)));
    }
  }, [inputValue, versions]);
  const installPython = (version) => {
    setInstallingVersion(version);
    setCloseDisabled(true);
    const osPlatform = window.osPlatform;
    switch (osPlatform) {
      case "win32":
        pIpc.off_DlProgressOfficial();
        pIpc.on_DlProgressOfficial((_, stage, progress) => {
          setInstallStage(stage);
          if (stage === "downloading") {
            setDownloadProgress(progress);
          }
        });
        break;
      case "linux":
        setInstallStage("installing");
        break;
    }
    pIpc.installOfficial(version).then(() => {
      refresh(true);
      closeModal();
      console.log("installed", version);
      message$3.success(`Python${version.version} installed successfully.`);
    }).catch((err) => {
      console.log(err);
      message$3.error(`Failed to install python${version.version}!`);
    }).finally(() => {
      setInstallingVersion(void 0);
      setCloseDisabled(false);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    isEmpty$4(installingVersion) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-x-2 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input$1,
        {
          size: "sm",
          type: "search",
          value: inputValue,
          onValueChange: setInputValue,
          startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle_Icon, {}),
          placeholder: "Search for Python version to install..."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Refresh available Python versions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button$8,
        {
          size: "sm",
          variant: "flat",
          startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Refresh_Icon, {}),
          onPress: () => fetchPythonList(true),
          isIconOnly: true
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      g,
      {
        options: {
          overflow: { x: "hidden", y: "scroll" },
          scrollbars: {
            autoHide: "move",
            clickScroll: true,
            theme: isDarkMode ? "os-theme-light" : "os-theme-dark"
          }
        },
        className: `pr-3 mr-1 pl-4 pb-4`,
        children: !isEmpty$4(installingVersion) ? installStage === "installing" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Progress,
          {
            className: "my-4 px-2",
            label: `Installing Python v${installingVersion?.version} ...`,
            isIndeterminate: true
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Progress,
          {
            className: "my-4 px-2",
            value: (downloadProgress?.percentage || 0.1) * 100,
            classNames: { label: "!text-small", value: "!text-small" },
            label: `Downloading ${installingVersion?.url.split("/").pop()} ...`,
            valueLabel: `${formatSize(downloadProgress?.downloaded)} / ${formatSize(downloadProgress?.total)}`,
            showValueLabel: true
          }
        ) : loadingList ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          CircularProgress,
          {
            size: "lg",
            className: "justify-self-center my-4",
            label: "Loading available Python versions...",
            classNames: { indicator: "stroke-[#ffe66e]" }
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          List,
          {
            renderItem: (item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              List.Item,
              {
                actions: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button$8, { size: "sm", variant: "flat", onPress: () => installPython(item), children: "Install" }, "install_python")
                ],
                className: "hover:bg-foreground-100 transition-colors duration-150",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: "sm", href: item.url, color: "foreground", isExternal: true, showAnchorIcon: true, children: item.version })
              }
            ),
            className: "overflow-hidden",
            dataSource: searchVersions,
            bordered: true
          }
        )
      }
    )
  ] });
}

const {Button: Button$7,Modal: Modal$1,ModalBody: ModalBody$1,ModalContent: ModalContent$1,ModalFooter: ModalFooter$1,ModalHeader: ModalHeader$1,Tab: Tab$1,Tabs: Tabs$1} = await importShared('@heroui/react');

const {useMemo: useMemo$3,useState: useState$7} = await importShared('react');
function InstallerModal({ isOpen, closeModal, refresh, installed, show }) {
  const [closeDisabled, setCloseDisabled] = useState$7(false);
  const [currentTab, setCurrentTab] = useState$7("official");
  const installedOfficial = useMemo$3(
    () => installed.filter((item) => item.installationType !== "conda").map((item) => item.version),
    [installed]
  );
  const installedConda = useMemo$3(
    () => installed.filter((item) => item.installationType === "conda").map((item) => item.version),
    [installed]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal$1,
    {
      size: "xl",
      isOpen,
      placement: "center",
      onClose: closeModal,
      isDismissable: false,
      scrollBehavior: "inside",
      motionProps: modalMotionProps,
      classNames: { backdrop: `!top-10 ${show}`, wrapper: `!top-10 pb-8 ${show}` },
      hideCloseButton: true,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalContent$1, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalHeader$1, { className: "bg-foreground-100 justify-center items-center flex-col gap-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Install a New Python Version" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs$1, { variant: "light", onSelectionChange: setCurrentTab, selectedKey: currentTab.toString(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab$1, { title: "Official Python Releases" }, "official"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab$1, { title: "Conda Environments" }, "conda")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalBody$1, { className: "pt-4 pb-0 px-0 scrollbar-hide", children: [
          currentTab === "official" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            InstallerOfficial,
            {
              isOpen,
              refresh,
              closeModal,
              installed: installedOfficial,
              setCloseDisabled
            }
          ),
          currentTab === "conda" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            InstallerConda,
            {
              isOpen,
              refresh,
              closeModal,
              installed: installedConda,
              setCloseDisabled
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ModalFooter$1, { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$7,
          {
            variant: "light",
            color: "warning",
            onPress: closeModal,
            className: "cursor-default",
            isDisabled: closeDisabled,
            children: "Close"
          }
        ) })
      ] })
    }
  ) });
}

const {Button: Button$6,Spinner: Spinner$1} = await importShared('@heroui/react');

const {Empty: Empty$1} = await importShared('antd');

const {isEmpty: isEmpty$3} = await importShared('lodash');

const {useEffect: useEffect$5,useState: useState$6} = await importShared('react');
function InstalledPythons({
  visible,
  installedPythons,
  setInstalledPythons,
  setIsLoadingPythons,
  isLoadingPythons,
  show
}) {
  const [diskUsage, setDiskUsage] = useState$6([]);
  const [maxDiskValue, setMaxDiskValue] = useState$6(0);
  useEffect$5(() => {
    diskUsage.forEach((disk) => {
      setMaxDiskValue((prevState) => {
        const size = disk.value || 0;
        if (prevState >= size) {
          return prevState;
        } else {
          return size < 500 ? size + 500 : size + 1e3;
        }
      });
    });
  }, [diskUsage]);
  const getInstalledPythons = (refresh) => {
    setIsLoadingPythons(true);
    pIpc.getInstalledPythons(refresh).then((result) => {
      setInstalledPythons(result);
      setIsLoadingPythons(false);
      for (const python of result) {
        rendererIpc.file.calcFolderSize(python.sitePackagesPath).then((value) => {
          if (value)
            setDiskUsage((prevState) => [
              ...prevState,
              {
                path: python.installFolder,
                value: bytesToMegabytes(value)
              }
            ]);
        });
      }
    });
  };
  useEffect$5(() => {
    getInstalledPythons(false);
  }, []);
  const [installModalOpen, setInstallModalOpen] = useState$6(false);
  const openInstallModal = () => {
    setInstallModalOpen(true);
  };
  const closeInstallModal = () => {
    setInstallModalOpen(false);
  };
  const updateDefault = (installFolder) => {
    setInstalledPythons(
      (prevState) => prevState.map((python) => {
        if (python.installFolder === installFolder) {
          python.isDefault = true;
          return python;
        } else {
          python.isDefault = false;
          return python;
        }
      })
    );
  };
  if (!visible) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex flex-col gap-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      InstallerModal,
      {
        installed: installedPythons.map((item) => {
          const { version, installationType } = item;
          return {
            version,
            installationType
          };
        }),
        show,
        isOpen: installModalOpen,
        refresh: getInstalledPythons,
        closeModal: closeInstallModal
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex flex-row justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Installed Versions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "justify-center items-center flex gap-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button$6, { radius: "sm", variant: "solid", onPress: openInstallModal, startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Add_Icon, {}), children: "Install Version" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button$6, { variant: "flat", startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Refresh_Icon, {}), onPress: () => getInstalledPythons(true), children: "Refresh List" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `flex flex-row flex-wrap gap-8 ${(isLoadingPythons || isEmpty$3(installedPythons)) && "justify-center"}`,
        children: isLoadingPythons ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Spinner$1,
          {
            size: "lg",
            label: "Loading Python installations...",
            classNames: { circle2: "border-b-[#ffe66e]", circle1: "border-b-[#ffe66e] " }
          }
        ) : isEmpty$3(installedPythons) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty$1, { description: `No Python installations found. Use the "Install Version" button to add one.` }) : installedPythons.map((python) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          InstalledCard,
          {
            show,
            python,
            diskUsage,
            maxDiskValue,
            refresh: getInstalledPythons,
            updateDefault
          },
          `${python.installationType}-${python.version}`
        ))
      }
    )
  ] });
}

var cryptoJs$1 = {exports: {}};

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var core$1 = {exports: {}};

const __viteBrowserExternal = {};

const __viteBrowserExternal$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: __viteBrowserExternal
}, Symbol.toStringTag, { value: 'Module' }));

const require$$0 = /*@__PURE__*/getAugmentedNamespace(__viteBrowserExternal$1);

var core = core$1.exports;

var hasRequiredCore;

function requireCore () {
	if (hasRequiredCore) return core$1.exports;
	hasRequiredCore = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory();
			}
		}(core, function () {

			/*globals window, global, require*/

			/**
			 * CryptoJS core components.
			 */
			var CryptoJS = CryptoJS || (function (Math, undefined$1) {

			    var crypto;

			    // Native crypto from window (Browser)
			    if (typeof window !== 'undefined' && window.crypto) {
			        crypto = window.crypto;
			    }

			    // Native crypto in web worker (Browser)
			    if (typeof self !== 'undefined' && self.crypto) {
			        crypto = self.crypto;
			    }

			    // Native crypto from worker
			    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
			        crypto = globalThis.crypto;
			    }

			    // Native (experimental IE 11) crypto from window (Browser)
			    if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
			        crypto = window.msCrypto;
			    }

			    // Native crypto from global (NodeJS)
			    if (!crypto && typeof commonjsGlobal !== 'undefined' && commonjsGlobal.crypto) {
			        crypto = commonjsGlobal.crypto;
			    }

			    // Native crypto import via require (NodeJS)
			    if (!crypto && typeof commonjsRequire === 'function') {
			        try {
			            crypto = require$$0;
			        } catch (err) {}
			    }

			    /*
			     * Cryptographically secure pseudorandom number generator
			     *
			     * As Math.random() is cryptographically not safe to use
			     */
			    var cryptoSecureRandomInt = function () {
			        if (crypto) {
			            // Use getRandomValues method (Browser)
			            if (typeof crypto.getRandomValues === 'function') {
			                try {
			                    return crypto.getRandomValues(new Uint32Array(1))[0];
			                } catch (err) {}
			            }

			            // Use randomBytes method (NodeJS)
			            if (typeof crypto.randomBytes === 'function') {
			                try {
			                    return crypto.randomBytes(4).readInt32LE();
			                } catch (err) {}
			            }
			        }

			        throw new Error('Native crypto module could not be used to get secure random number.');
			    };

			    /*
			     * Local polyfill of Object.create

			     */
			    var create = Object.create || (function () {
			        function F() {}

			        return function (obj) {
			            var subtype;

			            F.prototype = obj;

			            subtype = new F();

			            F.prototype = null;

			            return subtype;
			        };
			    }());

			    /**
			     * CryptoJS namespace.
			     */
			    var C = {};

			    /**
			     * Library namespace.
			     */
			    var C_lib = C.lib = {};

			    /**
			     * Base object for prototypal inheritance.
			     */
			    var Base = C_lib.Base = (function () {


			        return {
			            /**
			             * Creates a new object that inherits from this object.
			             *
			             * @param {Object} overrides Properties to copy into the new object.
			             *
			             * @return {Object} The new object.
			             *
			             * @static
			             *
			             * @example
			             *
			             *     var MyType = CryptoJS.lib.Base.extend({
			             *         field: 'value',
			             *
			             *         method: function () {
			             *         }
			             *     });
			             */
			            extend: function (overrides) {
			                // Spawn
			                var subtype = create(this);

			                // Augment
			                if (overrides) {
			                    subtype.mixIn(overrides);
			                }

			                // Create default initializer
			                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
			                    subtype.init = function () {
			                        subtype.$super.init.apply(this, arguments);
			                    };
			                }

			                // Initializer's prototype is the subtype object
			                subtype.init.prototype = subtype;

			                // Reference supertype
			                subtype.$super = this;

			                return subtype;
			            },

			            /**
			             * Extends this object and runs the init method.
			             * Arguments to create() will be passed to init().
			             *
			             * @return {Object} The new object.
			             *
			             * @static
			             *
			             * @example
			             *
			             *     var instance = MyType.create();
			             */
			            create: function () {
			                var instance = this.extend();
			                instance.init.apply(instance, arguments);

			                return instance;
			            },

			            /**
			             * Initializes a newly created object.
			             * Override this method to add some logic when your objects are created.
			             *
			             * @example
			             *
			             *     var MyType = CryptoJS.lib.Base.extend({
			             *         init: function () {
			             *             // ...
			             *         }
			             *     });
			             */
			            init: function () {
			            },

			            /**
			             * Copies properties into this object.
			             *
			             * @param {Object} properties The properties to mix in.
			             *
			             * @example
			             *
			             *     MyType.mixIn({
			             *         field: 'value'
			             *     });
			             */
			            mixIn: function (properties) {
			                for (var propertyName in properties) {
			                    if (properties.hasOwnProperty(propertyName)) {
			                        this[propertyName] = properties[propertyName];
			                    }
			                }

			                // IE won't copy toString using the loop above
			                if (properties.hasOwnProperty('toString')) {
			                    this.toString = properties.toString;
			                }
			            },

			            /**
			             * Creates a copy of this object.
			             *
			             * @return {Object} The clone.
			             *
			             * @example
			             *
			             *     var clone = instance.clone();
			             */
			            clone: function () {
			                return this.init.prototype.extend(this);
			            }
			        };
			    }());

			    /**
			     * An array of 32-bit words.
			     *
			     * @property {Array} words The array of 32-bit words.
			     * @property {number} sigBytes The number of significant bytes in this word array.
			     */
			    var WordArray = C_lib.WordArray = Base.extend({
			        /**
			         * Initializes a newly created word array.
			         *
			         * @param {Array} words (Optional) An array of 32-bit words.
			         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.lib.WordArray.create();
			         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
			         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
			         */
			        init: function (words, sigBytes) {
			            words = this.words = words || [];

			            if (sigBytes != undefined$1) {
			                this.sigBytes = sigBytes;
			            } else {
			                this.sigBytes = words.length * 4;
			            }
			        },

			        /**
			         * Converts this word array to a string.
			         *
			         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
			         *
			         * @return {string} The stringified word array.
			         *
			         * @example
			         *
			         *     var string = wordArray + '';
			         *     var string = wordArray.toString();
			         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
			         */
			        toString: function (encoder) {
			            return (encoder || Hex).stringify(this);
			        },

			        /**
			         * Concatenates a word array to this word array.
			         *
			         * @param {WordArray} wordArray The word array to append.
			         *
			         * @return {WordArray} This word array.
			         *
			         * @example
			         *
			         *     wordArray1.concat(wordArray2);
			         */
			        concat: function (wordArray) {
			            // Shortcuts
			            var thisWords = this.words;
			            var thatWords = wordArray.words;
			            var thisSigBytes = this.sigBytes;
			            var thatSigBytes = wordArray.sigBytes;

			            // Clamp excess bits
			            this.clamp();

			            // Concat
			            if (thisSigBytes % 4) {
			                // Copy one byte at a time
			                for (var i = 0; i < thatSigBytes; i++) {
			                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
			                }
			            } else {
			                // Copy one word at a time
			                for (var j = 0; j < thatSigBytes; j += 4) {
			                    thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2];
			                }
			            }
			            this.sigBytes += thatSigBytes;

			            // Chainable
			            return this;
			        },

			        /**
			         * Removes insignificant bits.
			         *
			         * @example
			         *
			         *     wordArray.clamp();
			         */
			        clamp: function () {
			            // Shortcuts
			            var words = this.words;
			            var sigBytes = this.sigBytes;

			            // Clamp
			            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
			            words.length = Math.ceil(sigBytes / 4);
			        },

			        /**
			         * Creates a copy of this word array.
			         *
			         * @return {WordArray} The clone.
			         *
			         * @example
			         *
			         *     var clone = wordArray.clone();
			         */
			        clone: function () {
			            var clone = Base.clone.call(this);
			            clone.words = this.words.slice(0);

			            return clone;
			        },

			        /**
			         * Creates a word array filled with random bytes.
			         *
			         * @param {number} nBytes The number of random bytes to generate.
			         *
			         * @return {WordArray} The random word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.lib.WordArray.random(16);
			         */
			        random: function (nBytes) {
			            var words = [];

			            for (var i = 0; i < nBytes; i += 4) {
			                words.push(cryptoSecureRandomInt());
			            }

			            return new WordArray.init(words, nBytes);
			        }
			    });

			    /**
			     * Encoder namespace.
			     */
			    var C_enc = C.enc = {};

			    /**
			     * Hex encoding strategy.
			     */
			    var Hex = C_enc.Hex = {
			        /**
			         * Converts a word array to a hex string.
			         *
			         * @param {WordArray} wordArray The word array.
			         *
			         * @return {string} The hex string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
			         */
			        stringify: function (wordArray) {
			            // Shortcuts
			            var words = wordArray.words;
			            var sigBytes = wordArray.sigBytes;

			            // Convert
			            var hexChars = [];
			            for (var i = 0; i < sigBytes; i++) {
			                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			                hexChars.push((bite >>> 4).toString(16));
			                hexChars.push((bite & 0x0f).toString(16));
			            }

			            return hexChars.join('');
			        },

			        /**
			         * Converts a hex string to a word array.
			         *
			         * @param {string} hexStr The hex string.
			         *
			         * @return {WordArray} The word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
			         */
			        parse: function (hexStr) {
			            // Shortcut
			            var hexStrLength = hexStr.length;

			            // Convert
			            var words = [];
			            for (var i = 0; i < hexStrLength; i += 2) {
			                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
			            }

			            return new WordArray.init(words, hexStrLength / 2);
			        }
			    };

			    /**
			     * Latin1 encoding strategy.
			     */
			    var Latin1 = C_enc.Latin1 = {
			        /**
			         * Converts a word array to a Latin1 string.
			         *
			         * @param {WordArray} wordArray The word array.
			         *
			         * @return {string} The Latin1 string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
			         */
			        stringify: function (wordArray) {
			            // Shortcuts
			            var words = wordArray.words;
			            var sigBytes = wordArray.sigBytes;

			            // Convert
			            var latin1Chars = [];
			            for (var i = 0; i < sigBytes; i++) {
			                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			                latin1Chars.push(String.fromCharCode(bite));
			            }

			            return latin1Chars.join('');
			        },

			        /**
			         * Converts a Latin1 string to a word array.
			         *
			         * @param {string} latin1Str The Latin1 string.
			         *
			         * @return {WordArray} The word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
			         */
			        parse: function (latin1Str) {
			            // Shortcut
			            var latin1StrLength = latin1Str.length;

			            // Convert
			            var words = [];
			            for (var i = 0; i < latin1StrLength; i++) {
			                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
			            }

			            return new WordArray.init(words, latin1StrLength);
			        }
			    };

			    /**
			     * UTF-8 encoding strategy.
			     */
			    var Utf8 = C_enc.Utf8 = {
			        /**
			         * Converts a word array to a UTF-8 string.
			         *
			         * @param {WordArray} wordArray The word array.
			         *
			         * @return {string} The UTF-8 string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
			         */
			        stringify: function (wordArray) {
			            try {
			                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
			            } catch (e) {
			                throw new Error('Malformed UTF-8 data');
			            }
			        },

			        /**
			         * Converts a UTF-8 string to a word array.
			         *
			         * @param {string} utf8Str The UTF-8 string.
			         *
			         * @return {WordArray} The word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
			         */
			        parse: function (utf8Str) {
			            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
			        }
			    };

			    /**
			     * Abstract buffered block algorithm template.
			     *
			     * The property blockSize must be implemented in a concrete subtype.
			     *
			     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
			     */
			    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
			        /**
			         * Resets this block algorithm's data buffer to its initial state.
			         *
			         * @example
			         *
			         *     bufferedBlockAlgorithm.reset();
			         */
			        reset: function () {
			            // Initial values
			            this._data = new WordArray.init();
			            this._nDataBytes = 0;
			        },

			        /**
			         * Adds new data to this block algorithm's buffer.
			         *
			         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
			         *
			         * @example
			         *
			         *     bufferedBlockAlgorithm._append('data');
			         *     bufferedBlockAlgorithm._append(wordArray);
			         */
			        _append: function (data) {
			            // Convert string to WordArray, else assume WordArray already
			            if (typeof data == 'string') {
			                data = Utf8.parse(data);
			            }

			            // Append
			            this._data.concat(data);
			            this._nDataBytes += data.sigBytes;
			        },

			        /**
			         * Processes available data blocks.
			         *
			         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
			         *
			         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
			         *
			         * @return {WordArray} The processed data.
			         *
			         * @example
			         *
			         *     var processedData = bufferedBlockAlgorithm._process();
			         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
			         */
			        _process: function (doFlush) {
			            var processedWords;

			            // Shortcuts
			            var data = this._data;
			            var dataWords = data.words;
			            var dataSigBytes = data.sigBytes;
			            var blockSize = this.blockSize;
			            var blockSizeBytes = blockSize * 4;

			            // Count blocks ready
			            var nBlocksReady = dataSigBytes / blockSizeBytes;
			            if (doFlush) {
			                // Round up to include partial blocks
			                nBlocksReady = Math.ceil(nBlocksReady);
			            } else {
			                // Round down to include only full blocks,
			                // less the number of blocks that must remain in the buffer
			                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
			            }

			            // Count words ready
			            var nWordsReady = nBlocksReady * blockSize;

			            // Count bytes ready
			            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

			            // Process blocks
			            if (nWordsReady) {
			                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
			                    // Perform concrete-algorithm logic
			                    this._doProcessBlock(dataWords, offset);
			                }

			                // Remove processed words
			                processedWords = dataWords.splice(0, nWordsReady);
			                data.sigBytes -= nBytesReady;
			            }

			            // Return processed words
			            return new WordArray.init(processedWords, nBytesReady);
			        },

			        /**
			         * Creates a copy of this object.
			         *
			         * @return {Object} The clone.
			         *
			         * @example
			         *
			         *     var clone = bufferedBlockAlgorithm.clone();
			         */
			        clone: function () {
			            var clone = Base.clone.call(this);
			            clone._data = this._data.clone();

			            return clone;
			        },

			        _minBufferSize: 0
			    });

			    /**
			     * Abstract hasher template.
			     *
			     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
			     */
			    C_lib.Hasher = BufferedBlockAlgorithm.extend({
			        /**
			         * Configuration options.
			         */
			        cfg: Base.extend(),

			        /**
			         * Initializes a newly created hasher.
			         *
			         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
			         *
			         * @example
			         *
			         *     var hasher = CryptoJS.algo.SHA256.create();
			         */
			        init: function (cfg) {
			            // Apply config defaults
			            this.cfg = this.cfg.extend(cfg);

			            // Set initial values
			            this.reset();
			        },

			        /**
			         * Resets this hasher to its initial state.
			         *
			         * @example
			         *
			         *     hasher.reset();
			         */
			        reset: function () {
			            // Reset data buffer
			            BufferedBlockAlgorithm.reset.call(this);

			            // Perform concrete-hasher logic
			            this._doReset();
			        },

			        /**
			         * Updates this hasher with a message.
			         *
			         * @param {WordArray|string} messageUpdate The message to append.
			         *
			         * @return {Hasher} This hasher.
			         *
			         * @example
			         *
			         *     hasher.update('message');
			         *     hasher.update(wordArray);
			         */
			        update: function (messageUpdate) {
			            // Append
			            this._append(messageUpdate);

			            // Update the hash
			            this._process();

			            // Chainable
			            return this;
			        },

			        /**
			         * Finalizes the hash computation.
			         * Note that the finalize operation is effectively a destructive, read-once operation.
			         *
			         * @param {WordArray|string} messageUpdate (Optional) A final message update.
			         *
			         * @return {WordArray} The hash.
			         *
			         * @example
			         *
			         *     var hash = hasher.finalize();
			         *     var hash = hasher.finalize('message');
			         *     var hash = hasher.finalize(wordArray);
			         */
			        finalize: function (messageUpdate) {
			            // Final message update
			            if (messageUpdate) {
			                this._append(messageUpdate);
			            }

			            // Perform concrete-hasher logic
			            var hash = this._doFinalize();

			            return hash;
			        },

			        blockSize: 512/32,

			        /**
			         * Creates a shortcut function to a hasher's object interface.
			         *
			         * @param {Hasher} hasher The hasher to create a helper for.
			         *
			         * @return {Function} The shortcut function.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
			         */
			        _createHelper: function (hasher) {
			            return function (message, cfg) {
			                return new hasher.init(cfg).finalize(message);
			            };
			        },

			        /**
			         * Creates a shortcut function to the HMAC's object interface.
			         *
			         * @param {Hasher} hasher The hasher to use in this HMAC helper.
			         *
			         * @return {Function} The shortcut function.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
			         */
			        _createHmacHelper: function (hasher) {
			            return function (message, key) {
			                return new C_algo.HMAC.init(hasher, key).finalize(message);
			            };
			        }
			    });

			    /**
			     * Algorithm namespace.
			     */
			    var C_algo = C.algo = {};

			    return C;
			}(Math));


			return CryptoJS;

		})); 
	} (core$1));
	return core$1.exports;
}

var x64Core$1 = {exports: {}};

var x64Core = x64Core$1.exports;

var hasRequiredX64Core;

function requireX64Core () {
	if (hasRequiredX64Core) return x64Core$1.exports;
	hasRequiredX64Core = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore());
			}
		}(x64Core, function (CryptoJS) {

			(function (undefined$1) {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var Base = C_lib.Base;
			    var X32WordArray = C_lib.WordArray;

			    /**
			     * x64 namespace.
			     */
			    var C_x64 = C.x64 = {};

			    /**
			     * A 64-bit word.
			     */
			    C_x64.Word = Base.extend({
			        /**
			         * Initializes a newly created 64-bit word.
			         *
			         * @param {number} high The high 32 bits.
			         * @param {number} low The low 32 bits.
			         *
			         * @example
			         *
			         *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
			         */
			        init: function (high, low) {
			            this.high = high;
			            this.low = low;
			        }

			        /**
			         * Bitwise NOTs this word.
			         *
			         * @return {X64Word} A new x64-Word object after negating.
			         *
			         * @example
			         *
			         *     var negated = x64Word.not();
			         */
			        // not: function () {
			            // var high = ~this.high;
			            // var low = ~this.low;

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Bitwise ANDs this word with the passed word.
			         *
			         * @param {X64Word} word The x64-Word to AND with this word.
			         *
			         * @return {X64Word} A new x64-Word object after ANDing.
			         *
			         * @example
			         *
			         *     var anded = x64Word.and(anotherX64Word);
			         */
			        // and: function (word) {
			            // var high = this.high & word.high;
			            // var low = this.low & word.low;

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Bitwise ORs this word with the passed word.
			         *
			         * @param {X64Word} word The x64-Word to OR with this word.
			         *
			         * @return {X64Word} A new x64-Word object after ORing.
			         *
			         * @example
			         *
			         *     var ored = x64Word.or(anotherX64Word);
			         */
			        // or: function (word) {
			            // var high = this.high | word.high;
			            // var low = this.low | word.low;

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Bitwise XORs this word with the passed word.
			         *
			         * @param {X64Word} word The x64-Word to XOR with this word.
			         *
			         * @return {X64Word} A new x64-Word object after XORing.
			         *
			         * @example
			         *
			         *     var xored = x64Word.xor(anotherX64Word);
			         */
			        // xor: function (word) {
			            // var high = this.high ^ word.high;
			            // var low = this.low ^ word.low;

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Shifts this word n bits to the left.
			         *
			         * @param {number} n The number of bits to shift.
			         *
			         * @return {X64Word} A new x64-Word object after shifting.
			         *
			         * @example
			         *
			         *     var shifted = x64Word.shiftL(25);
			         */
			        // shiftL: function (n) {
			            // if (n < 32) {
			                // var high = (this.high << n) | (this.low >>> (32 - n));
			                // var low = this.low << n;
			            // } else {
			                // var high = this.low << (n - 32);
			                // var low = 0;
			            // }

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Shifts this word n bits to the right.
			         *
			         * @param {number} n The number of bits to shift.
			         *
			         * @return {X64Word} A new x64-Word object after shifting.
			         *
			         * @example
			         *
			         *     var shifted = x64Word.shiftR(7);
			         */
			        // shiftR: function (n) {
			            // if (n < 32) {
			                // var low = (this.low >>> n) | (this.high << (32 - n));
			                // var high = this.high >>> n;
			            // } else {
			                // var low = this.high >>> (n - 32);
			                // var high = 0;
			            // }

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Rotates this word n bits to the left.
			         *
			         * @param {number} n The number of bits to rotate.
			         *
			         * @return {X64Word} A new x64-Word object after rotating.
			         *
			         * @example
			         *
			         *     var rotated = x64Word.rotL(25);
			         */
			        // rotL: function (n) {
			            // return this.shiftL(n).or(this.shiftR(64 - n));
			        // },

			        /**
			         * Rotates this word n bits to the right.
			         *
			         * @param {number} n The number of bits to rotate.
			         *
			         * @return {X64Word} A new x64-Word object after rotating.
			         *
			         * @example
			         *
			         *     var rotated = x64Word.rotR(7);
			         */
			        // rotR: function (n) {
			            // return this.shiftR(n).or(this.shiftL(64 - n));
			        // },

			        /**
			         * Adds this word with the passed word.
			         *
			         * @param {X64Word} word The x64-Word to add with this word.
			         *
			         * @return {X64Word} A new x64-Word object after adding.
			         *
			         * @example
			         *
			         *     var added = x64Word.add(anotherX64Word);
			         */
			        // add: function (word) {
			            // var low = (this.low + word.low) | 0;
			            // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
			            // var high = (this.high + word.high + carry) | 0;

			            // return X64Word.create(high, low);
			        // }
			    });

			    /**
			     * An array of 64-bit words.
			     *
			     * @property {Array} words The array of CryptoJS.x64.Word objects.
			     * @property {number} sigBytes The number of significant bytes in this word array.
			     */
			    C_x64.WordArray = Base.extend({
			        /**
			         * Initializes a newly created word array.
			         *
			         * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
			         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.x64.WordArray.create();
			         *
			         *     var wordArray = CryptoJS.x64.WordArray.create([
			         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
			         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
			         *     ]);
			         *
			         *     var wordArray = CryptoJS.x64.WordArray.create([
			         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
			         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
			         *     ], 10);
			         */
			        init: function (words, sigBytes) {
			            words = this.words = words || [];

			            if (sigBytes != undefined$1) {
			                this.sigBytes = sigBytes;
			            } else {
			                this.sigBytes = words.length * 8;
			            }
			        },

			        /**
			         * Converts this 64-bit word array to a 32-bit word array.
			         *
			         * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
			         *
			         * @example
			         *
			         *     var x32WordArray = x64WordArray.toX32();
			         */
			        toX32: function () {
			            // Shortcuts
			            var x64Words = this.words;
			            var x64WordsLength = x64Words.length;

			            // Convert
			            var x32Words = [];
			            for (var i = 0; i < x64WordsLength; i++) {
			                var x64Word = x64Words[i];
			                x32Words.push(x64Word.high);
			                x32Words.push(x64Word.low);
			            }

			            return X32WordArray.create(x32Words, this.sigBytes);
			        },

			        /**
			         * Creates a copy of this word array.
			         *
			         * @return {X64WordArray} The clone.
			         *
			         * @example
			         *
			         *     var clone = x64WordArray.clone();
			         */
			        clone: function () {
			            var clone = Base.clone.call(this);

			            // Clone "words" array
			            var words = clone.words = this.words.slice(0);

			            // Clone each X64Word object
			            var wordsLength = words.length;
			            for (var i = 0; i < wordsLength; i++) {
			                words[i] = words[i].clone();
			            }

			            return clone;
			        }
			    });
			}());


			return CryptoJS;

		})); 
	} (x64Core$1));
	return x64Core$1.exports;
}

var libTypedarrays$1 = {exports: {}};

var libTypedarrays = libTypedarrays$1.exports;

var hasRequiredLibTypedarrays;

function requireLibTypedarrays () {
	if (hasRequiredLibTypedarrays) return libTypedarrays$1.exports;
	hasRequiredLibTypedarrays = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore());
			}
		}(libTypedarrays, function (CryptoJS) {

			(function () {
			    // Check if typed arrays are supported
			    if (typeof ArrayBuffer != 'function') {
			        return;
			    }

			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var WordArray = C_lib.WordArray;

			    // Reference original init
			    var superInit = WordArray.init;

			    // Augment WordArray.init to handle typed arrays
			    var subInit = WordArray.init = function (typedArray) {
			        // Convert buffers to uint8
			        if (typedArray instanceof ArrayBuffer) {
			            typedArray = new Uint8Array(typedArray);
			        }

			        // Convert other array views to uint8
			        if (
			            typedArray instanceof Int8Array ||
			            (typeof Uint8ClampedArray !== "undefined" && typedArray instanceof Uint8ClampedArray) ||
			            typedArray instanceof Int16Array ||
			            typedArray instanceof Uint16Array ||
			            typedArray instanceof Int32Array ||
			            typedArray instanceof Uint32Array ||
			            typedArray instanceof Float32Array ||
			            typedArray instanceof Float64Array
			        ) {
			            typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
			        }

			        // Handle Uint8Array
			        if (typedArray instanceof Uint8Array) {
			            // Shortcut
			            var typedArrayByteLength = typedArray.byteLength;

			            // Extract bytes
			            var words = [];
			            for (var i = 0; i < typedArrayByteLength; i++) {
			                words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
			            }

			            // Initialize this word array
			            superInit.call(this, words, typedArrayByteLength);
			        } else {
			            // Else call normal init
			            superInit.apply(this, arguments);
			        }
			    };

			    subInit.prototype = WordArray;
			}());


			return CryptoJS.lib.WordArray;

		})); 
	} (libTypedarrays$1));
	return libTypedarrays$1.exports;
}

var encUtf16$1 = {exports: {}};

var encUtf16 = encUtf16$1.exports;

var hasRequiredEncUtf16;

function requireEncUtf16 () {
	if (hasRequiredEncUtf16) return encUtf16$1.exports;
	hasRequiredEncUtf16 = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore());
			}
		}(encUtf16, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var WordArray = C_lib.WordArray;
			    var C_enc = C.enc;

			    /**
			     * UTF-16 BE encoding strategy.
			     */
			    C_enc.Utf16 = C_enc.Utf16BE = {
			        /**
			         * Converts a word array to a UTF-16 BE string.
			         *
			         * @param {WordArray} wordArray The word array.
			         *
			         * @return {string} The UTF-16 BE string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
			         */
			        stringify: function (wordArray) {
			            // Shortcuts
			            var words = wordArray.words;
			            var sigBytes = wordArray.sigBytes;

			            // Convert
			            var utf16Chars = [];
			            for (var i = 0; i < sigBytes; i += 2) {
			                var codePoint = (words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff;
			                utf16Chars.push(String.fromCharCode(codePoint));
			            }

			            return utf16Chars.join('');
			        },

			        /**
			         * Converts a UTF-16 BE string to a word array.
			         *
			         * @param {string} utf16Str The UTF-16 BE string.
			         *
			         * @return {WordArray} The word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.enc.Utf16.parse(utf16String);
			         */
			        parse: function (utf16Str) {
			            // Shortcut
			            var utf16StrLength = utf16Str.length;

			            // Convert
			            var words = [];
			            for (var i = 0; i < utf16StrLength; i++) {
			                words[i >>> 1] |= utf16Str.charCodeAt(i) << (16 - (i % 2) * 16);
			            }

			            return WordArray.create(words, utf16StrLength * 2);
			        }
			    };

			    /**
			     * UTF-16 LE encoding strategy.
			     */
			    C_enc.Utf16LE = {
			        /**
			         * Converts a word array to a UTF-16 LE string.
			         *
			         * @param {WordArray} wordArray The word array.
			         *
			         * @return {string} The UTF-16 LE string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
			         */
			        stringify: function (wordArray) {
			            // Shortcuts
			            var words = wordArray.words;
			            var sigBytes = wordArray.sigBytes;

			            // Convert
			            var utf16Chars = [];
			            for (var i = 0; i < sigBytes; i += 2) {
			                var codePoint = swapEndian((words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff);
			                utf16Chars.push(String.fromCharCode(codePoint));
			            }

			            return utf16Chars.join('');
			        },

			        /**
			         * Converts a UTF-16 LE string to a word array.
			         *
			         * @param {string} utf16Str The UTF-16 LE string.
			         *
			         * @return {WordArray} The word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
			         */
			        parse: function (utf16Str) {
			            // Shortcut
			            var utf16StrLength = utf16Str.length;

			            // Convert
			            var words = [];
			            for (var i = 0; i < utf16StrLength; i++) {
			                words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << (16 - (i % 2) * 16));
			            }

			            return WordArray.create(words, utf16StrLength * 2);
			        }
			    };

			    function swapEndian(word) {
			        return ((word << 8) & 0xff00ff00) | ((word >>> 8) & 0x00ff00ff);
			    }
			}());


			return CryptoJS.enc.Utf16;

		})); 
	} (encUtf16$1));
	return encUtf16$1.exports;
}

var encBase64$1 = {exports: {}};

var encBase64 = encBase64$1.exports;

var hasRequiredEncBase64;

function requireEncBase64 () {
	if (hasRequiredEncBase64) return encBase64$1.exports;
	hasRequiredEncBase64 = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore());
			}
		}(encBase64, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var WordArray = C_lib.WordArray;
			    var C_enc = C.enc;

			    /**
			     * Base64 encoding strategy.
			     */
			    C_enc.Base64 = {
			        /**
			         * Converts a word array to a Base64 string.
			         *
			         * @param {WordArray} wordArray The word array.
			         *
			         * @return {string} The Base64 string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
			         */
			        stringify: function (wordArray) {
			            // Shortcuts
			            var words = wordArray.words;
			            var sigBytes = wordArray.sigBytes;
			            var map = this._map;

			            // Clamp excess bits
			            wordArray.clamp();

			            // Convert
			            var base64Chars = [];
			            for (var i = 0; i < sigBytes; i += 3) {
			                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
			                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
			                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

			                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

			                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
			                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
			                }
			            }

			            // Add padding
			            var paddingChar = map.charAt(64);
			            if (paddingChar) {
			                while (base64Chars.length % 4) {
			                    base64Chars.push(paddingChar);
			                }
			            }

			            return base64Chars.join('');
			        },

			        /**
			         * Converts a Base64 string to a word array.
			         *
			         * @param {string} base64Str The Base64 string.
			         *
			         * @return {WordArray} The word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
			         */
			        parse: function (base64Str) {
			            // Shortcuts
			            var base64StrLength = base64Str.length;
			            var map = this._map;
			            var reverseMap = this._reverseMap;

			            if (!reverseMap) {
			                    reverseMap = this._reverseMap = [];
			                    for (var j = 0; j < map.length; j++) {
			                        reverseMap[map.charCodeAt(j)] = j;
			                    }
			            }

			            // Ignore padding
			            var paddingChar = map.charAt(64);
			            if (paddingChar) {
			                var paddingIndex = base64Str.indexOf(paddingChar);
			                if (paddingIndex !== -1) {
			                    base64StrLength = paddingIndex;
			                }
			            }

			            // Convert
			            return parseLoop(base64Str, base64StrLength, reverseMap);

			        },

			        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
			    };

			    function parseLoop(base64Str, base64StrLength, reverseMap) {
			      var words = [];
			      var nBytes = 0;
			      for (var i = 0; i < base64StrLength; i++) {
			          if (i % 4) {
			              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
			              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
			              var bitsCombined = bits1 | bits2;
			              words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
			              nBytes++;
			          }
			      }
			      return WordArray.create(words, nBytes);
			    }
			}());


			return CryptoJS.enc.Base64;

		})); 
	} (encBase64$1));
	return encBase64$1.exports;
}

var encBase64url$1 = {exports: {}};

var encBase64url = encBase64url$1.exports;

var hasRequiredEncBase64url;

function requireEncBase64url () {
	if (hasRequiredEncBase64url) return encBase64url$1.exports;
	hasRequiredEncBase64url = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore());
			}
		}(encBase64url, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var WordArray = C_lib.WordArray;
			    var C_enc = C.enc;

			    /**
			     * Base64url encoding strategy.
			     */
			    C_enc.Base64url = {
			        /**
			         * Converts a word array to a Base64url string.
			         *
			         * @param {WordArray} wordArray The word array.
			         *
			         * @param {boolean} urlSafe Whether to use url safe
			         *
			         * @return {string} The Base64url string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var base64String = CryptoJS.enc.Base64url.stringify(wordArray);
			         */
			        stringify: function (wordArray, urlSafe) {
			            if (urlSafe === undefined) {
			                urlSafe = true;
			            }
			            // Shortcuts
			            var words = wordArray.words;
			            var sigBytes = wordArray.sigBytes;
			            var map = urlSafe ? this._safe_map : this._map;

			            // Clamp excess bits
			            wordArray.clamp();

			            // Convert
			            var base64Chars = [];
			            for (var i = 0; i < sigBytes; i += 3) {
			                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
			                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
			                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

			                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

			                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
			                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
			                }
			            }

			            // Add padding
			            var paddingChar = map.charAt(64);
			            if (paddingChar) {
			                while (base64Chars.length % 4) {
			                    base64Chars.push(paddingChar);
			                }
			            }

			            return base64Chars.join('');
			        },

			        /**
			         * Converts a Base64url string to a word array.
			         *
			         * @param {string} base64Str The Base64url string.
			         *
			         * @param {boolean} urlSafe Whether to use url safe
			         *
			         * @return {WordArray} The word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.enc.Base64url.parse(base64String);
			         */
			        parse: function (base64Str, urlSafe) {
			            if (urlSafe === undefined) {
			                urlSafe = true;
			            }

			            // Shortcuts
			            var base64StrLength = base64Str.length;
			            var map = urlSafe ? this._safe_map : this._map;
			            var reverseMap = this._reverseMap;

			            if (!reverseMap) {
			                reverseMap = this._reverseMap = [];
			                for (var j = 0; j < map.length; j++) {
			                    reverseMap[map.charCodeAt(j)] = j;
			                }
			            }

			            // Ignore padding
			            var paddingChar = map.charAt(64);
			            if (paddingChar) {
			                var paddingIndex = base64Str.indexOf(paddingChar);
			                if (paddingIndex !== -1) {
			                    base64StrLength = paddingIndex;
			                }
			            }

			            // Convert
			            return parseLoop(base64Str, base64StrLength, reverseMap);

			        },

			        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
			        _safe_map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
			    };

			    function parseLoop(base64Str, base64StrLength, reverseMap) {
			        var words = [];
			        var nBytes = 0;
			        for (var i = 0; i < base64StrLength; i++) {
			            if (i % 4) {
			                var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
			                var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
			                var bitsCombined = bits1 | bits2;
			                words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
			                nBytes++;
			            }
			        }
			        return WordArray.create(words, nBytes);
			    }
			}());


			return CryptoJS.enc.Base64url;

		})); 
	} (encBase64url$1));
	return encBase64url$1.exports;
}

var md5$1 = {exports: {}};

var md5 = md5$1.exports;

var hasRequiredMd5;

function requireMd5 () {
	if (hasRequiredMd5) return md5$1.exports;
	hasRequiredMd5 = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore());
			}
		}(md5, function (CryptoJS) {

			(function (Math) {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var WordArray = C_lib.WordArray;
			    var Hasher = C_lib.Hasher;
			    var C_algo = C.algo;

			    // Constants table
			    var T = [];

			    // Compute constants
			    (function () {
			        for (var i = 0; i < 64; i++) {
			            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
			        }
			    }());

			    /**
			     * MD5 hash algorithm.
			     */
			    var MD5 = C_algo.MD5 = Hasher.extend({
			        _doReset: function () {
			            this._hash = new WordArray.init([
			                0x67452301, 0xefcdab89,
			                0x98badcfe, 0x10325476
			            ]);
			        },

			        _doProcessBlock: function (M, offset) {
			            // Swap endian
			            for (var i = 0; i < 16; i++) {
			                // Shortcuts
			                var offset_i = offset + i;
			                var M_offset_i = M[offset_i];

			                M[offset_i] = (
			                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
			                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
			                );
			            }

			            // Shortcuts
			            var H = this._hash.words;

			            var M_offset_0  = M[offset + 0];
			            var M_offset_1  = M[offset + 1];
			            var M_offset_2  = M[offset + 2];
			            var M_offset_3  = M[offset + 3];
			            var M_offset_4  = M[offset + 4];
			            var M_offset_5  = M[offset + 5];
			            var M_offset_6  = M[offset + 6];
			            var M_offset_7  = M[offset + 7];
			            var M_offset_8  = M[offset + 8];
			            var M_offset_9  = M[offset + 9];
			            var M_offset_10 = M[offset + 10];
			            var M_offset_11 = M[offset + 11];
			            var M_offset_12 = M[offset + 12];
			            var M_offset_13 = M[offset + 13];
			            var M_offset_14 = M[offset + 14];
			            var M_offset_15 = M[offset + 15];

			            // Working variables
			            var a = H[0];
			            var b = H[1];
			            var c = H[2];
			            var d = H[3];

			            // Computation
			            a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
			            d = FF(d, a, b, c, M_offset_1,  12, T[1]);
			            c = FF(c, d, a, b, M_offset_2,  17, T[2]);
			            b = FF(b, c, d, a, M_offset_3,  22, T[3]);
			            a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
			            d = FF(d, a, b, c, M_offset_5,  12, T[5]);
			            c = FF(c, d, a, b, M_offset_6,  17, T[6]);
			            b = FF(b, c, d, a, M_offset_7,  22, T[7]);
			            a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
			            d = FF(d, a, b, c, M_offset_9,  12, T[9]);
			            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
			            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
			            a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
			            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
			            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
			            b = FF(b, c, d, a, M_offset_15, 22, T[15]);

			            a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
			            d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
			            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
			            b = GG(b, c, d, a, M_offset_0,  20, T[19]);
			            a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
			            d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
			            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
			            b = GG(b, c, d, a, M_offset_4,  20, T[23]);
			            a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
			            d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
			            c = GG(c, d, a, b, M_offset_3,  14, T[26]);
			            b = GG(b, c, d, a, M_offset_8,  20, T[27]);
			            a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
			            d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
			            c = GG(c, d, a, b, M_offset_7,  14, T[30]);
			            b = GG(b, c, d, a, M_offset_12, 20, T[31]);

			            a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
			            d = HH(d, a, b, c, M_offset_8,  11, T[33]);
			            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
			            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
			            a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
			            d = HH(d, a, b, c, M_offset_4,  11, T[37]);
			            c = HH(c, d, a, b, M_offset_7,  16, T[38]);
			            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
			            a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
			            d = HH(d, a, b, c, M_offset_0,  11, T[41]);
			            c = HH(c, d, a, b, M_offset_3,  16, T[42]);
			            b = HH(b, c, d, a, M_offset_6,  23, T[43]);
			            a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
			            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
			            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
			            b = HH(b, c, d, a, M_offset_2,  23, T[47]);

			            a = II(a, b, c, d, M_offset_0,  6,  T[48]);
			            d = II(d, a, b, c, M_offset_7,  10, T[49]);
			            c = II(c, d, a, b, M_offset_14, 15, T[50]);
			            b = II(b, c, d, a, M_offset_5,  21, T[51]);
			            a = II(a, b, c, d, M_offset_12, 6,  T[52]);
			            d = II(d, a, b, c, M_offset_3,  10, T[53]);
			            c = II(c, d, a, b, M_offset_10, 15, T[54]);
			            b = II(b, c, d, a, M_offset_1,  21, T[55]);
			            a = II(a, b, c, d, M_offset_8,  6,  T[56]);
			            d = II(d, a, b, c, M_offset_15, 10, T[57]);
			            c = II(c, d, a, b, M_offset_6,  15, T[58]);
			            b = II(b, c, d, a, M_offset_13, 21, T[59]);
			            a = II(a, b, c, d, M_offset_4,  6,  T[60]);
			            d = II(d, a, b, c, M_offset_11, 10, T[61]);
			            c = II(c, d, a, b, M_offset_2,  15, T[62]);
			            b = II(b, c, d, a, M_offset_9,  21, T[63]);

			            // Intermediate hash value
			            H[0] = (H[0] + a) | 0;
			            H[1] = (H[1] + b) | 0;
			            H[2] = (H[2] + c) | 0;
			            H[3] = (H[3] + d) | 0;
			        },

			        _doFinalize: function () {
			            // Shortcuts
			            var data = this._data;
			            var dataWords = data.words;

			            var nBitsTotal = this._nDataBytes * 8;
			            var nBitsLeft = data.sigBytes * 8;

			            // Add padding
			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

			            var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
			            var nBitsTotalL = nBitsTotal;
			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
			                (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
			                (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
			            );
			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
			                (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
			                (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
			            );

			            data.sigBytes = (dataWords.length + 1) * 4;

			            // Hash final blocks
			            this._process();

			            // Shortcuts
			            var hash = this._hash;
			            var H = hash.words;

			            // Swap endian
			            for (var i = 0; i < 4; i++) {
			                // Shortcut
			                var H_i = H[i];

			                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
			                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
			            }

			            // Return final computed hash
			            return hash;
			        },

			        clone: function () {
			            var clone = Hasher.clone.call(this);
			            clone._hash = this._hash.clone();

			            return clone;
			        }
			    });

			    function FF(a, b, c, d, x, s, t) {
			        var n = a + ((b & c) | (~b & d)) + x + t;
			        return ((n << s) | (n >>> (32 - s))) + b;
			    }

			    function GG(a, b, c, d, x, s, t) {
			        var n = a + ((b & d) | (c & ~d)) + x + t;
			        return ((n << s) | (n >>> (32 - s))) + b;
			    }

			    function HH(a, b, c, d, x, s, t) {
			        var n = a + (b ^ c ^ d) + x + t;
			        return ((n << s) | (n >>> (32 - s))) + b;
			    }

			    function II(a, b, c, d, x, s, t) {
			        var n = a + (c ^ (b | ~d)) + x + t;
			        return ((n << s) | (n >>> (32 - s))) + b;
			    }

			    /**
			     * Shortcut function to the hasher's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     *
			     * @return {WordArray} The hash.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hash = CryptoJS.MD5('message');
			     *     var hash = CryptoJS.MD5(wordArray);
			     */
			    C.MD5 = Hasher._createHelper(MD5);

			    /**
			     * Shortcut function to the HMAC's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     * @param {WordArray|string} key The secret key.
			     *
			     * @return {WordArray} The HMAC.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hmac = CryptoJS.HmacMD5(message, key);
			     */
			    C.HmacMD5 = Hasher._createHmacHelper(MD5);
			}(Math));


			return CryptoJS.MD5;

		})); 
	} (md5$1));
	return md5$1.exports;
}

var sha1$1 = {exports: {}};

var sha1 = sha1$1.exports;

var hasRequiredSha1;

function requireSha1 () {
	if (hasRequiredSha1) return sha1$1.exports;
	hasRequiredSha1 = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore());
			}
		}(sha1, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var WordArray = C_lib.WordArray;
			    var Hasher = C_lib.Hasher;
			    var C_algo = C.algo;

			    // Reusable object
			    var W = [];

			    /**
			     * SHA-1 hash algorithm.
			     */
			    var SHA1 = C_algo.SHA1 = Hasher.extend({
			        _doReset: function () {
			            this._hash = new WordArray.init([
			                0x67452301, 0xefcdab89,
			                0x98badcfe, 0x10325476,
			                0xc3d2e1f0
			            ]);
			        },

			        _doProcessBlock: function (M, offset) {
			            // Shortcut
			            var H = this._hash.words;

			            // Working variables
			            var a = H[0];
			            var b = H[1];
			            var c = H[2];
			            var d = H[3];
			            var e = H[4];

			            // Computation
			            for (var i = 0; i < 80; i++) {
			                if (i < 16) {
			                    W[i] = M[offset + i] | 0;
			                } else {
			                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
			                    W[i] = (n << 1) | (n >>> 31);
			                }

			                var t = ((a << 5) | (a >>> 27)) + e + W[i];
			                if (i < 20) {
			                    t += ((b & c) | (~b & d)) + 0x5a827999;
			                } else if (i < 40) {
			                    t += (b ^ c ^ d) + 0x6ed9eba1;
			                } else if (i < 60) {
			                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
			                } else /* if (i < 80) */ {
			                    t += (b ^ c ^ d) - 0x359d3e2a;
			                }

			                e = d;
			                d = c;
			                c = (b << 30) | (b >>> 2);
			                b = a;
			                a = t;
			            }

			            // Intermediate hash value
			            H[0] = (H[0] + a) | 0;
			            H[1] = (H[1] + b) | 0;
			            H[2] = (H[2] + c) | 0;
			            H[3] = (H[3] + d) | 0;
			            H[4] = (H[4] + e) | 0;
			        },

			        _doFinalize: function () {
			            // Shortcuts
			            var data = this._data;
			            var dataWords = data.words;

			            var nBitsTotal = this._nDataBytes * 8;
			            var nBitsLeft = data.sigBytes * 8;

			            // Add padding
			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
			            data.sigBytes = dataWords.length * 4;

			            // Hash final blocks
			            this._process();

			            // Return final computed hash
			            return this._hash;
			        },

			        clone: function () {
			            var clone = Hasher.clone.call(this);
			            clone._hash = this._hash.clone();

			            return clone;
			        }
			    });

			    /**
			     * Shortcut function to the hasher's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     *
			     * @return {WordArray} The hash.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hash = CryptoJS.SHA1('message');
			     *     var hash = CryptoJS.SHA1(wordArray);
			     */
			    C.SHA1 = Hasher._createHelper(SHA1);

			    /**
			     * Shortcut function to the HMAC's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     * @param {WordArray|string} key The secret key.
			     *
			     * @return {WordArray} The HMAC.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hmac = CryptoJS.HmacSHA1(message, key);
			     */
			    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
			}());


			return CryptoJS.SHA1;

		})); 
	} (sha1$1));
	return sha1$1.exports;
}

var sha256$1 = {exports: {}};

var sha256 = sha256$1.exports;

var hasRequiredSha256;

function requireSha256 () {
	if (hasRequiredSha256) return sha256$1.exports;
	hasRequiredSha256 = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore());
			}
		}(sha256, function (CryptoJS) {

			(function (Math) {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var WordArray = C_lib.WordArray;
			    var Hasher = C_lib.Hasher;
			    var C_algo = C.algo;

			    // Initialization and round constants tables
			    var H = [];
			    var K = [];

			    // Compute constants
			    (function () {
			        function isPrime(n) {
			            var sqrtN = Math.sqrt(n);
			            for (var factor = 2; factor <= sqrtN; factor++) {
			                if (!(n % factor)) {
			                    return false;
			                }
			            }

			            return true;
			        }

			        function getFractionalBits(n) {
			            return ((n - (n | 0)) * 0x100000000) | 0;
			        }

			        var n = 2;
			        var nPrime = 0;
			        while (nPrime < 64) {
			            if (isPrime(n)) {
			                if (nPrime < 8) {
			                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
			                }
			                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

			                nPrime++;
			            }

			            n++;
			        }
			    }());

			    // Reusable object
			    var W = [];

			    /**
			     * SHA-256 hash algorithm.
			     */
			    var SHA256 = C_algo.SHA256 = Hasher.extend({
			        _doReset: function () {
			            this._hash = new WordArray.init(H.slice(0));
			        },

			        _doProcessBlock: function (M, offset) {
			            // Shortcut
			            var H = this._hash.words;

			            // Working variables
			            var a = H[0];
			            var b = H[1];
			            var c = H[2];
			            var d = H[3];
			            var e = H[4];
			            var f = H[5];
			            var g = H[6];
			            var h = H[7];

			            // Computation
			            for (var i = 0; i < 64; i++) {
			                if (i < 16) {
			                    W[i] = M[offset + i] | 0;
			                } else {
			                    var gamma0x = W[i - 15];
			                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
			                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
			                                   (gamma0x >>> 3);

			                    var gamma1x = W[i - 2];
			                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
			                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
			                                   (gamma1x >>> 10);

			                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
			                }

			                var ch  = (e & f) ^ (~e & g);
			                var maj = (a & b) ^ (a & c) ^ (b & c);

			                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
			                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

			                var t1 = h + sigma1 + ch + K[i] + W[i];
			                var t2 = sigma0 + maj;

			                h = g;
			                g = f;
			                f = e;
			                e = (d + t1) | 0;
			                d = c;
			                c = b;
			                b = a;
			                a = (t1 + t2) | 0;
			            }

			            // Intermediate hash value
			            H[0] = (H[0] + a) | 0;
			            H[1] = (H[1] + b) | 0;
			            H[2] = (H[2] + c) | 0;
			            H[3] = (H[3] + d) | 0;
			            H[4] = (H[4] + e) | 0;
			            H[5] = (H[5] + f) | 0;
			            H[6] = (H[6] + g) | 0;
			            H[7] = (H[7] + h) | 0;
			        },

			        _doFinalize: function () {
			            // Shortcuts
			            var data = this._data;
			            var dataWords = data.words;

			            var nBitsTotal = this._nDataBytes * 8;
			            var nBitsLeft = data.sigBytes * 8;

			            // Add padding
			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
			            data.sigBytes = dataWords.length * 4;

			            // Hash final blocks
			            this._process();

			            // Return final computed hash
			            return this._hash;
			        },

			        clone: function () {
			            var clone = Hasher.clone.call(this);
			            clone._hash = this._hash.clone();

			            return clone;
			        }
			    });

			    /**
			     * Shortcut function to the hasher's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     *
			     * @return {WordArray} The hash.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hash = CryptoJS.SHA256('message');
			     *     var hash = CryptoJS.SHA256(wordArray);
			     */
			    C.SHA256 = Hasher._createHelper(SHA256);

			    /**
			     * Shortcut function to the HMAC's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     * @param {WordArray|string} key The secret key.
			     *
			     * @return {WordArray} The HMAC.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hmac = CryptoJS.HmacSHA256(message, key);
			     */
			    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
			}(Math));


			return CryptoJS.SHA256;

		})); 
	} (sha256$1));
	return sha256$1.exports;
}

var sha224$1 = {exports: {}};

var sha224 = sha224$1.exports;

var hasRequiredSha224;

function requireSha224 () {
	if (hasRequiredSha224) return sha224$1.exports;
	hasRequiredSha224 = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireSha256());
			}
		}(sha224, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var WordArray = C_lib.WordArray;
			    var C_algo = C.algo;
			    var SHA256 = C_algo.SHA256;

			    /**
			     * SHA-224 hash algorithm.
			     */
			    var SHA224 = C_algo.SHA224 = SHA256.extend({
			        _doReset: function () {
			            this._hash = new WordArray.init([
			                0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
			                0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
			            ]);
			        },

			        _doFinalize: function () {
			            var hash = SHA256._doFinalize.call(this);

			            hash.sigBytes -= 4;

			            return hash;
			        }
			    });

			    /**
			     * Shortcut function to the hasher's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     *
			     * @return {WordArray} The hash.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hash = CryptoJS.SHA224('message');
			     *     var hash = CryptoJS.SHA224(wordArray);
			     */
			    C.SHA224 = SHA256._createHelper(SHA224);

			    /**
			     * Shortcut function to the HMAC's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     * @param {WordArray|string} key The secret key.
			     *
			     * @return {WordArray} The HMAC.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hmac = CryptoJS.HmacSHA224(message, key);
			     */
			    C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
			}());


			return CryptoJS.SHA224;

		})); 
	} (sha224$1));
	return sha224$1.exports;
}

var sha512$1 = {exports: {}};

var sha512 = sha512$1.exports;

var hasRequiredSha512;

function requireSha512 () {
	if (hasRequiredSha512) return sha512$1.exports;
	hasRequiredSha512 = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireX64Core());
			}
		}(sha512, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var Hasher = C_lib.Hasher;
			    var C_x64 = C.x64;
			    var X64Word = C_x64.Word;
			    var X64WordArray = C_x64.WordArray;
			    var C_algo = C.algo;

			    function X64Word_create() {
			        return X64Word.create.apply(X64Word, arguments);
			    }

			    // Constants
			    var K = [
			        X64Word_create(0x428a2f98, 0xd728ae22), X64Word_create(0x71374491, 0x23ef65cd),
			        X64Word_create(0xb5c0fbcf, 0xec4d3b2f), X64Word_create(0xe9b5dba5, 0x8189dbbc),
			        X64Word_create(0x3956c25b, 0xf348b538), X64Word_create(0x59f111f1, 0xb605d019),
			        X64Word_create(0x923f82a4, 0xaf194f9b), X64Word_create(0xab1c5ed5, 0xda6d8118),
			        X64Word_create(0xd807aa98, 0xa3030242), X64Word_create(0x12835b01, 0x45706fbe),
			        X64Word_create(0x243185be, 0x4ee4b28c), X64Word_create(0x550c7dc3, 0xd5ffb4e2),
			        X64Word_create(0x72be5d74, 0xf27b896f), X64Word_create(0x80deb1fe, 0x3b1696b1),
			        X64Word_create(0x9bdc06a7, 0x25c71235), X64Word_create(0xc19bf174, 0xcf692694),
			        X64Word_create(0xe49b69c1, 0x9ef14ad2), X64Word_create(0xefbe4786, 0x384f25e3),
			        X64Word_create(0x0fc19dc6, 0x8b8cd5b5), X64Word_create(0x240ca1cc, 0x77ac9c65),
			        X64Word_create(0x2de92c6f, 0x592b0275), X64Word_create(0x4a7484aa, 0x6ea6e483),
			        X64Word_create(0x5cb0a9dc, 0xbd41fbd4), X64Word_create(0x76f988da, 0x831153b5),
			        X64Word_create(0x983e5152, 0xee66dfab), X64Word_create(0xa831c66d, 0x2db43210),
			        X64Word_create(0xb00327c8, 0x98fb213f), X64Word_create(0xbf597fc7, 0xbeef0ee4),
			        X64Word_create(0xc6e00bf3, 0x3da88fc2), X64Word_create(0xd5a79147, 0x930aa725),
			        X64Word_create(0x06ca6351, 0xe003826f), X64Word_create(0x14292967, 0x0a0e6e70),
			        X64Word_create(0x27b70a85, 0x46d22ffc), X64Word_create(0x2e1b2138, 0x5c26c926),
			        X64Word_create(0x4d2c6dfc, 0x5ac42aed), X64Word_create(0x53380d13, 0x9d95b3df),
			        X64Word_create(0x650a7354, 0x8baf63de), X64Word_create(0x766a0abb, 0x3c77b2a8),
			        X64Word_create(0x81c2c92e, 0x47edaee6), X64Word_create(0x92722c85, 0x1482353b),
			        X64Word_create(0xa2bfe8a1, 0x4cf10364), X64Word_create(0xa81a664b, 0xbc423001),
			        X64Word_create(0xc24b8b70, 0xd0f89791), X64Word_create(0xc76c51a3, 0x0654be30),
			        X64Word_create(0xd192e819, 0xd6ef5218), X64Word_create(0xd6990624, 0x5565a910),
			        X64Word_create(0xf40e3585, 0x5771202a), X64Word_create(0x106aa070, 0x32bbd1b8),
			        X64Word_create(0x19a4c116, 0xb8d2d0c8), X64Word_create(0x1e376c08, 0x5141ab53),
			        X64Word_create(0x2748774c, 0xdf8eeb99), X64Word_create(0x34b0bcb5, 0xe19b48a8),
			        X64Word_create(0x391c0cb3, 0xc5c95a63), X64Word_create(0x4ed8aa4a, 0xe3418acb),
			        X64Word_create(0x5b9cca4f, 0x7763e373), X64Word_create(0x682e6ff3, 0xd6b2b8a3),
			        X64Word_create(0x748f82ee, 0x5defb2fc), X64Word_create(0x78a5636f, 0x43172f60),
			        X64Word_create(0x84c87814, 0xa1f0ab72), X64Word_create(0x8cc70208, 0x1a6439ec),
			        X64Word_create(0x90befffa, 0x23631e28), X64Word_create(0xa4506ceb, 0xde82bde9),
			        X64Word_create(0xbef9a3f7, 0xb2c67915), X64Word_create(0xc67178f2, 0xe372532b),
			        X64Word_create(0xca273ece, 0xea26619c), X64Word_create(0xd186b8c7, 0x21c0c207),
			        X64Word_create(0xeada7dd6, 0xcde0eb1e), X64Word_create(0xf57d4f7f, 0xee6ed178),
			        X64Word_create(0x06f067aa, 0x72176fba), X64Word_create(0x0a637dc5, 0xa2c898a6),
			        X64Word_create(0x113f9804, 0xbef90dae), X64Word_create(0x1b710b35, 0x131c471b),
			        X64Word_create(0x28db77f5, 0x23047d84), X64Word_create(0x32caab7b, 0x40c72493),
			        X64Word_create(0x3c9ebe0a, 0x15c9bebc), X64Word_create(0x431d67c4, 0x9c100d4c),
			        X64Word_create(0x4cc5d4be, 0xcb3e42b6), X64Word_create(0x597f299c, 0xfc657e2a),
			        X64Word_create(0x5fcb6fab, 0x3ad6faec), X64Word_create(0x6c44198c, 0x4a475817)
			    ];

			    // Reusable objects
			    var W = [];
			    (function () {
			        for (var i = 0; i < 80; i++) {
			            W[i] = X64Word_create();
			        }
			    }());

			    /**
			     * SHA-512 hash algorithm.
			     */
			    var SHA512 = C_algo.SHA512 = Hasher.extend({
			        _doReset: function () {
			            this._hash = new X64WordArray.init([
			                new X64Word.init(0x6a09e667, 0xf3bcc908), new X64Word.init(0xbb67ae85, 0x84caa73b),
			                new X64Word.init(0x3c6ef372, 0xfe94f82b), new X64Word.init(0xa54ff53a, 0x5f1d36f1),
			                new X64Word.init(0x510e527f, 0xade682d1), new X64Word.init(0x9b05688c, 0x2b3e6c1f),
			                new X64Word.init(0x1f83d9ab, 0xfb41bd6b), new X64Word.init(0x5be0cd19, 0x137e2179)
			            ]);
			        },

			        _doProcessBlock: function (M, offset) {
			            // Shortcuts
			            var H = this._hash.words;

			            var H0 = H[0];
			            var H1 = H[1];
			            var H2 = H[2];
			            var H3 = H[3];
			            var H4 = H[4];
			            var H5 = H[5];
			            var H6 = H[6];
			            var H7 = H[7];

			            var H0h = H0.high;
			            var H0l = H0.low;
			            var H1h = H1.high;
			            var H1l = H1.low;
			            var H2h = H2.high;
			            var H2l = H2.low;
			            var H3h = H3.high;
			            var H3l = H3.low;
			            var H4h = H4.high;
			            var H4l = H4.low;
			            var H5h = H5.high;
			            var H5l = H5.low;
			            var H6h = H6.high;
			            var H6l = H6.low;
			            var H7h = H7.high;
			            var H7l = H7.low;

			            // Working variables
			            var ah = H0h;
			            var al = H0l;
			            var bh = H1h;
			            var bl = H1l;
			            var ch = H2h;
			            var cl = H2l;
			            var dh = H3h;
			            var dl = H3l;
			            var eh = H4h;
			            var el = H4l;
			            var fh = H5h;
			            var fl = H5l;
			            var gh = H6h;
			            var gl = H6l;
			            var hh = H7h;
			            var hl = H7l;

			            // Rounds
			            for (var i = 0; i < 80; i++) {
			                var Wil;
			                var Wih;

			                // Shortcut
			                var Wi = W[i];

			                // Extend message
			                if (i < 16) {
			                    Wih = Wi.high = M[offset + i * 2]     | 0;
			                    Wil = Wi.low  = M[offset + i * 2 + 1] | 0;
			                } else {
			                    // Gamma0
			                    var gamma0x  = W[i - 15];
			                    var gamma0xh = gamma0x.high;
			                    var gamma0xl = gamma0x.low;
			                    var gamma0h  = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7);
			                    var gamma0l  = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>> 7) | (gamma0xh << 25));

			                    // Gamma1
			                    var gamma1x  = W[i - 2];
			                    var gamma1xh = gamma1x.high;
			                    var gamma1xl = gamma1x.low;
			                    var gamma1h  = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6);
			                    var gamma1l  = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>> 6) | (gamma1xh << 26));

			                    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
			                    var Wi7  = W[i - 7];
			                    var Wi7h = Wi7.high;
			                    var Wi7l = Wi7.low;

			                    var Wi16  = W[i - 16];
			                    var Wi16h = Wi16.high;
			                    var Wi16l = Wi16.low;

			                    Wil = gamma0l + Wi7l;
			                    Wih = gamma0h + Wi7h + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0);
			                    Wil = Wil + gamma1l;
			                    Wih = Wih + gamma1h + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0);
			                    Wil = Wil + Wi16l;
			                    Wih = Wih + Wi16h + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0);

			                    Wi.high = Wih;
			                    Wi.low  = Wil;
			                }

			                var chh  = (eh & fh) ^ (~eh & gh);
			                var chl  = (el & fl) ^ (~el & gl);
			                var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
			                var majl = (al & bl) ^ (al & cl) ^ (bl & cl);

			                var sigma0h = ((ah >>> 28) | (al << 4))  ^ ((ah << 30)  | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
			                var sigma0l = ((al >>> 28) | (ah << 4))  ^ ((al << 30)  | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
			                var sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9));
			                var sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9));

			                // t1 = h + sigma1 + ch + K[i] + W[i]
			                var Ki  = K[i];
			                var Kih = Ki.high;
			                var Kil = Ki.low;

			                var t1l = hl + sigma1l;
			                var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
			                var t1l = t1l + chl;
			                var t1h = t1h + chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
			                var t1l = t1l + Kil;
			                var t1h = t1h + Kih + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0);
			                var t1l = t1l + Wil;
			                var t1h = t1h + Wih + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0);

			                // t2 = sigma0 + maj
			                var t2l = sigma0l + majl;
			                var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);

			                // Update working variables
			                hh = gh;
			                hl = gl;
			                gh = fh;
			                gl = fl;
			                fh = eh;
			                fl = el;
			                el = (dl + t1l) | 0;
			                eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
			                dh = ch;
			                dl = cl;
			                ch = bh;
			                cl = bl;
			                bh = ah;
			                bl = al;
			                al = (t1l + t2l) | 0;
			                ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
			            }

			            // Intermediate hash value
			            H0l = H0.low  = (H0l + al);
			            H0.high = (H0h + ah + ((H0l >>> 0) < (al >>> 0) ? 1 : 0));
			            H1l = H1.low  = (H1l + bl);
			            H1.high = (H1h + bh + ((H1l >>> 0) < (bl >>> 0) ? 1 : 0));
			            H2l = H2.low  = (H2l + cl);
			            H2.high = (H2h + ch + ((H2l >>> 0) < (cl >>> 0) ? 1 : 0));
			            H3l = H3.low  = (H3l + dl);
			            H3.high = (H3h + dh + ((H3l >>> 0) < (dl >>> 0) ? 1 : 0));
			            H4l = H4.low  = (H4l + el);
			            H4.high = (H4h + eh + ((H4l >>> 0) < (el >>> 0) ? 1 : 0));
			            H5l = H5.low  = (H5l + fl);
			            H5.high = (H5h + fh + ((H5l >>> 0) < (fl >>> 0) ? 1 : 0));
			            H6l = H6.low  = (H6l + gl);
			            H6.high = (H6h + gh + ((H6l >>> 0) < (gl >>> 0) ? 1 : 0));
			            H7l = H7.low  = (H7l + hl);
			            H7.high = (H7h + hh + ((H7l >>> 0) < (hl >>> 0) ? 1 : 0));
			        },

			        _doFinalize: function () {
			            // Shortcuts
			            var data = this._data;
			            var dataWords = data.words;

			            var nBitsTotal = this._nDataBytes * 8;
			            var nBitsLeft = data.sigBytes * 8;

			            // Add padding
			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
			            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000);
			            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal;
			            data.sigBytes = dataWords.length * 4;

			            // Hash final blocks
			            this._process();

			            // Convert hash to 32-bit word array before returning
			            var hash = this._hash.toX32();

			            // Return final computed hash
			            return hash;
			        },

			        clone: function () {
			            var clone = Hasher.clone.call(this);
			            clone._hash = this._hash.clone();

			            return clone;
			        },

			        blockSize: 1024/32
			    });

			    /**
			     * Shortcut function to the hasher's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     *
			     * @return {WordArray} The hash.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hash = CryptoJS.SHA512('message');
			     *     var hash = CryptoJS.SHA512(wordArray);
			     */
			    C.SHA512 = Hasher._createHelper(SHA512);

			    /**
			     * Shortcut function to the HMAC's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     * @param {WordArray|string} key The secret key.
			     *
			     * @return {WordArray} The HMAC.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hmac = CryptoJS.HmacSHA512(message, key);
			     */
			    C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
			}());


			return CryptoJS.SHA512;

		})); 
	} (sha512$1));
	return sha512$1.exports;
}

var sha384$1 = {exports: {}};

var sha384 = sha384$1.exports;

var hasRequiredSha384;

function requireSha384 () {
	if (hasRequiredSha384) return sha384$1.exports;
	hasRequiredSha384 = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireX64Core(), /*@__PURE__*/ requireSha512());
			}
		}(sha384, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_x64 = C.x64;
			    var X64Word = C_x64.Word;
			    var X64WordArray = C_x64.WordArray;
			    var C_algo = C.algo;
			    var SHA512 = C_algo.SHA512;

			    /**
			     * SHA-384 hash algorithm.
			     */
			    var SHA384 = C_algo.SHA384 = SHA512.extend({
			        _doReset: function () {
			            this._hash = new X64WordArray.init([
			                new X64Word.init(0xcbbb9d5d, 0xc1059ed8), new X64Word.init(0x629a292a, 0x367cd507),
			                new X64Word.init(0x9159015a, 0x3070dd17), new X64Word.init(0x152fecd8, 0xf70e5939),
			                new X64Word.init(0x67332667, 0xffc00b31), new X64Word.init(0x8eb44a87, 0x68581511),
			                new X64Word.init(0xdb0c2e0d, 0x64f98fa7), new X64Word.init(0x47b5481d, 0xbefa4fa4)
			            ]);
			        },

			        _doFinalize: function () {
			            var hash = SHA512._doFinalize.call(this);

			            hash.sigBytes -= 16;

			            return hash;
			        }
			    });

			    /**
			     * Shortcut function to the hasher's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     *
			     * @return {WordArray} The hash.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hash = CryptoJS.SHA384('message');
			     *     var hash = CryptoJS.SHA384(wordArray);
			     */
			    C.SHA384 = SHA512._createHelper(SHA384);

			    /**
			     * Shortcut function to the HMAC's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     * @param {WordArray|string} key The secret key.
			     *
			     * @return {WordArray} The HMAC.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hmac = CryptoJS.HmacSHA384(message, key);
			     */
			    C.HmacSHA384 = SHA512._createHmacHelper(SHA384);
			}());


			return CryptoJS.SHA384;

		})); 
	} (sha384$1));
	return sha384$1.exports;
}

var sha3$1 = {exports: {}};

var sha3 = sha3$1.exports;

var hasRequiredSha3;

function requireSha3 () {
	if (hasRequiredSha3) return sha3$1.exports;
	hasRequiredSha3 = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireX64Core());
			}
		}(sha3, function (CryptoJS) {

			(function (Math) {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var WordArray = C_lib.WordArray;
			    var Hasher = C_lib.Hasher;
			    var C_x64 = C.x64;
			    var X64Word = C_x64.Word;
			    var C_algo = C.algo;

			    // Constants tables
			    var RHO_OFFSETS = [];
			    var PI_INDEXES  = [];
			    var ROUND_CONSTANTS = [];

			    // Compute Constants
			    (function () {
			        // Compute rho offset constants
			        var x = 1, y = 0;
			        for (var t = 0; t < 24; t++) {
			            RHO_OFFSETS[x + 5 * y] = ((t + 1) * (t + 2) / 2) % 64;

			            var newX = y % 5;
			            var newY = (2 * x + 3 * y) % 5;
			            x = newX;
			            y = newY;
			        }

			        // Compute pi index constants
			        for (var x = 0; x < 5; x++) {
			            for (var y = 0; y < 5; y++) {
			                PI_INDEXES[x + 5 * y] = y + ((2 * x + 3 * y) % 5) * 5;
			            }
			        }

			        // Compute round constants
			        var LFSR = 0x01;
			        for (var i = 0; i < 24; i++) {
			            var roundConstantMsw = 0;
			            var roundConstantLsw = 0;

			            for (var j = 0; j < 7; j++) {
			                if (LFSR & 0x01) {
			                    var bitPosition = (1 << j) - 1;
			                    if (bitPosition < 32) {
			                        roundConstantLsw ^= 1 << bitPosition;
			                    } else /* if (bitPosition >= 32) */ {
			                        roundConstantMsw ^= 1 << (bitPosition - 32);
			                    }
			                }

			                // Compute next LFSR
			                if (LFSR & 0x80) {
			                    // Primitive polynomial over GF(2): x^8 + x^6 + x^5 + x^4 + 1
			                    LFSR = (LFSR << 1) ^ 0x71;
			                } else {
			                    LFSR <<= 1;
			                }
			            }

			            ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw);
			        }
			    }());

			    // Reusable objects for temporary values
			    var T = [];
			    (function () {
			        for (var i = 0; i < 25; i++) {
			            T[i] = X64Word.create();
			        }
			    }());

			    /**
			     * SHA-3 hash algorithm.
			     */
			    var SHA3 = C_algo.SHA3 = Hasher.extend({
			        /**
			         * Configuration options.
			         *
			         * @property {number} outputLength
			         *   The desired number of bits in the output hash.
			         *   Only values permitted are: 224, 256, 384, 512.
			         *   Default: 512
			         */
			        cfg: Hasher.cfg.extend({
			            outputLength: 512
			        }),

			        _doReset: function () {
			            var state = this._state = [];
			            for (var i = 0; i < 25; i++) {
			                state[i] = new X64Word.init();
			            }

			            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
			        },

			        _doProcessBlock: function (M, offset) {
			            // Shortcuts
			            var state = this._state;
			            var nBlockSizeLanes = this.blockSize / 2;

			            // Absorb
			            for (var i = 0; i < nBlockSizeLanes; i++) {
			                // Shortcuts
			                var M2i  = M[offset + 2 * i];
			                var M2i1 = M[offset + 2 * i + 1];

			                // Swap endian
			                M2i = (
			                    (((M2i << 8)  | (M2i >>> 24)) & 0x00ff00ff) |
			                    (((M2i << 24) | (M2i >>> 8))  & 0xff00ff00)
			                );
			                M2i1 = (
			                    (((M2i1 << 8)  | (M2i1 >>> 24)) & 0x00ff00ff) |
			                    (((M2i1 << 24) | (M2i1 >>> 8))  & 0xff00ff00)
			                );

			                // Absorb message into state
			                var lane = state[i];
			                lane.high ^= M2i1;
			                lane.low  ^= M2i;
			            }

			            // Rounds
			            for (var round = 0; round < 24; round++) {
			                // Theta
			                for (var x = 0; x < 5; x++) {
			                    // Mix column lanes
			                    var tMsw = 0, tLsw = 0;
			                    for (var y = 0; y < 5; y++) {
			                        var lane = state[x + 5 * y];
			                        tMsw ^= lane.high;
			                        tLsw ^= lane.low;
			                    }

			                    // Temporary values
			                    var Tx = T[x];
			                    Tx.high = tMsw;
			                    Tx.low  = tLsw;
			                }
			                for (var x = 0; x < 5; x++) {
			                    // Shortcuts
			                    var Tx4 = T[(x + 4) % 5];
			                    var Tx1 = T[(x + 1) % 5];
			                    var Tx1Msw = Tx1.high;
			                    var Tx1Lsw = Tx1.low;

			                    // Mix surrounding columns
			                    var tMsw = Tx4.high ^ ((Tx1Msw << 1) | (Tx1Lsw >>> 31));
			                    var tLsw = Tx4.low  ^ ((Tx1Lsw << 1) | (Tx1Msw >>> 31));
			                    for (var y = 0; y < 5; y++) {
			                        var lane = state[x + 5 * y];
			                        lane.high ^= tMsw;
			                        lane.low  ^= tLsw;
			                    }
			                }

			                // Rho Pi
			                for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
			                    var tMsw;
			                    var tLsw;

			                    // Shortcuts
			                    var lane = state[laneIndex];
			                    var laneMsw = lane.high;
			                    var laneLsw = lane.low;
			                    var rhoOffset = RHO_OFFSETS[laneIndex];

			                    // Rotate lanes
			                    if (rhoOffset < 32) {
			                        tMsw = (laneMsw << rhoOffset) | (laneLsw >>> (32 - rhoOffset));
			                        tLsw = (laneLsw << rhoOffset) | (laneMsw >>> (32 - rhoOffset));
			                    } else /* if (rhoOffset >= 32) */ {
			                        tMsw = (laneLsw << (rhoOffset - 32)) | (laneMsw >>> (64 - rhoOffset));
			                        tLsw = (laneMsw << (rhoOffset - 32)) | (laneLsw >>> (64 - rhoOffset));
			                    }

			                    // Transpose lanes
			                    var TPiLane = T[PI_INDEXES[laneIndex]];
			                    TPiLane.high = tMsw;
			                    TPiLane.low  = tLsw;
			                }

			                // Rho pi at x = y = 0
			                var T0 = T[0];
			                var state0 = state[0];
			                T0.high = state0.high;
			                T0.low  = state0.low;

			                // Chi
			                for (var x = 0; x < 5; x++) {
			                    for (var y = 0; y < 5; y++) {
			                        // Shortcuts
			                        var laneIndex = x + 5 * y;
			                        var lane = state[laneIndex];
			                        var TLane = T[laneIndex];
			                        var Tx1Lane = T[((x + 1) % 5) + 5 * y];
			                        var Tx2Lane = T[((x + 2) % 5) + 5 * y];

			                        // Mix rows
			                        lane.high = TLane.high ^ (~Tx1Lane.high & Tx2Lane.high);
			                        lane.low  = TLane.low  ^ (~Tx1Lane.low  & Tx2Lane.low);
			                    }
			                }

			                // Iota
			                var lane = state[0];
			                var roundConstant = ROUND_CONSTANTS[round];
			                lane.high ^= roundConstant.high;
			                lane.low  ^= roundConstant.low;
			            }
			        },

			        _doFinalize: function () {
			            // Shortcuts
			            var data = this._data;
			            var dataWords = data.words;
			            this._nDataBytes * 8;
			            var nBitsLeft = data.sigBytes * 8;
			            var blockSizeBits = this.blockSize * 32;

			            // Add padding
			            dataWords[nBitsLeft >>> 5] |= 0x1 << (24 - nBitsLeft % 32);
			            dataWords[((Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits) >>> 5) - 1] |= 0x80;
			            data.sigBytes = dataWords.length * 4;

			            // Hash final blocks
			            this._process();

			            // Shortcuts
			            var state = this._state;
			            var outputLengthBytes = this.cfg.outputLength / 8;
			            var outputLengthLanes = outputLengthBytes / 8;

			            // Squeeze
			            var hashWords = [];
			            for (var i = 0; i < outputLengthLanes; i++) {
			                // Shortcuts
			                var lane = state[i];
			                var laneMsw = lane.high;
			                var laneLsw = lane.low;

			                // Swap endian
			                laneMsw = (
			                    (((laneMsw << 8)  | (laneMsw >>> 24)) & 0x00ff00ff) |
			                    (((laneMsw << 24) | (laneMsw >>> 8))  & 0xff00ff00)
			                );
			                laneLsw = (
			                    (((laneLsw << 8)  | (laneLsw >>> 24)) & 0x00ff00ff) |
			                    (((laneLsw << 24) | (laneLsw >>> 8))  & 0xff00ff00)
			                );

			                // Squeeze state to retrieve hash
			                hashWords.push(laneLsw);
			                hashWords.push(laneMsw);
			            }

			            // Return final computed hash
			            return new WordArray.init(hashWords, outputLengthBytes);
			        },

			        clone: function () {
			            var clone = Hasher.clone.call(this);

			            var state = clone._state = this._state.slice(0);
			            for (var i = 0; i < 25; i++) {
			                state[i] = state[i].clone();
			            }

			            return clone;
			        }
			    });

			    /**
			     * Shortcut function to the hasher's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     *
			     * @return {WordArray} The hash.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hash = CryptoJS.SHA3('message');
			     *     var hash = CryptoJS.SHA3(wordArray);
			     */
			    C.SHA3 = Hasher._createHelper(SHA3);

			    /**
			     * Shortcut function to the HMAC's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     * @param {WordArray|string} key The secret key.
			     *
			     * @return {WordArray} The HMAC.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hmac = CryptoJS.HmacSHA3(message, key);
			     */
			    C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
			}(Math));


			return CryptoJS.SHA3;

		})); 
	} (sha3$1));
	return sha3$1.exports;
}

var ripemd160$1 = {exports: {}};

var ripemd160 = ripemd160$1.exports;

var hasRequiredRipemd160;

function requireRipemd160 () {
	if (hasRequiredRipemd160) return ripemd160$1.exports;
	hasRequiredRipemd160 = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore());
			}
		}(ripemd160, function (CryptoJS) {

			/** @preserve
			(c) 2012 by Cédric Mesnil. All rights reserved.

			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

			    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
			    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
			*/

			(function (Math) {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var WordArray = C_lib.WordArray;
			    var Hasher = C_lib.Hasher;
			    var C_algo = C.algo;

			    // Constants table
			    var _zl = WordArray.create([
			        0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
			        7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
			        3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
			        1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
			        4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13]);
			    var _zr = WordArray.create([
			        5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
			        6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
			        15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
			        8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
			        12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11]);
			    var _sl = WordArray.create([
			         11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
			        7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
			        11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
			          11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
			        9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ]);
			    var _sr = WordArray.create([
			        8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
			        9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
			        9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
			        15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
			        8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ]);

			    var _hl =  WordArray.create([ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E]);
			    var _hr =  WordArray.create([ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000]);

			    /**
			     * RIPEMD160 hash algorithm.
			     */
			    var RIPEMD160 = C_algo.RIPEMD160 = Hasher.extend({
			        _doReset: function () {
			            this._hash  = WordArray.create([0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0]);
			        },

			        _doProcessBlock: function (M, offset) {

			            // Swap endian
			            for (var i = 0; i < 16; i++) {
			                // Shortcuts
			                var offset_i = offset + i;
			                var M_offset_i = M[offset_i];

			                // Swap
			                M[offset_i] = (
			                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
			                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
			                );
			            }
			            // Shortcut
			            var H  = this._hash.words;
			            var hl = _hl.words;
			            var hr = _hr.words;
			            var zl = _zl.words;
			            var zr = _zr.words;
			            var sl = _sl.words;
			            var sr = _sr.words;

			            // Working variables
			            var al, bl, cl, dl, el;
			            var ar, br, cr, dr, er;

			            ar = al = H[0];
			            br = bl = H[1];
			            cr = cl = H[2];
			            dr = dl = H[3];
			            er = el = H[4];
			            // Computation
			            var t;
			            for (var i = 0; i < 80; i += 1) {
			                t = (al +  M[offset+zl[i]])|0;
			                if (i<16){
				            t +=  f1(bl,cl,dl) + hl[0];
			                } else if (i<32) {
				            t +=  f2(bl,cl,dl) + hl[1];
			                } else if (i<48) {
				            t +=  f3(bl,cl,dl) + hl[2];
			                } else if (i<64) {
				            t +=  f4(bl,cl,dl) + hl[3];
			                } else {// if (i<80) {
				            t +=  f5(bl,cl,dl) + hl[4];
			                }
			                t = t|0;
			                t =  rotl(t,sl[i]);
			                t = (t+el)|0;
			                al = el;
			                el = dl;
			                dl = rotl(cl, 10);
			                cl = bl;
			                bl = t;

			                t = (ar + M[offset+zr[i]])|0;
			                if (i<16){
				            t +=  f5(br,cr,dr) + hr[0];
			                } else if (i<32) {
				            t +=  f4(br,cr,dr) + hr[1];
			                } else if (i<48) {
				            t +=  f3(br,cr,dr) + hr[2];
			                } else if (i<64) {
				            t +=  f2(br,cr,dr) + hr[3];
			                } else {// if (i<80) {
				            t +=  f1(br,cr,dr) + hr[4];
			                }
			                t = t|0;
			                t =  rotl(t,sr[i]) ;
			                t = (t+er)|0;
			                ar = er;
			                er = dr;
			                dr = rotl(cr, 10);
			                cr = br;
			                br = t;
			            }
			            // Intermediate hash value
			            t    = (H[1] + cl + dr)|0;
			            H[1] = (H[2] + dl + er)|0;
			            H[2] = (H[3] + el + ar)|0;
			            H[3] = (H[4] + al + br)|0;
			            H[4] = (H[0] + bl + cr)|0;
			            H[0] =  t;
			        },

			        _doFinalize: function () {
			            // Shortcuts
			            var data = this._data;
			            var dataWords = data.words;

			            var nBitsTotal = this._nDataBytes * 8;
			            var nBitsLeft = data.sigBytes * 8;

			            // Add padding
			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
			                (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
			                (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
			            );
			            data.sigBytes = (dataWords.length + 1) * 4;

			            // Hash final blocks
			            this._process();

			            // Shortcuts
			            var hash = this._hash;
			            var H = hash.words;

			            // Swap endian
			            for (var i = 0; i < 5; i++) {
			                // Shortcut
			                var H_i = H[i];

			                // Swap
			                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
			                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
			            }

			            // Return final computed hash
			            return hash;
			        },

			        clone: function () {
			            var clone = Hasher.clone.call(this);
			            clone._hash = this._hash.clone();

			            return clone;
			        }
			    });


			    function f1(x, y, z) {
			        return ((x) ^ (y) ^ (z));

			    }

			    function f2(x, y, z) {
			        return (((x)&(y)) | ((~x)&(z)));
			    }

			    function f3(x, y, z) {
			        return (((x) | (~(y))) ^ (z));
			    }

			    function f4(x, y, z) {
			        return (((x) & (z)) | ((y)&(~(z))));
			    }

			    function f5(x, y, z) {
			        return ((x) ^ ((y) |(~(z))));

			    }

			    function rotl(x,n) {
			        return (x<<n) | (x>>>(32-n));
			    }


			    /**
			     * Shortcut function to the hasher's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     *
			     * @return {WordArray} The hash.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hash = CryptoJS.RIPEMD160('message');
			     *     var hash = CryptoJS.RIPEMD160(wordArray);
			     */
			    C.RIPEMD160 = Hasher._createHelper(RIPEMD160);

			    /**
			     * Shortcut function to the HMAC's object interface.
			     *
			     * @param {WordArray|string} message The message to hash.
			     * @param {WordArray|string} key The secret key.
			     *
			     * @return {WordArray} The HMAC.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var hmac = CryptoJS.HmacRIPEMD160(message, key);
			     */
			    C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
			}());


			return CryptoJS.RIPEMD160;

		})); 
	} (ripemd160$1));
	return ripemd160$1.exports;
}

var hmac$1 = {exports: {}};

var hmac = hmac$1.exports;

var hasRequiredHmac;

function requireHmac () {
	if (hasRequiredHmac) return hmac$1.exports;
	hasRequiredHmac = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore());
			}
		}(hmac, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var Base = C_lib.Base;
			    var C_enc = C.enc;
			    var Utf8 = C_enc.Utf8;
			    var C_algo = C.algo;

			    /**
			     * HMAC algorithm.
			     */
			    C_algo.HMAC = Base.extend({
			        /**
			         * Initializes a newly created HMAC.
			         *
			         * @param {Hasher} hasher The hash algorithm to use.
			         * @param {WordArray|string} key The secret key.
			         *
			         * @example
			         *
			         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
			         */
			        init: function (hasher, key) {
			            // Init hasher
			            hasher = this._hasher = new hasher.init();

			            // Convert string to WordArray, else assume WordArray already
			            if (typeof key == 'string') {
			                key = Utf8.parse(key);
			            }

			            // Shortcuts
			            var hasherBlockSize = hasher.blockSize;
			            var hasherBlockSizeBytes = hasherBlockSize * 4;

			            // Allow arbitrary length keys
			            if (key.sigBytes > hasherBlockSizeBytes) {
			                key = hasher.finalize(key);
			            }

			            // Clamp excess bits
			            key.clamp();

			            // Clone key for inner and outer pads
			            var oKey = this._oKey = key.clone();
			            var iKey = this._iKey = key.clone();

			            // Shortcuts
			            var oKeyWords = oKey.words;
			            var iKeyWords = iKey.words;

			            // XOR keys with pad constants
			            for (var i = 0; i < hasherBlockSize; i++) {
			                oKeyWords[i] ^= 0x5c5c5c5c;
			                iKeyWords[i] ^= 0x36363636;
			            }
			            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

			            // Set initial values
			            this.reset();
			        },

			        /**
			         * Resets this HMAC to its initial state.
			         *
			         * @example
			         *
			         *     hmacHasher.reset();
			         */
			        reset: function () {
			            // Shortcut
			            var hasher = this._hasher;

			            // Reset
			            hasher.reset();
			            hasher.update(this._iKey);
			        },

			        /**
			         * Updates this HMAC with a message.
			         *
			         * @param {WordArray|string} messageUpdate The message to append.
			         *
			         * @return {HMAC} This HMAC instance.
			         *
			         * @example
			         *
			         *     hmacHasher.update('message');
			         *     hmacHasher.update(wordArray);
			         */
			        update: function (messageUpdate) {
			            this._hasher.update(messageUpdate);

			            // Chainable
			            return this;
			        },

			        /**
			         * Finalizes the HMAC computation.
			         * Note that the finalize operation is effectively a destructive, read-once operation.
			         *
			         * @param {WordArray|string} messageUpdate (Optional) A final message update.
			         *
			         * @return {WordArray} The HMAC.
			         *
			         * @example
			         *
			         *     var hmac = hmacHasher.finalize();
			         *     var hmac = hmacHasher.finalize('message');
			         *     var hmac = hmacHasher.finalize(wordArray);
			         */
			        finalize: function (messageUpdate) {
			            // Shortcut
			            var hasher = this._hasher;

			            // Compute HMAC
			            var innerHash = hasher.finalize(messageUpdate);
			            hasher.reset();
			            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

			            return hmac;
			        }
			    });
			}());


		})); 
	} (hmac$1));
	return hmac$1.exports;
}

var pbkdf2$1 = {exports: {}};

var pbkdf2 = pbkdf2$1.exports;

var hasRequiredPbkdf2;

function requirePbkdf2 () {
	if (hasRequiredPbkdf2) return pbkdf2$1.exports;
	hasRequiredPbkdf2 = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireSha256(), /*@__PURE__*/ requireHmac());
			}
		}(pbkdf2, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var Base = C_lib.Base;
			    var WordArray = C_lib.WordArray;
			    var C_algo = C.algo;
			    var SHA256 = C_algo.SHA256;
			    var HMAC = C_algo.HMAC;

			    /**
			     * Password-Based Key Derivation Function 2 algorithm.
			     */
			    var PBKDF2 = C_algo.PBKDF2 = Base.extend({
			        /**
			         * Configuration options.
			         *
			         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
			         * @property {Hasher} hasher The hasher to use. Default: SHA256
			         * @property {number} iterations The number of iterations to perform. Default: 250000
			         */
			        cfg: Base.extend({
			            keySize: 128/32,
			            hasher: SHA256,
			            iterations: 250000
			        }),

			        /**
			         * Initializes a newly created key derivation function.
			         *
			         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
			         *
			         * @example
			         *
			         *     var kdf = CryptoJS.algo.PBKDF2.create();
			         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
			         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
			         */
			        init: function (cfg) {
			            this.cfg = this.cfg.extend(cfg);
			        },

			        /**
			         * Computes the Password-Based Key Derivation Function 2.
			         *
			         * @param {WordArray|string} password The password.
			         * @param {WordArray|string} salt A salt.
			         *
			         * @return {WordArray} The derived key.
			         *
			         * @example
			         *
			         *     var key = kdf.compute(password, salt);
			         */
			        compute: function (password, salt) {
			            // Shortcut
			            var cfg = this.cfg;

			            // Init HMAC
			            var hmac = HMAC.create(cfg.hasher, password);

			            // Initial values
			            var derivedKey = WordArray.create();
			            var blockIndex = WordArray.create([0x00000001]);

			            // Shortcuts
			            var derivedKeyWords = derivedKey.words;
			            var blockIndexWords = blockIndex.words;
			            var keySize = cfg.keySize;
			            var iterations = cfg.iterations;

			            // Generate key
			            while (derivedKeyWords.length < keySize) {
			                var block = hmac.update(salt).finalize(blockIndex);
			                hmac.reset();

			                // Shortcuts
			                var blockWords = block.words;
			                var blockWordsLength = blockWords.length;

			                // Iterations
			                var intermediate = block;
			                for (var i = 1; i < iterations; i++) {
			                    intermediate = hmac.finalize(intermediate);
			                    hmac.reset();

			                    // Shortcut
			                    var intermediateWords = intermediate.words;

			                    // XOR intermediate with block
			                    for (var j = 0; j < blockWordsLength; j++) {
			                        blockWords[j] ^= intermediateWords[j];
			                    }
			                }

			                derivedKey.concat(block);
			                blockIndexWords[0]++;
			            }
			            derivedKey.sigBytes = keySize * 4;

			            return derivedKey;
			        }
			    });

			    /**
			     * Computes the Password-Based Key Derivation Function 2.
			     *
			     * @param {WordArray|string} password The password.
			     * @param {WordArray|string} salt A salt.
			     * @param {Object} cfg (Optional) The configuration options to use for this computation.
			     *
			     * @return {WordArray} The derived key.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var key = CryptoJS.PBKDF2(password, salt);
			     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
			     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
			     */
			    C.PBKDF2 = function (password, salt, cfg) {
			        return PBKDF2.create(cfg).compute(password, salt);
			    };
			}());


			return CryptoJS.PBKDF2;

		})); 
	} (pbkdf2$1));
	return pbkdf2$1.exports;
}

var evpkdf$1 = {exports: {}};

var evpkdf = evpkdf$1.exports;

var hasRequiredEvpkdf;

function requireEvpkdf () {
	if (hasRequiredEvpkdf) return evpkdf$1.exports;
	hasRequiredEvpkdf = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireSha1(), /*@__PURE__*/ requireHmac());
			}
		}(evpkdf, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var Base = C_lib.Base;
			    var WordArray = C_lib.WordArray;
			    var C_algo = C.algo;
			    var MD5 = C_algo.MD5;

			    /**
			     * This key derivation function is meant to conform with EVP_BytesToKey.
			     * www.openssl.org/docs/crypto/EVP_BytesToKey.html
			     */
			    var EvpKDF = C_algo.EvpKDF = Base.extend({
			        /**
			         * Configuration options.
			         *
			         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
			         * @property {Hasher} hasher The hash algorithm to use. Default: MD5
			         * @property {number} iterations The number of iterations to perform. Default: 1
			         */
			        cfg: Base.extend({
			            keySize: 128/32,
			            hasher: MD5,
			            iterations: 1
			        }),

			        /**
			         * Initializes a newly created key derivation function.
			         *
			         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
			         *
			         * @example
			         *
			         *     var kdf = CryptoJS.algo.EvpKDF.create();
			         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
			         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
			         */
			        init: function (cfg) {
			            this.cfg = this.cfg.extend(cfg);
			        },

			        /**
			         * Derives a key from a password.
			         *
			         * @param {WordArray|string} password The password.
			         * @param {WordArray|string} salt A salt.
			         *
			         * @return {WordArray} The derived key.
			         *
			         * @example
			         *
			         *     var key = kdf.compute(password, salt);
			         */
			        compute: function (password, salt) {
			            var block;

			            // Shortcut
			            var cfg = this.cfg;

			            // Init hasher
			            var hasher = cfg.hasher.create();

			            // Initial values
			            var derivedKey = WordArray.create();

			            // Shortcuts
			            var derivedKeyWords = derivedKey.words;
			            var keySize = cfg.keySize;
			            var iterations = cfg.iterations;

			            // Generate key
			            while (derivedKeyWords.length < keySize) {
			                if (block) {
			                    hasher.update(block);
			                }
			                block = hasher.update(password).finalize(salt);
			                hasher.reset();

			                // Iterations
			                for (var i = 1; i < iterations; i++) {
			                    block = hasher.finalize(block);
			                    hasher.reset();
			                }

			                derivedKey.concat(block);
			            }
			            derivedKey.sigBytes = keySize * 4;

			            return derivedKey;
			        }
			    });

			    /**
			     * Derives a key from a password.
			     *
			     * @param {WordArray|string} password The password.
			     * @param {WordArray|string} salt A salt.
			     * @param {Object} cfg (Optional) The configuration options to use for this computation.
			     *
			     * @return {WordArray} The derived key.
			     *
			     * @static
			     *
			     * @example
			     *
			     *     var key = CryptoJS.EvpKDF(password, salt);
			     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
			     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
			     */
			    C.EvpKDF = function (password, salt, cfg) {
			        return EvpKDF.create(cfg).compute(password, salt);
			    };
			}());


			return CryptoJS.EvpKDF;

		})); 
	} (evpkdf$1));
	return evpkdf$1.exports;
}

var cipherCore$1 = {exports: {}};

var cipherCore = cipherCore$1.exports;

var hasRequiredCipherCore;

function requireCipherCore () {
	if (hasRequiredCipherCore) return cipherCore$1.exports;
	hasRequiredCipherCore = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireEvpkdf());
			}
		}(cipherCore, function (CryptoJS) {

			/**
			 * Cipher core components.
			 */
			CryptoJS.lib.Cipher || (function (undefined$1) {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var Base = C_lib.Base;
			    var WordArray = C_lib.WordArray;
			    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
			    var C_enc = C.enc;
			    C_enc.Utf8;
			    var Base64 = C_enc.Base64;
			    var C_algo = C.algo;
			    var EvpKDF = C_algo.EvpKDF;

			    /**
			     * Abstract base cipher template.
			     *
			     * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
			     * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
			     * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
			     * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
			     */
			    var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
			        /**
			         * Configuration options.
			         *
			         * @property {WordArray} iv The IV to use for this operation.
			         */
			        cfg: Base.extend(),

			        /**
			         * Creates this cipher in encryption mode.
			         *
			         * @param {WordArray} key The key.
			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
			         *
			         * @return {Cipher} A cipher instance.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
			         */
			        createEncryptor: function (key, cfg) {
			            return this.create(this._ENC_XFORM_MODE, key, cfg);
			        },

			        /**
			         * Creates this cipher in decryption mode.
			         *
			         * @param {WordArray} key The key.
			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
			         *
			         * @return {Cipher} A cipher instance.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
			         */
			        createDecryptor: function (key, cfg) {
			            return this.create(this._DEC_XFORM_MODE, key, cfg);
			        },

			        /**
			         * Initializes a newly created cipher.
			         *
			         * @param {number} xformMode Either the encryption or decryption transormation mode constant.
			         * @param {WordArray} key The key.
			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
			         *
			         * @example
			         *
			         *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
			         */
			        init: function (xformMode, key, cfg) {
			            // Apply config defaults
			            this.cfg = this.cfg.extend(cfg);

			            // Store transform mode and key
			            this._xformMode = xformMode;
			            this._key = key;

			            // Set initial values
			            this.reset();
			        },

			        /**
			         * Resets this cipher to its initial state.
			         *
			         * @example
			         *
			         *     cipher.reset();
			         */
			        reset: function () {
			            // Reset data buffer
			            BufferedBlockAlgorithm.reset.call(this);

			            // Perform concrete-cipher logic
			            this._doReset();
			        },

			        /**
			         * Adds data to be encrypted or decrypted.
			         *
			         * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
			         *
			         * @return {WordArray} The data after processing.
			         *
			         * @example
			         *
			         *     var encrypted = cipher.process('data');
			         *     var encrypted = cipher.process(wordArray);
			         */
			        process: function (dataUpdate) {
			            // Append
			            this._append(dataUpdate);

			            // Process available blocks
			            return this._process();
			        },

			        /**
			         * Finalizes the encryption or decryption process.
			         * Note that the finalize operation is effectively a destructive, read-once operation.
			         *
			         * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
			         *
			         * @return {WordArray} The data after final processing.
			         *
			         * @example
			         *
			         *     var encrypted = cipher.finalize();
			         *     var encrypted = cipher.finalize('data');
			         *     var encrypted = cipher.finalize(wordArray);
			         */
			        finalize: function (dataUpdate) {
			            // Final data update
			            if (dataUpdate) {
			                this._append(dataUpdate);
			            }

			            // Perform concrete-cipher logic
			            var finalProcessedData = this._doFinalize();

			            return finalProcessedData;
			        },

			        keySize: 128/32,

			        ivSize: 128/32,

			        _ENC_XFORM_MODE: 1,

			        _DEC_XFORM_MODE: 2,

			        /**
			         * Creates shortcut functions to a cipher's object interface.
			         *
			         * @param {Cipher} cipher The cipher to create a helper for.
			         *
			         * @return {Object} An object with encrypt and decrypt shortcut functions.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
			         */
			        _createHelper: (function () {
			            function selectCipherStrategy(key) {
			                if (typeof key == 'string') {
			                    return PasswordBasedCipher;
			                } else {
			                    return SerializableCipher;
			                }
			            }

			            return function (cipher) {
			                return {
			                    encrypt: function (message, key, cfg) {
			                        return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
			                    },

			                    decrypt: function (ciphertext, key, cfg) {
			                        return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
			                    }
			                };
			            };
			        }())
			    });

			    /**
			     * Abstract base stream cipher template.
			     *
			     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
			     */
			    C_lib.StreamCipher = Cipher.extend({
			        _doFinalize: function () {
			            // Process partial blocks
			            var finalProcessedBlocks = this._process(true);

			            return finalProcessedBlocks;
			        },

			        blockSize: 1
			    });

			    /**
			     * Mode namespace.
			     */
			    var C_mode = C.mode = {};

			    /**
			     * Abstract base block cipher mode template.
			     */
			    var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
			        /**
			         * Creates this mode for encryption.
			         *
			         * @param {Cipher} cipher A block cipher instance.
			         * @param {Array} iv The IV words.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
			         */
			        createEncryptor: function (cipher, iv) {
			            return this.Encryptor.create(cipher, iv);
			        },

			        /**
			         * Creates this mode for decryption.
			         *
			         * @param {Cipher} cipher A block cipher instance.
			         * @param {Array} iv The IV words.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
			         */
			        createDecryptor: function (cipher, iv) {
			            return this.Decryptor.create(cipher, iv);
			        },

			        /**
			         * Initializes a newly created mode.
			         *
			         * @param {Cipher} cipher A block cipher instance.
			         * @param {Array} iv The IV words.
			         *
			         * @example
			         *
			         *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
			         */
			        init: function (cipher, iv) {
			            this._cipher = cipher;
			            this._iv = iv;
			        }
			    });

			    /**
			     * Cipher Block Chaining mode.
			     */
			    var CBC = C_mode.CBC = (function () {
			        /**
			         * Abstract base CBC mode.
			         */
			        var CBC = BlockCipherMode.extend();

			        /**
			         * CBC encryptor.
			         */
			        CBC.Encryptor = CBC.extend({
			            /**
			             * Processes the data block at offset.
			             *
			             * @param {Array} words The data words to operate on.
			             * @param {number} offset The offset where the block starts.
			             *
			             * @example
			             *
			             *     mode.processBlock(data.words, offset);
			             */
			            processBlock: function (words, offset) {
			                // Shortcuts
			                var cipher = this._cipher;
			                var blockSize = cipher.blockSize;

			                // XOR and encrypt
			                xorBlock.call(this, words, offset, blockSize);
			                cipher.encryptBlock(words, offset);

			                // Remember this block to use with next block
			                this._prevBlock = words.slice(offset, offset + blockSize);
			            }
			        });

			        /**
			         * CBC decryptor.
			         */
			        CBC.Decryptor = CBC.extend({
			            /**
			             * Processes the data block at offset.
			             *
			             * @param {Array} words The data words to operate on.
			             * @param {number} offset The offset where the block starts.
			             *
			             * @example
			             *
			             *     mode.processBlock(data.words, offset);
			             */
			            processBlock: function (words, offset) {
			                // Shortcuts
			                var cipher = this._cipher;
			                var blockSize = cipher.blockSize;

			                // Remember this block to use with next block
			                var thisBlock = words.slice(offset, offset + blockSize);

			                // Decrypt and XOR
			                cipher.decryptBlock(words, offset);
			                xorBlock.call(this, words, offset, blockSize);

			                // This block becomes the previous block
			                this._prevBlock = thisBlock;
			            }
			        });

			        function xorBlock(words, offset, blockSize) {
			            var block;

			            // Shortcut
			            var iv = this._iv;

			            // Choose mixing block
			            if (iv) {
			                block = iv;

			                // Remove IV for subsequent blocks
			                this._iv = undefined$1;
			            } else {
			                block = this._prevBlock;
			            }

			            // XOR blocks
			            for (var i = 0; i < blockSize; i++) {
			                words[offset + i] ^= block[i];
			            }
			        }

			        return CBC;
			    }());

			    /**
			     * Padding namespace.
			     */
			    var C_pad = C.pad = {};

			    /**
			     * PKCS #5/7 padding strategy.
			     */
			    var Pkcs7 = C_pad.Pkcs7 = {
			        /**
			         * Pads data using the algorithm defined in PKCS #5/7.
			         *
			         * @param {WordArray} data The data to pad.
			         * @param {number} blockSize The multiple that the data should be padded to.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
			         */
			        pad: function (data, blockSize) {
			            // Shortcut
			            var blockSizeBytes = blockSize * 4;

			            // Count padding bytes
			            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

			            // Create padding word
			            var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;

			            // Create padding
			            var paddingWords = [];
			            for (var i = 0; i < nPaddingBytes; i += 4) {
			                paddingWords.push(paddingWord);
			            }
			            var padding = WordArray.create(paddingWords, nPaddingBytes);

			            // Add padding
			            data.concat(padding);
			        },

			        /**
			         * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
			         *
			         * @param {WordArray} data The data to unpad.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     CryptoJS.pad.Pkcs7.unpad(wordArray);
			         */
			        unpad: function (data) {
			            // Get number of padding bytes from last byte
			            var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

			            // Remove padding
			            data.sigBytes -= nPaddingBytes;
			        }
			    };

			    /**
			     * Abstract base block cipher template.
			     *
			     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
			     */
			    C_lib.BlockCipher = Cipher.extend({
			        /**
			         * Configuration options.
			         *
			         * @property {Mode} mode The block mode to use. Default: CBC
			         * @property {Padding} padding The padding strategy to use. Default: Pkcs7
			         */
			        cfg: Cipher.cfg.extend({
			            mode: CBC,
			            padding: Pkcs7
			        }),

			        reset: function () {
			            var modeCreator;

			            // Reset cipher
			            Cipher.reset.call(this);

			            // Shortcuts
			            var cfg = this.cfg;
			            var iv = cfg.iv;
			            var mode = cfg.mode;

			            // Reset block mode
			            if (this._xformMode == this._ENC_XFORM_MODE) {
			                modeCreator = mode.createEncryptor;
			            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
			                modeCreator = mode.createDecryptor;
			                // Keep at least one block in the buffer for unpadding
			                this._minBufferSize = 1;
			            }

			            if (this._mode && this._mode.__creator == modeCreator) {
			                this._mode.init(this, iv && iv.words);
			            } else {
			                this._mode = modeCreator.call(mode, this, iv && iv.words);
			                this._mode.__creator = modeCreator;
			            }
			        },

			        _doProcessBlock: function (words, offset) {
			            this._mode.processBlock(words, offset);
			        },

			        _doFinalize: function () {
			            var finalProcessedBlocks;

			            // Shortcut
			            var padding = this.cfg.padding;

			            // Finalize
			            if (this._xformMode == this._ENC_XFORM_MODE) {
			                // Pad data
			                padding.pad(this._data, this.blockSize);

			                // Process final blocks
			                finalProcessedBlocks = this._process(true);
			            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
			                // Process final blocks
			                finalProcessedBlocks = this._process(true);

			                // Unpad data
			                padding.unpad(finalProcessedBlocks);
			            }

			            return finalProcessedBlocks;
			        },

			        blockSize: 128/32
			    });

			    /**
			     * A collection of cipher parameters.
			     *
			     * @property {WordArray} ciphertext The raw ciphertext.
			     * @property {WordArray} key The key to this ciphertext.
			     * @property {WordArray} iv The IV used in the ciphering operation.
			     * @property {WordArray} salt The salt used with a key derivation function.
			     * @property {Cipher} algorithm The cipher algorithm.
			     * @property {Mode} mode The block mode used in the ciphering operation.
			     * @property {Padding} padding The padding scheme used in the ciphering operation.
			     * @property {number} blockSize The block size of the cipher.
			     * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
			     */
			    var CipherParams = C_lib.CipherParams = Base.extend({
			        /**
			         * Initializes a newly created cipher params object.
			         *
			         * @param {Object} cipherParams An object with any of the possible cipher parameters.
			         *
			         * @example
			         *
			         *     var cipherParams = CryptoJS.lib.CipherParams.create({
			         *         ciphertext: ciphertextWordArray,
			         *         key: keyWordArray,
			         *         iv: ivWordArray,
			         *         salt: saltWordArray,
			         *         algorithm: CryptoJS.algo.AES,
			         *         mode: CryptoJS.mode.CBC,
			         *         padding: CryptoJS.pad.PKCS7,
			         *         blockSize: 4,
			         *         formatter: CryptoJS.format.OpenSSL
			         *     });
			         */
			        init: function (cipherParams) {
			            this.mixIn(cipherParams);
			        },

			        /**
			         * Converts this cipher params object to a string.
			         *
			         * @param {Format} formatter (Optional) The formatting strategy to use.
			         *
			         * @return {string} The stringified cipher params.
			         *
			         * @throws Error If neither the formatter nor the default formatter is set.
			         *
			         * @example
			         *
			         *     var string = cipherParams + '';
			         *     var string = cipherParams.toString();
			         *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
			         */
			        toString: function (formatter) {
			            return (formatter || this.formatter).stringify(this);
			        }
			    });

			    /**
			     * Format namespace.
			     */
			    var C_format = C.format = {};

			    /**
			     * OpenSSL formatting strategy.
			     */
			    var OpenSSLFormatter = C_format.OpenSSL = {
			        /**
			         * Converts a cipher params object to an OpenSSL-compatible string.
			         *
			         * @param {CipherParams} cipherParams The cipher params object.
			         *
			         * @return {string} The OpenSSL-compatible string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
			         */
			        stringify: function (cipherParams) {
			            var wordArray;

			            // Shortcuts
			            var ciphertext = cipherParams.ciphertext;
			            var salt = cipherParams.salt;

			            // Format
			            if (salt) {
			                wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
			            } else {
			                wordArray = ciphertext;
			            }

			            return wordArray.toString(Base64);
			        },

			        /**
			         * Converts an OpenSSL-compatible string to a cipher params object.
			         *
			         * @param {string} openSSLStr The OpenSSL-compatible string.
			         *
			         * @return {CipherParams} The cipher params object.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
			         */
			        parse: function (openSSLStr) {
			            var salt;

			            // Parse base64
			            var ciphertext = Base64.parse(openSSLStr);

			            // Shortcut
			            var ciphertextWords = ciphertext.words;

			            // Test for salt
			            if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
			                // Extract salt
			                salt = WordArray.create(ciphertextWords.slice(2, 4));

			                // Remove salt from ciphertext
			                ciphertextWords.splice(0, 4);
			                ciphertext.sigBytes -= 16;
			            }

			            return CipherParams.create({ ciphertext: ciphertext, salt: salt });
			        }
			    };

			    /**
			     * A cipher wrapper that returns ciphertext as a serializable cipher params object.
			     */
			    var SerializableCipher = C_lib.SerializableCipher = Base.extend({
			        /**
			         * Configuration options.
			         *
			         * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
			         */
			        cfg: Base.extend({
			            format: OpenSSLFormatter
			        }),

			        /**
			         * Encrypts a message.
			         *
			         * @param {Cipher} cipher The cipher algorithm to use.
			         * @param {WordArray|string} message The message to encrypt.
			         * @param {WordArray} key The key.
			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
			         *
			         * @return {CipherParams} A cipher params object.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
			         */
			        encrypt: function (cipher, message, key, cfg) {
			            // Apply config defaults
			            cfg = this.cfg.extend(cfg);

			            // Encrypt
			            var encryptor = cipher.createEncryptor(key, cfg);
			            var ciphertext = encryptor.finalize(message);

			            // Shortcut
			            var cipherCfg = encryptor.cfg;

			            // Create and return serializable cipher params
			            return CipherParams.create({
			                ciphertext: ciphertext,
			                key: key,
			                iv: cipherCfg.iv,
			                algorithm: cipher,
			                mode: cipherCfg.mode,
			                padding: cipherCfg.padding,
			                blockSize: cipher.blockSize,
			                formatter: cfg.format
			            });
			        },

			        /**
			         * Decrypts serialized ciphertext.
			         *
			         * @param {Cipher} cipher The cipher algorithm to use.
			         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
			         * @param {WordArray} key The key.
			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
			         *
			         * @return {WordArray} The plaintext.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
			         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
			         */
			        decrypt: function (cipher, ciphertext, key, cfg) {
			            // Apply config defaults
			            cfg = this.cfg.extend(cfg);

			            // Convert string to CipherParams
			            ciphertext = this._parse(ciphertext, cfg.format);

			            // Decrypt
			            var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);

			            return plaintext;
			        },

			        /**
			         * Converts serialized ciphertext to CipherParams,
			         * else assumed CipherParams already and returns ciphertext unchanged.
			         *
			         * @param {CipherParams|string} ciphertext The ciphertext.
			         * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
			         *
			         * @return {CipherParams} The unserialized ciphertext.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
			         */
			        _parse: function (ciphertext, format) {
			            if (typeof ciphertext == 'string') {
			                return format.parse(ciphertext, this);
			            } else {
			                return ciphertext;
			            }
			        }
			    });

			    /**
			     * Key derivation function namespace.
			     */
			    var C_kdf = C.kdf = {};

			    /**
			     * OpenSSL key derivation function.
			     */
			    var OpenSSLKdf = C_kdf.OpenSSL = {
			        /**
			         * Derives a key and IV from a password.
			         *
			         * @param {string} password The password to derive from.
			         * @param {number} keySize The size in words of the key to generate.
			         * @param {number} ivSize The size in words of the IV to generate.
			         * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
			         *
			         * @return {CipherParams} A cipher params object with the key, IV, and salt.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
			         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
			         */
			        execute: function (password, keySize, ivSize, salt, hasher) {
			            // Generate random salt
			            if (!salt) {
			                salt = WordArray.random(64/8);
			            }

			            // Derive key and IV
			            if (!hasher) {
			                var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);
			            } else {
			                var key = EvpKDF.create({ keySize: keySize + ivSize, hasher: hasher }).compute(password, salt);
			            }


			            // Separate key and IV
			            var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
			            key.sigBytes = keySize * 4;

			            // Return params
			            return CipherParams.create({ key: key, iv: iv, salt: salt });
			        }
			    };

			    /**
			     * A serializable cipher wrapper that derives the key from a password,
			     * and returns ciphertext as a serializable cipher params object.
			     */
			    var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
			        /**
			         * Configuration options.
			         *
			         * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
			         */
			        cfg: SerializableCipher.cfg.extend({
			            kdf: OpenSSLKdf
			        }),

			        /**
			         * Encrypts a message using a password.
			         *
			         * @param {Cipher} cipher The cipher algorithm to use.
			         * @param {WordArray|string} message The message to encrypt.
			         * @param {string} password The password.
			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
			         *
			         * @return {CipherParams} A cipher params object.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
			         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
			         */
			        encrypt: function (cipher, message, password, cfg) {
			            // Apply config defaults
			            cfg = this.cfg.extend(cfg);

			            // Derive key and other params
			            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, cfg.salt, cfg.hasher);

			            // Add IV to config
			            cfg.iv = derivedParams.iv;

			            // Encrypt
			            var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);

			            // Mix in derived params
			            ciphertext.mixIn(derivedParams);

			            return ciphertext;
			        },

			        /**
			         * Decrypts serialized ciphertext using a password.
			         *
			         * @param {Cipher} cipher The cipher algorithm to use.
			         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
			         * @param {string} password The password.
			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
			         *
			         * @return {WordArray} The plaintext.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
			         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
			         */
			        decrypt: function (cipher, ciphertext, password, cfg) {
			            // Apply config defaults
			            cfg = this.cfg.extend(cfg);

			            // Convert string to CipherParams
			            ciphertext = this._parse(ciphertext, cfg.format);

			            // Derive key and other params
			            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt, cfg.hasher);

			            // Add IV to config
			            cfg.iv = derivedParams.iv;

			            // Decrypt
			            var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);

			            return plaintext;
			        }
			    });
			}());


		})); 
	} (cipherCore$1));
	return cipherCore$1.exports;
}

var modeCfb$1 = {exports: {}};

var modeCfb = modeCfb$1.exports;

var hasRequiredModeCfb;

function requireModeCfb () {
	if (hasRequiredModeCfb) return modeCfb$1.exports;
	hasRequiredModeCfb = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireCipherCore());
			}
		}(modeCfb, function (CryptoJS) {

			/**
			 * Cipher Feedback block mode.
			 */
			CryptoJS.mode.CFB = (function () {
			    var CFB = CryptoJS.lib.BlockCipherMode.extend();

			    CFB.Encryptor = CFB.extend({
			        processBlock: function (words, offset) {
			            // Shortcuts
			            var cipher = this._cipher;
			            var blockSize = cipher.blockSize;

			            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

			            // Remember this block to use with next block
			            this._prevBlock = words.slice(offset, offset + blockSize);
			        }
			    });

			    CFB.Decryptor = CFB.extend({
			        processBlock: function (words, offset) {
			            // Shortcuts
			            var cipher = this._cipher;
			            var blockSize = cipher.blockSize;

			            // Remember this block to use with next block
			            var thisBlock = words.slice(offset, offset + blockSize);

			            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

			            // This block becomes the previous block
			            this._prevBlock = thisBlock;
			        }
			    });

			    function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
			        var keystream;

			        // Shortcut
			        var iv = this._iv;

			        // Generate keystream
			        if (iv) {
			            keystream = iv.slice(0);

			            // Remove IV for subsequent blocks
			            this._iv = undefined;
			        } else {
			            keystream = this._prevBlock;
			        }
			        cipher.encryptBlock(keystream, 0);

			        // Encrypt
			        for (var i = 0; i < blockSize; i++) {
			            words[offset + i] ^= keystream[i];
			        }
			    }

			    return CFB;
			}());


			return CryptoJS.mode.CFB;

		})); 
	} (modeCfb$1));
	return modeCfb$1.exports;
}

var modeCtr$1 = {exports: {}};

var modeCtr = modeCtr$1.exports;

var hasRequiredModeCtr;

function requireModeCtr () {
	if (hasRequiredModeCtr) return modeCtr$1.exports;
	hasRequiredModeCtr = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireCipherCore());
			}
		}(modeCtr, function (CryptoJS) {

			/**
			 * Counter block mode.
			 */
			CryptoJS.mode.CTR = (function () {
			    var CTR = CryptoJS.lib.BlockCipherMode.extend();

			    var Encryptor = CTR.Encryptor = CTR.extend({
			        processBlock: function (words, offset) {
			            // Shortcuts
			            var cipher = this._cipher;
			            var blockSize = cipher.blockSize;
			            var iv = this._iv;
			            var counter = this._counter;

			            // Generate keystream
			            if (iv) {
			                counter = this._counter = iv.slice(0);

			                // Remove IV for subsequent blocks
			                this._iv = undefined;
			            }
			            var keystream = counter.slice(0);
			            cipher.encryptBlock(keystream, 0);

			            // Increment counter
			            counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0;

			            // Encrypt
			            for (var i = 0; i < blockSize; i++) {
			                words[offset + i] ^= keystream[i];
			            }
			        }
			    });

			    CTR.Decryptor = Encryptor;

			    return CTR;
			}());


			return CryptoJS.mode.CTR;

		})); 
	} (modeCtr$1));
	return modeCtr$1.exports;
}

var modeCtrGladman$1 = {exports: {}};

var modeCtrGladman = modeCtrGladman$1.exports;

var hasRequiredModeCtrGladman;

function requireModeCtrGladman () {
	if (hasRequiredModeCtrGladman) return modeCtrGladman$1.exports;
	hasRequiredModeCtrGladman = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireCipherCore());
			}
		}(modeCtrGladman, function (CryptoJS) {

			/** @preserve
			 * Counter block mode compatible with  Dr Brian Gladman fileenc.c
			 * derived from CryptoJS.mode.CTR
			 * Jan Hruby jhruby.web@gmail.com
			 */
			CryptoJS.mode.CTRGladman = (function () {
			    var CTRGladman = CryptoJS.lib.BlockCipherMode.extend();

				function incWord(word)
				{
					if (((word >> 24) & 0xff) === 0xff) { //overflow
					var b1 = (word >> 16)&0xff;
					var b2 = (word >> 8)&0xff;
					var b3 = word & 0xff;

					if (b1 === 0xff) // overflow b1
					{
					b1 = 0;
					if (b2 === 0xff)
					{
						b2 = 0;
						if (b3 === 0xff)
						{
							b3 = 0;
						}
						else
						{
							++b3;
						}
					}
					else
					{
						++b2;
					}
					}
					else
					{
					++b1;
					}

					word = 0;
					word += (b1 << 16);
					word += (b2 << 8);
					word += b3;
					}
					else
					{
					word += (0x01 << 24);
					}
					return word;
				}

				function incCounter(counter)
				{
					if ((counter[0] = incWord(counter[0])) === 0)
					{
						// encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
						counter[1] = incWord(counter[1]);
					}
					return counter;
				}

			    var Encryptor = CTRGladman.Encryptor = CTRGladman.extend({
			        processBlock: function (words, offset) {
			            // Shortcuts
			            var cipher = this._cipher;
			            var blockSize = cipher.blockSize;
			            var iv = this._iv;
			            var counter = this._counter;

			            // Generate keystream
			            if (iv) {
			                counter = this._counter = iv.slice(0);

			                // Remove IV for subsequent blocks
			                this._iv = undefined;
			            }

						incCounter(counter);

						var keystream = counter.slice(0);
			            cipher.encryptBlock(keystream, 0);

			            // Encrypt
			            for (var i = 0; i < blockSize; i++) {
			                words[offset + i] ^= keystream[i];
			            }
			        }
			    });

			    CTRGladman.Decryptor = Encryptor;

			    return CTRGladman;
			}());




			return CryptoJS.mode.CTRGladman;

		})); 
	} (modeCtrGladman$1));
	return modeCtrGladman$1.exports;
}

var modeOfb$1 = {exports: {}};

var modeOfb = modeOfb$1.exports;

var hasRequiredModeOfb;

function requireModeOfb () {
	if (hasRequiredModeOfb) return modeOfb$1.exports;
	hasRequiredModeOfb = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireCipherCore());
			}
		}(modeOfb, function (CryptoJS) {

			/**
			 * Output Feedback block mode.
			 */
			CryptoJS.mode.OFB = (function () {
			    var OFB = CryptoJS.lib.BlockCipherMode.extend();

			    var Encryptor = OFB.Encryptor = OFB.extend({
			        processBlock: function (words, offset) {
			            // Shortcuts
			            var cipher = this._cipher;
			            var blockSize = cipher.blockSize;
			            var iv = this._iv;
			            var keystream = this._keystream;

			            // Generate keystream
			            if (iv) {
			                keystream = this._keystream = iv.slice(0);

			                // Remove IV for subsequent blocks
			                this._iv = undefined;
			            }
			            cipher.encryptBlock(keystream, 0);

			            // Encrypt
			            for (var i = 0; i < blockSize; i++) {
			                words[offset + i] ^= keystream[i];
			            }
			        }
			    });

			    OFB.Decryptor = Encryptor;

			    return OFB;
			}());


			return CryptoJS.mode.OFB;

		})); 
	} (modeOfb$1));
	return modeOfb$1.exports;
}

var modeEcb$1 = {exports: {}};

var modeEcb = modeEcb$1.exports;

var hasRequiredModeEcb;

function requireModeEcb () {
	if (hasRequiredModeEcb) return modeEcb$1.exports;
	hasRequiredModeEcb = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireCipherCore());
			}
		}(modeEcb, function (CryptoJS) {

			/**
			 * Electronic Codebook block mode.
			 */
			CryptoJS.mode.ECB = (function () {
			    var ECB = CryptoJS.lib.BlockCipherMode.extend();

			    ECB.Encryptor = ECB.extend({
			        processBlock: function (words, offset) {
			            this._cipher.encryptBlock(words, offset);
			        }
			    });

			    ECB.Decryptor = ECB.extend({
			        processBlock: function (words, offset) {
			            this._cipher.decryptBlock(words, offset);
			        }
			    });

			    return ECB;
			}());


			return CryptoJS.mode.ECB;

		})); 
	} (modeEcb$1));
	return modeEcb$1.exports;
}

var padAnsix923$1 = {exports: {}};

var padAnsix923 = padAnsix923$1.exports;

var hasRequiredPadAnsix923;

function requirePadAnsix923 () {
	if (hasRequiredPadAnsix923) return padAnsix923$1.exports;
	hasRequiredPadAnsix923 = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireCipherCore());
			}
		}(padAnsix923, function (CryptoJS) {

			/**
			 * ANSI X.923 padding strategy.
			 */
			CryptoJS.pad.AnsiX923 = {
			    pad: function (data, blockSize) {
			        // Shortcuts
			        var dataSigBytes = data.sigBytes;
			        var blockSizeBytes = blockSize * 4;

			        // Count padding bytes
			        var nPaddingBytes = blockSizeBytes - dataSigBytes % blockSizeBytes;

			        // Compute last byte position
			        var lastBytePos = dataSigBytes + nPaddingBytes - 1;

			        // Pad
			        data.clamp();
			        data.words[lastBytePos >>> 2] |= nPaddingBytes << (24 - (lastBytePos % 4) * 8);
			        data.sigBytes += nPaddingBytes;
			    },

			    unpad: function (data) {
			        // Get number of padding bytes from last byte
			        var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

			        // Remove padding
			        data.sigBytes -= nPaddingBytes;
			    }
			};


			return CryptoJS.pad.Ansix923;

		})); 
	} (padAnsix923$1));
	return padAnsix923$1.exports;
}

var padIso10126$1 = {exports: {}};

var padIso10126 = padIso10126$1.exports;

var hasRequiredPadIso10126;

function requirePadIso10126 () {
	if (hasRequiredPadIso10126) return padIso10126$1.exports;
	hasRequiredPadIso10126 = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireCipherCore());
			}
		}(padIso10126, function (CryptoJS) {

			/**
			 * ISO 10126 padding strategy.
			 */
			CryptoJS.pad.Iso10126 = {
			    pad: function (data, blockSize) {
			        // Shortcut
			        var blockSizeBytes = blockSize * 4;

			        // Count padding bytes
			        var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

			        // Pad
			        data.concat(CryptoJS.lib.WordArray.random(nPaddingBytes - 1)).
			             concat(CryptoJS.lib.WordArray.create([nPaddingBytes << 24], 1));
			    },

			    unpad: function (data) {
			        // Get number of padding bytes from last byte
			        var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

			        // Remove padding
			        data.sigBytes -= nPaddingBytes;
			    }
			};


			return CryptoJS.pad.Iso10126;

		})); 
	} (padIso10126$1));
	return padIso10126$1.exports;
}

var padIso97971$1 = {exports: {}};

var padIso97971 = padIso97971$1.exports;

var hasRequiredPadIso97971;

function requirePadIso97971 () {
	if (hasRequiredPadIso97971) return padIso97971$1.exports;
	hasRequiredPadIso97971 = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireCipherCore());
			}
		}(padIso97971, function (CryptoJS) {

			/**
			 * ISO/IEC 9797-1 Padding Method 2.
			 */
			CryptoJS.pad.Iso97971 = {
			    pad: function (data, blockSize) {
			        // Add 0x80 byte
			        data.concat(CryptoJS.lib.WordArray.create([0x80000000], 1));

			        // Zero pad the rest
			        CryptoJS.pad.ZeroPadding.pad(data, blockSize);
			    },

			    unpad: function (data) {
			        // Remove zero padding
			        CryptoJS.pad.ZeroPadding.unpad(data);

			        // Remove one more byte -- the 0x80 byte
			        data.sigBytes--;
			    }
			};


			return CryptoJS.pad.Iso97971;

		})); 
	} (padIso97971$1));
	return padIso97971$1.exports;
}

var padZeropadding$1 = {exports: {}};

var padZeropadding = padZeropadding$1.exports;

var hasRequiredPadZeropadding;

function requirePadZeropadding () {
	if (hasRequiredPadZeropadding) return padZeropadding$1.exports;
	hasRequiredPadZeropadding = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireCipherCore());
			}
		}(padZeropadding, function (CryptoJS) {

			/**
			 * Zero padding strategy.
			 */
			CryptoJS.pad.ZeroPadding = {
			    pad: function (data, blockSize) {
			        // Shortcut
			        var blockSizeBytes = blockSize * 4;

			        // Pad
			        data.clamp();
			        data.sigBytes += blockSizeBytes - ((data.sigBytes % blockSizeBytes) || blockSizeBytes);
			    },

			    unpad: function (data) {
			        // Shortcut
			        var dataWords = data.words;

			        // Unpad
			        var i = data.sigBytes - 1;
			        for (var i = data.sigBytes - 1; i >= 0; i--) {
			            if (((dataWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff)) {
			                data.sigBytes = i + 1;
			                break;
			            }
			        }
			    }
			};


			return CryptoJS.pad.ZeroPadding;

		})); 
	} (padZeropadding$1));
	return padZeropadding$1.exports;
}

var padNopadding$1 = {exports: {}};

var padNopadding = padNopadding$1.exports;

var hasRequiredPadNopadding;

function requirePadNopadding () {
	if (hasRequiredPadNopadding) return padNopadding$1.exports;
	hasRequiredPadNopadding = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireCipherCore());
			}
		}(padNopadding, function (CryptoJS) {

			/**
			 * A noop padding strategy.
			 */
			CryptoJS.pad.NoPadding = {
			    pad: function () {
			    },

			    unpad: function () {
			    }
			};


			return CryptoJS.pad.NoPadding;

		})); 
	} (padNopadding$1));
	return padNopadding$1.exports;
}

var formatHex$1 = {exports: {}};

var formatHex = formatHex$1.exports;

var hasRequiredFormatHex;

function requireFormatHex () {
	if (hasRequiredFormatHex) return formatHex$1.exports;
	hasRequiredFormatHex = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireCipherCore());
			}
		}(formatHex, function (CryptoJS) {

			(function (undefined$1) {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var CipherParams = C_lib.CipherParams;
			    var C_enc = C.enc;
			    var Hex = C_enc.Hex;
			    var C_format = C.format;

			    C_format.Hex = {
			        /**
			         * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
			         *
			         * @param {CipherParams} cipherParams The cipher params object.
			         *
			         * @return {string} The hexadecimally encoded string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
			         */
			        stringify: function (cipherParams) {
			            return cipherParams.ciphertext.toString(Hex);
			        },

			        /**
			         * Converts a hexadecimally encoded ciphertext string to a cipher params object.
			         *
			         * @param {string} input The hexadecimally encoded string.
			         *
			         * @return {CipherParams} The cipher params object.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
			         */
			        parse: function (input) {
			            var ciphertext = Hex.parse(input);
			            return CipherParams.create({ ciphertext: ciphertext });
			        }
			    };
			}());


			return CryptoJS.format.Hex;

		})); 
	} (formatHex$1));
	return formatHex$1.exports;
}

var aes$1 = {exports: {}};

var aes = aes$1.exports;

var hasRequiredAes;

function requireAes () {
	if (hasRequiredAes) return aes$1.exports;
	hasRequiredAes = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireEncBase64(), /*@__PURE__*/ requireMd5(), /*@__PURE__*/ requireEvpkdf(), /*@__PURE__*/ requireCipherCore());
			}
		}(aes, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var BlockCipher = C_lib.BlockCipher;
			    var C_algo = C.algo;

			    // Lookup tables
			    var SBOX = [];
			    var INV_SBOX = [];
			    var SUB_MIX_0 = [];
			    var SUB_MIX_1 = [];
			    var SUB_MIX_2 = [];
			    var SUB_MIX_3 = [];
			    var INV_SUB_MIX_0 = [];
			    var INV_SUB_MIX_1 = [];
			    var INV_SUB_MIX_2 = [];
			    var INV_SUB_MIX_3 = [];

			    // Compute lookup tables
			    (function () {
			        // Compute double table
			        var d = [];
			        for (var i = 0; i < 256; i++) {
			            if (i < 128) {
			                d[i] = i << 1;
			            } else {
			                d[i] = (i << 1) ^ 0x11b;
			            }
			        }

			        // Walk GF(2^8)
			        var x = 0;
			        var xi = 0;
			        for (var i = 0; i < 256; i++) {
			            // Compute sbox
			            var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
			            sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
			            SBOX[x] = sx;
			            INV_SBOX[sx] = x;

			            // Compute multiplication
			            var x2 = d[x];
			            var x4 = d[x2];
			            var x8 = d[x4];

			            // Compute sub bytes, mix columns tables
			            var t = (d[sx] * 0x101) ^ (sx * 0x1010100);
			            SUB_MIX_0[x] = (t << 24) | (t >>> 8);
			            SUB_MIX_1[x] = (t << 16) | (t >>> 16);
			            SUB_MIX_2[x] = (t << 8)  | (t >>> 24);
			            SUB_MIX_3[x] = t;

			            // Compute inv sub bytes, inv mix columns tables
			            var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
			            INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
			            INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
			            INV_SUB_MIX_2[sx] = (t << 8)  | (t >>> 24);
			            INV_SUB_MIX_3[sx] = t;

			            // Compute next counter
			            if (!x) {
			                x = xi = 1;
			            } else {
			                x = x2 ^ d[d[d[x8 ^ x2]]];
			                xi ^= d[d[xi]];
			            }
			        }
			    }());

			    // Precomputed Rcon lookup
			    var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

			    /**
			     * AES block cipher algorithm.
			     */
			    var AES = C_algo.AES = BlockCipher.extend({
			        _doReset: function () {
			            var t;

			            // Skip reset of nRounds has been set before and key did not change
			            if (this._nRounds && this._keyPriorReset === this._key) {
			                return;
			            }

			            // Shortcuts
			            var key = this._keyPriorReset = this._key;
			            var keyWords = key.words;
			            var keySize = key.sigBytes / 4;

			            // Compute number of rounds
			            var nRounds = this._nRounds = keySize + 6;

			            // Compute number of key schedule rows
			            var ksRows = (nRounds + 1) * 4;

			            // Compute key schedule
			            var keySchedule = this._keySchedule = [];
			            for (var ksRow = 0; ksRow < ksRows; ksRow++) {
			                if (ksRow < keySize) {
			                    keySchedule[ksRow] = keyWords[ksRow];
			                } else {
			                    t = keySchedule[ksRow - 1];

			                    if (!(ksRow % keySize)) {
			                        // Rot word
			                        t = (t << 8) | (t >>> 24);

			                        // Sub word
			                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];

			                        // Mix Rcon
			                        t ^= RCON[(ksRow / keySize) | 0] << 24;
			                    } else if (keySize > 6 && ksRow % keySize == 4) {
			                        // Sub word
			                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
			                    }

			                    keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
			                }
			            }

			            // Compute inv key schedule
			            var invKeySchedule = this._invKeySchedule = [];
			            for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
			                var ksRow = ksRows - invKsRow;

			                if (invKsRow % 4) {
			                    var t = keySchedule[ksRow];
			                } else {
			                    var t = keySchedule[ksRow - 4];
			                }

			                if (invKsRow < 4 || ksRow <= 4) {
			                    invKeySchedule[invKsRow] = t;
			                } else {
			                    invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
			                                               INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]];
			                }
			            }
			        },

			        encryptBlock: function (M, offset) {
			            this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
			        },

			        decryptBlock: function (M, offset) {
			            // Swap 2nd and 4th rows
			            var t = M[offset + 1];
			            M[offset + 1] = M[offset + 3];
			            M[offset + 3] = t;

			            this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);

			            // Inv swap 2nd and 4th rows
			            var t = M[offset + 1];
			            M[offset + 1] = M[offset + 3];
			            M[offset + 3] = t;
			        },

			        _doCryptBlock: function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
			            // Shortcut
			            var nRounds = this._nRounds;

			            // Get input, add round key
			            var s0 = M[offset]     ^ keySchedule[0];
			            var s1 = M[offset + 1] ^ keySchedule[1];
			            var s2 = M[offset + 2] ^ keySchedule[2];
			            var s3 = M[offset + 3] ^ keySchedule[3];

			            // Key schedule row counter
			            var ksRow = 4;

			            // Rounds
			            for (var round = 1; round < nRounds; round++) {
			                // Shift rows, sub bytes, mix columns, add round key
			                var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 & 0xff] ^ keySchedule[ksRow++];
			                var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 & 0xff] ^ keySchedule[ksRow++];
			                var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 & 0xff] ^ keySchedule[ksRow++];
			                var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 & 0xff] ^ keySchedule[ksRow++];

			                // Update state
			                s0 = t0;
			                s1 = t1;
			                s2 = t2;
			                s3 = t3;
			            }

			            // Shift rows, sub bytes, add round key
			            var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++];
			            var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++];
			            var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++];
			            var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++];

			            // Set output
			            M[offset]     = t0;
			            M[offset + 1] = t1;
			            M[offset + 2] = t2;
			            M[offset + 3] = t3;
			        },

			        keySize: 256/32
			    });

			    /**
			     * Shortcut functions to the cipher's object interface.
			     *
			     * @example
			     *
			     *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
			     *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
			     */
			    C.AES = BlockCipher._createHelper(AES);
			}());


			return CryptoJS.AES;

		})); 
	} (aes$1));
	return aes$1.exports;
}

var tripledes$1 = {exports: {}};

var tripledes = tripledes$1.exports;

var hasRequiredTripledes;

function requireTripledes () {
	if (hasRequiredTripledes) return tripledes$1.exports;
	hasRequiredTripledes = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireEncBase64(), /*@__PURE__*/ requireMd5(), /*@__PURE__*/ requireEvpkdf(), /*@__PURE__*/ requireCipherCore());
			}
		}(tripledes, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var WordArray = C_lib.WordArray;
			    var BlockCipher = C_lib.BlockCipher;
			    var C_algo = C.algo;

			    // Permuted Choice 1 constants
			    var PC1 = [
			        57, 49, 41, 33, 25, 17, 9,  1,
			        58, 50, 42, 34, 26, 18, 10, 2,
			        59, 51, 43, 35, 27, 19, 11, 3,
			        60, 52, 44, 36, 63, 55, 47, 39,
			        31, 23, 15, 7,  62, 54, 46, 38,
			        30, 22, 14, 6,  61, 53, 45, 37,
			        29, 21, 13, 5,  28, 20, 12, 4
			    ];

			    // Permuted Choice 2 constants
			    var PC2 = [
			        14, 17, 11, 24, 1,  5,
			        3,  28, 15, 6,  21, 10,
			        23, 19, 12, 4,  26, 8,
			        16, 7,  27, 20, 13, 2,
			        41, 52, 31, 37, 47, 55,
			        30, 40, 51, 45, 33, 48,
			        44, 49, 39, 56, 34, 53,
			        46, 42, 50, 36, 29, 32
			    ];

			    // Cumulative bit shift constants
			    var BIT_SHIFTS = [1,  2,  4,  6,  8,  10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];

			    // SBOXes and round permutation constants
			    var SBOX_P = [
			        {
			            0x0: 0x808200,
			            0x10000000: 0x8000,
			            0x20000000: 0x808002,
			            0x30000000: 0x2,
			            0x40000000: 0x200,
			            0x50000000: 0x808202,
			            0x60000000: 0x800202,
			            0x70000000: 0x800000,
			            0x80000000: 0x202,
			            0x90000000: 0x800200,
			            0xa0000000: 0x8200,
			            0xb0000000: 0x808000,
			            0xc0000000: 0x8002,
			            0xd0000000: 0x800002,
			            0xe0000000: 0x0,
			            0xf0000000: 0x8202,
			            0x8000000: 0x0,
			            0x18000000: 0x808202,
			            0x28000000: 0x8202,
			            0x38000000: 0x8000,
			            0x48000000: 0x808200,
			            0x58000000: 0x200,
			            0x68000000: 0x808002,
			            0x78000000: 0x2,
			            0x88000000: 0x800200,
			            0x98000000: 0x8200,
			            0xa8000000: 0x808000,
			            0xb8000000: 0x800202,
			            0xc8000000: 0x800002,
			            0xd8000000: 0x8002,
			            0xe8000000: 0x202,
			            0xf8000000: 0x800000,
			            0x1: 0x8000,
			            0x10000001: 0x2,
			            0x20000001: 0x808200,
			            0x30000001: 0x800000,
			            0x40000001: 0x808002,
			            0x50000001: 0x8200,
			            0x60000001: 0x200,
			            0x70000001: 0x800202,
			            0x80000001: 0x808202,
			            0x90000001: 0x808000,
			            0xa0000001: 0x800002,
			            0xb0000001: 0x8202,
			            0xc0000001: 0x202,
			            0xd0000001: 0x800200,
			            0xe0000001: 0x8002,
			            0xf0000001: 0x0,
			            0x8000001: 0x808202,
			            0x18000001: 0x808000,
			            0x28000001: 0x800000,
			            0x38000001: 0x200,
			            0x48000001: 0x8000,
			            0x58000001: 0x800002,
			            0x68000001: 0x2,
			            0x78000001: 0x8202,
			            0x88000001: 0x8002,
			            0x98000001: 0x800202,
			            0xa8000001: 0x202,
			            0xb8000001: 0x808200,
			            0xc8000001: 0x800200,
			            0xd8000001: 0x0,
			            0xe8000001: 0x8200,
			            0xf8000001: 0x808002
			        },
			        {
			            0x0: 0x40084010,
			            0x1000000: 0x4000,
			            0x2000000: 0x80000,
			            0x3000000: 0x40080010,
			            0x4000000: 0x40000010,
			            0x5000000: 0x40084000,
			            0x6000000: 0x40004000,
			            0x7000000: 0x10,
			            0x8000000: 0x84000,
			            0x9000000: 0x40004010,
			            0xa000000: 0x40000000,
			            0xb000000: 0x84010,
			            0xc000000: 0x80010,
			            0xd000000: 0x0,
			            0xe000000: 0x4010,
			            0xf000000: 0x40080000,
			            0x800000: 0x40004000,
			            0x1800000: 0x84010,
			            0x2800000: 0x10,
			            0x3800000: 0x40004010,
			            0x4800000: 0x40084010,
			            0x5800000: 0x40000000,
			            0x6800000: 0x80000,
			            0x7800000: 0x40080010,
			            0x8800000: 0x80010,
			            0x9800000: 0x0,
			            0xa800000: 0x4000,
			            0xb800000: 0x40080000,
			            0xc800000: 0x40000010,
			            0xd800000: 0x84000,
			            0xe800000: 0x40084000,
			            0xf800000: 0x4010,
			            0x10000000: 0x0,
			            0x11000000: 0x40080010,
			            0x12000000: 0x40004010,
			            0x13000000: 0x40084000,
			            0x14000000: 0x40080000,
			            0x15000000: 0x10,
			            0x16000000: 0x84010,
			            0x17000000: 0x4000,
			            0x18000000: 0x4010,
			            0x19000000: 0x80000,
			            0x1a000000: 0x80010,
			            0x1b000000: 0x40000010,
			            0x1c000000: 0x84000,
			            0x1d000000: 0x40004000,
			            0x1e000000: 0x40000000,
			            0x1f000000: 0x40084010,
			            0x10800000: 0x84010,
			            0x11800000: 0x80000,
			            0x12800000: 0x40080000,
			            0x13800000: 0x4000,
			            0x14800000: 0x40004000,
			            0x15800000: 0x40084010,
			            0x16800000: 0x10,
			            0x17800000: 0x40000000,
			            0x18800000: 0x40084000,
			            0x19800000: 0x40000010,
			            0x1a800000: 0x40004010,
			            0x1b800000: 0x80010,
			            0x1c800000: 0x0,
			            0x1d800000: 0x4010,
			            0x1e800000: 0x40080010,
			            0x1f800000: 0x84000
			        },
			        {
			            0x0: 0x104,
			            0x100000: 0x0,
			            0x200000: 0x4000100,
			            0x300000: 0x10104,
			            0x400000: 0x10004,
			            0x500000: 0x4000004,
			            0x600000: 0x4010104,
			            0x700000: 0x4010000,
			            0x800000: 0x4000000,
			            0x900000: 0x4010100,
			            0xa00000: 0x10100,
			            0xb00000: 0x4010004,
			            0xc00000: 0x4000104,
			            0xd00000: 0x10000,
			            0xe00000: 0x4,
			            0xf00000: 0x100,
			            0x80000: 0x4010100,
			            0x180000: 0x4010004,
			            0x280000: 0x0,
			            0x380000: 0x4000100,
			            0x480000: 0x4000004,
			            0x580000: 0x10000,
			            0x680000: 0x10004,
			            0x780000: 0x104,
			            0x880000: 0x4,
			            0x980000: 0x100,
			            0xa80000: 0x4010000,
			            0xb80000: 0x10104,
			            0xc80000: 0x10100,
			            0xd80000: 0x4000104,
			            0xe80000: 0x4010104,
			            0xf80000: 0x4000000,
			            0x1000000: 0x4010100,
			            0x1100000: 0x10004,
			            0x1200000: 0x10000,
			            0x1300000: 0x4000100,
			            0x1400000: 0x100,
			            0x1500000: 0x4010104,
			            0x1600000: 0x4000004,
			            0x1700000: 0x0,
			            0x1800000: 0x4000104,
			            0x1900000: 0x4000000,
			            0x1a00000: 0x4,
			            0x1b00000: 0x10100,
			            0x1c00000: 0x4010000,
			            0x1d00000: 0x104,
			            0x1e00000: 0x10104,
			            0x1f00000: 0x4010004,
			            0x1080000: 0x4000000,
			            0x1180000: 0x104,
			            0x1280000: 0x4010100,
			            0x1380000: 0x0,
			            0x1480000: 0x10004,
			            0x1580000: 0x4000100,
			            0x1680000: 0x100,
			            0x1780000: 0x4010004,
			            0x1880000: 0x10000,
			            0x1980000: 0x4010104,
			            0x1a80000: 0x10104,
			            0x1b80000: 0x4000004,
			            0x1c80000: 0x4000104,
			            0x1d80000: 0x4010000,
			            0x1e80000: 0x4,
			            0x1f80000: 0x10100
			        },
			        {
			            0x0: 0x80401000,
			            0x10000: 0x80001040,
			            0x20000: 0x401040,
			            0x30000: 0x80400000,
			            0x40000: 0x0,
			            0x50000: 0x401000,
			            0x60000: 0x80000040,
			            0x70000: 0x400040,
			            0x80000: 0x80000000,
			            0x90000: 0x400000,
			            0xa0000: 0x40,
			            0xb0000: 0x80001000,
			            0xc0000: 0x80400040,
			            0xd0000: 0x1040,
			            0xe0000: 0x1000,
			            0xf0000: 0x80401040,
			            0x8000: 0x80001040,
			            0x18000: 0x40,
			            0x28000: 0x80400040,
			            0x38000: 0x80001000,
			            0x48000: 0x401000,
			            0x58000: 0x80401040,
			            0x68000: 0x0,
			            0x78000: 0x80400000,
			            0x88000: 0x1000,
			            0x98000: 0x80401000,
			            0xa8000: 0x400000,
			            0xb8000: 0x1040,
			            0xc8000: 0x80000000,
			            0xd8000: 0x400040,
			            0xe8000: 0x401040,
			            0xf8000: 0x80000040,
			            0x100000: 0x400040,
			            0x110000: 0x401000,
			            0x120000: 0x80000040,
			            0x130000: 0x0,
			            0x140000: 0x1040,
			            0x150000: 0x80400040,
			            0x160000: 0x80401000,
			            0x170000: 0x80001040,
			            0x180000: 0x80401040,
			            0x190000: 0x80000000,
			            0x1a0000: 0x80400000,
			            0x1b0000: 0x401040,
			            0x1c0000: 0x80001000,
			            0x1d0000: 0x400000,
			            0x1e0000: 0x40,
			            0x1f0000: 0x1000,
			            0x108000: 0x80400000,
			            0x118000: 0x80401040,
			            0x128000: 0x0,
			            0x138000: 0x401000,
			            0x148000: 0x400040,
			            0x158000: 0x80000000,
			            0x168000: 0x80001040,
			            0x178000: 0x40,
			            0x188000: 0x80000040,
			            0x198000: 0x1000,
			            0x1a8000: 0x80001000,
			            0x1b8000: 0x80400040,
			            0x1c8000: 0x1040,
			            0x1d8000: 0x80401000,
			            0x1e8000: 0x400000,
			            0x1f8000: 0x401040
			        },
			        {
			            0x0: 0x80,
			            0x1000: 0x1040000,
			            0x2000: 0x40000,
			            0x3000: 0x20000000,
			            0x4000: 0x20040080,
			            0x5000: 0x1000080,
			            0x6000: 0x21000080,
			            0x7000: 0x40080,
			            0x8000: 0x1000000,
			            0x9000: 0x20040000,
			            0xa000: 0x20000080,
			            0xb000: 0x21040080,
			            0xc000: 0x21040000,
			            0xd000: 0x0,
			            0xe000: 0x1040080,
			            0xf000: 0x21000000,
			            0x800: 0x1040080,
			            0x1800: 0x21000080,
			            0x2800: 0x80,
			            0x3800: 0x1040000,
			            0x4800: 0x40000,
			            0x5800: 0x20040080,
			            0x6800: 0x21040000,
			            0x7800: 0x20000000,
			            0x8800: 0x20040000,
			            0x9800: 0x0,
			            0xa800: 0x21040080,
			            0xb800: 0x1000080,
			            0xc800: 0x20000080,
			            0xd800: 0x21000000,
			            0xe800: 0x1000000,
			            0xf800: 0x40080,
			            0x10000: 0x40000,
			            0x11000: 0x80,
			            0x12000: 0x20000000,
			            0x13000: 0x21000080,
			            0x14000: 0x1000080,
			            0x15000: 0x21040000,
			            0x16000: 0x20040080,
			            0x17000: 0x1000000,
			            0x18000: 0x21040080,
			            0x19000: 0x21000000,
			            0x1a000: 0x1040000,
			            0x1b000: 0x20040000,
			            0x1c000: 0x40080,
			            0x1d000: 0x20000080,
			            0x1e000: 0x0,
			            0x1f000: 0x1040080,
			            0x10800: 0x21000080,
			            0x11800: 0x1000000,
			            0x12800: 0x1040000,
			            0x13800: 0x20040080,
			            0x14800: 0x20000000,
			            0x15800: 0x1040080,
			            0x16800: 0x80,
			            0x17800: 0x21040000,
			            0x18800: 0x40080,
			            0x19800: 0x21040080,
			            0x1a800: 0x0,
			            0x1b800: 0x21000000,
			            0x1c800: 0x1000080,
			            0x1d800: 0x40000,
			            0x1e800: 0x20040000,
			            0x1f800: 0x20000080
			        },
			        {
			            0x0: 0x10000008,
			            0x100: 0x2000,
			            0x200: 0x10200000,
			            0x300: 0x10202008,
			            0x400: 0x10002000,
			            0x500: 0x200000,
			            0x600: 0x200008,
			            0x700: 0x10000000,
			            0x800: 0x0,
			            0x900: 0x10002008,
			            0xa00: 0x202000,
			            0xb00: 0x8,
			            0xc00: 0x10200008,
			            0xd00: 0x202008,
			            0xe00: 0x2008,
			            0xf00: 0x10202000,
			            0x80: 0x10200000,
			            0x180: 0x10202008,
			            0x280: 0x8,
			            0x380: 0x200000,
			            0x480: 0x202008,
			            0x580: 0x10000008,
			            0x680: 0x10002000,
			            0x780: 0x2008,
			            0x880: 0x200008,
			            0x980: 0x2000,
			            0xa80: 0x10002008,
			            0xb80: 0x10200008,
			            0xc80: 0x0,
			            0xd80: 0x10202000,
			            0xe80: 0x202000,
			            0xf80: 0x10000000,
			            0x1000: 0x10002000,
			            0x1100: 0x10200008,
			            0x1200: 0x10202008,
			            0x1300: 0x2008,
			            0x1400: 0x200000,
			            0x1500: 0x10000000,
			            0x1600: 0x10000008,
			            0x1700: 0x202000,
			            0x1800: 0x202008,
			            0x1900: 0x0,
			            0x1a00: 0x8,
			            0x1b00: 0x10200000,
			            0x1c00: 0x2000,
			            0x1d00: 0x10002008,
			            0x1e00: 0x10202000,
			            0x1f00: 0x200008,
			            0x1080: 0x8,
			            0x1180: 0x202000,
			            0x1280: 0x200000,
			            0x1380: 0x10000008,
			            0x1480: 0x10002000,
			            0x1580: 0x2008,
			            0x1680: 0x10202008,
			            0x1780: 0x10200000,
			            0x1880: 0x10202000,
			            0x1980: 0x10200008,
			            0x1a80: 0x2000,
			            0x1b80: 0x202008,
			            0x1c80: 0x200008,
			            0x1d80: 0x0,
			            0x1e80: 0x10000000,
			            0x1f80: 0x10002008
			        },
			        {
			            0x0: 0x100000,
			            0x10: 0x2000401,
			            0x20: 0x400,
			            0x30: 0x100401,
			            0x40: 0x2100401,
			            0x50: 0x0,
			            0x60: 0x1,
			            0x70: 0x2100001,
			            0x80: 0x2000400,
			            0x90: 0x100001,
			            0xa0: 0x2000001,
			            0xb0: 0x2100400,
			            0xc0: 0x2100000,
			            0xd0: 0x401,
			            0xe0: 0x100400,
			            0xf0: 0x2000000,
			            0x8: 0x2100001,
			            0x18: 0x0,
			            0x28: 0x2000401,
			            0x38: 0x2100400,
			            0x48: 0x100000,
			            0x58: 0x2000001,
			            0x68: 0x2000000,
			            0x78: 0x401,
			            0x88: 0x100401,
			            0x98: 0x2000400,
			            0xa8: 0x2100000,
			            0xb8: 0x100001,
			            0xc8: 0x400,
			            0xd8: 0x2100401,
			            0xe8: 0x1,
			            0xf8: 0x100400,
			            0x100: 0x2000000,
			            0x110: 0x100000,
			            0x120: 0x2000401,
			            0x130: 0x2100001,
			            0x140: 0x100001,
			            0x150: 0x2000400,
			            0x160: 0x2100400,
			            0x170: 0x100401,
			            0x180: 0x401,
			            0x190: 0x2100401,
			            0x1a0: 0x100400,
			            0x1b0: 0x1,
			            0x1c0: 0x0,
			            0x1d0: 0x2100000,
			            0x1e0: 0x2000001,
			            0x1f0: 0x400,
			            0x108: 0x100400,
			            0x118: 0x2000401,
			            0x128: 0x2100001,
			            0x138: 0x1,
			            0x148: 0x2000000,
			            0x158: 0x100000,
			            0x168: 0x401,
			            0x178: 0x2100400,
			            0x188: 0x2000001,
			            0x198: 0x2100000,
			            0x1a8: 0x0,
			            0x1b8: 0x2100401,
			            0x1c8: 0x100401,
			            0x1d8: 0x400,
			            0x1e8: 0x2000400,
			            0x1f8: 0x100001
			        },
			        {
			            0x0: 0x8000820,
			            0x1: 0x20000,
			            0x2: 0x8000000,
			            0x3: 0x20,
			            0x4: 0x20020,
			            0x5: 0x8020820,
			            0x6: 0x8020800,
			            0x7: 0x800,
			            0x8: 0x8020000,
			            0x9: 0x8000800,
			            0xa: 0x20800,
			            0xb: 0x8020020,
			            0xc: 0x820,
			            0xd: 0x0,
			            0xe: 0x8000020,
			            0xf: 0x20820,
			            0x80000000: 0x800,
			            0x80000001: 0x8020820,
			            0x80000002: 0x8000820,
			            0x80000003: 0x8000000,
			            0x80000004: 0x8020000,
			            0x80000005: 0x20800,
			            0x80000006: 0x20820,
			            0x80000007: 0x20,
			            0x80000008: 0x8000020,
			            0x80000009: 0x820,
			            0x8000000a: 0x20020,
			            0x8000000b: 0x8020800,
			            0x8000000c: 0x0,
			            0x8000000d: 0x8020020,
			            0x8000000e: 0x8000800,
			            0x8000000f: 0x20000,
			            0x10: 0x20820,
			            0x11: 0x8020800,
			            0x12: 0x20,
			            0x13: 0x800,
			            0x14: 0x8000800,
			            0x15: 0x8000020,
			            0x16: 0x8020020,
			            0x17: 0x20000,
			            0x18: 0x0,
			            0x19: 0x20020,
			            0x1a: 0x8020000,
			            0x1b: 0x8000820,
			            0x1c: 0x8020820,
			            0x1d: 0x20800,
			            0x1e: 0x820,
			            0x1f: 0x8000000,
			            0x80000010: 0x20000,
			            0x80000011: 0x800,
			            0x80000012: 0x8020020,
			            0x80000013: 0x20820,
			            0x80000014: 0x20,
			            0x80000015: 0x8020000,
			            0x80000016: 0x8000000,
			            0x80000017: 0x8000820,
			            0x80000018: 0x8020820,
			            0x80000019: 0x8000020,
			            0x8000001a: 0x8000800,
			            0x8000001b: 0x0,
			            0x8000001c: 0x20800,
			            0x8000001d: 0x820,
			            0x8000001e: 0x20020,
			            0x8000001f: 0x8020800
			        }
			    ];

			    // Masks that select the SBOX input
			    var SBOX_MASK = [
			        0xf8000001, 0x1f800000, 0x01f80000, 0x001f8000,
			        0x0001f800, 0x00001f80, 0x000001f8, 0x8000001f
			    ];

			    /**
			     * DES block cipher algorithm.
			     */
			    var DES = C_algo.DES = BlockCipher.extend({
			        _doReset: function () {
			            // Shortcuts
			            var key = this._key;
			            var keyWords = key.words;

			            // Select 56 bits according to PC1
			            var keyBits = [];
			            for (var i = 0; i < 56; i++) {
			                var keyBitPos = PC1[i] - 1;
			                keyBits[i] = (keyWords[keyBitPos >>> 5] >>> (31 - keyBitPos % 32)) & 1;
			            }

			            // Assemble 16 subkeys
			            var subKeys = this._subKeys = [];
			            for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
			                // Create subkey
			                var subKey = subKeys[nSubKey] = [];

			                // Shortcut
			                var bitShift = BIT_SHIFTS[nSubKey];

			                // Select 48 bits according to PC2
			                for (var i = 0; i < 24; i++) {
			                    // Select from the left 28 key bits
			                    subKey[(i / 6) | 0] |= keyBits[((PC2[i] - 1) + bitShift) % 28] << (31 - i % 6);

			                    // Select from the right 28 key bits
			                    subKey[4 + ((i / 6) | 0)] |= keyBits[28 + (((PC2[i + 24] - 1) + bitShift) % 28)] << (31 - i % 6);
			                }

			                // Since each subkey is applied to an expanded 32-bit input,
			                // the subkey can be broken into 8 values scaled to 32-bits,
			                // which allows the key to be used without expansion
			                subKey[0] = (subKey[0] << 1) | (subKey[0] >>> 31);
			                for (var i = 1; i < 7; i++) {
			                    subKey[i] = subKey[i] >>> ((i - 1) * 4 + 3);
			                }
			                subKey[7] = (subKey[7] << 5) | (subKey[7] >>> 27);
			            }

			            // Compute inverse subkeys
			            var invSubKeys = this._invSubKeys = [];
			            for (var i = 0; i < 16; i++) {
			                invSubKeys[i] = subKeys[15 - i];
			            }
			        },

			        encryptBlock: function (M, offset) {
			            this._doCryptBlock(M, offset, this._subKeys);
			        },

			        decryptBlock: function (M, offset) {
			            this._doCryptBlock(M, offset, this._invSubKeys);
			        },

			        _doCryptBlock: function (M, offset, subKeys) {
			            // Get input
			            this._lBlock = M[offset];
			            this._rBlock = M[offset + 1];

			            // Initial permutation
			            exchangeLR.call(this, 4,  0x0f0f0f0f);
			            exchangeLR.call(this, 16, 0x0000ffff);
			            exchangeRL.call(this, 2,  0x33333333);
			            exchangeRL.call(this, 8,  0x00ff00ff);
			            exchangeLR.call(this, 1,  0x55555555);

			            // Rounds
			            for (var round = 0; round < 16; round++) {
			                // Shortcuts
			                var subKey = subKeys[round];
			                var lBlock = this._lBlock;
			                var rBlock = this._rBlock;

			                // Feistel function
			                var f = 0;
			                for (var i = 0; i < 8; i++) {
			                    f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
			                }
			                this._lBlock = rBlock;
			                this._rBlock = lBlock ^ f;
			            }

			            // Undo swap from last round
			            var t = this._lBlock;
			            this._lBlock = this._rBlock;
			            this._rBlock = t;

			            // Final permutation
			            exchangeLR.call(this, 1,  0x55555555);
			            exchangeRL.call(this, 8,  0x00ff00ff);
			            exchangeRL.call(this, 2,  0x33333333);
			            exchangeLR.call(this, 16, 0x0000ffff);
			            exchangeLR.call(this, 4,  0x0f0f0f0f);

			            // Set output
			            M[offset] = this._lBlock;
			            M[offset + 1] = this._rBlock;
			        },

			        keySize: 64/32,

			        ivSize: 64/32,

			        blockSize: 64/32
			    });

			    // Swap bits across the left and right words
			    function exchangeLR(offset, mask) {
			        var t = ((this._lBlock >>> offset) ^ this._rBlock) & mask;
			        this._rBlock ^= t;
			        this._lBlock ^= t << offset;
			    }

			    function exchangeRL(offset, mask) {
			        var t = ((this._rBlock >>> offset) ^ this._lBlock) & mask;
			        this._lBlock ^= t;
			        this._rBlock ^= t << offset;
			    }

			    /**
			     * Shortcut functions to the cipher's object interface.
			     *
			     * @example
			     *
			     *     var ciphertext = CryptoJS.DES.encrypt(message, key, cfg);
			     *     var plaintext  = CryptoJS.DES.decrypt(ciphertext, key, cfg);
			     */
			    C.DES = BlockCipher._createHelper(DES);

			    /**
			     * Triple-DES block cipher algorithm.
			     */
			    var TripleDES = C_algo.TripleDES = BlockCipher.extend({
			        _doReset: function () {
			            // Shortcuts
			            var key = this._key;
			            var keyWords = key.words;
			            // Make sure the key length is valid (64, 128 or >= 192 bit)
			            if (keyWords.length !== 2 && keyWords.length !== 4 && keyWords.length < 6) {
			                throw new Error('Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.');
			            }

			            // Extend the key according to the keying options defined in 3DES standard
			            var key1 = keyWords.slice(0, 2);
			            var key2 = keyWords.length < 4 ? keyWords.slice(0, 2) : keyWords.slice(2, 4);
			            var key3 = keyWords.length < 6 ? keyWords.slice(0, 2) : keyWords.slice(4, 6);

			            // Create DES instances
			            this._des1 = DES.createEncryptor(WordArray.create(key1));
			            this._des2 = DES.createEncryptor(WordArray.create(key2));
			            this._des3 = DES.createEncryptor(WordArray.create(key3));
			        },

			        encryptBlock: function (M, offset) {
			            this._des1.encryptBlock(M, offset);
			            this._des2.decryptBlock(M, offset);
			            this._des3.encryptBlock(M, offset);
			        },

			        decryptBlock: function (M, offset) {
			            this._des3.decryptBlock(M, offset);
			            this._des2.encryptBlock(M, offset);
			            this._des1.decryptBlock(M, offset);
			        },

			        keySize: 192/32,

			        ivSize: 64/32,

			        blockSize: 64/32
			    });

			    /**
			     * Shortcut functions to the cipher's object interface.
			     *
			     * @example
			     *
			     *     var ciphertext = CryptoJS.TripleDES.encrypt(message, key, cfg);
			     *     var plaintext  = CryptoJS.TripleDES.decrypt(ciphertext, key, cfg);
			     */
			    C.TripleDES = BlockCipher._createHelper(TripleDES);
			}());


			return CryptoJS.TripleDES;

		})); 
	} (tripledes$1));
	return tripledes$1.exports;
}

var rc4$1 = {exports: {}};

var rc4 = rc4$1.exports;

var hasRequiredRc4;

function requireRc4 () {
	if (hasRequiredRc4) return rc4$1.exports;
	hasRequiredRc4 = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireEncBase64(), /*@__PURE__*/ requireMd5(), /*@__PURE__*/ requireEvpkdf(), /*@__PURE__*/ requireCipherCore());
			}
		}(rc4, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var StreamCipher = C_lib.StreamCipher;
			    var C_algo = C.algo;

			    /**
			     * RC4 stream cipher algorithm.
			     */
			    var RC4 = C_algo.RC4 = StreamCipher.extend({
			        _doReset: function () {
			            // Shortcuts
			            var key = this._key;
			            var keyWords = key.words;
			            var keySigBytes = key.sigBytes;

			            // Init sbox
			            var S = this._S = [];
			            for (var i = 0; i < 256; i++) {
			                S[i] = i;
			            }

			            // Key setup
			            for (var i = 0, j = 0; i < 256; i++) {
			                var keyByteIndex = i % keySigBytes;
			                var keyByte = (keyWords[keyByteIndex >>> 2] >>> (24 - (keyByteIndex % 4) * 8)) & 0xff;

			                j = (j + S[i] + keyByte) % 256;

			                // Swap
			                var t = S[i];
			                S[i] = S[j];
			                S[j] = t;
			            }

			            // Counters
			            this._i = this._j = 0;
			        },

			        _doProcessBlock: function (M, offset) {
			            M[offset] ^= generateKeystreamWord.call(this);
			        },

			        keySize: 256/32,

			        ivSize: 0
			    });

			    function generateKeystreamWord() {
			        // Shortcuts
			        var S = this._S;
			        var i = this._i;
			        var j = this._j;

			        // Generate keystream word
			        var keystreamWord = 0;
			        for (var n = 0; n < 4; n++) {
			            i = (i + 1) % 256;
			            j = (j + S[i]) % 256;

			            // Swap
			            var t = S[i];
			            S[i] = S[j];
			            S[j] = t;

			            keystreamWord |= S[(S[i] + S[j]) % 256] << (24 - n * 8);
			        }

			        // Update counters
			        this._i = i;
			        this._j = j;

			        return keystreamWord;
			    }

			    /**
			     * Shortcut functions to the cipher's object interface.
			     *
			     * @example
			     *
			     *     var ciphertext = CryptoJS.RC4.encrypt(message, key, cfg);
			     *     var plaintext  = CryptoJS.RC4.decrypt(ciphertext, key, cfg);
			     */
			    C.RC4 = StreamCipher._createHelper(RC4);

			    /**
			     * Modified RC4 stream cipher algorithm.
			     */
			    var RC4Drop = C_algo.RC4Drop = RC4.extend({
			        /**
			         * Configuration options.
			         *
			         * @property {number} drop The number of keystream words to drop. Default 192
			         */
			        cfg: RC4.cfg.extend({
			            drop: 192
			        }),

			        _doReset: function () {
			            RC4._doReset.call(this);

			            // Drop
			            for (var i = this.cfg.drop; i > 0; i--) {
			                generateKeystreamWord.call(this);
			            }
			        }
			    });

			    /**
			     * Shortcut functions to the cipher's object interface.
			     *
			     * @example
			     *
			     *     var ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
			     *     var plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
			     */
			    C.RC4Drop = StreamCipher._createHelper(RC4Drop);
			}());


			return CryptoJS.RC4;

		})); 
	} (rc4$1));
	return rc4$1.exports;
}

var rabbit$1 = {exports: {}};

var rabbit = rabbit$1.exports;

var hasRequiredRabbit;

function requireRabbit () {
	if (hasRequiredRabbit) return rabbit$1.exports;
	hasRequiredRabbit = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireEncBase64(), /*@__PURE__*/ requireMd5(), /*@__PURE__*/ requireEvpkdf(), /*@__PURE__*/ requireCipherCore());
			}
		}(rabbit, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var StreamCipher = C_lib.StreamCipher;
			    var C_algo = C.algo;

			    // Reusable objects
			    var S  = [];
			    var C_ = [];
			    var G  = [];

			    /**
			     * Rabbit stream cipher algorithm
			     */
			    var Rabbit = C_algo.Rabbit = StreamCipher.extend({
			        _doReset: function () {
			            // Shortcuts
			            var K = this._key.words;
			            var iv = this.cfg.iv;

			            // Swap endian
			            for (var i = 0; i < 4; i++) {
			                K[i] = (((K[i] << 8)  | (K[i] >>> 24)) & 0x00ff00ff) |
			                       (((K[i] << 24) | (K[i] >>> 8))  & 0xff00ff00);
			            }

			            // Generate initial state values
			            var X = this._X = [
			                K[0], (K[3] << 16) | (K[2] >>> 16),
			                K[1], (K[0] << 16) | (K[3] >>> 16),
			                K[2], (K[1] << 16) | (K[0] >>> 16),
			                K[3], (K[2] << 16) | (K[1] >>> 16)
			            ];

			            // Generate initial counter values
			            var C = this._C = [
			                (K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
			                (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
			                (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
			                (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)
			            ];

			            // Carry bit
			            this._b = 0;

			            // Iterate the system four times
			            for (var i = 0; i < 4; i++) {
			                nextState.call(this);
			            }

			            // Modify the counters
			            for (var i = 0; i < 8; i++) {
			                C[i] ^= X[(i + 4) & 7];
			            }

			            // IV setup
			            if (iv) {
			                // Shortcuts
			                var IV = iv.words;
			                var IV_0 = IV[0];
			                var IV_1 = IV[1];

			                // Generate four subvectors
			                var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
			                var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
			                var i1 = (i0 >>> 16) | (i2 & 0xffff0000);
			                var i3 = (i2 << 16)  | (i0 & 0x0000ffff);

			                // Modify counter values
			                C[0] ^= i0;
			                C[1] ^= i1;
			                C[2] ^= i2;
			                C[3] ^= i3;
			                C[4] ^= i0;
			                C[5] ^= i1;
			                C[6] ^= i2;
			                C[7] ^= i3;

			                // Iterate the system four times
			                for (var i = 0; i < 4; i++) {
			                    nextState.call(this);
			                }
			            }
			        },

			        _doProcessBlock: function (M, offset) {
			            // Shortcut
			            var X = this._X;

			            // Iterate the system
			            nextState.call(this);

			            // Generate four keystream words
			            S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
			            S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
			            S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
			            S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

			            for (var i = 0; i < 4; i++) {
			                // Swap endian
			                S[i] = (((S[i] << 8)  | (S[i] >>> 24)) & 0x00ff00ff) |
			                       (((S[i] << 24) | (S[i] >>> 8))  & 0xff00ff00);

			                // Encrypt
			                M[offset + i] ^= S[i];
			            }
			        },

			        blockSize: 128/32,

			        ivSize: 64/32
			    });

			    function nextState() {
			        // Shortcuts
			        var X = this._X;
			        var C = this._C;

			        // Save old counter values
			        for (var i = 0; i < 8; i++) {
			            C_[i] = C[i];
			        }

			        // Calculate new counter values
			        C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
			        C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_[0] >>> 0) ? 1 : 0)) | 0;
			        C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_[1] >>> 0) ? 1 : 0)) | 0;
			        C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_[2] >>> 0) ? 1 : 0)) | 0;
			        C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_[3] >>> 0) ? 1 : 0)) | 0;
			        C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_[4] >>> 0) ? 1 : 0)) | 0;
			        C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_[5] >>> 0) ? 1 : 0)) | 0;
			        C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_[6] >>> 0) ? 1 : 0)) | 0;
			        this._b = (C[7] >>> 0) < (C_[7] >>> 0) ? 1 : 0;

			        // Calculate the g-values
			        for (var i = 0; i < 8; i++) {
			            var gx = X[i] + C[i];

			            // Construct high and low argument for squaring
			            var ga = gx & 0xffff;
			            var gb = gx >>> 16;

			            // Calculate high and low result of squaring
			            var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb;
			            var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0);

			            // High XOR low
			            G[i] = gh ^ gl;
			        }

			        // Calculate new state values
			        X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
			        X[1] = (G[1] + ((G[0] << 8)  | (G[0] >>> 24)) + G[7]) | 0;
			        X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
			        X[3] = (G[3] + ((G[2] << 8)  | (G[2] >>> 24)) + G[1]) | 0;
			        X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
			        X[5] = (G[5] + ((G[4] << 8)  | (G[4] >>> 24)) + G[3]) | 0;
			        X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
			        X[7] = (G[7] + ((G[6] << 8)  | (G[6] >>> 24)) + G[5]) | 0;
			    }

			    /**
			     * Shortcut functions to the cipher's object interface.
			     *
			     * @example
			     *
			     *     var ciphertext = CryptoJS.Rabbit.encrypt(message, key, cfg);
			     *     var plaintext  = CryptoJS.Rabbit.decrypt(ciphertext, key, cfg);
			     */
			    C.Rabbit = StreamCipher._createHelper(Rabbit);
			}());


			return CryptoJS.Rabbit;

		})); 
	} (rabbit$1));
	return rabbit$1.exports;
}

var rabbitLegacy$1 = {exports: {}};

var rabbitLegacy = rabbitLegacy$1.exports;

var hasRequiredRabbitLegacy;

function requireRabbitLegacy () {
	if (hasRequiredRabbitLegacy) return rabbitLegacy$1.exports;
	hasRequiredRabbitLegacy = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireEncBase64(), /*@__PURE__*/ requireMd5(), /*@__PURE__*/ requireEvpkdf(), /*@__PURE__*/ requireCipherCore());
			}
		}(rabbitLegacy, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var StreamCipher = C_lib.StreamCipher;
			    var C_algo = C.algo;

			    // Reusable objects
			    var S  = [];
			    var C_ = [];
			    var G  = [];

			    /**
			     * Rabbit stream cipher algorithm.
			     *
			     * This is a legacy version that neglected to convert the key to little-endian.
			     * This error doesn't affect the cipher's security,
			     * but it does affect its compatibility with other implementations.
			     */
			    var RabbitLegacy = C_algo.RabbitLegacy = StreamCipher.extend({
			        _doReset: function () {
			            // Shortcuts
			            var K = this._key.words;
			            var iv = this.cfg.iv;

			            // Generate initial state values
			            var X = this._X = [
			                K[0], (K[3] << 16) | (K[2] >>> 16),
			                K[1], (K[0] << 16) | (K[3] >>> 16),
			                K[2], (K[1] << 16) | (K[0] >>> 16),
			                K[3], (K[2] << 16) | (K[1] >>> 16)
			            ];

			            // Generate initial counter values
			            var C = this._C = [
			                (K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
			                (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
			                (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
			                (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)
			            ];

			            // Carry bit
			            this._b = 0;

			            // Iterate the system four times
			            for (var i = 0; i < 4; i++) {
			                nextState.call(this);
			            }

			            // Modify the counters
			            for (var i = 0; i < 8; i++) {
			                C[i] ^= X[(i + 4) & 7];
			            }

			            // IV setup
			            if (iv) {
			                // Shortcuts
			                var IV = iv.words;
			                var IV_0 = IV[0];
			                var IV_1 = IV[1];

			                // Generate four subvectors
			                var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
			                var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
			                var i1 = (i0 >>> 16) | (i2 & 0xffff0000);
			                var i3 = (i2 << 16)  | (i0 & 0x0000ffff);

			                // Modify counter values
			                C[0] ^= i0;
			                C[1] ^= i1;
			                C[2] ^= i2;
			                C[3] ^= i3;
			                C[4] ^= i0;
			                C[5] ^= i1;
			                C[6] ^= i2;
			                C[7] ^= i3;

			                // Iterate the system four times
			                for (var i = 0; i < 4; i++) {
			                    nextState.call(this);
			                }
			            }
			        },

			        _doProcessBlock: function (M, offset) {
			            // Shortcut
			            var X = this._X;

			            // Iterate the system
			            nextState.call(this);

			            // Generate four keystream words
			            S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
			            S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
			            S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
			            S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

			            for (var i = 0; i < 4; i++) {
			                // Swap endian
			                S[i] = (((S[i] << 8)  | (S[i] >>> 24)) & 0x00ff00ff) |
			                       (((S[i] << 24) | (S[i] >>> 8))  & 0xff00ff00);

			                // Encrypt
			                M[offset + i] ^= S[i];
			            }
			        },

			        blockSize: 128/32,

			        ivSize: 64/32
			    });

			    function nextState() {
			        // Shortcuts
			        var X = this._X;
			        var C = this._C;

			        // Save old counter values
			        for (var i = 0; i < 8; i++) {
			            C_[i] = C[i];
			        }

			        // Calculate new counter values
			        C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
			        C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_[0] >>> 0) ? 1 : 0)) | 0;
			        C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_[1] >>> 0) ? 1 : 0)) | 0;
			        C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_[2] >>> 0) ? 1 : 0)) | 0;
			        C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_[3] >>> 0) ? 1 : 0)) | 0;
			        C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_[4] >>> 0) ? 1 : 0)) | 0;
			        C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_[5] >>> 0) ? 1 : 0)) | 0;
			        C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_[6] >>> 0) ? 1 : 0)) | 0;
			        this._b = (C[7] >>> 0) < (C_[7] >>> 0) ? 1 : 0;

			        // Calculate the g-values
			        for (var i = 0; i < 8; i++) {
			            var gx = X[i] + C[i];

			            // Construct high and low argument for squaring
			            var ga = gx & 0xffff;
			            var gb = gx >>> 16;

			            // Calculate high and low result of squaring
			            var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb;
			            var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0);

			            // High XOR low
			            G[i] = gh ^ gl;
			        }

			        // Calculate new state values
			        X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
			        X[1] = (G[1] + ((G[0] << 8)  | (G[0] >>> 24)) + G[7]) | 0;
			        X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
			        X[3] = (G[3] + ((G[2] << 8)  | (G[2] >>> 24)) + G[1]) | 0;
			        X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
			        X[5] = (G[5] + ((G[4] << 8)  | (G[4] >>> 24)) + G[3]) | 0;
			        X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
			        X[7] = (G[7] + ((G[6] << 8)  | (G[6] >>> 24)) + G[5]) | 0;
			    }

			    /**
			     * Shortcut functions to the cipher's object interface.
			     *
			     * @example
			     *
			     *     var ciphertext = CryptoJS.RabbitLegacy.encrypt(message, key, cfg);
			     *     var plaintext  = CryptoJS.RabbitLegacy.decrypt(ciphertext, key, cfg);
			     */
			    C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
			}());


			return CryptoJS.RabbitLegacy;

		})); 
	} (rabbitLegacy$1));
	return rabbitLegacy$1.exports;
}

var blowfish$1 = {exports: {}};

var blowfish = blowfish$1.exports;

var hasRequiredBlowfish;

function requireBlowfish () {
	if (hasRequiredBlowfish) return blowfish$1.exports;
	hasRequiredBlowfish = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireEncBase64(), /*@__PURE__*/ requireMd5(), /*@__PURE__*/ requireEvpkdf(), /*@__PURE__*/ requireCipherCore());
			}
		}(blowfish, function (CryptoJS) {

			(function () {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var BlockCipher = C_lib.BlockCipher;
			    var C_algo = C.algo;

			    const N = 16;

			    //Origin pbox and sbox, derived from PI
			    const ORIG_P = [
			        0x243F6A88, 0x85A308D3, 0x13198A2E, 0x03707344,
			        0xA4093822, 0x299F31D0, 0x082EFA98, 0xEC4E6C89,
			        0x452821E6, 0x38D01377, 0xBE5466CF, 0x34E90C6C,
			        0xC0AC29B7, 0xC97C50DD, 0x3F84D5B5, 0xB5470917,
			        0x9216D5D9, 0x8979FB1B
			    ];

			    const ORIG_S = [
			        [   0xD1310BA6, 0x98DFB5AC, 0x2FFD72DB, 0xD01ADFB7,
			            0xB8E1AFED, 0x6A267E96, 0xBA7C9045, 0xF12C7F99,
			            0x24A19947, 0xB3916CF7, 0x0801F2E2, 0x858EFC16,
			            0x636920D8, 0x71574E69, 0xA458FEA3, 0xF4933D7E,
			            0x0D95748F, 0x728EB658, 0x718BCD58, 0x82154AEE,
			            0x7B54A41D, 0xC25A59B5, 0x9C30D539, 0x2AF26013,
			            0xC5D1B023, 0x286085F0, 0xCA417918, 0xB8DB38EF,
			            0x8E79DCB0, 0x603A180E, 0x6C9E0E8B, 0xB01E8A3E,
			            0xD71577C1, 0xBD314B27, 0x78AF2FDA, 0x55605C60,
			            0xE65525F3, 0xAA55AB94, 0x57489862, 0x63E81440,
			            0x55CA396A, 0x2AAB10B6, 0xB4CC5C34, 0x1141E8CE,
			            0xA15486AF, 0x7C72E993, 0xB3EE1411, 0x636FBC2A,
			            0x2BA9C55D, 0x741831F6, 0xCE5C3E16, 0x9B87931E,
			            0xAFD6BA33, 0x6C24CF5C, 0x7A325381, 0x28958677,
			            0x3B8F4898, 0x6B4BB9AF, 0xC4BFE81B, 0x66282193,
			            0x61D809CC, 0xFB21A991, 0x487CAC60, 0x5DEC8032,
			            0xEF845D5D, 0xE98575B1, 0xDC262302, 0xEB651B88,
			            0x23893E81, 0xD396ACC5, 0x0F6D6FF3, 0x83F44239,
			            0x2E0B4482, 0xA4842004, 0x69C8F04A, 0x9E1F9B5E,
			            0x21C66842, 0xF6E96C9A, 0x670C9C61, 0xABD388F0,
			            0x6A51A0D2, 0xD8542F68, 0x960FA728, 0xAB5133A3,
			            0x6EEF0B6C, 0x137A3BE4, 0xBA3BF050, 0x7EFB2A98,
			            0xA1F1651D, 0x39AF0176, 0x66CA593E, 0x82430E88,
			            0x8CEE8619, 0x456F9FB4, 0x7D84A5C3, 0x3B8B5EBE,
			            0xE06F75D8, 0x85C12073, 0x401A449F, 0x56C16AA6,
			            0x4ED3AA62, 0x363F7706, 0x1BFEDF72, 0x429B023D,
			            0x37D0D724, 0xD00A1248, 0xDB0FEAD3, 0x49F1C09B,
			            0x075372C9, 0x80991B7B, 0x25D479D8, 0xF6E8DEF7,
			            0xE3FE501A, 0xB6794C3B, 0x976CE0BD, 0x04C006BA,
			            0xC1A94FB6, 0x409F60C4, 0x5E5C9EC2, 0x196A2463,
			            0x68FB6FAF, 0x3E6C53B5, 0x1339B2EB, 0x3B52EC6F,
			            0x6DFC511F, 0x9B30952C, 0xCC814544, 0xAF5EBD09,
			            0xBEE3D004, 0xDE334AFD, 0x660F2807, 0x192E4BB3,
			            0xC0CBA857, 0x45C8740F, 0xD20B5F39, 0xB9D3FBDB,
			            0x5579C0BD, 0x1A60320A, 0xD6A100C6, 0x402C7279,
			            0x679F25FE, 0xFB1FA3CC, 0x8EA5E9F8, 0xDB3222F8,
			            0x3C7516DF, 0xFD616B15, 0x2F501EC8, 0xAD0552AB,
			            0x323DB5FA, 0xFD238760, 0x53317B48, 0x3E00DF82,
			            0x9E5C57BB, 0xCA6F8CA0, 0x1A87562E, 0xDF1769DB,
			            0xD542A8F6, 0x287EFFC3, 0xAC6732C6, 0x8C4F5573,
			            0x695B27B0, 0xBBCA58C8, 0xE1FFA35D, 0xB8F011A0,
			            0x10FA3D98, 0xFD2183B8, 0x4AFCB56C, 0x2DD1D35B,
			            0x9A53E479, 0xB6F84565, 0xD28E49BC, 0x4BFB9790,
			            0xE1DDF2DA, 0xA4CB7E33, 0x62FB1341, 0xCEE4C6E8,
			            0xEF20CADA, 0x36774C01, 0xD07E9EFE, 0x2BF11FB4,
			            0x95DBDA4D, 0xAE909198, 0xEAAD8E71, 0x6B93D5A0,
			            0xD08ED1D0, 0xAFC725E0, 0x8E3C5B2F, 0x8E7594B7,
			            0x8FF6E2FB, 0xF2122B64, 0x8888B812, 0x900DF01C,
			            0x4FAD5EA0, 0x688FC31C, 0xD1CFF191, 0xB3A8C1AD,
			            0x2F2F2218, 0xBE0E1777, 0xEA752DFE, 0x8B021FA1,
			            0xE5A0CC0F, 0xB56F74E8, 0x18ACF3D6, 0xCE89E299,
			            0xB4A84FE0, 0xFD13E0B7, 0x7CC43B81, 0xD2ADA8D9,
			            0x165FA266, 0x80957705, 0x93CC7314, 0x211A1477,
			            0xE6AD2065, 0x77B5FA86, 0xC75442F5, 0xFB9D35CF,
			            0xEBCDAF0C, 0x7B3E89A0, 0xD6411BD3, 0xAE1E7E49,
			            0x00250E2D, 0x2071B35E, 0x226800BB, 0x57B8E0AF,
			            0x2464369B, 0xF009B91E, 0x5563911D, 0x59DFA6AA,
			            0x78C14389, 0xD95A537F, 0x207D5BA2, 0x02E5B9C5,
			            0x83260376, 0x6295CFA9, 0x11C81968, 0x4E734A41,
			            0xB3472DCA, 0x7B14A94A, 0x1B510052, 0x9A532915,
			            0xD60F573F, 0xBC9BC6E4, 0x2B60A476, 0x81E67400,
			            0x08BA6FB5, 0x571BE91F, 0xF296EC6B, 0x2A0DD915,
			            0xB6636521, 0xE7B9F9B6, 0xFF34052E, 0xC5855664,
			            0x53B02D5D, 0xA99F8FA1, 0x08BA4799, 0x6E85076A   ],
			        [   0x4B7A70E9, 0xB5B32944, 0xDB75092E, 0xC4192623,
			            0xAD6EA6B0, 0x49A7DF7D, 0x9CEE60B8, 0x8FEDB266,
			            0xECAA8C71, 0x699A17FF, 0x5664526C, 0xC2B19EE1,
			            0x193602A5, 0x75094C29, 0xA0591340, 0xE4183A3E,
			            0x3F54989A, 0x5B429D65, 0x6B8FE4D6, 0x99F73FD6,
			            0xA1D29C07, 0xEFE830F5, 0x4D2D38E6, 0xF0255DC1,
			            0x4CDD2086, 0x8470EB26, 0x6382E9C6, 0x021ECC5E,
			            0x09686B3F, 0x3EBAEFC9, 0x3C971814, 0x6B6A70A1,
			            0x687F3584, 0x52A0E286, 0xB79C5305, 0xAA500737,
			            0x3E07841C, 0x7FDEAE5C, 0x8E7D44EC, 0x5716F2B8,
			            0xB03ADA37, 0xF0500C0D, 0xF01C1F04, 0x0200B3FF,
			            0xAE0CF51A, 0x3CB574B2, 0x25837A58, 0xDC0921BD,
			            0xD19113F9, 0x7CA92FF6, 0x94324773, 0x22F54701,
			            0x3AE5E581, 0x37C2DADC, 0xC8B57634, 0x9AF3DDA7,
			            0xA9446146, 0x0FD0030E, 0xECC8C73E, 0xA4751E41,
			            0xE238CD99, 0x3BEA0E2F, 0x3280BBA1, 0x183EB331,
			            0x4E548B38, 0x4F6DB908, 0x6F420D03, 0xF60A04BF,
			            0x2CB81290, 0x24977C79, 0x5679B072, 0xBCAF89AF,
			            0xDE9A771F, 0xD9930810, 0xB38BAE12, 0xDCCF3F2E,
			            0x5512721F, 0x2E6B7124, 0x501ADDE6, 0x9F84CD87,
			            0x7A584718, 0x7408DA17, 0xBC9F9ABC, 0xE94B7D8C,
			            0xEC7AEC3A, 0xDB851DFA, 0x63094366, 0xC464C3D2,
			            0xEF1C1847, 0x3215D908, 0xDD433B37, 0x24C2BA16,
			            0x12A14D43, 0x2A65C451, 0x50940002, 0x133AE4DD,
			            0x71DFF89E, 0x10314E55, 0x81AC77D6, 0x5F11199B,
			            0x043556F1, 0xD7A3C76B, 0x3C11183B, 0x5924A509,
			            0xF28FE6ED, 0x97F1FBFA, 0x9EBABF2C, 0x1E153C6E,
			            0x86E34570, 0xEAE96FB1, 0x860E5E0A, 0x5A3E2AB3,
			            0x771FE71C, 0x4E3D06FA, 0x2965DCB9, 0x99E71D0F,
			            0x803E89D6, 0x5266C825, 0x2E4CC978, 0x9C10B36A,
			            0xC6150EBA, 0x94E2EA78, 0xA5FC3C53, 0x1E0A2DF4,
			            0xF2F74EA7, 0x361D2B3D, 0x1939260F, 0x19C27960,
			            0x5223A708, 0xF71312B6, 0xEBADFE6E, 0xEAC31F66,
			            0xE3BC4595, 0xA67BC883, 0xB17F37D1, 0x018CFF28,
			            0xC332DDEF, 0xBE6C5AA5, 0x65582185, 0x68AB9802,
			            0xEECEA50F, 0xDB2F953B, 0x2AEF7DAD, 0x5B6E2F84,
			            0x1521B628, 0x29076170, 0xECDD4775, 0x619F1510,
			            0x13CCA830, 0xEB61BD96, 0x0334FE1E, 0xAA0363CF,
			            0xB5735C90, 0x4C70A239, 0xD59E9E0B, 0xCBAADE14,
			            0xEECC86BC, 0x60622CA7, 0x9CAB5CAB, 0xB2F3846E,
			            0x648B1EAF, 0x19BDF0CA, 0xA02369B9, 0x655ABB50,
			            0x40685A32, 0x3C2AB4B3, 0x319EE9D5, 0xC021B8F7,
			            0x9B540B19, 0x875FA099, 0x95F7997E, 0x623D7DA8,
			            0xF837889A, 0x97E32D77, 0x11ED935F, 0x16681281,
			            0x0E358829, 0xC7E61FD6, 0x96DEDFA1, 0x7858BA99,
			            0x57F584A5, 0x1B227263, 0x9B83C3FF, 0x1AC24696,
			            0xCDB30AEB, 0x532E3054, 0x8FD948E4, 0x6DBC3128,
			            0x58EBF2EF, 0x34C6FFEA, 0xFE28ED61, 0xEE7C3C73,
			            0x5D4A14D9, 0xE864B7E3, 0x42105D14, 0x203E13E0,
			            0x45EEE2B6, 0xA3AAABEA, 0xDB6C4F15, 0xFACB4FD0,
			            0xC742F442, 0xEF6ABBB5, 0x654F3B1D, 0x41CD2105,
			            0xD81E799E, 0x86854DC7, 0xE44B476A, 0x3D816250,
			            0xCF62A1F2, 0x5B8D2646, 0xFC8883A0, 0xC1C7B6A3,
			            0x7F1524C3, 0x69CB7492, 0x47848A0B, 0x5692B285,
			            0x095BBF00, 0xAD19489D, 0x1462B174, 0x23820E00,
			            0x58428D2A, 0x0C55F5EA, 0x1DADF43E, 0x233F7061,
			            0x3372F092, 0x8D937E41, 0xD65FECF1, 0x6C223BDB,
			            0x7CDE3759, 0xCBEE7460, 0x4085F2A7, 0xCE77326E,
			            0xA6078084, 0x19F8509E, 0xE8EFD855, 0x61D99735,
			            0xA969A7AA, 0xC50C06C2, 0x5A04ABFC, 0x800BCADC,
			            0x9E447A2E, 0xC3453484, 0xFDD56705, 0x0E1E9EC9,
			            0xDB73DBD3, 0x105588CD, 0x675FDA79, 0xE3674340,
			            0xC5C43465, 0x713E38D8, 0x3D28F89E, 0xF16DFF20,
			            0x153E21E7, 0x8FB03D4A, 0xE6E39F2B, 0xDB83ADF7   ],
			        [   0xE93D5A68, 0x948140F7, 0xF64C261C, 0x94692934,
			            0x411520F7, 0x7602D4F7, 0xBCF46B2E, 0xD4A20068,
			            0xD4082471, 0x3320F46A, 0x43B7D4B7, 0x500061AF,
			            0x1E39F62E, 0x97244546, 0x14214F74, 0xBF8B8840,
			            0x4D95FC1D, 0x96B591AF, 0x70F4DDD3, 0x66A02F45,
			            0xBFBC09EC, 0x03BD9785, 0x7FAC6DD0, 0x31CB8504,
			            0x96EB27B3, 0x55FD3941, 0xDA2547E6, 0xABCA0A9A,
			            0x28507825, 0x530429F4, 0x0A2C86DA, 0xE9B66DFB,
			            0x68DC1462, 0xD7486900, 0x680EC0A4, 0x27A18DEE,
			            0x4F3FFEA2, 0xE887AD8C, 0xB58CE006, 0x7AF4D6B6,
			            0xAACE1E7C, 0xD3375FEC, 0xCE78A399, 0x406B2A42,
			            0x20FE9E35, 0xD9F385B9, 0xEE39D7AB, 0x3B124E8B,
			            0x1DC9FAF7, 0x4B6D1856, 0x26A36631, 0xEAE397B2,
			            0x3A6EFA74, 0xDD5B4332, 0x6841E7F7, 0xCA7820FB,
			            0xFB0AF54E, 0xD8FEB397, 0x454056AC, 0xBA489527,
			            0x55533A3A, 0x20838D87, 0xFE6BA9B7, 0xD096954B,
			            0x55A867BC, 0xA1159A58, 0xCCA92963, 0x99E1DB33,
			            0xA62A4A56, 0x3F3125F9, 0x5EF47E1C, 0x9029317C,
			            0xFDF8E802, 0x04272F70, 0x80BB155C, 0x05282CE3,
			            0x95C11548, 0xE4C66D22, 0x48C1133F, 0xC70F86DC,
			            0x07F9C9EE, 0x41041F0F, 0x404779A4, 0x5D886E17,
			            0x325F51EB, 0xD59BC0D1, 0xF2BCC18F, 0x41113564,
			            0x257B7834, 0x602A9C60, 0xDFF8E8A3, 0x1F636C1B,
			            0x0E12B4C2, 0x02E1329E, 0xAF664FD1, 0xCAD18115,
			            0x6B2395E0, 0x333E92E1, 0x3B240B62, 0xEEBEB922,
			            0x85B2A20E, 0xE6BA0D99, 0xDE720C8C, 0x2DA2F728,
			            0xD0127845, 0x95B794FD, 0x647D0862, 0xE7CCF5F0,
			            0x5449A36F, 0x877D48FA, 0xC39DFD27, 0xF33E8D1E,
			            0x0A476341, 0x992EFF74, 0x3A6F6EAB, 0xF4F8FD37,
			            0xA812DC60, 0xA1EBDDF8, 0x991BE14C, 0xDB6E6B0D,
			            0xC67B5510, 0x6D672C37, 0x2765D43B, 0xDCD0E804,
			            0xF1290DC7, 0xCC00FFA3, 0xB5390F92, 0x690FED0B,
			            0x667B9FFB, 0xCEDB7D9C, 0xA091CF0B, 0xD9155EA3,
			            0xBB132F88, 0x515BAD24, 0x7B9479BF, 0x763BD6EB,
			            0x37392EB3, 0xCC115979, 0x8026E297, 0xF42E312D,
			            0x6842ADA7, 0xC66A2B3B, 0x12754CCC, 0x782EF11C,
			            0x6A124237, 0xB79251E7, 0x06A1BBE6, 0x4BFB6350,
			            0x1A6B1018, 0x11CAEDFA, 0x3D25BDD8, 0xE2E1C3C9,
			            0x44421659, 0x0A121386, 0xD90CEC6E, 0xD5ABEA2A,
			            0x64AF674E, 0xDA86A85F, 0xBEBFE988, 0x64E4C3FE,
			            0x9DBC8057, 0xF0F7C086, 0x60787BF8, 0x6003604D,
			            0xD1FD8346, 0xF6381FB0, 0x7745AE04, 0xD736FCCC,
			            0x83426B33, 0xF01EAB71, 0xB0804187, 0x3C005E5F,
			            0x77A057BE, 0xBDE8AE24, 0x55464299, 0xBF582E61,
			            0x4E58F48F, 0xF2DDFDA2, 0xF474EF38, 0x8789BDC2,
			            0x5366F9C3, 0xC8B38E74, 0xB475F255, 0x46FCD9B9,
			            0x7AEB2661, 0x8B1DDF84, 0x846A0E79, 0x915F95E2,
			            0x466E598E, 0x20B45770, 0x8CD55591, 0xC902DE4C,
			            0xB90BACE1, 0xBB8205D0, 0x11A86248, 0x7574A99E,
			            0xB77F19B6, 0xE0A9DC09, 0x662D09A1, 0xC4324633,
			            0xE85A1F02, 0x09F0BE8C, 0x4A99A025, 0x1D6EFE10,
			            0x1AB93D1D, 0x0BA5A4DF, 0xA186F20F, 0x2868F169,
			            0xDCB7DA83, 0x573906FE, 0xA1E2CE9B, 0x4FCD7F52,
			            0x50115E01, 0xA70683FA, 0xA002B5C4, 0x0DE6D027,
			            0x9AF88C27, 0x773F8641, 0xC3604C06, 0x61A806B5,
			            0xF0177A28, 0xC0F586E0, 0x006058AA, 0x30DC7D62,
			            0x11E69ED7, 0x2338EA63, 0x53C2DD94, 0xC2C21634,
			            0xBBCBEE56, 0x90BCB6DE, 0xEBFC7DA1, 0xCE591D76,
			            0x6F05E409, 0x4B7C0188, 0x39720A3D, 0x7C927C24,
			            0x86E3725F, 0x724D9DB9, 0x1AC15BB4, 0xD39EB8FC,
			            0xED545578, 0x08FCA5B5, 0xD83D7CD3, 0x4DAD0FC4,
			            0x1E50EF5E, 0xB161E6F8, 0xA28514D9, 0x6C51133C,
			            0x6FD5C7E7, 0x56E14EC4, 0x362ABFCE, 0xDDC6C837,
			            0xD79A3234, 0x92638212, 0x670EFA8E, 0x406000E0  ],
			        [   0x3A39CE37, 0xD3FAF5CF, 0xABC27737, 0x5AC52D1B,
			            0x5CB0679E, 0x4FA33742, 0xD3822740, 0x99BC9BBE,
			            0xD5118E9D, 0xBF0F7315, 0xD62D1C7E, 0xC700C47B,
			            0xB78C1B6B, 0x21A19045, 0xB26EB1BE, 0x6A366EB4,
			            0x5748AB2F, 0xBC946E79, 0xC6A376D2, 0x6549C2C8,
			            0x530FF8EE, 0x468DDE7D, 0xD5730A1D, 0x4CD04DC6,
			            0x2939BBDB, 0xA9BA4650, 0xAC9526E8, 0xBE5EE304,
			            0xA1FAD5F0, 0x6A2D519A, 0x63EF8CE2, 0x9A86EE22,
			            0xC089C2B8, 0x43242EF6, 0xA51E03AA, 0x9CF2D0A4,
			            0x83C061BA, 0x9BE96A4D, 0x8FE51550, 0xBA645BD6,
			            0x2826A2F9, 0xA73A3AE1, 0x4BA99586, 0xEF5562E9,
			            0xC72FEFD3, 0xF752F7DA, 0x3F046F69, 0x77FA0A59,
			            0x80E4A915, 0x87B08601, 0x9B09E6AD, 0x3B3EE593,
			            0xE990FD5A, 0x9E34D797, 0x2CF0B7D9, 0x022B8B51,
			            0x96D5AC3A, 0x017DA67D, 0xD1CF3ED6, 0x7C7D2D28,
			            0x1F9F25CF, 0xADF2B89B, 0x5AD6B472, 0x5A88F54C,
			            0xE029AC71, 0xE019A5E6, 0x47B0ACFD, 0xED93FA9B,
			            0xE8D3C48D, 0x283B57CC, 0xF8D56629, 0x79132E28,
			            0x785F0191, 0xED756055, 0xF7960E44, 0xE3D35E8C,
			            0x15056DD4, 0x88F46DBA, 0x03A16125, 0x0564F0BD,
			            0xC3EB9E15, 0x3C9057A2, 0x97271AEC, 0xA93A072A,
			            0x1B3F6D9B, 0x1E6321F5, 0xF59C66FB, 0x26DCF319,
			            0x7533D928, 0xB155FDF5, 0x03563482, 0x8ABA3CBB,
			            0x28517711, 0xC20AD9F8, 0xABCC5167, 0xCCAD925F,
			            0x4DE81751, 0x3830DC8E, 0x379D5862, 0x9320F991,
			            0xEA7A90C2, 0xFB3E7BCE, 0x5121CE64, 0x774FBE32,
			            0xA8B6E37E, 0xC3293D46, 0x48DE5369, 0x6413E680,
			            0xA2AE0810, 0xDD6DB224, 0x69852DFD, 0x09072166,
			            0xB39A460A, 0x6445C0DD, 0x586CDECF, 0x1C20C8AE,
			            0x5BBEF7DD, 0x1B588D40, 0xCCD2017F, 0x6BB4E3BB,
			            0xDDA26A7E, 0x3A59FF45, 0x3E350A44, 0xBCB4CDD5,
			            0x72EACEA8, 0xFA6484BB, 0x8D6612AE, 0xBF3C6F47,
			            0xD29BE463, 0x542F5D9E, 0xAEC2771B, 0xF64E6370,
			            0x740E0D8D, 0xE75B1357, 0xF8721671, 0xAF537D5D,
			            0x4040CB08, 0x4EB4E2CC, 0x34D2466A, 0x0115AF84,
			            0xE1B00428, 0x95983A1D, 0x06B89FB4, 0xCE6EA048,
			            0x6F3F3B82, 0x3520AB82, 0x011A1D4B, 0x277227F8,
			            0x611560B1, 0xE7933FDC, 0xBB3A792B, 0x344525BD,
			            0xA08839E1, 0x51CE794B, 0x2F32C9B7, 0xA01FBAC9,
			            0xE01CC87E, 0xBCC7D1F6, 0xCF0111C3, 0xA1E8AAC7,
			            0x1A908749, 0xD44FBD9A, 0xD0DADECB, 0xD50ADA38,
			            0x0339C32A, 0xC6913667, 0x8DF9317C, 0xE0B12B4F,
			            0xF79E59B7, 0x43F5BB3A, 0xF2D519FF, 0x27D9459C,
			            0xBF97222C, 0x15E6FC2A, 0x0F91FC71, 0x9B941525,
			            0xFAE59361, 0xCEB69CEB, 0xC2A86459, 0x12BAA8D1,
			            0xB6C1075E, 0xE3056A0C, 0x10D25065, 0xCB03A442,
			            0xE0EC6E0E, 0x1698DB3B, 0x4C98A0BE, 0x3278E964,
			            0x9F1F9532, 0xE0D392DF, 0xD3A0342B, 0x8971F21E,
			            0x1B0A7441, 0x4BA3348C, 0xC5BE7120, 0xC37632D8,
			            0xDF359F8D, 0x9B992F2E, 0xE60B6F47, 0x0FE3F11D,
			            0xE54CDA54, 0x1EDAD891, 0xCE6279CF, 0xCD3E7E6F,
			            0x1618B166, 0xFD2C1D05, 0x848FD2C5, 0xF6FB2299,
			            0xF523F357, 0xA6327623, 0x93A83531, 0x56CCCD02,
			            0xACF08162, 0x5A75EBB5, 0x6E163697, 0x88D273CC,
			            0xDE966292, 0x81B949D0, 0x4C50901B, 0x71C65614,
			            0xE6C6C7BD, 0x327A140A, 0x45E1D006, 0xC3F27B9A,
			            0xC9AA53FD, 0x62A80F00, 0xBB25BFE2, 0x35BDD2F6,
			            0x71126905, 0xB2040222, 0xB6CBCF7C, 0xCD769C2B,
			            0x53113EC0, 0x1640E3D3, 0x38ABBD60, 0x2547ADF0,
			            0xBA38209C, 0xF746CE76, 0x77AFA1C5, 0x20756060,
			            0x85CBFE4E, 0x8AE88DD8, 0x7AAAF9B0, 0x4CF9AA7E,
			            0x1948C25C, 0x02FB8A8C, 0x01C36AE4, 0xD6EBE1F9,
			            0x90D4F869, 0xA65CDEA0, 0x3F09252D, 0xC208E69F,
			            0xB74E6132, 0xCE77E25B, 0x578FDFE3, 0x3AC372E6  ]
			    ];

			    var BLOWFISH_CTX = {
			        pbox: [],
			        sbox: []
			    };

			    function F(ctx, x){
			        let a = (x >> 24) & 0xFF;
			        let b = (x >> 16) & 0xFF;
			        let c = (x >> 8) & 0xFF;
			        let d = x & 0xFF;

			        let y = ctx.sbox[0][a] + ctx.sbox[1][b];
			        y = y ^ ctx.sbox[2][c];
			        y = y + ctx.sbox[3][d];

			        return y;
			    }

			    function BlowFish_Encrypt(ctx, left, right){
			        let Xl = left;
			        let Xr = right;
			        let temp;

			        for(let i = 0; i < N; ++i){
			            Xl = Xl ^ ctx.pbox[i];
			            Xr = F(ctx, Xl) ^ Xr;

			            temp = Xl;
			            Xl = Xr;
			            Xr = temp;
			        }

			        temp = Xl;
			        Xl = Xr;
			        Xr = temp;

			        Xr = Xr ^ ctx.pbox[N];
			        Xl = Xl ^ ctx.pbox[N + 1];

			        return {left: Xl, right: Xr};
			    }

			    function BlowFish_Decrypt(ctx, left, right){
			        let Xl = left;
			        let Xr = right;
			        let temp;

			        for(let i = N + 1; i > 1; --i){
			            Xl = Xl ^ ctx.pbox[i];
			            Xr = F(ctx, Xl) ^ Xr;

			            temp = Xl;
			            Xl = Xr;
			            Xr = temp;
			        }

			        temp = Xl;
			        Xl = Xr;
			        Xr = temp;

			        Xr = Xr ^ ctx.pbox[1];
			        Xl = Xl ^ ctx.pbox[0];

			        return {left: Xl, right: Xr};
			    }

			    /**
			     * Initialization ctx's pbox and sbox.
			     *
			     * @param {Object} ctx The object has pbox and sbox.
			     * @param {Array} key An array of 32-bit words.
			     * @param {int} keysize The length of the key.
			     *
			     * @example
			     *
			     *     BlowFishInit(BLOWFISH_CTX, key, 128/32);
			     */
			    function BlowFishInit(ctx, key, keysize)
			    {
			        for(let Row = 0; Row < 4; Row++)
			        {
			            ctx.sbox[Row] = [];
			            for(let Col = 0; Col < 256; Col++)
			            {
			                ctx.sbox[Row][Col] = ORIG_S[Row][Col];
			            }
			        }

			        let keyIndex = 0;
			        for(let index = 0; index < N + 2; index++)
			        {
			            ctx.pbox[index] = ORIG_P[index] ^ key[keyIndex];
			            keyIndex++;
			            if(keyIndex >= keysize)
			            {
			                keyIndex = 0;
			            }
			        }

			        let Data1 = 0;
			        let Data2 = 0;
			        let res = 0;
			        for(let i = 0; i < N + 2; i += 2)
			        {
			            res = BlowFish_Encrypt(ctx, Data1, Data2);
			            Data1 = res.left;
			            Data2 = res.right;
			            ctx.pbox[i] = Data1;
			            ctx.pbox[i + 1] = Data2;
			        }

			        for(let i = 0; i < 4; i++)
			        {
			            for(let j = 0; j < 256; j += 2)
			            {
			                res = BlowFish_Encrypt(ctx, Data1, Data2);
			                Data1 = res.left;
			                Data2 = res.right;
			                ctx.sbox[i][j] = Data1;
			                ctx.sbox[i][j + 1] = Data2;
			            }
			        }

			        return true;
			    }

			    /**
			     * Blowfish block cipher algorithm.
			     */
			    var Blowfish = C_algo.Blowfish = BlockCipher.extend({
			        _doReset: function () {
			            // Skip reset of nRounds has been set before and key did not change
			            if (this._keyPriorReset === this._key) {
			                return;
			            }

			            // Shortcuts
			            var key = this._keyPriorReset = this._key;
			            var keyWords = key.words;
			            var keySize = key.sigBytes / 4;

			            //Initialization pbox and sbox
			            BlowFishInit(BLOWFISH_CTX, keyWords, keySize);
			        },

			        encryptBlock: function (M, offset) {
			            var res = BlowFish_Encrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
			            M[offset] = res.left;
			            M[offset + 1] = res.right;
			        },

			        decryptBlock: function (M, offset) {
			            var res = BlowFish_Decrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
			            M[offset] = res.left;
			            M[offset + 1] = res.right;
			        },

			        blockSize: 64/32,

			        keySize: 128/32,

			        ivSize: 64/32
			    });

			    /**
			     * Shortcut functions to the cipher's object interface.
			     *
			     * @example
			     *
			     *     var ciphertext = CryptoJS.Blowfish.encrypt(message, key, cfg);
			     *     var plaintext  = CryptoJS.Blowfish.decrypt(ciphertext, key, cfg);
			     */
			    C.Blowfish = BlockCipher._createHelper(Blowfish);
			}());


			return CryptoJS.Blowfish;

		})); 
	} (blowfish$1));
	return blowfish$1.exports;
}

var cryptoJs = cryptoJs$1.exports;

var hasRequiredCryptoJs;

function requireCryptoJs () {
	if (hasRequiredCryptoJs) return cryptoJs$1.exports;
	hasRequiredCryptoJs = 1;
	(function (module, exports) {
(function (root, factory, undef) {
			{
				// CommonJS
				module.exports = factory(/*@__PURE__*/ requireCore(), /*@__PURE__*/ requireX64Core(), /*@__PURE__*/ requireLibTypedarrays(), /*@__PURE__*/ requireEncUtf16(), /*@__PURE__*/ requireEncBase64(), /*@__PURE__*/ requireEncBase64url(), /*@__PURE__*/ requireMd5(), /*@__PURE__*/ requireSha1(), /*@__PURE__*/ requireSha256(), /*@__PURE__*/ requireSha224(), /*@__PURE__*/ requireSha512(), /*@__PURE__*/ requireSha384(), /*@__PURE__*/ requireSha3(), /*@__PURE__*/ requireRipemd160(), /*@__PURE__*/ requireHmac(), /*@__PURE__*/ requirePbkdf2(), /*@__PURE__*/ requireEvpkdf(), /*@__PURE__*/ requireCipherCore(), /*@__PURE__*/ requireModeCfb(), /*@__PURE__*/ requireModeCtr(), /*@__PURE__*/ requireModeCtrGladman(), /*@__PURE__*/ requireModeOfb(), /*@__PURE__*/ requireModeEcb(), /*@__PURE__*/ requirePadAnsix923(), /*@__PURE__*/ requirePadIso10126(), /*@__PURE__*/ requirePadIso97971(), /*@__PURE__*/ requirePadZeropadding(), /*@__PURE__*/ requirePadNopadding(), /*@__PURE__*/ requireFormatHex(), /*@__PURE__*/ requireAes(), /*@__PURE__*/ requireTripledes(), /*@__PURE__*/ requireRc4(), /*@__PURE__*/ requireRabbit(), /*@__PURE__*/ requireRabbitLegacy(), /*@__PURE__*/ requireBlowfish());
			}
		}(cryptoJs, function (CryptoJS) {

			return CryptoJS;

		})); 
	} (cryptoJs$1));
	return cryptoJs$1.exports;
}

var cryptoJsExports = /*@__PURE__*/ requireCryptoJs();

let allCardsExt = [];
const setCards = (cards) => {
  allCardsExt = cards;
};

const {Button: Button$5,Chip,Dropdown: Dropdown$1,DropdownItem: DropdownItem$1,DropdownMenu: DropdownMenu$1,DropdownTrigger: DropdownTrigger$1} = await importShared('@heroui/react');

const {Divider: Divider$1} = await importShared('antd');

const {isEmpty: isEmpty$2} = await importShared('lodash');

const {useCallback: useCallback$2,useEffect: useEffect$4,useState: useState$5} = await importShared('react');
function Venv_Associate({ pythonPath }) {
  const [associated, setAssociated] = useState$5([]);
  const [itemsToAdd, setItemsToAdd] = useState$5([]);
  const installedCards = useCardsState("installedCards");
  useEffect$4(() => {
    if (pythonPath) getAssociated();
  }, [pythonPath]);
  const getAssociated = useCallback$2(() => {
    pIpc.getAIVenvs().then((aiVenvs) => {
      if (!aiVenvs) return;
      const cardTitleMap = new Map(allCardsExt.map((card) => [card.id, card.title]));
      const installedCardsWithTitles = installedCards.filter((card) => cardTitleMap.has(card.id)).map((card) => ({
        title: cardTitleMap.get(card.id),
        id: card.id
      }));
      const aiVenvIds = new Set(aiVenvs.map((aiVenv) => aiVenv.id));
      const newItemsToAdd = installedCardsWithTitles.filter(
        (card) => !aiVenvIds.has(card.id) && PYTHON_SUPPORTED_AI.includes(card.id)
      );
      setItemsToAdd(newItemsToAdd);
      const activeAiVenvsWithTitles = aiVenvs.filter((aiVenv) => aiVenv.path === pythonPath && installedCards.some((card) => card.id === aiVenv.id)).map((aiVenv) => ({
        title: cardTitleMap.get(aiVenv.id),
        id: aiVenv.id
      }));
      setAssociated(activeAiVenvsWithTitles);
    });
  }, [pythonPath, installedCards]);
  const add = (id) => {
    pIpc.addAIVenv(id, pythonPath);
    getAssociated();
  };
  const remove = (id) => {
    pIpc.removeAIVenv(id);
    getAssociated();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider$1, { variant: "dashed", className: "!my-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row items-center gap-x-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-small font-bold", children: "Associated AI" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row justify-between w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full flex flex-row gap-x-1 gap-y-2 items-center flex-wrap", children: isEmpty$2(associated) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "sm", radius: "sm", variant: "dot", color: "default", className: "animate-appearance-in", children: "Not Associated" }) : associated.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          size: "sm",
          radius: "sm",
          variant: "dot",
          color: "success",
          onClose: () => remove(item.id),
          className: "animate-appearance-in",
          children: item.title
        },
        item.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dropdown$1, { size: "sm", className: "border-1 border-foreground-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownTrigger$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$5, { size: "sm", variant: "flat", isIconOnly: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Add_Icon, {}) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenu$1, { variant: "faded", items: itemsToAdd, children: (item) => /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownItem$1, { onPress: () => add(item.id), children: item.title }, item.id) })
      ] })
    ] })
  ] });
}

const {Button: Button$4,Dropdown,DropdownItem,DropdownMenu,DropdownTrigger,Popover: Popover$1,PopoverContent: PopoverContent$1,PopoverTrigger: PopoverTrigger$1} = await importShared('@heroui/react');

const {Card: Card$1,message: message$2,Spin} = await importShared('antd');
const {isNil} = await importShared('lodash');

const {useEffect: useEffect$3,useMemo: useMemo$2,useState: useState$4} = await importShared('react');
const TITLE_STORE_KEY = "title_change_key";
function VenvCard({
  title,
  installedPackages,
  pythonVersion,
  folder,
  diskUsage,
  pythonPath,
  refresh,
  show
}) {
  const [popoverUninstaller, setPopoverUninstaller] = useState$4(false);
  const [editedTitle, setEditedTitle] = useState$4(title);
  useEffect$3(() => {
    const storedItems = JSON.parse(localStorage.getItem(TITLE_STORE_KEY) || "[]");
    const existingTitle = storedItems.find((item) => item.path === cryptoJsExports.SHA256(folder).toString());
    if (existingTitle) setEditedTitle(existingTitle.title);
  }, [folder]);
  const size = useMemo$2(() => {
    return diskUsage.find((usage) => usage.path === folder)?.value;
  }, [diskUsage]);
  const [isRemoving, setIsRemoving] = useState$4(false);
  const remove = () => {
    setPopoverUninstaller(false);
    setIsRemoving(true);
    rendererIpc.file.trashDir(folder).then(() => {
      message$2.success(`Environment "${title}" removed successfully.`);
      pIpc.removeAIVenvPath(pythonPath);
      refresh();
    }).catch((error) => {
      console.error(error);
      message$2.error(`Failed to remove environment "${title}".`);
    }).finally(() => {
      setIsRemoving(false);
    });
  };
  const openPath = () => {
    rendererIpc.file.openPath(folder);
  };
  const onTitleChange = (event) => {
    const textContent = event.currentTarget.textContent || "";
    const storedItems = JSON.parse(localStorage.getItem(TITLE_STORE_KEY) || "[]");
    const existingIndex = storedItems.findIndex((item) => item.path === cryptoJsExports.SHA256(folder).toString());
    if (existingIndex > -1) {
      storedItems[existingIndex].title = textContent;
    } else {
      storedItems.push({ path: cryptoJsExports.SHA256(folder).toString(), title: textContent });
    }
    localStorage.setItem(TITLE_STORE_KEY, JSON.stringify(storedItems));
  };
  const [packageManagerOpen, setPackageManagerOpen] = useState$4(false);
  const packageManager = () => {
    setPackageManagerOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PackageManagerModal,
      {
        size: "3xl",
        show,
        id: pythonPath,
        pythonPath,
        isOpen: packageManagerOpen,
        setIsOpen: setPackageManagerOpen
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card$1,
      {
        className: `min-w-[27rem] grow transition-colors duration-300 shadow-small dark:hover:border-white/20 hover:border-black/20`,
        title: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col my-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Env_Icon, { className: "size-[1.2rem]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "pr-7",
                  spellCheck: false,
                  onInput: onTitleChange,
                  contentEditable: true,
                  suppressContentEditableWarning: true,
                  children: editedTitle
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-tiny text-foreground-500", children: [
              "Python ",
              pythonVersion
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-x-2 flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Dropdown, { className: "dark:bg-LynxRaisinBlack", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$4, { size: "sm", variant: "light", isIconOnly: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuDots_Icon, { className: "rotate-90 size-3.5" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenu, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                DropdownItem,
                {
                  onPress: packageManager,
                  startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Packages_Icon, { className: "size-4" }),
                  children: "Package Manager"
                },
                "package-manager"
              ) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Popover$1,
              {
                size: "sm",
                color: "danger",
                placement: "left",
                className: "max-w-[15rem]",
                isOpen: popoverUninstaller,
                onOpenChange: setPopoverUninstaller,
                showArrow: true,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$4, { size: "sm", color: "danger", variant: "light", isLoading: isRemoving, isIconOnly: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash_Icon, { className: "size-[50%]" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `Permanently delete '${title}' and all its contents? This action cannot be undone.` }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button$4, { size: "sm", onPress: remove, fullWidth: true, children: "Yes, Delete" })
                  ] }) })
                ]
              }
            )
          ] })
        ] }),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gap-y-4 flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button$4, { size: "sm", variant: "light", onPress: openPath, className: "flex flex-row justify-start -ml-3 -mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(OpenFolder_Icon, { className: "flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: folder })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full justify-between flex flex-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-x-1 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Packages_Icon, { className: "size-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Installed Packages:" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: installedPackages })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full justify-between flex flex-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-x-1 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive_Icon, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Disk Usage:" })
            ] }),
            isNil(size) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Spin, { size: "small" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatSizeMB(size || 0) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Venv_Associate, { pythonPath })
        ] })
      }
    )
  ] });
}

const {Button: Button$3,Divider,Input,Popover,PopoverContent,PopoverTrigger,Select,SelectItem} = await importShared('@heroui/react');

const {message: message$1} = await importShared('antd');

const {capitalize,isEmpty: isEmpty$1} = await importShared('lodash');

const {useCallback: useCallback$1,useEffect: useEffect$2,useMemo: useMemo$1,useState: useState$3} = await importShared('react');
function VenvCreator({ installedPythons, refresh, isLoadingPythons }) {
  const [selectedVersion, setSelectedVersion] = useState$3(/* @__PURE__ */ new Set([""]));
  const [targetFolder, setTargetFolder] = useState$3("");
  const [envName, setEnvName] = useState$3("");
  const [isCreating, setIsCreating] = useState$3(false);
  const [isOpen, setIsOpen] = useState$3(false);
  useEffect$2(() => {
    if (!isOpen) {
      setTargetFolder("");
      setEnvName("");
    }
  }, [isOpen]);
  const disabledCreate = useMemo$1(() => {
    return isEmpty$1(targetFolder) || isEmpty$1(envName) || isEmpty$1(selectedVersion);
  }, [targetFolder, envName, selectedVersion]);
  const selectFolder = useCallback$1(() => {
    rendererIpc.file.openDlg({ properties: ["openDirectory"] }).then((folder) => {
      setTargetFolder(folder || "");
    });
  }, []);
  useEffect$2(() => {
    if (!isEmpty$1(installedPythons)) setSelectedVersion(/* @__PURE__ */ new Set([installedPythons[0].version]));
  }, [installedPythons]);
  const createEnv = useCallback$1(() => {
    setIsCreating(true);
    const pythonPath = installedPythons.find(
      (item) => item.version === selectedVersion.values().next().value
    )?.installPath;
    if (!pythonPath) {
      setIsCreating(false);
      message$1.error("Failed to find Python path. Please restart app and try again.");
      return;
    }
    const options = {
      destinationFolder: targetFolder,
      venvName: envName,
      pythonPath
    };
    pIpc.createVenv(options).then((result) => {
      if (result) {
        refresh();
        setIsOpen(false);
        message$1.success(`Python environment "${envName}" created successfully.`);
      } else {
        message$1.error("Failed to create Python environment. Please try again.");
      }
      setIsCreating(false);
    });
  }, [targetFolder, envName, selectedVersion, installedPythons]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { size: "lg", isOpen, placement: "bottom", onOpenChange: setIsOpen, showArrow: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button$3,
      {
        radius: "sm",
        variant: "solid",
        isLoading: isLoadingPythons,
        isDisabled: isEmpty$1(installedPythons),
        startContent: !isLoadingPythons && /* @__PURE__ */ jsxRuntimeExports.jsx(Add_Icon, {}),
        children: isLoadingPythons ? "Loading Pythons..." : "New Environment"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { children: (titleProps) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 pb-2 px-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", ...titleProps, children: "Create New Virtual Environment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            size: "sm",
            value: envName,
            spellCheck: "false",
            label: "Environment Name",
            onValueChange: setEnvName,
            placeholder: "e.g., my_env"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Select,
          {
            size: "sm",
            variant: "faded",
            label: "Python Version",
            selectionMode: "single",
            items: installedPythons,
            selectedKeys: selectedVersion,
            placeholder: "Choose a version...",
            onSelectionChange: setSelectedVersion,
            children: (item) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { children: `${item.version} | ${capitalize(item.installationType)} ${item.installationType === "conda" ? `| ${item.condaName}` : ""}` }, item.version)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$3,
          {
            size: "sm",
            variant: "faded",
            onPress: selectFolder,
            className: "justify-between",
            endContent: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuDots_Icon, {}),
            startContent: /* @__PURE__ */ jsxRuntimeExports.jsx(OpenFolder_Icon, {}),
            children: targetFolder || "Choose Destination Folder"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$3,
          {
            size: "sm",
            variant: "flat",
            color: "success",
            onPress: createEnv,
            isLoading: isCreating,
            isDisabled: disabledCreate,
            children: "Create Environment"
          }
        )
      ] })
    ] }) })
  ] });
}

const {Button: Button$2,Spinner} = await importShared('@heroui/react');

const {Empty,message} = await importShared('antd');

const {isEmpty} = await importShared('lodash');

const {useCallback,useEffect: useEffect$1,useState: useState$2} = await importShared('react');
function Venv({ visible, installedPythons, isLoadingPythons, show }) {
  const [pythonVenvs, setPythonVenvs] = useState$2([]);
  const [isLoading, setIsLoading] = useState$2(true);
  const [isLocating, setIsLocating] = useState$2(false);
  const [diskUsage, setDiskUsage] = useState$2([]);
  const getVenvs = useCallback(() => {
    setIsLoading(true);
    const condaVenvs = installedPythons.filter((pt) => pt.installationType === "conda");
    pIpc.getVenvs().then((venvs) => {
      const resultVenvs = [
        ...venvs,
        ...condaVenvs.map((venv) => {
          return {
            pythonVersion: venv.version,
            pythonPath: venv.installPath,
            folder: venv.installFolder,
            sitePackagesCount: venv.packages,
            name: venv.condaName
          };
        })
      ];
      setPythonVenvs(
        resultVenvs.map((venv) => {
          return {
            pythonVersion: venv.pythonVersion,
            pythonPath: venv.pythonPath,
            title: venv.name,
            installedPackages: venv.sitePackagesCount,
            folder: venv.folder
          };
        })
      );
      for (const venv of resultVenvs) {
        rendererIpc.file.calcFolderSize(venv.folder).then((value) => {
          if (value)
            setDiskUsage((prevState) => [
              ...prevState,
              {
                path: venv.folder,
                value: bytesToMegabytes(value)
              }
            ]);
        });
      }
      setIsLoading(false);
    });
  }, [installedPythons]);
  useEffect$1(() => {
    if (!isEmpty(installedPythons)) getVenvs();
  }, [installedPythons]);
  const locateVenv = () => {
    setIsLocating(true);
    pIpc.locateVenv().then((isLocated) => {
      if (isLocated) {
        message.success("Environment validated successfully.");
        getVenvs();
      } else {
        message.error("Failed to validate environment.");
      }
      setIsLocating(false);
    });
  };
  if (!visible) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex flex-col gap-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex flex-row justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Virtual Environments" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gap-x-2 flex flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(VenvCreator, { refresh: getVenvs, installedPythons, isLoadingPythons }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$2,
          {
            radius: "sm",
            variant: "flat",
            onPress: locateVenv,
            isLoading: isLocating,
            startContent: !isLocating && /* @__PURE__ */ jsxRuntimeExports.jsx(OpenFolder_Icon, {}),
            children: !isLocating && "Locate"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center flex-row flex-wrap gap-8", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Spinner,
      {
        size: "lg",
        label: "Reading and validating venvs, please wait...",
        classNames: { circle2: "border-b-[#ffe66e]", circle1: "border-b-[#ffe66e] " }
      }
    ) : isEmpty(pythonVenvs) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { className: "my-2", description: "No Environments Yet", children: "Create a new environment or locate an existing one to get started." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: pythonVenvs.map((venv, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      VenvCard,
      {
        show,
        refresh: getVenvs,
        title: venv.title,
        folder: venv.folder,
        diskUsage,
        pythonPath: venv.pythonPath,
        pythonVersion: venv.pythonVersion,
        installedPackages: venv.installedPackages
      },
      `${venv.title}_${index}_card`
    )) }) })
  ] });
}

const {Button: Button$1,Modal,ModalBody,ModalContent,ModalFooter,ModalHeader,Tab,Tabs} = await importShared('@heroui/react');

const {useState: useState$1} = await importShared('react');
function PythonToolkitModal({ isOpen, setIsOpen, show }) {
  const [installedPythons, setInstalledPythons] = useState$1([]);
  const [isLoadingPythons, setIsLoadingPythons] = useState$1(false);
  const [currentTab, setCurrentTab] = useState$1("installation");
  const onClose = () => {
    setIsOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      isOpen,
      backdrop: "blur",
      onClose,
      placement: "center",
      isDismissable: false,
      scrollBehavior: "inside",
      className: "max-w-[90%]",
      motionProps: modalMotionProps,
      classNames: { backdrop: `!top-10 ${show}`, wrapper: `!top-10 pb-8 ${show}` },
      hideCloseButton: true,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalContent, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ModalHeader, { className: "bg-foreground-100 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Tabs,
          {
            color: "primary",
            onSelectionChange: setCurrentTab,
            selectedKey: currentTab.toString(),
            classNames: { tabList: "bg-foreground-200" },
            fullWidth: true,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { title: "Installations" }, "installation"),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { title: "Virtual Environments" }, "venv")
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalBody, { className: "scrollbar-hide mb-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            InstalledPythons,
            {
              show,
              installedPythons,
              isLoadingPythons,
              visible: currentTab === "installation",
              setIsLoadingPythons,
              setInstalledPythons
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Venv,
            {
              show,
              visible: currentTab === "venv",
              installedPythons,
              isLoadingPythons
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ModalFooter, { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button$1, { variant: "light", color: "warning", onPress: onClose, className: "cursor-default", children: "Close" }) })
      ] })
    }
  );
}

const {Button,Card,Image} = await importShared('@heroui/react');

const {useEffect,useMemo,useState} = await importShared('react');

const {useDispatch} = await importShared('react-redux');
const title = "Python Toolkit";
const desc = "Manage Python versions, virtual environments, packages, requirements files, and more.";
const iconUrl = "https://raw.githubusercontent.com/KindaBrazy/LynxHub-Python-Toolkit/refs/heads/source_ea/Icon.png";
function ToolsPage() {
  const dispatch = useDispatch();
  const activeTab = useTabsState("activeTab");
  const tabs = useTabsState("tabs");
  const [prevTabTitle, setPrevTabTitle] = useState(tabs.find((tab) => tab.id === activeTab)?.title);
  const [isOpen, setIsOpen] = useState(false);
  const [tabID, setTabID] = useState("");
  const iconSrc = useCacheImage("python-toolkit-icon", iconUrl);
  useEffect(() => {
    if (isOpen && tabID === activeTab) dispatch(tabsActions.setTabTitle({ tabID, title }));
  }, [activeTab, tabID, isOpen]);
  useEffect(() => {
    if (!tabs.find((tab) => tab.id === activeTab)) {
      setIsOpen(false);
    }
  }, [tabs, activeTab]);
  useEffect(() => {
    if (!isOpen && prevTabTitle) dispatch(tabsActions.setActiveTabTitle(prevTabTitle));
  }, [isOpen]);
  const openModal = () => {
    setIsOpen(true);
    setTabID(activeTab);
    setPrevTabTitle(tabs.find((tab) => tab.id === activeTab)?.title);
    dispatch(tabsActions.setActiveTabTitle(title));
  };
  const show = useMemo(() => activeTab === tabID ? "flex" : "hidden", [activeTab, tabID]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(UIProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: "w-[276px] h-[367px] relative group transform cursor-default border-1 border-foreground/10 transition-all duration-300 hover:-translate-y-1 shadow-small hover:shadow-medium",
        as: "div",
        isPressable: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-2xl bg-white dark:bg-stone-900" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full flex flex-col justify-between p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex justify-center", children: iconSrc && /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { radius: "none", src: iconSrc, className: "size-20" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold tracking-tight", children: title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm leading-relaxed", children: desc })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { radius: "full", color: "primary", onPress: openModal, fullWidth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play_Icon, { className: "size-4" }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-2xl border border-white/20 pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PythonToolkitModal, { show, isOpen, setIsOpen })
  ] });
}

function InitialExtensions(lynxAPI) {
  setCards(lynxAPI.modulesData?.allCards || []);
  lynxAPI.addReducer([{ name: "pythonToolkit", reducer: pythonToolkitReducer$1 }]);
  lynxAPI.addModal(CardMenuModal);
  lynxAPI.customizePages.tools.addComponent(ToolsPage);
  lynxAPI.cards.customize.menu.addSection([{ index: 1, components: [CardMenu] }]);
}

export { InitialExtensions };
