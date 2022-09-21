import { RoleType } from '@prisma/client';
import { Select } from 'antd';
import { roleTypeToDisplayStringMap } from '../../utils/role/roleUtils';

const { Option } = Select;

type Props = {
  isMultiselect?: boolean;
  isBordered?: boolean;
  isUsedInHeader?: boolean;
  value?: RoleType[];
  onChange?: (newValue: RoleType[]) => void;
};

function RoleTypesSelect({ isMultiselect = false, isBordered = true, isUsedInHeader = false, value, onChange }: Props) {
  const mode = isMultiselect ? 'multiple' : undefined;
  const options = roleTypeToDisplayStringMap.map((label, role) => (
    <Option key={role} value={role}>
      {label}
    </Option>
  ));
  const selectClass = isUsedInHeader ? 'bg-primary-two' : '';

  return (
    <Select
      value={value}
      placeholder="Role Type"
      bordered={isBordered}
      className={selectClass}
      mode={mode}
      maxTagCount={3}
      onChange={onChange}
    >
      {options}
    </Select>
  );
}

export default RoleTypesSelect;
