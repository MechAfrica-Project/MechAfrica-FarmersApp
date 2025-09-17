// components/GenderSelect.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { User, ChevronDown } from "lucide-react-native"; 

type GenderSelectProps = {
  label?: string;
  value?: "Male" | "Female";
  onChange: (value: "Male" | "Female") => void;
};

const GENDER_OPTIONS: ("Male" | "Female")[] = ["Male", "Female"];

export default function GenderSelect({
  label,
  value,
  onChange,
}: GenderSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="mb-4">
      {label && <Text className="mb-2 font-mulish">{label}</Text>}

      {/* Selector */}
      <TouchableOpacity
        className="flex-row items-center justify-between border rounded-lg p-3 bg-gray-50"
        onPress={() => setModalVisible(true)}
      >
        <View className="flex-row items-center">
          <User size={18} color="#555" style={{ marginRight: 8 }} />
          <Text className="text-base">{value || "Select gender"}</Text>
        </View>
        <ChevronDown size={18} color="#555" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/40 justify-center">
          <View className="bg-white rounded-xl mx-6 p-4">
            <Text className="font-semibold text-lg mb-3">Select Gender</Text>
            <FlatList
              data={GENDER_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-3 border-b border-gray-200"
                  onPress={() => {
                    onChange(item);
                    setModalVisible(false);
                  }}
                >
                  <Text className="text-base">{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              className="mt-4 py-3 rounded-lg bg-gray-200"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-center font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
