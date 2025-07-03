import { useRouter } from 'next/router'
import React, { useEffect, useState, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import styles2 from '../../styles/dashboard.module.scss'
import styles from '../../styles/repo.module.scss';


export default function RepoDetails() {
  const router = useRouter()
  const { id } = router.query
  const [repo, setRepo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [files, setFiles] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const [viewingFile, setViewingFile] = useState<any>(null)
  const [viewingContent, setViewingContent] = useState('')
  const [viewingLoading, setViewingLoading] = useState(false)
  const [viewingError, setViewingError] = useState('')

  const [filePage, setFilePage] = useState(1)
  const filesPerPage = 10
  const totalFilePages = Math.ceil(files.length / filesPerPage)
  const paginatedFiles = files.slice((filePage - 1) * filesPerPage, filePage * filesPerPage)

  const { data: session } = useSession()

  useEffect(() => {
    if (id) {
      fetchRepo()
      fetchFiles()
    }
  }, [id])

  const fetchRepo = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/repos/${id}`)
      const data = await res.json()
      if (res.ok) {
        setRepo(data.repo)
      } else {
        setError(data.message || 'Failed to fetch repository')
      }
    } catch {
      setError('Failed to fetch repository')
    } finally {
      setLoading(false)
    }
  }

  const fetchFiles = async () => {
    try {
      const res = await fetch(`/api/repos/${id}/files`)
      const data = await res.json()
      if (res.ok) {
        setFiles(data.files)
      }
    } catch {}
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFilesToUpload(Array.from(e.target.files))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!filesToUpload.length) return
    setUploading(true)
    setUploadError('')
    setUploadSuccess('')

    const formData = new FormData()
    filesToUpload.forEach(file => formData.append('files', file))

    try {
      const res = await fetch(`/api/repos/${id}/upload`, { method: 'POST', body: formData })
      if (res.ok) {
        setUploadSuccess('Files uploaded successfully!')
        logActivity('File Uploaded', `Repo: ${repo?.name}, Files: ${filesToUpload.map(f => f.name).join(', ')}`)
        fetchFiles()
      } else {
        setUploadError('Upload failed')
      }
    } catch {
      setUploadError('Upload failed')
    }

    setFilesToUpload([])
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploading(false)
  }

  const handleDeleteFile = async (filename: string) => {
    setDeletingFile(filename)
    setDeleteError('')

    try {
      const res = await fetch(`/api/repos/${id}/delete-file`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      })

      const data = await res.json()
      if (res.ok) {
        if (viewingFile && viewingFile.filename === filename) {
          setViewingFile(null)
          setViewingContent('')
        }
        fetchFiles()
        logActivity('File Deleted', `Repo: ${repo?.name}, File: ${filename}`)
      } else {
        setDeleteError(data.message || 'Delete failed')
      }
    } catch {
      setDeleteError('Delete failed')
    } finally {
      setDeletingFile(null)
    }
  }

  const handleViewFile = async (f: any) => {
    setViewingFile(f)
    setViewingContent('')
    setViewingError('')
    setViewingLoading(true)

    try {
      const res = await fetch(`/uploads/${id}/${f.filename}`)
      if (!res.ok) throw new Error('Failed to fetch file')
      const text = await res.text()
      setViewingContent(text)
    } catch {
      setViewingError('Failed to load file')
    } finally {
      setViewingLoading(false)
    }
  }

  const logActivity = async (type: string, details: string) => {
    if (!session?.user?.email) return
    let userId = repo?.ownerId

    if (!userId) {
      try {
        const res = await fetch('/api/user/me')
        const data = await res.json()
        if (res.ok) userId = data._id || null
      } catch {}
    }
    if (!userId) return

    await fetch('/api/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, details }),
    })
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (!ext) return '📄'
    if (["js", "ts", "jsx", "tsx", "py", "java", "c", "cpp", "h", "cs", "go", "rb", "php", "html", "css", "json", "md", "sh", "xml", "swift", "kt", "scala"].includes(ext)) return '📝'
    if (["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"].includes(ext)) return '🖼️'
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return '📦'
    if (["pdf"].includes(ext)) return '📕'
    if (["mp3", "wav", "ogg"].includes(ext)) return '🎵'
    if (["mp4", "mov", "avi", "mkv"].includes(ext)) return '🎬'
    return '📄'
  }

  if (loading) return <div className={styles.loader}><div className={styles.loaderSpinner}></div>Loading...</div>
  if (error) return <div className={styles.loader}>{error}</div>
  if (!repo) return null

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/dashboard" className={styles.backButton}>← Back to Dashboard</Link>
          <h1 className={styles.title}>{repo.name}</h1>
          <div className="text-white text-center mb-4">{repo.description}</div>
          <div className="text-white text-sm text-center mb-8">Created: {new Date(repo.createdAt).toLocaleString()}</div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Upload Files</h2>
          {uploadError && <div className={`${styles.message} ${styles.error}`}>{uploadError}</div>}
          {uploadSuccess && <div className={`${styles.message} ${styles.success}`}>{uploadSuccess}</div>}

          <form onSubmit={handleUpload} className={styles.createRepoForm}>
            <div className="formGroup">
              <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} className={styles.input} />
            </div>
            <button type="submit" className={styles.submitButton} disabled={uploading || !filesToUpload.length}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Uploaded Files</h2>
          {deleteError && <div className={`${styles.message} ${styles.error}`}>{deleteError}</div>}
          {files.length === 0 ? (
            <div className="text-white">No files uploaded yet.</div>
          ) : (
            <ul className={styles.repoList}>
              {paginatedFiles.map(f => (
                <li key={f._id} className={styles.repoItem}>
                  <div className={styles.repoHeader}>
                    <div className={styles.repoTitle}>
                      <span>{getFileIcon(f.originalname)}</span>
                      <Link href={`/uploads/${id}/${f.filename}`} target="_blank" rel="noopener noreferrer" className={styles.repoName}>
                        {f.originalname}
                      </Link>
                      <span className="text-white text-xs">({Math.round(f.size / 1024)} KB)</span>
                    </div>
                    <div className={styles.repoActions}>
                      <Link href={`/uploads/${id}/${f.filename}`} download={f.originalname} className={`${styles.actionButton} ${styles.visibility}`}>
                        Download
                      </Link>
                      <button
                        onClick={() => handleViewFile(f)}
                        className={`${styles.actionButton} ${styles.visibility}`}
                        disabled={viewingLoading && viewingFile?._id === f._id}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteFile(f.filename)}
                        className={`${styles.actionButton} ${styles.delete}`}
                        disabled={deletingFile === f.filename}
                      >
                        {deletingFile === f.filename ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalFilePages > 1 && (
            <div className={styles.pagination}>
              <button onClick={() => setFilePage(p => Math.max(1, p - 1))} disabled={filePage === 1} className={styles.paginationButton}>Prev</button>
              <span className={styles.pageInfo}>Page {filePage} of {totalFilePages}</span>
              <button onClick={() => setFilePage(p => Math.min(totalFilePages, p + 1))} disabled={filePage === totalFilePages} className={styles.paginationButton}>Next</button>
            </div>
          )}
        </div>

        {viewingFile && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Viewing: {viewingFile.originalname}</h2>
            <button className={styles.submitButton} onClick={() => { setViewingFile(null); setViewingContent('') }}>Close</button>
            {viewingLoading ? (
              <div className="text-white">Loading...</div>
            ) : viewingError ? (
              <div className={`${styles.message} ${styles.error}`}>{viewingError}</div>
            ) : (
              <SyntaxHighlighter language={viewingFile.originalname.split('.').pop() || ''} style={vscDarkPlus} showLineNumbers>
                {viewingContent}
              </SyntaxHighlighter>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
