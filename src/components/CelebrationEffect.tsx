"use client";

import type { CelebrationEffectKey } from "@/lib/utils";
import Confetti from "@/components/Confetti";
import FlowerBurst from "@/components/FlowerBurst";
import SparkleBurst from "@/components/SparkleBurst";
import BalloonBurst from "@/components/BalloonBurst";

interface CelebrationEffectProps {
  effect?: CelebrationEffectKey;
  trigger?: boolean;
  triggerId?: number | string;
}

export default function CelebrationEffect({
  effect = "flowers",
  trigger = true,
  triggerId,
}: CelebrationEffectProps) {
  if (!trigger) return null;

  switch (effect) {
    case "flowers":
      return <FlowerBurst trigger={trigger} triggerId={triggerId} />;
    case "confetti":
      return <Confetti trigger={trigger} triggerId={triggerId} />;
    case "sparkles":
      return <SparkleBurst trigger={trigger} triggerId={triggerId} />;
    case "balloons":
      return <BalloonBurst trigger={trigger} triggerId={triggerId} />;
    default:
      return <FlowerBurst trigger={trigger} triggerId={triggerId} />;
  }
}
