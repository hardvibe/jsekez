document.addEventListener("DOMContentLoaded", () => {
    showCatalog(); // Открываем страницу регистрации по умолчанию
    loadCategories(); // Загрузка категорий товаров
    fetchProducts(); // Загрузка списка товаров из API
    showNav();
});

function showReg() {
    document.getElementById('reg').classList.add('active');
    document.getElementById('login').classList.remove('active');
    document.getElementById('catalog').classList.remove('active');
    document.getElementById('cart').classList.remove('active');
    document.getElementById('nav').classList.remove('active');
}

function showLogin() {
    document.getElementById('reg').classList.remove('active');
    document.getElementById('login').classList.add('active');
    document.getElementById('catalog').classList.remove('active');
    document.getElementById('cart').classList.remove('active');
}

function showCatalog() {
    document.getElementById('reg').classList.remove('active');
    document.getElementById('login').classList.remove('active');
    document.getElementById('catalog').classList.add('active');
    document.getElementById('cart').classList.remove('active');
}

function showCart() {
    document.getElementById('reg').classList.remove('active');
    document.getElementById('login').classList.remove('active');
    document.getElementById('catalog').classList.remove('active');
    document.getElementById('cart').classList.add('active');
    loadCart(); 
}



function registerUser() {
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
        showNotification('Неправильный email');
        return;
    }
    const passwordReg = /^(?=.*[A-Z]).{8,}$/;
    if (!passwordReg.test(password)) {
        showNotification('8 символов и одну заглавную');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.email === email)) {
        showNotification('Пользователь с таким email уже зарегистрирован.');
        return;
    }

    if (email && password) {
        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('Регистрация успешна');
        showLogin();
    } else {
        showNotification('Заполните все поля');
    }
}

function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        showNotification('Вход успешен!');
        localStorage.setItem('currentUser', email); 
        localStorage.setItem('logged', 'true'); 
        showCatalog();
        showNav(); 
    } else {
        showNotification('Неверный email или пароль.');
    }
}
function logout() {
    localStorage.removeItem('currentUser'); 
    localStorage.removeItem('logged');  
    showNav(); 
    showLogin();
}

function showNav() {
    const logged = localStorage.getItem('logged') === 'true';
    document.getElementById('login-button').style.display = logged ? 'none' : 'block';
    document.getElementById('profile-icon').style.display = logged ? 'block' : 'none';
    document.getElementById('cart-button').style.display = logged ? 'block' : 'none';
    document.getElementById('logout-button').style.display = logged ? 'block' : 'none';
}


async function fetchProducts() {
    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();
    localStorage.setItem('products', JSON.stringify(products));
    displayProducts(products);
}

function loadCategories() {
    const products = JSON.parse(localStorage.getItem('products')) || []
    const categories = [...new Set(products.map(product => product.category))]
    const categoryFilter = document.getElementById('category-filter')
    categoryFilter.innerHTML = '<option value="">Все категории</option>'
    categories.forEach(category => {
        const option = document.createElement('option')
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function displayProducts(products) {
    const productList = document.getElementById('product-list')
    productList.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('product');
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p class = "product-text">${product.description}</p>
            <p class = "product-price">Цена: ${product.price} USD</p>
            <button onclick="addToCart(${product.id})">Добавить в корзину</button>
        `;
        productList.appendChild(productElement);
    });
}

function filterProducts() {
    const search = document.getElementById('search').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const sortPrice = document.getElementById('sort-price').value;
    let products = JSON.parse(localStorage.getItem('products')) || [];

    if (category) {
        products = products.filter(product => product.category === category);
    }

    if (search) {
        products = products.filter(product => product.title.toLowerCase().includes(search));
    }

    // Сортировка по цене
    if (sortPrice === 'asc') {
        products.sort((a, b) => a.price - b.price);
    } else if (sortPrice === 'desc') {
        products.sort((a, b) => b.price - a.price);
    }

    if (products.length === 0) {
        document.getElementById('product-list').innerHTML = '<p>Ничего не найдено</p>';
    } else {
        displayProducts(products);
    }
}


function addToCart(productId) {
    if (!localStorage.getItem('logged')) {
        showNotification('Войдите в аккаунт, чтобы добавить товар в корзину.');
        showLogin();
        return;
    }

    const currentUser = localStorage.getItem('currentUser');
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);

    if (!product) return;

    const bird = document.createElement('div');
    bird.classList.add('fly-bird');
    bird.innerHTML = '🕊️';  
    document.body.appendChild(bird);

    const buttonElement = document.querySelector(`button[onclick="addToCart(${product.id})"]`);
    const rect = buttonElement.getBoundingClientRect();
    bird.style.left = `${rect.left + rect.width / 2}px`;
    bird.style.top = `${rect.top + window.scrollY}px`; 

    setTimeout(() => {
        bird.style.transform = 'translate(-400px, -1000px) scale(1.5)'; // Птичка взлетает
        bird.style.opacity = '0';
    }, 50);

    bird.addEventListener('animationend', () => {
        bird.remove();
    });
    let cart = JSON.parse(localStorage.getItem(`cart_${currentUser}`)) || [];
    cart.push(product);
    localStorage.setItem(`cart_${currentUser}`, JSON.stringify(cart));

    showNotification(`${product.title} добавлен в корзину!`);
}


function loadCart() {
    const currentUser = localStorage.getItem('currentUser');
    const cart = JSON.parse(localStorage.getItem(`cart_${currentUser}`)) || [];
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = '';

    if (cart.length === 0) {
        cartList.innerHTML = '<p style="font-size: 48px;">Корзина пуста</p>';
        document.getElementById('total-price').textContent = 'ИТОГО: 0 USD';
        return;
    }

    const itemCounts = {};
    cart.forEach(product => {
        if (!itemCounts[product.id]) {
            itemCounts[product.id] = { ...product, count: 0 };
        }
        itemCounts[product.id].count++;
    });

    let totalPrice = 0;

    for (const productId in itemCounts) {
        const product = itemCounts[productId];
        const itemTotalPrice = product.price * product.count;
        totalPrice += itemTotalPrice;

        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p id="total-item-price-${productId}">Итого за ${product.count} шт.: ${itemTotalPrice.toFixed(2)} USD</p>
            <div class="cart-item-btn">
                <button onclick="updateCart('${productId}', -1)">-</button>
                <span>${product.count}</span>
                <button onclick="updateCart('${productId}', 1)">+</button>
            </div>
        `;
        cartList.appendChild(cartItem);
    }

    document.getElementById('total-price').textContent = `ИТОГО: ${totalPrice.toFixed(2)} USD`;
}


function updateCart(productId, change) {
    const currentUser = localStorage.getItem('currentUser');
    let cart = JSON.parse(localStorage.getItem(`cart_${currentUser}`)) || [];
    
    if (change > 0) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id == productId);
        if (product) {
            cart.push(product);
        }
    } else {
        const productIndex = cart.findIndex(product => product.id == productId);
        if (productIndex > -1) {
            cart.splice(productIndex, 1); 
        }
    }

    localStorage.setItem(`cart_${currentUser}`, JSON.stringify(cart));
    loadCart(); 
}



function clearCart() {
    const currentUser = localStorage.getItem('currentUser');
    localStorage.removeItem(`cart_${currentUser}`); 
    loadCart();
    showNotification('Корзина очищена!');
}
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000)
}
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle').checked = true; 
    }
});

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

function showModal(type) {
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modal-text');
    
    if (type === 'about') {
        modalText.textContent = 'КРУТАЯ КОМПАНИЯ КРУТАЯ КОМПАНИЯ КРУТАЯ КОМПАНИЯ КРУТАЯ КОМПАНИЯ КРУТАЯ КОМПАНИЯ КРУТАЯ КОМПАНИЯ КРУТАЯ КОМПАНИЯ КРУТАЯ КОМПАНИЯ КРУТАЯ КОМПАНИЯ КРУТАЯ КОМПАНИЯ КРУТАЯ КОМПАНИЯ ';
    } else if (type === 'contacts') {
        modalText.textContent = 'Контакты: Телефон: +777777777777 Email: КРУТАЯКОМПАНИЯ@krutoi.com';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// function showProfile(){
//     const profileChange = 
// }
