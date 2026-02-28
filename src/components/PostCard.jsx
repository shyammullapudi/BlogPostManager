import { useEffect, useState } from 'react';
import React from 'react';
function truncate(text, max = 100) {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max)}...`;
}

export default function PostCard({ post, onSaveEdit, onConfirmDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draft, setDraft] = useState({ title: post.title, body: post.body });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setDraft({ title: post.title, body: post.body });
  }, [post.title, post.body]);

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCancelEdit = () => {
    setDraft({ title: post.title, body: post.body });
    setErrors({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    const nextErrors = {};

    if (!draft.title.trim()) {
      nextErrors.title = 'Title is required.';
    } else if (draft.title.trim().length < 5) {
      nextErrors.title = 'Title must be at least 5 characters.';
    }

    if (!draft.body.trim()) {
      nextErrors.body = 'Body is required.';
    } else if (draft.body.trim().length < 20) {
      nextErrors.body = 'Body must be at least 20 characters.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const ok = await onSaveEdit(post.id, {
      title: draft.title.trim(),
      body: draft.body.trim(),
    });

    if (ok) {
      setIsEditing(false);
      setErrors({});
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onConfirmDelete(post.id);
    }, 300);
  };

  return (
    <article className={`post-card ${isDeleting ? 'deleting' : ''}`}>
      <header className="post-header">
        <span className="post-id">Post #{post.id}</span>
        <p className="post-author">{post.authorName}</p>
      </header>

      {isEditing ? (
        <div className="edit-form">
          <label htmlFor={`title-${post.id}`}>Title</label>
          <input
            id={`title-${post.id}`}
            name="title"
            value={draft.title}
            onChange={handleDraftChange}
          />
          {errors.title ? <p className="field-error">{errors.title}</p> : null}

          <label htmlFor={`body-${post.id}`}>Body</label>
          <textarea
            id={`body-${post.id}`}
            name="body"
            rows="4"
            value={draft.body}
            onChange={handleDraftChange}
          />
          {errors.body ? <p className="field-error">{errors.body}</p> : null}

          <div className="row-actions">
            <button onClick={handleSave}>Save</button>
            <button className="ghost" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3>{post.title}</h3>
          <p className="post-body">{truncate(post.body)}</p>
          <div className="row-actions">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button className="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          </div>
        </>
      )}

      {confirmDelete ? (
        <div className="delete-confirm">
          <p>Are you sure you want to delete this post?</p>
          <div className="row-actions">
            <button className="danger" onClick={handleDelete}>
              Yes
            </button>
            <button className="ghost" onClick={() => setConfirmDelete(false)}>
              No
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
