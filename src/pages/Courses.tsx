import { useState, useEffect, useRef } from "react";
import { BookOpen, XCircle, ExternalLink, LayoutGrid, List, Search, ArrowUpAZ, ArrowDownAZ } from "lucide-react";

type Course = {
  name: string;
  programme: string;
  semester: string;
  credits: string;
  content: { title: string; points: string[] }[];
  driveLink: string;
  marksLink?: string; // Optional property for marks link
};

// Hardcoded courses
const hardcodedCourses: Course[] = [
  {
    name: "EDU 704 – Digitalization and AI in Education",
    programme: "Ph.D. in Education (UM6P – Institute of Education Sciences)",
    semester: "Spring 2024",
    credits: "04",
    content: [
      {
        title: "Course Overview:",
        points: [
          "Exploration of the impact of artificial intelligence on education and learning processes.",
          "Critical analysis of digital transformation in higher education and training systems.",
          "Ethical, social, and pedagogical implications of AI integration in education.",
        ],
      },
      {
        title: "Key Topics:",
        points: [
          "AI literacy and algorithmic thinking.",
          "Learning analytics and data-driven pedagogy.",
          "Emerging technologies and educational policy.",
        ],
      },
    ],
    driveLink: "https://drive.google.com/your-drive-link-edu704",
  },
  {
    name: "CAES-PD008 – AI in Research",
    programme: "Professional Development – UM6P",
    semester: "Winter 2024",
    credits: "02",
    content: [
      {
        title: "Course Overview:",
        points: [
          "Introduction to AI-assisted research methodologies and data analysis.",
          "Exploration of digital tools for literature mining and academic writing.",
          "Practical use of generative AI tools for data collection and synthesis.",
        ],
      },
      {
        title: "Key Topics:",
        points: [
          "Research automation using AI.",
          "Ethics and integrity in AI-supported research.",
          "Open Science and reproducibility principles.",
        ],
      },
    ],
    driveLink: "https://drive.google.com/your-drive-link-caes-pd008",
  },
  {
    name: "Executive Master – Educational Technologies & AI",
    programme: "Executive Master Program – UM6P",
    semester: "Fall 2024",
    credits: "03",
    content: [
      {
        title: "Course Overview:",
        points: [
          "Introduces key concepts of educational technologies and artificial intelligence.",
          "Focuses on instructional design, digital tools, and AI-based personalization in learning.",
          "Highlights innovation and leadership in digital education.",
        ],
      },
      {
        title: "Key Topics:",
        points: [
          "Instructional design and digital learning ecosystems.",
          "Intelligent Tutoring Systems (ITS) and adaptive learning.",
          "Ethical dimensions of AI in education and data-driven decision-making.",
        ],
      },
    ],
    driveLink: "https://drive.google.com/your-drive-link-executive-master",
  },
  {
    name: "Educational Technologies & Artificial Intelligence",
    programme: "Bachelor in Education – UM6P",
    semester: "Spring 2024",
    credits: "04",
    content: [
      {
        title: "Course Overview:",
        points: [
          "Explores the design and integration of educational technologies supported by AI.",
          "Focuses on digital pedagogy, learning platforms, and innovation in teaching.",
          "Prepares students to design AI-enhanced learning environments.",
        ],
      },
      {
        title: "Key Topics:",
        points: [
          "Human–AI collaboration in education.",
          "Learning management systems and intelligent agents.",
          "Design frameworks for educational technologies.",
        ],
      },
    ],
    driveLink: "https://drive.google.com/your-drive-link-educational-ai",
  },
  {
    name: "Learning Analytics & Educational Data",
    programme: "Graduate – UM6P",
    semester: "Spring 2025",
    credits: "03",
    content: [
      {
        title: "Course Overview:",
        points: [
          "Introduces methods and tools for analyzing learning data.",
          "Focuses on dashboards, indicators, and ethical data use in education.",
          "Students design a mini analytics project using real-world data.",
        ],
      },
      {
        title: "Key Topics:",
        points: [
          "Learning analytics fundamentals and dashboards.",
          "Assessment analytics and feedback loops.",
          "Privacy, fairness, and ethical data handling.",
        ],
      },
    ],
    driveLink: "https://drive.google.com/your-drive-link-learning-analytics",
  },

  {
    name: "Computational Thinking, Inclusion, and AI (VOLCANIC)",
    programme: "Teacher Training Program (Erasmus+ VOLCANIC)",
    semester: "Fall 2024",
    credits: "03",
    content: [
      {
        title: "Course Overview:",
        points: [
          "Promotes computational thinking for inclusive, AI-supported teaching.",
          "Builds digital competence among teachers in rural and underserved areas.",
          "Bridges unplugged and digital activities to foster algorithmic thinking.",
        ],
      },
      {
        title: "Key Topics:",
        points: [
          "CT principles: decomposition, abstraction, and algorithm design.",
          "Inclusive pedagogy and accessibility in digital education.",
          "AI tools for lesson planning and formative assessment.",
        ],
      },
    ],
    driveLink: "https://drive.google.com/your-drive-link-volcanic",
  },
  {
  name: "Master Class: Integrating AI into Teaching in Southern Morocco",
  programme: "Laayoun • Smara • Boujdour • Tarfaya",
  semester: "Winter 2025",
  credits: "",
  content: [],
  driveLink: "",
  marksLink: "",
},
];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>(() => {
    // Load courses from localStorage and merge with hardcoded courses
    const storedCourses = localStorage.getItem("courses");
    return storedCourses ? [...hardcodedCourses, ...JSON.parse(storedCourses)] : hardcodedCourses;
  });

  const [selectedSemester, setSelectedSemester] = useState<string>("All");
  const [isGridView, setIsGridView] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState<boolean>(false);
  const [newCourse, setNewCourse] = useState<Course>({
    name: "",
    programme: "",
    semester: "",
    credits: "",
    content: [],
    driveLink: "",
    marksLink: "",
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAscending, setIsAscending] = useState<boolean>(true);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
        setIsAddCourseModalOpen(false);
      }
    };
    if (isModalOpen || isAddCourseModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isModalOpen, isAddCourseModalOpen]);

  // Save new courses to localStorage whenever the courses state changes
  useEffect(() => {
    const nonHardcodedCourses = courses.filter(
      (course) => !hardcodedCourses.some((hardcoded) => hardcoded.name === course.name)
    );
    localStorage.setItem("courses", JSON.stringify(nonHardcodedCourses));
  }, [courses]);

  const handleAddCourse = () => {
    setCourses([...courses, newCourse]); // Add the new course to the state
    setIsAddCourseModalOpen(false);
    setNewCourse({ name: "", programme: "", semester: "", credits: "", content: [], driveLink: "", marksLink: "" });
  };
  const handleDeleteCourse = (courseName: string) => {
    // Filter out the course to be deleted
    const updatedCourses = courses.filter((course) => course.name !== courseName);
    setCourses(updatedCourses);
  
    // Update localStorage with non-hardcoded courses
    const nonHardcodedCourses = updatedCourses.filter(
      (course) => !hardcodedCourses.some((hardcoded) => hardcoded.name === course.name)
    );
    localStorage.setItem("courses", JSON.stringify(nonHardcodedCourses));
  };
  const filteredCourses = courses
    .filter((course) => selectedSemester === "All" || course.semester === selectedSemester)
    .filter((course) => course.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (isAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
    {filteredCourses.map((course, index) => (
      <div
        key={index}
        className={`bg-white shadow-md rounded-lg cursor-pointer transition-all transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r from-blue-100 to-blue-300 hover:text-gray-900 
          ${isGridView ? "w-full sm:w-[250px] md:w-[300px] p-5 flex flex-col items-center" : "w-[90%] max-w-[950px] p-6 flex items-center justify-between"}`}
      >
        {/* Course Name */}
        <h2 className={`text-lg font-semibold ${isGridView ? "text-center" : "text-left text-xl"}`}>
          {course.name}
        </h2>
    
        {/* Delete Button */}
        <button
          onClick={() => handleDeleteCourse(course.name)}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all"
        >
          Delete
        </button>
      </div>
    ))}

  return (
    <div className="container mx-auto px-6 py-10 min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Header, Filter, and Layout Toggle */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-gray-900 tracking-wide">Courses</h1>

          {/* Styled Sorting Button */}
          <button
            onClick={() => setIsAscending(!isAscending)}
            className="p-2 bg-white shadow-md rounded-full border border-gray-300 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105"
          >
            {isAscending ? (
              <ArrowUpAZ size={22} className="text-gray-600 hover:text-white transition-all" />
            ) : (
              <ArrowDownAZ size={22} className="text-gray-600 hover:text-white transition-all" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className="relative flex items-center w-full sm:w-auto">
            <Search size={20} className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search courses..."
              className="p-3 pl-10 w-full border border-gray-300 rounded-lg bg-white shadow-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Layout Toggle */}
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="p-2 bg-white shadow-md rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              {isGridView ? <List size={20} /> : <LayoutGrid size={20} />}
            </button>

            {/* Semester Filter */}
            <select
              className="p-3 border border-gray-300 rounded-lg bg-white shadow-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="All">All Semesters</option>
              <option value="First">Semester 1</option>
              <option value="Sixth">Semester 6</option>
            </select>

            {/* Add Course Button */}
            {/* <button
              onClick={() => setIsAddCourseModalOpen(true)}
              className="p-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Add Course
            </button> */}
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 backdrop-blur-lg p-4 z-50 modal-backdrop">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg sm:max-w-xl md:max-w-2xl w-[90%] border border-gray-300 relative overflow-auto max-h-[90vh]"
          >
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition"
              onClick={() => setIsAddCourseModalOpen(false)}
            >
              <XCircle size={28} />
            </button>

            <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Add New Course</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCourse();
              }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Course Name"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Programme"
                value={newCourse.programme}
                onChange={(e) => setNewCourse({ ...newCourse, programme: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Semester"
                value={newCourse.semester}
                onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Credits"
                value={newCourse.credits}
                onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="url"
                placeholder="Drive Link"
                value={newCourse.driveLink}
                onChange={(e) => setNewCourse({ ...newCourse, driveLink: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="url"
                placeholder="Marks GDrive Link"
                value={newCourse.marksLink || ""}
                onChange={(e) => setNewCourse({ ...newCourse, marksLink: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />

              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-3 rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                Add Course
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Course Layout (Grid / List) */}
      <div className={`flex flex-wrap justify-center gap-6 ${isGridView ? "md:justify-start" : "flex-col"}`}>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <div
              key={index}
              className={`bg-white shadow-md rounded-lg cursor-pointer transition-all transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r from-blue-100 to-blue-300 hover:text-gray-900 
                ${isGridView ? "w-full sm:w-[250px] md:w-[300px] p-5 flex flex-col items-center" : "w-[90%] max-w-[950px] p-6 flex items-center justify-between"}`}
              onClick={() => {
                setSelectedCourse(course);
                setIsModalOpen(true);
              }}
            >
              {/* Show Icon Only in Grid Mode */}
              {isGridView && <BookOpen size={50} className="mb-3 transition-transform duration-300 hover:rotate-12" />}

              {/* Course Name */}
              <h2 className={`text-lg font-semibold ${isGridView ? "text-center" : "text-left text-xl"}`}>
                {course.name}
              </h2>

              {/* Show Semester in List View Only */}
              {!isGridView && (
                <span className="text-gray-600 font-medium text-sm bg-gray-200 px-3 py-1 rounded-md">
                  {course.semester} Sem
                </span>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-700 col-span-full">No courses available for this semester.</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 backdrop-blur-lg p-4 modal-backdrop">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg sm:max-w-xl md:max-w-2xl w-[90%] border border-gray-300 relative overflow-auto max-h-[90vh]"
          >
            {/* Close Button (Inside the Card) */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition"
              onClick={() => setIsModalOpen(false)}
            >
              <XCircle size={28} />
            </button>

            <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">{selectedCourse.name}</h2>

            <div className="bg-gray-100 p-4 rounded-lg mb-4 text-gray-700 shadow-inner">
              <p>
                <strong>📖 Programme:</strong> {selectedCourse.programme}
              </p>
              <p>
                <strong>📆 Semester:</strong> {selectedCourse.semester}
              </p>
              <p>
                <strong>🎓 Credits:</strong> {selectedCourse.credits}
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-72 overflow-y-auto p-2">
              <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-800">Content:</h3>
              {selectedCourse.content.map((section, index) => (
                <div key={index} className="mb-4">
                  <strong className="block text-gray-900">{section.title}</strong>
                  <ul className="list-disc pl-5 text-gray-600 text-sm">
                    {section.points.map((point, i) => (
                      <li key={i} className="hover:text-blue-500">{point}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Buttons - Open Drive & Marks */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                {/* Open Drive Button */}
                <a
                  href={selectedCourse.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all w-full sm:w-auto"
                >
                  <ExternalLink size={16} />
                  Open Drive
                </a>

                {/* Marks Button - Google Sheets */}
                <a
                  href={selectedCourse.marksLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all w-full sm:w-auto"
                >
                  <ExternalLink size={16} />
                  Marks
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}