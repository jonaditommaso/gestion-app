'use client'

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { Check, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { features } from '../features';

const FeatureShowcase = () => {
  const [activeFeature, setActiveFeature] = useState<number>(0);
  const [isSectionInView, setIsSectionInView] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [hasKeyboardFocusWithinSection, setHasKeyboardFocusWithinSection] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const t = useTranslations('landing.products');
  const isProgressPaused =
    prefersReducedMotion ||
    !isSectionInView ||
    !isDocumentVisible ||
    hasKeyboardFocusWithinSection;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsSectionInView(entry.isIntersecting);
    });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateDocumentVisibility = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };

    updateDocumentVisibility();
    document.addEventListener('visibilitychange', updateDocumentVisibility);
    return () => document.removeEventListener('visibilitychange', updateDocumentVisibility);
  }, []);

  const renderFeatureImages = (isDesktop: boolean) => (
    <>
      {features.map((feature, index) => {
        const isVisible = activeFeature === index;
        const isPriorityImage = index === 0;

        return (
          <div
            key={feature.id}
            className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
              isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={!isVisible}
          >
            <Image
              fill
              src={feature.image}
              alt={t(feature.title)}
              sizes={isDesktop ? '(min-width: 1024px) 60vw, 100vw' : '100vw'}
              priority={isPriorityImage}
              loading={isPriorityImage ? undefined : 'lazy'}
              className={`object-cover ${feature.id === 'chatbot' ? 'object-right-top' : 'object-left-top'}`}
            />
          </div>
        );
      })}
    </>
  );

  return (
    <section
      ref={sectionRef}
      onFocusCapture={(event) => {
        if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) {
          setHasKeyboardFocusWithinSection(true);
        }
      }}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setHasKeyboardFocusWithinSection(false);
        }
      }}
      data-progress-paused={isProgressPaused}
      className="feature-showcase group relative w-full bg-gradient-to-b from-slate-900 via-slate-800 to-[#171321] py-24 pb-48"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" aria-hidden="true" />
      <div className="absolute left-0 top-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-0 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-16 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-blue-400" />
            <span className="text-sm font-medium uppercase tracking-wider text-blue-400">
              {t('main-features-title')}
            </span>
            <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-blue-400" />
          </div>
          <h2 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
            {t('main-features-description-1')}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
              {t('main-features-description-2')}
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-300">
            {t('main-features-description-3')}
          </p>
        </motion.div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="space-y-3"
          >
            {features.map((feature, index) => {
              const isActive = activeFeature === index;
              const contentId = `feature-details-${feature.id}`;

              return (
                <motion.article
                  key={feature.id}
                  className={`feature-item relative rounded-xl border transition-colors duration-200 ${
                    isActive
                      ? 'border-white/10 bg-white/5 opacity-100'
                      : 'border-transparent bg-transparent opacity-70 hover:bg-white/5 hover:opacity-100'
                  }`}
                >
                  <button
                    type="button"
                    id={`feature-trigger-${feature.id}`}
                    aria-expanded={isActive}
                    aria-controls={contentId}
                    onClick={() => setActiveFeature(index)}
                    className="relative w-full cursor-pointer p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset"
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={`rounded-lg p-2 transition-all duration-300 ${
                          isActive ? 'bg-white/20 ring-1 ring-white/30' : 'bg-white/10'
                        }`}
                      >
                        <feature.icon className="h-6 w-6" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-base font-semibold transition-colors duration-300 ${
                            isActive ? 'text-white' : 'text-zinc-400'
                          }`}
                        >
                          {t(feature.title)}
                        </span>
                        <span
                          className={`mt-1 block text-sm transition-colors duration-300 ${
                            isActive ? 'text-gray-200' : 'line-clamp-2 text-zinc-400'
                          }`}
                        >
                          {t(feature.description)}
                        </span>
                      </span>

                      <ChevronRight
                        className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-300 ${
                          isActive ? 'rotate-90' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                  </button>

                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={`feature-trigger-${feature.id}`}
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                    aria-hidden={!isActive}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="relative border-t border-white/10 p-4 pt-3">
                        {isActive && (
                          <div className="relative isolate mb-5 lg:hidden">
                            <div
                              className="featured-glow pointer-events-none absolute -inset-1 -z-10 rounded-3xl opacity-40 blur-2xl"
                              aria-hidden="true"
                            />
                            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                              {renderFeatureImages(false)}
                            </div>
                          </div>
                        )}

                        <ul className="space-y-4">
                          {feature.categories.map((category) => (
                            <li key={category.name}>
                              <div className="flex items-start gap-2">
                                <Check
                                  className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300"
                                  aria-hidden="true"
                                />
                                <span className="text-sm font-medium leading-5 text-gray-100">
                                  {t(category.name)}
                                </span>
                              </div>
                              <ul className="ml-6 mt-2 space-y-1.5">
                                {category.items.map((item) => (
                                  <li
                                    key={item}
                                    className="text-xs leading-relaxed text-gray-400"
                                  >
                                    {t(item)}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {isActive && !prefersReducedMotion && (
                    <div
                      key={activeFeature}
                      className="feature-progress absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400"
                      onAnimationEnd={(event) => {
                        if (event.target === event.currentTarget) {
                          setActiveFeature((currentFeature) => (currentFeature + 1) % features.length);
                        }
                      }}
                      aria-hidden="true"
                    />
                  )}
                </motion.article>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="sticky top-24 hidden self-start lg:block"
          >
            <div className="relative isolate">
              <div
                className="featured-glow pointer-events-none absolute -inset-1 -z-10 rounded-3xl opacity-40 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                {renderFeatureImages(true)}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
