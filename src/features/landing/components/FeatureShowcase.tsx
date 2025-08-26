'use client'
import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import Image from 'next/image';
import { ChevronRight, ChevronDown, Users, Shield, BarChart3, Cloud } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { features } from '../features';

const FeatureShowcase = () => {
  const [activeFeature, setActiveFeature] = useState<number>(0); // Siempre hay una activa
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-50px' });

  const t = useTranslations('landing.products')

  const toggleCategory = (featureIndex: number, categoryName: string) => {
    const key = `${featureIndex}-${categoryName}`;
    // Si es la misma categoría, la cierra. Si es diferente, la abre
    setExpandedCategory(expandedCategory === key ? null : key);
  };

  const handleFeatureClick = (index: number) => {
    // Si es la misma feature, no hacer nada (siempre debe haber una activa)
    if (activeFeature === index) {
      return;
    }
    // Cambiar feature y cerrar acordeones
    setActiveFeature(index);
    setExpandedCategory(null);
  };

  return (
    <div className="w-full py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-[#171321] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-blue-400"></div>
            <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">{t('main-features-title')}</span>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-blue-400"></div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('main-features-description-1')}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
              {t('main-features-description-2')}
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('main-features-description-3')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-start h-[80vh]">
          {/* Features Navigation - Smaller */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5 space-y-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                className={`relative rounded-xl transition-all duration-300 ${
                  activeFeature === index
                    ? 'bg-white/10 ring-1 ring-white/20'
                    : 'bg-white/5 hover:bg-white/8'
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${feature.gradient} opacity-${activeFeature === index ? '100' : '0'} transition-opacity duration-300`} />

                {/* Feature Header - Clickable */}
                <div
                  className="relative p-4 cursor-pointer"
                  onClick={() => handleFeatureClick(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-white/20 ring-1 ring-white/30'
                        : 'bg-white/10'
                    }`}>
                      <feature.icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base font-semibold transition-colors duration-300 ${
                        activeFeature === index ? 'text-white' : 'text-gray-300'
                      }`}>
                        {t(feature.title)}
                      </h3>
                      <p className={`mt-1 text-sm transition-colors duration-300 ${
                        activeFeature === index ? 'text-gray-200' : 'text-gray-400'
                      }`}>
                        {t(feature.description)}
                      </p>
                    </div>

                    <div className={`transition-transform duration-300 ${
                      activeFeature === index ? 'rotate-90' : ''
                    }`}>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Expandable Categories - Only visible when active */}
                {activeFeature === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative border-t border-white/10"
                  >
                    <div className="p-4 pt-3 space-y-2 min-h-[240px]">
                      {feature.categories.map((category, categoryIndex) => {
                        const categoryKey = `${index}-${category.name}`;
                        const isExpanded = expandedCategory === categoryKey;

                        return (
                          <div key={categoryIndex} className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(index, category.name);
                              }}
                              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
                            >
                              <span className="text-xs font-medium text-gray-200">
                                {t(category.name)}
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-400" />
                              )}
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="border-t border-white/10 bg-white/5"
                                >
                                  <div className="p-3 space-y-1.5">
                                    {category.items.map((item, itemIndex) => (
                                      <motion.div
                                        key={itemIndex}
                                        className="flex items-start gap-2"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: itemIndex * 0.05 }}
                                      >
                                        <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                        <span className="text-xs text-gray-300 leading-relaxed">
                                          {t(item)}
                                        </span>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Image Display - Larger */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl" />

              <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 ring-1 ring-white/20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative overflow-hidden rounded-lg"
                  >
                    <Image
                      width={800}
                      height={550}
                      alt={features[activeFeature].title}
                      src={features[activeFeature].image}
                      className="w-full h-auto object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom stats - POSITIONED TO AVOID OVERLAP */}
        <div className="mt-36">
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-3 mx-auto">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-sm text-gray-400">Equipos activos</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/20 rounded-xl mb-3 mx-auto">
                    <Cloud className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">50TB</div>
                  <div className="text-sm text-gray-400">Datos almacenados</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl mb-3 mx-auto">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">500M</div>
                  <div className="text-sm text-gray-400">Reportes generados</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-xl mb-3 mx-auto">
                    <Shield className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">99.99%</div>
                  <div className="text-sm text-gray-400">Uptime garantizado</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
