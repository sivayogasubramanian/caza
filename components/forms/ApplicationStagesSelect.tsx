import { ApplicationStageType } from '@prisma/client';
import { Select } from 'antd';
import { stageTypeToDisplayStringMap } from '../../utils/applicationStage/applicationStageUtils';

const { Option } = Select;

type Props = {
  isMultiselect?: boolean;
  onChange?: (newValue: ApplicationStageType[]) => void;
};

function ApplicationStagesSelect({ isMultiselect = false, onChange }: Props) {
  const mode = isMultiselect ? 'multiple' : undefined;
  const options = stageTypeToDisplayStringMap.map((label, stage) => (
    <Option key={stage} value={stage}>
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
