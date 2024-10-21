// src/components/EasyStepsSection.jsx
import React from 'react';

const EasyStepsSection = () => (
  <section className="mb-16 bg-pink-100 rounded-lg p-8">
    <h2 className="text-2xl font-serif text-pink-600 mb-4">Easy Steps to Your Perfect Purchase</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <StepItem
        number={1}
        title="Browse Our Collection"
        description="Explore our curated selection of elegant pieces designed just for you."
      />
      <StepItem
        number={2}
        title="Add to Cart"
        description="Select your favorite items and add them to your shopping cart with a single click."
      />
      <StepItem
        number={3}
        title="Secure Checkout"
        description="Complete your purchase safely and easily through our secure checkout process."
      />
    </div>
  </section>
);

const StepItem = ({ number, title, description }) => (
  <div className="text-center">
    <div className="bg-pink-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl font-bold text-pink-600">{number}</span>
    </div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <p>{description}</p>
  </div>
);

export default EasyStepsSection;