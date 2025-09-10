import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BackButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.back()}>
      <Feather name="arrow-left" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default BackButton;
