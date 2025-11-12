import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const sections = [
  {
    title: "Conditions of Use",
    content:
      "We will provide their services to you, which are subject to the conditions stated below in this document. Every time you visit this website, use its services or make a purchase, you accept the following conditions. This is why we urge you to read them carefully.",
  },
  {
    title: "Privacy Policy",
    content:
      "Before you continue using our website we advise you to read our privacy policy regarding our user data collection. It will help you better understand our practices.",
  },
  {
    title: "Copyright",
    content:
      "Content published on this website (digital downloads, images, texts, graphics, logos) is the property of XYZ and/or its content creators and protected by international copyright laws.",
  },
  {
    title: "License and Site Access",
    content:
      "We grant you a limited license to access and make personal use of this website. You are not allowed to download or modify it without written consent from us.",
  },
  {
    title: "Off-Platform Transactions",
    content:
      "If users engage service providers off the platform, bypassing app requests, they take full responsibility for outcomes. The company is not liable for any off-platform deals, payments, or issues.",
  },
];

const TermsModal = ({ visible, onClose }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!visible) return null;

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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
        >
          <View className="w-full max-h-[65%] bg-white rounded-t-2xl px-4 pt-4 pb-6 shadow-2xl">
            <SafeAreaView className="h-full">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-mulish font-bold text-gray-900">
                  Terms & Conditions
                </Text>
                <TouchableOpacity onPress={onClose} className="px-2 py-1">
                  <Text className="text-sm font-mulish font-semibold text-gray-500">Close</Text>
                </TouchableOpacity>
              </View>

              {/* Stepper + Scrollable content */}
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {sections.map((section, index) => {
                  const isActive = index === activeIndex;
                  const isDone = index < activeIndex;

                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      onPress={() => setActiveIndex(index)}
                      className="mb-6"
                    >
                      {/* step indicator */}
                      <View className="flex-row items-start">
                        <View className="w-6 items-center">
                          {isDone ? (
                            <View className="bg-green-500 w-5 h-5 rounded-full items-center justify-center">
                              <Check size={12} color="white" />
                            </View>
                          ) : isActive ? (
                            <View className="border-2 border-green-500 w-5 h-5 rounded-full" />
                          ) : (
                            <View className="border-2 border-gray-300 w-5 h-5 rounded-full" />
                          )}
                          {index < sections.length - 1 && (
                            <View className="w-[2px] flex-1 bg-gray-300" />
                          )}
                        </View>

                        {/* section text */}
                        <View className="ml-3 flex-1">
                          <Text
                            className={`text-base font-mulish font-bold ${
                              isActive || isDone
                                ? "text-gray-900"
                                : "text-gray-400"
                            }`}
                          >
                            {section.title}
                          </Text>
                          {isActive && (
                            <Text className="text-gray-700 font-mulish mt-1 leading-6">
                              {section.content}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Actions */}
              <View className="flex-row gap-4 mt-4">
                <TouchableOpacity
                  onPress={() => {
                    if (activeIndex < sections.length - 1) {
                      setActiveIndex(prev => prev + 1);
                    } else {
                      onClose();
                    }
                  }}
                  className="flex-1 bg-green-600 py-3 rounded-xl items-center justify-center"
                >
                  <Text className="text-white font-mulish font-bold">
                    {activeIndex === sections.length - 1
                      ? "Accept All"
                      : "Next"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 border border-gray-300 py-3 rounded-xl items-center justify-center"
                >
                  <Text className="text-gray-700 font-mulish font-bold">Decline</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default TermsModal;
