import AnimationId from "./AnimationId";

/**
 * Loads images from scratch, then stores in an image cache by size
 */

export default class AnimationLoader {

  constructor() {
    this.imageCaches = [];
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


  getAnimationImage(p5, animationName, frameOn24, size) {
    let cache = this.getImageCache(animationName, frameOn24);
    let image = cache[size];
    if (image) {
      return image;
    } else {
      let animationId = AnimationId.getIdOn24(animationName, frameOn24);
      let svg1 = document.getElementById(animationId);
      svg1.setAttribute("width", size + "px");

      let xml = new XMLSerializer().serializeToString(svg1);
      var svg = new Blob([xml], {type: 'image/svg+xml'});

      var DOMURL = window.URL || window.webkitURL || window;
      var url = DOMURL.createObjectURL(svg);

      cache[size] = p5.loadImage(url);
      return cache[size];
    }
  }
}
