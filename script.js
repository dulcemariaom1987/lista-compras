// ==========================================
// VARIABLES GLOBALES
// ==========================================
let shoppingList = [];
let currentFilter = 'all';
let editingId = null;

// Elementos del DOM
const addItemForm = document.getElementById('addItemForm');
const itemInput = document.getElementById('itemInput');
const quantityInput = document.getElementById('quantityInput');
const shoppingListEl = document.getElementById('shoppingList');
const emptyState = document.getElementById('emptyState');
const totalItems = document.getElementById('totalItems');
const purchasedItems = document.getElementById('purchasedItems');
const pendingItems = document.getElementById('pendingItems');
const clearPurchasedBtn = document.getElementById('clearPurchased');
const deleteAllBtn = document.getElementById('deleteAll');
const filterBtns = document.querySelectorAll('.filter-btn');

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderList();
    setupEventListeners();
});

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    // Agregar item
    addItemForm.addEventListener('submit', handleAddItem);

    // Filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderList();
        });
    });

    // Limpiar comprados
    clearPurchasedBtn.addEventListener('click', clearPurchased);

    // Eliminar todos
    deleteAllBtn.addEventListener('click', deleteAll);
}

// ==========================================
// AGREGAR O EDITAR ITEM
// ==========================================
function handleAddItem(e) {
    e.preventDefault();

    const text = itemInput.value.trim();
    const quantity = parseInt(quantityInput.value) || 1;

    if (!text) return;

    if (editingId !== null) {
        // Modo edición
        const item = shoppingList.find(i => i.id === editingId);
        if (item) {
            item.text = text;
            item.quantity = quantity;
        }
        editingId = null;
        document.querySelector('.add-btn .btn-text').textContent = 'Agregar';
    } else {
        // Modo agregar
        const newItem = {
            id: Date.now(),
            text: text,
            quantity: quantity,
            purchased: false,
            createdAt: new Date().toISOString()
        };
        shoppingList.unshift(newItem);
    }

    // Limpiar formulario
    itemInput.value = '';
    quantityInput.value = '1';
    itemInput.focus();

    // Actualizar vista
    saveToLocalStorage();
    renderList();
}

// ==========================================
// RENDERIZAR LISTA
// ==========================================
function renderList() {
    const filteredList = getFilteredList();

    // Mostrar/ocultar estado vacío
    if (filteredList.length === 0) {
        emptyState.style.display = 'block';
        shoppingListEl.innerHTML = '';
    } else {
        emptyState.style.display = 'none';
        shoppingListEl.innerHTML = filteredList.map(item => createItemHTML(item)).join('');
    }

    // Actualizar estadísticas
    updateStats();
}

// ==========================================
// CREAR HTML DEL ITEM
// ==========================================
function createItemHTML(item) {
    return `
        <div class="list-item ${item.purchased ? 'purchased' : ''}" data-id="${item.id}">
            <div class="checkbox-wrapper">
                <input 
                    type="checkbox" 
                    class="item-checkbox" 
                    ${item.purchased ? 'checked' : ''}
                    onchange="togglePurchased(${item.id})"
                >
            </div>
            <div class="item-content">
                <span class="item-text">${item.text}</span>
                <span class="item-quantity">x${item.quantity}</span>
            </div>
            <div class="item-actions">
                <button class="action-item-btn edit-btn" onclick="editItem(${item.id})" title="Editar">
                    ✏️
                </button>
                <button class="action-item-btn delete-btn" onclick="deleteItem(${item.id})" title="Eliminar">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// FILTRAR LISTA
// ==========================================
function getFilteredList() {
    switch (currentFilter) {
        case 'pending':
            return shoppingList.filter(item => !item.purchased);
        case 'purchased':
            return shoppingList.filter(item => item.purchased);
        default:
            return shoppingList;
    }
}

// ==========================================
// MARCAR COMO COMPRADO
// ==========================================
function togglePurchased(id) {
    const item = shoppingList.find(i => i.id === id);
    if (item) {
        item.purchased = !item.purchased;
        saveToLocalStorage();
        renderList();
    }
}

// ==========================================
// EDITAR ITEM
// ==========================================
function editItem(id) {
    const item = shoppingList.find(i => i.id === id);
    if (item) {
        itemInput.value = item.text;
        quantityInput.value = item.quantity;
        editingId = id;
        
        // Cambiar texto del botón
        document.querySelector('.add-btn .btn-text').textContent = 'Actualizar';
        
        // Scroll al formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
        itemInput.focus();
    }
}

// ==========================================
// ELIMINAR ITEM
// ==========================================
function deleteItem(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        shoppingList = shoppingList.filter(i => i.id !== id);
        saveToLocalStorage();
        renderList();
    }
}

// ==========================================
// LIMPIAR COMPRADOS
// ==========================================
function clearPurchased() {
    const purchasedCount = shoppingList.filter(i => i.purchased).length;
    
    if (purchasedCount === 0) {
        alert('No hay productos comprados para eliminar');
        return;
    }

    if (confirm(`¿Eliminar ${purchasedCount} producto(s) comprado(s)?`)) {
        shoppingList = shoppingList.filter(i => !i.purchased);
        saveToLocalStorage();
        renderList();
    }
}

// ==========================================
// ELIMINAR TODO
// ==========================================
function deleteAll() {
    if (shoppingList.length === 0) {
        alert('La lista ya está vacía');
        return;
    }

    if (confirm('¿Estás seguro de eliminar TODOS los productos?')) {
        shoppingList = [];
        saveToLocalStorage();
        renderList();
    }
}

// ==========================================
// ACTUALIZAR ESTADÍSTICAS
// ==========================================
function updateStats() {
    const total = shoppingList.length;
    const purchased = shoppingList.filter(i => i.purchased).length;
    const pending = total - purchased;

    totalItems.textContent = total;
    purchasedItems.textContent = purchased;
    pendingItems.textContent = pending;
}

// ==========================================
// LOCALSTORAGE
// ==========================================
function saveToLocalStorage() {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('shoppingList');
    if (saved) {
        shoppingList = JSON.parse(saved);
    }
}

// ==========================================
// LOG INICIAL
// ==========================================
console.log('🛒 Lista de Compras cargada');
console.log('💻 Desarrollado por Dulce María Méndez Santiago');