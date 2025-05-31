jQuery(document).ready(function () {
  "use strict";
  (function ($, win) {
    $.fn.inViewport = function (cb) {
      return this.each(function (i, el) {
        function visPx() {
          var elH = $(el).outerHeight(),
            H = $(win).height(),
            r = el.getBoundingClientRect(),
            t = r.top,
            b = r.bottom;
          return cb.call(
            el,
            Math.max(0, t > 0 ? Math.min(elH, H - t) : Math.min(b, H))
          );
        }
        visPx();
        $(win).on("resize scroll", visPx);
      });
    };
  })(jQuery, window);

  function sleep(ms) {
    // console.log('sleeping');
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function change_heading_text() {
    await sleep(2500);
    $("#heading-text").fadeOut();
    await sleep(500);
    $("#heading-text").html("<span class='line'>I am Yash.</span>");
    await sleep(500);
    $("#heading-text").fadeIn();
  }

  change_heading_text();

  var scene = document.getElementById("scene");
  var parallaxInstance = new Parallax(scene);

  const s = window.screen;
  const w = (q.width = s.width);
  const h = (q.height = s.height);

  const ctx = q.getContext("2d");

  const p = Array(Math.floor(w / 10) + 1).fill(0);

  const random = (items) => items[Math.floor(Math.random() * items.length)];

  const hex = "תשקצץיףסואןבגדהזחטךכלםמנעפר".split("");

  setInterval(() => {
    ctx.fillStyle = "rgba(0,0,0,.1)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#22eaaa";
    p.map((v, i) => {
      ctx.fillText(random(hex), i * 10, v);
      p[i] = v >= h || v > 50 + 1000 * Math.random() ? 0 : v + 10;
    });
  }, 40);

  var skills = [
    {
      header: "DevOps",
      captions: ["Artifactory", "Kubernetes", "Terraform", "Helm", "Git", "Docker"],
      values: [0.9, 0.9, 0.8, 0.8, 0.9, 0.9],
    },
    {
      header: "Languages/Frameworks",
      captions: ["Node.Js", "React.Js", "Python", "Java", "C++"],
      values: [0.65, 0.7, 0.8, 0.4, 0.7],
    },
    {
      header: "Interests",
      captions: ["Music", "ML", "Security", "Web", "CP"],
      values: [0.5, 0.8, 0.5, 0.7, 0.8],
    },
  ];

  var pentagonIndex = 0;
  var valueIndex = 0;
  var width = 0;
  var height = 0;
  var radOffset = Math.PI / 2;
  var sides = 5; // Number of sides in the polygon
  var theta = (2 * Math.PI) / sides; // radians per section

  function getXY(i, radius) {
    return {
      x: Math.cos(radOffset + theta * i) * radius * width + width / 2,
      y: Math.sin(radOffset + theta * i) * radius * height + height / 2,
    };
  }

  var hue = [];
  var hueOffset = 25;
  // console.log($(".skills-graph").html());

  for (var sk in skills) {
    // console.log(sk);
    $(".skills-graph").append(
      '<div class="col-sm-3 pentagon" id="interests"><div class="skills-header"></div><canvas class="pentCanvas"/></div><div class="col-sm-1"></div>'
    );
    // console.log($(".skills-graph").html());
    hue[sk] = (hueOffset + (sk * 255) / skills.length) % 255;
  }

  $(".pentagon").each(function (index) {
    width = $(this).width();
    height = $(this).height();
    var ctx = $(this).find("canvas")[0].getContext("2d");
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.font = '15px "Open Sans", sans-serif ';
    ctx.textAlign = "center";

    /*** LABEL ***/
    let color = "hsl(" + hue[pentagonIndex] + ", 100%, 50%)";
    ctx.fillStyle = color;
    // console.log(pentagonIndex);
    ctx.fillText(skills[pentagonIndex].header, width / 2, 15);

    /*** PENTAGON BACKGROUND ***/
    for (var i = 0; i < sides; i++) {
      // For each side, draw two segments: the side, and the radius
      ctx.beginPath();
      let xy = getXY(i, 0.3);
      let colorJitter = 25 + theta * i * 2;
      color = "hsl(" + hue[pentagonIndex] + ",100%," + colorJitter + "%)";
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.moveTo(0.5 * width, 0.5 * height); //center
      ctx.lineTo(xy.x, xy.y);
      xy = getXY(i + 1, 0.3);
      ctx.lineTo(xy.x, xy.y);
      xy = getXY(i, 0.39);
      console.log();
      ctx.fillText(skills[pentagonIndex].captions[valueIndex], xy.x, xy.y + 3);
      valueIndex++;
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    valueIndex = 0;
    ctx.beginPath();
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 5;
    var value = skills[pentagonIndex].values[valueIndex];
    let xy = getXY(i, value * 0.3);
    ctx.moveTo(xy.x, xy.y);
    /*** SKILL GRAPH ***/
    for (var i = 0; i < sides; i++) {
      xy = getXY(i, value * 0.3);
      ctx.lineTo(xy.x, xy.y);
      valueIndex++;
      value = skills[pentagonIndex].values[valueIndex];
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    valueIndex = 0;
    pentagonIndex++;
  });

  $(".nav-link").on("click", function () {
    // console.log("click hua");
    // console.log($(".probootstrap-burger-menu.visible-xs").html());
    $(".probootstrap-mobile-menu-active").removeClass("show");
    $(".probootstrap-burger-menu.visible-xs").removeClass("active");
  });
});

// Enhanced Skills Section JavaScript
$(document).ready(function() {
  // Animate progress bars when they come into view
  function animateProgressBars() {
    $('.progress-fill').each(function() {
      const $this = $(this);
      const width = $this.data('width');
      
      $this.css('width', width);
    });
  }
  
  // Animate skill categories when they come into view
  function animateSkillCategories() {
    $('.skill-category').each(function(index) {
      const $this = $(this);
      setTimeout(() => {
        $this.addClass('animate');
      }, index * 200);
    });
  }
  
  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('skills-progress-section')) {
          animateProgressBars();
        }
        if (entry.target.classList.contains('skills-categories')) {
          animateSkillCategories();
        }
      }
    });
  }, {
    threshold: 0.3
  });
  
  // Observe elements
  document.querySelector('.skills-progress-section') && 
    observer.observe(document.querySelector('.skills-progress-section'));
  document.querySelector('.skills-categories') && 
    observer.observe(document.querySelector('.skills-categories'));
  
  // Add hover effects for skill tags
  $('.skill-tag').hover(
    function() {
      $(this).siblings().css('opacity', '0.6');
    },
    function() {
      $(this).siblings().css('opacity', '1');
    }
  );
  
  // Add click functionality to skill tags (could show more info)
  $('.skill-tag').click(function() {
    const skillName = $(this).text();
    console.log(`Clicked on skill: ${skillName}`);
    // You could add a modal or tooltip with more information about the skill
  });
});