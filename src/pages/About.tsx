import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { GraduationCap, BookOpen, Search, Globe, BadgeCheck, Trophy, MapPin } from "lucide-react"; 
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import azizImg from "../assests/pic1.jpg";


// Import images for education
import sherbrookeImg from "../assests/sherbrooke.png";
import jeanMonnetImg from "../assests/UJM.png";
import cadiAyyadImg from "../assests/Cadi Ayyad.png";


// Work experience images
import um6pImg from '../assests/um6pp.png';
import teluqImg from '../assests/Université TÉLUQ.png';
import quebecImg from '../assests/Quebec gov.png';
import cssdpImg from '../assests/cssdp1.png';
import aefeImg from '../assests/AEFE logo.png';
import marocEduImg from '../assests/Moroccan Ministry of Education.png';

export default function About() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const education = [
    {
      title: "Ph.D. in Education",
      school: "Université de Sherbrooke, Canada",
      year: "2020 – Present",
      img: sherbrookeImg, // Upload & import this logo
    },
    {
      title: "Master's in Training Engineering in Plurilingualism and Interculturality",
      school: "Université Jean Monnet, Saint-Étienne, France",
      year: "2017",
      img: jeanMonnetImg,
    },
    {
      title: "Bachelor",
      school: "Université Cadi Ayyad, Marrakech, Morocco",
      year: "2005",
      img: cadiAyyadImg,
    }
  ];
  const experiences = [
    {
      title: "Lecturer in AI & Educational Technologies",
      company: "UM6P – Institute of Education Sciences",
      year: "May 2024 – Present",
      img: um6pImg,
    },
    {
      title: "Instructor – Executive Master’s Program",
      company: "UM6P – Educational Technologies and AI in Moroccan Schools",
      year: "May – July 2023",
      img: um6pImg,
    },
    {
      title: "Co-Researcher – GSDL Project (UNESCO)",
      company: "Université TÉLUQ, Canada",
      year: "Oct 2022 – 2024",
      img: teluqImg,
    },
    {
      title: "Co-Researcher – CETAL-CEAN Project",
      company: "Quebec Ministry of Labour",
      year: "Dec 2022 – June 2023",
      img: quebecImg,
    },
    {
      title: "Substitute Teacher",
      company: "Centre de services scolaires des Patriotes, Quebec",
      year: "Dec 2022 – June 2023",
      img: cssdpImg,
    },
    {
      title: "Language Teacher",
      company: "Campus Victor Hugo (AEFE), Marrakech",
      year: "2016 – 2019",
      img: aefeImg,
    },
    {
      title: "Permanent Teacher (French & Arabic)",
      company: "Ministry of Education, Morocco",
      year: "1999 – 2019",
      img: marocEduImg,
    }
  ];
  
  return (
    <div className="min-h-screen p-6 py-20 bg-gray-50">
      <div className="max-w-screen-lg mx-auto px-4">
          {/* About Me Section */}
          <h2 className="text-4xl font-bold mb-8 text-center text-gray-800" data-aos="fade-down">
          About Me
          </h2>
          <div 
            className="bg-white rounded-xl shadow-md p-8 flex flex-col md:flex-row items-center md:items-center gap-6 transition-all hover:shadow-lg transform hover:scale-105 duration-300"
            data-aos="fade-up"
          >
            {/* Profile Image */}
            <img 
              src={azizImg} 
              alt="Aziz Mimoudi" 
              className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-gray-300 shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-300 self-center md:self-start mt-4 md:mt-0"
            />

            {/* Text Content */}
            <div className="text-left flex-1">
  <p className="text-lg text-gray-700 leading-relaxed">
    Aziz Mimoudi is a <strong>lecturer and coordinator of the Digital and AI Research Axis</strong> at the Institute of Education Sciences, 
    Mohammed VI Polytechnic University (<strong>UM6P</strong>) in Morocco. He recently submitted his <strong>PhD thesis in Education </strong> 
     at the <strong>University of Sherbrooke</strong>, where his research focused on the <strong>design and impact of AI-powered educational applications</strong>. 
    At UM6P, he teaches predoctoral students and guides them in applying AI to research, especially in <strong>Education, Agriculture, and Healthcare</strong>.
  </p>
  <p className="text-lg text-gray-700 mt-4 leading-relaxed">
    Mimoudi is actively engaged in several <strong>research and development initiatives</strong> at UM6P. He collaborates as Co-researcher with the 
     <strong> Africa Business School</strong> on an AI-assisted platform for designing <strong>sustainable business models</strong>, and co-leads 
    the <strong>"VOLCANIC-ERASMUS+"</strong> project, which aims to develop educational programs that integrate <strong>educational technologies, 
    computational thinking,</strong> and <strong>inclusion in higher education</strong>.
  </p>
</div>
          </div>



        {/* Education - Vertical Timeline */}
        <h3 className="text-3xl font-bold text-gray-800 text-center mt-16 mb-6" data-aos="fade-up">
          Education
        </h3>
        <VerticalTimeline>
          {education.map((edu, index) => (
            <VerticalTimelineElement
              key={index}
              date={edu.year}
              contentStyle={{ background: "#f8f9fa", color: "#333", borderRadius: "10px", transition: "all 0.3s"  }}
              contentArrowStyle={{ borderRight: "7px solid #e0e0e0" }}
              iconStyle={{ background: "white", boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)" }}
              icon={
                <img
                  src={edu.img}
                  alt={edu.school}
                  className="w-full h-full rounded-full hover:scale-110 transition-transform duration-300"
                />}
            >
              <h3 className="text-xl font-bold">{edu.title}</h3>
              <p className="text-gray-600">{edu.school}</p>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>

        {/* Experience - Vertical Timeline */}
        <h3 className="text-3xl font-bold text-gray-800 text-center mt-16 mb-6" data-aos="fade-up">
          Work Experience
        </h3>
        <VerticalTimeline>
          {experiences.map((exp, index) => (
            <VerticalTimelineElement
              key={index}
              date={exp.year}
              contentStyle={{ background: "#f8f9fa", color: "#333", borderRadius: "10px", transition: "all 0.3s" }}
              contentArrowStyle={{ borderRight: "7px solid #e0e0e0" }}
              iconStyle={{ background: "white", boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)" }}
              icon={
                <img
                  src={exp.img}
                  alt={exp.company}
                  className="w-full h-full rounded-full hover:scale-110 transition-transform duration-300"
                />}
            >
              <h3 className="text-xl font-bold">{exp.title}</h3>
              <p className="text-gray-600">{exp.company}</p>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10" data-aos="fade-up">
          {/* Author Identifiers Section */}
          <div className="bg-white rounded-xl shadow-md p-4 transition-all hover:shadow-lg hover:scale-105 duration-300 w-full">

            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" /> Author Identifiers
            </h3>

            <ul className="space-y-3">
              {[
               { label: "Google Scholar", link: "https://scholar.google.com/citations?user=-9rVxq0AAAAJ&hl=fr", icon: <BookOpen /> },
                { label: "ORCID", link: "https://orcid.org/0000-0003-2219-9586", icon: <GraduationCap /> },
                { label: "LinkedIn", link: "https://www.linkedin.com/in/aziz-mimoudi-328442115/", icon: <Globe /> }
              ].map(({ label, link, icon }, index) => (
                <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="block">
                  <button 
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-100 hover:bg-blue-100 transition-all duration-300 shadow-sm hover:shadow-md w-full"
                  >
                    <span className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full group-hover:scale-110 transition-transform duration-300">
                      {icon}
                    </span>
                    <span className="text-gray-700 font-semibold hover:text-blue-700 transition-all text-lg">
                      {label}
                    </span>
                  </button>
                </a>
              ))}
            </ul>
          </div>

          {/* Research Experience Section */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg hover:scale-105 duration-300 w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <Search className="w-6 h-6 text-green-600" /> Research Experience
            </h3>

            <ul className="list-disc pl-5 space-y-3 text-gray-700">
  <li>Co-researcher on the <strong>VOLCANIC (EU ERASMUS+)</strong> project, developing AI and computational thinking curricula for inclusive education.</li>
  <li>Lead researcher in the <strong>GSDL Project (UNESCO Chair, Université TÉLUQ)</strong> on AI-driven personalized learning in higher education.</li>
  <li>Participated in the <strong>SIGC Project</strong> under Professor Chikhaoui Belkacem, focused on AI and smart educational environments.</li>
  <li>Research Assistant in the <strong>Comodal Teaching in Francophone Canada</strong> project with Professor Serge Gérin-Lajoie, Université TÉLUQ.</li>
  <li>Co-investigator in the <strong>Sustainable Business Model Platform (Sustaineur)</strong> project funded by OCP Foundation & Africa Business School.</li>
  <li>Ongoing doctoral research on <strong>AI’s impact on distance learning platforms</strong> at Université de Sherbrooke, Canada.</li>
</ul>

          </div>
        </div>



        {/* Certifications, Extra Curricular Activities, and Address */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10" data-aos="fade-up">
            {[
              {
                title: "Certifications",
                icon: <BadgeCheck className="w-6 h-6 text-blue-600" />,
                items: [
                  "Virtual & Augmented Reality (EON-XR Platform), EON Reality",
                  "MOOC: CERTICE Scol – AUF/AFD",
                  "Open Dialogues on Ethics & AI in Canada (AIcan)",
                  "Eye Tracking for Research, Tobii Pro",
                  "Microprogram on Remote Teaching, TELUQ",
                  "Technopedagogy Training, Stanford GSE"
                ]
              },

              {
                title: "Extra Curricular Activities",
                icon: <Trophy className="w-6 h-6 text-yellow-600" />,
                items: [
                  <ol key="list" className="list-decimal pl-5 space-y-2">
                    <li><strong>Taekwondo Coach</strong>, 2nd Dan black belt, and former <strong>national referee</strong>.</li>
                    <li><strong>Lead organizer</strong> of the ISE Symposium during <strong>UM6P Science Week 2025</strong>.</li>
                    <li><strong>Youth Mentor</strong> as Provincial President (2010–2014) of a civic youth organization.</li>
                    <li><strong>Observer</strong> for the National Human Rights Council during Morocco’s 2011 elections.</li>
                    <li><strong>Organizer</strong> of educational trips and workshops (ICT, technopedagogy, outdoor education).</li>
                  </ol>
                ]
                
              },
            
              {
                title: "Address",
                icon: <MapPin className="w-6 h-6 text-red-600" />,
                items: [
                 "Institute of Education Sciences, Mohammed VI Polytechnic University (UM6P), Ben Guerir, Morocco",
                  <iframe
                    key="map"
                    src="https://www.google.com/maps?q=Mohammed+VI+Polytechnic+University,+Ben+Guerir,+Morocco&output=embed"
                    width="100%"
                    height="250"
                    className="rounded-lg mt-4 border"
                    style={{ border: "0", borderRadius: "10px", marginTop: "10px" }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ]
              }
            
            ].map((section, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg hover:scale-105 duration-300"
              >
                {/* Section Title with Icon */}
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                  {section.icon} {section.title}
                </h3>
          
                {/* Section Content */}
                <ul className="space-y-3 text-gray-600">
                  {section.items.map((item, i) => <li key={i} className="transition-all hover:text-blue-600">{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}
