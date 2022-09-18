import { Button, Modal } from 'antd';
import StageForm from '../forms/StageForm';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Nullable } from '../../types/utils';
import {
  ApplicationStageApplicationData,
  ApplicationStageFormData,
  ApplicationStagePatchData,
} from '../../types/applicationStage';
import { isValidDate } from '../../utils/date/validations';
import moment from 'moment';
import applicationStagesApi from '../../api/applicationStagesApi';
import { KeyedMutator } from 'swr';
import { ApiResponse } from '../../types/apiResponse';
import { ApplicationData } from '../../types/application';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface Props {
  applicationId: number;
  initialStage: ApplicationStageApplicationData;
  setSelectedStage: Dispatch<SetStateAction<Nullable<ApplicationStageApplicationData>>>;
  mutateApplicationData: KeyedMutator<ApiResponse<ApplicationData>>;
}

function EditStageModal({ applicationId, initialStage, setSelectedStage, mutateApplicationData }: Props) {
  const [stage] = useState<ApplicationStageApplicationData>(initialStage);
  const [initialValues, setInitialValues] = useState<ApplicationStageFormData>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stageFormData, setStageFormData] = useState<Nullable<ApplicationStageFormData>>(null);

  useEffect(() => {
    if (stageFormData !== null) {
      handleSubmit(stageFormData);
    }
  }, [stageFormData]);

  const handleSubmit = (values: ApplicationStageFormData) => {
    const stagePatchData: ApplicationStagePatchData = {
      type: values.type,
      date: values.date?.toISOString(),
      emojiUnicodeHex: values.emojiUnicodeHex,
      remark: values.remark,
    };

    applicationStagesApi
      .editApplicationStage(applicationId, stage.id, stagePatchData)
      .then(() => {
        mutateApplicationData();
        setSelectedStage(null);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = () => {
    applicationStagesApi.deleteApplicationStage(applicationId, stage.id).then(() => {
      mutateApplicationData();
      setSelectedStage(null);
    });
  };

  useEffect(() => {
    setInitialValues({
      type: stage.type,
      date: isValidDate(stage.date) ? moment(stage.date) : undefined,
      emojiUnicodeHex: stage.emojiUnicodeHex,
      remark: stage.remark,
    });
  }, [stage]);

  const onCancel = () => setSelectedStage(null);

  const onDelete = () => {
    Modal.confirm({
      title: 'Are you sure about deleting this stage?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action is irreversible',
      onOk: handleDelete,
    });
  };

  return (
    <Modal
      open
      title="Edit Stage"
      onCancel={onCancel}
      maskClosable={false}
      footer={[
        <Button key="delete" danger onClick={onDelete}>
          Delete
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" loading={isSubmitting} onClick={() => setIsSubmitting(true)}>
          Save
        </Button>,
      ]}
    >
      <StageForm
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        setStageFormData={setStageFormData}
      />
    </Modal>
  );
}

export default EditStageModal;
