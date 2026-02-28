import { useState } from 'react';
import React from 'react';
const initialForm = {
  title: '',
  body: '',
  authorName: '',
};

function validate(values) {
  const errors = {};

  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  } else if (values.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters.';
  }

  if (!values.body.trim()) {
    errors.body = 'Body is required.';
  } else if (values.body.trim().length < 20) {
    errors.body = 'Body must be at least 20 characters.';
  }

  if (!values.authorName.trim()) {
    errors.authorName = 'Author name is required.';
  }

  return errors;
}

export default function PostForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formErrors = validate(form);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const created = await onSubmit({
      title: form.title.trim(),
      body: form.body.trim(),
      authorName: form.authorName.trim(),
    });

    if (created) {
      setForm(initialForm);
      setErrors({});
    }
  };

  return (
    <section className="panel">
      <h2>Add New Post</h2>
      <form className="post-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter a post title"
        />
        {errors.title ? <p className="field-error">{errors.title}</p> : null}

        <label htmlFor="body">Body</label>
        <textarea
          id="body"
          name="body"
          rows="4"
          value={form.body}
          onChange={handleChange}
          placeholder="Write at least 20 characters..."
        />
        {errors.body ? <p className="field-error">{errors.body}</p> : null}

        <label htmlFor="authorName">Author Name</label>
        <input
          id="authorName"
          name="authorName"
          type="text"
          value={form.authorName}
          onChange={handleChange}
          placeholder="Enter the author's name"
        />
        {errors.authorName ? (
          <p className="field-error">{errors.authorName}</p>
        ) : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Post'}
        </button>
      </form>
    </section>
  );
}
