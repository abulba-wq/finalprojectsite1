const homePage = document.querySelector("#home-page");
const productPage = document.querySelector("#product-page");
const productCards = [...document.querySelectorAll(".product-card")];
const cartPage = document.querySelector("#cart-page");
const checkoutPage = document.querySelector("#checkout-page");
const favoritesPage = document.querySelector("#favorites-page");
const accountPage = document.querySelector("#account-page");
const masterclassPage = document.querySelector("#masterclass-page");
let activeProduct = null;
let cart = JSON.parse(localStorage.getItem("syntelle-cart") || "[]");
let favorites = JSON.parse(localStorage.getItem("syntelle-favorites") || "[]");

function showPage(page) {
    [homePage, productPage, cartPage, checkoutPage, favoritesPage, accountPage, masterclassPage].forEach((item) => item.classList.remove("active"));
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
                <div><h2>${item.name}</h2><p>5000 грн</p></div>
                <div class="quantity">
                    <button type="button" data-quantity="-1" data-index="${index}" aria-label="Зменшити кількість">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-quantity="1" data-index="${index}" aria-label="Збільшити кількість">+</button>
                </div>
                <button type="button" class="remove-item" data-remove="${index}" aria-label="Видалити товар">×</button>
            </article>
        `).join("");
    }

    const total = cart.reduce((sum, item) => sum + item.quantity * 5000, 0);
    document.querySelector("#cart-total").textContent = `${total.toLocaleString("uk-UA")} грн`;
    document.querySelector("#checkout-total").textContent = `${total.toLocaleString("uk-UA")} грн`;
    document.querySelector("#checkout-items").innerHTML = cart.map((item) =>
        `<div class="checkout-item"><span>${item.name} × ${item.quantity}</span><strong>${(item.quantity * 5000).toLocaleString("uk-UA")} грн</strong></div>`
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
            card.hidden = button.dataset.category !== "all" && card.dataset.name !== button.dataset.category;
        });
    });
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
        document.querySelector("#detail-image").src = image.src;
        document.querySelector("#detail-image").alt = card.dataset.name;
        document.querySelector("#detail-name").textContent = card.dataset.name;
        activeProduct = { name: card.dataset.name, image: image.src };
        showPage(productPage);
    });
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