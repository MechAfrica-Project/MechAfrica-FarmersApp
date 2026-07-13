import { useRouter } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import ServiceCard from "../../general/ServiceCard";

import { Service } from "@/stores/catalogStore";

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
          image={item.imageUrl ? { uri: item.imageUrl } : undefined as any}
          title={item.name}
          subtitle={item.description}
          rating={4.9} // Hardcoded or omitted if not available in new model
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
