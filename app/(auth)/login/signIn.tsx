import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { View, Text } from "react-native";
import { router } from "expo-router";
import AuthLayout from "@/app/components/authScreens/AuthLayout";
import PrimaryButton from "@/app/components/general/PrimaryButton";
import PhoneInput from "@/app/components/authScreens/PhoneInput";
import { CountryCode } from "react-native-country-picker-modal";

const phoneSchema = z.object({
  phone: z.object({
    raw: z.string().min(7, "Phone number is too short"),
    formatted: z.string(),
    country: z.custom<CountryCode>(),
    valid: z.boolean().refine((val) => val === true, {
      message: "Invalid phone number",
    }),
  }),
});

type PhoneForm = z.infer<typeof phoneSchema>;

export default function SignIn() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: { raw: "", formatted: "", country: "GH", valid: false },
    },
  });

  const onSubmit = (data: PhoneForm) => {
    const { formatted } = data.phone;
    router.push({
      pathname: "/(auth)/login/verifyPhone",
      params: { phone: formatted },
    });
  };

  return (
    <AuthLayout
      backHref="/"
      title="Welcome back."
      subtitle={
        <Text className="text-gray-color text-base font-mulish text-center">
          Ready to take your farming{"\n"}to the next level again?
        </Text>
      }
    >
      <View>
        <Controller
          name="phone"
          control={control}
          render={({ field: { onChange, value } }) => (
            <PhoneInput
              label="Telephone number"
              onChange={onChange}
              defaultValue={value?.raw}
            />
          )}
        />

        {errors.phone?.message && (
          <Text className="text-red-500 mt-1 text-sm">
            {errors.phone.message}
          </Text>
        )}

        <PrimaryButton title="Log in" onPress={handleSubmit(onSubmit)} />
      </View>
    </AuthLayout>
  );
}
