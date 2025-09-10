import AuthLayout from "@/app/components/authScreens/AuthLayout";
import PrimaryButton from "@/app/components/general/PrimaryButton";
import { Feather } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignIn() {
  return (
    <AuthLayout
      backHref="/"
      title="Welcome back."
      subtitle={
        <Text className="text-gray-color text-base font-mulish text-center">
          Ready to take your farming{"\n"}to the next level again?
        </Text>
      }
    >
      <View>
        {/* Phone Input */}

        <Text className="text-gray-color">Telephone number</Text>
        <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-4 mb-6">
          <Feather name="phone" size={20} color="gray" />
          <TextInput
            placeholder="+233 22 85 79 95"
            keyboardType="phone-pad"
            className="ml-3 flex-1 text-base"
          />
        </View>

        {/* Login Button */}
        <PrimaryButton
          title="Log in"
          href="/(auth)/login/verifyPhone"
          // onPress={() => console.log("Logging in...")} // optional for logic
        />

        {/* Forgot Password */}
        <TouchableOpacity className="mt-4">
          <Text className="text-center">Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}
