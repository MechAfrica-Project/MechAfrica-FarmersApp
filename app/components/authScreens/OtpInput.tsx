import React, { useRef, useState } from "react";
import { View, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";

export default function OtpInput({
  length = 5,
  onCodeFilled,
  error,
}: {
  length?: number;
  onCodeFilled?: (code: string) => void;
  error?: boolean;
}) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [values, setValues] = useState<string[]>(Array(length).fill(""));

  const handleChange = (text: string, index: number) => {
    const newValues = [...values];
    newValues[index] = text;
    setValues(newValues);
    if (text && index < length - 1) inputs.current[index + 1]?.focus();
    if (!text && index > 0) inputs.current[index - 1]?.focus();

    const code = newValues.join("");
    if (code.length === length && !newValues.includes("")) {
      onCodeFilled?.(code);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 8, marginBottom: 12 }}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => (inputs.current[i] = ref)}
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: error ? "#ef4444" : "#9ca3af",
            textAlign: "center",
            fontSize: 20,
            backgroundColor: "#f3f4f6",
            fontWeight: "700",
          }}
          maxLength={1}
          keyboardType="numeric"
          value={values[i]}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
        />
      ))}
    </View>
  );
}
