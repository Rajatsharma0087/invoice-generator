// ===== STATE =====
let items = [];
let nextId = 1;

// ===== DOM ELEMENTS =====
const themeToggle = document.getElementById('themeToggle');
const addItemBtn = document.getElementById('addItemBtn');
const resetBtn = document.getElementById('resetBtn');
const itemsContainer = document.getElementById('itemsContainer');

// ===== THEME =====
function loadTheme() {
    const saved = localStorage.getItem('invoiceTheme') || 'light';
    if (saved === 'dark') {
        document.body.classList.add('dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('invoiceTheme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
});

// ===== AUTO INVOICE NUMBER =====
function generateInvoiceNumber() {
    const num = Math.floor(Math.random() * 900) + 100;
    const invNum = `INV-${num}`;
    document.getElementById('invoiceNumber').value = invNum;
    document.getElementById('prev-invoiceNumber').textContent = invNum;
}

// ===== DEFAULT DATES =====
function setDefaultDates() {
    const today = new Date();
    const due = new Date();
    due.setDate(due.getDate() + 30);

    const toISO = (d) => d.toISOString().split('T')[0];
    const toReadable = (d) => d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    document.getElementById('invoiceDate').value = toISO(today);
    document.getElementById('dueDate').value = toISO(due);
    document.getElementById('prev-invoiceDate').textContent =
        toReadable(today);
    document.getElementById('prev-dueDate').textContent =
        toReadable(due);
}

// ===== LIVE PREVIEW MAPPINGS =====
const fieldMappings = [
    { input: 'fromName',      preview: 'prev-fromName'      },
    { input: 'fromName',      preview: 'prev-fromName2'     },
    { input: 'fromEmail',     preview: 'prev-fromEmail'     },
    { input: 'fromAddress',   preview: 'prev-fromAddress'   },
    { input: 'fromAddress',   preview: 'prev-fromAddress2'  },
    { input: 'fromPhone',     preview: 'prev-fromPhone'     },
    { input: 'fromWebsite',   preview: 'prev-fromWebsite'   },
    { input: 'toName',        preview: 'prev-toName'        },
    { input: 'toEmail',       preview: 'prev-toEmail'       },
    { input: 'toAddress',     preview: 'prev-toAddress'     },
    { input: 'invoiceNumber', preview: 'prev-invoiceNumber' },
    { input: 'paymentTerms',  preview: 'prev-paymentTerms'  },
    { input: 'notes',         preview: 'prev-notes'         },
];

function setupLivePreview() {
    fieldMappings.forEach(({ input, preview }) => {
        const inputEl = document.getElementById(input);
        const previewEl = document.getElementById(preview);
        if (!inputEl || !previewEl) return;

        inputEl.addEventListener('input', () => {
            previewEl.textContent = inputEl.value || '';
        });
    });

    // Dates
    document.getElementById('invoiceDate')
        .addEventListener('change', (e) => {
            const date = new Date(e.target.value);
            document.getElementById('prev-invoiceDate').textContent =
                date.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
        });

    document.getElementById('dueDate')
        .addEventListener('change', (e) => {
            const date = new Date(e.target.value);
            document.getElementById('prev-dueDate').textContent =
                date.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
        });

    // Currency
    document.getElementById('currency')
        .addEventListener('change', updateAll);

    // Tax + Discount
    document.getElementById('taxRate')
        .addEventListener('input', updateAll);
    document.getElementById('discount')
        .addEventListener('input', updateAll);
}

// ===== GET CURRENCY =====
function getCurrency() {
    return document.getElementById('currency').value || '$';
}

// ===== ADD ITEM =====
function addItem() {
    const item = {
        id: nextId++,
        description: '',
        quantity: 1,
        rate: 0
    };
    items.push(item);
    renderItems();
    updateAll();
}

// ===== REMOVE ITEM =====
function removeItem(id) {
    items = items.filter(item => item.id !== id);
    renderItems();
    updateAll();
}

// ===== UPDATE ITEM FIELD =====
function updateItemField(id, field, value) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (field === 'description') {
        item[field] = value;
    } else {
        item[field] = parseFloat(value) || 0;
    }

    updateAll();
}

// ===== RENDER ITEMS IN FORM =====
function renderItems() {
    if (!itemsContainer) return;

    if (items.length === 0) {
        itemsContainer.innerHTML = `
            <div class="no-items">
                <i class="fas fa-inbox"></i>
                <p>No items yet</p>
                <span>Click "Add New Item" below</span>
            </div>
        `;
        return;
    }

    itemsContainer.innerHTML = items.map((item, index) => `
        <div class="item-card" data-id="${item.id}">
            <div class="item-card-header">
                <span class="item-number">Item ${index + 1}</span>
                <button
                    class="btn-remove-item"
                    onclick="removeItem(${item.id})"
                    title="Remove item"
                >
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-fields">
                <div class="form-group span-full">
                    <label>Description</label>
                    <input
                        type="text"
                        placeholder="e.g. Landing Page Design"
                        value="${item.description}"
                        onchange="updateItemField(
                            ${item.id},
                            'description',
                            this.value
                        )"
                        oninput="updateItemField(
                            ${item.id},
                            'description',
                            this.value
                        )"
                    >
                </div>
                <div class="item-numbers">
                    <div class="form-group">
                        <label>Quantity</label>
                        <input
                            type="number"
                            value="${item.quantity}"
                            min="1"
                            onchange="updateItemField(
                                ${item.id},
                                'quantity',
                                this.value
                            )"
                            oninput="updateItemField(
                                ${item.id},
                                'quantity',
                                this.value
                            )"
                        >
                    </div>
                    <div class="form-group">
                        <label>Rate (${getCurrency()})</label>
                        <input
                            type="number"
                            value="${item.rate}"
                            min="0"
                            placeholder="0"
                            onchange="updateItemField(
                                ${item.id},
                                'rate',
                                this.value
                            )"
                            oninput="updateItemField(
                                ${item.id},
                                'rate',
                                this.value
                            )"
                        >
                    </div>
                    <div class="form-group">
                        <label>Amount</label>
                        <div class="item-amount">
                            ${getCurrency()}${(item.quantity * item.rate)
                                .toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== UPDATE PREVIEW TABLE =====
function updatePreviewTable() {
    const tbody = document.getElementById('prev-itemsBody');
    if (!tbody) return;

    const currency = getCurrency();

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-items-row">
                <td colspan="4">
                    <i class="fas fa-arrow-left"></i>
                    Add items on the left
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td class="td-desc">
                ${item.description || 'Untitled Service'}
            </td>
            <td class="td-num">${item.quantity}</td>
            <td class="td-num">
                ${currency}${parseFloat(item.rate).toFixed(2)}
            </td>
            <td class="td-num td-amount">
                ${currency}${(item.quantity * item.rate).toFixed(2)}
            </td>
        </tr>
    `).join('');
}

// ===== CALCULATE TOTALS =====
function calculateTotals() {
    const taxRate = parseFloat(
        document.getElementById('taxRate').value
    ) || 0;
    const discountRate = parseFloat(
        document.getElementById('discount').value
    ) || 0;

    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.rate);
    }, 0);

    const discountAmt = subtotal * (discountRate / 100);
    const afterDiscount = subtotal - discountAmt;
    const taxAmt = afterDiscount * (taxRate / 100);
    const grandTotal = afterDiscount + taxAmt;

    return {
        subtotal,
        discountAmt,
        taxAmt,
        grandTotal,
        taxRate,
        discountRate
    };
}

// ===== UPDATE TOTALS IN PREVIEW =====
function updateTotals() {
    const currency = getCurrency();
    const {
        subtotal,
        discountAmt,
        taxAmt,
        grandTotal,
        taxRate,
        discountRate
    } = calculateTotals();

    // Update preview totals
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('prev-subtotal',
        `${currency}${subtotal.toFixed(2)}`);
    set('prev-discountAmt',
        `-${currency}${discountAmt.toFixed(2)}`);
    set('prev-taxAmt',
        `${currency}${taxAmt.toFixed(2)}`);
    set('prev-grandTotal',
        `${currency}${grandTotal.toFixed(2)}`);
    set('prev-taxPct', taxRate);
    set('prev-discountPct', discountRate);

    // Show/hide discount line
    const discountLine = document.getElementById('discountLine');
    if (discountLine) {
        discountLine.style.display =
            discountRate > 0 ? 'flex' : 'none';
    }
}

// ===== UPDATE EVERYTHING =====
function updateAll() {
    renderItems();
    updatePreviewTable();
    updateTotals();
}

// ===== RESET =====
resetBtn.addEventListener('click', () => {
    if (!confirm('Reset everything? This cannot be undone.')) return;

    items = [];
    nextId = 1;

    // Clear all inputs
    document.querySelectorAll('input, textarea').forEach(el => {
        if (el.type === 'date') return;
        if (el.id === 'taxRate') { el.value = '18'; return; }
        if (el.id === 'discount') { el.value = '0'; return; }
        el.value = '';
    });

    // Reset preview fields
    document.getElementById('prev-fromName').textContent = 'Your Name';
    document.getElementById('prev-fromName2').textContent = '';
    document.getElementById('prev-toName').textContent = 'Client Name';

    generateInvoiceNumber();
    updateAll();
    showToast('Reset complete ✅');
});

// ===== DOWNLOAD BUTTON (DAY 3) =====
document.getElementById('downloadBtn')
    .addEventListener('click', () => {
        showToast('PDF download coming Day 3! 🚀');
    });

// ===== ADD ITEM BUTTON =====
addItemBtn.addEventListener('click', addItem);

// ===== TOAST =====
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== INIT =====
function init() {
    loadTheme();
    generateInvoiceNumber();
    setDefaultDates();
    setupLivePreview();
    addItem();
    updateAll();
}

init();

console.log('InvoiceFlow Day 2 ✅');
console.log('Day 3: PDF download coming tomorrow');
