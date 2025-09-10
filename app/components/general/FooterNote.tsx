import { View, Text } from "react-native";

export default function FooterNote() {
  return (
    <View className="py-4 h-[8rem] bg-light-yellow flex flex-col pb-12 justify-center align-middle w-full">
      <Text className="text-gray-color font-mulish text-center">
        By using MechAfrica, you agree to the{"\n"}
        Terms and Privacy Policy.
      </Text>
    </View>
  );
}
