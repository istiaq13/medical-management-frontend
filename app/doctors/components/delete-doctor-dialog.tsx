'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Doctor } from '@/types';
import { doctorService } from '@/services/doctor.service';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DeleteDoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onSuccess: () => void;
}

export function DeleteDoctorDialog({
  isOpen,
  onClose,
  doctor,
  onSuccess,
}: DeleteDoctorDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!doctor) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await doctorService.deleteDoctor(doctor._id);
      toast.success(`Dr. ${doctor.name} was successfully removed`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete doctor';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Doctor"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-4 border border-rose-200">
          <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <p className="font-bold">Are you sure you want to delete this doctor?</p>
            <p className="mt-1">
              This will remove <span className="font-semibold text-rose-950">Dr. {doctor.name}</span> ({doctor.specialization}) from the clinical system.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting} className="rounded-full">
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="rounded-full"
          >
            Delete Doctor
          </Button>
        </div>
      </div>
    </Modal>
  );
}
