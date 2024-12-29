jQuery(document).ready(function () {
    "use strict";
  
    // Utility to calculate polygon vertices
    function getXY(i, radius, sides, radOffset, width, height) {
      const theta = (2 * Math.PI) / sides;
      return {
        x: Math.cos(radOffset + theta * i) * radius * width + width / 2,
        y: Math.sin(radOffset + theta * i) * radius * height + height / 2,
      };
    }
  
    // Skill data
    const skills = [
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
  
    const hueOffset = 25;
    const radOffset = Math.PI / 2;
  
    // Generate skill graphs
    $(".skills-graph").empty();
    skills.forEach((skill, index) => {
      const sides = skill.captions.length; // Number of sides based on data points
      const hue = (hueOffset + (index * 255) / skills.length) % 255;
  
      // Append the container
      const container = $(
        `<div class="col-sm-3 polygon" id="${skill.header.toLowerCase()}">
           <div class="skills-header">${skill.header}</div>
           <canvas class="polyCanvas"/></div>
         <div class="col-sm-1"></div>`
      );
      
      $(".skills-graph").append(container);
  
      // Setup canvas
      const canvas = container.find("canvas")[0];
      const ctx = canvas.getContext("2d");
      const width = container.width();
      const height = container.height();
  
      canvas.width = width;
      canvas.height = height;
      ctx.font = '15px "Open Sans", sans-serif';
      ctx.textAlign = "center";
  
      /*** LABEL ***/
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillText(skill.header, width / 2, 15);
  
      /*** BACKGROUND POLYGON ***/
      for (let i = 0; i < sides; i++) {
        ctx.beginPath();
        let xy = getXY(i, 0.3, sides, radOffset, width, height);
        let colorJitter = 25 + (i * 255) / sides;
        ctx.fillStyle = `hsl(${hue}, 100%, ${colorJitter}%)`;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.moveTo(width / 2, height / 2);
        ctx.lineTo(xy.x, xy.y);
        xy = getXY(i + 1, 0.3, sides, radOffset, width, height);
        ctx.lineTo(xy.x, xy.y);
        xy = getXY(i, 0.39, sides, radOffset, width, height);
        ctx.fillText(skill.captions[i], xy.x, xy.y + 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
  
      /*** SKILL GRAPH ***/
      ctx.beginPath();
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 5;
  
      let xy = getXY(0, skill.values[0] * 0.3, sides, radOffset, width, height);
      ctx.moveTo(xy.x, xy.y);
  
      for (let i = 0; i < sides; i++) {
        xy = getXY(i, skill.values[i] * 0.3, sides, radOffset, width, height);
        ctx.lineTo(xy.x, xy.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    });
  
    // Navigation link behavior
    $(".nav-link").on("click", function () {
      $(".probootstrap-mobile-menu-active").removeClass("show");
      $(".probootstrap-burger-menu.visible-xs").removeClass("active");
    });
  
    // Sleep function
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  
    // Change heading text with animation
    async function change_heading_text() {
      await sleep(2500);
      $("#heading-text").fadeOut();
      await sleep(500);
      $("#heading-text").html("<span class='line'>I am Yash.</span>");
      await sleep(500);
      $("#heading-text").fadeIn();
    }
  
    change_heading_text();
  });
  