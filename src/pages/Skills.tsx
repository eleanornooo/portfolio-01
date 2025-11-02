"use client";

// import React from "react";

// Skills data
const skills = [
  {
    category: "Research & Teaching",
    items: [
      { name: "Artificial Intelligence in Education", level: 100 },
      { name: "Artificial Intelligence in Education", level: 95 },
      { name: "Digital Learning Environments", level: 90 },
      { name: "Instructional Design", level: 90 },
    ],
  },
];

// Testimonials
const testimonials = [
  {
    quote:
      "Working with Aziz on the VOLCANIC Erasmus+ project was a true pleasure. He combines research rigor with inclusive design thinking.",
    name: "Dr. M. Dupont",
    title: "EU Project Partner",
    image: "https://ui-avatars.com/api/?name=M+Dupont&background=random",
  },
  {
    quote:
      "The depth and clarity with which Professor Sunil teaches is inspiring. He has played a big role in shaping my coding skills.",
    name: "Prof. L. Amrani",
    title: "Vice-Dean, UM6P",
    image: "https://ui-avatars.com/api/?name=L+Amrani&background=random",
  },
  {
    quote:
      "I had the pleasure of working with Prof. Aziz Mimoudi on the SustAInEr project. His deep expertise in AI and education, coupled with a clear sense of purpose, made a lasting impact.",
    name: "Achraf Ajrhourh",
    title: "AI Engineer, Sustaineur Project",
    image: "https://ui-avatars.com/api/?name=Achraf+Ajrhourh&background=random",
  },
  {
    quote:
      "Aziz’s contributions to our AI in education frameworks are shaping national strategies. He’s both visionary and pragmatic.",
    name: "Nadia El Baraka",
    title: "Student, Ministry of Education, Morocco",
    image: "https://ui-avatars.com/api/?name=Manindhra+Goud&background=random",
  },
   {
    quote:
      "Thanks to Prof. Aziz Mimoudi’s mentorship, I was able to explore impactful research ideas. He brings clarity, structure, and genuine encouragement into every discussion.",
    name: "Khaoula M.",
    title: "Student, UM6P",
    image: "https://ui-avatars.com/api/?name=Khaoula+M&background=random",
  },
  {
    quote:
      "Prof. Aziz Mimoudi doesn’t just guide—he empowers. He remembers your goals, checks on your progress, and celebrates your growth. That makes all the difference.",
    name: "Hiba B.",
    title: "Student, UM6P",
    image: "https://ui-avatars.com/api/?name=Hiba+B&background=random",
  },
  {
    quote:
      "Collaborating with Prof. Aziz Mimoudi on the SustAInEr project was both inspiring and enriching. His strategic vision and academic rigor greatly enhanced the research outcomes.",
    name: "Prof. Dirk Boehe",
    title: "Professor & Researcher, Sustaineur Project",
    image: "https://ui-avatars.com/api/?name=Dirk+Boehe&background=random",
  },
  {
    quote:
      "Prof. Aziz Mimoudi is the kind of professor who values your input, encourages your learning curve, and challenges you to think bigger. A true collaborator.",
    name: "R. Eswar Naik",
    title: "AI Engineer",
    image: "https://ui-avatars.com/api/?name=Eswar+Naik&background=random",
  },
];

const InfiniteMovingCards = ({
  items,
  speed = "slow",
  direction = "right",
}: {
  items: {
    quote: string;
    name: string;
    title: string;
    image: string;
  }[];
  speed?: "slow" | "medium" | "fast";
  direction?: "left" | "right";
}) => {
  const speedMap = {
    slow: "40s",
    medium: "25s",
    fast: "15s",
  };

  const animationDuration = speedMap[speed];

  return (
    <div className="relative w-full overflow-hidden group">
      <div
        className={`flex gap-6 w-max ${
          direction === "right" ? "flex-row-reverse" : "flex-row"
        } animate-marquee group-hover:[animation-play-state:paused]`}
        style={{
          animationDuration,
        }}
      >
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="min-w-[280px] max-w-sm bg-white rounded-lg border border-gray-200 p-6 flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-300 shadow hover:shadow-lg"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <div className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-full object-cover shadow-sm"
              />
              <div>
                <p className="text-base font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">{item.title}</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed italic border-l-4 border-blue-500 pl-4">
              “{item.quote}”
            </p>
          </div>
        ))}
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }

          .animate-marquee {
            animation: marquee linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default function Skills() {
  return (
    <div
      className="min-h-screen p-6 py-20 bg-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-screen-lg mx-auto px-4 space-y-16">
        {/* Skills Section */}
        <div>
          <h3 className="text-2xl sm:text-3xl font-semibold text-center text-gray-800 mb-10">
            Skills & Expertise
          </h3>

          <div className="space-y-12">
            {skills.map((category) => (
              <div key={category.category}>
                <h3 className="text-2xl font-medium mb-4 text-blue-700">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.items.map((skill) => (
                    <div
                      key={skill.name}
                      className="bg-white border border-gray-300 rounded-lg p-5 transition-all hover:shadow-md"
                    >
                      <div className="flex justify-between mb-2 text-sm font-medium text-gray-700">
                        <span>{skill.name}</span>
                        <span className="text-blue-600">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <section id="testimonials" className="mt-20">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
            Testimonials from{" "}
            <span className="text-blue-600">Colleagues and Students</span>
          </h2>

          <div className="w-full rounded-lg relative overflow-hidden">
            <InfiniteMovingCards
              items={testimonials}
              direction="right"
              speed="slow"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
