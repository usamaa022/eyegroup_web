'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Improved BeforeAfterSlider Component
const BeforeAfterSlider = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const sliderRef = useRef(null);

  // Define handleMouseMove first without dependencies
  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);

    setSliderPosition(percentage);
  };

  // Define handleTouchMove first without dependencies
  const handleTouchMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    const x = touch.clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);

    setSliderPosition(percentage);
  };

  // Now define the other handlers that depend on these
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    setIsDragging(true);
    handleTouchMove(e);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Use useEffect for event listeners cleanup
  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUpGlobal);
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging]);

  // Preload images for better performance
  useEffect(() => {
    const preloadImages = [beforeImage, afterImage];
    preloadImages.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [beforeImage, afterImage]);

  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative w-full h-[450px]">
        {/* Container for both images */}
        <div
          ref={containerRef}
          className="relative w-full h-full cursor-ew-resize touch-none select-none"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          {/* Before Image - Static position */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <Image
              src={beforeImage}
              alt="Before treatment"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
              quality={100}
            />
          </div>

          {/* After Image - Static position with clip */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
            }}
          >
            <Image
              src={afterImage}
              alt="After treatment"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
              quality={100}
            />
          </div>

          {/* Slider Handle with improved styling */}
          <div
            ref={sliderRef}
            className="absolute top-0 bottom-0 w-1 bg-blue-600 transform -translate-x-1/2"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white z-20">
              <div className="w-6 h-0.5 bg-blue-600"></div>
              <div className="absolute -inset-2 rounded-full border-2 border-blue-200 border-dashed"></div>
            </div>
          </div>

          {/* Divider line */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-full h-px bg-white"
              style={{
                width: `${sliderPosition}%`,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
              }}
            ></div>
          </div>
        </div>

        {/* Labels with improved styling */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-medium text-gray-800 shadow-lg">
          Before
        </div>
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-medium text-gray-800 shadow-lg">
          After
        </div>
      </div>

      {/* Product Information with enhanced styling */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Visible Results in 30 Days</h3>
        <p className="text-gray-700 mb-4">
          Our clinically proven formula transforms skin health with natural ingredients
        </p>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700">Dermatologist tested</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700">92% satisfaction rate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FadeInWhenVisible = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const productRefs = useRef({});

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setActiveSection('products');
    setTimeout(() => {
      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);

      const sections = ['home', 'products', 'about', 'science', 'contact'];
      let currentSection = 'home';

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = section;
          }
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const products = [
    {
      id: 1,
      name: 'Immune Boost Pro',
      category: 'immunity',
      description: 'Advanced formula to strengthen your immune system with natural ingredients.',
      benefits: [
        'Enhances immune response',
        'Rich in antioxidants',
        'Supports overall wellness',
        'Clinically proven to reduce sick days by 40%'
      ],
      image: '/cream9.png',
      dosage: 'Take 1 capsule daily with food',
      ingredients: [
        'Vitamin C (500mg)',
        'Vitamin D3 (2000 IU)',
        'Zinc (15mg)',
        'Elderberry Extract (300mg)',
        'Echinacea Purpurea (200mg)'
      ],
      clinicalStudies: [
        'Journal of Immunology Research (2022)',
        'Nutrients Journal Study on Elderberry (2021)',
        'Clinical Trial on Vitamin D and Immune Response (2023)'
      ],
      medicalInfo: {
        contraindications: 'Not recommended for individuals with autoimmune disorders without medical supervision',
        interactions: 'May interact with immunosuppressant medications',
        storage: 'Store at room temperature, away from direct sunlight'
      }
    },
    {
      id: 2,
      name: 'Joint Relief Max',
      category: 'joint',
      description: 'Premium joint support with glucosamine, chondroitin, and MSM for optimal mobility.',
      benefits: [
        'Reduces joint discomfort',
        'Supports cartilage health',
        'Promotes flexibility',
        'Shown to improve joint mobility by 35% in clinical trials'
      ],
      image: '/cream10.png',
      dosage: 'Take 2 capsules daily, preferably with meals',
      ingredients: [
        'Glucosamine Sulfate (1500mg)',
        'Chondroitin Sulfate (1200mg)',
        'MSM (Methylsulfonylmethane) (1000mg)',
        'Turmeric Extract (500mg)',
        'Boswellia Serrata (250mg)'
      ],
      clinicalStudies: [
        'Arthritis & Rheumatism Study (2022)',
        'Journal of Orthopaedic Research (2021)',
        'Clinical Trial on MSM for Joint Health (2023)'
      ],
      medicalInfo: {
        contraindications: 'Not suitable for individuals with shellfish allergies',
        interactions: 'May interact with blood thinners',
        storage: 'Store in a cool, dry place'
      }
    },
    {
      id: 3,
      name: 'Cardio Vital',
      category: 'heart',
      description: 'Heart health supplement with omega-3s, CoQ10, and plant sterols.',
      benefits: [
        'Supports cardiovascular function',
        'Helps maintain healthy cholesterol',
        'Rich in essential fatty acids',
        'Clinically shown to reduce LDL cholesterol by 18%'
      ],
      image: '/cream3.jpg',
      dosage: 'Take 1 softgel twice daily with meals',
      ingredients: [
        'Omega-3 Fish Oil (1000mg)',
        'Coenzyme Q10 (200mg)',
        'Plant Sterols (800mg)',
        'Garlic Extract (500mg)',
        'Hawthorn Berry (300mg)'
      ],
      clinicalStudies: [
        'American Heart Journal Study (2022)',
        'Journal of Cardiovascular Pharmacology (2021)',
        'Clinical Trial on CoQ10 and Heart Health (2023)'
      ],
      medicalInfo: {
        contraindications: 'Not recommended before surgery due to potential bleeding risk',
        interactions: 'May interact with blood pressure medications',
        storage: 'Refrigerate after opening'
      }
    },
    {
      id: 4,
      name: 'Neuro Focus',
      category: 'brain',
      description: 'Cognitive enhancement formula with nootropics and brain-boosting nutrients.',
      benefits: [
        'Enhances memory and focus',
        'Supports mental clarity',
        'Promotes brain cell health',
        'Shown to improve cognitive performance by 25% in clinical studies'
      ],
      image: '/cream4.png',
      dosage: 'Take 1 capsule in the morning',
      ingredients: [
        'Bacopa Monnieri (300mg)',
        'Lion\'s Mane Mushroom (500mg)',
        'Phosphatidylserine (100mg)',
        'Ginkgo Biloba (120mg)',
        'Rhodiola Rosea (200mg)'
      ],
      clinicalStudies: [
        'Journal of Psychopharmacology Study (2022)',
        'Neuropsychiatric Disease and Treatment Research (2021)',
        'Clinical Trial on Bacopa Monnieri (2023)'
      ],
      medicalInfo: {
        contraindications: 'Not recommended for individuals with bipolar disorder',
        interactions: 'May interact with MAO inhibitors',
        storage: 'Store at room temperature'
      }
    },
  ];

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(product => product.category === activeTab);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Head>
        <title>Test Medic Web - Usama | Premium Medical Supplements</title>
        <meta name="description" content="High-quality imported medical supplements for your health and wellness" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Enhanced Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur-sm py-4'}`}
      >
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center"
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Test Medic Web - Usama
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {['home', 'products', 'about', 'science', 'contact'].map((section) => (
              <motion.button
                key={section}
                onClick={() => scrollToSection(section)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeSection === section
                    ? 'bg-blue-100 text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </motion.button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden text-gray-800 focus:outline-none p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 12h16"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 18h16"
                  />
                </>
              )}
            </svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden bg-white shadow-lg"
            >
              <div className="flex flex-col py-4 px-4 space-y-2">
                {['home', 'products', 'about', 'science', 'contact'].map((section) => (
                  <motion.button
                    key={section}
                    onClick={() => {
                      scrollToSection(section);
                      setIsMenuOpen(false);
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-3 rounded-md text-left font-medium transition-all ${
                      activeSection === section
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Enhanced Hero Section with Improved Before/After Slider */}
      <section id="home" className="relative pt-28 pb-20 md:pt-36 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 z-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.17, 0.67, 0.12, 0.99] }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              >
                Premium <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Medical Supplements</span> for Optimal Health
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.17, 0.67, 0.12, 0.99] }}
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg"
              >
                Scientifically formulated, clinically tested supplements imported with the highest quality standards to support your health journey.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.17, 0.67, 0.12, 0.99] }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px -10px rgba(59, 130, 246, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToSection('products')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
                >
                  Explore Products
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px -10px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToSection('science')}
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-all duration-300"
                >
                  Learn the Science
                </motion.button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.17, 0.67, 0.12, 0.99] }}
                className="mt-8 flex flex-wrap gap-4"
              >
                {[
                  { icon: "✓", text: "Clinically Proven" },
                  { icon: "✓", text: "Pharmaceutical Grade" },
                  { icon: "✓", text: "GMP Certified" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center text-gray-700 bg-blue-50 px-4 py-2 rounded-full transition-all duration-200"
                  >
                    <span className="mr-2 text-blue-600">{item.icon}</span>
                    <span className="text-sm font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <div className="lg:w-1/2 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.17, 0.67, 0.12, 0.99] }}
                className="relative w-full max-w-2xl mx-auto"
              >
                <BeforeAfterSlider
                  beforeImage="/with_acne.jpg"
                  afterImage="/without_acne.jpg"
                />
              </motion.div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute -top-10 -left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl"
        ></motion.div>
      </section>

      {/* Trust Badges */}
      {/* <div className="bg-white py-6 shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {[
              { src: "/cream1.png", alt: "FDA Approved" },
              { src: "/cream2.jpg", alt: "GMP Certified" },
              { src: "/cream3.jpg", alt: "ISO Certified" },
              { src: "/quality-guaranteed.png", alt: "Quality Guaranteed" },
              { src: "/clinical-tested.png", alt: "Clinically Tested" }
            ].map((badge, index) => (
              <FadeInWhenVisible key={index} delay={index * 0.1}>
                <Image
                  src={badge.src}
                  alt={badge.alt}
                  width={120}
                  height={60}
                  className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
                />
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </div> */}

      {/* Products Section */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <FadeInWhenVisible>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Premium Supplement Range
              </h2>
            </FadeInWhenVisible>
            <FadeInWhenVisible delay={0.1}>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Carefully formulated supplements targeting specific health needs with clinically proven ingredients.
              </p>
            </FadeInWhenVisible>
          </div>

          {/* Product Filters */}
          <FadeInWhenVisible delay={0.2}>
            <div className="flex flex-wrap justify-center mb-12 gap-2">
              {[
                { id: 'all', label: 'All Products' },
                { id: 'immunity', label: 'Immunity' },
                { id: 'joint', label: 'Joint Health' },
                { id: 'heart', label: 'Heart Health' },
                { id: 'brain', label: 'Brain Health' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </FadeInWhenVisible>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <FadeInWhenVisible key={product.id} delay={index * 0.05}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative h-56 bg-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.benefits.slice(0, 2).map((benefit, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {benefit}
                        </span>
                      ))}
                      {product.benefits.length > 2 && (
                        <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                          +{product.benefits.length - 2} more
                        </span>
                      )}
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200">
                      View Details
                    </button>
                  </div>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 p-6 bg-gray-50">
                  <div className="relative h-64 md:h-full min-h-[300px]">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="md:w-1/2 p-6 overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700 transition"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Key Benefits</h3>
                    <ul className="space-y-2">
                      {selectedProduct.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">Dosage</h3>
                    <p className="text-gray-700 font-medium">{selectedProduct.dosage}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Active Ingredients</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedProduct.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex justify-between border-b border-gray-200 py-2">
                            <span className="text-gray-700">{ingredient.split('(')[0].trim()}</span>
                            <span className="text-gray-500 font-medium">{ingredient.match(/\((.*?)\)/)?.[1] || ''}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Clinical Support</h3>
                    <div className="space-y-2">
                      {selectedProduct.clinicalStudies.map((study, index) => (
                        <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-gray-700 text-sm">{study}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Medical Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-1">Contraindications</h4>
                        <p className="text-red-700 text-sm">{selectedProduct.medicalInfo.contraindications}</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-1">Interactions</h4>
                        <p className="text-yellow-700 text-sm">{selectedProduct.medicalInfo.interactions}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-1">Storage</h4>
                        <p className="text-green-700 text-sm">{selectedProduct.medicalInfo.storage}</p>
                      </div>
                    </div>
                  </div>

                  {/* <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsModalOpen(false);
                        console.log('Added to cart:', selectedProduct.name);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 2.317L11.586 22l6.586-6.586a1.414 1.414 0 00.707-2.317L17 13H7zm10 0h4.586l-4.586 8.586L17 13z" />
                      </svg>
                      Add to Prescription
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        console.log('Downloading product info:', selectedProduct.name);
                      }}
                      className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Info
                    </motion.button>
                  </div> */}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <FadeInWhenVisible>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  About Test Medic Web - Usama
                </h2>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.1}>
                <p className="text-lg text-gray-600 mb-6">
                  Founded with a mission to bring the highest quality medical supplements to the market, Test Medic Web - Usama partners with world-class manufacturers to import scientifically validated health products.
                </p>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.2}>
                <p className="text-lg text-gray-600 mb-8">
                  Our rigorous selection process ensures that every product in our portfolio meets stringent quality standards and delivers measurable health benefits.
                </p>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.3}>
                <div className="space-y-4">
                  {[
                    'Rigorous quality control at every production stage',
                    'Clinically proven ingredients at effective dosages',
                    'Transparent sourcing and manufacturing processes',
                    'Trusted by healthcare professionals worldwide'
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start"
                    >
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-4 mt-1">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-700">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </FadeInWhenVisible>
            </div>
            <div className="lg:w-1/2">
              <FadeInWhenVisible delay={0.2}>
                <div className="relative h-96 w-full bg-gray-100 rounded-xl overflow-hidden">
                  <Image
                    src="/about-lab.jpg"
                    alt="About Test Medic Web - Usama"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-semibold mb-2">Our Quality Promise</h3>
                    <p className="text-lg">Every batch tested for purity and potency</p>
                    <p className="text-sm mt-4">Certified by international health authorities</p>
                  </div>
                </div>
              </FadeInWhenVisible>
            </div>
          </div>
        </div>
      </section>

      {/* Science Section */}
      <section id="science" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <FadeInWhenVisible>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The Science Behind Our Products
              </h2>
            </FadeInWhenVisible>
            <FadeInWhenVisible delay={0.1}>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our supplements are developed based on the latest scientific research and formulated by medical experts to ensure efficacy and safety.
              </p>
            </FadeInWhenVisible>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ),
                title: "Evidence-Based Formulations",
                description: "Each ingredient is selected based on peer-reviewed clinical studies demonstrating its effectiveness for the intended health benefit."
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Quality Assurance",
                description: "Rigorous testing for purity, potency, and absence of contaminants ensures you receive exactly what's on the label."
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Optimal Bioavailability",
                description: "We use advanced delivery systems to enhance absorption and ensure your body can utilize the nutrients effectively."
              }
            ].map((item, index) => (
              <FadeInWhenVisible key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(59, 130, 246, 0.2)" }}
                  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{item.title}</h3>
                  <p className="text-gray-600 text-center">{item.description}</p>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>

          {/* <FadeInWhenVisible delay={0.3}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 md:p-12 text-white"
            >
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="lg:w-2/3">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Download Our Clinical Research Compendium</h3>
                  <p className="text-blue-100 mb-6">
                    Access our comprehensive collection of clinical studies and research papers supporting the efficacy of our supplement formulations.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => console.log('Downloading research compendium')}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center mx-auto lg:mx-0"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Now
                  </motion.button>
                </div>
                <div className="lg:w-1/3 flex justify-center">
                  <div className="relative w-48 h-48 lg:w-64 lg:h-64">
                    <Image
                      src="/research-papers.png"
                      alt="Clinical Research"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </FadeInWhenVisible> */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <FadeInWhenVisible>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience the Test Medic Web - Usama Difference?
            </h2>
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.1}>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of healthcare professionals who trust our premium supplements for their patients.
            </p>
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.2}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('products')}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Shop Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.57 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Speak to an Expert
              </motion.button>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <FadeInWhenVisible>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Get In Touch
                </h2>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.1}>
                <p className="text-lg text-gray-600 mb-8">
                  Have questions about our products or need recommendations? Our team of health experts is here to help.
                </p>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.2}>
                <div className="space-y-6">
                  {[
                    {
                      icon: (
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      ),
                      title: "Call Us",
                      content: ["+964 (770) 123-4567", "Sat-Thu, 9am-5pm"]
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ),
                      title: "Email Us",
                      content: ["info@usama.com", "Typically respond within 24 hours"]
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ),
                      title: "Visit Us",
                      content: ["Slemany ", "Orzdi St., End of street"]
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start"
                    >
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-3 mr-4">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        {item.content.map((line, i) => (
                          <p key={i} className={`text-gray-600 ${i > 0 ? 'text-sm' : ''}`}>{line}</p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FadeInWhenVisible>
            </div>

            <div className="lg:w-1/2">
              <FadeInWhenVisible delay={0.1}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-8 rounded-xl shadow-sm"
                >
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Send Us a Message</h3>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          id="first-name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          placeholder="Your first name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          id="last-name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          placeholder="Your last name"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <select
                        id="subject"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="product">Product Inquiry</option>
                        <option value="order">Order Support</option>
                        <option value="medical">Medical Questions</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        id="message"
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Your message here..."
                        required
                      ></textarea>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                    >
                      Send Message
                    </motion.button>
                  </form>
                </motion.div>
              </FadeInWhenVisible>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <FadeInWhenVisible>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6">
                  Test Medic Web - Usama
                </div>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.1}>
                <p className="text-gray-400 mb-6">
                  Premium medical supplements backed by science and trusted by healthcare professionals.
                </p>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.2}>
                <div className="flex space-x-4">
                  {[
                    { href: "#", icon: "facebook" },
                    { href: "#", icon: "twitter" },
                    { href: "#", icon: "linkedin" },
                    { href: "#", icon: "instagram" }
                  ].map((item, index) => (
                    <motion.a
                      key={index}
                      href={item.href}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        {item.icon === "facebook" && (
                          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                        )}
                        {item.icon === "twitter" && (
                          <path d="M22.46 4.02c-.78-.39-1.61-.39-2.39 0 .77.4 1.38 1.17 1.64 2.04-.84-.05-1.69-.1-2.56-.1-1.83 0-3.32 1.49-3.32 3.32 0 .38.02.75.05 1.12A10.55 10.55 0 008.54 4.27c-.68-.47-1.4-.8-2.15-1.02C4.65 3.96 3.01 5.5 3.01 7.73 0 1.54.87 2.94 2.24 3.72-.37.1-.8.14-1.27.14-.78 0-1.6-.2-2.48-.54-2.48-1.6 0 1.5-.97 2.82-2.3 3.8-3.79 3.8-1.47.84-2.78 1.85-3.84 3.02 0 0 0 1.82-.55 3.52-1.48 1.7-1.7 3.58-1.7 5.3 0 1.1.6 2.08 1.48 2.74 2.14-.92 4.78-1.53 7.54-1.53.55 0 1.05.1 1.5.28.92-.68 1.38-1.74 1.38-3.12 0-.28-.03-.55-.08-.75-.78-.8-1.7-1.25-2.75-1.25-.85 0-1.65.2-2.4.55-.55.28-1.05.4-1.5.4z" />
                        )}
                        {item.icon === "linkedin" && (
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        )}
                        {item.icon === "instagram" && (
                          <path d="M12.315 1.5a3.5 3.5 0 00-4.63 0 3.5 3.5 0 003.5 3.5 3.5 3.5 0 003.5-3.5 3.5 3.5 0 00-3.5-3.5zm7 7a7 7 0 00-7-7 7 7 0 00-7 7 7 7 0 007 7zm-7 10a7 7 0 007-7 7 7 0 00-7-7 7 7 0 00-7 7 7 7 0 007 7zm7-13.5a3.5 3.5 0 10-7 0 3.5 3.5 0 107 0z" />
                        )}
                      </svg>
                    </motion.a>
                  ))}
                </div>
              </FadeInWhenVisible>
            </div>

            <div>
              <FadeInWhenVisible>
                <h3 className="text-lg font-semibold mb-6 text-white">Products</h3>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.1}>
                <ul className="space-y-3">
                  {[
                    { name: "Immune Support", href: "#" },
                    { name: "Joint Health", href: "#" },
                    { name: "Cardiovascular", href: "#" },
                    { name: "Cognitive Health", href: "#" },
                    { name: "Digestive Wellness", href: "#" }
                  ].map((item, index) => (
                    <li key={index}>
                      <motion.a
                        href={item.href}
                        whileHover={{ x: 5 }}
                        className="text-gray-400 hover:text-white transition-all duration-200 inline-block"
                      >
                        {item.name}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </FadeInWhenVisible>
            </div>

            <div>
              <FadeInWhenVisible>
                <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.1}>
                <ul className="space-y-3">
                  {[
                    { name: "About Us", href: "#about" },
                    { name: "Our Science", href: "#science" },
                    { name: "Quality Standards", href: "#" },
                    { name: "Press", href: "#" },
                    { name: "Careers", href: "#" }
                  ].map((item, index) => (
                    <li key={index}>
                      <motion.a
                        href={item.href}
                        whileHover={{ x: 5 }}
                        className="text-gray-400 hover:text-white transition-all duration-200 inline-block"
                      >
                        {item.name}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </FadeInWhenVisible>
            </div>

            <div>
              <FadeInWhenVisible>
                <h3 className="text-lg font-semibold mb-6 text-white">Resources</h3>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.1}>
                <ul className="space-y-3">
                  {[
                    { name: "Blog", href: "#" },
                    { name: "Research", href: "#" },
                    { name: "FAQ", href: "#" },
                    { name: "Shipping & Returns", href: "#" },
                    { name: "Contact Us", href: "#contact" }
                  ].map((item, index) => (
                    <li key={index}>
                      <motion.a
                        href={item.href}
                        whileHover={{ x: 5 }}
                        className="text-gray-400 hover:text-white transition-all duration-200 inline-block"
                      >
                        {item.name}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </FadeInWhenVisible>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <FadeInWhenVisible>
                <p className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} MedicWeb. All rights reserved.
                </p>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.1}>
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    { name: "Privacy Policy", href: "#" },
                    { name: "Terms of Service", href: "#" },
                    { name: "Sitemap", href: "#" }
                  ].map((item, index) => (
                    <motion.a
                      key={index}
                      href={item.href}
                      whileHover={{ y: -2 }}
                      className="text-gray-400 hover:text-white text-sm transition-all duration-200 inline-block"
                    >
                      {item.name}
                    </motion.a>
                  ))}
                </div>
              </FadeInWhenVisible>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
