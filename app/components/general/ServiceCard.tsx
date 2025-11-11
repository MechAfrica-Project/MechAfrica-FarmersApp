import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  Dimensions,
} from "react-native";
import { Star } from "lucide-react-native";

interface ServiceCardProps {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  rating: number;
  onCarousel?: boolean;
  onPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ServiceCard: React.FC<ServiceCardProps> = ({
  image,
  title,
  subtitle,
  rating,
  onCarousel,
  onPress,
}) => {
  // Responsive width
  const cardWidth = onCarousel ? SCREEN_WIDTH * 0.7 : (SCREEN_WIDTH - 48) / 2;

  // Image height depending on carousel or grid
  const imageHeight = onCarousel ? 180 : 120;

  return (
    <View
      style={{ width: cardWidth }}
      className="bg-white rounded-2xl shadow-md m-2 overflow-hidden p-2"
    >
      {/* Image with consistent white padding */}
      <View className=" w-full flex-col bg-white rounded-2xl">
        <Image
          source={image}
          resizeMode="cover"
          className="rounded-2xl w-full"
          style={{ height: imageHeight }}
        />
      </View>

      {/* Content */}
      <View
        className={`p-2 flex-col justify-between ${
          onCarousel ? "gap-6" : "h-[8rem]"
        }`}
      >
        <View>
          <Text className="text-primary-green font-mulish font-bold text-lg">
            {title}
          </Text>
          <Text
            className={`text-gray-600 font-mulish font-bold text-sm ${
              onCarousel ? "w-full" : "w-[11.5rem]"
            }`}
          >
            {subtitle}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mt-2">
          {/* Rating */}
          <View className="flex-row items-center">
            <Star size={14} color="#FFA500" fill="#FFA500" />
            <Text className="text-gray-600 font-mulish text-xs ml-1">
              {rating}
            </Text>
          </View>

          {/* Request Button */}
          <TouchableOpacity
            onPress={onPress}
            className="bg-primary-green px-4 py-2 rounded-full"
          >
            <Text className="text-white font-mulish font-semibold text-sm">
              Request
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ServiceCard;
