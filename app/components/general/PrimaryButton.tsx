import { Link, Href } from "expo-router";
import { TouchableOpacity, Text } from "react-native";

export default function PrimaryButton({
  title,
  href,
  onPress,
}: {
  title: string;
  href?: Href;
  onPress?: () => void;
}) {
  const ButtonContent = (
    <TouchableOpacity
      onPress={onPress}
      className="bg-primary-green py-4 rounded-lg mt-8"
    >
      <Text className="text-white text-center font-mulish font-semibold text-base">
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        {ButtonContent}
      </Link>
    );
  }

  return ButtonContent;
}
