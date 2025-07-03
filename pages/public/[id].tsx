import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Link from 'next/link';

export default function PublicRepo() {
  const router = useRouter();
  const { id } = router.query;
  const [repo, setRepo] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (id) {
      fetchRepo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRepo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/public/${id}`);
      const data = await res.json();
      if (res.ok) {
        setRepo(data.repo);
        setFiles(data.files);
      } else {
        setError(data.message || 'Not found');
      }
    } catch (err) {
      setError('Not found');
    } finally {
      setLoading(false);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!repo) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 p-2 sm:p-6 rounded shadow overflow-x-auto">
        <div className="mb-4">
          <Link href="/" className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded font-medium shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition">← Back to Home</Link>
        </div>
        <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="list-reset flex">
            <li>
              <Link href="/" className="hover:underline">Home</Link>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link href="/" className="hover:underline">Public Repo</Link>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-700 font-semibold">{repo.name}</li>
          </ol>
        </nav>
        <h1 className="text-2xl font-bold mb-2">{repo.name}</h1>
        <div className="mb-2 text-gray-700">{repo.description}</div>
        <div className="mb-4 text-xs text-gray-400">Created: {new Date(repo.createdAt).toLocaleString()}</div>
        <div className="mb-4 text-xs px-2 py-1 rounded bg-green-100 text-green-700 inline-block">Public</div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Files</h2>
          {files.length === 0 ? (
            <div>No files uploaded yet.</div>
          ) : (
            <ul>
              {paginatedFiles.map(f => {
                const isCode = codeMimeTypes.includes(f.mimetype) || (f.originalname && /\.(js|ts|jsx|tsx|py|java|c|cpp|h|cs|go|rb|php|html|css|json|md|sh|xml|swift|kt|scala)$/i.test(f.originalname));
                return (
                  <li key={f._id} className="mb-2 flex items-center">
                    <span className="mr-2 text-xl">{getFileIcon(f.originalname)}</span>
                    <a
                      href={`/uploads/${id}/${f.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {f.originalname}
                    </a>
                    <span className="ml-2 text-xs text-gray-500">({f.mimetype}, {Math.round(f.size / 1024)} KB)</span>
                    <a
                      href={`/uploads/${id}/${f.filename}`}
                      download={f.originalname}
                      className="ml-2 px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-medium shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      title="Download file"
                    >
                      Download
                    </a>
                    {isCode && (
                      <button
                        onClick={() => handleViewFile(f)}
                        className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs font-medium shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                        disabled={viewingLoading && viewingFile?._id === f._id}
                        title="View file"
                      >
                        View
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {totalFilePages > 1 && (
            <div className="flex justify-center mt-2 gap-2">
              <button
                onClick={() => setFilePage(p => Math.max(1, p - 1))}
                disabled={filePage === 1}
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-2">Page {filePage} of {totalFilePages}</span>
              <button
                onClick={() => setFilePage(p => Math.min(totalFilePages, p + 1))}
                disabled={filePage === totalFilePages}
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          {/* Inline code viewer */}
          {viewingFile && (
            <div className="mt-6 w-full">
              <div className="flex items-center mb-2">
                <span className="font-semibold">Viewing:</span>
                <span className="ml-2 text-blue-700">{viewingFile.originalname}</span>
                <button
                  className="ml-4 px-2 py-1 bg-gray-300 rounded text-xs"
                  onClick={() => { setViewingFile(null); setViewingContent(''); }}
                >
                  Close
                </button>
              </div>
              {viewingLoading ? (
                <div>Loading...</div>
              ) : viewingError ? (
                <div className="text-red-600">{viewingError}</div>
              ) : (
                <SyntaxHighlighter language={viewingFile.originalname.split('.').pop() || ''} style={vscDarkPlus} showLineNumbers>
                  {viewingContent}
                </SyntaxHighlighter>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
