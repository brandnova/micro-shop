import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FeaturedCollections = ({ heroProducts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === heroProducts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? heroProducts.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="mb-16 bg-gradient-to-r from-pink-100 to-white rounded-lg overflow-hidden">
      <h2 className="text-3xl font-serif text-pink-600 mb-8 p-6">Featured Collection</h2>
      <div className="relative">
        <div className="flex items-center">
          <button
            onClick={prevSlide}
            className="absolute left-4 z-10 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all duration-300"
            aria-label="Previous product"
          >
            <ChevronLeft className="text-pink-600" />
          </button>
          <div className="w-full flex justify-center">
            <div className="w-full max-w-3xl flex items-center">
              <div className="w-1/2 pr-4">
                <img 
                  src={heroProducts[currentIndex].image} 
                  alt={heroProducts[currentIndex].name} 
                  className="w-full h-80 object-cover rounded-lg shadow-lg"
                />
              </div>
              <div className="w-1/2 pl-4">
                <h3 className="text-2xl font-semibold mb-2">{heroProducts[currentIndex].name}</h3>
                <p className="text-gray-600 mb-2">{heroProducts[currentIndex].category}</p>
                <p className="text-gray-500 mb-4">{heroProducts[currentIndex].description}</p>
                <p className="text-pink-600 font-bold text-xl mb-4">${heroProducts[currentIndex].price}</p>
                <button className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors duration-300">
                  View Details
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={nextSlide}
            className="absolute right-4 z-10 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all duration-300"
            aria-label="Next product"
          >
            <ChevronRight className="text-pink-600" />
          </button>
        </div>
        <div className="flex justify-center mt-4">
          {heroProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full mx-1 ${
                index === currentIndex ? 'bg-pink-600' : 'bg-pink-300'
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