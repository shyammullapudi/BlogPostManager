import { useCallback, useEffect, useState } from 'react';

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';
const USERS_URL = 'https://jsonplaceholder.typicode.com/users';

function enrichPosts(posts, users) {
  return posts.map((post) => {
    const user = users.find((u) => u.id === post.userId);
    return {
      ...post,
      authorName: user?.name ?? 'Unknown Author',
    };
  });
}

export default function usePosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [postsResponse, usersResponse] = await Promise.all([
        fetch(POSTS_URL),
        fetch(USERS_URL),
      ]);

      if (!postsResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to load posts. Please try again.');
      }

      const [postsData, usersData] = await Promise.all([
        postsResponse.json(),
        usersResponse.json(),
      ]);

      setPosts(enrichPosts(postsData, usersData));
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching posts.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = useCallback(
    async ({ title, body, authorName }) => {
      const nextId =
        posts.length > 0 ? Math.max(...posts.map((post) => post.id)) + 1 : 1;

      const payload = {
        title,
        body,
        userId: 0,
      };

      const response = await fetch(POSTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Unable to create post right now.');
      }

      const created = await response.json();
      const newPost = {
        ...created,
        id: nextId,
        authorName,
      };

      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    },
    [posts]
  );

  const updatePost = useCallback(async (id, values) => {
    const response = await fetch(`${POSTS_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error('Unable to update this post.');
    }

    return response.json();
  }, []);

  const removePost = useCallback(async (id) => {
    const response = await fetch(`${POSTS_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Unable to delete this post.');
    }
  }, []);

  return {
    posts,
    setPosts,
    isLoading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    removePost,
  };
}
