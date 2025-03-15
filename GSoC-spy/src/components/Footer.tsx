import React from "react";
import { Github, Heart, Linkedin, Twitter } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-8 mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <Logo size="sm" />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8 text-sm">
            <a
              href="https://www.linkedin.com/in/jigyasu-rajput-218657284/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 hover:scale-105"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>

            <a
              href="https://x.com/Jigyasu_rajput"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 hover:scale-105"
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </a>

            <a
              href="https://github.com/JigyasuRajput"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 hover:scale-105"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} GSoC Spy. Not affiliated with Google or
            GitHub.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            Built with
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            using React & Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}
