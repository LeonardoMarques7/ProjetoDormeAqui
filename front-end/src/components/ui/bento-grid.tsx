import type { ComponentPropsWithoutRef, ReactNode } from "react"
import photoDefault from "@/assets/user__default.png"

import { cn } from "@/lib/utils"

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string
  className?: string
  background?: ReactNode
  quote?: string
  stars?: number
  photo?: string
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  quote,
  stars = 0,
  photo,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-xl",
      // light styles
      "bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "dark:bg-background transform-gpu dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:[border:1px_solid_rgba(255,255,255,.1)]",
      className
    )}
    {...props}
  >
    <div>{background}</div>

    <div className="relative z-10 flex h-full flex-col justify-between p-5">
      <p className="line-clamp-6 text-base leading-relaxed text-neutral-700 dark:text-neutral-200">
        “{quote?.trim() ? quote : "Sem comentário"}”
      </p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={photo || photoDefault}
            className="h-12 w-12 rounded-full object-cover"
            alt={name}
          />
          <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
            {name}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={`${name}-${star}`} className={cn(star <= Math.round(stars) ? "text-yellow-500" : "text-neutral-300")}>
              ★
            </span>
          ))}
          <span className="ms-1">{Number(stars).toFixed(1)}</span>
        </div>
      </div>
    </div>

    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
  </div>
)

export { BentoCard, BentoGrid }
