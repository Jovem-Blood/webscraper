'use client';

import { SearchBar } from "./SearchBar";

export function Header({searchValue, onSearchChange, onSearchSubmit}) {
  return (
    <header className="w-full bg-[var(--secondary)] text-white p-4 shadow-md flex items-center justify-between">
      <h1 className="text-2xl font-bold hover:cursor-pointer" onClick={() => window.location.href = '/'}>MeliTrack</h1>
      <SearchBar
        value={searchValue}
        onChange={onSearchChange}
        onSubmit={onSearchSubmit}
      />
    </header>
  );
}