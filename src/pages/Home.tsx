import { ArrowRight, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import iiitImage from '/src/assests/pic3.png';
import p1 from '/src/assests/pic2.jpg';
import p2 from '/src/assests/pic1.jpg';
import p3 from '/src/assests/pic4.jpg';
import p4 from '/src/assests/pic5.jpg';
import p5 from '/src/assests/pic 6.jpg';
import p6 from '/src/assests/pic 7.jpg';
import resumePDF from '/src/assests/Aziz_Mimoudi_CV.pdf';

// Load Poppins Font
const loadPoppins = () => {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

export default function Home() {
  useEffect(() => {
    loadPoppins();
  }, []);

  // Image Slider State
  const images = [iiitImage,  p2, p1, p3, p6, p4, p5];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Auto-Slide Timer (10 Seconds)
  const startAutoSlide = () => {
    if (intervalId) clearInterval(intervalId);
    const newInterval = window.setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        setIsFading(false);
      }, 400);
    }, 10000);
    setIntervalId(newInterval);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Manual Navigation
  const nextImage = () => {
    if (intervalId) clearInterval(intervalId);
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsFading(false);
      startAutoSlide();
    }, 400);
  };

  const prevImage = () => {
    if (intervalId) clearInterval(intervalId);
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      setIsFading(false);
      startAutoSlide();
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Section - Text Content */}
        <div className="flex-1" data-aos="fade-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight text-gray-800">
            Hi, I'm <span className="text-blue-600">Aziz Mimoudi</span>

          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Researcher in Artificial Intelligence in Education
          </p>

          {/* Buttons Container */}
          <div className="flex gap-4">
            {/* View My Work Button */}
            <Link
              to="/projects"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-lg font-medium rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              View My Work
              <ArrowRight size={20} className="ml-2" />
            </Link>

            {/* Download Resume Button (Now Green) */}
            <a
              href={resumePDF}
              download="Aziz_Mimoudi_CV.pdf"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white text-lg font-medium rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Download Resume
              <Download size={20} className="ml-2" />
            </a>
          </div>
        </div>
        
        {/* Right Section - Image Slider Card */}
        <div className="relative flex-1" data-aos="fade-left">
          <div className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-lg p-6 relative w-full max-w-md border border-gray-300 hover:shadow-2xl transition-all">
            {/* Image Display with Fade Effect */}
            <div className="relative">
              <img
                src={images[currentIndex]}
                className={`w-full h-80 object-cover rounded-lg shadow-md transition-opacity duration-500 ${
                  isFading ? 'opacity-0' : 'opacity-100'
                }`}
                alt="Slider Image"
              />
            </div>

            {/* Navigation Buttons - Positioned Below the Image */}
            <div className="flex justify-center gap-4 mt-4">
              {/* Left Arrow */}
              <button
                onClick={prevImage}
                className="bg-gradient-to-r from-blue-200 to-blue-400 text-gray-800 p-3 rounded-full shadow-md hover:scale-110 transition-all border border-gray-300"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Right Arrow */}
              <button
                onClick={nextImage}
                className="bg-gradient-to-r from-blue-200 to-blue-400 text-gray-800 p-3 rounded-full shadow-md hover:scale-110 transition-all border border-gray-300"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
