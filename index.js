const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const PORT = 3000;

app.post("/scrape", async (req, res) => {
    const query = req.body.query;

    try {
        if (query.startsWith("http")) {
            const post = await scrapePost(query);
            return res.json({ type: "single", data: post });
        }

        const searchUrl = `https://lista.mercadolivre.com.br/${encodeURIComponent(query)}`;
        const posts = await scrapePosts(searchUrl);
        return res.json({ type: "list", data: posts });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Erro ao processar scrape" });
    }
});

async function scrapePost(url) {
    const response = await axios(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const jsonRaw = $('#__PRELOADED_STATE__').html();

    if (!jsonRaw) {
        console.log("Script não encontrado!");
        return;
    }

    const data = JSON.parse(jsonRaw);

    const title = data.pageState.initialState.components.header.title;
    const rating = data.pageState.initialState.components.header.reviews.rating
    const original_price = data.pageState.initialState.components.price.price.original_value;
    const price = data.pageState.initialState.components.price.price.value;

    // return {data}
    return {title, rating, original_price, price}
}

async function scrapePosts(url, posts = []) {
    const response = await axios(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const jsonRaw = $('#__PRELOADED_STATE__').html();

    if (!jsonRaw) {
        console.log("Script não encontrado!");
        return;
    }
    
    const data = JSON.parse(jsonRaw);

    let results = data.pageState.initialState?.results ?? [];

    results.forEach(item => {
        if (!item.polycard || !item.polycard.components || !item.state == 'VISIBLE') return;

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

            if (component?.type === "title" && component?.title) {
                card.title = component.title?.text ?? null;
            }

            if (component?.type === "review_compacted" && component?.review_compacted) {
                let values = component.review_compacted?.values ?? [];

                let rating = values.find(v => v.key === "label");
                let sold = values.find(v => v.key === "label2");

                card.rating = rating ? rating.label.text : null;
                card.rating_text = sold ? sold.label.text : null;
            }

            if (component?.type === "price" && component?.price) {

                const p = component?.price;

                card.current_price = p.current_price?.value ?? null;
                card.previous_price = p.previous_price?.value ?? null;

                card.discount = p.discount_label?.text ?? null;
            }

        });

        posts.push(card);
    });

    const nextPage = data.pageState.initialState?.pagination?.next_page?.url ?? null;

    if (nextPage) {
        return scrapePosts(nextPage, posts);
    }

    return posts;
}


app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});