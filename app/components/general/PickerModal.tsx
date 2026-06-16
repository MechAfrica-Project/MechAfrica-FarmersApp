import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Modal, Platform, Pressable, Text, View } from "react-native";

type PickerModalProps = {
  visible: boolean;
  mode: "date" | "time";
  value: Date;
  onChange: (event: DateTimePickerEvent, selected?: Date) => void;
  onClose: () => void;
};

const PickerModal = ({ visible, mode, value, onChange, onClose }: PickerModalProps) => {
  const [screen, setScreen] = useState(Dimensions.get("window"));

  // Use ref to store the selected value to avoid re-renders during scrolling
  const selectedValueRef = useRef<Date>(value);

  // Only used to force re-render when modal opens with new value
  const [displayValue, setDisplayValue] = useState<Date>(value);

  // Stable key to prevent picker from unmounting/remounting
  const [pickerKey, setPickerKey] = useState(0);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreen(window);
    });
    return () => subscription.remove();
  }, []);

  // Reset values when modal opens
  useEffect(() => {
    if (visible) {
      selectedValueRef.current = value;
      setDisplayValue(value);
      // Increment key to force fresh picker instance when modal opens
      setPickerKey((k) => k + 1);
    }
  }, [visible, value]);

  const modalPadding = screen.width * 0.05;
  const buttonHeight = screen.height * 0.07;
  const buttonFontSize = screen.width * 0.045;
  const pickerHeight = screen.height * 0.35;

  // Memoized change handler to prevent unnecessary re-renders
  const handlePickerChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      // On Android, handle dismissal
      if (Platform.OS === "android") {
        if (event.type === "dismissed") {
          onClose();
          return;
        }
        if (event.type === "set" && selected) {
          selectedValueRef.current = selected;
          onChange(event, selected);
          onClose();
        }
        return;
      }

      // iOS handling - only update ref, don't trigger state updates
      if (selected) {
        // Validate: check if the date is reasonable (not epoch)
        const year = selected.getFullYear();
        if (year >= 2000) {
          // Valid date, store in ref (no re-render)
          selectedValueRef.current = selected;
        }
      }
    },
    [onChange, onClose]
  );

  // Handle Done button - propagate final value to parent
  const handleDone = useCallback(() => {
    const finalValue = selectedValueRef.current;

    // Create a synthetic event for compatibility
    const syntheticEvent = {
      type: "set",
      nativeEvent: {
        timestamp: finalValue.getTime(),
      },
    } as DateTimePickerEvent;

    onChange(syntheticEvent, finalValue);
    onClose();
  }, [onChange, onClose]);

  // Handle cancel/close without saving
  const handleCancel = useCallback(() => {
    selectedValueRef.current = value;
    onClose();
  }, [value, onClose]);

  // Don't render picker content when not visible
  if (!visible) {
    return null;
  }

  // On Android, mounting DateTimePicker natively opens a Dialog.
  // Wrapping it in a React Native Modal causes a double-popup.
  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        key={`picker-${mode}-${pickerKey}`}
        value={displayValue}
        mode={mode}
        display="default"
        onChange={handlePickerChange}
        minimumDate={mode === "date" ? new Date() : undefined}
      />
    );
  }

  // On iOS, DateTimePicker is an inline view, so we wrap it in a beautiful custom Modal
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        className="bg-black/50"
        onPress={handleCancel}
      >
        <Pressable
          style={{ marginHorizontal: modalPadding, width: screen.width * 0.9 }}
          className="bg-white rounded-xl overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ height: pickerHeight, justifyContent: "center" }}>
            <DateTimePicker
              key={`picker-${mode}-${pickerKey}`}
              value={displayValue}
              mode={mode}
              display="spinner"
              onChange={handlePickerChange}
              style={{ width: "100%", height: pickerHeight }}
              minimumDate={mode === "date" ? new Date() : undefined}
              textColor="#000000"
            />
          </View>

          <Pressable
            onPress={handleDone}
            style={{ height: buttonHeight }}
            className="bg-green-700 justify-center rounded-b-xl"
          >
            <Text
              style={{ fontSize: buttonFontSize }}
              className="text-white text-center font-semibold"
            >
              Done
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PickerModal;
