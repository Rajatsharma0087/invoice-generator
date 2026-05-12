/**
 * InvoiceFlow - Improved Implementation
 * Features: Focus preservation, XSS protection, Intl formatting, modular structure.
 */

// ===== CONFIG & STATE =====
const CONFIG = {
    locale: 'en-IN',
    currencyCode: 'USD', // Default, overridden by UI
    defaultTax: 18,
    defaultDiscount: 0
};

const state = {
    items: [],
    nextId: 1,
    currency: '$'
};

// ===== DOM ELEMENTS (Cached) =====
const DOM = {
    body: document.body,
    themeToggle: document.getElementById('themeToggle'),
    addItemBtn: document.getElementById('addItemBtn'),
    resetBtn: document.getElementById('resetBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    printBtn: document.getElementById('printBtn'),
    itemsContainer: document.getElementById('itemsContainer'),
    previewBody: document.getElementById('prev-itemsBody'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toastMsg'),
    // Mappings for Live Preview
    inputs: {
        fromName: document.getElementById('fromName'),
        fromEmail: document.getElementById('fromEmail'),
        fromAddress: document.getElementById('fromAddress'),
        fromPhone: document.getElementById('fromPhone'),
        fromWebsite: document.getElementById('fromWebsite'),
        toName: document.getElementById('toName'),
        toEmail: document.getElementById('toEmail'),
        toAddress: document.getElementById('toAddress'),
        invoiceNumber: document.getElementById('invoiceNumber'),
        paymentTerms: document.getElementById('paymentTerms'),
        notes: document.getElementById('notes'),
        currency: document.getElementById('currency'),
        taxRate: document.getElementById('taxRate'),
        discount: document.getElementById('discount'),
        invoiceDate: document.getElementById('invoiceDate'),
        dueDate: document.getElementById('dueDate'),
    },
    previews: {
        fromName: document.getElementById('prev-fromName'),
        fromName2: document.getElementById('prev-fromName2'),
        fromEmail: document.getElementById('prev-fromEmail'),
        fromAddress: document.getElementById('prev-fromAddress'),
        fromAddress2: document.getElementById('prev-fromAddress2'),
        fromPhone: document.getElementById('prev-fromPhone'),
        fromWebsite: document.getElementById('prev-fromWebsite'),
        toName: document.getElementById('prev-toName'),
        toEmail: document.getElementById('prev-toEmail'),
        toAddress: document.getElementById('prev-toAddress'),
        invoiceNumber: document.getElementById('prev-invoiceNumber'),
        paymentTerms: document.getElementById('prev-paymentTerms'),
        notes: document.getElementById('prev-notes'),
        invoiceDate: document.getElementById('prev-invoiceDate'),
        dueDate: document.getElementById('prev-dueDate'),
        subtotal: document.getElementById('prev-subtotal'),
        discountAmt: document.getElementById('prev-discountAmt'),
        taxAmt: document.getElementById('prev-taxAmt'),
        grandTotal: document.getElementById('prev-grandTotal'),
        taxPct: document.getElementById('prev-taxPct'),
        discountPct: document.getElementById('prev-discountPct'),
        discountLine: document.getElementById('discountLine'),
    }
};

// ===== UTILITIES =====
const Utils = {
    // Sanitize output to prevent HTML injection
    escapeHtml: (str) => {
        if(!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    formatCurrency: (amount) => {
        return new Intl.NumberFormat(CONFIG.locale, {
            style: 'currency',
            currency: state.currency === '$' ? 'USD' : state.currency, // Simple mapping logic
            minimumFractionDigits: 2
        }).format(amount).replace(state.currency, state.currency + ' '); // Adjust spacing if needed
    },

    formatDate: (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(CONFIG.locale, {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    },

    // Safe number parser
    parseNum: (val) => parseFloat(val) || 0,

    generateId: () => `INV-${Math.floor(Math.random() * 9000) + 1000}`
};

// ===== THEME MANAGER =====
const ThemeManager = {
    init() {
        const saved = localStorage.getItem('invoiceTheme') || 'light';
        this.apply(saved);
        
        DOM.themeToggle.addEventListener('click', () => {
            const isDark = DOM.body.classList.toggle('dark');
            this.apply(isDark ? 'dark' : 'light');
            localStorage.setItem('invoiceTheme', isDark ? 'dark' : 'light');
        });
    },

    apply(theme) {
        const isDark = theme === 'dark';
        DOM.body.classList.toggle('dark', isDark);
        DOM.themeToggle.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
};

// ===== CORE LOGIC =====
const App = {
    init() {
        ThemeManager.init();
        this.setDefaults();
        this.setupLivePreview();
        this.addItem(); // Start with one item
    },

    setDefaults() {
        // Dates
        const today = new Date();
        const due = new Date();
        due.setDate(due.getDate() + 30);
        
        DOM.inputs.invoiceDate.value = today.toISOString().split('T')[0];
        DOM.inputs.dueDate.value = due.toISOString().split('T')[0];
        
        DOM.previews.invoiceDate.textContent = Utils.formatDate(DOM.inputs.invoiceDate.value);
        DOM.previews.dueDate.textContent = Utils.formatDate(DOM.inputs.dueDate.value);

        // Invoice Number
        DOM.inputs.invoiceNumber.value = Utils.generateId();
        DOM.previews.invoiceNumber.textContent = DOM.inputs.invoiceNumber.value;

        // Tax/Discount
        DOM.inputs.taxRate.value = CONFIG.defaultTax;
        DOM.inputs.discount.value = CONFIG.defaultDiscount;
        
        // Initial Preview Texts
        DOM.previews.fromName.textContent = 'Your Name';
        DOM.previews.toName.textContent = 'Client Name';
        DOM.previews.notes.textContent = 'Thank you for your business!';
        DOM.previews.paymentTerms.textContent = '-';
    },

    setupLivePreview() {
        // Text inputs
        const map = [
            ['fromName', 'prev-fromName'], ['fromName', 'prev-fromName2'],
            ['fromEmail', 'prev-fromEmail'], ['fromAddress', 'prev-fromAddress'],
            ['fromAddress', 'prev-fromAddress2'], ['fromPhone', 'prev-fromPhone'],
            ['fromWebsite', 'prev-fromWebsite'], ['toName', 'prev-toName'],
            ['toEmail', 'prev-toEmail'], ['toAddress', 'prev-toAddress'],
            ['invoiceNumber', 'prev-invoiceNumber'], ['paymentTerms', 'prev-paymentTerms'],
            ['notes', 'prev-notes']
        ];

        map.forEach(([inputId, previewId]) => {
            DOM.inputs[inputId].addEventListener('input', (e) => {
                DOM.previews[previewId].textContent = e.target.value;
            });
        });

        // Dates
        DOM.inputs.invoiceDate.addEventListener('change', (e) => {
            DOM.previews.invoiceDate.textContent = Utils.formatDate(e.target.value);
        });
        DOM.inputs.dueDate.addEventListener('change', (e) => {
            DOM.previews.dueDate.textContent = Utils.formatDate(e.target.value);
        });

        // Global calculation triggers
        ['currency', 'taxRate', 'discount'].forEach(id => {
            DOM.inputs[id].addEventListener('input', () => this.updateCalculations());
        });
        
        // Update currency symbol state
        DOM.inputs.currency.addEventListener('change', (e) => {
            state.currency = e.target.value;
            this.renderItemsForm(); // Re-render to update Rate labels
            this.updateCalculations();
        });
    },

    addItem() {
        state.items.push({ id: state.nextId++, description: '', quantity: 1, rate: 0 });
        this.renderItemsForm();
        this.updateCalculations();
    },

    removeItem(id) {
        state.items = state.items.filter(i => i.id !== id);
        this.renderItemsForm();
        this.updateCalculations();
    },

    updateItem(id, field, value) {
        const item = state.items.find(i => i.id === id);
        if (!item) return;

        if (field === 'description') {
            item[field] = value;
        } else {
            item[field] = Utils.parseNum(value);
        }

        // CRITICAL FIX: Do NOT re-render the whole form here, 
        // or focus will be lost. Only update calculations.
        this.updateCalculations();
        
        // Update the specific "Amount" text in the DOM for the active row
        const rowAmountEl = document.getElementById(`amount-display-${id}`);
        if (rowAmountEl) {
            const total = item.quantity * item.rate;
            rowAmountEl.textContent = `${state.currency} ${total.toFixed(2)}`;
        }
    },

    renderItemsForm() {
        if (state.items.length === 0) {
            DOM.itemsContainer.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-inbox"></i>
                    <p>No items yet</p>
                    <span>Click "Add New Item" below</span>
                </div>`;
            return;
        }

        DOM.itemsContainer.innerHTML = state.items.map((item, index) => `
            <div class="item-card" data-id="${item.id}">
                <div class="item-card-header">
                    <span class="item-number">Item ${index + 1}</span>
                    <button class="btn-remove-item" onclick="App.removeItem(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="item-fields">
                    <div class="form-group span-full">
                        <label>Description</label>
                        <input type="text" placeholder="Item description" 
                               value="${Utils.escapeHtml(item.description)}"
                               oninput="App.updateItem(${item.id}, 'description', this.value)">
                    </div>
                    <div class="item-numbers">
                        <div class="form-group">
                            <label>Quantity</label>
                            <input type="number" value="${item.quantity}" min="1" 
                                   oninput="App.updateItem(${item.id}, 'quantity', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Rate (${state.currency})</label>
                            <input type="number" value="${item.rate}" min="0" placeholder="0" 
                                   oninput="App.updateItem(${item.id}, 'rate', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Amount</label>
                            <div class="item-amount" id="amount-display-${item.id}">
                                ${state.currency} ${(item.quantity * item.rate).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    updateCalculations() {
        this.renderPreviewTable();
        this.updateTotals();
    },

    renderPreviewTable() {
        if (state.items.length === 0) {
            DOM.previewBody.innerHTML = `<tr class="empty-items-row"><td colspan="4">No items added</td></tr>`;
            return;
        }

        DOM.previewBody.innerHTML = state.items.map(item => `
            <tr>
                <td class="td-desc">${Utils.escapeHtml(item.description) || 'Item'}</td>
                <td class="td-num">${item.quantity}</td>
                <td class="td-num">${state.currency}${item.rate.toFixed(2)}</td>
                <td class="td-num td-amount">${state.currency}${(item.quantity * item.rate).toFixed(2)}</td>
            </tr>
        `).join('');
    },

    updateTotals() {
        const subtotal = state.items.reduce((sum, i) => sum + (i.quantity * i.rate), 0);
        const taxRate = Utils.parseNum(DOM.inputs.taxRate.value);
        const discountRate = Utils.parseNum(DOM.inputs.discount.value);

        const discountAmt = subtotal * (discountRate / 100);
        const afterDisc = subtotal - discountAmt;
        const taxAmt = afterDisc * (taxRate / 100);
        const grandTotal = afterDisc + taxAmt;

        DOM.previews.subtotal.textContent = `${state.currency}${subtotal.toFixed(2)}`;
        DOM.previews.discountAmt.textContent = `-${state.currency}${discountAmt.toFixed(2)}`;
        DOM.previews.taxAmt.textContent = `${state.currency}${taxAmt.toFixed(2)}`;
        DOM.previews.grandTotal.textContent = `${state.currency}${grandTotal.toFixed(2)}`;
        
        DOM.previews.taxPct.textContent = taxRate;
        DOM.previews.discountPct.textContent = discountRate;
        
        DOM.previews.discountLine.style.display = discountRate > 0 ? 'flex' : 'none';
    },

    async downloadPDF() {
        // Validation
        if (!DOM.inputs.fromName.value || !DOM.inputs.toName.value) {
            this.showToast('Please enter Your Name and Client Name.', 'warn');
            return;
        }
        if (state.items.length === 0) {
            this.showToast('Please add at least one item.', 'warn');
            return;
        }

        DOM.loadingOverlay.classList.add('show');

        try {
            const invoiceEl = document.getElementById('invoice');
            
            // Snapshot for PDF
            const originalBg = invoiceEl.style.background;
            invoiceEl.style.background = '#ffffff';

            const canvas = await html2canvas(invoiceEl, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            invoiceEl.style.background = originalBg;

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${DOM.inputs.invoiceNumber.value || 'invoice'}.pdf`);
            
            this.showToast('PDF downloaded successfully!', 'success');
        } catch (err) {
            console.error(err);
            this.showToast('Error generating PDF.', 'error');
        } finally {
            DOM.loadingOverlay.classList.remove('show');
        }
    },

    resetForm() {
        if(!confirm('Reset all data? This cannot be undone.')) return;

        state.items = [];
        state.nextId = 1;
        
        // Clear Inputs
        Object.values(DOM.inputs).forEach(el => {
            if(el.type === 'date' || el.id === 'currency') return;
            if(el.id === 'taxRate') el.value = CONFIG.defaultTax;
            else if(el.id === 'discount') el.value = CONFIG.defaultDiscount;
            else el.value = '';
        });

        DOM.inputs.currency.selectedIndex = 0;
        state.currency = '$'; // Reset symbol state

        // Reset Text Previews
        DOM.previews.fromName.textContent = 'Your Name';
        DOM.previews.fromName2.textContent = '';
        DOM.previews.toName.textContent = 'Client Name';
        DOM.previews.notes.textContent = 'Thank you for your business!';

        this.setDefaults(); // Resets dates/inv number
        this.renderItemsForm();
        this.updateCalculations();
        this.showToast('Form reset complete.', 'success');
    },

    showToast(msg, type = 'success') {
        const colors = {
            success: '#2ecc71',
            warn: '#f39c12',
            error: '#e74c3c'
        };
        
        DOM.toastMsg.textContent = msg;
        DOM.toast.style.background = colors[type] || colors.success;
        DOM.toast.classList.add('show');
        
        setTimeout(() => DOM.toast.classList.remove('show'), 3000);
    }
};

// ===== EVENT LISTENERS =====
DOM.addItemBtn.addEventListener('click', () => App.addItem());
DOM.resetBtn.addEventListener('click', () => App.resetForm());
DOM.downloadBtn.addEventListener('click', () => App.downloadPDF());
DOM.printBtn.addEventListener('click', () => window.print());

// ===== STARTUP =====
window.addEventListener('DOMContentLoaded', () => App.init());
console.log('InvoiceFlow v2.0 — Improved ✅');
