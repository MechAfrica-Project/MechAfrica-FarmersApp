import React from "react";
import { View, Text, TextInput } from "react-native";

interface TextMessageProps {
  message?: string;
}

const TextMessage = ({ message }: TextMessageProps) => {
  return (
    <View className="flex-1">
      <Text className="text-base font-mulish font-medium text-black mb-2">
        Message from Farmer
      </Text>

      <TextInput
        className="border border-gray-300 font-mulish rounded-lg p-3 text-[15px] min-h-[100px] text-black bg-gray-50"
        value={message || "No message provided."}
        editable={false}
        multiline
      />
    </View>
  );
};

export default TextMessage;
