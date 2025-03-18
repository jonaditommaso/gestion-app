import { FC } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import './coloredIcon.css'

interface ColoredIconProps {
  Icon: LucideIcon,
  iconColor: string,
  circleColor: string,
  circlePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const ColoredIcon: FC<ColoredIconProps> = ({
  Icon,
  iconColor,
  circleColor,
  circlePosition,
}) => {
  return (
    <div className="relative inline-block">
      <Icon className={iconColor} size={50} />

      <div
        className={cn(
          'absolute w-10 h-10 rounded-full opacity-50 transition-transform duration-500 ball',
          circleColor,
          {
            'top-[-20px] left-[-20px]': circlePosition === 'top-left',
            'top-[-20px] right-[-20px]': circlePosition === 'top-right',
            'bottom-[-15px] left-[-15px]': circlePosition === 'bottom-left',
            'bottom-[-15px] right-[-15px]': circlePosition === 'bottom-right',
          }
        )}
      />
    </div>
  );
};

export default ColoredIcon;
