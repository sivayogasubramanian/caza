import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { KeyedMutator } from 'swr';
import { ApiResponse } from '../../types/apiResponse';
import { ApplicationData } from '../../types/application';
import { Modal } from 'antd';
import { ApplicationStageFormData, ApplicationStagePostData } from '../../types/applicationStage';
import StageForm from '../forms/StageForm';
import { Nullable } from '../../types/utils';
import { ApplicationStageType } from '@prisma/client';
import { isValidHex } from '../../utils/strings/validations';
import applicationStagesApi from '../../frontendApis/applicationStagesApi';

interface Props {
  applicationId: number;
  setIsAddingNewStage: Dispatch<SetStateAction<boolean>>;
  mutateApplicationData: KeyedMutator<ApiResponse<ApplicationData>>;
}

function NewStageModal({ applicationId, setIsAddingNewStage, mutateApplicationData }: Props) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stageFormData, setStageFormData] = useState<Nullable<ApplicationStageFormData>>(null);
  const [initialValues] = useState<ApplicationStageFormData>({});

  useEffect(() => {
    if (stageFormData !== null) {
      submit(stageFormData);
    }
  }, [stageFormData]);

  const submit = (values: ApplicationStageFormData) => {
    const { emojiUnicodeHex } = values;
    const canPostEmojiUnicodeHex =
      emojiUnicodeHex === undefined || emojiUnicodeHex === null || isValidHex(emojiUnicodeHex);

    const stagePostData: ApplicationStagePostData = {
      type: values.type ?? ApplicationStageType.MIXED,
      date: values.date?.toISOString() ?? new Date().toISOString(),
      emojiUnicodeHex: canPostEmojiUnicodeHex ? values.emojiUnicodeHex : null,
      remark: values.remark,
    };

    applicationStagesApi
      .createApplicationStage(applicationId, stagePostData)
      .then(() => {
        mutateApplicationData();
        setIsAddingNewStage(false);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Modal
      open
      title="New Stage"
      okText="Create"
      onCancel={() => setIsAddingNewStage(false)}
      onOk={() => setIsSubmitting(true)}
      maskClosable={false}
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

export default NewStageModal;
