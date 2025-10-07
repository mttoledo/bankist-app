'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2024-11-18T21:31:17.178Z',
    '2024-12-23T07:42:02.383Z',
    '2024-01-28T09:15:04.904Z',
    '2025-04-01T10:17:24.185Z',
    '2025-05-08T14:11:59.604Z',
    '2025-10-01T17:01:17.194Z',
    '2025-10-04T23:36:17.929Z',
    '2025-10-05T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2024-11-01T13:15:33.035Z',
    '2024-11-30T09:48:16.867Z',
    '2024-12-25T06:04:23.907Z',
    '2025-01-25T14:18:46.235Z',
    '2025-02-05T16:33:06.386Z',
    '2025-04-10T14:43:26.374Z',
    '2025-06-25T18:49:59.371Z',
    '2025-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Mateus Toledo',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,

  movementsDates: [
    '2024-11-01T13:15:33.035Z',
    '2024-11-30T09:48:16.867Z',
    '2024-12-25T06:04:23.907Z',
    '2025-01-25T14:18:46.235Z',
    '2025-02-05T16:33:06.386Z',
    '2025-10-01T14:43:26.374Z',
    '2025-10-05T18:49:59.371Z',
    '2025-10-06T12:01:20.894Z',
  ],
  currency: 'BRL',
  locale: 'pt-BR',
};


const accounts = [account1, account2, account3];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Atualização da data nas movimentações financeiras
const formatMovementDate = function(date, locale) {

    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
    const daysPassed = calcDaysPassed(new Date(), date);

    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} days ago`;

    // const day = `${date.getDate()}`.padStart(2, '0');
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
}

// função de internacionalização dos valores
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency: currency,}).format(value);
};

// Função de criação das movimentações financeiras
const displayMovements = function (acc, sort = false) {
    containerMovements.innerHTML = '';

    const combinedMovsDates = acc.movements.map((mov, i) => 
    ({
        movement: mov, 
        movementDate: acc.movementsDates.at(i),
    }));

    if (sort) combinedMovsDates.sort((a, b) => a.movement - b.movement);

    combinedMovsDates.forEach(function (obj, i) {
        const {movement, movementDate} = obj;
        const type = movement > 0 ? 'deposit' : 'withdrawal';

        const date = new Date(movementDate);
        const displayDate = formatMovementDate(date, acc.locale);

        const formattedMov = formatCur(movement, acc.locale, acc.currency);

        const html = `
            <div class="movements__row">
                <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
                <div class="movements__date">${displayDate}</div>
                <div class="movements__value">${formattedMov}</div>
            </div>
        `
        containerMovements.insertAdjacentHTML("afterbegin", html);
    });
};

// Função de display do valor de saldo da conta
const calcDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
    labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

// Função de display do valor dos depósitos/saques/interesse
const calcDisplaySummary = function (account) {
    const deposits = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur, 0)
    labelSumIn.textContent = formatCur(deposits, account.locale, account.currency);

    const withdrawals = Math.abs(account.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + cur, 0));
    labelSumOut.textContent = formatCur(withdrawals, account.locale, account.currency);

    const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0)
    labelSumInterest.textContent = formatCur(interest, account.locale, account.currency);
}

// Função de criação do login dos usuários
const createUsernames = function (accounts) {
    accounts.forEach(function (account){
        account.username = account.owner
        .toLowerCase()
        .split(' ')
        .map(name => name[0])
        .join('');
    });
};
createUsernames(accounts);

// Função de Atualização da Interface
const updateUI = function (acc) {
    calcDisplaySummary(acc);
    calcDisplayBalance(acc);
    displayMovements(acc);
}

// Event Listener Login
let currentAccount;

btnLogin.addEventListener('click', function(event) {
    event.preventDefault();
    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
    if (currentAccount?.pin === Number(inputLoginPin.value)) {
        // Display UI
        containerApp.style.opacity = '100';

        // Manipulação do DOM para atualização da data
        const now = new Date();
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        };
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

        // Limpeza dos inputs login e senha
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();
        // Chamada das funções para atualizar os dados da conta
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`
        // Atualização da Interface
        updateUI(currentAccount);
    }
})

// Event Listener Transferências
btnTransfer.addEventListener('click', function(event){
    event.preventDefault();
    const amount = Number(inputTransferAmount.value);
    const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
    inputTransferAmount.value = inputTransferTo.value = '';
    if(
        amount > 0 &&
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc?.username !== currentAccount.username
    ){
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);

        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAcc.movementsDates.push(new Date().toISOString());

        updateUI(currentAccount);
    }
});

// Event Listener Empréstimos
btnLoan.addEventListener('click', function(event){
    event.preventDefault();
    const amount = Math.floor(inputLoanAmount.value);

    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        setTimeout(function(){
            currentAccount.movements.push(amount);

            currentAccount.movementsDates.push(new Date().toISOString());

            updateUI(currentAccount);
        }, 3000);
    }

    inputLoanAmount.value = '';
});

// Event Listener Deletar Conta
btnClose.addEventListener('click', function(event){
    event.preventDefault();

    if (
        inputCloseUsername.value === currentAccount.username &&
        Number(inputClosePin.value) === currentAccount.pin
    ) {
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);
        accounts.splice(index, 1);
        containerApp.style.opacity = '0';
        labelWelcome.textContent = `Log in to get started`;
    }
    inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function(event){
    event.preventDefault();
    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
});


/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// const groupedMovements = Object.groupBy(movements, movement => movement > 0 ? 'deposits' : 'withdrawals');

// const groupedByActivity = Object.groupBy(accounts, account => {
//     const movementCount = account.movements.length;

//     if (movementCount >= 8) return 'very active';
//     if (movementCount >= 4) return 'active';
//     if (movementCount >= 1) return 'moderate';
//     return 'inactive';
// });

// setInterval(function(){
//     const relogio = new Date();
//     const minRelogio = relogio.getMinutes();
//     const secRelogio = relogio.getSeconds();
//     console.log(`${minRelogio}:${secRelogio}`)
// }, 1000);
// /////////////////////////////////////////////////



