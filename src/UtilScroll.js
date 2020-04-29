async function scrollTo(el, options = {}) {
  if (!(el instanceof Element) && !(el instanceof Window)) {
    throw new Error(
      `element passed to scrollTo() must be either the window or a DOM element, you passed ${el}!`
    );
  }
  options = sanitizeScrollOptions(options);
  const scroll = (
    from,
    to,
    prop,
    startTime,
    duration = 300,
    easeFunc,
    callback
  ) => {
    window.requestAnimationFrame(() => {
      const currentTime = Date.now();
      const time = Math.min(
        1,
        (currentTime - startTime) / duration
      );
      if (from === to) {
        return callback ? callback() : null;
      }
      setScrollPosition(
        el,
        easeFunc(time) * (to - from) + from
      );
      /* prevent scrolling, if already there, or at end */
      if (time < 1) {
        scroll(
          from,
          to,
          prop,
          startTime,
          duration,
          easeFunc,
          callback
        );
      } else if (callback) {
        callback();
      }
    });
  };
  const currentScrollPosition = getScrollPosition(el);
  const scrollProperty = getScrollPropertyByElement(el);
  return new Promise(resolve => {
    scroll(
      currentScrollPosition,
      typeof options.top === "number"
        ? options.top
        : currentScrollPosition,
      scrollProperty,
      Date.now(),
      options.duration,
      getEasing(options.easing),
      resolve
    );
  });
}
function getScrollPropertyByElement(el) {
  const props = {
    window: {
      y: "scrollY",
      x: "scrollX"
    },
    element: {
      y: "scrollTop",
      x: "scrollLeft"
    }
  };
  const axis = "y";
  if (el instanceof Window) {
    return props.window[axis];
  } else {
    return props.element[axis];
  }
}
function sanitizeScrollOptions(options = {}) {
  if (options.behavior === "smooth") {
    options.easing = "ease-in-out";
    options.duration = 300;
  }
  if (options.behavior === "auto") {
    options.duration = 0;
    options.easing = "linear";
  }
  return options;
}
function getScrollPosition(el) {
  const document = utils.getDocument();
  if (
    el === document.body ||
    el === document.documentElement ||
    el instanceof Window
  ) {
    return (
      document.body.scrollTop ||
      document.documentElement.scrollTop
    );
  } else {
    return el.scrollTop;
  }
}
function setScrollPosition(el, value) {
  const document = utils.getDocument();
  if (
    el === document.body ||
    el === document.documentElement ||
    el instanceof Window
  ) {
    document.body.scrollTop = value;
    document.documentElement.scrollTop = value;
  } else {
    el.scrollTop = value;
  }
}
const utils = {
  // we're really just exporting this so that tests can mock the document.documentElement
  getDocument() {
    return document;
  }
};
const easingMap = {
  linear(t) {
    return t;
  },
  "ease-in"(t) {
    return t * t;
  },
  "ease-out"(t) {
    return t * (2 - t);
  },
  "ease-in-out"(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
};
const getEasing = easing => {
  const defaultEasing = "linear";
  const easeFunc = easingMap[easing || defaultEasing];
  if (!easeFunc) {
    const options = Object.keys(easingMap).join(",");
    throw new Error(
      `Scroll error: scroller does not support an easing option of "${easing}". Supported options are ${options}`
    );
  }
  return easeFunc;
};

export { easingMap, scrollTo, utils };
