import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

async function fetchPageProduct(url) {
    const response = await axios.get(url, {
        responseType: "text",
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const jsonRaw = $('#__PRELOADED_STATE__').html();

    if (!jsonRaw) {
        console.log("Script não encontrado!");
        return null;
    }

    try {
        return JSON.parse(jsonRaw);
    } catch (err) {
        console.error("Erro ao parsear JSON de '__PRELOADED_STATE__':", err);
        return null;
    }
}

async function fetchPageProducts(url) {
    const response = await axios.get(url, {
        responseType: "text",
    });

    const html = response.data;
    
    const match = html.match(/_n\.ctx\.r\s*=\s*({[\s\S]*?})\s*;/);

    if (!match) {
        console.log("Nordic rendering ctx não encontrado");
        return null;
    }

    const jsonString = match[1];

    try {
        return JSON.parse(jsonString);
    } catch (err) {
        console.error("Erro ao fazer parse do Nordic ctx:", err);
        return null;
    }
}

async function scrapeProduct(url, mlb) {
    const data = await fetchPageProduct(url);
    console.log(data);
    if (!data) return null;
    
    const result = {
        id: mlb,
        url: data.pageState.initialState.components.share.permalink,
        title: data.pageState.initialState.components.header.title,
        rating: data.pageState.initialState.components.header.reviews.rating,
        rating_text: data.pageState.initialState.components.header.subtitle,
        current_price: data.pageState.initialState.components.price.price.value,
        previous_price: data.pageState.initialState.components.price.price.original_value,
        discount: data.pageState.initialState.components.track.melidata_event.event_data.credit_view_components.pricing.discount,
        images: gerarImagemUrl(data.pageState.initialState.components.gallery.pictures || []),
    };

    return {
        posts: [result],
    };
}

async function scrapeProducts(url) {
    const data = await fetchPageProducts(url);
    if (!data) return { posts: [] };

    console.log(data);
    let results = data?.appProps?.pageProps?.initialState?.results ?? [];
    let regex = /(https?:\/\/)?click1\.mercadolivre\.com\.br/;
    
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
        results_count: data.appProps.pageProps.initialState.analytics_track?.dimensions?.searchResults ?? null,
        last_page: data.appProps.pageProps.initialState.pagination.page_count ?? null,
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

        console.log("Parâmetros recebidos:", { query, mlb, url, page });
        let pageData = null;

        if (mlb) {
            pageData = await scrapeProduct(url, mlb);
        }

        else if (query) {
            const offset = (page - 1) * 50;

            let urlObj = new URL(decodeURIComponent(query), 'https://lista.mercadolivre.com.br/');
            let urlStr = urlObj.href;

            if (offset > 0) {
                urlStr += `_Desde_${offset + 1}_NoIndex_True`;
            }

            console.log("URL de busca construída:", urlStr);
            pageData = await scrapeProducts(urlStr);
        }

        else {
            return NextResponse.json(
                { error: "Parâmetros inválidos" },
                { status: 400 }
            );
        }

        return NextResponse.json(pageData);

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Erro ao processar scrape" },
            { status: 500 }
        );
    }
}