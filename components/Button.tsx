import type { AnchorHTMLAttributes } from "react";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export default function Button({ className = "", style, ...props }: ButtonProps) {
  return (
    <a
      className={
        "inline-flex w-fit items-center justify-center gap-2 whitespace-nowrap rounded-full " +
        "bg-text px-6 py-3 font-body text-16 leading-none no-underline shadow-soft " +
        "transition-colors duration-200 hover:opacity-90 hover:no-underline " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent " +
        "focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
        className
      }
      style={{ color: "rgb(var(--chip-active-text))", textDecoration: "none", ...style }}
      {...props}
    />
  );
}
