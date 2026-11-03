'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Patient } from '@/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DeletePatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: () => void;
}

export function DeletePatientDialog({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: DeletePatientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!patient) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/patients/${patient._id}`);
      toast.success(`Patient record for ${patient.name} deleted`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete patient';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Patient Record"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-4 border border-rose-200">
          <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <p className="font-bold">Are you sure you want to delete this patient?</p>
            <p className="mt-1">
              This will permanently delete the clinical profile of{' '}
              <span className="font-semibold text-rose-950">{patient.name}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Patient
          </Button>
        </div>
      </div>
    </Modal>
  );
}
