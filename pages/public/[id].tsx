import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import styles from '../../styles/public.module.scss';

interface RepoType {
  name: string;
  description: string;
  createdAt: string;
}

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

export default function PublicRepo() {
  const router = useRouter();
  const { id } = router.query;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [repo, setRepo] = useState<RepoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (id) fetchRepo(); }, [id]);

  const fetchRepo = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/public/${id}`);
      const data = await res.json();
      if (res.ok) setRepo(data.repo);
      else setError(data.message || 'Repository not found');
    } catch {
      setError('Repository not found');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: FileItem[] = Array.from(selectedFiles).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('text')) return '📝';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  };

  const simulateUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    for (const file of files) {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ));

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress } : f
        ));
      }

      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'success' } : f
      ));
    }
    
    setUploading(false);
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.backgroundElements}>
          <div className={styles.gridPattern}></div>
        </div>
        <div className={styles.loader}>
          <div className={styles.loaderSpinner}></div>
          <span>Loading repository...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.backgroundElements}>
          <div className={styles.gridPattern}></div>
        </div>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2 className={styles.errorTitle}>Repository Not Found</h2>
            <p className={styles.errorMessage}>{error}</p>
            <Link href="/dashboard" className={styles.backButton}>
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!repo) return null;

  return (
    <div className={styles.dashboard}>
      <div className={styles.backgroundElements}>
        <div className={styles.gridPattern}></div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/dashboard" className={styles.backButton}>
            <span className={styles.backIcon}>←</span>
            Back to Dashboard
          </Link>
          
          <div className={styles.repoHeader}>
            <div className={styles.repoIcon}>📁</div>
            <div className={styles.repoInfo}>
              <h1 className={styles.repoName}>{repo.name}</h1>
              <p className={styles.repoDescription}>{repo.description}</p>
              <div className={styles.repoMeta}>
                <span className={styles.createdDate}>
                  📅 Created: {new Date(repo.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className={styles.publicBadge}>🌐 Public</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.uploadCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <span className={styles.titleIcon}>📤</span>
                Upload Files
              </h2>
              <p className={styles.cardDescription}>
                Drag and drop files or click to browse
              </p>
            </div>

            <div 
              className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropZoneContent}>
                <div className={styles.uploadIcon}>☁️</div>
                <h3 className={styles.dropTitle}>
                  {dragOver ? 'Drop files here' : 'Choose files to upload'}
                </h3>
                <p className={styles.dropSubtitle}>
                  Support for multiple files up to 100MB each
                </p>
                <button className={styles.browseButton}>
                  Browse Files
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleInputChange}
                className={styles.fileInput}
              />
            </div>

            {files.length > 0 && (
              <div className={styles.fileList}>
                <div className={styles.fileListHeader}>
                  <h3 className={styles.fileListTitle}>Selected Files ({files.length})</h3>
                  <button 
                    className={styles.clearAllButton}
                    onClick={() => setFiles([])}
                    disabled={uploading}
                  >
                    Clear All
                  </button>
                </div>
                
                <div className={styles.fileItems}>
                  {files.map((file) => (
                    <div key={file.id} className={styles.fileItem}>
                      <div className={styles.fileIcon}>{getFileIcon(file.type)}</div>
                      <div className={styles.fileDetails}>
                        <div className={styles.fileName}>{file.name}</div>
                        <div className={styles.fileSize}>{formatFileSize(file.size)}</div>
                        {file.status === 'uploading' && (
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill}
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      <div className={styles.fileActions}>
                        <span className={`${styles.fileStatus} ${styles[file.status]}`}>
                          {file.status === 'pending' && '⏳'}
                          {file.status === 'uploading' && '📤'}
                          {file.status === 'success' && '✅'}
                          {file.status === 'error' && '❌'}
                        </span>
                        {file.status === 'pending' && (
                          <button 
                            className={styles.removeButton}
                            onClick={() => removeFile(file.id)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.uploadActions}>
                  <button 
                    className={styles.uploadButton}
                    onClick={simulateUpload}
                    disabled={uploading || files.length === 0}
                  >
                    {uploading ? (
                      <>
                        <span className={styles.uploadingSpinner}></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <span className={styles.uploadIcon}>🚀</span>
                        Upload Files
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.statsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <span className={styles.titleIcon}>📊</span>
                Repository Stats
              </h2>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>0</div>
                <div className={styles.statLabel}>Files</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>0 MB</div>
                <div className={styles.statLabel}>Size</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>0</div>
                <div className={styles.statLabel}>Downloads</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}