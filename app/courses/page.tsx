import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CourseCard from "@/components/course-card"

export default function CoursesPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Courses</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our comprehensive range of Chinese language and mathematics courses designed for all ages and skill
          levels
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList>
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="chinese">Chinese Language</TabsTrigger>
            <TabsTrigger value="math">Mathematics</TabsTrigger>
            <TabsTrigger value="combined">Combined Programs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCard
              title="Chinese Language Fundamentals"
              description="Master Chinese characters, pronunciation, and basic conversation skills while learning numerical vocabulary and simple math concepts."
              level="Beginner"
              duration="12 weeks"
              category="语文"
            />

            <CourseCard
              title="Mathematical Chinese"
              description="Learn mathematical terminology in Chinese while solving problems. Perfect for students who want to strengthen both subjects simultaneously."
              level="Intermediate"
              duration="10 weeks"
              category="联合"
            />

            <CourseCard
              title="Advanced Chinese & Algebra"
              description="Develop advanced Chinese language skills while tackling algebraic concepts and problem-solving in both languages."
              level="Advanced"
              duration="14 weeks"
              category="联合"
            />

            <CourseCard
              title="Math Competition Prep (Chinese)"
              description="Prepare for mathematics competitions with problem-solving strategies taught in both Chinese and English."
              level="Advanced"
              duration="8 weeks"
              category="数学"
            />
          </div>
        </TabsContent>

        <TabsContent value="chinese" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCard
              title="Chinese Language Fundamentals"
              description="Master Chinese characters, pronunciation, and basic conversation skills while learning numerical vocabulary and simple math concepts."
              level="Beginner"
              duration="12 weeks"
              category="语文"
            />

            <CourseCard
              title="Elementary Chinese"
              description="A fun, interactive introduction to Chinese language for young learners, incorporating numbers and basic counting."
              level="Beginner"
              duration="8 weeks"
              category="语文"
            />

            <CourseCard
              title="Intermediate Conversation"
              description="Build fluency through practical conversations, including discussions about quantities, measurements, and everyday math."
              level="Intermediate"
              duration="10 weeks"
              category="语文"
            />
          </div>
        </TabsContent>

        <TabsContent value="math" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCard
              title="Math Competition Prep (Chinese)"
              description="Prepare for mathematics competitions with problem-solving strategies taught in both Chinese and English."
              level="Advanced"
              duration="8 weeks"
              category="数学"
            />

            <CourseCard
              title="Elementary Mathematics"
              description="Build a strong foundation in mathematics with instruction in both Chinese and English."
              level="Beginner"
              duration="10 weeks"
              category="数学"
            />

            <CourseCard
              title="Pre-Algebra"
              description="Prepare for algebra with a bilingual approach to mathematical concepts and problem-solving."
              level="Intermediate"
              duration="12 weeks"
              category="数学"
            />
          </div>
        </TabsContent>

        <TabsContent value="combined" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCard
              title="Mathematical Chinese"
              description="Learn mathematical terminology in Chinese while solving problems. Perfect for students who want to strengthen both subjects simultaneously."
              level="Intermediate"
              duration="10 weeks"
              category="联合"
            />

            <CourseCard
              title="Advanced Chinese & Algebra"
              description="Develop advanced Chinese language skills while tackling algebraic concepts and problem-solving in both languages."
              level="Advanced"
              duration="14 weeks"
              category="联合"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Not sure which course is right for you?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Our educational consultants can help you find the perfect course based on your current level, goals, and
          learning style.
        </p>
        <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
          <a href="/#contact">Schedule a Consultation</a>
        </Button>
      </div>
    </div>
  )
}

