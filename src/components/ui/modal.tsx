'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  name?: string
  children: React.ReactNode;
}

export function Modal({ isOpen,name, onClose, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
        { name && <DialogTitle>Add {name}</DialogTitle> }
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
