const hearTest = new HearTest();
hearTest.startTest();

window.addEventListener("keydown", (e) => {
  hearTest.handleResponse();
})
