"use client";
import { FC } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  overlayClassName?: string;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children, overlayClassName = "bg-black/50" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className={`fixed inset-0 ${overlayClassName} transition-opacity`}></div>
      <div className="z-50 bg-white rounded-[16px] shadow-xl transform transition-all">
        {children}
      </div>
    </div>
  );
};

export default Modal;
