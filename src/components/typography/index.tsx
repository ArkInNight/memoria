import * as React from "react"

import { cn } from "@/lib/utils"

type HeadingLevel = 1 | 2 | 3 | 4

const headingStyles: Record<HeadingLevel, string> = {
  1: "text-4xl font-bold tracking-tight text-primary",
  2: "text-3xl font-bold tracking-tight text-primary",
  3: "text-lg font-semibold",
  4: "text-base font-semibold",
}

function Heading({
  level = 2,
  className,
  ...props
}: React.ComponentProps<"h2"> & { level?: HeadingLevel }) {
  const Tag = `h${level}` as const
  return <Tag className={cn(headingStyles[level], className)} {...props} />
}

type TextSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"
type TextWeight = "normal" | "medium" | "semibold" | "bold" | "extrabold"
type TextVariant =
  | "default"
  | "muted"
  | "primary"
  | "destructive"
  | "yellow"
  | "purple"
  | "emerald"
  | "cyan"

const textSizes: Record<TextSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
}

const textWeights: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
}

const textVariants: Record<TextVariant, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  destructive: "text-destructive",
  yellow: "text-yellow-500",
  purple: "text-purple-500",
  emerald: "text-emerald-500",
  cyan: "text-cyan-600",
}

function Text({
  as: Tag = "span",
  size,
  weight,
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: "span" | "p"
  size?: TextSize
  weight?: TextWeight
  variant?: TextVariant
}) {
  return (
    <Tag
      data-slot="text"
      className={cn(
        size && textSizes[size],
        weight && textWeights[weight],
        textVariants[variant],
        className
      )}
      {...props}
    />
  )
}

function Strong({ className, ...props }: React.ComponentProps<"strong">) {
  return <strong className={cn("font-semibold", className)} {...props} />
}

export { Heading, Text, Strong }
