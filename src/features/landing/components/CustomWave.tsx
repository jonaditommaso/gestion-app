import { cn } from "@/lib/utils"
import * as React from "react"

interface CustomWaveProps {
  rectColor?: string,
  rotated?: boolean,
  isBottom?: boolean
}

const CustomWave = ({ rotated, rectColor, isBottom }: CustomWaveProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    viewBox="0 0 1000 100"
    className={cn(rotated && "rotate-180", isBottom && "mt-[-1px]")}
  >
    {rectColor && <rect width="100%" height="95%" fill={rectColor} />}
    <path className="fill-[#FFF2F2] h-full w-full" d="M790.5 93.1c-59.3-5.3-116.8-18-192.6-50-29.6-12.7-76.9-31-100.5-35.9-23.6-4.9-52.6-7.8-75.5-5.3-10.2 1.1-22.6 1.4-50.1 7.4-27.2 6.3-58.2 16.6-79.4 24.7-41.3 15.9-94.9 21.9-134 22.6C72 58.2 0 25.8 0 25.8V100h1000V65.3S948.5 84.7 893.8 91c-54.3 6-79.7 4.2-103.3 2.1z" />
  </svg>
)
export default CustomWave
