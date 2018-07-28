const canvas = document.querySelector(".graph__canvas");

const hearTest = new HearTest({
  onTestReady: data => {
    const leftData = data.results.filter(test => test.ear === 0).map(test => test.level);
    const rightData = data.results.filter(test => test.ear === 1).map(test => test.level);
    graph.plot(leftData, "Left ear");
    graph.plot(rightData, "Right ear");
    document.querySelector('.controls__start').disabled = false;
    document.querySelector('.controls__stop').disabled = true;
    document.querySelector('.controls__confirmator').classList.remove('controls__confirmator--red');
    document.querySelector('.graph__download-button').disabled = false;
    document.querySelector('.controls__register').disabled = true;
  }
});

const graph = new Graph({
  canvas,
  levels: hearTest.intensityLevels,
  levelIndB: hearTest.levelIndB,
  frequencies: hearTest.frequencies
});

document.querySelector('.controls__start').addEventListener('click', () => {
  hearTest.startTest();
  graph.reset();
  document.querySelector('.controls__start').disabled = true;
  document.querySelector('.controls__stop').disabled = false;
  document.querySelector('.controls__confirmator').classList.add('controls__confirmator--red');
  document.querySelector('.graph__download-button').disabled = true;
  document.querySelector('.controls__register').disabled = false;
});

document.querySelector('.controls__stop').addEventListener('click', () => {
  hearTest.stopTest();
  document.querySelector('.controls__start').disabled = false;
  document.querySelector('.controls__stop').disabled = true;
  document.querySelector('.controls__confirmator').classList.remove('controls__confirmator--red');
  document.querySelector('.controls__register').disabled = true;
});

document.querySelector('.controls__register').addEventListener('mousedown', () => {
  const confirmator = document.querySelector('.controls__confirmator');
  confirmator.classList.add('controls__confirmator--green');
  setTimeout(() => {
    confirmator.classList.remove('controls__confirmator--green');
  }, 200);
  hearTest.handleResponse();
});

document.querySelector('.controls__register').addEventListener('touchstart', () => {
  const confirmator = document.querySelector('.controls__confirmator');
  confirmator.classList.add('controls__confirmator--green');
  setTimeout(() => {
    confirmator.classList.remove('controls__confirmator--green');
  }, 200);
  hearTest.handleResponse();
});

document.querySelector('.graph__download-button').addEventListener('click', () => {
  const link = document.getElementById('link');
  link.setAttribute('download', `hear_test_result_${Date.now()}.png`);
  link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  link.click();
});

window.addEventListener("keydown", (e) => {
  if(e.key === ' ') e.preventDefault();
  const confirmator = document.querySelector('.controls__confirmator');
  confirmator.classList.add('controls__confirmator--green');
  setTimeout(() => {
    confirmator.classList.remove('controls__confirmator--green');
  }, 200);
  hearTest.handleResponse();
})
