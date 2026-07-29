import * as React from "react"
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type DialogVariant = "danger" | "warning" | "info" | "success"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  variant?: DialogVariant
  isLoading?: boolean
}

const variantStyles: Record<DialogVariant, { icon: React.ElementType, iconColor: string, buttonVariant: "primary" | "danger" | "outline" | "secondary" }> = {
  danger: { icon: AlertCircle, iconColor: "text-destructive", buttonVariant: "danger" },
  warning: { icon: AlertTriangle, iconColor: "text-amber-500", buttonVariant: "primary" },
  info: { icon: Info, iconColor: "text-blue-500", buttonVariant: "primary" },
  success: { icon: CheckCircle2, iconColor: "text-green-500", buttonVariant: "primary" },
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "danger",
  isLoading = false,
}: ConfirmationDialogProps) {
  const { icon: Icon, iconColor, buttonVariant } = variantStyles[variant]

  const handleConfirm = async () => {
    await onConfirm()
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
              <Icon className="h-6 w-6" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="pt-3 text-sm">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
