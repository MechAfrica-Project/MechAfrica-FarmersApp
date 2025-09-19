// app/profile.tsx (or pages/Profile.tsx)
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MultiToneBackground from "../components/general/MultiToneBackground";
import MenuList from "../components/profile/MenuList";

const Profile = () => {
  
  return (
    <MultiToneBackground topColor="#FFF9D6" mainColor="#FFFFFF">
      <View className="items-center mt-16">
        {/* Profile Image with Edit Icon */}
        <View className="relative">
          <Image
            source={{ uri: "https://via.placeholder.com/120" }}
            className="w-28 h-28 rounded-full border-4 border-white"
          />
          <TouchableOpacity className="absolute bottom-1 right-1 bg-green-500 p-2 rounded-full">
            <Ionicons name="pencil" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Name & ID */}
        <Text className="mt-3 text-lg font-semibold">Farmer Akwasi Okai</Text>
        <Text className="text-gray-500 text-xs">ID: 2453525362</Text>
      </View>

      {/* Menu List */}
      <MenuList />
    </MultiToneBackground>
  );
};

export default Profile;



// import { useEffect } from "react";
// import { Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
// import { useOnboardingStore } from "@/stores/onboardingStore";
// import { useAuthStore } from "@/stores/authStore";
// import MultiToneBackground from "../components/general/MultiToneBackground";

// export default function Profile() {
//   const {
//     data,
//     loadFromStorage,
//     reset: resetOnboarding,
//   } = useOnboardingStore();
//   const { logout } = useAuthStore();

//   useEffect(() => {
//     loadFromStorage();
//   }, []);

//   const handleLogout = async () => {
//     await logout();
//     resetOnboarding();
//   };

//   return (
//     <MultiToneBackground topColor="#FDFFE0" topHeight={150} mainColor="#ffff">
//       <ScrollView className="flex-1 pt-[7rem]">
//         {data.personalInfo?.name ? (
//           <View>
//             {/* ✅ Profile Picture */}
//             {data.profilePicture && (
//               <Image
//                 source={{ uri: data.profilePicture }}
//                 className="w-32 h-32 rounded-full mb-6 self-center"
//                 resizeMode="cover"
//               />
//             )}

//             {/* ✅ Language */}
//             <Text className="font-semibold mt-2">Language:</Text>
//             <Text>{data.language || "Not set"}</Text>

//             {/* ✅ Personal Info */}
//             <Text className="font-semibold mt-4">Name:</Text>
//             <Text>{data.personalInfo.name}</Text>

//             <Text className="font-semibold mt-2">Other Names:</Text>
//             <Text>{data.personalInfo.otherNames || "N/A"}</Text>

//             <Text className="font-semibold mt-2">Phone:</Text>
//             <Text>{data.personalInfo.phone?.raw || "N/A"}</Text>

//             {/* ✅ More Info */}
//             <Text className="font-semibold mt-4">Gender:</Text>
//             <Text>{data.moreInfo?.gender || "N/A"}</Text>

//             <Text className="font-semibold mt-2">Age:</Text>
//             <Text>{data.moreInfo?.age || "N/A"}</Text>

//             <Text className="font-semibold mt-2">Date of Birth:</Text>
//             <Text>{data.moreInfo?.dob || "N/A"}</Text>

//             {/* ✅ Location */}
//             <Text className="font-semibold mt-4">Region:</Text>
//             <Text>{data.location?.region || "N/A"}</Text>

//             <Text className="font-semibold mt-2">District:</Text>
//             <Text>{data.location?.district || "N/A"}</Text>

//             {/* ✅ Farm Info */}
//             <Text className="font-semibold mt-4">Farm Name:</Text>
//             <Text>{data.farmInfo?.farmName || "N/A"}</Text>

//             <Text className="font-semibold mt-2">Farm Size (acres):</Text>
//             <Text>
//               {data.farmInfo?.farmSize
//                 ? `${data.farmInfo.farmSize} acres`
//                 : "N/A"}
//             </Text>

//             <Text className="font-semibold mt-2">Crop Types:</Text>
//             <Text>
//               {data.farmInfo?.cropTypes?.length
//                 ? data.farmInfo.cropTypes.join(", ")
//                 : "N/A"}
//             </Text>

//             {/* ✅ Farm Location */}
//             <Text className="font-semibold mt-4">Farm Location:</Text>
//             {data.farmLocation ? (
//               <Text>
//                 {data.farmLocation.latitude}, {data.farmLocation.longitude}
//               </Text>
//             ) : (
//               <Text>Not set</Text>
//             )}
//           </View>
//         ) : (
//           <Text>No profile data found.</Text>
//         )}

//         {/* ✅ Logout button */}
//         <TouchableOpacity
//           onPress={handleLogout}
//           className="mt-8 bg-red-500 py-3 rounded-xl"
//         >
//           <Text className="text-white text-center font-semibold">Log out</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </MultiToneBackground>
//   );
// }
