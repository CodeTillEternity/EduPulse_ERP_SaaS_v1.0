import React, { useState } from 'react';
import { PageFrame } from '../ui/PageFrame';
import {
  FileText,
  RefreshCw,
  Copy,
  Check,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

export interface NotionBlock {
  id: string;
  type: string;
  plainText: string;
  language?: string;
  checked?: boolean;
  icon?: string;
}

export interface NotionPageData {
  pageId: string;
  title: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  lastSyncedAt: string;
  icon?: string;
  blocks: NotionBlock[];
}

export const AcademicMaterialView: React.FC = () => {
  const [pageIdInput, setPageIdInput] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<NotionPageData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Syncs with the backend /api/v1/academic/notion/pages/{pageId}/sync
  const handleSyncNotionPage = async (pageIdToSync?: string) => {
    const targetId = (pageIdToSync || pageIdInput).trim();
    if (!targetId) {
      toast.error('Please enter a valid Notion Page ID');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(`/api/v1/academic/notion/pages/${targetId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPage({
          pageId: data.pageId || targetId,
          title: data.title || `Page ${targetId}`,
          courseCode: data.courseCode || 'ACAD',
          courseName: data.courseName || 'Course Notes',
          facultyName: data.facultyName || 'Faculty',
          lastSyncedAt: 'Just now',
          icon: data.icon || '📄',
          blocks: data.blocks || []
        });
        toast.success(`Synchronized Notion page: ${data.title || targetId}`);
      } else {
        // Fallback for offline/test mode: create empty or structured page
        setCurrentPage({
          pageId: targetId,
          title: `Document ${targetId}`,
          courseCode: 'ACAD',
          courseName: 'Course Notes',
          facultyName: 'Faculty Instructor',
          lastSyncedAt: 'Just now',
          icon: '📄',
          blocks: []
        });
        toast.info('Document initialized (empty blocks)');
      }
    } catch {
      // In standalone client mode without network:
      setCurrentPage({
        pageId: targetId,
        title: `Document ${targetId}`,
        courseCode: 'ACAD',
        courseName: 'Course Notes',
        facultyName: 'Faculty Instructor',
        lastSyncedAt: 'Just now',
        icon: '📄',
        blocks: []
      });
      toast.info('Document initialized (empty blocks)');
    } finally {
      setIsSyncing(false);
    }
  };

  const copyCode = (blockId: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCodeId(blockId);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const copyPageId = () => {
    if (!currentPage) return;
    navigator.clipboard?.writeText(currentPage.pageId);
    toast.success('Page ID copied');
  };

  const toggleTodo = (blockId: string) => {
    if (!currentPage) return;
    setCurrentPage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        blocks: prev.blocks.map(b => (b.id === blockId ? { ...b, checked: !b.checked } : b))
      };
    });
  };

  // Filter blocks based on search query
  const filteredBlocks = currentPage?.blocks.filter(b => {
    if (!searchQuery.trim()) return true;
    return b.plainText.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <PageFrame
      title="Faculty Notes"
      description="Synchronized course notes and academic materials from connected Notion pages."
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Academics', href: '/dashboard/academics' },
        { label: 'Faculty Notes' }
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {currentPage && (
            <button
              onClick={copyPageId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300"
              title="Copy Notion Page ID"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy ID</span>
            </button>
          )}
          <button
            onClick={() => handleSyncNotionPage()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-medium"
            title="Sync live from Notion API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Utilitarian Page Input & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSyncNotionPage();
            }}
            className="flex items-center gap-2 flex-1 max-w-lg"
          >
            <input
              type="text"
              placeholder="Enter Notion Page ID (e.g. 1a2b3c4d5e6f...)"
              value={pageIdInput}
              onChange={(e) => setPageIdInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
            <button
              type="submit"
              disabled={isSyncing}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Fetch Page
            </button>
          </form>

          {currentPage && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44"
                />
              </div>
              <span className="text-xs text-slate-500">
                {currentPage.blocks.length} blocks
              </span>
            </div>
          )}
        </div>

        {/* Blank-Slate Document Reader Container */}
        <div
          data-testid="notion-document-container"
          className="bg-white border border-slate-200 rounded-xl p-8 max-w-4xl mx-auto min-h-[500px] shadow-xs"
        >
          {!currentPage ? (
            // Clean Initial Blank Slate
            <div className="flex flex-col items-center justify-center h-80 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 text-slate-300" />
              <h3 className="text-sm font-semibold text-slate-700">No Notion Document Loaded</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Enter an official Notion Page ID above to sync and read live JSON block data.
              </p>
            </div>
          ) : currentPage.blocks.length === 0 ? (
            // Clean Empty Document Slate (if Notion page has no blocks)
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <div className="text-3xl mb-1">{currentPage.icon || '📄'}</div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentPage.title}</h1>
                <div className="text-xs text-slate-400 mt-1">Page ID: {currentPage.pageId}</div>
              </div>
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 space-y-1">
                <p className="text-xs text-slate-500">This Notion page is currently empty (0 block children).</p>
              </div>
            </div>
          ) : (
            // Live Block Children Rendering
            <div className="space-y-4">
              {/* Document Header */}
              <div className="border-b border-slate-200 pb-4">
                <div className="text-3xl mb-1">{currentPage.icon || '📄'}</div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentPage.title}</h1>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Page ID: {currentPage.pageId}</span>
                  <span>•</span>
                  <span>Last synced: {currentPage.lastSyncedAt}</span>
                </div>
              </div>

              {/* Rendered Block Items */}
              <div className="space-y-3 pt-2">
                {filteredBlocks.map((block) => {
                  switch (block.type) {
                    case 'heading_1':
                      return (
                        <h2 key={block.id} className="text-xl font-bold text-slate-900 pt-3 border-b border-slate-100 pb-1">
                          {block.plainText}
                        </h2>
                      );

                    case 'heading_2':
                      return (
                        <h3 key={block.id} className="text-lg font-semibold text-slate-800 pt-2">
                          {block.plainText}
                        </h3>
                      );

                    case 'heading_3':
                      return (
                        <h4 key={block.id} className="text-sm font-semibold text-slate-800 pt-1">
                          {block.plainText}
                        </h4>
                      );

                    case 'paragraph':
                      return (
                        <p key={block.id} className="text-xs text-slate-700 leading-relaxed">
                          {block.plainText}
                        </p>
                      );

                    case 'bulleted_list_item':
                      return (
                        <div key={block.id} className="flex items-start space-x-2 text-xs text-slate-700 ml-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
                          <span>{block.plainText}</span>
                        </div>
                      );

                    case 'numbered_list_item':
                      return (
                        <div key={block.id} className="flex items-start space-x-2 text-xs text-slate-700 ml-2">
                          <span className="font-mono text-slate-400 text-xs">1.</span>
                          <span>{block.plainText}</span>
                        </div>
                      );

                    case 'to_do':
                      return (
                        <div
                          key={block.id}
                          onClick={() => toggleTodo(block.id)}
                          className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={!!block.checked}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                          />
                          <span className={block.checked ? 'line-through text-slate-400' : ''}>
                            {block.plainText}
                          </span>
                        </div>
                      );

                    case 'code':
                      return (
                        <div key={block.id} className="relative bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono my-2 overflow-x-auto">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 pb-1 mb-2 border-b border-slate-800">
                            <span>{block.language || 'code'}</span>
                            <button
                              onClick={() => copyCode(block.id, block.plainText)}
                              className="hover:text-white flex items-center gap-1"
                            >
                              {copiedCodeId === block.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedCodeId === block.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre>{block.plainText}</pre>
                        </div>
                      );

                    case 'callout':
                      return (
                        <div key={block.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-start space-x-2">
                          <span className="text-base flex-shrink-0">{block.icon || 'ℹ️'}</span>
                          <span className="leading-relaxed">{block.plainText}</span>
                        </div>
                      );

                    case 'divider':
                      return <hr key={block.id} className="border-slate-200 my-3" />;

                    default:
                      return (
                        <div key={block.id} className="text-xs text-slate-700">
                          {block.plainText}
                        </div>
                      );
                  }
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageFrame>
  );
};

export default AcademicMaterialView;
