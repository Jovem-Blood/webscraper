'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/app/components/Header';
import { DotsLoading } from '@/app/components/LoadingIndicator';
import { extrairMLB } from '@/app/utils/regex';

export default function Produto() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const produtoInicial = {
        id: null,
        url: '',
        title: '',
        rating: null,
        rating_text: '',
        current_price: null,
        previous_price: null,
        discount: null,
        images: []
    };

    const [loading, setLoading] = useState(false);
    const [novaBusca, setNovaBusca] = useState(decodeURIComponent(url || ''));
    const [produto, setProduto] = useState(produtoInicial);
    const [index, setIndex] = useState(0);  

    function handleSubmit(e) {
        e.preventDefault();

        const MLB = extrairMLB(novaBusca);
        if (MLB) {
            router.push(`/produto/${MLB}?url=${encodeURIComponent(novaBusca)}`);
            return;
        }

        router.push(`/busca/${encodeURIComponent(novaBusca)}?page=1`);
    }

    async function carregarProduto() {
        setLoading(true);
        setIndex(0);
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url, mlb: id })
        });
        
        const data = await response.json();
        setProduto(data.posts[0]);
        setLoading(false);
    }

    useEffect(() => {
        if (!id) return;
        setNovaBusca(decodeURIComponent(url || ''));
        setProduto(produtoInicial);
        carregarProduto();
    }, [id, url]);

    return (
        <div>
            <Header 
                searchValue={novaBusca}
                onSearchChange={(e) => setNovaBusca(e.target.value)}
                onSearchSubmit={handleSubmit}
            />
            {loading ? (
                <div className='flex justify-center items-centerm mt-4'>
                    <DotsLoading />
                </div>
            ) : (
                <div className='flex flex-col items-center mt-4'>
                    <div className="produto-container bg-white md:w-5xl justify-center flex p-6">
                        <div className="img-container w-full p-2 mb-3 flex items-center justify-center relative overflow-hidden">
                            {produto.images.map((img, i) => (
                                <img
                                    key={img.id}
                                    src={img.url}
                                    className={i === index ? 'block max-w-full max-h-full object-contain' : 'hidden'}
                                />
                            ))}
                            {produto.images.length > 1 && (
                            <>
                                <button className="prev absolute top-1/2 left-1 transform -translate-y-1/2 bg-black bg-opacity-60 text-white border-none cursor-pointer p-1.5" onClick={() => setIndex((index - 1 + produto.images.length) % produto.images.length)}>‹</button>
                                <button className="next absolute top-1/2 right-1 transform -translate-y-1/2 bg-black bg-opacity-60 text-white border-none cursor-pointer p-1.5" onClick={() => setIndex((index + 1) % produto.images.length)}>›</button>
                            </>
                            )}
                        </div>
                        <div className="content p-4 flex flex-col gap-2">
                            <h3 className="text-base font-semibold">
                                {produto.title}
                            </h3>
                            {produto.discount && <p className="discount absolute top-2 right-2 bg-green-600 text-white text-sm px-2 py-1 rounded">{produto.discount}</p>}
                            <div className="item-details">
                                {produto.previous_price && (
                                    <p className="previous-price line-through text-gray-500">R$ {produto.previous_price}</p>
                                )}
                                <p className="current-price font-bold text-lg">R$ {produto.current_price}</p>
                                <p className="rating text-gray-500 text-sm before:content-['★'] before:text-yellow-400 before:mr-1">{produto.rating} {produto.rating_text}</p>
                            </div>
                            <div className="actions flex justify-between items-center">
                                <a href={produto.url} target="_blank" className="bg-[var(--primary)] text-[var(--secondary)] px-4 py-2 rounded hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300">Mercado Livre</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
