import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Dispatch, SetStateAction } from "react"

interface DialogContainerProps {
    children: React.ReactNode,
    title: string,
    description?: string,
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
}

export function DialogContainer({ isOpen, children, setIsOpen, title, description }: DialogContainerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* <DialogTrigger asChild>
        {triggerText}
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-[550px] pb-0 focus:outline-none">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {children}
        </div>
        {/* <DialogFooter>
          <Button type="button" onClick={() => onSave()}>Guardar cambios</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  )
}
