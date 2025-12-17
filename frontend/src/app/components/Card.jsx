import { useState } from "react";
import { extrairMLB } from '@/app/utils/regex';
import { useRouter } from "next/navigation";

export default function Card({ post }) {
    const [index, setIndex] = useState(0);
    
    const router = useRouter();
    const MLB_ID = extrairMLB(post.url);

    function carregarProduto() {
        router.push(`/produto/${MLB_ID}?url=${encodeURIComponent(post.url)}`);
    };

   return (
        <div className="card relative bg-white rounded-md shadow-md flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:-translate-y-2">
            <div className="img-container width-full h-60 p-2.5 mb-3 flex items-center justify-center relative overflow-hidden">
                {post.images.map((img, i) => (
                    <img
                        key={img.id}
                        src={img.url}
                        className={i === index ? 'block max-w-full max-h-full object-contain' : 'hidden'}
                    />
                ))}

                {post.images.length > 1 && (
                <>
                    <button className="prev absolute top-1/2 left-1 transform -translate-y-1/2 bg-black bg-opacity-60 text-white border-none cursor-pointer p-1.5" onClick={() => setIndex((index - 1 + post.images.length) % post.images.length)}>‹</button>
                    <button className="next absolute top-1/2 right-1 transform -translate-y-1/2 bg-black bg-opacity-60 text-white border-none cursor-pointer p-1.5" onClick={() => setIndex((index + 1) % post.images.length)}>›</button>
                </>
                )}
            </div>

            <div className="content p-4 flex flex-col gap-2">
                <h3
                    className="text-base font-semibold cursor-pointer hover:underline"
                    onClick={carregarProduto}
                >
                    {post.title}
                </h3>

                {post.discount && <p className="discount absolute top-2 right-2 bg-green-600 text-white text-sm px-2 py-1 rounded">{post.discount}</p>}

                <div className="item-details">
                    {post.previous_price && (
                        <p className="previous-price line-through text-gray-500">R$ {post.previous_price}</p>
                    )}
                    <p className="current-price font-bold text-lg">R$ {post.current_price}</p>
                    <p className="rating text-gray-500 text-sm before:content-['★'] before:text-yellow-400 before:mr-1">{post.rating} {post.rating_text}</p>
                </div>

                <div className="actions flex justify-between items-center">
                    <a href={post.url} target="_blank" className="bg-[var(--primary)] text-[var(--secondary)] px-4 py-2 rounded hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300">Mercado Livre</a>
                </div>
            </div>
        </div>
    );
}