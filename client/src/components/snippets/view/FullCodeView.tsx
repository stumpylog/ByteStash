import React from 'react';
import { FileCode, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Snippet } from '../../../types/snippets';
import CategoryList from '../../categories/CategoryList';
import { getLanguageLabel, getUniqueLanguages } from '../../../utils/language/languageUtils';
import { FullCodeBlock } from '../../editor/FullCodeBlock';
import Linkify from 'linkify-react';
import { linkifyOptions } from '../../../constants/linkify';

interface FullCodeViewProps {
  showTitle?: boolean;
  snippet: Snippet;
  onCategoryClick?: (category: string) => void;
  showLineNumbers?: boolean;
  className?: string;
  isModal?: boolean;
}

export const FullCodeView: React.FC<FullCodeViewProps> = ({
  showTitle = true,
  snippet,
  onCategoryClick,
  showLineNumbers = true,
  className = '',
  isModal = false
}) => {
  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
    e.preventDefault();
    onCategoryClick?.(category);
  };

  const getRelativeUpdateTime = (updatedAt: string): string => {
    try {
      const updateDate = new Date(updatedAt);
      return formatDistanceToNow(updateDate);
    } catch (error) {
      console.error('Error formatting update date:', error);
      return 'Unknown';
    }
  };

  const containerClasses = isModal
    ? `overflow-hidden ${className}`
    : `bg-gray-800 rounded-lg overflow-hidden ${className}`;

  return (
    <div className={containerClasses}>
      {/* Status Bar with Update Time */}
      {!isModal && snippet.updated_at && (
        <div className="bg-gray-900/50 px-3 py-1.5 text-xs flex items-center justify-end">
          <div className="flex items-center gap-1 text-gray-500">
            <Clock size={12} />
            <span>{getRelativeUpdateTime(snippet.updated_at)} ago</span>
          </div>
        </div>
      )}

      <div className={isModal ? 'p-2 pt-0' : 'p-4 pt-0'}>
        {/* Header Section */}
        <div>
          {showTitle && (
            <h1 className={`text-xl md:text-2xl font-bold text-gray-200 ${isModal ? '' : 'mt-2'}`}>
              {snippet.title}
            </h1>
          )}

          {/* Language Info */}
          <div className={`flex items-center gap-1 text-sm text-gray-400 mt-${showTitle ? '2' : '0'}`}>
            <FileCode size={14} className="text-gray-500" />
            <span>{getUniqueLanguages(snippet.fragments)}</span>
          </div>

          {/* Description */}
          <div className="text-sm text-gray-300 mt-3">
            <Linkify options={linkifyOptions}>
              {snippet.description || 'No description available'}
            </Linkify>
          </div>

          {/* Categories */}
          <div className="mt-3">
            <CategoryList
              categories={snippet.categories}
              onCategoryClick={handleCategoryClick}
              variant="clickable"
              showAll={true}
            />
          </div>
        </div>

        {/* Code Fragments */}
        <div className="mt-4 space-y-4">
          {snippet.fragments.map((fragment, index) => (
            <div key={index}>
              {/* File Header */}
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1 bg-gray-900/50 rounded px-3 h-7">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <FileCode size={12} className="text-gray-500 shrink-0" />
                  <span className="truncate">{fragment.file_name}</span>
                </div>
                <span className="text-gray-500 ml-2">{getLanguageLabel(fragment.language)}</span>
              </div>

              {/* Code Block */}
              <FullCodeBlock
                code={fragment.code}
                language={fragment.language}
                showLineNumbers={showLineNumbers}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullCodeView;