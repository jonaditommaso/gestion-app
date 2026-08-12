import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Dispatch, SetStateAction } from "react"

interface DialogContainerProps {
    children: React.ReactNode,
    title: string,
    description?: string,
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void),
    contentClassName?: string,
    bodyClassName?: string,
}

export function DialogContainer({ isOpen, children, setIsOpen, title, description, contentClassName, bodyClassName }: DialogContainerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* <DialogTrigger asChild>
        {triggerText}
      </DialogTrigger> */}
      <DialogContent className={cn("sm:max-w-[560px] pb-0 focus:outline-none", contentClassName)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-balance">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className={cn("grid gap-4 py-4", bodyClassName)}>
          {children}
        </div>
        {/* <DialogFooter>
          <Button type="button" onClick={() => onSave()}>Guardar cambios</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  )
}
