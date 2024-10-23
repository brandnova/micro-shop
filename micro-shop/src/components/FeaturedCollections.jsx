import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeaturedCollections = ({ heroProducts, mainColor, lightenedShade, lighterShade }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState([]);

  useEffect(() => {
    // Ensure we only display a maximum of 3 products in the carousel
    setVisibleProducts(heroProducts.slice(0, 3));
  }, [heroProducts]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === visibleProducts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? visibleProducts.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section className="mb-16 rounded-lg overflow-hidden shadow-xl bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-serif mb-8 text-center" style={{ color: mainColor }}>
          Featured Collection
        </h2>
        {visibleProducts.length > 0 ? (
          <div className="relative h-[500px] sm:h-[700px] md:h-[800px]">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute w-full h-full p-6 sm:px-10 rounded-xl flex flex-col md:flex-row items-center justify-center"
                style={{ backgroundColor: lighterShade }}
              >
                <div className="w-full md:w-1/2 mb-6 md:mb-0 md:pr-8">
                  <img
                    src={visibleProducts[currentIndex].image}
                    alt={visibleProducts[currentIndex].name}
                    className="w-full h-64 sm:h-96 md:h-full object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="w-full md:w-1/2 md:px-8 px-4 sm:px-8 text-center md:text-left">
                  <h3 className="text-3xl font-semibold mb-4" style={{ color: mainColor }}>
                    {visibleProducts[currentIndex].name}
                  </h3>
                  <p className="font-medium mb-3" style={{ color: mainColor }}>
                    {visibleProducts[currentIndex].category}
                  </p>
                  <p className="text-gray-600 mb-6">{visibleProducts[currentIndex].description}</p>
                  <div className="flex justify-between items-center mb-6">
                    <p className="font-bold text-2xl" style={{ color: mainColor }}>
                      ₦{visibleProducts[currentIndex].price}
                    </p>
                    <p className="text-gray-600">Quantity: {visibleProducts[currentIndex].quantity}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-75 rounded-full p-3 hover:bg-opacity-100 transition-all duration-300 focus:outline-none focus:ring-2"
              style={{ color: mainColor, borderColor: mainColor }}
              aria-label="Previous product"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-75 rounded-full p-3 hover:bg-opacity-100 transition-all duration-300 focus:outline-none focus:ring-2"
              style={{ color: mainColor, borderColor: mainColor }}
              aria-label="Next product"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="h-[500px] sm:h-[600px] md:h-[700px] flex items-center justify-center">
            <p>No products available in the featured collection.</p>
          </div>
        )}
        {visibleProducts.length > 0 && (
          <div className="flex justify-center mt-6 space-x-2">
            {visibleProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'scale-125' : 'hover:opacity-75'
                }`}
                style={{ backgroundColor: index === currentIndex ? mainColor : lighterShade }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCollections;