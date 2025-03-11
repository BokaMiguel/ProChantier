import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "info";
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  content,
  onConfirm,
  onClose,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "warning",
}) => {
  if (!isOpen) return null;

  const getIconColor = () => {
    switch (variant) {
      case "destructive":
        return "text-red-500";
      case "warning":
        return "text-amber-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-amber-500";
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case "destructive":
        return "destructive";
      case "warning":
        return "default";
      case "info":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px] border-2 border-gray-300 bg-white shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${variant === "destructive" ? "bg-red-100" : variant === "warning" ? "bg-amber-100" : "bg-blue-100"}`}>
              <AlertTriangle className={`h-5 w-5 ${getIconColor()}`} />
            </div>
            <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4 text-gray-800 font-medium">
          {content}
        </div>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="border-2">
            {cancelText}
          </Button>
          <Button variant={getButtonVariant() as any} onClick={onConfirm} className="font-semibold">
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
