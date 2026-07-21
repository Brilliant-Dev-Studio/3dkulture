import type { ElementType, ReactNode } from "react";

const SIZES = {
  xl: "max-w-xl",
  "3xl": "max-w-3xl",
  "7xl": "max-w-7xl",
} as const;

export function Container({
  children,
  as: Tag = "div",
  size = "7xl",
  className = "",
  id,
}: {
  children: ReactNode;
  as?: ElementType;
  size?: keyof typeof SIZES;
  className?: string;
  id?: string;
}) {
  return (
    <Tag id={id} className={`mx-auto w-full ${SIZES[size]} px-4 sm:px-6 ${className}`}>
      {children}
    </Tag>
  );
}
