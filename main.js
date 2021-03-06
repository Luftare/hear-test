const canvas = document.querySelector(".graph__canvas");
const atx = new (window.webkitAudioContext || window.AudioContext)();

const hearTest = new HearTest({
  atx,
  onTestReady: data => {
    const leftData = data.results.filter(test => test.ear === 0).map(test => test.level);
    const rightData = data.results.filter(test => test.ear === 1).map(test => test.level);
    graph.plot(leftData, "Left ear");
    graph.plot(rightData, "Right ear");
    document.querySelector('.controls__start-stop').innerHTML = 'START';
    document.querySelector('.controls__start-stop').classList.remove('controls__start-stop--red');
    document.querySelector('.controls__confirmator').classList.remove('controls__confirmator--red');
    document.querySelector('.graph__download-button').disabled = false;
    document.querySelector('.controls__register').disabled = true;
    testIsActive = false;
    setStatusText('Test completed.');
  }
});

const graph = new Graph({
  canvas,
  levels: hearTest.intensityLevels,
  levelIndB: hearTest.levelIndB,
  frequencies: hearTest.frequencies
});

document.querySelector('.controls__start-stop').addEventListener('click', (e) => {
  if(hearTest.isActive) {
    hearTest.stopTest();
    e.target.innerHTML = 'START';
    e.target.classList.remove('controls__start-stop--red');
    document.querySelector('.controls__confirmator').classList.remove('controls__confirmator--red');
    document.querySelector('.controls__register').disabled = true;
    setStatusText('Test stopped.');
  } else {
    hearTest.startTest();
    graph.reset();
    e.target.innerHTML = 'STOP';
    e.target.classList.add('controls__start-stop--red');
    document.querySelector('.controls__confirmator').classList.add('controls__confirmator--red');
    document.querySelector('.graph__download-button').disabled = true;
    document.querySelector('.controls__register').disabled = false;
    document.querySelector('.controls__register').focus();
    setStatusText('Test is running. Hit any key or the BEEP button when you hear a tone.');
  }
});


document.querySelector('.controls__register').addEventListener('mousedown', (e) => {
  if(e.target.disabled) return;
  blinkConfirmator();
  hearTest.handleResponse();
});

document.querySelector('.controls__register').addEventListener('touchstart', (e) => {
  if(e.target.disabled) return;
  blinkConfirmator();
  hearTest.handleResponse();
  e.preventDefault();
});

window.addEventListener("keydown", (e) => {
  if(e.key === ' ') e.preventDefault();
  blinkConfirmator();
  hearTest.handleResponse();
})

function initMobileAudio(e) {
  const osc = atx.createOscillator();
  const gain = atx.createGain();
  gain.gain.setValueAtTime(0, 0);
  osc.frequency.setValueAtTime(5, 0);
  osc.connect(gain);
  gain.connect(atx.destination);
  gain.gain.setTargetAtTime(0.005, 0, 0.5);
  osc.start(0);
  gain.gain.setTargetAtTime(0, 0.5, 0.5);
  setTimeout(() => {
    gain.gain.cancelScheduledValues(0);
    osc.stop(0);
    osc.disconnect();
    gain.disconnect();
    window.removeEventListener('touchstart', initMobileAudio);
  }, 1100);
}

window.addEventListener('touchstart', initMobileAudio);

document.querySelector('.graph__download-button').addEventListener('click', () => {
  const link = document.getElementById('link');
  const fileName = `hear_test_result_${Date.now()}.png`;
  link.setAttribute('download', fileName);
  link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  link.click();
});

function blinkConfirmator() {
  const confirmator = document.querySelector('.controls__confirmator');
  confirmator.classList.add('controls__confirmator--green');
  setTimeout(() => {
    confirmator.classList.remove('controls__confirmator--green');
  }, 200);
}

function setStatusText(text) {
  document.querySelector('.test-status').innerHTML = text;
}

setStatusText('Click the START button to start the test.');
