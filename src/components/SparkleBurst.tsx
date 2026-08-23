"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SparkleBurstProps {
  trigger?: boolean;
  triggerId?: number | string;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  points: number;
  alpha: number;
  life: number;
  maxLife: number;
  scale: number;
}

const SPARKLE_PALETTE = [
  "#ffd166", // Vàng hoàng kim
  "#06d6a0", // Xanh ngọc lục bảo
  "#118ab2", // Xanh sapphire
  "#ef476f", // Hồng ruby
  "#c77dff", // Tím thạch anh
  "#ffffff", // Ánh kim cương
  "#ffbe0b", // Vàng cam
  "#fb5607", // Đỏ cam
];

export default function SparkleBurst({ trigger = true, triggerId }: SparkleBurstProps) {
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

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const centerX = width / 2;
    const centerY = height / 2;

    const particles: SparkleParticle[] = [];
    const count = 85;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 18;

      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 14 + Math.random() * 26,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        color: SPARKLE_PALETTE[Math.floor(Math.random() * SPARKLE_PALETTE.length)],
        points: Math.random() > 0.4 ? 4 : 8,
        alpha: 1,
        life: 0,
        maxLife: 75 + Math.random() * 45,
        scale: 0.1,
      });
    }

    const drawStar = (c: CanvasRenderingContext2D, size: number, color: string, points: number) => {
      c.save();
      c.fillStyle = color;
      c.shadowColor = color;
      c.shadowBlur = 12;

      c.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? size : size * 0.22;
        const currAngle = (i * Math.PI) / points;
        const px = Math.cos(currAngle) * r;
        const py = Math.sin(currAngle) * r;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      c.fill();
      c.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (p.life < p.maxLife) {
          aliveCount++;

          p.vx *= 0.95;
          p.vy *= 0.95;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotSpeed;

          if (p.life < 12) {
            p.scale = (p.life / 12) * 1.5;
          } else if (p.life > p.maxLife - 20) {
            p.alpha = (p.maxLife - p.life) / 20;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(p.scale, p.scale);
          ctx.globalAlpha = Math.max(0, p.alpha);

          drawStar(ctx, p.size, p.color, p.points);

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
