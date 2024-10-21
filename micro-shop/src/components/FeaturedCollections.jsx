import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeaturedCollections = ({ heroProducts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => 
      prevIndex === heroProducts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? heroProducts.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
    <section className="mb-16 bg-gradient-to-r from-pink-100 to-white rounded-lg overflow-hidden shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-4xl font-serif text-pink-600 mb-8 text-center">Featured Collection</h2>
        <div className="relative h-[500px] md:h-[600px]">
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
              className="absolute w-full h-full flex flex-col md:flex-row items-center justify-center"
            >
              <div className="w-full md:w-1/2 mb-6 md:mb-0 md:pr-8">
                <img 
                  src={heroProducts[currentIndex].image} 
                  alt={heroProducts[currentIndex].name} 
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="w-full md:w-1/2 md:pl-8 px-20 text-center md:text-left">
                <h3 className="text-3xl font-semibold mb-4">{heroProducts[currentIndex].name}</h3>
                <p className="text-pink-500 font-medium mb-3">{heroProducts[currentIndex].category}</p>
                <p className="text-gray-600 mb-6">{heroProducts[currentIndex].description}</p>
                <div className="flex justify-around items-center mb-6">
                  <p className="text-pink-600 font-bold text-2xl">₦{heroProducts[currentIndex].price}</p>
                  <p className="text-gray-600">Quantity: {heroProducts[currentIndex].quantity}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-75 rounded-full p-3 hover:bg-opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Previous product"
          >
            <ChevronLeft className="text-pink-600 w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-75 rounded-full p-3 hover:bg-opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Next product"
          >
            <ChevronRight className="text-pink-600 w-6 h-6" />
          </button>
        </div>
        <div className="flex justify-center mt-6">
          {heroProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 w-3 rounded-full mx-2 transition-all duration-300 ${
                index === currentIndex ? 'bg-pink-600 scale-125' : 'bg-pink-300 hover:bg-pink-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;