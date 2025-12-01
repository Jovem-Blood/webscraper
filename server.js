const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const PORT = 3000;

async function fetchPage(url) {
    const response = await axios.get(url, {
        responseType: "text",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const jsonRaw = $('#__PRELOADED_STATE__').html();

    if (!jsonRaw) {
        console.log("Script não encontrado!");
        return null;
    }

    return JSON.parse(jsonRaw);
}

async function scrapeProduct(url) {
    const data = await fetchPage(url);
    if (!data) return null;

    return {
        title: data.pageState.initialState.components.header.title,
        rating: data.pageState.initialState.components.header.reviews.rating,
        original_price: data.pageState.initialState.components.price.price.original_value,
        price: data.pageState.initialState.components.price.price.value
    };
}

async function scrapeProducts(url) {
    const data = await fetchPage(url);
    if (!data) return posts;

    let results = data.pageState.initialState?.results ?? [];

    let regex = /(https?:\/\/)?click1\.mercadolivre\.com\.br/;
    
    const posts = results
        .filter(item => item.polycard && item.state === "VISIBLE" && !regex.test(item.polycard.metadata?.url))
        .map(item => {
            let card = {
                url: item.polycard.metadata?.url ?? null,
                title: null,
                rating: null,
                rating_text: null,
                current_price: null,
                previous_price: null,
                discount: null,
            };

            item.polycard.components.forEach(component => {
                if (component?.type === "title") {
                    card.title = component.title?.text ?? null;
                }

                if (component?.type === "review_compacted") {
                    const values = component.review_compacted?.values ?? [];
                    const rating = values.find(v => v.key === "label");
                    const sold = values.find(v => v.key === "label2");

                    card.rating = rating?.label?.text ?? null;
                    card.rating_text = sold?.label?.text ?? null;
                }

                if (component?.type === "price") {
                    const p = component.price;
                    card.current_price = p.current_price?.value ?? null;
                    card.previous_price = p.previous_price?.value ?? null;
                    card.discount = p.discount_label?.text ?? null;
                }
            });

            return card;
        });

    return {
        posts,
        next_page: data.pageState.initialState?.pagination?.next_page?.url ?? null,
        prev_page: data.pageState.initialState?.pagination?.previous_page?.url ?? null,
    };
}


app.post("/scrape", async (req, res) => {
    const query = req.body.query;

    try {
        let url;
        let pageData;

        if (query.includes("MLB")) {
            url = query;
            pageData = await scrapeProduct(url);
        } else {
            url = `https://lista.mercadolivre.com.br/${encodeURIComponent(query)}`;
            pageData = await scrapeProducts(url);
        }

        res.json(pageData);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Erro ao processar scrape" });
    }
});

app.post("/scrape-page", async (req, res) => {
    const pageUrl = req.body.query;

    try {
        const pageData = await scrapeProducts(pageUrl);
        res.json(pageData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Erro ao processar scrape da página" });
    }
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});