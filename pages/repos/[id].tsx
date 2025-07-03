import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useSession } from 'next-auth/react';
import styles from '../styles/repo.module.scss';
import Link from 'next/link';

export default function RepoDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [repo, setRepo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // File upload state
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadResults, setUploadResults] = useState<{ name: string; status: string }[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // View state
  const [viewingFile, setViewingFile] = useState<any>(null);
  const [viewingContent, setViewingContent] = useState('');
  const [viewingLoading, setViewingLoading] = useState(false);
  const [viewingError, setViewingError] = useState('');

  const [filePage, setFilePage] = useState(1);
  const filesPerPage = 10;
  const totalFilePages = Math.ceil(files.length / filesPerPage);
  const paginatedFiles = files.slice((filePage - 1) * filesPerPage, filePage * filesPerPage);

  const codeMimeTypes = [
    'text/plain',
    'text/x-c',
    'text/x-c++',
    'text/x-java',
    'text/x-python',
    'application/javascript',
    'application/json',
    'text/html',
    'text/css',
    'text/markdown',
    'application/xml',
    'text/x-sh',
    'text/x-typescript',
    'text/x-go',
    'text/x-ruby',
    'text/x-php',
    'text/x-csharp',
    'text/x-scala',
    'text/x-swift',
    'text/x-kotlin',
  ];

  const { data: session } = useSession();

  useEffect(() => {
    if (id) {
      fetchRepo();
      fetchFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRepo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/repos/${id}`);
      const data = await res.json();
      if (res.ok) {
        setRepo(data.repo);
      } else {
        setError(data.message || 'Failed to fetch repository');
      }
    } catch (err) {
      setError('Failed to fetch repository');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch(`/api/repos/${id}/files`);
      const data = await res.json();
      if (res.ok) {
        setFiles(data.files);
      }
    } catch {}
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFilesToUpload(Array.from(e.target.files));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filesToUpload.length) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    setUploadResults([]);
    const formData = new FormData();
    filesToUpload.forEach(file => formData.append('files', file));
    try {
      const res = await fetch(`/api/repos/${id}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setUploadSuccess('Files uploaded successfully!');
        logActivity('File Uploaded', `Repo: ${repo?.name}, Files: ${filesToUpload.map(f => f.name).join(', ')}`);
      } else {
        setUploadError('Upload failed');
      }
    } catch {
      setUploadError('Upload failed');
    }
    setFilesToUpload([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchFiles();
    setUploading(false);
  };

  const handleDeleteFile = async (filename: string) => {
    setDeletingFile(filename);
    setDeleteError('');
    try {
      const res = await fetch(`/api/repos/${id}/delete-file`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (res.ok) {
        if (viewingFile && viewingFile.filename === filename) {
          setViewingFile(null);
          setViewingContent('');
        }
        fetchFiles();
        logActivity('File Deleted', `Repo: ${repo?.name}, File: ${filename}`);
      } else {
        setDeleteError(data.message || 'Delete failed');
      }
    } catch (err) {
      setDeleteError('Delete failed');
    } finally {
      setDeletingFile(null);
    }
  };

  const handleViewFile = async (f: any) => {
    setViewingFile(f);
    setViewingContent('');
    setViewingError('');
    setViewingLoading(true);
    try {
      const res = await fetch(`/uploads/${id}/${f.filename}`);
      if (!res.ok) throw new Error('Failed to fetch file');
      const text = await res.text();
      setViewingContent(text);
    } catch (err) {
      setViewingError('Failed to load file');
    } finally {
      setViewingLoading(false);
    }
  };

  const logActivity = async (type: string, details: string) => {
    if (!session?.user?.email) return;
    // Find userId from repo or fetch from API if needed
    let userId = repo?.ownerId;
    if (!userId) {
      try {
        const res = await fetch('/api/user/me');
        const data = await res.json();
        if (res.ok) userId = data._id || null;
      } catch {}
    }
    if (!userId) return;
    await fetch('/api/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, details }),
    });
  };

  function getFileIcon(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return '📄';
    if (["js","ts","jsx","tsx","py","java","c","cpp","h","cs","go","rb","php","html","css","json","md","sh","xml","swift","kt","scala"].includes(ext)) return '📝';
    if (["png","jpg","jpeg","gif","bmp","svg","webp"].includes(ext)) return '🖼️';
    if (["zip","rar","7z","tar","gz"].includes(ext)) return '📦';
    if (["pdf"].includes(ext)) return '📕';
    if (["mp3","wav","ogg"].includes(ext)) return '🎵';
    if (["mp4","mov","avi","mkv"].includes(ext)) return '🎬';
    return '📄';
  }

  if (loading) {
    return (
      <div className="loader">
        <div className="loaderSpinner"></div>
        Loading repository...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!repo) return null;

  return (
    <div className="dashboard">
      <div className="backgroundElements">
        <div className="gridPattern"></div>
      </div>
      
      <div className="container">
        <div className="header">
          <Link href="/dashboard" className="backButton">
            ← Back to Dashboard
          </Link>
          
          <nav className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <span className="mx-2">/</span>
              </li>
              <li className="text-white font-semibold">{repo?.name}</li>
            </ol>
          </nav>
          
          <h1 className="title">{repo.name}</h1>
          <p className="text-xl text-white/80 mb-4">{repo.description}</p>
          <div className="text-sm text-white/60">
            Created: {new Date(repo.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="mainContent">
          {/* File Upload Section */}
          <div className="card">
            <h2 className="cardTitle">
              📤 Upload Files
            </h2>
            
            {uploadError && (
              <div className="message error">
                {uploadError}
              </div>
            )}
            
            {uploadSuccess && (
              <div className="message success">
                {uploadSuccess}
              </div>
            )}
            
            <form onSubmit={handleUpload} className="createRepoForm">
              <div className="formGroup">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="input"
                  style={{ 
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                />
              </div>
              
              <button
                type="submit"
                className="submitButton"
                disabled={uploading || !filesToUpload.length}
              >
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </form>
            
            {uploadResults.length > 0 && (
              <div className="mt-4">
                {uploadResults.map(r => (
                  <div key={r.name} className={`message ${r.status === 'Uploaded' ? 'success' : 'error'}`}>
                    {r.name}: {r.status}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Files List Section */}
          <div className="card">
            <h2 className="cardTitle">
              📁 Repository Files ({files.length})
            </h2>
            
            {deleteError && (
              <div className="message error">
                {deleteError}
              </div>
            )}
            
            {files.length === 0 ? (
              <div className="emptyState">
                <div className="emptyIcon">📂</div>
                <div className="emptyText">No files uploaded yet</div>
              </div>
            ) : (
              <div className="repoList">
                <div className="space-y-3">
                  {paginatedFiles.map(f => {
                    const isCode = codeMimeTypes.includes(f.mimetype) || 
                      (f.originalname && /\.(js|ts|jsx|tsx|py|java|c|cpp|h|cs|go|rb|php|html|css|json|md|sh|xml|swift|kt|scala)$/i.test(f.originalname));
                    
                    return (
                      <div key={f._id} className="repoItem">
                        <div className="repoHeader">
                          <div className="repoTitle">
                            <span className="text-2xl mr-3">{getFileIcon(f.originalname)}</span>
                            <div className="flex flex-col">
                              <Link
                                href={`/uploads/${id}/${f.filename}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="repoName"
                              >
                                {f.originalname}
                              </Link>
                              <span className="text-xs text-white/60">
                                {f.mimetype} • {Math.round(f.size / 1024)} KB
                              </span>
                            </div>
                          </div>
                          
                          <div className="repoActions">
                            <Link
                              href={`/uploads/${id}/${f.filename}`}
                              download={f.originalname}
                              className="actionButton visibility"
                              title="Download file"
                            >
                              Download
                            </Link>
                            
                            {isCode && (
                              <button
                                onClick={() => handleViewFile(f)}
                                className="actionButton visibility"
                                disabled={viewingLoading && viewingFile?._id === f._id}
                                title="View file"
                              >
                                {viewingLoading && viewingFile?._id === f._id ? 'Loading...' : 'View'}
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteFile(f.filename)}
                              className="actionButton delete"
                              disabled={deletingFile === f.filename}
                              title="Delete file"
                            >
                              {deletingFile === f.filename ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {totalFilePages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setFilePage(p => Math.max(1, p - 1))}
                      disabled={filePage === 1}
                      className="paginationButton"
                    >
                      Previous
                    </button>
                    
                    <span className="pageInfo">
                      Page {filePage} of {totalFilePages}
                    </span>
                    
                    <button
                      onClick={() => setFilePage(p => Math.min(totalFilePages, p + 1))}
                      disabled={filePage === totalFilePages}
                      className="paginationButton"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Code Viewer Section */}
        {viewingFile && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="cardTitle">
              <span className="text-2xl mr-2">{getFileIcon(viewingFile.originalname)}</span>
              Viewing: {viewingFile.originalname}
              <button
                className="ml-auto px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                onClick={() => { setViewingFile(null); setViewingContent(''); }}
              >
                Close
              </button>
            </div>
            
            {viewingLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loaderSpinner"></div>
                <span className="ml-3">Loading file content...</span>
              </div>
            ) : viewingError ? (
              <div className="message error">
                {viewingError}
              </div>
            ) : (
              <div className="mt-4 rounded-lg overflow-hidden">
                <SyntaxHighlighter 
                  language={viewingFile.originalname.split('.').pop() || ''} 
                  style={vscDarkPlus} 
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {viewingContent}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}