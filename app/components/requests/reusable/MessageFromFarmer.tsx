import React from "react";
import { View } from "react-native";
import AudioMessage from "./message/AudioMessage";
import TextMessage from "./message/TextMessage";

interface MessageFromFarmerProps {
  request: {
    messageFromFarmer?: string;
    voiceNoteUrl?: string;
  };
}

const MessageFromFarmer = ({ request }: MessageFromFarmerProps) => {
  return (
    <View>
      <TextMessage message={request?.messageFromFarmer} />
      {!!request?.voiceNoteUrl && <AudioMessage voiceNoteUrl={request.voiceNoteUrl} />}
    </View>
  );
};

export default MessageFromFarmer;
