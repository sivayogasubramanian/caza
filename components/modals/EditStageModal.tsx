import { Modal } from 'antd';
import StageForm from '../forms/StageForm';
import { Dispatch, SetStateAction } from 'react';
import { Nullable } from '../../types/utils';
import { ApplicationStageApplicationData } from '../../types/applicationStage';

interface Props {
  setSelectedStage: Dispatch<SetStateAction<Nullable<ApplicationStageApplicationData>>>;
}

function EditStageModal({ setSelectedStage }: Props) {
  return (
    <Modal open title="Edit Stage" onCancel={() => setSelectedStage(null)}>
      <StageForm />
    </Modal>
  );
}

export default EditStageModal;
