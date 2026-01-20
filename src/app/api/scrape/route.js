export const runtime = "nodejs";

import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

const fetchWithHeaders = async (url) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": process.env.SCRAPER_USER_AGENT || 
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": process.env.SCRAPER_ACCEPT || 
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": process.env.SCRAPER_ACCEPT_LANGUAGE || "pt-BR,pt;q=0.9",
                "Referer": process.env.SCRAPER_REFERER || "https://www.google.com/",
                "Cache-Control": process.env.SCRAPER_CACHE_CONTROL || "no-cache",
                "Pragma": process.env.SCRAPER_PRAGMA || "no-cache",
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

async function fetchPageProduct(url) {
    const html = await fetchWithHeaders(url);
    const $ = cheerio.load(html);

    const jsonRaw = $('#__PRELOADED_STATE__').html();

    if (!jsonRaw) {
        console.log("Produto bloqueado (PRELOADED_STATE ausente)");
        return { blocked: true };
    }

    try {
        return JSON.parse(jsonRaw);
    } catch (err) {
        console.error("Erro parse PRELOADED_STATE", err);
        return { blocked: true };
    }
}

async function fetchPageProducts(url) {
    const html = await fetchWithHeaders(url);
    
    const match = html.match(/_n\.ctx\.r\s*=\s*({[\s\S]*?})\s*;/);

    if (!match) {
        console.log("Busca bloqueada (ctx ausente)");
        return { blocked: true };
    }

    try {
        return JSON.parse(match[1]);
    } catch (err) {
        console.error("Erro parse ctx", err);
        return { blocked: true };
    }
}

async function scrapeProduct(url, mlb) {
    const data = await fetchPageProduct(url);

    if (data?.blocked) {
        return { blocked: true };
    }

    const state = data?.pageState?.initialState?.components;

    if (!state) {
        return { blocked: true };
    }

    return {
        posts: [
            {
                id: mlb,
                url: state.share?.permalink ?? null,
                title: state.header?.title ?? null,
                rating: state.header?.reviews?.rating ?? null,
                rating_text: state.header?.subtitle ?? null,
                current_price: state.price?.price?.value ?? null,
                previous_price: state.price?.price?.original_value ?? null,
                discount:
                    state.track?.melidata_event?.event_data?.credit_view_components?.pricing
                        ?.discount ?? null,
                images: gerarImagemUrl(state.gallery?.pictures ?? []),
            },
        ],
    };
}

async function scrapeProducts(url) {
    const data = await fetchPageProducts(url);

    if (data?.blocked) {
        return {
            blocked: true,
            reason: "Mercado Livre bloqueou a busca",
            posts: [],
            results_count: null,
            last_page: null,
        };
    }

    const initialState = data?.appProps?.pageProps?.initialState;

    if (!initialState) {
        return {
            blocked: true,
            reason: "Resposta inválida do Mercado Livre",
            posts: [],
            results_count: null,
            last_page: null,
        };
    }

    const results = initialState.results ?? [];
    const regex = /(https?:\/\/)?click1\.mercadolivre\.com\.br/;
    
    const posts = results
        .filter(item => item.polycard && item.state === "VISIBLE" && !regex.test(item.polycard.metadata?.url) && item.polycard.metadata?.url)
        .map(item => {
            let card = {
                url: `https://${item.polycard.metadata.url}`,
                title: null,
                rating: null,
                rating_text: null,
                current_price: null,
                previous_price: null,
                discount: null,
                images: null,
            };

            card.images = gerarImagemUrl(item.polycard.pictures.pictures || []);

            item.polycard.components.forEach(component => {
                if (component?.type === "title") {
                    card.title = component.title?.text ?? null;
                }

                if (component?.type === "review_compacted") {
                    const values = component.review_compacted?.values ?? [];
                    const rating = values.find(v => v.key === "label");
                    const sold = values.find(v => v.key === "label2");

                    card.rating = rating?.label?.text ?? 'Sem avaliação';
                    card.rating_text = sold?.label?.text ?? null;
                }

                if (component?.type === "price") {
                    const p = component.price;
                    card.current_price = p.current_price.value ? formatarPreco(p.current_price.value) : null;
                    card.previous_price = p.previous_price?.value ? formatarPreco(p.previous_price.value) : null;

                    const label = p.discount_label?.text ?? null;
                    const match = label?.match(/\b\d+% OFF\b/i);
                    card.discount = match ? match[0] : null;
                }
            });

            return card;
        });

    return {
        posts,
        results_count: initialState.analytics_track?.dimensions?.searchResults ?? null,
        last_page: initialState.pagination?.page_count ?? null,
    };
}

function gerarImagemUrl(pictures) {
    return pictures.map(pic => ({
        id: pic.id,
        url: `https://http2.mlstatic.com/D_NQ_NP_${pic.id}-O.webp`
    }));
}

function formatarPreco(preco) {
    return Number(preco.toFixed(2));
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { query, mlb, url, page = 1 } = body;

        let pageData;

        if (mlb && url) {
            pageData = await scrapeProduct(url, mlb);
        } else if (query) {
            const offset = (page - 1) * 50;

            const urlObj = new URL(
                decodeURIComponent(query),
                "https://lista.mercadolivre.com.br/"
            );

            let urlStr = urlObj.href;

            if (offset > 0) {
                urlStr += `_Desde_${offset + 1}_NoIndex_True`;
            }

            pageData = await scrapeProducts(urlStr);
        } else {
            return NextResponse.json(
                { error: "Parâmetros inválidos" },
                { status: 400 }
            );
        }

        return NextResponse.json(pageData);
    } catch (err) {
        console.error("Erro ao processar scrape:", err);
        return NextResponse.json(
            {
                blocked: true,
                error: "Falha ao buscar dados",
            },
            { status: 200 }
        );
    }
}