import React from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from "./Button.module.css";

const BUTTON_VARIANTS = {
  PRIMARY: "primary",
  OUTLINE: "outline",
  GHOST: "ghost",
  LINK: "link",
  SECONDARY: "secondary",
  DESTRUCTIVE: "destructive",
} as const;

const BUTTON_SIZES = {
  SM: "sm",
  MD: "md",
  LG: "lg",
  ICON: "icon",
  ICON_SM: "icon-sm",
  ICON_MD: "icon-md",
  ICON_LG: "icon-lg",
} as const;

type ButtonVariant = (typeof BUTTON_VARIANTS)[keyof typeof BUTTON_VARIANTS];
type ButtonSize = (typeof BUTTON_SIZES)[keyof typeof BUTTON_SIZES];

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = BUTTON_VARIANTS.PRIMARY,
      size = BUTTON_SIZES.MD,
      asChild = false,
      className,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={type}
        className={`
        ${styles.button} 
        ${styles[variant]} 
        ${styles[size]} 
        ${disabled ? styles.disabled : ""} 
        ${className || ""}
      `}
        disabled={disabled}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

Button.displayName = "Button";
