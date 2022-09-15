import { ApplicationStageType } from '@prisma/client';
import { Select } from 'antd';
import { ApplicationStageTypeToLabelMap } from '../../types/applicationStage';

const { Option } = Select;

type Props = {
  isMultiselect?: boolean;
  onChange?: (newValue: ApplicationStageType[]) => void;
};

function ApplicationStagesSelect({ isMultiselect = false, onChange }: Props) {
  const mode = isMultiselect ? 'multiple' : undefined;
  const options = Object.entries(ApplicationStageTypeToLabelMap).map(([stage, label], index) => (
    <Option key={index} value={stage}>
      {label}
    </Option>
  ));

  return (
    <Select placeholder="Application Stage" mode={mode} maxTagCount={3} onChange={onChange}>
      {options}
    </Select>
  );
}

export default ApplicationStagesSelect;
