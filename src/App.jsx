import React, { useMemo, useState } from 'react';
import Pagination from './components/Pagination';
import PostCard from './components/PostCard';
import PostForm from './components/PostForm';
import SearchFilter from './components/SearchFilter';
import usePosts from './hooks/usePosts';

const POSTS_PER_PAGE = 10;

export default function App() {
  const { posts, setPosts, isLoading, error, refetch, createPost, updatePost, removePost } =
    usePosts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authors = useMemo(() => {
    const unique = new Set(posts.map((post) => post.authorName));
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const matchesAuthor = selectedAuthor ? post.authorName === selectedAuthor : true;
      return matchesSearch && matchesAuthor;
    });
  }, [posts, searchTerm, selectedAuthor]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleAuthorChange = (value) => {
    setSelectedAuthor(value);
    setCurrentPage(1);
  };

  const handleAddPost = async (values) => {
    setActionError('');
    setIsSubmitting(true);
    try {
      await createPost(values);
      setCurrentPage(1);
      return true;
    } catch (err) {
      setActionError(err.message || 'Failed to create post.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (postId, updatedValues) => {
    setActionError('');
    const previousPosts = posts;
    const nextPosts = posts.map((post) =>
      post.id === postId ? { ...post, ...updatedValues } : post
    );

    setPosts(nextPosts);

    try {
      await updatePost(postId, updatedValues);
      return true;
    } catch (err) {
      setPosts(previousPosts);
      setActionError(err.message || 'Failed to update post.');
      return false;
    }
  };

  const handleDelete = async (postId) => {
    setActionError('');
    try {
      await removePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      setActionError(err.message || 'Failed to delete post.');
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <main className="app">
      <section className="hero">
        <h1>Blog Post Manager</h1>
        <p>Browse, search, add, edit, and delete posts with full CRUD interactions.</p>
      </section>

      <PostForm onSubmit={handleAddPost} isSubmitting={isSubmitting} />

      <SearchFilter
        searchTerm={searchTerm}
        selectedAuthor={selectedAuthor}
        authors={authors}
        onSearchChange={handleSearchChange}
        onAuthorChange={handleAuthorChange}
      />

      {actionError ? <p className="error-banner">{actionError}</p> : null}

      <section className="panel posts-section">
        <div className="posts-toolbar">
          <h2>Posts</h2>
          <p>
            Showing {filteredPosts.length} of {posts.length} posts
          </p>
        </div>

        {isLoading ? (
          <div className="loading-wrap">
            <span className="spinner" />
            <p>Loading posts...</p>
          </div>
        ) : error ? (
          <div className="error-wrap">
            <p>{error}</p>
            <button onClick={refetch}>Try Again</button>
          </div>
        ) : paginatedPosts.length === 0 ? (
          <p className="empty-state">No posts found for the current filters.</p>
        ) : (
          <div className="post-grid">
            {paginatedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onSaveEdit={handleSaveEdit}
                onConfirmDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {!isLoading && !error && filteredPosts.length > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
          />
        ) : null}
      </section>
    </main>
  );
}
