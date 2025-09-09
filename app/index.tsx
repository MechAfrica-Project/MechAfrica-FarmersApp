import { images } from "@/interfaces/images";
import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

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
      <View className="flex-1 justify-end p-6 pb-19">
        {/* Text */}
        <View className="relative mb-8 items-center justify-center w-auto mx-[1.8%] bg-gradient-to-t from-black to-transparent">
          <Text className="text-white font-mulish text-center text-[2rem] font-extrabold mb-2">
            Welcome to <Text className="text-accent-yellow">MechAfrica</Text>
          </Text>
          <Text className="text-white font-mulish font-bold text-center">
            Join the new generation of farmers in Africa, where Farmers and
            Technology connect to making farming convenient.
          </Text>

          {/* Create Account Button */}
          <TouchableOpacity className="bg-white rounded-xl w-full p-4  items-center mt-8">
            <Link href="/auth/onboarding">
              <Text className="text-black font-mulish text-base">
                Create an account
              </Text>
            </Link>
          </TouchableOpacity>

          {/* Log In */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-white font-semibold ">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity>
              <Link href="/auth/signIn">
                <Text className="text-yellow-400 font-semibold ">Log In</Text>
              </Link>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
