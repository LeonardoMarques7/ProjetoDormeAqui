import { ArrowRight, ChevronLeft, ChevronRight, Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Chevron } from "react-day-picker"

export function InteractiveHoverButton({
  children,
  className,
  icon: Icon,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group bg-primary text-primary-foreground  relative w-auto cursor-pointer hover:bg-black overflow-hidden rounded-2xl border-1 p-2 px-6  border-primary-300 text-center font-semibold",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {Icon ? (
            <div className=" rounded-full transition-all duration-300 group-hover:scale-[100.8] mr-5">
              <Icon size={20} className="group-hover:bg-white "/>
            </div>
        ) : (
          <div className="bg-white hover:bg-black h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8] mr-5"></div>
        )}
      
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="text-primary absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{children}</span>
        <ArrowRight size={18} className="mx-2.5 " />
      </div>
    </button>
  )
}
