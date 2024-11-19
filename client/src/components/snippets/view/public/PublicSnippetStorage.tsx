import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Loader2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../../../hooks/useSettings';
import { Snippet } from '../../../../types/snippets';
import { getLanguageLabel, initializeMonaco } from '../../../../utils/language/languageUtils';
import { SearchAndFilter } from '../../../search/SearchAndFilter';
import SnippetList from '../../list/SnippetList';
import SettingsModal from '../../../settings/SettingsModal';
import SnippetModal from '../SnippetModal';
import { PageContainer } from '../../../common/layout/PageContainer';
import { fetchPublicSnippets } from '../../../../utils/api/snippets';

const PublicSnippetStorage: React.FC = () => {
  const { 
    viewMode, setViewMode, compactView, showCodePreview, 
    previewLines, includeCodeInSearch, updateSettings,
    showCategories, expandCategories, showLineNumbers
  } = useSettings();

  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alpha-asc' | 'alpha-desc'>('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    initializeMonaco();
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    try {
      const fetchedSnippets = await fetchPublicSnippets();
      setSnippets(fetchedSnippets);
    } catch (error) {
      console.error('Failed to load public snippets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  }, []);

  const languages = useMemo(() => {
    const langSet = new Set<string>();
    snippets.forEach(snippet => {
      snippet.fragments.forEach(fragment => {
        langSet.add(getLanguageLabel(fragment.language));
      });
    });
    return Array.from(langSet).sort();
  }, [snippets]);

  const allCategories = useMemo(() => 
    [...new Set(snippets.flatMap(snippet => snippet.categories))].sort(),
    [snippets]
  );

  const filteredSnippets = useMemo(() => {
    return snippets.filter(snippet => {
      const basicMatch = (
        snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
      const fragmentMatch = snippet.fragments.some(fragment => 
        fragment.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getLanguageLabel(fragment.language).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (includeCodeInSearch && fragment.code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
      const languageMatch = selectedLanguage === '' || 
        snippet.fragments.some(fragment => 
          getLanguageLabel(fragment.language).toLowerCase() === selectedLanguage.toLowerCase()
        );
  
      const categoryMatch = selectedCategories.length === 0 || 
        selectedCategories.every(cat => snippet.categories.includes(cat));
  
      return (basicMatch || fragmentMatch) && languageMatch && categoryMatch;
    }).sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'oldest':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [snippets, searchTerm, selectedLanguage, includeCodeInSearch, sortOrder, selectedCategories]);

  const openSnippet = useCallback((snippet: Snippet) => setSelectedSnippet(snippet), []);
  const closeSnippet = useCallback(() => setSelectedSnippet(null), []);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center">
          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">ByteStash</h1>
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="text-gray-400">Loading snippets...</span>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-4xl font-bold text-gray-100">ByteStash</h1>
        <Link
          to="/login"
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors text-sm"
        >
          <User size={16} />
          <span>Sign in</span>
        </Link>
      </div>
      
      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={handleSearchTermChange}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        languages={languages}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        viewMode={viewMode}
        setViewMode={setViewMode}
        openSettingsModal={() => setIsSettingsModalOpen(true)}
        openNewSnippetModal={() => {}}
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        onCategoryClick={handleCategoryClick}
        hideNewSnippet
      />
      
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <span className="text-sm text-gray-400">Filtered by categories:</span>
          {selectedCategories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(category)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 text-sm"
            >
              <span>{category}</span>
              <span className="text-gray-400 hover:text-white">×</span>
            </button>
          ))}
        </div>
      )}
      
      <SnippetList
        snippets={filteredSnippets}
        viewMode={viewMode}
        onOpen={openSnippet}
        onDelete={() => {}}
        onEdit={() => {}}
        onCategoryClick={handleCategoryClick}
        onShare={() => {}}
        compactView={compactView}
        showCodePreview={showCodePreview}
        previewLines={previewLines}
        showCategories={showCategories}
        expandCategories={expandCategories}
        showLineNumbers={showLineNumbers}
        isPublicView={true}
      />

      <SnippetModal
        snippet={selectedSnippet} 
        isOpen={!!selectedSnippet} 
        onClose={closeSnippet}
        onCategoryClick={handleCategoryClick}
        showLineNumbers={showLineNumbers}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={{ 
          compactView, 
          showCodePreview, 
          previewLines, 
          includeCodeInSearch, 
          showCategories, 
          expandCategories, 
          showLineNumbers 
        }}
        onSettingsChange={updateSettings}
        snippets={[]}
        addSnippet={() => Promise.resolve({} as Snippet)}
        reloadSnippets={() => {}}
        isPublicView={true}
      />
    </div>
  );
};

export default PublicSnippetStorage;