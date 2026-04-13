import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const courses = [
  {
    title: "Complete Web Development Bootcamp",
    description: "Master HTML, CSS, JavaScript, React and Node.js from scratch",
    longDesc:
      "This comprehensive bootcamp covers everything you need to become a full-stack web developer. Starting from the very basics of HTML & CSS, you'll progress through JavaScript, React, Node.js, and databases. By the end you'll have built 15+ real-world projects.",
    price: 1999,
    thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80",
    category: "Web Development",
    level: "BEGINNER",
    duration: "52 hours",
    instructor: "Rahul Sharma",
    rating: 4.8,
    totalRatings: 12450,
    published: true,
  },
  {
    title: "Data Science & Machine Learning with Python",
    description: "Learn Python, NumPy, Pandas, Matplotlib, Scikit-Learn and TensorFlow",
    longDesc:
      "Dive deep into data science and machine learning. This course covers data analysis, visualization, statistical modeling, and building ML models. You'll work with real datasets and complete hands-on projects across multiple domains.",
    price: 2499,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    category: "Data Science",
    level: "INTERMEDIATE",
    duration: "68 hours",
    instructor: "Priya Nair",
    rating: 4.9,
    totalRatings: 9820,
    published: true,
  },
  {
    title: "UI/UX Design Masterclass",
    description: "Design beautiful user interfaces with Figma and modern design principles",
    longDesc:
      "Learn the complete design process from research to final handoff. Master Figma, design systems, prototyping, user research, and usability testing. Build a stunning portfolio with 10+ case studies.",
    price: 1499,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    category: "Design",
    level: "BEGINNER",
    duration: "38 hours",
    instructor: "Ananya Patel",
    rating: 4.7,
    totalRatings: 6340,
    published: true,
  },
  {
    title: "Advanced React & Next.js",
    description: "Build production-grade apps with React 18, Next.js 14 and TypeScript",
    longDesc:
      "Take your React skills to the next level. This course covers React Server Components, App Router, advanced state management, performance optimization, testing, and deployment strategies for production applications.",
    price: 2999,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    category: "Web Development",
    level: "ADVANCED",
    duration: "45 hours",
    instructor: "Vikram Singh",
    rating: 4.9,
    totalRatings: 4210,
    published: true,
  },
  {
    title: "Cloud Computing with AWS",
    description: "Master Amazon Web Services and prepare for AWS Solutions Architect exam",
    longDesc:
      "Gain hands-on experience with 50+ AWS services including EC2, S3, Lambda, RDS, and more. This course includes exam preparation material and practice tests for the AWS Solutions Architect Associate certification.",
    price: 2799,
    thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
    category: "Cloud",
    level: "INTERMEDIATE",
    duration: "60 hours",
    instructor: "Arjun Mehta",
    rating: 4.6,
    totalRatings: 7890,
    published: true,
  },
  {
    title: "Python for Beginners",
    description: "Learn Python programming from absolute zero — no experience needed",
    longDesc:
      "The perfect starting point for anyone wanting to learn programming. Covers Python fundamentals, OOP, file handling, APIs, and automation scripts. Includes 50+ coding exercises and mini-projects.",
    price: 0,
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    category: "Programming",
    level: "BEGINNER",
    duration: "22 hours",
    instructor: "Kavya Reddy",
    rating: 4.5,
    totalRatings: 18930,
    published: true,
  },
  {
    title: "DevOps & Docker Fundamentals",
    description: "Master containerization, CI/CD pipelines and modern DevOps practices",
    longDesc:
      "Learn Docker, Kubernetes, GitHub Actions, and Terraform. Build automated deployment pipelines and learn infrastructure as code. Real-world projects with industry-standard tooling.",
    price: 3499,
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
    category: "DevOps",
    level: "INTERMEDIATE",
    duration: "48 hours",
    instructor: "Ravi Kumar",
    rating: 4.8,
    totalRatings: 3560,
    published: true,
  },
  {
    title: "Digital Marketing & SEO",
    description: "Complete digital marketing strategy — SEO, social media, ads & analytics",
    longDesc:
      "A complete guide to digital marketing covering SEO, Google Ads, Facebook Ads, email marketing, content strategy, and analytics. Learn how to grow an online presence and drive measurable results.",
    price: 1299,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    category: "Marketing",
    level: "BEGINNER",
    duration: "34 hours",
    instructor: "Sneha Joshi",
    rating: 4.4,
    totalRatings: 5210,
    published: true,
  },
];

async function main() {
  console.log("Seeding database...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@teching.app" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@teching.app",
      role: "ADMIN",
      image: "https://ui-avatars.com/api/?name=Admin+User&background=5854f5&color=fff",
    },
  });
  console.log("Created admin:", admin.email);

  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: "student1@example.com" },
      update: {},
      create: {
        name: "Raj Patel",
        email: "student1@example.com",
        role: "STUDENT",
        image: "https://ui-avatars.com/api/?name=Raj+Patel&background=10b981&color=fff",
      },
    }),
    prisma.user.upsert({
      where: { email: "student2@example.com" },
      update: {},
      create: {
        name: "Meera Iyer",
        email: "student2@example.com",
        role: "STUDENT",
        image: "https://ui-avatars.com/api/?name=Meera+Iyer&background=f59e0b&color=fff",
      },
    }),
    prisma.user.upsert({
      where: { email: "student3@example.com" },
      update: {},
      create: {
        name: "Aryan Gupta",
        email: "student3@example.com",
        role: "STUDENT",
        image: "https://ui-avatars.com/api/?name=Aryan+Gupta&background=ef4444&color=fff",
      },
    }),
  ]);
  console.log("Created students:", students.map((s) => s.email));

  const createdCourses = await Promise.all(
    courses.map((course) => prisma.course.create({ data: course }))
  );
  console.log("Created courses:", createdCourses.length);

  const enrollmentData = [
    { userId: students[0].id, courseId: createdCourses[0].id, progress: 65 },
    { userId: students[0].id, courseId: createdCourses[1].id, progress: 30 },
    { userId: students[0].id, courseId: createdCourses[5].id, progress: 100 },
    { userId: students[1].id, courseId: createdCourses[2].id, progress: 80 },
    { userId: students[1].id, courseId: createdCourses[3].id, progress: 15 },
    { userId: students[2].id, courseId: createdCourses[0].id, progress: 45 },
    { userId: students[2].id, courseId: createdCourses[4].id, progress: 90 },
  ];

  for (const e of enrollmentData) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: e.userId, courseId: e.courseId } },
      update: { progress: e.progress },
      create: e,
    });
  }
  console.log("Created enrollments");

  const paymentData = [
    {
      userId: students[0].id,
      courseId: createdCourses[0].id,
      amount: createdCourses[0].price,
      status: "COMPLETED",
      stripeSessionId: "cs_test_seed_1",
    },
    {
      userId: students[0].id,
      courseId: createdCourses[1].id,
      amount: createdCourses[1].price,
      status: "COMPLETED",
      stripeSessionId: "cs_test_seed_2",
    },
    {
      userId: students[1].id,
      courseId: createdCourses[2].id,
      amount: createdCourses[2].price,
      status: "COMPLETED",
      stripeSessionId: "cs_test_seed_3",
    },
    {
      userId: students[1].id,
      courseId: createdCourses[3].id,
      amount: createdCourses[3].price,
      status: "COMPLETED",
      stripeSessionId: "cs_test_seed_4",
    },
    {
      userId: students[2].id,
      courseId: createdCourses[4].id,
      amount: createdCourses[4].price,
      status: "COMPLETED",
      stripeSessionId: "cs_test_seed_5",
    },
  ];

  for (const p of paymentData) {
    await prisma.payment.upsert({
      where: { stripeSessionId: p.stripeSessionId },
      update: {},
      create: p,
    });
  }
  console.log("Created payments");

  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
