// components/general/BottomSheetModal.tsx
import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  DimensionValue,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: DimensionValue;
}

const BottomSheetModal = ({
  visible,
  onClose,
  title,
  children,
  maxHeight = "65%",
}: Props) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <View className="flex-1 bg-black/40">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
        >
          {/* Sheet */}
          <View
            className="w-full bg-white rounded-t-2xl px-4 pt-4 pb-6 shadow-2xl"
            style={{ maxHeight }}
          >
            <SafeAreaView className="h-full">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                {title ? (
                  <Text className="text-lg font-bold">{title}</Text>
                ) : (
                  <View />
                )}
                <TouchableOpacity onPress={onClose}>
                  <Text className="text-gray-500">Close</Text>
                </TouchableOpacity>
              </View>

              {/* Scrollable content */}
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {children}
              </ScrollView>
            </SafeAreaView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default BottomSheetModal;
