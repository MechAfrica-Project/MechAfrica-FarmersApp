import React from "react";
import { View } from "react-native";
import AudioMessage from "./message/AudioMessage";
import TextMessage from "./message/TextMessage";

interface MessageFromFarmerProps {
  request: {
    messageFromFarmer?: string;
    voiceNoteUrl?: string;
  };
  onEdit?: () => void;
}

const MessageFromFarmer = ({ request, onEdit }: MessageFromFarmerProps) => {
  return (
    <View>
      <TextMessage message={request?.messageFromFarmer} onEdit={onEdit} />
      {!!request?.voiceNoteUrl && <AudioMessage voiceNoteUrl={request.voiceNoteUrl} />}
    </View>
  );
};

export default MessageFromFarmer;
