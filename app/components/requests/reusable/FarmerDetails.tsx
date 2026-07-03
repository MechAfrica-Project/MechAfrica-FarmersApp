import { formatDate } from "@/utils/formatDate";
import React from "react";
import { ScrollView, Text, View, TouchableOpacity, Linking, Platform } from "react-native";
import { MapPin } from "lucide-react-native";
import { useFarmerStore } from "@/stores/farmerStore";

const FarmerDetails = ({ service }: any) => {
  const profile = useFarmerStore((s) => s.profile);
  const lat = service?.farmLatitude ?? profile?.farmLocation?.latitude;
  const lng = service?.farmLongitude ?? profile?.farmLocation?.longitude;

  // Define all display fields in a single array
  const details = [
    { label: "Service", value: service?.serviceTitle },
    { label: "Farmer's name", value: service?.farmerName },
    { label: "Preferred Date", value: formatDate(service?.startDateTime) },
    { label: "End Date", value: formatDate(service?.endDateTime) },
    { 
      label: "Farm", 
      value: service?.farmLocation, 
      lat: lat, 
      lng: lng 
    },
    { label: "Crop", value: service?.crop },
  ];

  const openMap = (lat: number, lng: number, label: string) => {
    const latLng = `${lat},${lng}`;
    const encodedLabel = encodeURIComponent(label);
    
    // For iOS, the most reliable way to drop a pin with a label at exact coordinates 
    // is using Apple Maps 'll' (center) and 'q' (search/label) with the http scheme.
    // For Android, 'geo:0,0?q=lat,lng(label)' drops a pin at lat,lng with the given label.
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${latLng}&q=${encodedLabel}`,
      android: `geo:0,0?q=${latLng}(${encodedLabel})`
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback to browser if native map fails
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latLng}`);
      });
    }
  };

  return (
    <ScrollView className="flex-1 px-6 bg-white mt-5">
      <Text className="text-lg font-semibold mb-4 text-gray-800">
        Farmer’s Details
      </Text>

      {/* Map through each detail row */}
      {details.map((item, index) => (
        <View
          key={index}
          className={`flex-row justify-between py-3 border-gray-200 ${
            index === 0 ? "border-t" : ""
          } ${index === details.length - 1 ? "border-b" : "border-t"}`}
        >
          <Text className="text-gray-600">{item.label}</Text>
          
          {item.label === "Farm" && item.lat && item.lng ? (
            <TouchableOpacity 
              onPress={() => openMap(item.lat, item.lng, item.value || "Farm")}
              className="flex-row items-center justify-center space-x-1 pl-4"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-teal-700 font-medium mr-1 underline">
                {item.value || "N/A"}
              </Text>
              <MapPin size={16} color="#0f766e" />
            </TouchableOpacity>
          ) : (
            <Text className="text-gray-900 font-medium text-right flex-1 ml-4">
              {item.value || "N/A"}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default FarmerDetails;
