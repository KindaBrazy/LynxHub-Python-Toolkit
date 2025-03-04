import { c as calcGeneratorDuration, m as maxGeneratorDuration, a as millisecondsToSeconds, s as secondsToMilliseconds, b as attachTimeline, n as noop, e as createMotionComponentFactory, f as animations, g as gestureAnimations, h as drag, l as layout, i as createDomVisualElement, j as createDOMMotionComponentProxy, k as frame, o as cancelFrame, r as resolveElements, p as progress, v as velocityPerSecond, q as interpolate, t as defaultOffset$1, u as clamp, w as frameData, x as supportsScrollTimeline, y as useConstant, z as warning, A as motionValue, B as useIsomorphicLayoutEffect, M as MotionConfigContext, C as isMotionValue, D as animateValue, E as collectMotionValues, F as hasReducedMotionListener, G as initPrefersReducedMotion, H as prefersReducedMotion, I as animateVisualElement, J as setTarget, K as isEasingArray, L as mixNumber, N as removeItem, O as isGenerator, P as fillOffset, V as VisualElement, Q as createBox, R as isSVGElement, S as SVGVisualElement, T as HTMLVisualElement, U as visualElementStore, W as animateSingleValue, X as animateTarget, Y as spring, Z as GroupPlaybackControls, _ as memo, $ as invariant, a0 as supportsLinearEasing, a1 as supportsWaapi, a2 as startWaapiAnimation, a3 as browserNumberValueTypes, a4 as getFinalKeyframe, a5 as getValueTransition$1, a6 as PresenceContext, a7 as addDomEvent, a8 as motionComponentSymbol, a9 as rootProjectionNode, aa as useForceUpdate, ab as instantAnimationState, ac as transformProps, ad as optimizedAppearDataId, ae as getOptimisedAppearId, af as makeUseVisualState, ag as LayoutGroup, ah as MotionContext, ai as moveItem, aj as easingDefinitionToFunction, ak as stepsOrder } from './index-Dl-0sUsu.js';
export { as as AcceleratedAnimation, al as AnimatePresence, aI as DeprecatedLayoutGroupContext, aH as FlatTree, aF as LayoutGroupContext, am as LazyMotion, an as MotionConfig, az as MotionGlobalConfig, aN as MotionValue, aG as SwitchLayoutGroupContext, b9 as addPointerEvent, ba as addPointerInfo, ax as addScaleCorrector, aT as anticipate, aU as backIn, aV as backInOut, aW as backOut, ay as buildTransform, b7 as calcLength, aX as circIn, aY as circInOut, aZ as circOut, aA as color, aB as complex, av as createRendererMotionComponent, a_ as cubicBezier, aJ as delay, b5 as distance, b6 as distance2D, d as domAnimation, ap as domMax, a$ as easeIn, b0 as easeInOut, b1 as easeOut, b8 as filterProps, aD as findSpring, b4 as frameSteps, aK as hover, aO as inertia, bb as isBrowser, aL as isDragActive, aw as isValidMotionProp, aP as keyframes, ao as m, b2 as mirrorEasing, aR as mix, aE as optimizedAppearDataAttribute, aS as pipe, aM as press, aC as px, ar as resolveMotionValue, b3 as reverseEasing, aQ as time, at as useIsPresent, au as usePresence, aq as useWillChange } from './index-Dl-0sUsu.js';
import { importShared } from './__federation_fn_import-DnzCM302.js';
import { j as jsxRuntimeExports } from './chunk-736YWA4T-pt2i7NVI.js';

/**
 * Create a progress => progress easing function from a generator.
 */
function createGeneratorEasing(options, scale = 100, createGenerator) {
    const generator = createGenerator({ ...options, keyframes: [0, scale] });
    const duration = Math.min(calcGeneratorDuration(generator), maxGeneratorDuration);
    return {
        type: "keyframes",
        ease: (progress) => {
            return generator.next(duration * progress).value / scale;
        },
        duration: millisecondsToSeconds(duration),
    };
}

class NativeAnimationControls {
    constructor(animation) {
        this.animation = animation;
    }
    get duration() {
        var _a, _b, _c;
        const durationInMs = ((_b = (_a = this.animation) === null || _a === undefined ? undefined : _a.effect) === null || _b === undefined ? undefined : _b.getComputedTiming().duration) ||
            ((_c = this.options) === null || _c === undefined ? undefined : _c.duration) ||
            300;
        return millisecondsToSeconds(Number(durationInMs));
    }
    get time() {
        var _a;
        if (this.animation) {
            return millisecondsToSeconds(((_a = this.animation) === null || _a === undefined ? undefined : _a.currentTime) || 0);
        }
        return 0;
    }
    set time(newTime) {
        if (this.animation) {
            this.animation.currentTime = secondsToMilliseconds(newTime);
        }
    }
    get speed() {
        return this.animation ? this.animation.playbackRate : 1;
    }
    set speed(newSpeed) {
        if (this.animation) {
            this.animation.playbackRate = newSpeed;
        }
    }
    get state() {
        return this.animation ? this.animation.playState : "finished";
    }
    get startTime() {
        return this.animation ? this.animation.startTime : null;
    }
    get finished() {
        return this.animation ? this.animation.finished : Promise.resolve();
    }
    play() {
        this.animation && this.animation.play();
    }
    pause() {
        this.animation && this.animation.pause();
    }
    stop() {
        if (!this.animation ||
            this.state === "idle" ||
            this.state === "finished") {
            return;
        }
        if (this.animation.commitStyles) {
            this.animation.commitStyles();
        }
        this.cancel();
    }
    flatten() {
        var _a;
        if (!this.animation)
            return;
        (_a = this.animation.effect) === null || _a === undefined ? undefined : _a.updateTiming({ easing: "linear" });
    }
    attachTimeline(timeline) {
        if (this.animation)
            attachTimeline(this.animation, timeline);
        return noop;
    }
    complete() {
        this.animation && this.animation.finish();
    }
    cancel() {
        try {
            this.animation && this.animation.cancel();
        }
        catch (e) { }
    }
}

const createMotionComponent = /*@__PURE__*/ createMotionComponentFactory({
    ...animations,
    ...gestureAnimations,
    ...drag,
    ...layout,
}, createDomVisualElement);

const motion = /*@__PURE__*/ createDOMMotionComponentProxy(createMotionComponent);

/**
 * @public
 */
const domMin = {
    renderer: createDomVisualElement,
    ...animations,
};

const {useInsertionEffect: useInsertionEffect$1} = await importShared('react');


function useMotionValueEvent(value, event, callback) {
    /**
     * useInsertionEffect will create subscriptions before any other
     * effects will run. Effects run upwards through the tree so it
     * can be that binding a useLayoutEffect higher up the tree can
     * miss changes from lower down the tree.
     */
    useInsertionEffect$1(() => value.on(event, callback), [value, event, callback]);
}

function observeTimeline(update, timeline) {
    let prevProgress;
    const onFrame = () => {
        const { currentTime } = timeline;
        const percentage = currentTime === null ? 0 : currentTime.value;
        const progress = percentage / 100;
        if (prevProgress !== progress) {
            update(progress);
        }
        prevProgress = progress;
    };
    frame.update(onFrame, true);
    return () => cancelFrame(onFrame);
}

const resizeHandlers = new WeakMap();
let observer;
function getElementSize(target, borderBoxSize) {
    if (borderBoxSize) {
        const { inlineSize, blockSize } = borderBoxSize[0];
        return { width: inlineSize, height: blockSize };
    }
    else if (target instanceof SVGElement && "getBBox" in target) {
        return target.getBBox();
    }
    else {
        return {
            width: target.offsetWidth,
            height: target.offsetHeight,
        };
    }
}
function notifyTarget({ target, contentRect, borderBoxSize, }) {
    var _a;
    (_a = resizeHandlers.get(target)) === null || _a === undefined ? undefined : _a.forEach((handler) => {
        handler({
            target,
            contentSize: contentRect,
            get size() {
                return getElementSize(target, borderBoxSize);
            },
        });
    });
}
function notifyAll(entries) {
    entries.forEach(notifyTarget);
}
function createResizeObserver() {
    if (typeof ResizeObserver === "undefined")
        return;
    observer = new ResizeObserver(notifyAll);
}
function resizeElement(target, handler) {
    if (!observer)
        createResizeObserver();
    const elements = resolveElements(target);
    elements.forEach((element) => {
        let elementHandlers = resizeHandlers.get(element);
        if (!elementHandlers) {
            elementHandlers = new Set();
            resizeHandlers.set(element, elementHandlers);
        }
        elementHandlers.add(handler);
        observer === null || observer === undefined ? undefined : observer.observe(element);
    });
    return () => {
        elements.forEach((element) => {
            const elementHandlers = resizeHandlers.get(element);
            elementHandlers === null || elementHandlers === undefined ? undefined : elementHandlers.delete(handler);
            if (!(elementHandlers === null || elementHandlers === undefined ? undefined : elementHandlers.size)) {
                observer === null || observer === undefined ? undefined : observer.unobserve(element);
            }
        });
    };
}

const windowCallbacks = new Set();
let windowResizeHandler;
function createWindowResizeHandler() {
    windowResizeHandler = () => {
        const size = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        const info = {
            target: window,
            size,
            contentSize: size,
        };
        windowCallbacks.forEach((callback) => callback(info));
    };
    window.addEventListener("resize", windowResizeHandler);
}
function resizeWindow(callback) {
    windowCallbacks.add(callback);
    if (!windowResizeHandler)
        createWindowResizeHandler();
    return () => {
        windowCallbacks.delete(callback);
        if (!windowCallbacks.size && windowResizeHandler) {
            windowResizeHandler = undefined;
        }
    };
}

function resize(a, b) {
    return typeof a === "function" ? resizeWindow(a) : resizeElement(a, b);
}

/**
 * A time in milliseconds, beyond which we consider the scroll velocity to be 0.
 */
const maxElapsed = 50;
const createAxisInfo = () => ({
    current: 0,
    offset: [],
    progress: 0,
    scrollLength: 0,
    targetOffset: 0,
    targetLength: 0,
    containerLength: 0,
    velocity: 0,
});
const createScrollInfo = () => ({
    time: 0,
    x: createAxisInfo(),
    y: createAxisInfo(),
});
const keys = {
    x: {
        length: "Width",
        position: "Left",
    },
    y: {
        length: "Height",
        position: "Top",
    },
};
function updateAxisInfo(element, axisName, info, time) {
    const axis = info[axisName];
    const { length, position } = keys[axisName];
    const prev = axis.current;
    const prevTime = info.time;
    axis.current = element[`scroll${position}`];
    axis.scrollLength = element[`scroll${length}`] - element[`client${length}`];
    axis.offset.length = 0;
    axis.offset[0] = 0;
    axis.offset[1] = axis.scrollLength;
    axis.progress = progress(0, axis.scrollLength, axis.current);
    const elapsed = time - prevTime;
    axis.velocity =
        elapsed > maxElapsed
            ? 0
            : velocityPerSecond(axis.current - prev, elapsed);
}
function updateScrollInfo(element, info, time) {
    updateAxisInfo(element, "x", info, time);
    updateAxisInfo(element, "y", info, time);
    info.time = time;
}

function calcInset(element, container) {
    const inset = { x: 0, y: 0 };
    let current = element;
    while (current && current !== container) {
        if (current instanceof HTMLElement) {
            inset.x += current.offsetLeft;
            inset.y += current.offsetTop;
            current = current.offsetParent;
        }
        else if (current.tagName === "svg") {
            /**
             * This isn't an ideal approach to measuring the offset of <svg /> tags.
             * It would be preferable, given they behave like HTMLElements in most ways
             * to use offsetLeft/Top. But these don't exist on <svg />. Likewise we
             * can't use .getBBox() like most SVG elements as these provide the offset
             * relative to the SVG itself, which for <svg /> is usually 0x0.
             */
            const svgBoundingBox = current.getBoundingClientRect();
            current = current.parentElement;
            const parentBoundingBox = current.getBoundingClientRect();
            inset.x += svgBoundingBox.left - parentBoundingBox.left;
            inset.y += svgBoundingBox.top - parentBoundingBox.top;
        }
        else if (current instanceof SVGGraphicsElement) {
            const { x, y } = current.getBBox();
            inset.x += x;
            inset.y += y;
            let svg = null;
            let parent = current.parentNode;
            while (!svg) {
                if (parent.tagName === "svg") {
                    svg = parent;
                }
                parent = current.parentNode;
            }
            current = svg;
        }
        else {
            break;
        }
    }
    return inset;
}

const namedEdges = {
    start: 0,
    center: 0.5,
    end: 1,
};
function resolveEdge(edge, length, inset = 0) {
    let delta = 0;
    /**
     * If we have this edge defined as a preset, replace the definition
     * with the numerical value.
     */
    if (edge in namedEdges) {
        edge = namedEdges[edge];
    }
    /**
     * Handle unit values
     */
    if (typeof edge === "string") {
        const asNumber = parseFloat(edge);
        if (edge.endsWith("px")) {
            delta = asNumber;
        }
        else if (edge.endsWith("%")) {
            edge = asNumber / 100;
        }
        else if (edge.endsWith("vw")) {
            delta = (asNumber / 100) * document.documentElement.clientWidth;
        }
        else if (edge.endsWith("vh")) {
            delta = (asNumber / 100) * document.documentElement.clientHeight;
        }
        else {
            edge = asNumber;
        }
    }
    /**
     * If the edge is defined as a number, handle as a progress value.
     */
    if (typeof edge === "number") {
        delta = length * edge;
    }
    return inset + delta;
}

const defaultOffset = [0, 0];
function resolveOffset(offset, containerLength, targetLength, targetInset) {
    let offsetDefinition = Array.isArray(offset) ? offset : defaultOffset;
    let targetPoint = 0;
    let containerPoint = 0;
    if (typeof offset === "number") {
        /**
         * If we're provided offset: [0, 0.5, 1] then each number x should become
         * [x, x], so we default to the behaviour of mapping 0 => 0 of both target
         * and container etc.
         */
        offsetDefinition = [offset, offset];
    }
    else if (typeof offset === "string") {
        offset = offset.trim();
        if (offset.includes(" ")) {
            offsetDefinition = offset.split(" ");
        }
        else {
            /**
             * If we're provided a definition like "100px" then we want to apply
             * that only to the top of the target point, leaving the container at 0.
             * Whereas a named offset like "end" should be applied to both.
             */
            offsetDefinition = [offset, namedEdges[offset] ? offset : `0`];
        }
    }
    targetPoint = resolveEdge(offsetDefinition[0], targetLength, targetInset);
    containerPoint = resolveEdge(offsetDefinition[1], containerLength);
    return targetPoint - containerPoint;
}

const ScrollOffset = {
    Enter: [
        [0, 1],
        [1, 1],
    ],
    Exit: [
        [0, 0],
        [1, 0],
    ],
    Any: [
        [1, 0],
        [0, 1],
    ],
    All: [
        [0, 0],
        [1, 1],
    ],
};

const point = { x: 0, y: 0 };
function getTargetSize(target) {
    return "getBBox" in target && target.tagName !== "svg"
        ? target.getBBox()
        : { width: target.clientWidth, height: target.clientHeight };
}
function resolveOffsets(container, info, options) {
    const { offset: offsetDefinition = ScrollOffset.All } = options;
    const { target = container, axis = "y" } = options;
    const lengthLabel = axis === "y" ? "height" : "width";
    const inset = target !== container ? calcInset(target, container) : point;
    /**
     * Measure the target and container. If they're the same thing then we
     * use the container's scrollWidth/Height as the target, from there
     * all other calculations can remain the same.
     */
    const targetSize = target === container
        ? { width: container.scrollWidth, height: container.scrollHeight }
        : getTargetSize(target);
    const containerSize = {
        width: container.clientWidth,
        height: container.clientHeight,
    };
    /**
     * Reset the length of the resolved offset array rather than creating a new one.
     * TODO: More reusable data structures for targetSize/containerSize would also be good.
     */
    info[axis].offset.length = 0;
    /**
     * Populate the offset array by resolving the user's offset definition into
     * a list of pixel scroll offets.
     */
    let hasChanged = !info[axis].interpolate;
    const numOffsets = offsetDefinition.length;
    for (let i = 0; i < numOffsets; i++) {
        const offset = resolveOffset(offsetDefinition[i], containerSize[lengthLabel], targetSize[lengthLabel], inset[axis]);
        if (!hasChanged && offset !== info[axis].interpolatorOffsets[i]) {
            hasChanged = true;
        }
        info[axis].offset[i] = offset;
    }
    /**
     * If the pixel scroll offsets have changed, create a new interpolator function
     * to map scroll value into a progress.
     */
    if (hasChanged) {
        info[axis].interpolate = interpolate(info[axis].offset, defaultOffset$1(offsetDefinition), { clamp: false });
        info[axis].interpolatorOffsets = [...info[axis].offset];
    }
    info[axis].progress = clamp(0, 1, info[axis].interpolate(info[axis].current));
}

function measure(container, target = container, info) {
  info.x.targetOffset = 0;
  info.y.targetOffset = 0;
  if (target !== container) {
    let node = target;
    while (node && node !== container) {
      info.x.targetOffset += node.offsetLeft;
      info.y.targetOffset += node.offsetTop;
      node = node.offsetParent;
    }
  }
  info.x.targetLength = target === container ? target.scrollWidth : target.clientWidth;
  info.y.targetLength = target === container ? target.scrollHeight : target.clientHeight;
  info.x.containerLength = container.clientWidth;
  info.y.containerLength = container.clientHeight;
}
function createOnScrollHandler(element, onScroll, info, options = {}) {
  return {
    measure: () => measure(element, options.target, info),
    update: (time) => {
      updateScrollInfo(element, info, time);
      if (options.offset || options.target) {
        resolveOffsets(element, info, options);
      }
    },
    notify: () => onScroll(info)
  };
}

const scrollListeners = new WeakMap();
const resizeListeners = new WeakMap();
const onScrollHandlers = new WeakMap();
const getEventTarget = (element) => element === document.documentElement ? window : element;
function scrollInfo(onScroll, { container = document.documentElement, ...options } = {}) {
    let containerHandlers = onScrollHandlers.get(container);
    /**
     * Get the onScroll handlers for this container.
     * If one isn't found, create a new one.
     */
    if (!containerHandlers) {
        containerHandlers = new Set();
        onScrollHandlers.set(container, containerHandlers);
    }
    /**
     * Create a new onScroll handler for the provided callback.
     */
    const info = createScrollInfo();
    const containerHandler = createOnScrollHandler(container, onScroll, info, options);
    containerHandlers.add(containerHandler);
    /**
     * Check if there's a scroll event listener for this container.
     * If not, create one.
     */
    if (!scrollListeners.has(container)) {
        const measureAll = () => {
            for (const handler of containerHandlers)
                handler.measure();
        };
        const updateAll = () => {
            for (const handler of containerHandlers) {
                handler.update(frameData.timestamp);
            }
        };
        const notifyAll = () => {
            for (const handler of containerHandlers)
                handler.notify();
        };
        const listener = () => {
            frame.read(measureAll, false, true);
            frame.read(updateAll, false, true);
            frame.update(notifyAll, false, true);
        };
        scrollListeners.set(container, listener);
        const target = getEventTarget(container);
        window.addEventListener("resize", listener, { passive: true });
        if (container !== document.documentElement) {
            resizeListeners.set(container, resize(container, listener));
        }
        target.addEventListener("scroll", listener, { passive: true });
    }
    const listener = scrollListeners.get(container);
    frame.read(listener, false, true);
    return () => {
        var _a;
        cancelFrame(listener);
        /**
         * Check if we even have any handlers for this container.
         */
        const currentHandlers = onScrollHandlers.get(container);
        if (!currentHandlers)
            return;
        currentHandlers.delete(containerHandler);
        if (currentHandlers.size)
            return;
        /**
         * If no more handlers, remove the scroll listener too.
         */
        const scrollListener = scrollListeners.get(container);
        scrollListeners.delete(container);
        if (scrollListener) {
            getEventTarget(container).removeEventListener("scroll", scrollListener);
            (_a = resizeListeners.get(container)) === null || _a === undefined ? undefined : _a();
            window.removeEventListener("resize", scrollListener);
        }
    };
}

function scrollTimelineFallback({ source, container, axis = "y", }) {
    // Support legacy source argument. Deprecate later.
    if (source)
        container = source;
    // ScrollTimeline records progress as a percentage CSSUnitValue
    const currentTime = { value: 0 };
    const cancel = scrollInfo((info) => {
        currentTime.value = info[axis].progress * 100;
    }, { container, axis });
    return { currentTime, cancel };
}
const timelineCache = new Map();
function getTimeline({ source, container = document.documentElement, axis = "y", } = {}) {
    // Support legacy source argument. Deprecate later.
    if (source)
        container = source;
    if (!timelineCache.has(container)) {
        timelineCache.set(container, {});
    }
    const elementCache = timelineCache.get(container);
    if (!elementCache[axis]) {
        elementCache[axis] = supportsScrollTimeline()
            ? new ScrollTimeline({ source: container, axis })
            : scrollTimelineFallback({ source: container, axis });
    }
    return elementCache[axis];
}
/**
 * If the onScroll function has two arguments, it's expecting
 * more specific information about the scroll from scrollInfo.
 */
function isOnScrollWithInfo(onScroll) {
    return onScroll.length === 2;
}
/**
 * Currently, we only support element tracking with `scrollInfo`, though in
 * the future we can also offer ViewTimeline support.
 */
function needsElementTracking(options) {
    return options && (options.target || options.offset);
}
function scrollFunction(onScroll, options) {
    if (isOnScrollWithInfo(onScroll) || needsElementTracking(options)) {
        return scrollInfo((info) => {
            onScroll(info[options.axis].progress, info);
        }, options);
    }
    else {
        return observeTimeline(onScroll, getTimeline(options));
    }
}
function scrollAnimation(animation, options) {
    animation.flatten();
    if (needsElementTracking(options)) {
        animation.pause();
        return scrollInfo((info) => {
            animation.time = animation.duration * info[options.axis].progress;
        }, options);
    }
    else {
        const timeline = getTimeline(options);
        if (animation.attachTimeline) {
            return animation.attachTimeline(timeline, (valueAnimation) => {
                valueAnimation.pause();
                return observeTimeline((progress) => {
                    valueAnimation.time = valueAnimation.duration * progress;
                }, timeline);
            });
        }
        else {
            return noop;
        }
    }
}
function scroll(onScroll, { axis = "y", ...options } = {}) {
    const optionsWithDefaults = { axis, ...options };
    return typeof onScroll === "function"
        ? scrollFunction(onScroll, optionsWithDefaults)
        : scrollAnimation(onScroll, optionsWithDefaults);
}

const {useEffect: useEffect$7} = await importShared('react');

function refWarning(name, ref) {
    warning(Boolean(!ref || ref.current));
}
const createScrollMotionValues = () => ({
    scrollX: motionValue(0),
    scrollY: motionValue(0),
    scrollXProgress: motionValue(0),
    scrollYProgress: motionValue(0),
});
function useScroll({ container, target, layoutEffect = true, ...options } = {}) {
    const values = useConstant(createScrollMotionValues);
    const useLifecycleEffect = layoutEffect
        ? useIsomorphicLayoutEffect
        : useEffect$7;
    useLifecycleEffect(() => {
        refWarning("target", target);
        refWarning("container", container);
        return scroll((_progress, { x, y }) => {
            values.scrollX.set(x.current);
            values.scrollXProgress.set(x.progress);
            values.scrollY.set(y.current);
            values.scrollYProgress.set(y.progress);
        }, {
            ...options,
            container: (container === null || container === undefined ? undefined : container.current) || undefined,
            target: (target === null || target === undefined ? undefined : target.current) || undefined,
        });
    }, [container, target, JSON.stringify(options.offset)]);
    return values;
}

function useElementScroll(ref) {
  return useScroll({ container: ref });
}

function useViewportScroll() {
  return useScroll();
}

const {useContext: useContext$6,useState: useState$4,useEffect: useEffect$6} = await importShared('react');

/**
 * Creates a `MotionValue` to track the state and velocity of a value.
 *
 * Usually, these are created automatically. For advanced use-cases, like use with `useTransform`, you can create `MotionValue`s externally and pass them into the animated component via the `style` prop.
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const scale = useMotionValue(1)
 *
 *   return <motion.div style={{ scale }} />
 * }
 * ```
 *
 * @param initial - The initial state.
 *
 * @public
 */
function useMotionValue(initial) {
    const value = useConstant(() => motionValue(initial));
    /**
     * If this motion value is being used in static mode, like on
     * the Framer canvas, force components to rerender when the motion
     * value is updated.
     */
    const { isStatic } = useContext$6(MotionConfigContext);
    if (isStatic) {
        const [, setLatest] = useState$4(initial);
        useEffect$6(() => value.on("change", setLatest), []);
    }
    return value;
}

function useCombineMotionValues(values, combineValues) {
    /**
     * Initialise the returned motion value. This remains the same between renders.
     */
    const value = useMotionValue(combineValues());
    /**
     * Create a function that will update the template motion value with the latest values.
     * This is pre-bound so whenever a motion value updates it can schedule its
     * execution in Framesync. If it's already been scheduled it won't be fired twice
     * in a single frame.
     */
    const updateValue = () => value.set(combineValues());
    /**
     * Synchronously update the motion value with the latest values during the render.
     * This ensures that within a React render, the styles applied to the DOM are up-to-date.
     */
    updateValue();
    /**
     * Subscribe to all motion values found within the template. Whenever any of them change,
     * schedule an update.
     */
    useIsomorphicLayoutEffect(() => {
        const scheduleUpdate = () => frame.preRender(updateValue, false, true);
        const subscriptions = values.map((v) => v.on("change", scheduleUpdate));
        return () => {
            subscriptions.forEach((unsubscribe) => unsubscribe());
            cancelFrame(updateValue);
        };
    });
    return value;
}

/**
 * Combine multiple motion values into a new one using a string template literal.
 *
 * ```jsx
 * import {
 *   motion,
 *   useSpring,
 *   useMotionValue,
 *   useMotionTemplate
 * } from "framer-motion"
 *
 * function Component() {
 *   const shadowX = useSpring(0)
 *   const shadowY = useMotionValue(0)
 *   const shadow = useMotionTemplate`drop-shadow(${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.3))`
 *
 *   return <motion.div style={{ filter: shadow }} />
 * }
 * ```
 *
 * @public
 */
function useMotionTemplate(fragments, ...values) {
    /**
     * Create a function that will build a string from the latest motion values.
     */
    const numFragments = fragments.length;
    function buildValue() {
        let output = ``;
        for (let i = 0; i < numFragments; i++) {
            output += fragments[i];
            const value = values[i];
            if (value) {
                output += isMotionValue(value) ? value.get() : value;
            }
        }
        return output;
    }
    return useCombineMotionValues(values.filter(isMotionValue), buildValue);
}

const {useContext: useContext$5,useRef: useRef$4,useInsertionEffect} = await importShared('react');

function useSpring(source, config = {}) {
    const { isStatic } = useContext$5(MotionConfigContext);
    const activeSpringAnimation = useRef$4(null);
    const initialValue = useConstant(() => isMotionValue(source) ? source.get() : source);
    const unit = useConstant(() => typeof initialValue === "string"
        ? initialValue.replace(/[\d.-]/g, "")
        : undefined);
    const value = useMotionValue(initialValue);
    const latestValue = useRef$4(initialValue);
    const latestSetter = useRef$4(noop);
    const startAnimation = () => {
        stopAnimation();
        activeSpringAnimation.current = animateValue({
            keyframes: [asNumber(value.get()), asNumber(latestValue.current)],
            velocity: value.getVelocity(),
            type: "spring",
            restDelta: 0.001,
            restSpeed: 0.01,
            ...config,
            onUpdate: latestSetter.current,
        });
    };
    const stopAnimation = () => {
        if (activeSpringAnimation.current) {
            activeSpringAnimation.current.stop();
        }
    };
    useInsertionEffect(() => {
        return value.attach((v, set) => {
            if (isStatic)
                return set(v);
            latestValue.current = v;
            latestSetter.current = (latest) => set(parseValue(latest, unit));
            frame.postRender(startAnimation);
            return value.get();
        }, stopAnimation);
    }, [JSON.stringify(config)]);
    useIsomorphicLayoutEffect(() => {
        if (isMotionValue(source)) {
            return source.on("change", (v) => value.set(parseValue(v, unit)));
        }
    }, [value, unit]);
    return value;
}
function parseValue(v, unit) {
    return unit ? v + unit : v;
}
function asNumber(v) {
    return typeof v === "number" ? v : parseFloat(v);
}

const {useRef: useRef$3,useContext: useContext$4,useEffect: useEffect$5} = await importShared('react');

function useAnimationFrame(callback) {
    const initialTimestamp = useRef$3(0);
    const { isStatic } = useContext$4(MotionConfigContext);
    useEffect$5(() => {
        if (isStatic)
            return;
        const provideTimeSinceStart = ({ timestamp, delta }) => {
            if (!initialTimestamp.current)
                initialTimestamp.current = timestamp;
            callback(timestamp - initialTimestamp.current, delta);
        };
        frame.update(provideTimeSinceStart, true);
        return () => cancelFrame(provideTimeSinceStart);
    }, [callback]);
}

function useTime() {
    const time = useMotionValue(0);
    useAnimationFrame((t) => time.set(t));
    return time;
}

const isCustomValueType = (v) => {
    return v && typeof v === "object" && v.mix;
};
const getMixer = (v) => (isCustomValueType(v) ? v.mix : undefined);
function transform(...args) {
    const useImmediate = !Array.isArray(args[0]);
    const argOffset = useImmediate ? 0 : -1;
    const inputValue = args[0 + argOffset];
    const inputRange = args[1 + argOffset];
    const outputRange = args[2 + argOffset];
    const options = args[3 + argOffset];
    const interpolator = interpolate(inputRange, outputRange, {
        mixer: getMixer(outputRange[0]),
        ...options,
    });
    return useImmediate ? interpolator(inputValue) : interpolator;
}

function useComputed(compute) {
    /**
     * Open session of collectMotionValues. Any MotionValue that calls get()
     * will be saved into this array.
     */
    collectMotionValues.current = [];
    compute();
    const value = useCombineMotionValues(collectMotionValues.current, compute);
    /**
     * Synchronously close session of collectMotionValues.
     */
    collectMotionValues.current = undefined;
    return value;
}

function useTransform(input, inputRangeOrTransformer, outputRange, options) {
    if (typeof input === "function") {
        return useComputed(input);
    }
    const transformer = typeof inputRangeOrTransformer === "function"
        ? inputRangeOrTransformer
        : transform(inputRangeOrTransformer, outputRange, options);
    return Array.isArray(input)
        ? useListTransform(input, transformer)
        : useListTransform([input], ([latest]) => transformer(latest));
}
function useListTransform(values, transformer) {
    const latest = useConstant(() => []);
    return useCombineMotionValues(values, () => {
        latest.length = 0;
        const numValues = values.length;
        for (let i = 0; i < numValues; i++) {
            latest[i] = values[i].get();
        }
        return transformer(latest);
    });
}

/**
 * Creates a `MotionValue` that updates when the velocity of the provided `MotionValue` changes.
 *
 * ```javascript
 * const x = useMotionValue(0)
 * const xVelocity = useVelocity(x)
 * const xAcceleration = useVelocity(xVelocity)
 * ```
 *
 * @public
 */
function useVelocity(value) {
    const velocity = useMotionValue(value.getVelocity());
    const updateVelocity = () => {
        const latest = value.getVelocity();
        velocity.set(latest);
        /**
         * If we still have velocity, schedule an update for the next frame
         * to keep checking until it is zero.
         */
        if (latest)
            frame.update(updateVelocity);
    };
    useMotionValueEvent(value, "change", () => {
        // Schedule an update to this value at the end of the current frame.
        frame.update(updateVelocity, false, true);
    });
    return velocity;
}

const {useState: useState$3} = await importShared('react');
function useReducedMotion() {
  !hasReducedMotionListener.current && initPrefersReducedMotion();
  const [shouldReduceMotion] = useState$3(prefersReducedMotion.current);
  return shouldReduceMotion;
}

const {useContext: useContext$3} = await importShared('react');

function useReducedMotionConfig() {
    const reducedMotionPreference = useReducedMotion();
    const { reducedMotion } = useContext$3(MotionConfigContext);
    if (reducedMotion === "never") {
        return false;
    }
    else if (reducedMotion === "always") {
        return true;
    }
    else {
        return reducedMotionPreference;
    }
}

function stopAnimation(visualElement) {
    visualElement.values.forEach((value) => value.stop());
}
function setVariants(visualElement, variantLabels) {
    const reversedLabels = [...variantLabels].reverse();
    reversedLabels.forEach((key) => {
        const variant = visualElement.getVariant(key);
        variant && setTarget(visualElement, variant);
        if (visualElement.variantChildren) {
            visualElement.variantChildren.forEach((child) => {
                setVariants(child, variantLabels);
            });
        }
    });
}
function setValues(visualElement, definition) {
    if (Array.isArray(definition)) {
        return setVariants(visualElement, definition);
    }
    else if (typeof definition === "string") {
        return setVariants(visualElement, [definition]);
    }
    else {
        setTarget(visualElement, definition);
    }
}
/**
 * @public
 */
function animationControls() {
    /**
     * A collection of linked component animation controls.
     */
    const subscribers = new Set();
    const controls = {
        subscribe(visualElement) {
            subscribers.add(visualElement);
            return () => void subscribers.delete(visualElement);
        },
        start(definition, transitionOverride) {
            const animations = [];
            subscribers.forEach((visualElement) => {
                animations.push(animateVisualElement(visualElement, definition, {
                    transitionOverride,
                }));
            });
            return Promise.all(animations);
        },
        set(definition) {
            return subscribers.forEach((visualElement) => {
                setValues(visualElement, definition);
            });
        },
        stop() {
            subscribers.forEach((visualElement) => {
                stopAnimation(visualElement);
            });
        },
        mount() {
            return () => {
                controls.stop();
            };
        },
    };
    return controls;
}

const {useEffect: useEffect$4} = await importShared('react');


function useUnmountEffect(callback) {
    return useEffect$4(() => () => callback(), []);
}

const wrap = (min, max, v) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

function getEasingForSegment(easing, i) {
    return isEasingArray(easing) ? easing[wrap(0, easing.length, i)] : easing;
}

function isDOMKeyframes(keyframes) {
    return typeof keyframes === "object" && !Array.isArray(keyframes);
}

function resolveSubjects(subject, keyframes, scope, selectorCache) {
    if (typeof subject === "string" && isDOMKeyframes(keyframes)) {
        return resolveElements(subject, scope, selectorCache);
    }
    else if (subject instanceof NodeList) {
        return Array.from(subject);
    }
    else if (Array.isArray(subject)) {
        return subject;
    }
    else {
        return [subject];
    }
}

function calculateRepeatDuration(duration, repeat, _repeatDelay) {
    return duration * (repeat + 1);
}

/**
 * Given a absolute or relative time definition and current/prev time state of the sequence,
 * calculate an absolute time for the next keyframes.
 */
function calcNextTime(current, next, prev, labels) {
    var _a;
    if (typeof next === "number") {
        return next;
    }
    else if (next.startsWith("-") || next.startsWith("+")) {
        return Math.max(0, current + parseFloat(next));
    }
    else if (next === "<") {
        return prev;
    }
    else {
        return (_a = labels.get(next)) !== null && _a !== undefined ? _a : current;
    }
}

function eraseKeyframes(sequence, startTime, endTime) {
    for (let i = 0; i < sequence.length; i++) {
        const keyframe = sequence[i];
        if (keyframe.at > startTime && keyframe.at < endTime) {
            removeItem(sequence, keyframe);
            // If we remove this item we have to push the pointer back one
            i--;
        }
    }
}
function addKeyframes(sequence, keyframes, easing, offset, startTime, endTime) {
    /**
     * Erase every existing value between currentTime and targetTime,
     * this will essentially splice this timeline into any currently
     * defined ones.
     */
    eraseKeyframes(sequence, startTime, endTime);
    for (let i = 0; i < keyframes.length; i++) {
        sequence.push({
            value: keyframes[i],
            at: mixNumber(startTime, endTime, offset[i]),
            easing: getEasingForSegment(easing, i),
        });
    }
}

/**
 * Take an array of times that represent repeated keyframes. For instance
 * if we have original times of [0, 0.5, 1] then our repeated times will
 * be [0, 0.5, 1, 1, 1.5, 2]. Loop over the times and scale them back
 * down to a 0-1 scale.
 */
function normalizeTimes(times, repeat) {
    for (let i = 0; i < times.length; i++) {
        times[i] = times[i] / (repeat + 1);
    }
}

function compareByTime(a, b) {
    if (a.at === b.at) {
        if (a.value === null)
            return 1;
        if (b.value === null)
            return -1;
        return 0;
    }
    else {
        return a.at - b.at;
    }
}

const defaultSegmentEasing = "easeInOut";
function createAnimationsFromSequence(sequence, { defaultTransition = {}, ...sequenceTransition } = {}, scope, generators) {
    const defaultDuration = defaultTransition.duration || 0.3;
    const animationDefinitions = new Map();
    const sequences = new Map();
    const elementCache = {};
    const timeLabels = new Map();
    let prevTime = 0;
    let currentTime = 0;
    let totalDuration = 0;
    /**
     * Build the timeline by mapping over the sequence array and converting
     * the definitions into keyframes and offsets with absolute time values.
     * These will later get converted into relative offsets in a second pass.
     */
    for (let i = 0; i < sequence.length; i++) {
        const segment = sequence[i];
        /**
         * If this is a timeline label, mark it and skip the rest of this iteration.
         */
        if (typeof segment === "string") {
            timeLabels.set(segment, currentTime);
            continue;
        }
        else if (!Array.isArray(segment)) {
            timeLabels.set(segment.name, calcNextTime(currentTime, segment.at, prevTime, timeLabels));
            continue;
        }
        let [subject, keyframes, transition = {}] = segment;
        /**
         * If a relative or absolute time value has been specified we need to resolve
         * it in relation to the currentTime.
         */
        if (transition.at !== undefined) {
            currentTime = calcNextTime(currentTime, transition.at, prevTime, timeLabels);
        }
        /**
         * Keep track of the maximum duration in this definition. This will be
         * applied to currentTime once the definition has been parsed.
         */
        let maxDuration = 0;
        const resolveValueSequence = (valueKeyframes, valueTransition, valueSequence, elementIndex = 0, numSubjects = 0) => {
            const valueKeyframesAsList = keyframesAsList(valueKeyframes);
            const { delay = 0, times = defaultOffset$1(valueKeyframesAsList), type = "keyframes", repeat, repeatType, repeatDelay = 0, ...remainingTransition } = valueTransition;
            let { ease = defaultTransition.ease || "easeOut", duration } = valueTransition;
            /**
             * Resolve stagger() if defined.
             */
            const calculatedDelay = typeof delay === "function"
                ? delay(elementIndex, numSubjects)
                : delay;
            /**
             * If this animation should and can use a spring, generate a spring easing function.
             */
            const numKeyframes = valueKeyframesAsList.length;
            const createGenerator = isGenerator(type)
                ? type
                : generators === null || generators === undefined ? undefined : generators[type];
            if (numKeyframes <= 2 && createGenerator) {
                /**
                 * As we're creating an easing function from a spring,
                 * ideally we want to generate it using the real distance
                 * between the two keyframes. However this isn't always
                 * possible - in these situations we use 0-100.
                 */
                let absoluteDelta = 100;
                if (numKeyframes === 2 &&
                    isNumberKeyframesArray(valueKeyframesAsList)) {
                    const delta = valueKeyframesAsList[1] - valueKeyframesAsList[0];
                    absoluteDelta = Math.abs(delta);
                }
                const springTransition = { ...remainingTransition };
                if (duration !== undefined) {
                    springTransition.duration = secondsToMilliseconds(duration);
                }
                const springEasing = createGeneratorEasing(springTransition, absoluteDelta, createGenerator);
                ease = springEasing.ease;
                duration = springEasing.duration;
            }
            duration !== null && duration !== undefined ? duration : (duration = defaultDuration);
            const startTime = currentTime + calculatedDelay;
            /**
             * If there's only one time offset of 0, fill in a second with length 1
             */
            if (times.length === 1 && times[0] === 0) {
                times[1] = 1;
            }
            /**
             * Fill out if offset if fewer offsets than keyframes
             */
            const remainder = times.length - valueKeyframesAsList.length;
            remainder > 0 && fillOffset(times, remainder);
            /**
             * If only one value has been set, ie [1], push a null to the start of
             * the keyframe array. This will let us mark a keyframe at this point
             * that will later be hydrated with the previous value.
             */
            valueKeyframesAsList.length === 1 &&
                valueKeyframesAsList.unshift(null);
            /**
             * Handle repeat options
             */
            if (repeat) {
                duration = calculateRepeatDuration(duration, repeat);
                const originalKeyframes = [...valueKeyframesAsList];
                const originalTimes = [...times];
                ease = Array.isArray(ease) ? [...ease] : [ease];
                const originalEase = [...ease];
                for (let repeatIndex = 0; repeatIndex < repeat; repeatIndex++) {
                    valueKeyframesAsList.push(...originalKeyframes);
                    for (let keyframeIndex = 0; keyframeIndex < originalKeyframes.length; keyframeIndex++) {
                        times.push(originalTimes[keyframeIndex] + (repeatIndex + 1));
                        ease.push(keyframeIndex === 0
                            ? "linear"
                            : getEasingForSegment(originalEase, keyframeIndex - 1));
                    }
                }
                normalizeTimes(times, repeat);
            }
            const targetTime = startTime + duration;
            /**
             * Add keyframes, mapping offsets to absolute time.
             */
            addKeyframes(valueSequence, valueKeyframesAsList, ease, times, startTime, targetTime);
            maxDuration = Math.max(calculatedDelay + duration, maxDuration);
            totalDuration = Math.max(targetTime, totalDuration);
        };
        if (isMotionValue(subject)) {
            const subjectSequence = getSubjectSequence(subject, sequences);
            resolveValueSequence(keyframes, transition, getValueSequence("default", subjectSequence));
        }
        else {
            const subjects = resolveSubjects(subject, keyframes, scope, elementCache);
            const numSubjects = subjects.length;
            /**
             * For every element in this segment, process the defined values.
             */
            for (let subjectIndex = 0; subjectIndex < numSubjects; subjectIndex++) {
                /**
                 * Cast necessary, but we know these are of this type
                 */
                keyframes = keyframes;
                transition = transition;
                const thisSubject = subjects[subjectIndex];
                const subjectSequence = getSubjectSequence(thisSubject, sequences);
                for (const key in keyframes) {
                    resolveValueSequence(keyframes[key], getValueTransition(transition, key), getValueSequence(key, subjectSequence), subjectIndex, numSubjects);
                }
            }
        }
        prevTime = currentTime;
        currentTime += maxDuration;
    }
    /**
     * For every element and value combination create a new animation.
     */
    sequences.forEach((valueSequences, element) => {
        for (const key in valueSequences) {
            const valueSequence = valueSequences[key];
            /**
             * Arrange all the keyframes in ascending time order.
             */
            valueSequence.sort(compareByTime);
            const keyframes = [];
            const valueOffset = [];
            const valueEasing = [];
            /**
             * For each keyframe, translate absolute times into
             * relative offsets based on the total duration of the timeline.
             */
            for (let i = 0; i < valueSequence.length; i++) {
                const { at, value, easing } = valueSequence[i];
                keyframes.push(value);
                valueOffset.push(progress(0, totalDuration, at));
                valueEasing.push(easing || "easeOut");
            }
            /**
             * If the first keyframe doesn't land on offset: 0
             * provide one by duplicating the initial keyframe. This ensures
             * it snaps to the first keyframe when the animation starts.
             */
            if (valueOffset[0] !== 0) {
                valueOffset.unshift(0);
                keyframes.unshift(keyframes[0]);
                valueEasing.unshift(defaultSegmentEasing);
            }
            /**
             * If the last keyframe doesn't land on offset: 1
             * provide one with a null wildcard value. This will ensure it
             * stays static until the end of the animation.
             */
            if (valueOffset[valueOffset.length - 1] !== 1) {
                valueOffset.push(1);
                keyframes.push(null);
            }
            if (!animationDefinitions.has(element)) {
                animationDefinitions.set(element, {
                    keyframes: {},
                    transition: {},
                });
            }
            const definition = animationDefinitions.get(element);
            definition.keyframes[key] = keyframes;
            definition.transition[key] = {
                ...defaultTransition,
                duration: totalDuration,
                ease: valueEasing,
                times: valueOffset,
                ...sequenceTransition,
            };
        }
    });
    return animationDefinitions;
}
function getSubjectSequence(subject, sequences) {
    !sequences.has(subject) && sequences.set(subject, {});
    return sequences.get(subject);
}
function getValueSequence(name, sequences) {
    if (!sequences[name])
        sequences[name] = [];
    return sequences[name];
}
function keyframesAsList(keyframes) {
    return Array.isArray(keyframes) ? keyframes : [keyframes];
}
function getValueTransition(transition, key) {
    return transition && transition[key]
        ? {
            ...transition,
            ...transition[key],
        }
        : { ...transition };
}
const isNumber = (keyframe) => typeof keyframe === "number";
const isNumberKeyframesArray = (keyframes) => keyframes.every(isNumber);

function isObjectKey(key, object) {
    return key in object;
}
class ObjectVisualElement extends VisualElement {
    constructor() {
        super(...arguments);
        this.type = "object";
    }
    readValueFromInstance(instance, key) {
        if (isObjectKey(key, instance)) {
            const value = instance[key];
            if (typeof value === "string" || typeof value === "number") {
                return value;
            }
        }
        return undefined;
    }
    getBaseTargetFromProps() {
        return undefined;
    }
    removeValueFromRenderState(key, renderState) {
        delete renderState.output[key];
    }
    measureInstanceViewportBox() {
        return createBox();
    }
    build(renderState, latestValues) {
        Object.assign(renderState.output, latestValues);
    }
    renderInstance(instance, { output }) {
        Object.assign(instance, output);
    }
    sortInstanceNodePosition() {
        return 0;
    }
}

function createDOMVisualElement(element) {
    const options = {
        presenceContext: null,
        props: {},
        visualState: {
            renderState: {
                transform: {},
                transformOrigin: {},
                style: {},
                vars: {},
                attrs: {},
            },
            latestValues: {},
        },
    };
    const node = isSVGElement(element)
        ? new SVGVisualElement(options)
        : new HTMLVisualElement(options);
    node.mount(element);
    visualElementStore.set(element, node);
}
function createObjectVisualElement(subject) {
    const options = {
        presenceContext: null,
        props: {},
        visualState: {
            renderState: {
                output: {},
            },
            latestValues: {},
        },
    };
    const node = new ObjectVisualElement(options);
    node.mount(subject);
    visualElementStore.set(subject, node);
}

function isSingleValue(subject, keyframes) {
    return (isMotionValue(subject) ||
        typeof subject === "number" ||
        (typeof subject === "string" && !isDOMKeyframes(keyframes)));
}
/**
 * Implementation
 */
function animateSubject(subject, keyframes, options, scope) {
    const animations = [];
    if (isSingleValue(subject, keyframes)) {
        animations.push(animateSingleValue(subject, isDOMKeyframes(keyframes)
            ? keyframes.default || keyframes
            : keyframes, options ? options.default || options : options));
    }
    else {
        const subjects = resolveSubjects(subject, keyframes, scope);
        const numSubjects = subjects.length;
        for (let i = 0; i < numSubjects; i++) {
            const thisSubject = subjects[i];
            const createVisualElement = thisSubject instanceof Element
                ? createDOMVisualElement
                : createObjectVisualElement;
            if (!visualElementStore.has(thisSubject)) {
                createVisualElement(thisSubject);
            }
            const visualElement = visualElementStore.get(thisSubject);
            const transition = { ...options };
            /**
             * Resolve stagger function if provided.
             */
            if ("delay" in transition &&
                typeof transition.delay === "function") {
                transition.delay = transition.delay(i, numSubjects);
            }
            animations.push(...animateTarget(visualElement, { ...keyframes, transition }, {}));
        }
    }
    return animations;
}

function animateSequence(sequence, options, scope) {
    const animations = [];
    const animationDefinitions = createAnimationsFromSequence(sequence, options, scope, { spring });
    animationDefinitions.forEach(({ keyframes, transition }, subject) => {
        animations.push(...animateSubject(subject, keyframes, transition));
    });
    return animations;
}

function isSequence(value) {
    return Array.isArray(value) && value.some(Array.isArray);
}
/**
 * Creates an animation function that is optionally scoped
 * to a specific element.
 */
function createScopedAnimate(scope) {
    /**
     * Implementation
     */
    function scopedAnimate(subjectOrSequence, optionsOrKeyframes, options) {
        let animations = [];
        if (isSequence(subjectOrSequence)) {
            animations = animateSequence(subjectOrSequence, optionsOrKeyframes, scope);
        }
        else {
            animations = animateSubject(subjectOrSequence, optionsOrKeyframes, options, scope);
        }
        const animation = new GroupPlaybackControls(animations);
        if (scope) {
            scope.animations.push(animation);
        }
        return animation;
    }
    return scopedAnimate;
}
const animate = createScopedAnimate();

function useAnimate() {
    const scope = useConstant(() => ({
        current: null, // Will be hydrated by React
        animations: [],
    }));
    const animate = useConstant(() => createScopedAnimate(scope));
    useUnmountEffect(() => {
        scope.animations.forEach((animation) => animation.stop());
    });
    return [scope, animate];
}

function setCSSVar(element, name, value) {
    element.style.setProperty(name, value);
}
function setStyle(element, name, value) {
    element.style[name] = value;
}

const supportsPartialKeyframes = /*@__PURE__*/ memo(() => {
    try {
        document.createElement("div").animate({ opacity: [1] });
    }
    catch (e) {
        return false;
    }
    return true;
});

const state = new WeakMap();
function hydrateKeyframes(valueName, keyframes, read) {
    for (let i = 0; i < keyframes.length; i++) {
        if (keyframes[i] === null) {
            keyframes[i] = i === 0 ? read() : keyframes[i - 1];
        }
        if (typeof keyframes[i] === "number" &&
            browserNumberValueTypes[valueName]) {
            keyframes[i] = browserNumberValueTypes[valueName].transform(keyframes[i]);
        }
    }
    if (!supportsPartialKeyframes() && keyframes.length < 2) {
        keyframes.unshift(read());
    }
}
const defaultEasing = "easeOut";
function getElementAnimationState(element) {
    const animationState = state.get(element) || new Map();
    state.set(element, animationState);
    return state.get(element);
}
class NativeAnimation extends NativeAnimationControls {
    constructor(element, valueName, valueKeyframes, options) {
        const isCSSVar = valueName.startsWith("--");
        invariant(typeof options.type !== "string");
        const existingAnimation = getElementAnimationState(element).get(valueName);
        existingAnimation && existingAnimation.stop();
        const readInitialKeyframe = () => {
            return valueName.startsWith("--")
                ? element.style.getPropertyValue(valueName)
                : window.getComputedStyle(element)[valueName];
        };
        if (!Array.isArray(valueKeyframes)) {
            valueKeyframes = [valueKeyframes];
        }
        hydrateKeyframes(valueName, valueKeyframes, readInitialKeyframe);
        // TODO: Replace this with toString()?
        if (isGenerator(options.type)) {
            const generatorOptions = createGeneratorEasing(options, 100, options.type);
            options.ease = supportsLinearEasing()
                ? generatorOptions.ease
                : defaultEasing;
            options.duration = secondsToMilliseconds(generatorOptions.duration);
            options.type = "keyframes";
        }
        else {
            options.ease = options.ease || defaultEasing;
        }
        const onFinish = () => {
            this.setValue(element, valueName, getFinalKeyframe(valueKeyframes, options));
            this.cancel();
            this.resolveFinishedPromise();
        };
        const init = () => {
            this.setValue = isCSSVar ? setCSSVar : setStyle;
            this.options = options;
            this.updateFinishedPromise();
            this.removeAnimation = () => {
                const elementState = state.get(element);
                elementState && elementState.delete(valueName);
            };
        };
        if (!supportsWaapi()) {
            super();
            init();
            onFinish();
        }
        else {
            super(startWaapiAnimation(element, valueName, valueKeyframes, options));
            init();
            if (options.autoplay === false) {
                this.animation.pause();
            }
            this.animation.onfinish = onFinish;
            getElementAnimationState(element).set(valueName, this);
        }
    }
    /**
     * Allows the returned animation to be awaited or promise-chained. Currently
     * resolves when the animation finishes at all but in a future update could/should
     * reject if its cancels.
     */
    then(resolve, reject) {
        return this.currentFinishedPromise.then(resolve, reject);
    }
    updateFinishedPromise() {
        this.currentFinishedPromise = new Promise((resolve) => {
            this.resolveFinishedPromise = resolve;
        });
    }
    play() {
        if (this.state === "finished") {
            this.updateFinishedPromise();
        }
        super.play();
    }
    cancel() {
        this.removeAnimation();
        super.cancel();
    }
}

function animateElements(elementOrSelector, keyframes, options, scope) {
    const elements = resolveElements(elementOrSelector, scope);
    const numElements = elements.length;
    const animations = [];
    for (let i = 0; i < numElements; i++) {
        const element = elements[i];
        const elementTransition = { ...options };
        /**
         * Resolve stagger function if provided.
         */
        if (typeof elementTransition.delay === "function") {
            elementTransition.delay = elementTransition.delay(i, numElements);
        }
        for (const valueName in keyframes) {
            const valueKeyframes = keyframes[valueName];
            const valueOptions = {
                ...getValueTransition$1(elementTransition, valueName),
            };
            valueOptions.duration = valueOptions.duration
                ? secondsToMilliseconds(valueOptions.duration)
                : valueOptions.duration;
            valueOptions.delay = secondsToMilliseconds(valueOptions.delay || 0);
            animations.push(new NativeAnimation(element, valueName, valueKeyframes, valueOptions));
        }
    }
    return animations;
}

const createScopedWaapiAnimate = (scope) => {
    function scopedAnimate(elementOrSelector, keyframes, options) {
        return new GroupPlaybackControls(animateElements(elementOrSelector, keyframes, options, scope));
    }
    return scopedAnimate;
};
const animateMini = /*@__PURE__*/ createScopedWaapiAnimate();

function useAnimateMini() {
    const scope = useConstant(() => ({
        current: null, // Will be hydrated by React
        animations: [],
    }));
    const animate = useConstant(() => createScopedWaapiAnimate(scope));
    useUnmountEffect(() => {
        scope.animations.forEach((animation) => animation.stop());
    });
    return [scope, animate];
}

/**
 * Creates `AnimationControls`, which can be used to manually start, stop
 * and sequence animations on one or more components.
 *
 * The returned `AnimationControls` should be passed to the `animate` property
 * of the components you want to animate.
 *
 * These components can then be animated with the `start` method.
 *
 * ```jsx
 * import * as React from 'react'
 * import { motion, useAnimation } from 'framer-motion'
 *
 * export function MyComponent(props) {
 *    const controls = useAnimation()
 *
 *    controls.start({
 *        x: 100,
 *        transition: { duration: 0.5 },
 *    })
 *
 *    return <motion.div animate={controls} />
 * }
 * ```
 *
 * @returns Animation controller with `start` and `stop` methods
 *
 * @public
 */
function useAnimationControls() {
    const controls = useConstant(animationControls);
    useIsomorphicLayoutEffect(controls.mount, []);
    return controls;
}
const useAnimation = useAnimationControls;

const {useContext: useContext$2} = await importShared('react');

function usePresenceData() {
    const context = useContext$2(PresenceContext);
    return context ? context.custom : undefined;
}

const {useEffect: useEffect$3} = await importShared('react');

/**
 * Attaches an event listener directly to the provided DOM element.
 *
 * Bypassing React's event system can be desirable, for instance when attaching non-passive
 * event handlers.
 *
 * ```jsx
 * const ref = useRef(null)
 *
 * useDomEvent(ref, 'wheel', onWheel, { passive: false })
 *
 * return <div ref={ref} />
 * ```
 *
 * @param ref - React.RefObject that's been provided to the element you want to bind the listener to.
 * @param eventName - Name of the event you want listen for.
 * @param handler - Function to fire when receiving the event.
 * @param options - Options to pass to `Event.addEventListener`.
 *
 * @public
 */
function useDomEvent(ref, eventName, handler, options) {
    useEffect$3(() => {
        const element = ref.current;
        if (handler && element) {
            return addDomEvent(element, eventName, handler, options);
        }
    }, [ref, eventName, handler, options]);
}

/**
 * Can manually trigger a drag gesture on one or more `drag`-enabled `motion` components.
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * function startDrag(event) {
 *   dragControls.start(event, { snapToCursor: true })
 * }
 *
 * return (
 *   <>
 *     <div onPointerDown={startDrag} />
 *     <motion.div drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @public
 */
class DragControls {
    constructor() {
        this.componentControls = new Set();
    }
    /**
     * Subscribe a component's internal `VisualElementDragControls` to the user-facing API.
     *
     * @internal
     */
    subscribe(controls) {
        this.componentControls.add(controls);
        return () => this.componentControls.delete(controls);
    }
    /**
     * Start a drag gesture on every `motion` component that has this set of drag controls
     * passed into it via the `dragControls` prop.
     *
     * ```jsx
     * dragControls.start(e, {
     *   snapToCursor: true
     * })
     * ```
     *
     * @param event - PointerEvent
     * @param options - Options
     *
     * @public
     */
    start(event, options) {
        this.componentControls.forEach((controls) => {
            controls.start(event.nativeEvent || event, options);
        });
    }
}
const createDragControls = () => new DragControls();
/**
 * Usually, dragging is initiated by pressing down on a `motion` component with a `drag` prop
 * and moving it. For some use-cases, for instance clicking at an arbitrary point on a video scrubber, we
 * might want to initiate that dragging from a different component than the draggable one.
 *
 * By creating a `dragControls` using the `useDragControls` hook, we can pass this into
 * the draggable component's `dragControls` prop. It exposes a `start` method
 * that can start dragging from pointer events on other components.
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * function startDrag(event) {
 *   dragControls.start(event, { snapToCursor: true })
 * }
 *
 * return (
 *   <>
 *     <div onPointerDown={startDrag} />
 *     <motion.div drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @public
 */
function useDragControls() {
    return useConstant(createDragControls);
}

/**
 * Checks if a component is a `motion` component.
 */
function isMotionComponent(component) {
    return (component !== null &&
        typeof component === "object" &&
        motionComponentSymbol in component);
}

/**
 * Unwraps a `motion` component and returns either a string for `motion.div` or
 * the React component for `motion(Component)`.
 *
 * If the component is not a `motion` component it returns undefined.
 */
function unwrapMotionComponent(component) {
    if (isMotionComponent(component)) {
        return component[motionComponentSymbol];
    }
    return undefined;
}

function useInstantLayoutTransition() {
    return startTransition;
}
function startTransition(callback) {
    if (!rootProjectionNode.current)
        return;
    rootProjectionNode.current.isUpdating = false;
    rootProjectionNode.current.blockUpdate();
    callback && callback();
}

const {useCallback: useCallback$1} = await importShared('react');

function useResetProjection() {
    const reset = useCallback$1(() => {
        const root = rootProjectionNode.current;
        if (!root)
            return;
        root.resetTree();
    }, []);
    return reset;
}

const {useRef: useRef$2,useState: useState$2,useCallback} = await importShared('react');

/**
 * Cycles through a series of visual properties. Can be used to toggle between or cycle through animations. It works similar to `useState` in React. It is provided an initial array of possible states, and returns an array of two arguments.
 *
 * An index value can be passed to the returned `cycle` function to cycle to a specific index.
 *
 * ```jsx
 * import * as React from "react"
 * import { motion, useCycle } from "framer-motion"
 *
 * export const MyComponent = () => {
 *   const [x, cycleX] = useCycle(0, 50, 100)
 *
 *   return (
 *     <motion.div
 *       animate={{ x: x }}
 *       onTap={() => cycleX()}
 *      />
 *    )
 * }
 * ```
 *
 * @param items - items to cycle through
 * @returns [currentState, cycleState]
 *
 * @public
 */
function useCycle(...items) {
    const index = useRef$2(0);
    const [item, setItem] = useState$2(items[index.current]);
    const runCycle = useCallback((next) => {
        index.current =
            typeof next !== "number"
                ? wrap(0, items.length, index.current + 1)
                : next;
        setItem(items[index.current]);
    }, 
    // The array will change on each call, but by putting items.length at
    // the front of this array, we guarantee the dependency comparison will match up
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.length, ...items]);
    return [item, runCycle];
}

const thresholds = {
    some: 0,
    all: 1,
};
function inView(elementOrSelector, onStart, { root, margin: rootMargin, amount = "some" } = {}) {
    const elements = resolveElements(elementOrSelector);
    const activeIntersections = new WeakMap();
    const onIntersectionChange = (entries) => {
        entries.forEach((entry) => {
            const onEnd = activeIntersections.get(entry.target);
            /**
             * If there's no change to the intersection, we don't need to
             * do anything here.
             */
            if (entry.isIntersecting === Boolean(onEnd))
                return;
            if (entry.isIntersecting) {
                const newOnEnd = onStart(entry.target, entry);
                if (typeof newOnEnd === "function") {
                    activeIntersections.set(entry.target, newOnEnd);
                }
                else {
                    observer.unobserve(entry.target);
                }
            }
            else if (typeof onEnd === "function") {
                onEnd(entry);
                activeIntersections.delete(entry.target);
            }
        });
    };
    const observer = new IntersectionObserver(onIntersectionChange, {
        root,
        rootMargin,
        threshold: typeof amount === "number" ? amount : thresholds[amount],
    });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
}

const {useState: useState$1,useEffect: useEffect$2} = await importShared('react');

function useInView(ref, { root, margin, amount, once = false, initial = false, } = {}) {
    const [isInView, setInView] = useState$1(initial);
    useEffect$2(() => {
        if (!ref.current || (once && isInView))
            return;
        const onEnter = () => {
            setInView(true);
            return once ? undefined : () => setInView(false);
        };
        const options = {
            root: (root && root.current) || undefined,
            margin,
            amount,
        };
        return inView(ref.current, onEnter, options);
    }, [root, ref, margin, once, amount]);
    return isInView;
}

const {useRef: useRef$1,useEffect: useEffect$1} = await importShared('react');

function useInstantTransition() {
    const [forceUpdate, forcedRenderCount] = useForceUpdate();
    const startInstantLayoutTransition = useInstantLayoutTransition();
    const unlockOnFrameRef = useRef$1(-1);
    useEffect$1(() => {
        /**
         * Unblock after two animation frames, otherwise this will unblock too soon.
         */
        frame.postRender(() => frame.postRender(() => {
            /**
             * If the callback has been called again after the effect
             * triggered this 2 frame delay, don't unblock animations. This
             * prevents the previous effect from unblocking the current
             * instant transition too soon. This becomes more likely when
             * used in conjunction with React.startTransition().
             */
            if (forcedRenderCount !== unlockOnFrameRef.current)
                return;
            instantAnimationState.current = false;
        }));
    }, [forcedRenderCount]);
    return (callback) => {
        startInstantLayoutTransition(() => {
            instantAnimationState.current = true;
            forceUpdate();
            callback();
            unlockOnFrameRef.current = forcedRenderCount + 1;
        });
    };
}
function disableInstantTransitions() {
    instantAnimationState.current = false;
}

const appearStoreId = (elementId, valueName) => {
    const key = transformProps.has(valueName) ? "transform" : valueName;
    return `${elementId}: ${key}`;
};

const appearAnimationStore = new Map();
const appearComplete = new Map();

function handoffOptimizedAppearAnimation(elementId, valueName, frame) {
    var _a;
    const storeId = appearStoreId(elementId, valueName);
    const optimisedAnimation = appearAnimationStore.get(storeId);
    if (!optimisedAnimation) {
        return null;
    }
    const { animation, startTime } = optimisedAnimation;
    function cancelAnimation() {
        var _a;
        (_a = window.MotionCancelOptimisedAnimation) === null || _a === undefined ? undefined : _a.call(window, elementId, valueName, frame);
    }
    /**
     * We can cancel the animation once it's finished now that we've synced
     * with Motion.
     *
     * Prefer onfinish over finished as onfinish is backwards compatible with
     * older browsers.
     */
    animation.onfinish = cancelAnimation;
    if (startTime === null || ((_a = window.MotionHandoffIsComplete) === null || _a === undefined ? undefined : _a.call(window, elementId))) {
        /**
         * If the startTime is null, this animation is the Paint Ready detection animation
         * and we can cancel it immediately without handoff.
         *
         * Or if we've already handed off the animation then we're now interrupting it.
         * In which case we need to cancel it.
         */
        cancelAnimation();
        return null;
    }
    else {
        return startTime;
    }
}

/**
 * A single time to use across all animations to manually set startTime
 * and ensure they're all in sync.
 */
let startFrameTime;
/**
 * A dummy animation to detect when Chrome is ready to start
 * painting the page and hold off from triggering the real animation
 * until then. We only need one animation to detect paint ready.
 *
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1406850
 */
let readyAnimation;
/**
 * Keep track of animations that were suspended vs cancelled so we
 * can easily resume them when we're done measuring layout.
 */
const suspendedAnimations = new Set();
function resumeSuspendedAnimations() {
    suspendedAnimations.forEach((data) => {
        data.animation.play();
        data.animation.startTime = data.startTime;
    });
    suspendedAnimations.clear();
}
function startOptimizedAppearAnimation(element, name, keyframes, options, onReady) {
    // Prevent optimised appear animations if Motion has already started animating.
    if (window.MotionIsMounted) {
        return;
    }
    const id = element.dataset[optimizedAppearDataId];
    if (!id)
        return;
    window.MotionHandoffAnimation = handoffOptimizedAppearAnimation;
    const storeId = appearStoreId(id, name);
    if (!readyAnimation) {
        readyAnimation = startWaapiAnimation(element, name, [keyframes[0], keyframes[0]], 
        /**
         * 10 secs is basically just a super-safe duration to give Chrome
         * long enough to get the animation ready.
         */
        { duration: 10000, ease: "linear" });
        appearAnimationStore.set(storeId, {
            animation: readyAnimation,
            startTime: null,
        });
        /**
         * If there's no readyAnimation then there's been no instantiation
         * of handoff animations.
         */
        window.MotionHandoffAnimation = handoffOptimizedAppearAnimation;
        window.MotionHasOptimisedAnimation = (elementId, valueName) => {
            if (!elementId)
                return false;
            /**
             * Keep a map of elementIds that have started animating. We check
             * via ID instead of Element because of hydration errors and
             * pre-hydration checks. We also actively record IDs as they start
             * animating rather than simply checking for data-appear-id as
             * this attrbute might be present but not lead to an animation, for
             * instance if the element's appear animation is on a different
             * breakpoint.
             */
            if (!valueName) {
                return appearComplete.has(elementId);
            }
            const animationId = appearStoreId(elementId, valueName);
            return Boolean(appearAnimationStore.get(animationId));
        };
        window.MotionHandoffMarkAsComplete = (elementId) => {
            if (appearComplete.has(elementId)) {
                appearComplete.set(elementId, true);
            }
        };
        window.MotionHandoffIsComplete = (elementId) => {
            return appearComplete.get(elementId) === true;
        };
        /**
         * We only need to cancel transform animations as
         * they're the ones that will interfere with the
         * layout animation measurements.
         */
        window.MotionCancelOptimisedAnimation = (elementId, valueName, frame, canResume) => {
            const animationId = appearStoreId(elementId, valueName);
            const data = appearAnimationStore.get(animationId);
            if (!data)
                return;
            if (frame && canResume === undefined) {
                /**
                 * Wait until the end of the subsequent frame to cancel the animation
                 * to ensure we don't remove the animation before the main thread has
                 * had a chance to resolve keyframes and render.
                 */
                frame.postRender(() => {
                    frame.postRender(() => {
                        data.animation.cancel();
                    });
                });
            }
            else {
                data.animation.cancel();
            }
            if (frame && canResume) {
                suspendedAnimations.add(data);
                frame.render(resumeSuspendedAnimations);
            }
            else {
                appearAnimationStore.delete(animationId);
                /**
                 * If there are no more animations left, we can remove the cancel function.
                 * This will let us know when we can stop checking for conflicting layout animations.
                 */
                if (!appearAnimationStore.size) {
                    window.MotionCancelOptimisedAnimation = undefined;
                }
            }
        };
        window.MotionCheckAppearSync = (visualElement, valueName, value) => {
            var _a, _b;
            const appearId = getOptimisedAppearId(visualElement);
            if (!appearId)
                return;
            const valueIsOptimised = (_a = window.MotionHasOptimisedAnimation) === null || _a === undefined ? undefined : _a.call(window, appearId, valueName);
            const externalAnimationValue = (_b = visualElement.props.values) === null || _b === undefined ? undefined : _b[valueName];
            if (!valueIsOptimised || !externalAnimationValue)
                return;
            const removeSyncCheck = value.on("change", (latestValue) => {
                var _a;
                if (externalAnimationValue.get() !== latestValue) {
                    (_a = window.MotionCancelOptimisedAnimation) === null || _a === undefined ? undefined : _a.call(window, appearId, valueName);
                    removeSyncCheck();
                }
            });
            return removeSyncCheck;
        };
    }
    const startAnimation = () => {
        readyAnimation.cancel();
        const appearAnimation = startWaapiAnimation(element, name, keyframes, options);
        /**
         * Record the time of the first started animation. We call performance.now() once
         * here and once in handoff to ensure we're getting
         * close to a frame-locked time. This keeps all animations in sync.
         */
        if (startFrameTime === undefined) {
            startFrameTime = performance.now();
        }
        appearAnimation.startTime = startFrameTime;
        appearAnimationStore.set(storeId, {
            animation: appearAnimation,
            startTime: startFrameTime,
        });
        if (onReady)
            onReady(appearAnimation);
    };
    appearComplete.set(id, false);
    if (readyAnimation.ready) {
        readyAnimation.ready.then(startAnimation).catch(noop);
    }
    else {
        startAnimation();
    }
}

const {useState,useLayoutEffect} = await importShared('react');

const createObject = () => ({});
class StateVisualElement extends VisualElement {
    constructor() {
        super(...arguments);
        this.measureInstanceViewportBox = createBox;
    }
    build() { }
    resetTransform() { }
    restoreTransform() { }
    removeValueFromRenderState() { }
    renderInstance() { }
    scrapeMotionValuesFromProps() {
        return createObject();
    }
    getBaseTargetFromProps() {
        return undefined;
    }
    readValueFromInstance(_state, key, options) {
        return options.initialState[key] || 0;
    }
    sortInstanceNodePosition() {
        return 0;
    }
}
const useVisualState = makeUseVisualState({
    scrapeMotionValuesFromProps: createObject,
    createRenderState: createObject,
});
/**
 * This is not an officially supported API and may be removed
 * on any version.
 */
function useAnimatedState(initialState) {
    const [animationState, setAnimationState] = useState(initialState);
    const visualState = useVisualState({}, false);
    const element = useConstant(() => {
        return new StateVisualElement({
            props: {
                onUpdate: (v) => {
                    setAnimationState({ ...v });
                },
            },
            visualState,
            presenceContext: null,
        }, { initialState });
    });
    useLayoutEffect(() => {
        element.mount({});
        return () => element.unmount();
    }, [element]);
    const startAnimation = useConstant(() => (animationDefinition) => {
        return animateVisualElement(element, animationDefinition);
    });
    return [animationState, startAnimation];
}

const React = await importShared('react');

let id = 0;
const AnimateSharedLayout = ({ children }) => {
    React.useEffect(() => {
    }, []);
    return (jsxRuntimeExports.jsx(LayoutGroup, { id: useConstant(() => `asl-${id++}`), children: children }));
};

const {useContext: useContext$1} = await importShared('react');


// Keep things reasonable and avoid scale: Infinity. In practise we might need
// to add another value, opacity, that could interpolate scaleX/Y [0,0.01] => [0,1]
// to simply hide content at unreasonable scales.
const maxScale = 100000;
const invertScale = (scale) => scale > 0.001 ? 1 / scale : maxScale;
/**
 * Returns a `MotionValue` each for `scaleX` and `scaleY` that update with the inverse
 * of their respective parent scales.
 *
 * This is useful for undoing the distortion of content when scaling a parent component.
 *
 * By default, `useInvertedScale` will automatically fetch `scaleX` and `scaleY` from the nearest parent.
 * By passing other `MotionValue`s in as `useInvertedScale({ scaleX, scaleY })`, it will invert the output
 * of those instead.
 *
 * ```jsx
 * const MyComponent = () => {
 *   const { scaleX, scaleY } = useInvertedScale()
 *   return <motion.div style={{ scaleX, scaleY }} />
 * }
 * ```
 *
 * @deprecated
 */
function useInvertedScale(scale) {
    let parentScaleX = useMotionValue(1);
    let parentScaleY = useMotionValue(1);
    const { visualElement } = useContext$1(MotionContext);
    if (scale) {
        parentScaleX = scale.scaleX || parentScaleX;
        parentScaleY = scale.scaleY || parentScaleY;
    }
    else if (visualElement) {
        parentScaleX = visualElement.getValue("scaleX", 1);
        parentScaleY = visualElement.getValue("scaleY", 1);
    }
    const scaleX = useTransform(parentScaleX, invertScale);
    const scaleY = useTransform(parentScaleY, invertScale);
    return { scaleX, scaleY };
}

const {createContext} = await importShared('react');


const ReorderContext = createContext(null);

function checkReorder(order, value, offset, velocity) {
    if (!velocity)
        return order;
    const index = order.findIndex((item) => item.value === value);
    if (index === -1)
        return order;
    const nextOffset = velocity > 0 ? 1 : -1;
    const nextItem = order[index + nextOffset];
    if (!nextItem)
        return order;
    const item = order[index];
    const nextLayout = nextItem.layout;
    const nextItemCenter = mixNumber(nextLayout.min, nextLayout.max, 0.5);
    if ((nextOffset === 1 && item.layout.max + offset > nextItemCenter) ||
        (nextOffset === -1 && item.layout.min + offset < nextItemCenter)) {
        return moveItem(order, index, index + nextOffset);
    }
    return order;
}

const {forwardRef: forwardRef$1,useRef,useEffect} = await importShared('react');

function ReorderGroupComponent({ children, as = "ul", axis = "y", onReorder, values, ...props }, externalRef) {
    const Component = useConstant(() => motion[as]);
    const order = [];
    const isReordering = useRef(false);
    const context = {
        axis,
        registerItem: (value, layout) => {
            // If the entry was already added, update it rather than adding it again
            const idx = order.findIndex((entry) => value === entry.value);
            if (idx !== -1) {
                order[idx].layout = layout[axis];
            }
            else {
                order.push({ value: value, layout: layout[axis] });
            }
            order.sort(compareMin);
        },
        updateOrder: (item, offset, velocity) => {
            if (isReordering.current)
                return;
            const newOrder = checkReorder(order, item, offset, velocity);
            if (order !== newOrder) {
                isReordering.current = true;
                onReorder(newOrder
                    .map(getValue)
                    .filter((value) => values.indexOf(value) !== -1));
            }
        },
    };
    useEffect(() => {
        isReordering.current = false;
    });
    return (jsxRuntimeExports.jsx(Component, { ...props, ref: externalRef, ignoreStrict: true, children: jsxRuntimeExports.jsx(ReorderContext.Provider, { value: context, children: children }) }));
}
const ReorderGroup = /*@__PURE__*/ forwardRef$1(ReorderGroupComponent);
function getValue(item) {
    return item.value;
}
function compareMin(a, b) {
    return a.layout.min - b.layout.min;
}

const {forwardRef,useContext} = await importShared('react');

function useDefaultMotionValue(value, defaultValue = 0) {
    return isMotionValue(value) ? value : useMotionValue(defaultValue);
}
function ReorderItemComponent({ children, style = {}, value, as = "li", onDrag, layout = true, ...props }, externalRef) {
    const Component = useConstant(() => motion[as]);
    const context = useContext(ReorderContext);
    const point = {
        x: useDefaultMotionValue(style.x),
        y: useDefaultMotionValue(style.y),
    };
    const zIndex = useTransform([point.x, point.y], ([latestX, latestY]) => latestX || latestY ? 1 : "unset");
    const { axis, registerItem, updateOrder } = context;
    return (jsxRuntimeExports.jsx(Component, { drag: axis, ...props, dragSnapToOrigin: true, style: { ...style, x: point.x, y: point.y, zIndex }, layout: layout, onDrag: (event, gesturePoint) => {
            const { velocity } = gesturePoint;
            velocity[axis] &&
                updateOrder(value, point[axis].get(), velocity[axis]);
            onDrag && onDrag(event, gesturePoint);
        }, onLayoutMeasure: (measured) => registerItem(value, measured), ref: externalRef, ignoreStrict: true, children: children }));
}
const ReorderItem = /*@__PURE__*/ forwardRef(ReorderItemComponent);

const namespace = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    Group: ReorderGroup,
    Item: ReorderItem
}, Symbol.toStringTag, { value: 'Module' }));

function getOriginIndex(from, total) {
    if (from === "first") {
        return 0;
    }
    else {
        const lastIndex = total - 1;
        return from === "last" ? lastIndex : lastIndex / 2;
    }
}
function stagger(duration = 0.1, { startDelay = 0, from = 0, ease } = {}) {
    return (i, total) => {
        const fromIndex = typeof from === "number" ? from : getOriginIndex(from, total);
        const distance = Math.abs(fromIndex - i);
        let delay = duration * distance;
        if (ease) {
            const maxDelay = total * duration;
            const easingFunction = easingDefinitionToFunction(ease);
            delay = easingFunction(delay / maxDelay) * maxDelay;
        }
        return startDelay + delay;
    };
}

/**
 * @deprecated
 *
 * Import as `frame` instead.
 */
const sync = frame;
/**
 * @deprecated
 *
 * Use cancelFrame(callback) instead.
 */
const cancelSync = stepsOrder.reduce((acc, key) => {
    acc[key] = (process) => cancelFrame(process);
    return acc;
}, {});

function steps(numSteps, direction = "end") {
    return (progress) => {
        progress =
            direction === "end"
                ? Math.min(progress, 0.999)
                : Math.max(progress, 0.001);
        const expanded = progress * numSteps;
        const rounded = direction === "end" ? Math.floor(expanded) : Math.ceil(expanded);
        return clamp(0, 1, rounded / numSteps);
    };
}

export { AnimateSharedLayout, DragControls, LayoutGroup, MotionConfigContext, MotionContext, PresenceContext, namespace as Reorder, VisualElement, animate, animateMini, animateValue, animateVisualElement, animationControls, animations, cancelFrame, cancelSync, clamp, createBox, createScopedAnimate, disableInstantTransitions, domMin, frame, frameData, inView, interpolate, invariant, isMotionComponent, isMotionValue, makeUseVisualState, motion, motionValue, noop, progress, scroll, scrollInfo, spring, stagger, startOptimizedAppearAnimation, steps, sync, transform, unwrapMotionComponent, useAnimate, useAnimateMini, useAnimation, useAnimationControls, useAnimationFrame, useCycle, useAnimatedState as useDeprecatedAnimatedState, useInvertedScale as useDeprecatedInvertedScale, useDomEvent, useDragControls, useElementScroll, useForceUpdate, useInView, useInstantLayoutTransition, useInstantTransition, useIsomorphicLayoutEffect, useMotionTemplate, useMotionValue, useMotionValueEvent, usePresenceData, useReducedMotion, useReducedMotionConfig, useResetProjection, useScroll, useSpring, useTime, useTransform, useUnmountEffect, useVelocity, useViewportScroll, visualElementStore, wrap };
