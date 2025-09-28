import React from "react";
import { View, Text, Modal, Pressable } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

type PickerModalProps = {
  visible: boolean;
  mode: "date" | "time";
  value: Date;
  onChange: (event: DateTimePickerEvent, selected?: Date) => void;
  onClose: () => void;
};

const PickerModal = ({ visible, mode, value, onChange, onClose }: PickerModalProps) => (
  <Modal visible={visible} transparent animationType="slide">
    <View className="flex-1 justify-center bg-black/50">
      <View className="bg-white rounded-lg mx-6 p-4">
        <DateTimePicker value={value} mode={mode} display="spinner" onChange={onChange} />
        <Pressable onPress={onClose} className="mt-4 py-4 bg-green-700 rounded-lg">
          <Text className="text-white text-center font-semibold">Done</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

export default PickerModal;
