const form = document.querySelector("form");
const cards_container = document.querySelector("#cards");

const next_pageButton = document.querySelector("#nextPage");
const prev_pageButton = document.querySelector("#prevPage");

var next_pageUrl = null;
var prev_pageUrl = null;
atualizarBotoes();

function gerarCards(posts) {
    return posts.map(post => {

        const previous_price = post.previous_price ? `<p class="previous-price">R$ ${post.previous_price}</p>` : "";
        const discount = post.discount ? `<p class="discount">${post.discount}</p>` : "";


        return `<div class="card">
            <div class="img-container" data-index="0">
                ${post.images.map((image, i) => `
                    <img 
                        src="${image.url}" 
                        alt="Image ${image.id}" 
                        class="${i === 0 ? 'active' : ''}"
                    >
                `).join("")}

                ${post.images.length > 1 ? `
                    <button class="prev">‹</button>
                    <button class="next">›</button>
                ` : ""}
            </div>
            <div class="content">
                <h3 class="title"><a href="${post.url}" target="_blank">${post.title}</a></h3>
                ${discount}
                <div class="item-details">
                    ${previous_price}
                    <p class="current-price">R$ ${post.current_price}</p>
                    <p class="rating">${post.rating} ${post.rating_text}</p>
                </div>
            </div>
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

cards_container.addEventListener("click", function (e) {
    if (!e.target.matches(".prev, .next")) return;

    const container = e.target.closest(".img-container");
    const images = container.querySelectorAll("img");
    let index = parseInt(container.dataset.index, 10);

    images[index].classList.remove("active");

    if (e.target.classList.contains("next")) {
        index = (index + 1) % images.length;
    } else {
        index = (index - 1 + images.length) % images.length;
    }

    images[index].classList.add("active");
    container.dataset.index = index;
});