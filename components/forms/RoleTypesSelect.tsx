import { RoleType } from '@prisma/client';
import { Select } from 'antd';
import { RoleTypeToLabelMap } from '../../types/role';

const { Option } = Select;

type Props = {
  isMultiselect?: boolean;
  onChange?: (newValue: RoleType[]) => void;
};

function RoleTypesSelect({ isMultiselect = false, onChange }: Props) {
  const mode = isMultiselect ? 'multiple' : undefined;
  const options = Object.entries(RoleTypeToLabelMap).map(([stage, label], index) => (
    <Option key={index} value={stage}>
      {label}
    </Option>
  ));

  return (
    <Select placeholder="Role Type" mode={mode} maxTagCount={3} onChange={onChange}>
      {options}
    </Select>
  );
}

export default RoleTypesSelect;
