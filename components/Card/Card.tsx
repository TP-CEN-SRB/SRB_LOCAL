import React, { ReactNode } from "react";
interface CardProps {
  children: ReactNode;
  fullWidth?: boolean;
  fullHeight?: boolean;
  rounded?: boolean;
  centered?: boolean;
}
const Card = ({
  children,
  fullWidth = false,
  fullHeight = false,
  rounded = false,
  centered = false,
}: CardProps) => {
  return (
    <div
      className={`card ${fullWidth ? "w-full" : ""}  ${
        fullHeight ? "h-full" : ""
      } ${rounded ? "rounded-lg" : ""} ${
        centered ? "flex flex-col justify-center items-center" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default Card;
