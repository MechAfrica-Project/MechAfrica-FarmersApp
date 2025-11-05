import { images } from "@/constants/images";
import { Asset, Request } from "@/types/request";



export const requestsData: Request[] = [
  {
    id: "1",
    serviceId: "2",
    serviceTitle: "Ripping",
    serviceDetails: "Land Preparation & Soil Breaking",
    serviceImage: images.ripping,
    farmerName: "F. Sarfo Kofi",
    farmLocation: "Ejisu Adadientem, Kumasi",
    providerName: "P. Admin",
    startDateTime: "2025-08-02T08:30:00Z",
    endDateTime: "2025-08-04T16:00:00Z",
    status: "ongoing",
    progress: 0.7,
    daysLeft: 29,
    crop: "Maize",
    messageFromFarmer:
      "Hello, I need assistance with my tractor for plowing this weekend.",
    voiceNoteUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // example audio
  },
  {
    id: "2",
    serviceId: "1",
    serviceTitle: "Harvesting",
    serviceDetails: "Crop Collection & Processing",
    serviceImage: images.harvesting,
    farmerName: "F. Yaw Mensah",
    farmLocation: "Abrepo, Kumasi",
    providerName: "P. Admin",
    startDateTime: "2025-08-03T07:00:00Z",
    endDateTime: "2025-09-21T12:00:00Z",
    status: "completed",
    crop: "Rice",
    messageFromFarmer:
      "Good morning, I would like to schedule harvesting for my rice farm next week.",
    voiceNoteUrl: null,
  },
  {
    id: "3",
    serviceId: "3",
    serviceTitle: "Drone",
    serviceDetails: "Aerial Spraying & Monitoring",
    serviceImage: images.drone,
    farmerName: "F. Ama Nyarko",
    farmLocation: "Bantama, Kumasi",
    providerName: "P. Admin",
    startDateTime: "2025-08-04T09:00:00Z",
    endDateTime: "2025-08-04T12:00:00Z",
    status: "cancelled",
    cancelledBy: "admin",
    crop: "Cocoa",
    messageFromFarmer:
      "Please cancel the drone spraying for now. The crops are not ready yet.",
    voiceNoteUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  // Pending (formerly "sent") requests for Sent tab
  {
    id: "4",
    serviceId: "4",
    serviceTitle: "Irrigation",
    serviceDetails: "Drip Installation Assessment",
    serviceImage: images.threshing,
    farmerName: "F. Provider Ltd.",
    farmLocation: "KNUST Campus",
    providerName: "",
    startDateTime: "2025-08-05T08:00:00Z",
    endDateTime: "2025-08-05T10:00:00Z",
    status: "pending",
  },
  {
    id: "5",
    serviceId: "5",
    serviceTitle: "Planting",
    serviceDetails: "Seed planting schedule",
    serviceImage: images.planting,
    farmerName: "F. Admin",
    farmLocation: "Ejisu Adadientem, Kumasi",
    providerName: "",
    startDateTime: "2025-08-06T09:30:00Z",
    endDateTime: "2025-08-06T11:00:00Z",
    status: "pending",
  },
];

export const assetsData: Asset[] = [
  {
    id: "A1",
    machineType: "Tractor",
    workerName: "Kwame Aboagye",
    providerName: "P. Admin",
    status: "Active",
    currentTask: {
      assignedToRequest: "1",
      farmerName: "F. Sarfo Kofi",
      task: "Ripping Land Preparation & Soil Breaking",
      dateLeft: "29 Days left",
    },
    image: images.tractor1,
  },
  {
    id: "A2",
    machineType: "Harvester",
    workerName: "Adwoa Nsiah",
    providerName: "P. Admin",
    status: "Inactive",
    lastTask: {
      requestId: "2",
      farmerName: "F. Yaw Mensah",
      task: "Harvesting Maize Field",
      completedDate: "2025-09-21T12:00:00Z",
    },
    image: images.tractor2,
  },
  {
    id: "A3",
    machineType: "Drone",
    workerName: "Kojo Owusu",
    providerName: "P. Admin",
    status: "Active",
    image: images.drone,
  },
];
