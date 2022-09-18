import { Button, DatePicker, Form, Input, Select } from 'antd';
import { stageTypeToDisplayStringMap } from '../../utils/applicationStage/applicationStageUtils';
import AddEmojiIcon from '../icons/AddEmojiIcon';
import { MouseEvent, useState } from 'react';
import Picker, { IEmojiData } from 'emoji-picker-react';
import { Nullable } from '../../types/utils';

function StageForm() {
  const [form] = Form.useForm();
  const [shouldShowEmojiPicker, setShouldShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmojiUnicode, setSelectedEmojiUnicode] = useState<Nullable<string>>(null);

  const onSelectEmoji = (event: MouseEvent, emojiObject: IEmojiData) => {
    setSelectedEmojiUnicode(emojiObject.unified);
    setShouldShowEmojiPicker(false);
  };

  return (
    <Form form={form}>
      <Form.Item name="type" label="Stage" rules={[{ required: true, message: 'Please choose a stage.' }]}>
        <Select placeholder="Select stage">
          {stageTypeToDisplayStringMap.map((value, key) => (
            <Select.Option key={key} value={key}>
              {value}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select a date.' }]}>
        <DatePicker />
      </Form.Item>

      <Form.Item label="Reaction">
        <div>
          {!shouldShowEmojiPicker && !selectedEmojiUnicode && (
            <AddEmojiIcon onClick={() => setShouldShowEmojiPicker(!shouldShowEmojiPicker)} />
          )}

          {!shouldShowEmojiPicker && selectedEmojiUnicode && (
            <div className="flex items-center">
              <span role="img" aria-label="emoji" className="text-xl">
                {String.fromCodePoint(parseInt(selectedEmojiUnicode, 16))}
              </span>

              <Button type="text" className="text-sky-600" onClick={() => setSelectedEmojiUnicode(null)}>
                Clear
              </Button>
            </div>
          )}

          {shouldShowEmojiPicker && <Picker onEmojiClick={onSelectEmoji} />}
        </div>
      </Form.Item>

      <Form.Item name="remark" label="Remarks">
        <Input.TextArea />
      </Form.Item>
    </Form>
  );
}

export default StageForm;
