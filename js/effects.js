"use strict";

const canvas = document.getElementById("nightCanvas");
const ctx = canvas?.getContext("2d");
const petalLayer = document.getElementById("petalLayer");

let stars = [];
let animationFrameId;
let width = window.innerWidth;
let height = window.innerHeight;
let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

if (canvas && ctx && petalLayer) {
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createStars();
  }

  function createStars() {
    const starCount = Math.min(260, Math.floor((width * height) / 6500));

    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.86,
      radius: Math.random() * 1.25 + 0.2,
      alpha: Math.random() * 0.7 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.012 + 0.004
    }));
  }

  function drawNight(time = 0) {
    ctx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      const shimmer = star.alpha + Math.sin(time * star.speed + star.phase) * 0.22;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(218, 229, 255, ${Math.max(0.08, shimmer)})`;
      ctx.fill();

      if (star.radius > 1.05) {
        ctx.beginPath();
        ctx.moveTo(star.x - 3.5, star.y);
        ctx.lineTo(star.x + 3.5, star.y);
        ctx.moveTo(star.x, star.y - 3.5);
        ctx.lineTo(star.x, star.y + 3.5);
        ctx.strokeStyle = `rgba(189, 211, 255, ${Math.max(0.04, shimmer * 0.34)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });

    animationFrameId = requestAnimationFrame(drawNight);
  }

  function releasePetal() {
    if (document.hidden) return;

    const petal = document.createElement("span");
    const size = 7 + Math.random() * 10;
    const duration = 11 + Math.random() * 12;

    petal.className = "falling-petal";
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.3}px`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${Math.random() * -3}s`;
    petal.style.opacity = `${0.25 + Math.random() * 0.42}`;

    petalLayer.appendChild(petal);

    setTimeout(() => {
      petal.remove();
    }, duration * 1000);
  }

  window.addEventListener("resize", resizeCanvas);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      animationFrameId = requestAnimationFrame(drawNight);
    }
  });

  resizeCanvas();
  drawNight();
  setInterval(releasePetal, 1050);
}
