$(document).ready(function () {
  var description = new Typed("#description", {
    strings: [
      "Tech Enthusiast^2500",
      "Python Programmer^2500",
      "App Developer^2500",
      "Web Developer^2500",
      "Open Source Contributor^2500",
      "ML Enthusiast^2500",
      "Binge Watcher^2500",
    ],
    shuffle: true,
    loop: true,
    typeSpeed: 100,
    backSpeed: 100,
    cursorChar: "_",
  });
  $(".carousel").carousel({
    interval: "false",
  });
});
