import React, { useState, useEffect } from 'react';
import { Share as ShareIcon, Trash2, Link as LinkIcon, Check, ShieldCheck, ShieldOff } from 'lucide-react';
import parseDuration from 'parse-duration';
import { formatDistanceToNow } from 'date-fns';
import { Share, ShareSettings } from '../../../types/snippets';
import { useToast } from '../../../hooks/useToast';
import { createShare, deleteShare, getSharesBySnippetId } from '../../../utils/api/share';
import { basePath } from '../../../utils/api/basePath';
import Modal from '../../common/modals/Modal';
import { Switch } from '../../common/switch/Switch';

interface ShareMenuProps {
  snippetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareMenu: React.FC<ShareMenuProps> = ({ snippetId, isOpen, onClose }) => {
  const [shares, setShares] = useState<Share[]>([]);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [expiresIn, setExpiresIn] = useState<string>('');
  const [durationError, setDurationError] = useState<string>('');
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const { addToast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      loadShares();
      setCopiedStates({});
    }
  }, [isOpen, snippetId]);

  const loadShares = async () => {
    try {
      const loadedShares = await getSharesBySnippetId(snippetId);
      setShares(loadedShares);
    } catch (error) {
      addToast('Failed to load shares', 'error');
    }
  };

  const handleCreateShare = async () => {
    if (expiresIn) {
      const seconds = parseDuration(expiresIn, 's');
      if (!seconds) {
        setDurationError('Invalid duration format. Use 1h, 2d, 30m etc.');
        return;
      }
      setDurationError('');
    }

    try {
      const settings: ShareSettings = {
        requiresAuth,
        expiresIn: expiresIn ? Math.floor(parseDuration(expiresIn, 's')!) : undefined
      };
      
      await createShare(snippetId, settings);
      await loadShares();
      addToast('Share link created', 'success');
      
      setRequiresAuth(false);
      setExpiresIn('');
    } catch (error) {
      addToast('Failed to create share link', 'error');
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    try {
      await deleteShare(shareId);
      setShares(shares.filter(share => share.id !== shareId));
      addToast('Share link deleted', 'success');
    } catch (error) {
      addToast('Failed to delete share link', 'error');
    }
  };

  const copyShareLink = async (shareId: string) => {
    const url = `${window.location.origin}${basePath}/s/${shareId}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } finally {
          textArea.remove();
        }
      }

      setCopiedStates(prev => ({ ...prev, [shareId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [shareId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getRelativeExpiryTime = (expiresAt: string): string => {
    try {
      const expiryDate = new Date(expiresAt);
      return `Expires in ${formatDistanceToNow(expiryDate)}`;
    } catch (error) {
      console.error('Error formatting expiry date:', error);
      return 'Unknown expiry time';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <ShareIcon size={20} />
          <h2 className="text-xl font-bold">Share Snippet</h2>
        </div>
      }
    >
      <div className="space-y-6 text-gray-100">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Create New Share Link</h3>
          
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <Switch 
                id="useAuth"
                checked={requiresAuth}
                onChange={setRequiresAuth}/>
              <span>Require authentication</span>
            </label>

            <div>
              <label className="block text-sm mb-1">Expires in (e.g. 1h, 2d, 30m)</label>
              <input
                type="text"
                value={expiresIn}
                onChange={e => {
                  setExpiresIn(e.target.value);
                  setDurationError('');
                }}
                placeholder="Never"
                className="w-full px-3 py-2 bg-gray-700 rounded-md"
              />
              {durationError && (
                <p className="text-red-400 text-sm mt-1">{durationError}</p>
              )}
            </div>

            <button
              onClick={handleCreateShare}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Create Share Link
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Active Share Links</h3>
          
          {shares.length === 0 ? (
            <p className="text-gray-400">No active share links</p>
          ) : (
            <div className="space-y-2">
              {shares.map(share => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate">/{share.id}</span>
                      {share.requires_auth === 1 && (
                        <span className="text-emerald-400" title="Protected - Authentication required">
                          <ShieldCheck size={15} className="stroke-[2.5]" />
                        </span>
                      )}
                      {share.requires_auth === 0 && (
                        <span className="text-gray-500/70" title="Public access">
                          <ShieldOff size={15} className="stroke-[2.5]" />
                        </span>
                      )}
                      <div className="flex items-center">
                        {share.expired === 1 && (
                          <span className="px-2 py-0.5 bg-red-900/50 text-red-200 border border-red-700/50 rounded text-xs">
                            Expired
                          </span>
                        )}
                        {share.expires_at && share.expired === 0 && (
                          <span className="px-2 py-0.5 bg-blue-900/50 text-blue-200 border border-blue-700/50 rounded text-xs">
                            {getRelativeExpiryTime(share.expires_at)}
                          </span>
                        )}
                        {share.expires_at === null && (
                          <span className="px-2 py-0.5 bg-blue-900/50 text-blue-200 border border-blue-700/50 rounded text-xs">
                            Never Expires
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyShareLink(share.id)}
                      className="p-2 hover:bg-gray-600 rounded-md transition-colors"
                      title="Copy link"
                    >
                      {copiedStates[share.id] ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <LinkIcon size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteShare(share.id)}
                      className="p-2 hover:bg-gray-600 rounded-md transition-colors text-red-400"
                      title="Delete share link"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};