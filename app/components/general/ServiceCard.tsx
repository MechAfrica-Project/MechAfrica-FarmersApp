import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { Star } from "lucide-react-native";

interface ServiceCardProps {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  rating: number;
  reviews: string | number;
  onPress: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  image,
  title,
  subtitle,
  rating,
  reviews,
  onPress,
}) => {
  return (
    <View className="bg-white rounded-2xl overflow-hidden shadow-md m-3 w-72">
      {/* Image */}
      <Image source={image} className="w-full h-40" resizeMode="cover" />

      {/* Content */}
      <View className="p-3">
        <Text className="text-primary-green font-bold text-lg">{title}</Text>
        <Text className="text-gray-600 text-sm mb-2">{subtitle}</Text>

        {/* Rating */}
        <View className="flex-row items-center mb-3">
          <Star size={14} color="#FFA500" fill="#FFA500" />
          <Text className="text-gray-600 text-xs ml-1">
            {rating} ({reviews})
          </Text>
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={onPress}
          className="bg-primary-green px-4 py-2 rounded-full self-start"
        >
          <Text className="text-white font-semibold text-sm">Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ServiceCard;
