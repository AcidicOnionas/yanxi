import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">言磎精品中文</h1>
          <p className="text-xl text-gray-600">
            带着学生快乐学习数学。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-xl text-gray-700 mb-4">
              What began as a small weekend program has grown into a comprehensive educational institution serving
              hundreds of students across different age groups and proficiency levels.
            </p>
            <p className="text-gray-700 text-2xl">
              Our unique approach integrates Chinese language acquisition with mathematical concepts, creating a
              powerful synergy that enhances learning in both disciplines.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-red-100 rounded-full"></div>
            <img
              src="/placeholder.svg?height=300&width=400"
              alt="Our campus"
              className="rounded-lg shadow-lg relative z-10"
            />
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-100 rounded-full"></div>
          </div>
        </div>

        <Separator className="my-16" />

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Mission & Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-red-600">Our Mission</h3>
                <p className="text-gray-700">
                  To provide exceptional education that integrates Chinese language learning with mathematical concepts,
                  fostering bilingual proficiency and analytical thinking in our students.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-blue-600">Our Vision</h3>
                <p className="text-gray-700">
                  To be the leading institution for integrated Chinese-Mathematics education, recognized for our
                  innovative curriculum and the outstanding achievements of our students.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Educational Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Integrated Learning</h3>
              <p className="text-gray-700">
                We believe that learning Chinese and mathematics together creates powerful cognitive connections that
                enhance understanding in both subjects.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Cultural Context</h3>
              <p className="text-gray-700">
                We teach mathematics within the context of Chinese culture and history, providing a rich, meaningful
                learning experience.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Practical Application</h3>
              <p className="text-gray-700">
                We emphasize real-world applications of mathematical concepts, taught in both Chinese and English.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Meet Our Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                <img
                  src="/placeholder.svg?height=128&width=128"
                  alt="Dr. Li Wei"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Dr. Li Wei</h3>
              <p className="text-gray-600">Founder & Academic Director</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                <img
                  src="/placeholder.svg?height=128&width=128"
                  alt="Prof. Sarah Chen"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Prof. Sarah Chen</h3>
              <p className="text-gray-600">Chinese Language Director</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                <img
                  src="/placeholder.svg?height=128&width=128"
                  alt="Dr. Michael Zhang"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Dr. Michael Zhang</h3>
              <p className="text-gray-600">Mathematics Director</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Experience the benefits of our unique educational approach. Enroll in one of our courses or contact us to
            learn more.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link href="/courses">Explore Courses</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

