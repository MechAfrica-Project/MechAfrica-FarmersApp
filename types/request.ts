// types/request.ts
import { ImageSourcePropType } from "react-native";

export type StatusType = "Active" | "Inactive";

export type Asset = {
  id: string;
  machineType: string;
  workerName: string;
  providerName: string;
  status: StatusType;
  image?: ImageSourcePropType;
  currentTask?: {
    assignedToRequest: string;
    farmerName: string;
    task: string;
    dateLeft: string;
  };
  lastTask?: {
    requestId: string;
    farmerName: string;
    task: string;
    completedDate: string;
  };
};

export type RequestStatus = "pending" | "ongoing" | "completed" | "cancelled";

export type Request = {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceDetails: string;
  serviceImage?: ImageSourcePropType;
  farmerName: string;
  farmLocation: string;
  providerName: string;
  startDateTime: string;
  endDateTime: string;
  status: RequestStatus;
  progress?: number;
  daysLeft?: number;
  cancelledBy?: string;
  crop?: string;
  messageFromFarmer?: string;
  voiceNoteUrl?: string | null;
  asset?: Asset;
  farmLatitude?: number;
  farmLongitude?: number;
};
