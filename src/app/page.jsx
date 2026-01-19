'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { extrairMLB } from '@/app/utils/regex';
import { Header } from './components/Header';

export default function Home() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    function handleSubmit(e) {
        e.preventDefault();

        const valor = query.trim();
        const MLB = extrairMLB(valor);
        if (MLB) {
            router.push(`/produto/${MLB}?url=${encodeURIComponent(query)}`);
            return;
        }

        router.push(`/busca/${encodeURIComponent(query)}?page=1`);

    }

    return (
        <>
            <Header />
            <div id="hero" className='bg-[var(--secondary)] text-white py-5 px-20 w-full grid md:grid-cols-2 gap-10 items-center justify-items-center'>
                <div id="hero-content">
                    <h1 className='text-5xl font-extrabold'>
                        Monitore os preços no <span className='text-[var(--primary)]'>Mercado Livre</span>
                    </h1>

                    <p className='mt-5 mb-10 text-lg text-[var(--muted-foreground)]'>
                        Busque um produto e acompanhe a variação de preço.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <input
                            className='bg-white text-black px-3.5 py-4 text-base border-0 rounded-s-md focus:outline-none w-72'
                            type="text"
                            placeholder="URL ou termo de busca"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            required
                        />
                        <button className='cursor-pointer bg-[var(--primary)] text-[var(--secondary)] px-6 py-4 text-base font-semibold rounded-e-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300' type="submit">Buscar</button>
                    </form>
                </div>
                <div id='hero-image'>
                    <img src="/images/hero-image.png" alt="Imagem ilustrativa de monitoramento de preços" />
                </div>
            </div>
        </>
    );
}
