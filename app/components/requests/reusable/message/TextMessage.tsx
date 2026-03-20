import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Edit2 } from "lucide-react-native";

interface TextMessageProps {
  message?: string;
  onEdit?: () => void;
}

const TextMessage = ({ message, onEdit }: TextMessageProps) => {
  return (
    <View className="flex-1 mt-6 mb-2">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[15px] font-mulish font-bold text-[#1E293B]">
          Message from Farmer
        </Text>
        
        {onEdit && (
          <TouchableOpacity 
            onPress={onEdit} 
            className="flex-row items-center bg-[#F0F9FF] border border-[#E0F2FE] px-3 py-1.5 rounded-full shadow-sm"
          >
            <Edit2 size={14} color="#0EA5E9" />
            <Text className="text-[#0EA5E9] font-mulish font-bold ml-1.5 text-xs">
              Edit
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        className="border border-[#E2E8F0] font-mulish rounded-2xl p-4 text-[15px] min-h-[110px] text-[#334155] bg-[#F8FAFC]"
        value={message || "No message provided."}
        editable={false}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
};

export default TextMessage;
