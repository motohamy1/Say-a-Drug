import React from 'react';

interface CategoryCardProps {
  title: string;
  imgSrc: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, imgSrc }) => {
  return (
    <div className="flex flex-col items-center text-center 
                    transform transition-transform duration-300 
                    hover:scale-105 cursor-pointer">
      <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-2 border-border flex items-center justify-center bg-card">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="mt-3 text-foreground text-base font-medium text-center max-w-24">{title}</p>
    </div>
  );
};

export default CategoryCard;