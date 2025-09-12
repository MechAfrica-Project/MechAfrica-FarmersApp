import { Text, View } from "react-native";
import BackButton from "@/app/components/general/BackButton";
import FooterNote from "@/app/components/general/FooterNote";
import { Href } from "expo-router";

export default function AuthLayout({
  children,
  title,
  subtitle,
  backHref = "/",
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  backHref?: Href;
}) {
  return (
    <View className="flex-1 bg-white pt-[8rem] justify-between">
      <View className="mx-8 justify-between h-[70%]">
        <BackButton />
        <View className="my-15">
          <Text className="text-[2rem] mb-2 font-mulish font-black text-center">
            {title}
          </Text>
          {subtitle && <View className="mb-10">{subtitle}</View>}
        </View>
        {children}
      </View>
      <FooterNote />
    </View>
  );
}
