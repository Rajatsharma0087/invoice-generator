// ===== THEME =====
const themeToggle = document.getElementById('themeToggle');

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

    document.getElementById('prev-invoiceDate').textContent = toReadable(today);
    document.getElementById('prev-dueDate').textContent = toReadable(due);
}

// ===== LIVE PREVIEW MAPPINGS =====
const fieldMappings = [
    { input: 'fromName',     preview: 'prev-fromName'     },
    { input: 'fromName',     preview: 'prev-fromName2'    },
    { input: 'fromEmail',    preview: 'prev-fromEmail'    },
    { input: 'fromAddress',  preview: 'prev-fromAddress'  },
    { input: 'fromAddress',  preview: 'prev-fromAddress2' },
    { input: 'fromPhone',    preview: 'prev-fromPhone'    },
    { input: 'fromWebsite',  preview: 'prev-fromWebsite'  },
    { input: 'toName',       preview: 'prev-toName'       },
    { input: 'toEmail',      preview: 'prev-toEmail'      },
    { input: 'toAddress',    preview: 'prev-toAddress'    },
    { input: 'invoiceNumber',preview: 'prev-invoiceNumber'},
    { input: 'paymentTerms', preview: 'prev-paymentTerms' },
    { input: 'notes',        preview: 'prev-notes'        },
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

    // Date fields
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
        .addEventListener('change', (e) => {
            document.getElementById('prev-currency').textContent =
                e.target.value;
            document.getElementById('prev-currency2').textContent =
                e.target.value;
        });
}

// ===== INIT =====
function init() {
    loadTheme();
    generateInvoiceNumber();
    setDefaultDates();
    setupLivePreview();
}

init();

console.log('InvoiceFlow Day 1 — Foundation complete ✅');
console.log('Day 2: Line items + calculations coming tomorrow');
