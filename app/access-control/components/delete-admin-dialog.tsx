'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { userService } from '@/services/user.service';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DeleteAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  admin: User | null;
  onSuccess: () => void;
}

export function DeleteAdminDialog({
  isOpen,
  onClose,
  admin,
  onSuccess,
}: DeleteAdminDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!admin) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await userService.deleteUser(admin._id);
      if (res.success) {
        toast.success(`Admin user "${admin.name}" removed successfully`);
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || 'Failed to delete user');
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to delete admin user'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Administrator"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-4 border border-rose-200">
          <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <p className="font-bold">Are you sure you want to revoke this admin access?</p>
            <p className="mt-1">
              This will permanently remove <span className="font-semibold text-rose-950">{admin.name}</span> ({admin.email}) from the administrator roster and revoke all administrative credentials.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="rounded-full"
          >
            Delete Admin
          </Button>
        </div>
      </div>
    </Modal>
  );
}

