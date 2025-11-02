import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Home, User, Bolt, Briefcase, Mail, Linkedin, Book, Calendar, Instagram } from 'lucide-react';
import ProfilePic from '/src/assests/profile.png';
import  UM6PLogo from '/src/assests/logo_um6p.png';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/about', icon: User, label: 'About' },
  { path: '/skills', icon: Bolt, label: 'Expertise' },
  { path: '/projects', icon: Briefcase, label: 'Projects' },
  { path: '/courses', icon: Book, label: 'Courses' },
  { path: '/timetable', icon: Calendar, label: 'Timetable' }, 
  { path: '/contact', icon: Mail, label: 'Contact' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-8 z-50 p-2 bg-white rounded-lg shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95 md:hidden"
      >
        {isOpen ? <X size={28} className="text-gray-800" /> : <Menu size={28} className="text-gray-800" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/80 backdrop-blur-lg border-r border-gray-300 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full overflow-y-auto max-h-screen">
          
          {/* Profile Section */}
          <div className="p-4 text-center border-b bg-gradient-to-r from-blue-100 to-blue-300">
            <div className="w-20 h-20 mx-auto">
              <img
                src={ProfilePic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-md transition-transform duration-300 hover:scale-110"
              />
            </div>
              <h2 className="text-lg font-semibold mt-3 text-gray-900 hover:text-blue-600 transition-all">
              Aziz Mimoudi
              </h2>
              <p className="text-gray-700 text-sm mb-0 leading-tight"> Researcher and Coordinator 
                AI and Educational Technologies</p>

            {/* College Icon Below Name */}
            <div className="flex justify-center items-center -mt-8 -mb-12">
            <img
              src={ UM6PLogo}
              alt="UM6P Logo"
              className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
            />
            </div>

          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 mt-4 space-y-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-800 hover:bg-blue-100 hover:pl-6 hover:shadow-lg'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} className="mr-3" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Social Links */}
          <div className="p-4 border-t flex justify-center space-x-5">
            <a
              href="https://www.instagram.com/aziz.mimoudi?igsh=bmp0aXo0dHNqNDJq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 transition-transform duration-300 hover:scale-125 hover:text-gray-900"
            >
              <Instagram size={22} />
            </a>
            <a
              href="https://www.linkedin.com/in/aziz-mimoudi-328442115/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 transition-transform duration-300 hover:scale-125 hover:text-gray-900"
            >
              <Linkedin size={22} />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
