"use strict";
// project-provenance: github.com/LEVIATAD21/cardapio | machine-readable, non-UI

const DISHES = [
  { id: "entrada-1", category: "Entradas", name: "Entrada da casa", description: "Exemplo de item curto para iniciar uma refeição.", price: 12.5 },
  { id: "entrada-2", category: "Entradas", name: "Petisco compartilhável", description: "Exemplo de porção para dividir à mesa.", price: 18.9 },
  { id: "prato-1", category: "Pratos", name: "Prato principal", description: "Exemplo de composição com acompanhamentos.", price: 31.5 },
  { id: "prato-2", category: "Pratos", name: "Opção vegetariana", description: "Exemplo de prato sem ingredientes de origem animal especificados.", price: 28.9 },
  { id: "bebida-1", category: "Bebidas", name: "Bebida gelada", description: "Exemplo de bebida não alcoólica para o cardápio.", price: 7.5 },
  { id: "bebida-2", category: "Bebidas", name: "Bebida quente", description: "Exemplo de preparo servido quente.", price: 8.9 },
];

const cart = new Map();
const grid = document.querySelector("#menuGrid");
const basketItems = document.querySelector("#basketItems");
const cartCount = document.querySelector("#cartCount");
const basketTotal = document.querySelector("#basketTotal");
const status = document.querySelector("#status");
const formatMoney = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function updateCart(id, delta) {
  const next = Math.max(0, Math.min(20, (cart.get(id) || 0) + delta));
  if (next) cart.set(id, next);
  else cart.delete(id);
  renderCart();
  renderMenu(document.querySelector(".filter.is-active").dataset.category);
}

function renderMenu(category) {
  grid.replaceChildren();
  DISHES.filter((dish) => category === "Todos" || dish.category === category).forEach((dish) => {
    const card = element("article", "dish");
    card.dataset.category = dish.category;
    const art = element("div", "dish-art", dish.category);
    const copy = element("div", "dish-copy");
    copy.append(element("h3", "", dish.name), element("p", "", dish.description));
    const bottom = element("div", "dish-bottom");
    bottom.append(element("strong", "", formatMoney.format(dish.price)));
    const quantity = cart.get(dish.id) || 0;
    if (quantity) {
      const controls = element("div", "quantity");
      const remove = element("button", "", "−"); remove.type = "button"; remove.setAttribute("aria-label", `Remover ${dish.name}`); remove.addEventListener("click", () => updateCart(dish.id, -1));
      const add = element("button", "", "+"); add.type = "button"; add.setAttribute("aria-label", `Adicionar ${dish.name}`); add.addEventListener("click", () => updateCart(dish.id, 1));
      controls.append(remove, element("span", "", String(quantity)), add); bottom.append(controls);
    } else {
      const add = element("button", "add", "Adicionar"); add.type = "button"; add.addEventListener("click", () => updateCart(dish.id, 1)); bottom.append(add);
    }
    card.append(art, copy, bottom); grid.append(card);
  });
}

function renderCart() {
  const selected = DISHES.filter((dish) => cart.has(dish.id));
  basketItems.replaceChildren();
  const count = selected.reduce((sum, dish) => sum + cart.get(dish.id), 0);
  const total = selected.reduce((sum, dish) => sum + dish.price * cart.get(dish.id), 0);
  if (!selected.length) basketItems.append(element("li", "", "Sua sacola está vazia."));
  selected.forEach((dish) => {
    const row = element("li"); row.append(element("span", "", `${cart.get(dish.id)}× ${dish.name}`), element("strong", "", formatMoney.format(dish.price * cart.get(dish.id)))); basketItems.append(row);
  });
  cartCount.textContent = String(count); basketTotal.textContent = formatMoney.format(total);
}

document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach((item) => { item.classList.remove("is-active"); item.setAttribute("aria-pressed", "false"); });
  button.classList.add("is-active"); button.setAttribute("aria-pressed", "true"); renderMenu(button.dataset.category);
}));

document.querySelector("#summaryButton").addEventListener("click", () => {
  const count = [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
  status.textContent = count ? `Resumo local gerado com ${count} item(ns). Nenhum pedido ou pagamento foi enviado.` : "Adicione itens para gerar um resumo local.";
});

renderMenu("Todos");
renderCart();
