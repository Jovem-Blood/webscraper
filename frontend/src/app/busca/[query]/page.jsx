'use client';

import React, { useEffect } from 'react';
import Card from '../../components/Card';
import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { DotsLoading } from '@/app/components/LoadingIndicator';
import { extrairMLB } from '@/app/utils/regex';
import { Header } from '@/app/components/Header';

export default function Busca() {
    const { query } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    
    const [loading, setLoading] = useState(false);
    const [novaBusca, setNovaBusca] = useState(decodeURIComponent(query));
    const [posts, setPosts] = useState([]);
    const [results, setResults] = useState(null);
    const [lastPage, setLastPage] = useState(null);

    async function carregarPagina(pagina = 1) {
        setLoading(true);
        setPosts([]);
        const url =  `/api/scrape`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, page: pagina })
        });

        const data = await response.json();

        setPosts(data.posts);
        setLastPage(data.last_page ?? null);
        setResults(data.results_count ?? null);
        setLoading(false);
    }

    function handleSubmit(e) {
        e.preventDefault();

        const MLB = extrairMLB(novaBusca);
        if (MLB) {
            router.push(`/produto/${MLB}?url=${encodeURIComponent(novaBusca)}`);
            return;
        }

        router.push(`/busca/${encodeURIComponent(novaBusca)}?page=1`);
    };

    useEffect(() => {
        if (!query) return;
        setNovaBusca(decodeURIComponent(query));
        setPosts([]);
        setResults(null);
        carregarPagina(page);
    }, [query, page]);

    return (
        <div>
            <Header 
                searchValue={novaBusca}
                onSearchChange={(e) => setNovaBusca(e.target.value)}
                onSearchSubmit={handleSubmit}
            />

            <h2>Resultados para: {decodeURIComponent(query)} ({results ?? 0} resultados)</h2>

            {loading ? (
                <div className='flex justify-center items-center'>
                    <DotsLoading />
                </div>
            ) : (
                <div id="cards" className="grid [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] mx-auto gap-6 p-5 max-w-[1280px]">
                    {posts.map(post => (
                        <Card key={post.url} post={post} />
                    ))}
                </div>
            )}

            <button disabled={loading || page <= 1} onClick={() => router.push(`/busca/${encodeURIComponent(query)}?page=${parseInt(page) - 1}`)}>
                Anterior
            </button>

            <button disabled={loading || page >= lastPage} onClick={() => router.push(`/busca/${encodeURIComponent(query)}?page=${parseInt(page) + 1}`)}>
                Próxima
            </button>
        </div>
  );
}