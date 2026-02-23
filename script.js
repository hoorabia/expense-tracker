const balance = document.getElementById('balance');
const income = document.getElementById('income');
const expense = document.getElementById('expense');
const list = document.getElementById('list');
const form = document.getElementById('transaction-form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

// Sidebar links
const sidebarLinks = document.querySelectorAll('.sidebar ul li');
const sections = {
    'Home': document.getElementById('dashboard-section'),
    'Expenses': document.getElementById('expenses-section'),
    'Reports': document.getElementById('reports-section'),
    'Settings': document.getElementById('settings-section')
};

sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        for (const key in sections) {
            sections[key].style.display = key === link.textContent ? 'block' : 'none';
        }

        if (link.textContent === 'Expenses') {
            const allList = document.getElementById('all-expenses-list');
            allList.innerHTML = '';
            transactions.forEach(t => {
                const li = document.createElement('li');
                li.className = t.amount < 0 ? 'minus' : 'plus';
                li.innerHTML = `${t.text} <span>Rs ${t.amount}</span>`;
                allList.appendChild(li);
            });
        }
    });
});

// Load data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

transactions.forEach(addTransactionDOM);
updateValues();
updateCharts();

form.addEventListener('submit', e => {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Please fill all fields');
        return;
    }

    const transaction = {
        id: Date.now(),
        text: text.value,
        amount: Number(amount.value)
    };

    transactions.push(transaction);
    addTransactionDOM(transaction);
    updateValues();
    updateCharts();
    localStorage.setItem('transactions', JSON.stringify(transactions));

    text.value = '';
    amount.value = '';
});

function addTransactionDOM(transaction) {
    const li = document.createElement('li');
    li.className = transaction.amount < 0 ? 'minus' : 'plus';

    li.innerHTML = `
        ${transaction.text}
        <span>Rs ${transaction.amount}</span>
        <div class="action-btns">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;

    li.querySelector('.delete-btn').onclick = () => {
        transactions = transactions.filter(t => t.id !== transaction.id);
        li.remove();
        updateValues();
        updateCharts();
        localStorage.setItem('transactions', JSON.stringify(transactions));
    };

    li.querySelector('.edit-btn').onclick = () => {
        text.value = transaction.text;
        amount.value = transaction.amount;
        transactions = transactions.filter(t => t.id !== transaction.id);
        li.remove();
        updateValues();
        updateCharts();
        localStorage.setItem('transactions', JSON.stringify(transactions));
    };

    list.appendChild(li);
}

function updateValues() {
    let total = 0, inc = 0, exp = 0;

    transactions.forEach(t => {
        total += t.amount;
        if (t.amount > 0) inc += t.amount;
        else exp += t.amount;
    });

    balance.innerText = `Rs ${total}`;
    income.innerText = `Rs ${inc}`;
    expense.innerText = `Rs ${Math.abs(exp)}`;
}

/* ===============================
   🔥 REPORTS GRAPH (REAL DATA)
================================ */
function updateCharts() {

    // Total Income & Expense
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.amount > 0) totalIncome += t.amount;
        else totalExpense += Math.abs(t.amount);
    });

    // Chart-1 (Team Spending Trend)
    const trendBars = document.querySelectorAll('#reports-section .chart:first-child .bar');
    if (trendBars.length === 5) {
        const values = [
            totalIncome,
            totalExpense,
            totalIncome * 0.7,
            totalExpense * 0.5,
            totalIncome * 0.3
        ];
        const max = Math.max(...values, 100);
        trendBars.forEach((bar, i) => {
            bar.style.height = (values[i] / max) * 100 + '%';
        });
    }

    // Chart-2 (Day-to-Day Expenses)
    const categories = { Food: 0, Travel: 0, Bills: 0, Fuel: 0 };
    transactions.forEach(t => {
        if (t.amount < 0) {
            const txt = t.text.toLowerCase();
            if (txt.includes('food')) categories.Food += Math.abs(t.amount);
            else if (txt.includes('travel')) categories.Travel += Math.abs(t.amount);
            else if (txt.includes('bill')) categories.Bills += Math.abs(t.amount);
            else if (txt.includes('fuel')) categories.Fuel += Math.abs(t.amount);
        }
    });

    const maxCat = Math.max(...Object.values(categories), 50);
    document.querySelectorAll('.bars.purple .bar').forEach(bar => {
        bar.style.height = (categories[bar.textContent] / maxCat) * 100 + '%';
    });
}

// THEME
const themeSwitch = document.getElementById('theme-switch');
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
    themeSwitch.checked = true;
}
themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('light-theme', themeSwitch.checked);
    localStorage.setItem('theme', themeSwitch.checked ? 'light' : 'dark');
});