import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

interface CourseProps {
  course: {
    id: number
    title: string
    description: string
    price: number
    duration: string
    image: string
  }
}

export function CourseCard({ course }: CourseProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
      <div className="relative h-48 group">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-foreground">{course.title}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">{course.description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-primary">
            ${course.price.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground bg-secondary/30 px-2 py-1 rounded-full">
            {course.duration}
          </span>
        </div>
        <Link href={`/courses/${course.id}`} className="block">
          <Button 
            className="w-full uppercase tracking-wider transition-all 
            hover:shadow-md active:scale-95"
          >
            Learn More
          </Button>
        </Link>
      </div>
    </Card>
  )
}