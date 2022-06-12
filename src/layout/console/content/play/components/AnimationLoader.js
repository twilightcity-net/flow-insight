import AnimationId from "./AnimationId";
import * as ReactDOMServer from "react-dom/server";

/**
 * Loads images from scratch, then stores in an image cache by size
 */

export default class AnimationLoader {
  constructor() {
    this.imageCaches = [];
    this.staticImages = [];
  }

  getStaticImage(p5, imagePath) {
    let staticImage = this.staticImages[imagePath];
    if (!staticImage) {
      staticImage = p5.loadImage(imagePath);
      this.staticImages[imagePath] = staticImage;
    }
    return staticImage;
  }

  clear12FrameAnimationCache(animationName) {
    for (let i = 1; i <= 12; i++) {
      this.imageCaches[animationName + "_" + i] = [];
    }
  }

  clearSingleAnimationFrameCache(animationName, frame) {
    this.imageCaches[animationName + "_" + frame] = [];
  }

  clearScaledSvgCache(animationName) {
    this.imageCaches[animationName] = [];
  }

  clearStaticImageCache(imagePath) {
    this.staticImages[imagePath] = null;
  }

  getStaticSvgImage(p5, animationId) {
    let imageCache = this.getDefaultImageCache(animationId);
    let staticImage = imageCache["default"];
    if (!staticImage) {
      let svg1 = document.getElementById(animationId);
      let xml = new XMLSerializer().serializeToString(svg1);
      var svg = new Blob([xml], { type: "image/svg+xml" });

      var DOMURL = window.URL || window.webkitURL || window;
      var url = DOMURL.createObjectURL(svg);

      staticImage = p5.loadImage(url);
      imageCache["default"] = staticImage;
    }

    return staticImage;
  }

  getScaledSvgImage(p5, animationId, width, height) {
    let imageCache = this.getDefaultImageCache(animationId);
    let staticImage = imageCache[width];
    if (!staticImage) {
      let svg1 = document.getElementById(animationId);
      svg1.setAttribute("width", width + "px");
      if (height) {
        svg1.setAttribute("height", height + "px");
      }

      let xml = new XMLSerializer().serializeToString(svg1);
      var svg = new Blob([xml], { type: "image/svg+xml" });

      var DOMURL = window.URL || window.webkitURL || window;
      var url = DOMURL.createObjectURL(svg);

      staticImage = p5.loadImage(url);
      imageCache[width] = staticImage;
    }

    return staticImage;
  }

  loadPrecoloredSvg(p5, imageFamilyName, valueKey, svgObj) {
    const cache = this.getDefaultImageCache(imageFamilyName);
    const image = cache[valueKey];
    if (image) {
      return image;
    } else {
      let xml = ReactDOMServer.renderToStaticMarkup(svgObj);
      const svg = new Blob([xml], { type: "image/svg+xml" });

      const DOMURL = window.URL || window.webkitURL || window;
      const url = DOMURL.createObjectURL(svg);

      cache[valueKey] = p5.loadImage(url);
      return cache[valueKey];
    }
  }

  getPrecoloredSvg(imageFamilyName, valueKey) {
    const cache = this.getDefaultImageCache(imageFamilyName);
    return cache[valueKey];
  }

  getAnimationImageWithManualFrame(
    p5,
    animationName,
    frame,
    size
  ) {
    let cache = this.getDefaultImageCache(
      animationName + "_" + frame
    );
    let image = cache[size];
    if (image) {
      return image;
    } else {
      let animationId = AnimationId.getIdOn12(
        animationName,
        frame
      );
      let svg1 = document.getElementById(animationId);
      svg1.setAttribute("width", size + "px");

      let xml = new XMLSerializer().serializeToString(svg1);
      var svg = new Blob([xml], { type: "image/svg+xml" });

      var DOMURL = window.URL || window.webkitURL || window;
      var url = DOMURL.createObjectURL(svg);

      cache[size] = p5.loadImage(url);
      return cache[size];
    }
  }

  getAnimationImageWithFallback(p5, animationName, fallbackAnimationName, frameOn24, size) {
    let cache = this.getImageCache(
      animationName,
      frameOn24
    );
    let image = cache[size];
    if (!image) {
      return this.getAnimationImage(p5, fallbackAnimationName, frameOn24, size);
    } else {
      console.log(image);
      return image;
    }
  }

  getAnimationImage(p5, animationName, frameOn24, size) {
    let cache = this.getImageCache(
      animationName,
      frameOn24
    );
    let image = cache[size];
    if (image) {
      return image;
    } else {
      let animationId = AnimationId.getIdOn24(
        animationName,
        frameOn24
      );
      let svg1 = document.getElementById(animationId);
      svg1.setAttribute("width", size + "px");

      let xml = new XMLSerializer().serializeToString(svg1);
      var svg = new Blob([xml], { type: "image/svg+xml" });

      var DOMURL = window.URL || window.webkitURL || window;
      var url = DOMURL.createObjectURL(svg);

      cache[size] = p5.loadImage(url);
      return cache[size];
    }
  }

  cacheImage(animationName, frameOn24, size, image) {
    let cache = this.getImageCache(
      animationName,
      frameOn24
    );
    cache[size] = image;
  }

  getDefaultImageCache(animationId) {
    let cache = this.imageCaches[animationId];
    if (!cache) {
      cache = [];
      this.imageCaches[animationId] = cache;
    }
    return cache;
  }

  getImageCache(animationName, animationFrame) {
    let frameOnTwos = AnimationId.getFrameOnTwos(animationFrame);

    let key = animationName + "_" + frameOnTwos;

    let cache = this.imageCaches[key];
    if (!cache) {
      cache = [];
      this.imageCaches[key] = cache;
    }
    return cache;
  }
}
