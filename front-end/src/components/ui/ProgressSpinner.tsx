import { useEffect, useState } from "react"
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";

export default function ProgressSpinner() {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const handleIncrement = (prev: number) => {
      if (prev === 100) {
        return 0
      }
      return prev + 10
    }
    setValue(handleIncrement)
    const interval = setInterval(() => setValue(handleIncrement), 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatedCircularProgressBar
      value={value}
      gaugePrimaryColor="rgb(255, 255, 255)"
      gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
    />
  )
}
