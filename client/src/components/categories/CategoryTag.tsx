import React from 'react';

export type CategoryTagVariant = 'removable' | 'clickable';

interface CategoryTagProps {
  category: string;
  onClick: (e: React.MouseEvent, category: string) => void;
  variant: CategoryTagVariant;
  className?: string;
}

const CategoryTag: React.FC<CategoryTagProps> = ({
  category,
  onClick,
  variant,
  className = ""
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e, category);
  };

  if (variant === 'removable') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-1 px-2 py-1 rounded-md bg-gray-700 text-sm hover:bg-gray-600 
          transition-colors group ${className}`}
        type="button"
      >
        <span className='text-gray-300'>{category}</span>
        <span className="text-gray-400 group-hover:text-white">×</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 
        ${getCategoryColor(category)} ${className}`}
      type="button"
    >
      {category}
    </button>
  );
};

const getCategoryColor = (name: string) => {
  const colorSchemes = [
    {
      bg: 'bg-blue-500/30',
      text: 'text-blue-100',
      hover: 'hover:bg-blue-500/40'
    },
    {
      bg: 'bg-emerald-500/30',
      text: 'text-emerald-100',
      hover: 'hover:bg-emerald-500/40'
    },
    {
      bg: 'bg-purple-500/30',
      text: 'text-purple-100',
      hover: 'hover:bg-purple-500/40'
    },
    {
      bg: 'bg-amber-500/30',
      text: 'text-amber-100',
      hover: 'hover:bg-amber-500/40'
    },
    {
      bg: 'bg-rose-500/30',
      text: 'text-rose-100',
      hover: 'hover:bg-rose-500/40'
    },
    {
      bg: 'bg-cyan-500/30',
      text: 'text-cyan-100',
      hover: 'hover:bg-cyan-500/40'
    },
    {
      bg: 'bg-indigo-500/30',
      text: 'text-indigo-100',
      hover: 'hover:bg-indigo-500/40'
    },
    {
      bg: 'bg-teal-500/30',
      text: 'text-teal-100',
      hover: 'hover:bg-teal-500/40'
    }
  ];
  
  const hash = name.split('').reduce((acc, char, i) => {
    return char.charCodeAt(0) + ((acc << 5) - acc) + i;
  }, 0);
  
  const scheme = colorSchemes[Math.abs(hash) % colorSchemes.length];
  return `${scheme.bg} ${scheme.text} ${scheme.hover}`;
};

export default CategoryTag;