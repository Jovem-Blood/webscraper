const form = document.querySelector("form");
const cards_container = document.querySelector("#cards");

const next_pageButton = document.querySelector("#nextPage");
const prev_pageButton = document.querySelector("#prevPage");

var next_pageUrl = null;
var prev_pageUrl = null;
atualizarBotoes();

function gerarCards(posts) {
    return posts.map(post => {
        return `<div class="card">
            ${post.images.map(image => `<img src="${image.url}" alt="Image ${image.id}">`).join("")}
            <h3><a href="${post.url}" target="_blank">${post.title}</a></h3>
            <p>Avaliação: ${post.rating} (${post.rating_text})</p>
            <p>Preço Atual: R$ ${post.current_price}</p>
            <p>Preço Anterior: R$ ${post.previous_price}</p>
            <p>Desconto: ${post.discount}</p>
        </div>`;        
    })
}

async function carregarPagina(query, rota) {
    const response = await fetch(rota, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
    });

    const data = await response.json();

    const cardsHTML = gerarCards(data.posts).join("");
    cards_container.innerHTML = cardsHTML;
    next_pageUrl = data.next_page ?? null;
    prev_pageUrl = data.prev_page ?? null;
    atualizarBotoes();
}

function atualizarBotoes() {
    next_pageButton.disabled = !next_pageUrl;
    prev_pageButton.disabled = !prev_pageUrl;
}

next_pageButton.addEventListener("click", async () => {
    if (!next_pageUrl) return;

    await carregarPagina(next_pageUrl, "/scrape-page");
});

prev_pageButton.addEventListener("click", async () => {
    if (!prev_pageUrl) return;

    await carregarPagina(prev_pageUrl, "/scrape-page");
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const queryValue = document.querySelector("input[name='query']").value;
    await carregarPagina(queryValue, "/scrape");
});