import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../../../hooks/useSettings';
import { initializeMonaco } from '../../../../utils/language/languageUtils';
import SettingsModal from '../../../settings/SettingsModal';
import BaseSnippetStorage from '../common/BaseSnippetStorage';
import { fetchPublicSnippets } from '../../../../utils/api/snippets';
import { Snippet } from '../../../../types/snippets';

const PublicSnippetStorage: React.FC = () => {
  const { 
    viewMode, setViewMode, compactView, showCodePreview, 
    previewLines, includeCodeInSearch, updateSettings,
    showCategories, expandCategories, showLineNumbers
  } = useSettings();

  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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

  const signInButton = (
    <Link
      to="/login"
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors text-sm"
    >
      <User size={16} />
      <span>Sign in</span>
    </Link>
  );

  return (
    <>
      <BaseSnippetStorage
        snippets={snippets}
        isLoading={isLoading}
        viewMode={viewMode}
        setViewMode={setViewMode}
        compactView={compactView}
        showCodePreview={showCodePreview}
        previewLines={previewLines}
        includeCodeInSearch={includeCodeInSearch}
        showCategories={showCategories}
        expandCategories={expandCategories}
        showLineNumbers={showLineNumbers}
        onSettingsOpen={() => setIsSettingsModalOpen(true)}
        onNewSnippet={() => null}
        headerRight={signInButton}
        isPublicView={true}
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
    </>
  );
};

export default PublicSnippetStorage;