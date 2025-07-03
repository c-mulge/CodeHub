import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/dashboard.module.scss';

type Activity = { type: string; details: string; timestamp: string };
type ActivityListProps = {
  activity: Activity[];
  loading: boolean;
  error: string;
};

type Repo = {
  _id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  ownerId?: string;
};

type RepoListProps = {
  repos: Repo[];
  loading: boolean;
  error: string;
  search: string;
  onSearchChange: (val: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (updater: (p: number) => number) => void;
  onToggleVisibility: (repoId: string, current: boolean) => void;
  onCopyLink: (repoId: string) => void;
  onDeleteRepo: (repoId: string) => void;
  deletingRepoId: string | null;
  copiedRepoId: string | null;
  deleteRepoError: string;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [repos, setRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [repoError, setRepoError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const [copiedRepoId, setCopiedRepoId] = useState<string | null>(null);
  const [deletingRepoId, setDeletingRepoId] = useState<string | null>(null);
  const [deleteRepoError, setDeleteRepoError] = useState('');

  const [search, setSearch] = useState('');
  const [activity, setActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 10;

  const [profilePic, setProfilePic] = useState<string | null>(null);

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredRepos.length / reposPerPage);
  const paginatedRepos = filteredRepos.slice((currentPage - 1) * reposPerPage, currentPage * reposPerPage);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated') {
      fetchRepos();
      fetchActivity();
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/me').then(res => res.json()).then(data => {
        setProfilePic(data.profilePic || null);
      });
    }
  }, [session?.user?.email, router.asPath]);

  const fetchRepos = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch('/api/repos/user');
      const data = await res.json();
      if (res.ok) {
        setRepos(data.repositories);
      } else {
        setRepoError(data.message || 'Failed to fetch repositories');
      }
    } catch (err) {
      setRepoError('Failed to fetch repositories');
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchActivity = async () => {
    setLoadingActivity(true);
    try {
      const res = await fetch('/api/activity/user');
      const data = await res.json();
      if (res.ok) {
        setActivity(data.activity);
      } else {
        setActivityError(data.message || 'Failed to fetch activity');
      }
    } catch {
      setActivityError('Failed to fetch activity');
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleLogout = () => signOut({ redirect: true, callbackUrl: '/' });

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const res = await fetch('/api/repos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, isPublic }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateSuccess('Repository created successfully!');
        setName('');
        setDescription('');
        setIsPublic(false);
        fetchRepos();
        logActivity('Repository Created', `Name: ${name}`);
      } else {
        setCreateError(data.message || 'Failed to create repository');
      }
    } catch {
      setCreateError('Failed to create repository');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleVisibility = async (repoId: string, current: boolean) => {
    try {
      await fetch(`/api/repos/${repoId}/toggle-visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !current }),
      });
      fetchRepos();
      logActivity('Visibility Changed', `Repo ID: ${repoId}, Now: ${!current ? 'Public' : 'Private'}`);
    } catch { }
  };

  const handleCopyLink = (repoId: string) => {
    const url = `${window.location.origin}/public/${repoId}`;
    navigator.clipboard.writeText(url);
    setCopiedRepoId(repoId);
    setTimeout(() => setCopiedRepoId(null), 1500);
  };

  const handleDeleteRepo = async (repoId: string) => {
    if (!window.confirm('Are you sure you want to delete this repository?')) return;
    setDeletingRepoId(repoId);
    setDeleteRepoError('');
    try {
      const res = await fetch(`/api/repos/${repoId}/delete`, { method: 'DELETE' });
      if (res.ok) {
        fetchRepos();
        logActivity('Repository Deleted', `Repo ID: ${repoId}`);
      } else {
        const data = await res.json();
        setDeleteRepoError(data.message || 'Delete failed');
      }
    } catch {
      setDeleteRepoError('Delete failed');
    }
    setDeletingRepoId(null);
  };

  const logActivity = async (type: string, details: string) => {
    if (!session?.user?.email) return;

    let userId = null;
    if (repos.length > 0) {
      const userRepo = repos.find(r => r.ownerId);
      if (userRepo) userId = userRepo.ownerId;
    }
    if (!userId) {
      try {
        const res = await fetch('/api/user/me');
        const data = await res.json();
        if (res.ok) userId = data._id || null;
      } catch { }
    }
    if (!userId) return;

    await fetch('/api/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, details }),
    });
  };

  if (status === 'loading') return <PageLoader />;

  return (
    <div className={styles.dashboard}>
      <div className={styles.backgroundElements}>
        <div className={styles.gridPattern}></div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          {session && null}
        </div>

        <div className={styles.mainContent}>
          {/* Create Repository Form */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span>📁</span>
              Create New Repository
            </h2>
            <form onSubmit={handleCreateRepo} className={styles.createRepoForm}>
              {createError && <div className={`${styles.message} ${styles.error}`}>{createError}</div>}
              {createSuccess && <div className={`${styles.message} ${styles.success}`}>{createSuccess}</div>}
              
              <div className={styles.formGroup}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Repository Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={creating}
                />
              </div>
              
              <div className={styles.formGroup}>
                <textarea
                  className={styles.textarea}
                  placeholder="Repository Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={creating}
                />
              </div>
              
              <div className={styles.formGroup}>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    disabled={creating}
                    className={styles.checkbox}
                  />
                  <label htmlFor="isPublic" className={styles.checkboxLabel}>
                    Make repository public
                  </label>
                </div>
              </div>
              
              <button
                className={styles.submitButton}
                type="submit"
                disabled={creating}
              >
                {creating ? 'Creating Repository...' : 'Create Repository'}
              </button>
            </form>
          </div>

          {/* Repositories List */}
          <RepoList
            repos={paginatedRepos}
            loading={loadingRepos}
            error={repoError}
            search={search}
            onSearchChange={setSearch}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onToggleVisibility={handleToggleVisibility}
            onCopyLink={handleCopyLink}
            onDeleteRepo={handleDeleteRepo}
            deletingRepoId={deletingRepoId}
            copiedRepoId={copiedRepoId}
            deleteRepoError={deleteRepoError}
          />
        </div>

        {/* Activity Section */}
        <div className={`${styles.card} ${styles.activitySection}`}>
          <h2 className={styles.cardTitle}>
            <span>⚡</span>
            Recent Activity
          </h2>
          <ActivityList activity={activity} loading={loadingActivity} error={activityError} />
        </div>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className={styles.loader}>
      <div className={styles.loaderSpinner}></div>
      <span>Loading Dashboard...</span>
    </div>
  );
}

function RepoList({
  repos,
  loading,
  error,
  search,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  onToggleVisibility,
  onCopyLink,
  onDeleteRepo,
  deletingRepoId,
  copiedRepoId,
  deleteRepoError
}: RepoListProps) {
  return (
    <div className={`${styles.card} ${styles.repoList}`}>
      <h2 className={styles.cardTitle}>
        <span>📚</span>
        Your Repositories
      </h2>
      
      <input
        type="text"
        placeholder="Search repositories..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />
      
      {deleteRepoError && <div className={`${styles.message} ${styles.error}`}>{deleteRepoError}</div>}
      
      {loading ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading repositories...</div>
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>❌</div>
          <div className={styles.emptyText}>{error}</div>
        </div>
      ) : repos.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📁</div>
          <div className={styles.emptyText}>No repositories found</div>
        </div>
      ) : (
        <>
          {repos.map((repo: Repo) => (
            <div key={repo._id} className={styles.repoItem}>
              <div className={styles.repoHeader}>
                <div className={styles.repoTitle}>
                  <Link href={`/repos/${repo._id}`} className={styles.repoName}>
                    {repo.name}
                  </Link>
                  <span className={`${styles.badge} ${repo.isPublic ? styles.public : styles.private}`}>
                    {repo.isPublic ? 'Public' : 'Private'}
                  </span>
                  {repo.isPublic && (
                    <button
                      onClick={() => onCopyLink(repo._id)}
                      className={`${styles.copyButton} ${copiedRepoId === repo._id ? styles.copied : ''}`}
                    >
                      {copiedRepoId === repo._id ? 'Copied!' : 'Copy Link'}
                    </button>
                  )}
                </div>
                <div className={styles.repoActions}>
                  <button
                    onClick={() => onToggleVisibility(repo._id, repo.isPublic)}
                    className={`${styles.actionButton} ${styles.visibility}`}
                  >
                    {repo.isPublic ? 'Make Private' : 'Make Public'}
                  </button>
                  <button
                    onClick={() => onDeleteRepo(repo._id)}
                    className={`${styles.actionButton} ${styles.delete}`}
                    disabled={deletingRepoId === repo._id}
                  >
                    {deletingRepoId === repo._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
              
              <div className={styles.repoDescription}>
                {repo.description || 'No description available'}
              </div>
              
              <div className={styles.repoMeta}>
                Created: {new Date(repo.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => onPageChange(() => Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(() => Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ActivityList({ activity, loading, error }: ActivityListProps) {
  if (loading) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>⏳</div>
        <div className={styles.emptyText}>Loading activity...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>❌</div>
        <div className={styles.emptyText}>{error}</div>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📊</div>
        <div className={styles.emptyText}>No recent activity</div>
      </div>
    );
  }

  return (
    <div className={styles.activityList}>
      {activity.map((a, idx) => (
        <div key={idx} className={styles.activityItem}>
          <div className={styles.activityType}>{a.type}</div>
          <div className={styles.activityDetails}>{a.details}</div>
          <div className={styles.activityTime}>
            {new Date(a.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}