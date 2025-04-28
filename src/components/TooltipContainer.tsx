import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TooltipContainerProps {
    children: React.ReactNode,
    tooltipText: string,
    side?: "top" | "right" | "left"
}

export function TooltipContainer({ children, tooltipText, side }: TooltipContainerProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side ? side : 'bottom'} className="opacity-80">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
