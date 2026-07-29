import { AlertCircle, RefreshCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ErrorCardProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorCard({
  title = "Something went wrong",
  description = "There was a problem processing your request. Please try again.",
  onRetry,
  className
}: ErrorCardProps) {
  return (
    <Card className={`border-destructive/50 ${className || ''}`}>
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent className="flex justify-center pt-4">
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
