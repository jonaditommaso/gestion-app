import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface ValidationErrorDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ValidationErrorDialog({ isOpen, onClose }: ValidationErrorDialogProps) {
  const t = useTranslations('records')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>{t('validation-error-title')}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {t('validation-error-description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>
            {t('understood')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
