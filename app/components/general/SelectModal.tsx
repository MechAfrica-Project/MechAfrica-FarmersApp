import React from "react";
import { View, Text, Modal, FlatList, TouchableOpacity } from "react-native";

type Option = {
  label: string;
  value: any;
  icon?: React.ReactNode;
};

type SelectModalProps = {
  visible: boolean;
  title?: string;
  options: Option[];
  onSelect: (value: any) => void;
  onClose: () => void;
};

export default function SelectModal({
  visible,
  title,
  options,
  onSelect,
  onClose,
}: SelectModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      {/* Background overlay */}
      <TouchableOpacity
        activeOpacity={1}
        className="absolute inset-0 bg-black/40 justify-center"
        onPress={onClose} // dismiss when background is clicked
      >
        {/* Modal content */}
        <View className="bg-white rounded-xl mx-6 max-h-[70%] p-4" pointerEvents="box-none">
          {title && <Text className="font-semibold text-lg mb-3">{title}</Text>}

          <FlatList
            data={options}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center py-3 border-b border-gray-200"
                onPress={() => onSelect(item.value)}
              >
                {item.icon && <View className="mr-2">{item.icon}</View>}
                <Text className="flex-1 text-base">{item.label}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            className="mt-4 py-3 rounded-lg bg-gray-200"
            onPress={onClose}
          >
            <Text className="text-center font-medium font-mulish">Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
