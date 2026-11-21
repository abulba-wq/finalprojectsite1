const homePage = document.querySelector("#home-page");
const productPage = document.querySelector("#product-page");
const productCards = [...document.querySelectorAll(".product-card")];
const cartPage = document.querySelector("#cart-page");
const checkoutPage = document.querySelector("#checkout-page");
const favoritesPage = document.querySelector("#favorites-page");
const accountPage = document.querySelector("#account-page");
const masterclassPage = document.querySelector("#masterclass-page");
const deliveryPage = document.querySelector("#delivery-page");
let activeProduct = null;

const categoryPriority = ["Літні", "Солодкі", "Квіткові", "Свіжі", "Деревні"];
const productGrid = document.querySelector(".product-grid");

function getPrimaryCategory(card) {
    const categories = (card.dataset.category || "").split(/\s+/);
    return categoryPriority.find((category) => categories.includes(category)) || categories[0] || "Парфуми";
}

productCards
    .slice()
    .sort((a, b) => categoryPriority.indexOf(getPrimaryCategory(a)) - categoryPriority.indexOf(getPrimaryCategory(b)))
    .forEach((card) => productGrid.appendChild(card));

productCards.forEach((card) => {
    const categoryLabel = document.createElement("span");
    categoryLabel.className = "product-category";
    categoryLabel.textContent = getPrimaryCategory(card);
    card.insertBefore(categoryLabel, card.querySelector("h2"));
});
let cart = JSON.parse(localStorage.getItem("syntelle-cart") || "[]").map((item) => ({
    ...item,
    price: Number(item.price) || 5000
}));
let favorites = JSON.parse(localStorage.getItem("syntelle-favorites") || "[]");

function showPage(page) {
    [homePage, productPage, cartPage, checkoutPage, favoritesPage, accountPage, masterclassPage, deliveryPage].forEach((item) => item.classList.remove("active"));
    page.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function saveCart() {
    localStorage.setItem("syntelle-cart", JSON.stringify(cart));
    renderCart();
}

function cartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {
    const count = document.querySelector("#cart-count");
    count.textContent = cartCount();
    count.hidden = cartCount() === 0;

    const items = document.querySelector("#cart-items");
    if (cart.length === 0) {
        items.innerHTML = '<p class="empty-cart">Ваш кошик порожній.</p>';
    } else {
        items.innerHTML = cart.map((item, index) => `
            <article class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div><h2>${item.name}</h2><p>${item.price.toLocaleString("uk-UA")} грн</p></div>
                <div class="quantity">
                    <button type="button" data-quantity="-1" data-index="${index}" aria-label="Зменшити кількість">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-quantity="1" data-index="${index}" aria-label="Збільшити кількість">+</button>
                </div>
                <button type="button" class="remove-item" data-remove="${index}" aria-label="Видалити товар">×</button>
            </article>
        `).join("");
    }

    const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
    document.querySelector("#cart-total").textContent = `${total.toLocaleString("uk-UA")} грн`;
    document.querySelector("#checkout-total").textContent = `${total.toLocaleString("uk-UA")} грн`;
    document.querySelector("#checkout-items").innerHTML = cart.map((item) =>
        `<div class="checkout-item"><span>${item.name} × ${item.quantity}</span><strong>${(item.quantity * item.price).toLocaleString("uk-UA")} грн</strong></div>`
    ).join("");
}

renderCart();

document.querySelectorAll("[data-page='home']").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        showPage(homePage);
    });
});

document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelector(`#${button.dataset.scroll}`)?.scrollIntoView({ behavior: "smooth" });
    });
});

document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-category]").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        productCards.forEach((card) => {
            const categories = (card.dataset.category || "").split(/\s+/);
            card.hidden = button.dataset.category !== "all" && !categories.includes(button.dataset.category);
        });
        const grid = document.querySelector(".product-grid");
        grid.scrollTo({ left: 0, behavior: "smooth" });
        updateCatalogArrows();
    });
});

const catalogGrid = document.querySelector(".product-grid");
const catalogLeftArrow = document.querySelector(".arrow-left");
const catalogRightArrow = document.querySelector(".arrow-right");

function getCatalogStep() {
    const visibleCard = [...catalogGrid.querySelectorAll(".product-card:not([hidden])")][0];
    if (!visibleCard) return 0;
    const gap = parseFloat(getComputedStyle(catalogGrid).gap) || 0;
    return visibleCard.getBoundingClientRect().width + gap;
}

function updateCatalogArrows() {
    if (!catalogGrid || !catalogLeftArrow || !catalogRightArrow) return;
    const maxScroll = catalogGrid.scrollWidth - catalogGrid.clientWidth;
    catalogLeftArrow.disabled = catalogGrid.scrollLeft <= 1;
    catalogRightArrow.disabled = maxScroll <= 1 || catalogGrid.scrollLeft >= maxScroll - 1;
    catalogLeftArrow.setAttribute("aria-disabled", String(catalogLeftArrow.disabled));
    catalogRightArrow.setAttribute("aria-disabled", String(catalogRightArrow.disabled));
}

catalogLeftArrow?.addEventListener("click", () => {
    catalogGrid.scrollBy({ left: -getCatalogStep(), behavior: "smooth" });
});

catalogRightArrow?.addEventListener("click", () => {
    catalogGrid.scrollBy({ left: getCatalogStep(), behavior: "smooth" });
});

catalogGrid.addEventListener("scroll", updateCatalogArrows);
window.addEventListener("resize", updateCatalogArrows);
requestAnimationFrame(updateCatalogArrows);

document.addEventListener("keydown", (event) => {
    if (!homePage.classList.contains("active")) return;
    if (event.target.matches("input, textarea, select")) return;
    if (event.key === "ArrowLeft") {
        event.preventDefault();
        catalogGrid.scrollBy({ left: -getCatalogStep(), behavior: "smooth" });
    }
    if (event.key === "ArrowRight") {
        event.preventDefault();
        catalogGrid.scrollBy({ left: getCatalogStep(), behavior: "smooth" });
    }
});

function renderFavorites() {
    const count = document.querySelector("#favorites-count");
    count.textContent = favorites.length;
    count.hidden = favorites.length === 0;

    const grid = document.querySelector("#favorites-grid");
    if (!favorites.length) {
        grid.innerHTML = '<p class="empty-cart">У вас ще немає вподобаних товарів.</p>';
        return;
    }
    grid.innerHTML = favorites.map((item) => `
        <article class="favorite-card">
            <img src="${item.image}" alt="${item.name}" data-favorite-product="${item.name}">
            <h2>${item.name}</h2>
            <button type="button" data-remove-favorite="${item.name}">Прибрати</button>
        </article>
    `).join("");
}

productCards.forEach((card) => {
    const heart = card.querySelector(".heart");
    const name = card.dataset.name;
    if (favorites.some((item) => item.name === name)) {
        heart.classList.add("active");
        heart.textContent = "♥";
    }
    card.querySelector(".product-image").addEventListener("click", (event) => {
        if (!event.target.closest(".heart")) return;
        event.stopPropagation();
        const index = favorites.findIndex((item) => item.name === name);
        if (index >= 0) {
            favorites.splice(index, 1);
            heart.classList.remove("active");
            heart.textContent = "♡";
        } else {
            favorites.push({ name, image: card.querySelector("img").src });
            heart.classList.add("active");
            heart.textContent = "♥";
        }
        localStorage.setItem("syntelle-favorites", JSON.stringify(favorites));
        renderFavorites();
    });
});

renderFavorites();

document.querySelector("#favorites-button").addEventListener("click", () => {
    renderFavorites();
    showPage(favoritesPage);
});

document.querySelector("#account-button").addEventListener("click", () => showPage(accountPage));

const productDetails = [
    ["Об'єднані Арабські Емірати", "Східний, деревно-фужерний", "Пачулі, шафран, смола", "Золотистий, теплий, пряний", "Парфумована вода", "100 мл", "Елітна", "Унісекс"],
    ["Франція", "Деревно-фужерний", "Імбир, яблуко, альдегіди", "Амбракс, кедр, оливкове дерево", "Парфумована вода", "100 мл", "Елітна", "Чоловіча"],
    ["Італія", "Квітково-фруктовий", "Кавун, ківі, цикламін", "Мускус, лимонне дерево", "Туалетна вода", "100 мл", "Елітна", "Жіноча"],
    ["США", "Квітково-фруктовий", "Біла груша, гарденія", "Чорна ваніль, мускус", "Парфумована вода", "100 мл", "Елітна", "Жіноча"],
    ["Франція", "Східно-деревний", "Грейпфрут, бергамот, троянда", "Пачулі, сандал, мускус", "Парфумована вода", "100 мл", "Елітна", "Жіноча"],
    ["Німеччина", "Деревно-пряний", "Імбир, мандарин, манінка", "Шкіра, мускус", "Туалетна вода", "100 мл", "Елітна", "Чоловіча"],
    ["Франція", "Квітково-фруктовий", "Гранат, півонія, троянда", "Білий мускус", "Туалетна вода", "100 мл", "Елітна", "Жіноча"],
    ["Німеччина", "Фужерно-древесний", "Яблуко, цитруси, герань", "Сандал, кедр, мускус", "Туалетна вода", "100 мл", "Елітна", "Чоловіча"],
    ["Італія", "Квітково-фруктовий", "Квіткові та фруктові акорди", "Мускус, деревні ноти", "Парфумована вода", "100 мл", "Елітна", "Унісекс"],
    ["Іспанія", "Квітково-древесний мускусний", "Мускус, троянда, пачулі", "Пачулі, мускус, кедр", "Парфумована вода", "100 мл", "Елітна", "Жіноча"]
];

productCards.forEach((card) => {
    card.querySelector(".product-image").addEventListener("dblclick", () => {
        return;
    });
});

document.querySelectorAll("[data-product]").forEach((button) => {
    button.addEventListener("click", (event) => {
        if (event.detail !== 1 || event.target.closest(".heart")) return;
        const card = button.closest(".product-card");
        const image = button.querySelector("img");
        const price = Number(card.dataset.price);
        document.querySelector("#detail-image").src = image.src;
        document.querySelector("#detail-image").alt = card.dataset.name;
        document.querySelector("#detail-name").textContent = card.dataset.name;
        document.querySelector("#detail-price").textContent = `${price.toLocaleString("uk-UA")} грн`;
        const detailCopy = document.querySelector(".product-copy");
        const description = card.dataset.description;
        if (detailCopy && description) {
            const paragraphs = detailCopy.querySelectorAll("p");
            if (paragraphs[0]) paragraphs[0].innerHTML = `<strong>${description}</strong>`;
            if (paragraphs[1]) paragraphs[1].textContent = "Аромат поступово розкривається на шкірі, поєднуючи характерні верхні, серцеві та базові ноти.";
        }
        const details = productDetails[Number(button.dataset.product)];
        if (details) {
            const values = document.querySelectorAll(".product-specs dd");
            const country = values[0];
            if (country) {
                const mapped = [
                    details[0], details[1], details[2], details[3],
                    details[1], "Парфумована вода", details[5], details[6],
                    details[7], `${details[1]}, ${details[3]}`, "Для повсякденного та вечірнього використання"
                ];
                values.forEach((dd, index) => {
                    dd.textContent = mapped[index] || "";
                });
            }
        }
        activeProduct = { name: card.dataset.name, image: image.src, price };
        showPage(productPage);
    });
});

document.querySelector("#close-product").addEventListener("click", () => {
    showPage(homePage);
    document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#add-to-cart").addEventListener("click", () => {
    if (!activeProduct) return;
    const existing = cart.find((item) => item.name === activeProduct.name);
    if (existing) existing.quantity += 1;
    else cart.push({ ...activeProduct, quantity: 1 });
    saveCart();
});

document.querySelector("#cart-button").addEventListener("click", () => showPage(cartPage));

document.querySelector("#cart-items").addEventListener("click", (event) => {
    const quantityButton = event.target.closest("[data-quantity]");
    const removeButton = event.target.closest("[data-remove]");
    if (quantityButton) {
        const index = Number(quantityButton.dataset.index);
        cart[index].quantity += Number(quantityButton.dataset.quantity);
        if (cart[index].quantity < 1) cart.splice(index, 1);
        saveCart();
    }
    if (removeButton) {
        cart.splice(Number(removeButton.dataset.remove), 1);
        saveCart();
    }
});

document.querySelector("#checkout-button").addEventListener("click", () => {
    if (cart.length) showPage(checkoutPage);
});

document.querySelector("#checkout-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    cart = [];
    saveCart();
    event.currentTarget.reset();
    alert("Дякуємо! Ваше замовлення прийнято.");
    showPage(homePage);
});

document.querySelector(".search").addEventListener("submit", (event) => {
    event.preventDefault();
    const value = event.currentTarget.querySelector("input").value.trim().toLowerCase();
    if (!value) return;
    const match = productCards.find((card) => card.dataset.name.toLowerCase().includes(value));
    if (match) {
        match.scrollIntoView({ behavior: "smooth", block: "center" });
        match.querySelector(".product-image").animate(
            [{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
            { duration: 700 }
        );
    }
});

document.querySelectorAll(".nav-button, .footer-links a").forEach((button) => {
    button.addEventListener("click", (event) => {
        event.preventDefault();
        if (button.textContent.includes("Каталог") || button.textContent.includes("Головна")) {
            showPage(homePage);
            document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth" });
        }
        if (button.textContent.includes("Кошик")) {
            showPage(cartPage);
        }
        if (button.textContent.includes("Майстер-клас")) {
            showPage(masterclassPage);
        }
        if (button.textContent.includes("Доставка")) {
            showPage(deliveryPage);
        }
        if (button.textContent.includes("Вибране")) {
            renderFavorites();
            showPage(favoritesPage);
        }
    });
});

document.querySelector("#favorites-grid").addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-favorite]");
    if (removeButton) {
        favorites = favorites.filter((item) => item.name !== removeButton.dataset.removeFavorite);
        localStorage.setItem("syntelle-favorites", JSON.stringify(favorites));
        renderFavorites();
        productCards.forEach((card) => {
            if (card.dataset.name === removeButton.dataset.removeFavorite) {
                const heart = card.querySelector(".heart");
                heart.classList.remove("active");
                heart.textContent = "♡";
            }
        });
    }
});

document.querySelector("#account-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    localStorage.setItem("syntelle-account", JSON.stringify({
        name: data.get("name"),
        email: data.get("email")
    }));
    document.querySelector("#account-message").textContent = `Вітаємо, ${data.get("name")}! Акаунт створено.`;
    form.reset();
});

document.querySelector("#masterclass-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    localStorage.setItem("syntelle-masterclass", JSON.stringify({
        name: data.get("name"),
        phone: data.get("phone"),
        date: data.get("date")
    }));
    document.querySelector("#masterclass-message").textContent =
        `Дякуємо, ${data.get("name")}! Ви записані на майстер-клас.`;
    form.reset();
});