import React, { forwardRef, useImperativeHandle, useRef } from "react";
import * as Animatable from "react-native-animatable";
import { ViewProps } from "react-native";

export type ShakeableViewRef = {
  shake: (duration?: number) => void;
};

const ShakeableView = forwardRef<ShakeableViewRef, ViewProps>(
  ({ children, ...props }, ref) => {
    const innerRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      shake: (duration = 600) => {
        innerRef.current?.shake(duration);
      },
    }));

    return (
      <Animatable.View ref={innerRef} {...props}>
        {children}
      </Animatable.View>
    );
  }
);

ShakeableView.displayName = "ShakeableView";

export default ShakeableView;
