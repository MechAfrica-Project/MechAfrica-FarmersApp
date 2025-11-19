import React, { useEffect, useState } from "react";
import { View, Text, Modal, Pressable, Dimensions } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

type PickerModalProps = {
  visible: boolean;
  mode: "date" | "time";
  value: Date;
  onChange: (event: DateTimePickerEvent, selected?: Date) => void;
  onClose: () => void;
};

const PickerModal = ({ visible, mode, value, onChange, onClose }: PickerModalProps) => {
  const [screen, setScreen] = useState(Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreen(window);
    });
    return () => subscription.remove();
  }, []);

  const modalPadding = screen.width * 0.05; // responsive horizontal padding
  const buttonHeight = screen.height * 0.07; // responsive button height
  const buttonFontSize = screen.width * 0.045; // responsive font size
  const pickerHeight = screen.height * 0.35; // spinner height relative to screen

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        className="bg-black/50"
      >
        <View
          style={{ marginHorizontal: modalPadding, width: screen.width * 0.9 }}
          className="bg-white rounded-lg overflow-hidden"
        >
          <View style={{ height: pickerHeight, justifyContent: "center" }}>
            <DateTimePicker
              value={value}
              mode={mode}
              display="spinner"
              onChange={onChange}
              style={{ width: "100%", height: pickerHeight }}
            />
          </View>

          <Pressable
            onPress={onClose}
            style={{ height: buttonHeight }}
            className="bg-green-700 justify-center rounded-b-lg"
          >
            <Text
              style={{ fontSize: buttonFontSize }}
              className="text-white text-center font-semibold"
            >
              Done
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default PickerModal;
