import React from "react";
import { View, FlatList } from "react-native";
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

const ServicesCarousel: React.FC<ServicesCarouselProps> = ({ services }) => {
  const router = useRouter();
  return (
    <View className="">
      <FlatList
        data={services}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <ServiceCard
            image={item.image}
            title={item.title}
            subtitle={item.subtitle}
            rating={item.rating}
            onPress={() =>
              router.push({
                pathname: "/components/service/ServiceStart",
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
