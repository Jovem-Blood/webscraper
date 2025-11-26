const form = document.querySelector("form");
const resultado = document.querySelector("#resultado");

const next_pageButton = document.querySelector("#nextPage");
const prev_pageButton = document.querySelector("#prevPage");

var next_pageUrl = null;
var prev_pageUrl = null;
atualizarBotoes();

async function carregarPagina(query) {
    const response = await fetch("/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
    });

    const data = await response.json();

    resultado.textContent = JSON.stringify(data, null, 2);
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

    await carregarPagina(next_pageUrl);
});

prev_pageButton.addEventListener("click", async () => {
    if (!prev_pageUrl) return;

    await carregarPagina(prev_pageUrl);
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const queryValue = document.querySelector("input[name='query']").value;
    await carregarPagina(queryValue);
});