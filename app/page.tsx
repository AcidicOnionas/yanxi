import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, GraduationCap, Languages, Calculator, Clock, Users, BookOpen } from "lucide-react"
import CourseCard from "@/components/course-card"
import TestimonialCard from "@/components/testimonial-card"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-500 to-red-700 py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-white space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">言磎精品中文</h1>
              <p className="text-xl opacity-90">
              快乐学习语文数学！
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-red-700 hover:bg-gray-100">
                  <Link href="#courses">查看课程</Link>
                </Button>
                <Button asChild size="lg" className="border-white text-white hover:bg-gray-10">
                  <Link href="#contact">联系我们</Link>
                </Button>
              </div>
            </div>
            {/* <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 rounded-full opacity-70"></div>
                <img
                  src="/placeholder.svg?height=400&width=500"
                  alt="Students learning"
                  className="rounded-lg shadow-xl relative z-10"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500 rounded-full opacity-70"></div>
              </div>
            </div> */}
          </div>
        </div>
      </section>  

      {/* Features Section */}
      <section id="features" className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">我们课程的与众不同</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Languages className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multilanguage learning</h3>
              <p className="text-gray-600">
                可以由英语和中文教导。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">精心培养</h3>
              <p className="text-gray-600">
                为学生们锻炼思维能力。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">特选老师</h3>
              <p className="text-gray-600">细心又有耐性的老师</p>
            </div>

            {/* <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Schedule</h3>
              <p className="text-gray-600">Choose from various time slots that fit your busy lifestyle</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Small Class Sizes</h3>
              <p className="text-gray-600">Personalized attention with maximum 8 students per class</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Materials</h3>
              <p className="text-gray-600">Access to digital and physical learning resources in both subjects</p>
            </div> */}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 px-4 md:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">课程</h2>
            {/* <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore our range of courses designed for different age groups and proficiency levels
            </p> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CourseCard
              title="数学和中文"
              description="快速提升中文和数学"
              level="5-6年纪学生"
              duration="学期期间每周一"
              category="联合"
            />
{/* 
            <CourseCard
              title="Mathematical Chinese"
              description="Learn mathematical terminology in Chinese while solving problems. Perfect for students who want to strengthen both subjects simultaneously."
              level="Intermediate"
              duration="10 weeks"
              category="数学"
            />

            <CourseCard
              title="Advanced Chinese & Algebra"
              description="Develop advanced Chinese language skills while tackling algebraic concepts and problem-solving in both languages."
              level="Advanced"
              duration="14 weeks"
              category="语文"
            />

            <CourseCard
              title="Math Competition Prep (Chinese)"
              description="Prepare for mathematics competitions with problem-solving strategies taught in both Chinese and English."
              level="Advanced"
              duration="8 weeks"
              category="语文"
            /> */}
          </div>

          <div className="text-center mt-10">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link href="/courses">
                查看所有课程 <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from students who have experienced the benefits of our unique Chinese-Mathematics program
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Learning math in Chinese has improved both my language skills and mathematical thinking. The teachers make complex concepts easy to understand."
              name="Emily Chen"
              role="High School Student"
            />

            <TestimonialCard
              quote="As a parent, I've seen my child's confidence grow in both subjects. The bilingual approach gives them an advantage in both disciplines."
              name="Michael Wang"
              role="Parent"
            />

            <TestimonialCard
              quote="The problem-solving techniques I learned helped me excel in my school's math competition, and my Chinese vocabulary has expanded significantly."
              name="David Liu"
              role="Middle School Student"
            />
          </div>
        </div>
      </section> */}

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 md:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">联系我们</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">电话号码</h3>
                    <p className="text-gray-600">858-261-8491</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">电子邮箱</h3>
                    <p className="text-gray-600">chenxuhong1212@icloud.com</p>
                  </div>
                </div>

                {/* <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                 <div>
                    <h3 className="text-lg font-medium">地点</h3>
                    <p className="text-gray-600">6714 Kenmar Way</p>
                  </div>
                </div> */}
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-6">Inquiry Form</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                    Course of Interest
                  </label>
                  <select
                    id="course"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select a course</option>
                    <option value="chinese-fundamentals">Chinese Language Fundamentals</option>
                    <option value="mathematical-chinese">Mathematical Chinese</option>
                    <option value="advanced-chinese-algebra">Advanced Chinese & Algebra</option>
                    <option value="math-competition">Math Competition Prep (Chinese)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  ></textarea>
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  Submit Inquiry
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      
    </div>
  )
}

