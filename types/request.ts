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

export interface CreateServiceRequestPayload {
  service_type: string;
  farm_id: string; // The exact farm ID
  farm_name: string; // Fallback
  farm_size: number;
  crop_type: string;
  extra_comment?: string;
  start_date: string;
  end_date: string;
}

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
  farm?: {
    id: string;
    farm_name: string;
    latitude: number;
    longitude: number;
    farm_size: number;
  };
  farmLatitude?: number;
  farmLongitude?: number;
};
