import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen } from "lucide-react"

interface CourseCardProps {
  title: string
  description: string
  level: string
  duration: string
  category: "Chinese" | "Mathematics" | "Combined"
}

export default function CourseCard({ title, description, level, duration, category }: CourseCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Chinese":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "Mathematics":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "Combined":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge className={getCategoryColor(category)} variant="outline">
            {category}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <BookOpen className="mr-2 h-4 w-4" />
          <span>Level: {level}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="mr-2 h-4 w-4" />
          <span>Duration: {duration}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="text-sm text-blue-600 hover:underline cursor-pointer">View Course Details →</div>
      </CardFooter>
    </Card>
  )
}
