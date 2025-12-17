'use client';

export function SearchBar({value, onChange, onSubmit}) {
  return (
    <form onSubmit={onSubmit}>
        <input
            className='bg-white text-black p-2 text-base border-0 rounded-s-md focus:outline-none w-72'
            type="text"
            placeholder="URL ou termo de busca"
            value={value}
            onChange={onChange}
            required
        />
        <button className='cursor-pointer bg-[var(--primary)] text-[var(--secondary)] p-2 text-base font-semibold rounded-e-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300' type="submit">Buscar</button>
    </form>
  );
}