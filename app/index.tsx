import { images } from "@/interfaces/images";
import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  return (
    <View className="flex-1 relative">
      {/* Background Image */}
      <Image
        source={images.welcomebg}
        className="absolute inset-0 w-full h-full z-0"
        resizeMode="cover"
      />

      {/* Overlay */}
      <View className="relative flex-1 justify-end pb-1">
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,1)", "rgba(0,0,0,1)"]}
          style={{ position: "absolute", left: 0, right: 0, height: "30%" }}
        />
        {/* Text */}
        <View className="relative mb-8 p-6 items-center justify-center w-auto mx-[1.8%]">
          <Text className="text-white font-mulish text-center text-[2rem] font-extrabold mb-2">
            Welcome to <Text className="text-accent-yellow">MechAfrica</Text>
          </Text>
          <Text className="text-white font-mulish font-bold text-center">
            Join the new generation of farmers in Africa, where Farmers and
            Technology connect to making farming convenient.
          </Text>

          {/* Create Account Button */}
          <Link href="/(auth)/onboarding/OnboardingLayout" asChild>
            <TouchableOpacity className="bg-white rounded-xl w-full p-4  items-center mt-8">
              <Text className="text-black font-mulish text-base">
                Create an account
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Log In */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-white font-semibold ">
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/login/signIn" asChild>
              <TouchableOpacity>
                <Text className="text-accent-yellow font-semibold ">
                  Log In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
