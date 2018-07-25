class HearTest {
  constructor(props) {
    const atx = new (window.webkitAudioContext || window.AudioContext)();

    this.attack = 100;
    this.release = 50;
    this.toneDuration = 1000;
    this.toneWaitTime = 3000;
    this.toneWaitTimeMaxRandomComponent = 3000;
    this.lowestFrequency = 250;
    this.octaves = 7;//250 ... 16000 Hz
    this.lastToneStartTime = 0;
    this.activeTone = null;
    this.toneEnvelopeTimeoutId = 0;
    this.testTimeoutId = 0;
    this.intensityLevels = 11;
    this.maxAttenuationIndB = 110;


    this.tests = [...Array(this.octaves * 2)].map((_, i) => ({
      level: -1,
      passed: false,
      frequency: this.lowestFrequency * (2 ** (i % 2 === 0 ? i / 2 : (i - 1) / 2)),
      ear: i % 2
    }));

    this.atx = atx;
    this.osc = atx.createOscillator();
    this.gain = atx.createGain();
    this.leftGain = atx.createGain();
    this.rightGain = atx.createGain();
    this.merger = atx.createChannelMerger(2);

    this.osc.connect(this.gain);
    this.gain.connect(this.leftGain);
    this.gain.connect(this.rightGain);
    this.leftGain.connect(this.merger, 0, 0);
    this.rightGain.connect(this.merger, 0, 1);
    this.merger.connect(atx.destination);

    //init from left channel
    this.leftGain.gain.value = 1;
    this.rightGain.gain.value = 0;
    this.gain.gain.value = 0;

    this.osc.start(0);
  }

  get toneTimeout() {
    return this.toneWaitTime + this.toneWaitTimeMaxRandomComponent * Math.random();
  }

  startTest() {
    this.testTimeoutId = setTimeout(() => {
      this.tickTest();
    }, this.toneTimeout);
  }

  tickTest() {
    if(this.testIsReady()) {
      this.endTest();
    } else {
      this.generateAvailableTone();
      this.testTimeoutId = setTimeout(() => {
        this.tickTest();
      }, this.toneTimeout);
    }
  }

  handleResponse() {
    if(this.activeTone) {
      console.log("Registered: ", this.activeTone.frequency, this.activeTone.level);
      this.activeTone.passed = true;
    }
  }

  testIsReady() {
    return !this.tests.find(tone => !tone.passed && tone.level < this.intensityLevels);
  }

  generateAvailableTone() {
    this.activeTone = this.randomizeAvailableTone();
    this.activeTone.level++;
    this.startTone(this.activeTone);
  }

  setPan(ear) {
    if(ear === 1) {
      this.leftGain.gain.setValueAtTime(0, 0);
      this.rightGain.gain.setValueAtTime(1, 0);
    } else {
      this.leftGain.gain.setValueAtTime(1, 0);
      this.rightGain.gain.setValueAtTime(0, 0);
    }
  }

  randomizeAvailableTone() {
    const availableTones = this.tests.filter(tone => !tone.passed && tone.level < this.intensityLevels);
    const index = Math.floor(availableTones.length * Math.random());
    return availableTones[index];
  }

  startTone({ frequency, ear, level }) {
    console.log("Played: ", frequency, level);
    const gain = this.levelToGain(level);
    this.lastToneStartTime = Date.now();
    this.setPan(ear);
    this.osc.frequency.setValueAtTime(frequency, 0);
    this.gain.gain.cancelScheduledValues(0);
    this.gain.gain.setTargetAtTime(gain, 0, this.attack / 1000);
    this.toneEnvelopeTimeoutId = setTimeout(() => {
      this.stopTone();
    }, this.toneDuration);
  }

  stopTone() {
    this.gain.gain.cancelScheduledValues(0);
    this.gain.gain.setTargetAtTime(0, 0, this.release / 1000);
  }

  endTest() {
    console.log(this.tests);
  }

  levelToGain(level) {
    const stepIndB = this.maxAttenuationIndB / this.intensityLevels;
    const attenuation = -(this.intensityLevels - level) * stepIndB;
    return Math.pow(10, (attenuation / 20));
  }
}
