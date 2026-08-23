"use client";

import { useState } from "react";
import type { CelebrationEffectKey } from "@/lib/utils";
import { CELEBRATION_EFFECTS } from "@/lib/utils";
import CelebrationEffect from "@/components/CelebrationEffect";
import { Flower2, PartyPopper, Sparkles, Flame, Eye } from "lucide-react";

interface EffectPickerProps {
  value: CelebrationEffectKey;
  onChange: (val: CelebrationEffectKey) => void;
}

const EFFECT_ICONS: Record<CelebrationEffectKey, React.ReactNode> = {
  flowers: <Flower2 className="w-5 h-5 text-pink-400" />,
  confetti: <PartyPopper className="w-5 h-5 text-amber-400" />,
  sparkles: <Sparkles className="w-5 h-5 text-yellow-300" />,
  balloons: <Flame className="w-5 h-5 text-red-400" />,
};

export default function EffectPicker({ value, onChange }: EffectPickerProps) {
  const [triggerId, setTriggerId] = useState<number>(0);

  const handlePreview = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setTriggerId(Date.now());
  };

  const effectKeys = Object.keys(CELEBRATION_EFFECTS) as CelebrationEffectKey[];

  return (
    <div>
      {/* Component hiệu ứng toàn màn hình */}
      {triggerId > 0 && (
        <CelebrationEffect
          key={triggerId}
          effect={value}
          trigger={true}
          triggerId={triggerId}
        />
      )}

      {/* Danh sách hiệu ứng */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-2.5">
        {effectKeys.map((key) => {
          const item = CELEBRATION_EFFECTS[key];
          const isSelected = value === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                onChange(key);
                setTriggerId(Date.now());
              }}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                isSelected
                  ? "bg-white/15 border-pink-500/80 shadow-lg shadow-pink-500/20 scale-[1.02]"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {/* Selected badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_#ff6b9d]" />
              )}

              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-lg bg-white/10 shrink-0">
                  {EFFECT_ICONS[key]}
                </div>
                <span className="font-bold text-xs sm:text-sm text-white">{item.label}</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/50 line-clamp-2 leading-tight">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Nút xem trước */}
      <div className="mt-2.5 flex items-center justify-between">
        <p className="text-[11px] text-white/40">
          Hiệu ứng sẽ bung nở khi người nhận mở thiệp
        </p>
        <button
          type="button"
          onClick={handlePreview}
          className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 hover:border-pink-500/50 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Xem thử hiệu ứng</span>
        </button>
      </div>
    </div>
  );
}
