// types/request.ts
import { ImageSourcePropType } from "react-native";

export type RequestStatus = "demand" | "ongoing" | "completed" | "cancelled";

export interface Asset {
  machineType: string;
  machineName: string;
  status: "Active" | "Inactive";
  farmerName: string;
  task: string;
  dateLeft: string;
  image: ImageSourcePropType;
}

export interface Request {
  id: number;
  serviceType: string;
  serviceDetails: string;
  farmLocation?: string; // optional for cancelled or demand requests
  providerName?: string; // optional for cancelled/demand
  dateRequested: string; // always required
  dateCompleted?: string; // only for completed
  status: RequestStatus; // ongoing/completed/cancelled/demand
  cancelledBy?: "admin" | "provider"; // only for cancelled
  progress?: number; // only for ongoing
  daysLeft?: number; // only for ongoing
  asset?: Asset; // only if a machine is involved
}
