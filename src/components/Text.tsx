import React, { ElementType, ReactNode, CSSProperties } from "react";

interface TextProps {
  children: ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "small" | "error";
  style?: CSSProperties;
  className?: string;
  as?: ElementType;
  [key: string]: any;
}

const Text: React.FC<TextProps> = ({ 
  children, 
  variant = "body",
  style = {}, 
  className = "",
  as,
  ...props 
}) => {
  const baseStyle: CSSProperties = {
    fontFamily: '"Inter", sans-serif',
    margin: 0,
    color: "var(--text-primary)",
  };

  const variants: Record<string, CSSProperties> = {
    h1: { fontSize: "32px", fontWeight: "700" },
    h2: { fontSize: "24px", fontWeight: "700" },
    h3: { fontSize: "20px", fontWeight: "600" },
    h4: { fontSize: "16px", fontWeight: "600" },
    body: { fontSize: "14px", fontWeight: "400" },
    small: { fontSize: "12px", fontWeight: "400" },
    error: { fontSize: "13px", fontWeight: "400", color: "#dc2626" },
  };

  const Tag = (as || (variant.startsWith("h") ? variant : "p")) as ElementType;

  return (
    <Tag 
      style={{ ...baseStyle, ...variants[variant], ...style }} 
      className={className}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Text;
