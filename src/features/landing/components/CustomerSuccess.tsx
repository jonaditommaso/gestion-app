'use client'
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    name: "María González",
    role: "CEO, TechStartup Inc.",
    avatar: "M",
    quote: "Gestionate transformó completamente nuestro flujo de trabajo. Reducimos el tiempo de gestión administrativa en un 60%.",
    metric: { value: "60%", label: "Menos tiempo administrativo" },
    company: "TechStartup Inc.",
    industry: "Tecnología",
    rating: 5
  },
  {
    name: "Carlos Mendoza",
    role: "Director de Operaciones, LogiCorp",
    avatar: "C",
    quote: "La integración con nuestras herramientas existentes fue perfecta. Ahora tenemos visibilidad total de nuestros procesos.",
    metric: { value: "95%", label: "Mejora en visibilidad" },
    company: "LogiCorp",
    industry: "Logística",
    rating: 5
  },
  {
    name: "Ana Ruiz",
    role: "Gerente de Proyecto, CreativeStudio",
    avatar: "A",
    quote: "Nunca pensé que la gestión de proyectos podría ser tan simple. Nuestros equipos están más coordinados que nunca.",
    metric: { value: "40%", label: "Mejora en coordinación" },
    company: "CreativeStudio",
    industry: "Diseño",
    rating: 5
  }
];

const CustomerSuccess = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 10000); // Aumentado a 6 segundos para que sea más cómodo

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Resume auto-play faster after manual interaction
  useEffect(() => {
    if (!isAutoPlaying) {
      const resumeTimer = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 10000); // Reducido de 10000 a 6000ms

      return () => clearTimeout(resumeTimer);
    }
  }, [isAutoPlaying, currentTestimonial]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="w-full py-20 bg-[#171321] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Empresas que{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
              confían en nosotros
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Casos de éxito reales que demuestran el impacto de Gestionate en equipos como el tuyo.
          </p>
        </motion.div>

        {/* Main Testimonial Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="relative"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
            <Quote className="absolute top-6 left-6 h-8 w-8 text-blue-400/50" />

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="grid lg:grid-cols-3 gap-8 items-center"
                >
                  {/* Left: Quote and rating */}
                  <div className="lg:col-span-2">
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <blockquote className="text-xl lg:text-2xl text-white mb-8 leading-relaxed font-medium">
                      &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
                    </blockquote>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {testimonials[currentTestimonial].avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-lg">{testimonials[currentTestimonial].name}</div>
                          <div className="text-sm text-gray-300">{testimonials[currentTestimonial].role}</div>
                          <div className="text-xs text-gray-400">{testimonials[currentTestimonial].company} • {testimonials[currentTestimonial].industry}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metric highlight */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 text-center border border-white/10">
                      <div className="text-4xl lg:text-5xl font-bold text-blue-400 mb-2">
                        {testimonials[currentTestimonial].metric.value}
                      </div>
                      <div className="text-sm text-gray-300">
                        {testimonials[currentTestimonial].metric.label}
                      </div>
                      <div className="mt-4 text-xs text-gray-400 border-t border-white/10 pt-4">
                        Resultado medido después de 6 meses de implementación
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation controls */}
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-4">
                  <button
                    onClick={prevTestimonial}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                </div>

                {/* Dots indicator */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentTestimonial(index);
                        setIsAutoPlaying(false);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentTestimonial === index
                          ? 'bg-blue-400 w-6'
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerSuccess;
