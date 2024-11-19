import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { getLanguageLabel, getMonacoLanguage } from '../../utils/language/languageUtils';
import CopyButton from '../common/buttons/CopyButton';

export interface FullCodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export const FullCodeBlock: React.FC<FullCodeBlockProps> = ({ 
  code, 
  language = 'plaintext',
  showLineNumbers = true
}) => {
  const isMarkdown = getLanguageLabel(language) === 'markdown';
  const [highlighterHeight, setHighlighterHeight] = useState<string>("100px");
  const containerRef = useRef<HTMLDivElement>(null);
  const LINE_HEIGHT = 19;

  useEffect(() => {
    updateHighlighterHeight();
    const resizeObserver = new ResizeObserver(updateHighlighterHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [code]);

  const updateHighlighterHeight = () => {
    if (!containerRef.current) return;
    
    const lineCount = code.split('\n').length;
    const contentHeight = (lineCount * LINE_HEIGHT) + 35;
    const newHeight = Math.min(500, Math.max(100, contentHeight));
    setHighlighterHeight(`${newHeight}px`);
  };

  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      margin: 0,
      fontSize: '13px',
      background: '#1E1E1E',
      padding: '1rem',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      fontSize: '13px',
      background: '#1E1E1E',
      display: 'block',
      textIndent: 0,
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        {isMarkdown ? (
          <div className="markdown-content bg-gray-800 rounded-lg">
            <ReactMarkdown className="markdown prose prose-invert max-w-none">
              {code}
            </ReactMarkdown>
          </div>
        ) : (
          <div 
            ref={containerRef}
            style={{ maxHeight: '500px' }}
          >
            <SyntaxHighlighter
              language={getMonacoLanguage(language)}
              style={customStyle}
              showLineNumbers={showLineNumbers}
              wrapLines={true}
              lineProps={{
                style: { 
                  whiteSpace: 'pre',
                  wordBreak: 'break-all',
                  paddingLeft: 0
                }
              }}
              customStyle={{
                height: highlighterHeight,
                minHeight: '100px',
                marginBottom: 0,
                marginTop: 0,
                textIndent: 0,
                paddingLeft: showLineNumbers ? 10 : 20,
                borderRadius: '0.5rem'
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )}

        <CopyButton text={code} />
      </div>
    </div>
  );
};