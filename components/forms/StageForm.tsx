import { Button, DatePicker, Form, Input, Select } from 'antd';
import { stageTypeToDisplayStringMap } from '../../utils/applicationStage/applicationStageUtils';
import AddEmojiIcon from '../icons/AddEmojiIcon';
import { Dispatch, MouseEvent, SetStateAction, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { IEmojiData } from 'emoji-picker-react';
import { Nullable } from '../../types/utils';
import { ApplicationStageFormData } from '../../types/applicationStage';

interface Props {
  initialValues: ApplicationStageFormData;
  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setStageFormData: Dispatch<SetStateAction<Nullable<ApplicationStageFormData>>>;
}

function StageForm({ initialValues, isSubmitting, setIsSubmitting, setStageFormData }: Props) {
  const [form] = Form.useForm();

  const [shouldShowEmojiPicker, setShouldShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmojiUnicode, setSelectedEmojiUnicode] = useState<Nullable<string>>(null);

  const DynamicPicker = dynamic(() => import('emoji-picker-react'));

  const onSelectEmoji = (event: MouseEvent, emojiObject: IEmojiData) => {
    setSelectedEmojiUnicode(emojiObject.unified);
    setShouldShowEmojiPicker(false);
  };

  useEffect(() => {
    form.resetFields();

    if (initialValues.emojiUnicodeHex !== undefined) {
      setSelectedEmojiUnicode(initialValues.emojiUnicodeHex);
    }
  }, [initialValues]);

  useEffect(() => {
    if (isSubmitting) {
      form
        .validateFields()
        .then(() => setStageFormData({ ...form.getFieldsValue(), emojiUnicodeHex: selectedEmojiUnicode }))
        .catch(() => setIsSubmitting(false));
    }
  }, [isSubmitting]);

  const openEmojiPicker = () => setShouldShowEmojiPicker(!shouldShowEmojiPicker);

  return (
    <Form form={form} initialValues={initialValues} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} labelAlign="left">
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
        <DatePicker className="w-full" />
      </Form.Item>

      <Form.Item label="Reaction">
        <div>
          {!shouldShowEmojiPicker && !selectedEmojiUnicode && <AddEmojiIcon onClick={openEmojiPicker} />}

          {!shouldShowEmojiPicker && selectedEmojiUnicode && (
            <div className="flex items-center">
              <span
                role="img"
                aria-label="emoji"
                className="text-xl cursor-pointer hover:backdrop-brightness-95"
                onClick={openEmojiPicker}
              >
                {String.fromCodePoint(parseInt(selectedEmojiUnicode, 16))}
              </span>

              <Button type="text" className="text-sky-600" onClick={() => setSelectedEmojiUnicode(null)}>
                Clear
              </Button>
            </div>
          )}

          {shouldShowEmojiPicker && <DynamicPicker onEmojiClick={onSelectEmoji} />}
        </div>
      </Form.Item>

      <Form.Item name="remark" label="Remarks">
        <Input.TextArea />
      </Form.Item>
    </Form>
  );
}

export default StageForm;
