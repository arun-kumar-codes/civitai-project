import { Modal } from '@mantine/core';
import { useDialogContext } from '~/components/Dialog/DialogProvider';
import { EditResourceReview } from '~/components/ResourceReview/EditResourceReview';
import { ResourceReviewPagedModel } from '~/types/router';

export type EditResourceReviewModalProps = Pick<
  ResourceReviewPagedModel,
  'id' | 'modelId' | 'modelVersionId' | 'recommended' | 'details'
>;
export default function EditResourceReviewModal(props: EditResourceReviewModalProps) {
  const dialog = useDialogContext();
  return (
    <Modal {...dialog}>
      <EditResourceReview
        {...props}
        onSuccess={dialog.onClose}
        onCancel={dialog.onClose}
        initialEditing
      />
    </Modal>
  );
}
