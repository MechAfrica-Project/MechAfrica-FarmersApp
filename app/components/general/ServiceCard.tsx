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
  onPress: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  image,
  title,
  subtitle,
  rating,
  onPress,
}) => {
  return (
    <View className="bg-white rounded-2xl overflow-hidden shadow-md m-2">
      <View className="mt-2 w-full flex-col items-center">
        {/* Image */}
        <Image source={image} resizeMode="cover" className=" rounded-2xl" />
      </View>

      {/* Content */}
      <View className="p-2 flex-col justify-between h-[8rem]">
        <View>
          <Text className="text-primary-green font-mulish font-bold text-lg">
            {title}
          </Text>
          <Text className="text-gray-600 font-mulish font-bold text-sm w-[12rem]">
            {subtitle}
          </Text>
        </View>

        <View className="flex-row justify-between  align-middle gap-2">
          {/* Rating */}
          <View className="flex-row items-center ">
            <Star size={14} color="#FFA500" fill="#FFA500" />
            <Text className="text-gray-600 font-mulish text-xs ml-1">
              {rating}
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={onPress}
            className="bg-primary-green px-4 py-2 rounded-full self-start"
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
