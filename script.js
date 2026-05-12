// ===== STATE =====
let items = [];
let nextId = 1;

// ===== DOM =====
const themeToggle = document.getElementById('themeToggle');
const addItemBtn  = document.getElementById('addItemBtn');
const resetBtn    = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn    = document.getElementById('printBtn');

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
    const num    = Math.floor(Math.random() * 900) + 100;
    const invNum = `INV-${num}`;
    document.getElementById('invoiceNumber').value    = invNum;
    document.getElementById('prev-invoiceNumber').textContent = invNum;
}

// ===== DEFAULT DATES =====
function setDefaultDates() {
    const today = new Date();
    const due   = new Date();
    due.setDate(due.getDate() + 30);

    const toISO      = d => d.toISOString().split('T')[0];
    const toReadable = d => d.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    document.getElementById('invoiceDate').value = toISO(today);
    document.getElementById('dueDate').value     = toISO(due);

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
        const inputEl   = document.getElementById(input);
        const previewEl = document.getElementById(preview);
        if (!inputEl || !previewEl) return;

        inputEl.addEventListener('input', () => {
            previewEl.textContent = inputEl.value || '';
        });
    });

    // Dates
    document.getElementById('invoiceDate')
        .addEventListener('change', e => {
            document.getElementById('prev-invoiceDate')
                .textContent = new Date(e.target.value)
                .toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });
        });

    document.getElementById('dueDate')
        .addEventListener('change', e => {
            document.getElementById('prev-dueDate')
                .textContent = new Date(e.target.value)
                .toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });
        });

    // Currency + Tax + Discount
    ['currency', 'taxRate', 'discount'].forEach(id => {
        document.getElementById(id)
            .addEventListener('input',  updateAll);
        document.getElementById(id)
            .addEventListener('change', updateAll);
    });
}

// ===== CURRENCY =====
function getCurrency() {
    return document.getElementById('currency').value || '$';
}

// ===== ADD ITEM =====
function addItem() {
    items.push({ id: nextId++, description: '', quantity: 1, rate: 0 });
    renderItems();
    updateAll();
}

// ===== REMOVE ITEM =====
function removeItem(id) {
    items = items.filter(i => i.id !== id);
    renderItems();
    updateAll();
}

// ===== UPDATE ITEM =====
function updateItemField(id, field, value) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    item[field] = field === 'description'
        ? value
        : parseFloat(value) || 0;
    updateAll();
}

// ===== RENDER FORM ITEMS =====
function renderItems() {
    const container = document.getElementById('itemsContainer');
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = `
            <div class="no-items">
                <i class="fas fa-inbox"></i>
                <p>No items yet</p>
                <span>Click "Add New Item" below</span>
            </div>`;
        return;
    }

    container.innerHTML = items.map((item, index) => `
        <div class="item-card" data-id="${item.id}">
            <div class="item-card-header">
                <span class="item-number">Item ${index + 1}</span>
                <button class="btn-remove-item"
                        onclick="removeItem(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-fields">
                <div class="form-group span-full">
                    <label>Description</label>
                    <input type="text"
                           placeholder="e.g. Landing Page Design"
                           value="${item.description}"
                           oninput="updateItemField(
                               ${item.id},'description',this.value)">
                </div>
                <div class="item-numbers">
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number"
                               value="${item.quantity}"
                               min="1"
                               oninput="updateItemField(
                                   ${item.id},'quantity',this.value)">
                    </div>
                    <div class="form-group">
                        <label>Rate (${getCurrency()})</label>
                        <input type="number"
                               value="${item.rate}"
                               min="0"
                               placeholder="0"
                               oninput="updateItemField(
                                   ${item.id},'rate',this.value)">
                    </div>
                    <div class="form-group">
                        <label>Amount</label>
                        <div class="item-amount">
                            ${getCurrency()}${
                                (item.quantity * item.rate).toFixed(2)
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== UPDATE PREVIEW TABLE =====
function updatePreviewTable() {
    const tbody    = document.getElementById('prev-itemsBody');
    const currency = getCurrency();
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-items-row">
                <td colspan="4">Add items on the left</td>
            </tr>`;
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

// ===== CALCULATE =====
function calculateTotals() {
    const taxRate      = parseFloat(
        document.getElementById('taxRate').value) || 0;
    const discountRate = parseFloat(
        document.getElementById('discount').value) || 0;

    const subtotal     = items.reduce((sum, i) =>
        sum + (i.quantity * i.rate), 0);
    const discountAmt  = subtotal * (discountRate / 100);
    const afterDisc    = subtotal - discountAmt;
    const taxAmt       = afterDisc * (taxRate / 100);
    const grandTotal   = afterDisc + taxAmt;

    return { subtotal, discountAmt, taxAmt,
             grandTotal, taxRate, discountRate };
}

// ===== UPDATE TOTALS =====
function updateTotals() {
    const currency = getCurrency();
    const {
        subtotal, discountAmt, taxAmt,
        grandTotal, taxRate, discountRate
    } = calculateTotals();

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
    set('prev-taxPct',      taxRate);
    set('prev-discountPct', discountRate);

    const discountLine = document.getElementById('discountLine');
    if (discountLine) {
        discountLine.style.display =
            discountRate > 0 ? 'flex' : 'none';
    }
}

// ===== UPDATE ALL =====
function updateAll() {
    renderItems();
    updatePreviewTable();
    updateTotals();
}

// ===== DOWNLOAD PDF =====
downloadBtn.addEventListener('click', async () => {
    // Validate
    const fromName = document.getElementById('fromName').value;
    const toName   = document.getElementById('toName').value;

    if (!fromName || !toName) {
        showToast('Please fill Your Name and Client Name first ⚠️', 'warn');
        return;
    }

    if (items.length === 0) {
        showToast('Please add at least one item ⚠️', 'warn');
        return;
    }

    // Show loading
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('show');

    try {
        const invoice = document.getElementById('invoice');

        // Force white background for PDF
        const originalBg = invoice.style.background;
        invoice.style.background = '#ffffff';

        const canvas = await html2canvas(invoice, {
            scale:           2,
            useCORS:         true,
            backgroundColor: '#ffffff',
            logging:         false,
        });

        invoice.style.background = originalBg;

        const imgData  = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf      = new jsPDF('p', 'mm', 'a4');

        const pdfWidth  = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        const invoiceNum =
            document.getElementById('invoiceNumber').value
            || 'invoice';
        pdf.save(`${invoiceNum}.pdf`);

        showToast('PDF downloaded successfully! ✅');

    } catch (error) {
        console.error('PDF Error:', error);
        showToast('Error generating PDF. Try Print instead.', 'error');
    } finally {
        overlay.classList.remove('show');
    }
});

// ===== PRINT =====
printBtn.addEventListener('click', () => {
    window.print();
});

// ===== RESET =====
resetBtn.addEventListener('click', () => {
    if (!confirm('Reset everything? This cannot be undone.')) return;

    items  = [];
    nextId = 1;

    document.querySelectorAll('input, textarea').forEach(el => {
        if (el.type === 'date')       return;
        if (el.id === 'taxRate')      { el.value = '18'; return; }
        if (el.id === 'discount')     { el.value = '0';  return; }
        el.value = '';
    });

    document.getElementById('currency').selectedIndex = 0;

    // Reset preview text
    document.getElementById('prev-fromName').textContent  = 'Your Name';
    document.getElementById('prev-fromName2').textContent = '';
    document.getElementById('prev-toName').textContent    = 'Client Name';
    document.getElementById('prev-toEmail').textContent   = '';
    document.getElementById('prev-toAddress').textContent = '';
    document.getElementById('prev-notes').textContent     =
        'Thank you for your business!';
    document.getElementById('prev-paymentTerms').textContent = '-';

    generateInvoiceNumber();
    updateAll();
    showToast('Reset complete ✅');
});

// ===== ADD ITEM =====
addItemBtn.addEventListener('click', addItem);

// ===== TOAST =====
function showToast(message, type = 'success') {
    const toast   = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    toastMsg.textContent = message;

    toast.style.background =
        type === 'error' ? '#e74c3c' :
        type === 'warn'  ? '#f39c12' :
        '#2ecc71';

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
console.log('InvoiceFlow v1.0 — Complete ✅');
