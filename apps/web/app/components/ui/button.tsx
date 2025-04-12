import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import Spinner from "../svg/spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        brand:
          "bg-[#A618FF] hover:bg-[#B642FF] rounded-[10px] text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.4)] active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.4)] ",
      },
      size: {
        default: "px-4 py-[6px]",
        sm: "h-9 rounded-md px-3",
        xs: "h-5 rounded-md px-2",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        brand: "px-4 pt-[8px] pb-[12px] active:pt-[10px] active:pb-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  formId?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      formId,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = isLoading || props.disabled;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...(formId ? { form: formId } : {})}
        {...props}
        disabled={isDisabled}
      >
        {isLoading && (
          <Spinner className="size-5 animate-spin  ..." viewBox="0 0 24 24" />
        )}
        {props.children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
