"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Pranjal Gupta",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2021-04-27T17:01:17.194Z",
    "2021-05-18T23:36:17.929Z",
    "2021-05-22T10:51:36.790Z",
  ],
  currency: "INR",
  locale: "en-IN", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const account3 = {
  owner: "Jeremy Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 3333,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "EUR",
  locale: "de-DE",
};


const accounts = [account1, account2,  account3];  

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

///////////////////////////////////////////////
//////////////////////////////////////////////
// FUNCTIONS

/*
Function name: formatMovementsDate
Args: Date to be formatted, 
      locale (default is 'en-US')
description : It recieves the date and formats with the help of Internationalization library into a consistent format 
*/

const formatMovementsDate = function (date, locale = "en-US") {
  const timeElapsed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = timeElapsed(date, new Date());
  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return Intl.DateTimeFormat(locale).format(date);
};

/*
Function name: formatCurr
Args: value to be formatted, 
      locale
      currency 
description : It recieves the value and formats with the help of Internationalization library according to the required currency and locale 
*/

const formatCur = function (value, locale, currency) {
  return Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

/*
Function name: setLogoutTimer
Args: Time (in milliseconds)
description : It displays a seconds clock on the page for the "session" implementation and logs the user out when finished. 
*/

const setLogoutTimer = function (time = 300) {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(tick);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Login to get started`;
    }

    time--;
  };
  tick();
  let timer = setInterval(tick, 1000);
  return timer;
};

/*
Function name: displayMovements
Args: Account (object), 
      sort (boolean) (default is false)
Description : It displays the movements of the account in recent first fashion by default , if sort is true , then it displays them in decreasing order ie, deposits and then withdrawals. 
*/

const displayMovements = function (acc, sort = false) {
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  containerMovements.innerHTML = "";
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const displayDate = formatMovementsDate(
      new Date(acc.movementsDates[i]),
      acc.locale
    );

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formatCur(
        mov,
        acc.locale,
        acc.currency
      )}</div>
    </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

/*
Function name: calcDisplayBalance
Args: Account (object) 
Description : It calculates the balance by summing up the movements array and then displays it nicely formatted with the formatCur function , the options can be customised to enable different formats.
*/

const calcDisplayBalance = function (acc) {
  const balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  acc.balance = balance;
  labelBalance.textContent = `${formatCur(balance, acc.locale, acc.currency)}`;

  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  };

  labelDate.textContent = Intl.DateTimeFormat(acc.locale, options).format(
    new Date()
  );
};

/*
Function name: calcSummary
Args: Account (object) 
Description : It calculates the deposits , withdrawals and the interest accumalated in the account and displays it nicely formatted using formatCur in the summary section of the app.
*/

const calcSummary = function (acc) {
  const deposits = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);

  const withdrawals = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => deposit * (acc.interestRate / 100))
    .filter((interest) => interest >= 1)
    .reduce((acc, curr) => acc + curr, 0);

  labelSumIn.textContent = `${formatCur(deposits, acc.locale, acc.currency)}`;
  labelSumOut.textContent = `${formatCur(
    Math.abs(withdrawals),
    acc.locale,
    acc.currency
  )}`;
  labelSumInterest.textContent = `${formatCur(
    interest,
    acc.locale,
    acc.currency
  )}`;
};

/*
Function name: createUsernames
Args: Accounts (Array of accoount objects) 
Description : It assigns the usernames to the users on the basis of their initials using the first letters of their names.
*/

const createUsernames = function (accounts) {
  // Since we need to mutate the orignal objects to add a property , hence using a forEach method
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0]) // forEach will not return the new array creating problems , so use map();
      .join("");
  });
};

createUsernames(accounts);

/*
Function name: updateUI
Args: Account (object) 
Description : It is used to update the state of the application after an action, which results into a visible change.
*/

const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcSummary(acc);
};

/*
Function name: loginUser
Args: Event e (object) 
Description : It handles all the functionality of the login button like authentication , starting the session timer and setting the initial UI after the login using updateUI() , it also sets the state variables like current account for the first time.
*/
const loginUser = function (e) {
  e.preventDefault();
  inputLoginPin.blur();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    containerApp.style.opacity = 100;

    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;

    if (timer) clearInterval(timer);
    timer = setLogoutTimer();

    updateUI(currentAccount);
  }
  inputLoginUsername.value = inputLoginPin.value = "";
};

/*
Function name: closeAccount
Args: Event e (object) 
Description : It allows the current user to close their account with the bank and after successful deletion logs the user out.
*/

const closeAccount = function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );

    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = "";
};

/*
Function name: transferAmount
Args: Event e (object) 
Description : It allows the current user to transfer money to other users in the bank, it stores the dates and amount into the account objects of the sender and receiver
*/

const transferAmount = function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const recieverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    recieverAcc &&
    currentAccount?.balance >= amount &&
    currentAccount.username !== inputTransferTo.value
  ) {
    currentAccount.movements.push(-amount);
    recieverAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    recieverAcc.movementsDates.push(new Date().toISOString());
    clearInterval(timer);
    timer = setLogoutTimer();
    updateUI(currentAccount);
  }
  inputTransferAmount.value = inputTransferTo.value = "";
};

/*
Function name: requestLoan
Args: Event e (object) 
Description : It allows the current user to request a loan from the bank , on the condition that they have a deposit of atleast 10% of the loan amount in the bank, the loan takes 5 seconds to show up in the account.
*/

const requestLoan = function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    currentAccount.movements.some((mov) => mov >= 0.1 * amount) &&
    amount > 0
  ) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 1000 * 5);
    clearInterval(timer);
    timer = setLogoutTimer();
  }
  inputLoanAmount.value = "";
};

/*
Function name: toggleSorted
Args: -
Description : It allows the current user to toggle the movements view in the application between "recent first" and "decreasing order" using  displayMovements().
*/

const toggleSorted = function () {
  isSorted = !isSorted;
  displayMovements(currentAccount, isSorted);
};

// State Variables
let currentAccount;
let timer;
let isSorted = false;

// Event Handlers

btnLogin.addEventListener("click", loginUser);

btnClose.addEventListener("click", closeAccount);

btnTransfer.addEventListener("click", transferAmount);

btnLoan.addEventListener("click", requestLoan);

btnSort.addEventListener("click", toggleSorted);
