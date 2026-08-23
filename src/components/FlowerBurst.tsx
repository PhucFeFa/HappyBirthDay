"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface FlowerBurstProps {
  trigger?: boolean;
  triggerId?: number | string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  type: "blossom" | "petal" | "sunflower" | "starflower";
  alpha: number;
  life: number;
  maxLife: number;
  scale: number;
  swingOffset: number;
  swingSpeed: number;
}

const PALETTE = [
  "#ff4d6d", // Hồng đỏ thắm
  "#ff758f", // Hồng đào
  "#ff8fa3", // Hồng pastel
  "#ffb3c6", // Cánh đào phớt
  "#ffd166", // Nhụy vàng
  "#f72585", // Hồng tím neon
  "#b5179e", // Tím hoa cà
  "#7209b7", // Tím hoàng gia
  "#4cc9f0", // Xanh ngọc
  "#ffffff", // Trắng tinh
];

export default function FlowerBurst({ trigger = true, triggerId }: FlowerBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !trigger) return;

    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to viewport
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const centerX = width / 2;
    const centerY = height / 2;

    // Tạo 95 hoa và cánh hoa bung tỏa từ tâm
    const particles: Particle[] = [];
    const count = Math.min(95, Math.floor(width / 13));

    for (let i = 0; i < count; i++) {
      const angle = (i * (Math.PI * 2) / count) + (Math.random() * 0.4 - 0.2);
      const speed = 7 + Math.random() * 17;
      const types: Particle["type"][] = ["blossom", "petal", "sunflower", "starflower"];
      const type = types[Math.floor(Math.random() * types.length)];

      particles.push({
        x: centerX + (Math.random() * 20 - 10),
        y: centerY + (Math.random() * 20 - 10),
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.5),
        vy: Math.sin(angle) * speed * (0.8 + Math.random() * 0.5) - 3, // Hơi bay vút lên
        size: type === "petal" ? 14 + Math.random() * 16 : 24 + Math.random() * 28,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.12,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        type,
        alpha: 1,
        life: 0,
        maxLife: 95 + Math.random() * 55, // 1.6s - 2.6s
        scale: 0.1,
        swingOffset: Math.random() * Math.PI * 2,
        swingSpeed: 0.04 + Math.random() * 0.05,
      });
    }

    // Vẽ hoa anh đào 5 cánh
    const drawBlossom = (c: CanvasRenderingContext2D, size: number, color: string) => {
      c.save();
      c.fillStyle = color;
      for (let i = 0; i < 5; i++) {
        c.beginPath();
        c.rotate((Math.PI * 2) / 5);
        c.ellipse(0, -size * 0.4, size * 0.28, size * 0.42, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.beginPath();
      c.arc(0, 0, size * 0.2, 0, Math.PI * 2);
      c.fillStyle = "#ffd166";
      c.fill();
      c.beginPath();
      c.arc(0, 0, size * 0.1, 0, Math.PI * 2);
      c.fillStyle = "#f77f00";
      c.fill();
      c.restore();
    };

    // Vẽ hoa cúc đa cánh
    const drawSunflower = (c: CanvasRenderingContext2D, size: number, color: string) => {
      c.save();
      c.fillStyle = color;
      for (let i = 0; i < 8; i++) {
        c.beginPath();
        c.rotate((Math.PI * 2) / 8);
        c.ellipse(0, -size * 0.45, size * 0.16, size * 0.38, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.beginPath();
      c.arc(0, 0, size * 0.24, 0, Math.PI * 2);
      c.fillStyle = "#fb8500";
      c.fill();
      c.restore();
    };

    // Vẽ cánh hoa rơi uốn lượn
    const drawPetal = (c: CanvasRenderingContext2D, size: number, color: string) => {
      c.save();
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, -size * 0.5);
      c.bezierCurveTo(size * 0.4, -size * 0.3, size * 0.4, size * 0.3, 0, size * 0.5);
      c.bezierCurveTo(-size * 0.4, size * 0.3, -size * 0.4, -size * 0.3, 0, -size * 0.5);
      c.fill();
      c.restore();
    };

    // Vẽ hoa 4 cánh may mắn
    const drawStarFlower = (c: CanvasRenderingContext2D, size: number, color: string) => {
      c.save();
      c.fillStyle = color;
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.rotate((Math.PI * 2) / 4);
        c.arc(0, -size * 0.35, size * 0.28, 0, Math.PI * 2);
        c.fill();
      }
      c.beginPath();
      c.arc(0, 0, size * 0.18, 0, Math.PI * 2);
      c.fillStyle = "#fff3b0";
      c.fill();
      c.restore();
    };

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (p.life < p.maxLife) {
          aliveCount++;

          p.vx *= 0.94;
          p.vy *= 0.94;
          p.vy += 0.18; // Trọng lực rơi nhẹ

          p.swingOffset += p.swingSpeed;
          p.x += p.vx + Math.sin(p.swingOffset) * 1.2;
          p.y += p.vy;

          p.rotation += p.rotSpeed;

          // Nở to lúc đầu rồi mờ dần
          if (p.life < 15) {
            p.scale = (p.life / 15) * 1.3;
          } else if (p.life > p.maxLife - 25) {
            p.alpha = (p.maxLife - p.life) / 25;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(p.scale, p.scale);
          ctx.globalAlpha = Math.max(0, p.alpha);

          if (p.type === "blossom") drawBlossom(ctx, p.size, p.color);
          else if (p.type === "sunflower") drawSunflower(ctx, p.size, p.color);
          else if (p.type === "starflower") drawStarFlower(ctx, p.size, p.color);
          else drawPetal(ctx, p.size, p.color);

          ctx.restore();
        }
      }

      if (aliveCount > 0) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      if (ctx) ctx.clearRect(0, 0, width, height);
    };
  }, [mounted, trigger, triggerId]);

  if (!mounted) return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none z-[99999]"
      style={{ display: "block" }}
    />,
    document.body
  );
}
