import { PhoneValue } from "@/app/(auth)/login/components/PhoneInput";

export const getNormalizedPhone = (phone: PhoneValue | string | null): string => {
  if (!phone) return "";
  if (typeof phone === "string") return phone.replace(/\s+/g, "");
  // For PhoneValue objects, use formatted or raw, removing spaces
  return (phone.formatted || phone.raw || "").replace(/\s+/g, "");
};
