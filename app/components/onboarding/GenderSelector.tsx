import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import SelectModal from "../general/SelectModal";

type GenderSelectProps = {
  label?: string;
  value?: "Male" | "Female";
  onChange: (value: "Male" | "Female") => void;
};

const GENDER_OPTIONS: ("Male" | "Female")[] = ["Male", "Female"];

export default function GenderSelect({ label, value, onChange }: GenderSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="mb-4">
      {label && <Text className="mb-2 font-mulish">{label}</Text>}

      <TouchableOpacity
        className="flex-row items-center justify-between border border-gray-300 rounded-lg p-3 py-4 bg-gray-50"
        onPress={() => setModalVisible(true)}
      >
        <View className="flex-row items-center">
          <MaterialIcons name="person" size={18} color="#555" className="mr-2" />
          <Text className="text-base font-mulish">{value || "Select gender"}</Text>
        </View>
        <Feather name="chevron-down" size={18} color="#555" />
      </TouchableOpacity>

      <SelectModal
        visible={modalVisible}
        title="Select Gender"
        options={GENDER_OPTIONS.map((g) => ({ label: g, value: g }))}
        onSelect={(v) => {
          onChange(v);
          setModalVisible(false);
        }}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
