import { useRouter } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import ServiceCard from "../../general/ServiceCard";

interface Service {
  id: string;
  title: string;
  subtitle: string;
  image: any;
  rating: number;
}

interface SearchServiceProps {
  filteredServices: Service[];
}

const SearchService: React.FC<SearchServiceProps> = ({ filteredServices }) => {
  const router = useRouter();

  return (
    <FlatList
      data={filteredServices}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ServiceCard
          image={item.image}
          title={item.title}
          subtitle={item.subtitle}
          rating={item.rating}
          onPress={() =>
            router.push({
              pathname: "/components/service/serviceFlow/ServiceStart",
              params: { id: item.id },
            })
          }
        />
      )}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 10 }}
      contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default SearchService;
