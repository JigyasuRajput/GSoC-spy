import React from "react";
import { Github, LineChart } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div
      className="flex items-center gap-2 group cursor-pointer"
      onClick={handleLogoClick}
    >
      <div className="relative">
        <div className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-full absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Github
          className={`${sizeClasses[size]} text-gray-800 dark:text-gray-200 transition-all duration-300 group-hover:rotate-3 group-hover:text-blue-700 dark:group-hover:text-blue-400`}
        />
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
          <LineChart
            className={`${
              size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"
            } text-blue-500 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-600`}
          />
        </div>
      </div>
      {showText && (
        <span
          className={`font-bold ${textSizeClasses[size]} bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 transition-colors duration-300 group-hover:from-blue-600 group-hover:to-blue-400 dark:group-hover:from-blue-400 dark:group-hover:to-blue-300`}
        >
          GSoC Spy
        </span>
      )}
    </div>
  );
}

export default Logo;
