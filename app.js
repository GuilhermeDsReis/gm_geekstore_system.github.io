// Initialize localStorage with sample data if it doesn't exist
if (!localStorage.getItem('products')) {
    const initialProducts = [
        { id: 1, name: 'Action Figure Marvel', price: 199.99, stock: 15, minStock: 5, category: 'Colecionáveis' },
        { id: 2, name: 'Camiseta Vingadores', price: 59.99, stock: 30, minStock: 10, category: 'Vestuário' },
        { id: 3, name: 'Caneca Star Wars', price: 39.99, stock: 25, minStock: 8, category: 'Acessórios' }
    ];
    localStorage.setItem('products', JSON.stringify(initialProducts));
}

if (!localStorage.getItem('sales')) {
    localStorage.setItem('sales', JSON.stringify([]));
}

if (!localStorage.getItem('transactions')) {
    localStorage.setItem('transactions', JSON.stringify([]));
}

// Utility Functions
const generateId = () => Date.now().toString();

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

// Product Management
const getProducts = () => {
    return JSON.parse(localStorage.getItem('products')) || [];
};

const updateProduct = (productId, updates) => {
    const products = getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        localStorage.setItem('products', JSON.stringify(products));
        return true;
    }
    return false;
};

const addProduct = (product) => {
    const products = getProducts();
    const newProduct = {
        id: generateId(),
        ...product
    };
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    return newProduct;
};

// Sales Management
const getSales = () => {
    return JSON.parse(localStorage.getItem('sales')) || [];
};

const addSale = (sale) => {
    const sales = getSales();
    const newSale = {
        id: generateId(),
        date: new Date().toISOString(),
        ...sale
    };
    sales.push(newSale);
    localStorage.setItem('sales', JSON.stringify(sales));
    return newSale;
};

const makeSale = (productId, quantity) => {
    const product = getProducts().find(p => p.id === productId);
    
    if (!product) {
        throw new Error('Produto não encontrado');
    }
    
    if (product.stock < quantity) {
        throw new Error('Quantidade insuficiente em estoque');
    }
    
    // Update stock
    updateProduct(productId, { stock: product.stock - quantity });
    
    // Record sale
    const sale = addSale({
        productId,
        quantity,
        total: product.price * quantity
    });
    
    // Record transaction
    addTransaction({
        type: 'saída',
        productId,
        quantity,
        reason: 'venda'
    });
    
    return sale;
};

// Transaction Management
const getTransactions = () => {
    return JSON.parse(localStorage.getItem('transactions')) || [];
};

const addTransaction = (transaction) => {
    const transactions = getTransactions();
    const newTransaction = {
        id: generateId(),
        date: new Date().toISOString(),
        ...transaction
    };
    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    return newTransaction;
};

// Stock Management
const updateStock = (productId, quantity, type) => {
    const product = getProducts().find(p => p.id === productId);
    
    if (!product) {
        throw new Error('Produto não encontrado');
    }
    
    if (type === 'saída' && product.stock < quantity) {
        throw new Error('Quantidade insuficiente em estoque');
    }
    
    const newStock = type === 'entrada' 
        ? product.stock + quantity 
        : product.stock - quantity;
    
    updateProduct(productId, { stock: newStock });
    
    addTransaction({
        type,
        productId,
        quantity,
        reason: 'ajuste de estoque'
    });
    
    return true;
};

// Alert Management
const showAlert = (message, type = 'error') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 p-4 rounded-md ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
};

// Export functions
window.appFunctions = {
    getProducts,
    updateProduct,
    addProduct,
    makeSale,
    updateStock,
    formatCurrency,
    showAlert
};
