import React from "react";
export default function SearchFilter({
  searchTerm,
  selectedAuthor,
  authors,
  onSearchChange,
  onAuthorChange,
}) {
  return (
    <section className="panel filters">
      <h2>Search & Filter</h2>
      <div className="filter-grid">
        <div>
          <label htmlFor="search">Search by Title</label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Type to filter posts..."
          />
        </div>
        <div>
          <label htmlFor="author-filter">Filter by Author</label>
          <select
            id="author-filter"
            value={selectedAuthor}
            onChange={(event) => onAuthorChange(event.target.value)}
          >
            <option value="">All Authors</option>
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
