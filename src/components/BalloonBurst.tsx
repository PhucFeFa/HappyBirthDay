"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface BalloonBurstProps {
  trigger?: boolean;
  triggerId?: number | string;
}

interface BalloonParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  swingOffset: number;
  swingSpeed: number;
  alpha: number;
  life: number;
  maxLife: number;
}

const BALLOON_COLORS = [
  "#ff4d6d",
  "#ff758f",
  "#ff8fa3",
  "#3a86ff",
  "#8338ec",
  "#ffbe0b",
  "#fb5607",
  "#06d6a0",
  "#f72585",
];

export default function BalloonBurst({ trigger = true, triggerId }: BalloonBurstProps) {
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

    const particles: BalloonParticle[] = [];
    const count = 38;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: (i * (width / count)) + (Math.random() * 40 - 20),
        y: height + 60 + Math.random() * 180,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(5.0 + Math.random() * 3.8),
        size: 36 + Math.random() * 28,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        swingOffset: Math.random() * Math.PI * 2,
        swingSpeed: 0.03 + Math.random() * 0.04,
        alpha: 1,
        life: 0,
        maxLife: 150 + Math.random() * 60,
      });
    }

    const drawBalloon = (c: CanvasRenderingContext2D, size: number, color: string) => {
      c.save();
      c.beginPath();
      c.moveTo(0, size * 0.5);
      c.bezierCurveTo(size * 0.5, size * 0.4, size * 0.6, -size * 0.6, 0, -size * 0.6);
      c.bezierCurveTo(-size * 0.6, -size * 0.6, -size * 0.5, size * 0.4, 0, size * 0.5);
      c.fillStyle = color;
      c.fill();

      c.beginPath();
      c.moveTo(-size * 0.1, size * 0.5);
      c.lineTo(size * 0.1, size * 0.5);
      c.lineTo(0, size * 0.6);
      c.closePath();
      c.fill();

      c.beginPath();
      c.ellipse(-size * 0.22, -size * 0.22, size * 0.12, size * 0.2, -Math.PI / 4, 0, Math.PI * 2);
      c.fillStyle = "rgba(255, 255, 255, 0.45)";
      c.fill();

      c.beginPath();
      c.moveTo(0, size * 0.6);
      c.bezierCurveTo(-size * 0.2, size * 0.8, size * 0.2, size * 1.0, 0, size * 1.3);
      c.strokeStyle = "rgba(255, 255, 255, 0.6)";
      c.lineWidth = 1.5;
      c.stroke();

      c.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (p.y > -150 && p.life < p.maxLife) {
          aliveCount++;

          p.swingOffset += p.swingSpeed;
          p.x += p.vx + Math.sin(p.swingOffset) * 1.5;
          p.y += p.vy;

          if (p.y < 120) {
            p.alpha = Math.max(0, p.y / 120);
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.globalAlpha = Math.max(0, p.alpha);

          drawBalloon(ctx, p.size, p.color);

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
