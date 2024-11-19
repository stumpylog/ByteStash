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
}

export const FullCodeView: React.FC<FullCodeViewProps> = ({
  showTitle = true,
  snippet,
  onCategoryClick,
  showLineNumbers = true,
  className = ''
}) => {
  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
    e.preventDefault();
    onCategoryClick?.(category);
  };

  return (
    <div className={className}>
      <div className="mb-4">
        {showTitle && (
          <h1 className="text-3xl font-bold mb-2">{snippet.title}</h1>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
          <div className="truncate">{getUniqueLanguages(snippet.fragments)}</div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>Updated {formatDistanceToNow(new Date(snippet.updated_at), { addSuffix: true })}</span>
          </div>
        </div>

        <p className="text-gray-300 mb-2">
          <Linkify options={linkifyOptions}>
            {snippet.description || 'No description available'}
          </Linkify>
        </p>

        <CategoryList
          categories={snippet.categories}
          onCategoryClick={handleCategoryClick}
          className="mt-2 mb-2"
          variant="clickable"
          showAll={true}
        />
      </div>

      <div className="space-y-6">
        {snippet.fragments.map((fragment, index) => (
          <div key={index} className="bg-gray-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4">
              <div className="flex items-center gap-2">
                <FileCode size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-200">{fragment.file_name}</span>
              </div>
              <span className="text-sm text-gray-400">{getLanguageLabel(fragment.language)}</span>
            </div>
            <div className="p-4">
              <FullCodeBlock
                code={fragment.code} 
                language={fragment.language} 
                showLineNumbers={showLineNumbers}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};