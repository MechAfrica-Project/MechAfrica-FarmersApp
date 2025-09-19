// components/profile/modals/ContactAgentModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Phone, MessageCircle, Mail } from "lucide-react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ContactAgentModal = ({ visible, onClose }: Props) => {
  if (!visible) return null;

  const phoneNumber = "+233552778748";
  const email = "elvisgyasiowusu24@gmail.com";
  const whatsapp = "+233552778748";

  const actions = [
    {
      label: "Call Agent",
      icon: <Phone size={20} color="#16a34a" />,
      onPress: () => Linking.openURL(`tel:${phoneNumber}`),
    },
    {
      label: "WhatsApp Agent",
      icon: <MessageCircle size={20} color="#22c55e" />,
      onPress: () =>
        Linking.openURL(`https://wa.me/${whatsapp.replace("+", "")}`),
    },
    {
      label: "Send Email",
      icon: <Mail size={20} color="#3b82f6" />,
      onPress: () => Linking.openURL(`mailto:${email}`),
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1">
        {/* backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute inset-0 bg-black/40" />
        </TouchableWithoutFeedback>

        {/* bottom sheet */}
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-2xl p-6 shadow-2xl">
            <SafeAreaView className="pb-12">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-mulish font-semibold text-gray-900">
                  Contact Agent
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Text className="text-base font-mulish text-gray-500">Close</Text>
                </TouchableOpacity>
              </View>

              {/* Actions List */}
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={action.onPress}
                  className={`flex-row items-center gap-3 py-4 ${
                    index < actions.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  {action.icon}
                  <Text className="text-gray-800 font-mulish font-medium">
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </SafeAreaView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ContactAgentModal;
