const { useState, useEffect, useRef, createContext, useMemo } = React;

function fireWorks(){
    document.querySelector("main").style.opacity = .5;
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    const fireworks = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function createFirework() {
      const firework = {
        x: Math.random() * canvas.width,
        y: canvas.height,
        color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
        particles: [],
      };

      for (let i = 0; i < 30; i++) {
        firework.particles.push({
          x: firework.x,
          y: firework.y,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 5 + 2,
          friction: 1,
          gravity: 0.2,
          alpha: 1,
        });
      }

      fireworks.push(firework);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < fireworks.length; i++) {
        const firework = fireworks[i];

        for (let j = 0; j < firework.particles.length; j++) {
          const particle = firework.particles[j];

          particle.x += Math.cos(particle.angle) * particle.speed;
          particle.y += Math.sin(particle.angle) * particle.speed;

          particle.speed *= particle.friction;
          particle.alpha -= 0.005;
          particle.speed += particle.gravity;

          ctx.fillStyle = firework.color;
          ctx.globalAlpha = particle.alpha;
          ctx.fillRect(particle.x, particle.y, 6, 6);

          if (particle.alpha <= 0) {
            firework.particles.splice(j, 1);
            j--;
          }
        }

        if (firework.particles.length === 0) {
          fireworks.splice(i, 1);
          i--;
        }
      }

      requestAnimationFrame(draw);
    }

    function launchFireworks() {
      createFirework();
      setTimeout(launchFireworks, Math.random() * 2000);
    }

    launchFireworks();
    draw();
}

export default function EasterEgg(props) {
    let word = "";

    window.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
            // Handle backspace separately
            word = word.substring(0, word.length - 1);
        } else if (e.key === "Shift") {
            // Remove the entire "Shift" word and append uppercase letter
            word += e.key.replace(/Shift/g, "").toUpperCase();
        } else if (e.key.length === 1) {
            // Handle regular alphanumeric keys
            word += e.key;
        }

        if(word === "felix"){
            word = "";
            const heading = document.querySelector(".landingPage__heading");

            if(heading.innerText == "<FELIX A. SCHULTZ />"){
                heading.innerText = "..- .-.. . -..-   .-   ... -.-. .... ..- .-.. - --..   -..-.->";
            }
        }

        if(word.toLowerCase() == "cykelfaergen" || word.toLowerCase() === "cykelfærgen"){
            window.location.href = "/project/cykelfaergen";
        }

        if(word.toLowerCase() == "42" || word.toLowerCase() == "the answer to life the universe and everything"){
            document.getElementById('fireworksCanvas').style = "position: fixed; top: 0; left: 0; z-index: 99999999999999999";
            fireWorks();
            setTimeout(() => {
                document.getElementById('fireworksCanvas').style = "display: none";
                document.querySelector("main").style.opacity = 1;
            }, 60000)
            word = "";
        }

        if(word.toLowerCase() == "ross geller" || word.toLowerCase() == "ross"){
            document.querySelector("body").style.transformOrigin = "960px 720px";
            document.querySelector("body").style.transform = "perspective(1000px) rotate3d(1,1,1, 30deg) translate(351px) scale(.75)";
            word = "";
        }
    });

    window.addEventListener("click", () => {
        document.querySelector("body").style.transformOrigin = "";
        document.querySelector("body").style.transform = "";
    })
}