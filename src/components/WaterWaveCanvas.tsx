import React from "react";

export interface WaterWaveCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: any;
}

export const WaterWaveCanvas: React.FC<WaterWaveCanvasProps> = ({
  className,
  style,
  children,
  ...props
}) => {
  return (
    <div className={className} style={style} {...props}>
      {children}
    </div>
  );
};

export default WaterWaveCanvas;
