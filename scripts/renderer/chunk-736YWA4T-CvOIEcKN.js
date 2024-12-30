import { r as requireReact } from './index-Cqtx7DH9.js';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production_min;

function requireReactJsxRuntime_production_min () {
	if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
	hasRequiredReactJsxRuntime_production_min = 1;
var f=requireReact(),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};
	function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
	return reactJsxRuntime_production_min;
}

var hasRequiredJsxRuntime;

function requireJsxRuntime () {
	if (hasRequiredJsxRuntime) return jsxRuntime.exports;
	hasRequiredJsxRuntime = 1;
	{
	  jsxRuntime.exports = /*@__PURE__*/ requireReactJsxRuntime_production_min();
	}
	return jsxRuntime.exports;
}

var jsxRuntimeExports = /*@__PURE__*/ requireJsxRuntime();

// src/transition-utils.ts
var TRANSITION_EASINGS = {
  ease: [0.36, 0.66, 0.4, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: [0.155, 1.105, 0.295, 1.12],
  springOut: [0.57, -0.15, 0.62, 0.07],
  softSpring: [0.16, 1.11, 0.3, 1.02]
};
var TRANSITION_VARIANTS = {
  scaleSpring: {
    enter: {
      transform: "scale(1)",
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0,
        duration: 0.2
      }
    },
    exit: {
      transform: "scale(0.85)",
      opacity: 0,
      transition: {
        type: "easeOut",
        duration: 0.15
      }
    }
  },
  scaleSpringOpacity: {
    initial: {
      opacity: 0,
      transform: "scale(0.8)"
    },
    enter: {
      opacity: 1,
      transform: "scale(1)",
      transition: {
        type: "spring",
        bounce: 0,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      transform: "scale(0.96)",
      transition: {
        type: "easeOut",
        bounce: 0,
        duration: 0.15
      }
    }
  },
  scale: {
    enter: { scale: 1 },
    exit: { scale: 0.95 }
  },
  scaleFadeIn: {
    enter: {
      transform: "scale(1)",
      opacity: 1,
      transition: {
        duration: 0.25,
        ease: TRANSITION_EASINGS.easeIn
      }
    },
    exit: {
      transform: "scale(0.95)",
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: TRANSITION_EASINGS.easeOut
      }
    }
  },
  scaleInOut: {
    enter: {
      transform: "scale(1)",
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: TRANSITION_EASINGS.ease
      }
    },
    exit: {
      transform: "scale(1.03)",
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: TRANSITION_EASINGS.ease
      }
    }
  },
  fade: {
    enter: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: TRANSITION_EASINGS.ease
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: TRANSITION_EASINGS.ease
      }
    }
  },
  collapse: {
    enter: {
      opacity: 1,
      height: "auto",
      transition: {
        height: {
          type: "spring",
          bounce: 0,
          duration: 0.3
        },
        opacity: {
          easings: "ease",
          duration: 0.4
        }
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        easings: "ease",
        duration: 0.3
      }
    }
  }
};

export { TRANSITION_VARIANTS as T, TRANSITION_EASINGS as a, jsxRuntimeExports as j };
