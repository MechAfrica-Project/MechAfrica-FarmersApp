import React from "react";
import { View, FlatList, Dimensions } from "react-native";
import ServiceCard from "../general/ServiceCard";
import { useRouter } from "expo-router";

interface Service {
  id: string;
  image: any;
  title: string;
  subtitle: string;
  rating: number;
}

interface ServicesCarouselProps {
  services: Service[];
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ServicesCarousel: React.FC<ServicesCarouselProps> = ({ services }) => {
  const router = useRouter();
  const CARD_WIDTH = SCREEN_WIDTH * 0.7; // carousel cards take 70% of screen width

  return (
    <View className="py-2">
      <FlatList
        data={services}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 16} // 16px margin between cards
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <ServiceCard
            image={item.image}
            title={item.title}
            subtitle={item.subtitle}
            rating={item.rating}
            onCarousel
            onPress={() =>
              router.push({
                pathname: "/components/service/serviceFlow/ServiceStart",
                params: { id: item.id },
              })
            }
          />
        )}
      />
    </View>
  );
};

export default ServicesCarousel;
