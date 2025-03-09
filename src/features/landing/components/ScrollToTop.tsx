'use client'
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn('fixed bottom-5 right-5 p-3 rounded-full bg-[#21212133] hover:bg-[#21212177] text-white shadow-md transition-all duration-300 z-20', isVisible ? "opacity-100" : "opacity-0 pointer-events-none")}
      aria-label="Volver arriba"
    >
      <ArrowUp size={18} />
    </button>
  );
};

export default ScrollToTop;
