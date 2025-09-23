import React from "react";
import { View, FlatList } from "react-native";
import ServiceCard from "../general/ServiceCard";

interface Service {
  id: string;
  image: any;
  title: string;
  subtitle: string;
  rating: number;
}

interface ServicesCarouselProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

const ServicesCarousel: React.FC<ServicesCarouselProps> = ({
  services,
  onSelectService,
}) => {
  return (
    <View >
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
            onPress={() => onSelectService(item)}
          />
        )}
      />
    </View>
  );
};

export default ServicesCarousel;
