let cart = [];
let modalQt = 1;
let modalKey = 0;

const c = (el) => document.querySelector(el);
const cs = (el) => document.querySelectorAll(el);

// ─── Listagem das pizzas ───────────────────────────────────────────────
pizzaJson.map((item, index) => {
    let pizzaItem = c('.models .pizza-item').cloneNode(true);

    pizzaItem.setAttribute('data-key', index);
    pizzaItem.querySelector('.pizza-item--img img').src = item.img;
    pizzaItem.querySelector('.pizza-item--price').textContent = `R$ ${item.prices[2].toFixed(2).replace('.', ',')}`;
    pizzaItem.querySelector('.pizza-item--name').textContent = item.name;
    pizzaItem.querySelector('.pizza-item--desc').textContent = item.description;

    pizzaItem.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();

        let key = parseInt(e.target.closest('.pizza-item').getAttribute('data-key'));
        modalQt = 1;
        modalKey = key;

        c('.pizzaBig img').src = pizzaJson[key].img;
        c('.pizzaInfo h2').textContent = pizzaJson[key].name;
        c('.pizzaInfo--desc').textContent = pizzaJson[key].description;

        // Remove selected de todos os tamanhos
        cs('.pizzaInfo--size').forEach((size, sizeIndex) => {
            size.classList.remove('selected');
            if (sizeIndex === 2) size.classList.add('selected');
            size.querySelector('.size-weight').textContent = pizzaJson[key].sizes[sizeIndex];
        });

        updateModalPrice();
        c('.pizzaInfo--qt').textContent = modalQt;

        c('.pizzaWindowArea').style.opacity = 0;
        c('.pizzaWindowArea').style.display = 'flex';
        setTimeout(() => {
            c('.pizzaWindowArea').style.opacity = 1;
        }, 50);
    });

    c('.pizza-area').append(pizzaItem);
});

// ─── Atualiza o preço no modal conforme tamanho/qtd ───────────────────
function updateModalPrice() {
    let sizeIndex = parseInt(c('.pizzaInfo--size.selected').getAttribute('data-key'));
    let price = pizzaJson[modalKey].prices[sizeIndex];
    c('.pizzaInfo--actualPrice').textContent = `R$ ${(price * modalQt).toFixed(2).replace('.', ',')}`;
}

// ─── Eventos do MODAL ─────────────────────────────────────────────────
function closeModal() {
    c('.pizzaWindowArea').style.opacity = 0;
    setTimeout(() => {
        c('.pizzaWindowArea').style.display = 'none';
    }, 400);
}

cs('.pizzaInfo--cancelButton, .pizzaInfo--cancelMobileButton').forEach((item) => {
    item.addEventListener('click', closeModal);
});

// Fechar clicando fora do modal
c('.pizzaWindowArea').addEventListener('click', (e) => {
    if (e.target === c('.pizzaWindowArea')) closeModal();
});

c('.pizzaInfo--qtmenos').addEventListener('click', () => {
    if (modalQt > 1) {
        modalQt--;
        c('.pizzaInfo--qt').textContent = modalQt;
        updateModalPrice();
    }
});

c('.pizzaInfo--qtmais').addEventListener('click', () => {
    modalQt++;
    c('.pizzaInfo--qt').textContent = modalQt;
    updateModalPrice();
});

cs('.pizzaInfo--size').forEach((size) => {
    size.addEventListener('click', () => {
        c('.pizzaInfo--size.selected').classList.remove('selected');
        size.classList.add('selected');
        updateModalPrice();
    });
});

c('.pizzaInfo--addButton').addEventListener('click', () => {
    let sizeIndex = parseInt(c('.pizzaInfo--size.selected').getAttribute('data-key'));
    let identifier = pizzaJson[modalKey].id + '@' + sizeIndex;
    let key = cart.findIndex((item) => item.identifier === identifier);

    if (key > -1) {
        cart[key].qt += modalQt;
    } else {
        cart.push({
            identifier,
            id: pizzaJson[modalKey].id,
            size: sizeIndex,
            qt: modalQt
        });
    }

    updateCart();
    closeModal();
    showAddedFeedback();
});

function showAddedFeedback() {
    const btn = c('.menu-openner');
    btn.classList.add('pulse');
    setTimeout(() => btn.classList.remove('pulse'), 600);
}

// ─── Carrinho lateral ─────────────────────────────────────────────────
c('.menu-openner').addEventListener('click', () => {
    if (cart.length > 0) {
        c('aside').style.left = '0';
    }
});

c('.menu-closer').addEventListener('click', () => {
    c('aside').style.left = '100vw';
});

function updateCart() {
    const countEl = c('.menu-openner span');
    const totalItems = cart.reduce((acc, item) => acc + item.qt, 0);
    countEl.textContent = totalItems;

    if (cart.length > 0) {
        c('aside').classList.add('show');
        c('.cart').innerHTML = '';

        let subtotal = 0;

        for (let i in cart) {
            let pizzaItem = pizzaJson.find(item => item.id === cart[i].id);
            let itemPrice = pizzaItem.prices[cart[i].size];
            subtotal += itemPrice * cart[i].qt;

            let cartItem = c('.models .cart--item').cloneNode(true);

            const sizeLabels = ['P', 'M', 'G'];
            let pizzaName = `${pizzaItem.name} (${sizeLabels[cart[i].size]})`;

            cartItem.querySelector('img').src = pizzaItem.img;
            cartItem.querySelector('.cart--item-nome').textContent = pizzaName;
            cartItem.querySelector('.cart--item--qt').textContent = cart[i].qt;
            cartItem.querySelector('.cart--item-price').textContent =
                `R$ ${(itemPrice * cart[i].qt).toFixed(2).replace('.', ',')}`;

            // ✅ BUG CORRIGIDO: era `cart[i] > 1`, deve ser `cart[i].qt > 1`
            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', () => {
                if (cart[i].qt > 1) {
                    cart[i].qt--;
                } else {
                    cart.splice(i, 1);
                }
                updateCart();
            });

            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', () => {
                cart[i].qt++;
                updateCart();
            });

            c('.cart').append(cartItem);
        }

        let desconto = subtotal * 0.1;
        let total = subtotal - desconto;

        c('.subtotal span:last-child').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        c('.desconto span:last-child').textContent = `-R$ ${desconto.toFixed(2).replace('.', ',')}`;
        c('.total span:last-child').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    } else {
        c('aside').classList.remove('show');
        c('aside').style.left = '100vw';
    }
}

// ─── Finalizar compra ─────────────────────────────────────────────────
c('.cart--finalizar').addEventListener('click', () => {
    if (cart.length === 0) return;

    // Preenche resumo
    c('.order-summary').innerHTML = '';
    cart.forEach(item => {
        const pizza = pizzaJson.find(p => p.id === item.id);
        const sizeLabels = ['Pequena', 'Média', 'Grande'];
        const li = document.createElement('li');
        li.textContent = `${item.qt}x ${pizza.name} (${sizeLabels[item.size]})`;
        c('.order-summary').append(li);
    });

    const subtotal = cart.reduce((acc, item) => {
        const pizza = pizzaJson.find(p => p.id === item.id);
        return acc + pizza.prices[item.size] * item.qt;
    }, 0);
    const total = subtotal * 0.9;
    c('.order-total-value').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    goToStep(1);
    c('.order-modal').style.display = 'flex';
    setTimeout(() => c('.order-modal').style.opacity = 1, 50);
});

function goToStep(n) {
    cs('.order-step').forEach(s => s.classList.add('hidden'));
    c(`#step-${n}`).classList.remove('hidden');
}

// Botões "Continuar"
cs('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
        const next = parseInt(btn.getAttribute('data-next'));
        if (next === 3) {
            const name = c('#field-name').value.trim();
            const phone = c('#field-phone').value.trim();
            const address = c('#field-address').value.trim();
            if (!name || !phone || !address) {
                showFieldError('Preencha nome, telefone e endereço!');
                return;
            }
        }
        goToStep(next);
    });
});

// Botões "Voltar"
cs('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
        goToStep(parseInt(btn.getAttribute('data-back')));
    });
});

// Mostrar campo de troco ao selecionar "dinheiro"
cs('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'dinheiro') {
            c('.troco-area').classList.remove('hidden');
        } else {
            c('.troco-area').classList.add('hidden');
        }
    });
});

// Cancelar
c('.order-modal--close').addEventListener('click', () => closeOrderModal());

// Confirmar pedido final
c('.order-modal--confirm').addEventListener('click', () => {
    const payment = document.querySelector('input[name="payment"]:checked');
    if (!payment) {
        showFieldError('Selecione uma forma de pagamento!');
        return;
    }

    const payLabels = { dinheiro: '💵 Dinheiro', pix: '📱 Pix', credito: '💳 Crédito', debito: '🏦 Débito' };
    const name = c('#field-name').value.trim();
    c('.success-detail').innerHTML = `
        <div class="success-info"><span>👤</span> ${name}</div>
        <div class="success-info"><span>📍</span> ${c('#field-address').value.trim()}</div>
        <div class="success-info"><span>💰</span> ${payLabels[payment.value]}</div>
    `;

    goToStep(4);
    cart = [];
    updateCart();
    c('aside').style.left = '100vw';
});

// Fechar após sucesso
c('.btn-done').addEventListener('click', () => closeOrderModal());

function closeOrderModal() {
    c('.order-modal').style.opacity = 0;
    setTimeout(() => {
        c('.order-modal').style.display = 'none';
        ['#field-name','#field-phone','#field-address','#field-obs','#field-troco'].forEach(f => {
            if (c(f)) c(f).value = '';
        });
        cs('input[name="payment"]').forEach(r => r.checked = false);
        c('.troco-area').classList.add('hidden');
    }, 400);
}

function showFieldError(msg) {
    let err = c('.field-error');
    if (err) err.remove();
    err = document.createElement('p');
    err.className = 'field-error';
    c('.order-step:not(.hidden) .order-modal--actions').before(err);
    err.textContent = msg;
    setTimeout(() => err && err.remove(), 3000);
}