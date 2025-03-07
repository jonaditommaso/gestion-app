import React from 'react';

type CircleIconProps = {
  Icon: React.ElementType; // el tipo de ícono que vamos a pasar (ej. Home)
  color: string;           // color del ícono (ej. "#3f51b5")
  size?: number;           // tamaño del ícono y del círculo
};

export const CircleIcon: React.FC<CircleIconProps> = ({ Icon, color, size = 40 }) => {
  return (
    <div
      className={`p-2 border bg-[${color}] w-[${size}px] h-[${size}px] flex justify-center items-center rounded-[50%]`}
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon style={{ color, fontSize: size * 0.6 }} />
    </div>
  );
};
