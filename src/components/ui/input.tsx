import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm text-blue-900 shadow-sm shadow-blue-100/30 " +
          "transition-all duration-300 " +
          "placeholder:text-blue-400 " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 " +
          "hover:shadow-md hover:border-blue-200 " +
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-blue-50/30",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }