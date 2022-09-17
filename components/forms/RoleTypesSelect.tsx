import { RoleType } from '@prisma/client';
import { Select } from 'antd';
import { roleTypeToDisplayStringMap } from '../../utils/role/roleUtils';

const { Option } = Select;

type Props = {
  isMultiselect?: boolean;
  onChange?: (newValue: RoleType[]) => void;
};

function RoleTypesSelect({ isMultiselect = false, onChange }: Props) {
  const mode = isMultiselect ? 'multiple' : undefined;
  const options = roleTypeToDisplayStringMap.map((label, role) => (
    <Option key={role} value={role}>
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
