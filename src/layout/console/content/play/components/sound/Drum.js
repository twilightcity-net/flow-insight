/**
 * Creates a drum instrument in p5.sound
 */

export default class Drum {

  preload(p5) {

    this.isSoundReady = false;
    this.isPlaying = false;

    this.animationFrame = 0;
    this.quarterLength = 12; //120 bpm quarter note at 24fps

    this.quarter = 0;
    this.eighth = 0;
    this.sixteenth = 0;
    this.bar = 1;
    this.loop = 1;

    this.quarterOn = false;
    this.eighthOn = false;
    this.sixteenthOn = false;

    this.hatVariations = this.createRandomVariations(p5, 4 * 16, 0.2, 1);
    this.kickVariations = this.createRangeVariations(p5, 4 * 4, 0.4, 0.7);

    this.kick = new Audio("./assets/sound/191610__dwsd__jhd-bd-3.wav");
    this.hat = new Audio("./assets/sound/191632__dwsd__jhd-hat-1.wav");
    this.clap = new Audio("./assets/sound/191620__dwsd__jhd-clp-37.wav");

  }

  initSounds() {
    this.isSoundReady = false;
    this.soundsLoaded = 0;
    this.playKick();
    this.playClap();
    this.playHat();
  }

  unload(p5) {
    this.isPlaying = false;
  }

  onSoundLoad = () => {
    if (!this.isSoundReady) {
      this.soundsLoaded++;
      console.log("load");
      if (this.soundsLoaded === 3) {
        this.isSoundReady = true;
        console.log("ready!");
      }
    }
  }

  playKick(optionalVolume) {
    if (optionalVolume) {
      this.kick.volume = optionalVolume;
    } else {
      this.kick.volume = this.getVolumeWhenReady(this.getQuarterVariation(this.kickVariations, 1));
    }
    this.kick.currentTime = 0;
    this.kick.play().then(this.onSoundLoad);
  }

  playClap(optionalVolume) {
    if (optionalVolume) {
      this.clap.volume = optionalVolume;
    } else {
      this.clap.volume = this.getVolumeWhenReady(this.getQuarterVariation(this.kickVariations, 4));
    }
    this.clap.currentTime = 0;
    this.clap.play().then(this.onSoundLoad);
  }

  playHat(optionalVolume) {
    let volume;
    if (optionalVolume) {
      volume = optionalVolume;
    } else {
      volume = this.getVolumeWhenReady(this.getSixteenthVariation(this.hatVariations, 1));
    }
    if (!this.isSoundReady || volume > 0) {
      this.hat.volume = volume;
      this.hat.currentTime = 0;
      this.hat.play().then(this.onSoundLoad);
    }
  }

  getVolumeWhenReady(volume) {
    if (!this.isSoundReady) {
      return 0;
    } else {
      return volume;
    }
  }


  draw(p5) {

    if (this.isSoundReady && this.isPlaying) {
      if (this.quarterOn && this.quarter === 1) {
        this.playKick(0.8);
        console.log(this.animationFrame + "::" + this.bar + "." + this.quarter + "." + this.eighth + "." + this.sixteenth);
      } else if (this.quarterOn) {
        this.playKick(0.5);
      } else if (this.sixteenthOn && this.sixteenth === 16) {
        this.playKick(0.2);
      }

      if (this.bar > 2 && this.quarterOn && (this.quarter === 2 || this.quarter === 4)) {
        this.playClap();
      } else if (this.bar > 2 && this.of2BarLoop(2) && this.sixteenthOn && this.sixteenth === 12) {
        this.playClap(0.2);
      }

      if (this.bar > 4 && this.eighthOn && (!this.quarterOn || this.quarter === 4)) {
        this.playHat(0.5);
      } else if (this.bar > 8 && this.sixteenthOn) {
        this.playHat();
      }
    }
  }

  of2BarLoop(bar) {
    return ((this.bar - 1) % 2 === (bar-1));
  }

  of4BarLoop(bar) {
    return ((this.bar - 1) % 4 === (bar-1));
  }

  getQuarterVariation(variations, barPattern) {
    const variationIndex = ((this.bar-1)%barPattern)*4 + (this.quarter - 1);
    const ampValue = variations[variationIndex];
    return ampValue;
  }

  getSixteenthVariation(variations, barPattern) {
    const variationIndex = ((this.bar-1)%barPattern)*16 + (this.sixteenth - 1);
    const ampValue = variations[variationIndex];
    return ampValue;
  }

  createRangeVariations(p5, noteCount, softest, loudest) {
    const variations = [];
    for (let i = 0; i < noteCount; i++) {
      const rand = p5.random(softest, loudest);
      variations.push(rand);
    }
    return variations;
  }

  createRandomVariations(p5, noteCount, soft, loud) {
    const variations = [];
    for (let i = 0; i < noteCount; i++) {
      const rand = Math.round(Math.random());
      if (rand === 0) {
        variations.push(soft);
      } else {
        variations.push(loud);
      }
    }
    return variations;
  }

  mousePressed(p5, fervie) {
    console.log("pressed and ready");
    if (!this.isPlaying) {
      console.log("start playing");
      this.resetDrums(p5);
      this.initSounds();
      this.isPlaying = true;
    } else {
      this.isPlaying = false;
    }
  }

  resetDrums(p5) {
    this.animationFrame = 0;
    this.quarter = 0;
    this.eighth = 0;
    this.sixteenth = 0;
    this.bar = 1;
    this.loop = 1;
    this.hatVariations = this.createRandomVariations(p5, 4 * 16, 0.2, 1);
    this.kickVariations = this.createRangeVariations(p5, 4 * 4, 0.4, 0.7);
  }

  mouseReleased(p5) {
  }

  update(p5) {
    if (!this.isSoundReady || !this.isPlaying) {
      return;
    }

    this.animationFrame++;

    this.quarterOn = false;
    this.eighthOn = false;
    this.sixteenthOn = false;

    if (this.animationFrame > this.quarterLength) {
      this.animationFrame = 1;
    }

    if (this.animationFrame === 1) {
      this.quarter++;
      this.quarterOn = true;

      if (this.quarter > 4) {
        this.quarter = 1;

        this.bar++;
      }
    }

    if ((this.animationFrame - 1) % (this.quarterLength / 2) === 0) {
      this.eighth++;
      this.eighthOn = true;

      if (this.eighth > 8) {
        this.eighth = 1;
      }
    }

    if ((this.animationFrame - 1) % ((this.quarterLength / 4)) === 0) {
      this.sixteenth++;
      this.sixteenthOn = true;

      if (this.sixteenth > 16) {
        this.sixteenth = 1;
      }
    }

    //console.log(this.animationFrame + "::"+this.bar + "."+this.quarter + "."+this.eighth + "."+this.sixteenth);
  }



}
