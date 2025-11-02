import { useState, useEffect, useRef } from "react";
import { BookOpen, FlaskConical, MonitorSmartphone, Wrench } from 'lucide-react';
import { XCircle } from "lucide-react";
import { FileLock } from "lucide-react";
import silImg from '../assests/projects/universite_sherbrooke.png';
import sigcImg from '../assests/projects/teluq_universite.png';
import gsdlImg from '../assests/projects/unesco2.png';
import ruralImg from '../assests/projects/ocp_fondation_logo.png';

import volcanicImg from '../assests/projects/eramus.png';
import sustaineurImg from '../assests/projects/sustanurrr.png';
import inclusiveImg from '../assests/projects/ministere_travail.png';

import dlcImg from '../assests/projects/dlc_um6p.png';
import moocImg from '../assests/projects/edx.png';
import labImg from '../assests/projects/moroco_kingdom.png';
import researchLabImg from '../assests/projects/mooc_umm6p.png';

import ibnalbannaImg from '../assests/projects/ibN_albanna.png';
import gemsImg from '../assests/projects/GEMS.png';
const researchDevelopment = [
  {
    title: 'CETAL-CEAN – Web Design for Diverse Abilities in the Workplace',
    description: 'Website accessibility and pedagogical inclusion project funded by the Ministry of Labour of Quebec (2022–2023).',
    technologies: ['Accessibility', 'Educational Innovation', 'Canada'],
    demoUrl: 'https://www.guidepedagogique.ca/en-savoir-plus',
    image: inclusiveImg
  },
   {
    title: 'Development of an Intelligent Tutoring System',
    description: 'Smart learning environments project with Prof. Belkacem Chikhaoui (2022–2024).',
    technologies: ['Smart Learning' , 'Canada'],
    demoUrl: '',
    image: sigcImg
  },
  {
    title: 'GSDL – UNESCO Chair',
    description: 'Global Smart Disruptive Learning project, focused on AI-driven personalized education (since 2022).',
    technologies: ['UNESCO', 'AI' , 'Canada'],
    demoUrl: 'https://hal.science/hal-04223251',
    image: gsdlImg
  },
  {
    title: 'HyFlex Learning',
    description: 'Smart learning environments project with Prof. Serge Gérin-Lajoie (2022–2024).',
    technologies: ['Smart Learning' , 'Canada'],
    demoUrl: 'https://r-libre.teluq.ca/2709/',
    image: sigcImg
  },
   {
    title: 'VOLCANIC – Erasmus+',
    description: 'European research on computational thinking and inclusion in education.',
    technologies: ['Erasmus+', 'Inclusion'],
    demoUrl: 'https://volcanic.education/blog/identifying-our-target-populations-specific-needs-moroccan/',
    image: volcanicImg
  },
  {
    title: 'Sustaineur – OCP + Africa Business School',
    description: 'Platform for sustainable business education and digital transformation.',
    technologies: ['Sustainability', 'OCP'],
    demoUrl: 'https://sustaineur.co/',
    image: sustaineurImg
  }
  
];
const scientificResearch = [
 {
  title: 'PhD Thesis – Université de Sherbrooke',
  description: 'Doctoral research focused on the design and impact of AI-powered educational applications.',
  fullSummary: `This doctoral research explores the role of artificial intelligence in the development of educational tools that promote personalized learning, particularly in distance education environments.

Through a combination of design-based research and field experimentation, the study evaluates the impact of AI-powered platforms on student engagement, learning outcomes, and inclusivity.

The work also contributes to ethical guidelines for AI adoption in higher education.`,
  technologies: ['AI in Education', 'Thesis'],
  demoUrl: 'https://www.usherbrooke.ca/education/recherche/semainerecherche/videos-2021/aziz-mimoudi', // Or upload the thesis if available
  image: silImg
},
  {
    title: 'SIL – Rural Distance Learning Model',
    description: 'Designed for the OCP Foundation to support inclusive digital education in rural Morocco.',
    technologies: ['Digital Learning'],
    demoUrl: 'http://um6p.ma/en/node/423',
    image: ruralImg
  }
];
const Development = [
  {
    title: 'DLC– ISE– Ministry of Education',
    description: 'Collaboration with the Ministry of Education to develop nationwide digital labs.',
    technologies: ['Government Partnership'],
    demoUrl: '',
    image: labImg
  }
];
const SubmittedResearchProposals = [
  {
    title: 'GEMS – Gender Equity in STEM Education Workforce',
    description: 'Research proposal submitted to the joint call between Université Paris Cité and Université Mohammed VI Polytechnic.',
    fullSummary: `This research proposal addresses gender equity challenges in Morocco’s STEM education workforce. 

The project aims to investigate barriers to entry and advancement for women in STEM fields, both in academic and professional contexts. It seeks to develop data-driven policy recommendations and institutional strategies that foster inclusivity, improve gender balance, and promote equitable access to education and research opportunities.
The proposal was submitted as part of the joint research initiative between Université Paris Cité and Université Mohammed VI Polytechnic.`,
    technologies: ['Gender Equity', 'STEM', 'Education Policy'],
    demoUrl: '',
    image: gemsImg
  },
  {
    title: 'Programme National d’Appui à la R&D – IBN AL BANNA',
    description: `Submitted under the Sous-Programme « IBN AL BANNA » for the 2025–2028 Innovation initiative in Morocco.`,
   fullSummary: `This proposal is part of the national effort to strengthen applied research and innovation in Morocco through the IBN AL BANNA sub-program (2025–2028).

The project focuses on designing and deploying AI-assisted educational technologies to support inclusive and scalable learning models in Morocco’s higher education system. It emphasizes equity, technological adaptability, and measurable impact on learning outcomes.

Partenaires: Prof. Ali Bouabid, Dr. Abdelhadi Soudi, Dr. Mounir Ghogho, et moi-même (Aziz Mimoudi).`,
    technologies: ['National Innovation', 'STEM', 'Higher Education'],
    demoUrl: '', // ila kan 3and baba wa7d
    image: ibnalbannaImg,
  }
];
const digitalTools = [
  {
    title: 'Digital Learning Center (DLC) – UM6P',
    description: 'Innovative hub for online teaching and educational technology innovation.',
    technologies: ['MOOCs', 'Digital Infrastructure'],
    demoUrl: '',
    image: dlcImg
  },
  {
    title: 'MOOC Development',
    description: 'Courses developed using platforms like EdX, Canvas, and WordPress.',
    technologies: ['EdX', 'Canvas', 'WordPress'],
    demoUrl: '',
    image: moocImg
  },
  
  {
    title: 'Digital for Research Lab',
    description: 'Platform created to support educational research and training (2019–2020).',
    technologies: ['EdTech Research'],
    demoUrl: '',
    image: researchLabImg
  }
];

type Project = {
  title: string;
  description: string;
  fullSummary?: string; 
  technologies: string[];
  demoUrl?: string;
  image?: string;
};

interface ProjectGridProps {
  title: React.ReactNode;
  data: Project[];
  onCardClick?: (project: Project) => void; //  new optional prop
}




function ProjectGrid({ title, data, onCardClick }: ProjectGridProps) {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-gray-800 mb-6" data-aos="fade-up">{title}</h3>
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

        {data.map((project: Project, index: number) => (
          <div
            key={project.title + index}
            onClick={() => onCardClick?.(project)}
            className="cursor-pointer bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-2xl duration-300 flex flex-col"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
           <img
                src={project.image}
                alt={project.title}
                className="w-full h-50 object-cover"
              />

<div className="p-2 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {project.title}
              </h3>
              <p className="text-gray-600 flex-grow">{project.description}</p>
              <div className="flex flex-wrap gap-2 my-4">
                {project.technologies.map((tech: string) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
                >
                  View Project
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setSelectedProject(null);
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      setSelectedProject(null);
    }
  };

  if (selectedProject) {
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [selectedProject]);


  return (
    <div className="min-h-screen p-6 py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800" data-aos="fade-down">
          My Projects
        </h2>


<ProjectGrid
  title={
    <span className="flex items-center gap-2 text-gray-800">
      <FlaskConical className="w-6 h-6 text-blue-600" />
      Research & Development
    </span>
  }
  data={researchDevelopment}
  onCardClick={setSelectedProject}
/>
 <ProjectGrid
  title={
    <span className="flex items-center gap-2 text-gray-800">
      <BookOpen className="w-6 h-6 text-blue-600" />
      Scientific Research Projects
    </span>
  }
  data={scientificResearch}
  onCardClick={setSelectedProject}
/>
<ProjectGrid
  title={
    <span className="flex items-center gap-2 text-gray-800">
      <Wrench className="w-6 h-6 text-blue-600" />
      Development projects
    </span>
  }
  data={Development }
  onCardClick={setSelectedProject}
/>
<ProjectGrid
  title={
    <span className="flex items-center gap-2 text-gray-800">
     <FileLock className="w-6 h-6 text-red-600" />
      Submitted Research Proposals
    </span>
  }
  data={SubmittedResearchProposals}
  onCardClick={setSelectedProject}
/>

<ProjectGrid
  title={
    <span className="flex items-center gap-2 text-gray-800">
      <MonitorSmartphone className="w-6 h-6 text-blue-600" />
      Educational Platforms & Digital Tools
    </span>
  }
  data={digitalTools}
  onCardClick={setSelectedProject}
/>
{selectedProject && (
  <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 backdrop-blur-lg p-4 modal-backdrop z-50">
    <div
      ref={modalRef}
      className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg sm:max-w-xl md:max-w-2xl w-[90%] border border-gray-300 relative overflow-auto max-h-[90vh]"
    >
      <button
        className="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition"
        onClick={() => setSelectedProject(null)}
      >
        <XCircle size={28} />
      </button>

      <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">{selectedProject.title}</h2>

      <div className="bg-gray-100 p-4 rounded-lg mb-4 text-gray-700 shadow-inner">
        <p>
          <strong>📌 Description:</strong> {selectedProject.fullSummary || selectedProject.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedProject.technologies.map((tech, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
          >
            {tech}
          </span>
        ))}
      </div>

      {selectedProject.demoUrl && (
        <a
          href={selectedProject.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setSelectedProject(null)}
          className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition"
        >
          View Project
        </a>
      )}
    </div>
  </div>
)}
      </div>
    </div>
  );
}
