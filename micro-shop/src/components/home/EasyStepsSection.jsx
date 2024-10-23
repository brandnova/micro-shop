import React from 'react';

const EasyStepsSection = ({ mainColor, lightenedShade, lighterShade }) => (
  <section className="mb-16 rounded-lg p-8" style={{ backgroundColor: lightenedShade }}>
    <h2 className="text-2xl font-serif mb-4" style={{ color: mainColor }}>Easy Steps to Your Perfect Purchase</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <StepItem
        number={1}
        title="Browse Our Collection"
        description="Explore our curated selection of elegant pieces designed just for you."
        mainColor={mainColor}
        lighterShade={lighterShade}
      />
      <StepItem
        number={2}
        title="Add to Cart"
        description="Select your favorite items and add them to your shopping cart with a single click."
        mainColor={mainColor}
        lighterShade={lighterShade}
      />
      <StepItem
        number={3}
        title="Secure Checkout"
        description="Complete your purchase safely and easily through our secure checkout process."
        mainColor={mainColor}
        lighterShade={lighterShade}
      />
    </div>
  </section>
);

const StepItem = ({ number, title, description, mainColor, lighterShade }) => (
  <div className="text-center">
    <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: lighterShade }}>
      <span className="text-2xl font-bold" style={{ color: mainColor }}>{number}</span>
    </div>
    <h3 className="font-semibold mb-2" style={{ color: mainColor }}>{title}</h3>
    <p>{description}</p>
  </div>
);

export default EasyStepsSection;