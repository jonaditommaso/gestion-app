import { useState } from "react";
import clsx from "clsx";
import { Check, DropletOff } from "lucide-react";

const colors = [
  { name: "none", label: "Sin color" },
  { name: "bg-chart-1", label: "Color 1" },
  { name: "bg-chart-2", label: "Color 2" },
  { name: "bg-chart-3", label: "Color 3" },
  { name: "bg-chart-4", label: "Color 4" },
  { name: "bg-chart-5", label: "Color 5" },
];

export default function ColorNoteSelector({ onChange }: { onChange: (value: string, field: "bgColor") => void }) {
  const [selected, setSelected] = useState<string>("none");

  const handleChangeColor = (color: string) => {
    setSelected(color);
    onChange(color, 'bgColor');
  }

  return (
    <div className="flex gap-3 px-2">
      {colors.map((color) => {
        const isSelected = selected === color.name;
        const isNone = color.name === "none";

        return (
          <button
            key={color.name}
            onClick={() => handleChangeColor(color.name)}
            className="relative group w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            {/* Circle color or droplet */}
            <div
              className={clsx(
                "w-7 h-7 rounded-full transition-all duration-200",
                {
                  [color.name]: !isNone,
                  "bg-transparent border border-neutral-400": isNone,
                }
              )}
            >
              {isNone && (
                <DropletOff className="text-neutral-500 w-6 h-6 m-auto" strokeWidth={1.5} />
              )}
            </div>

            {/* Hover / Selected violet ring */}
            <div
              className={clsx(
                "absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-card-foreground transition-all",
                {
                  "ring-card-foreground": isSelected,
                }
              )}
            />

            {/* Check icon if selected */}
            {isSelected && !isNone && (
              <Check className="absolute w-4 h-4 text-white" />
            )}
          </button>
        );
      })}
    </div>
  );
}
