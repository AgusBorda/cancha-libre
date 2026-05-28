import { cn } from "@/lib/utils"
import { SelectHTMLAttributes, forwardRef } from "react"
import { ChevronDown } from "lucide-react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:text-gray-500",
            error && "border-red-400 focus:ring-red-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"
