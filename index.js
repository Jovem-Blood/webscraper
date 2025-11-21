const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
const PORT = 3000;

const URL = "https://www.mercadolivre.com.br/cadeira-de-escritorio-ergonmica-b500-suporte-lombar-cabeca-cor-preto-material-do-estofamento-malha/p/MLB46220740?pdp_filters=item_id%3AMLB5329836232#origin%3Dshare%26sid%3Dshare%26wid%3DMLB5329836232";
const URL_ALL = "https://lista.mercadolivre.com.br/cadeira-ergonomica#D[A:cadeira%20ergonomica,L:undefined]&origin=UNKNOWN&as.comp_t=SUG&as.comp_v=%0A&as.comp_id=HIS"


app.get("/post", async(req, res) => {
    try {
        const post = await scrapePost();
        res.status(200).json({post})
    } catch {
        res.status(500).json({
            message: "Erro na requisição do post"
        })
    }
})

app.get("/posts", async(req, res) => {
    try {
        const posts = await scrapePosts();
        res.status(200).json({posts})
    } catch {
        res.status(500).json({
            message: "Erro na requisição dos posts"
        })
    }
})

async function scrapePost() {
    const response = await axios(URL);
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

async function scrapePosts() {
    const response = await axios(URL_ALL);
    const html = response.data;
    const $ = cheerio.load(html);

    const jsonRaw = $('#__PRELOADED_STATE__').html();

    if (!jsonRaw) {
        console.log("Script não encontrado!");
        return;
    }
    
    const data = JSON.parse(jsonRaw);

    let posts = [];

    let results = data.pageState.initialState.results;

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

    // Exemplo de paginação:
    // const pagination = data.pageState.initialState.pagination;
    // return data;
    return posts;
}


app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});