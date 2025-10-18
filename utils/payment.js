const axios = require("axios");
require("dotenv").config();
const credentials = require("../configs/credentials");
const { getSupportedCountry } = require("../configs/countries");

const {
  FLW_SECRET_KEY,
  LOCAL_CURRENCY_API_KEY,
  FLW_BASE_URL = "https://api.flutterwave.com/v3",
} = process.env;

// Helper: get Flutterwave auth header
const getFlwAuthHeaders = () => ({
  Authorization: `Bearer ${FLW_SECRET_KEY}`,
  "Content-Type": "application/json",
});

// Initialize a payment (returns the redirect link and metadata)
async function initializeTransaction(transactionData) {
  const {
    totalAmount,
    amountInUSD,
    currency = countryInfo.currency_code,
    email,
    phone,
    fullName,
    paymentReference,
    paymentOptions = "card,account_transfer,ussd",
    asset,
  } = transactionData;

  const payload = {
    tx_ref: paymentReference,
    amount: totalAmount > 500000 ? 400000 : totalAmount.toString(),
    currency,
    redirect_url: `${credentials.appUrl}/verify-pay`,
    payment_options: paymentOptions,
    customer: {
      email,
      name: fullName,
      phonenumber: phone,
    },
    meta: {
      totalAmount: totalAmount.toString(),
      paymentReference: paymentReference.toString(),
      phone: phone.toString(),
      email,
      amountInUSD: amountInUSD.toString(),
      asset: JSON.stringify(asset),
    },
  };

  try {
    const res = await axios.post(`${FLW_BASE_URL}/payments`, payload, {
      headers: getFlwAuthHeaders(),
    });
    if (res.data.status !== "success") {
      throw new Error(`Flutterwave init failed: ${res.data.message}`);
    }
    return res.data.data; // contains `.link`, `.id`, `.tx_ref` etc.
  } catch (err) {
    console.error(
      "Error initializing Flutterwave payment:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// Verify a payment by transaction ID or reference
async function verifyPayment(transaction_id) {
  // You can prefer verifying by the transaction ID if available
  let url;
  if (transaction_id) {
    url = `${FLW_BASE_URL}/transactions/${transaction_id}/verify`;
  } else {
    throw new Error("Either transaction_id or tx_ref must be provided");
  }

  try {
    const res = await axios.get(url, { headers: getFlwAuthHeaders() });
    // res.data.data contains status, amount, currency, etc.
    // console.log("Flutterwave verification response:", res.data);
    return res.data.data;
  } catch (err) {
    console.error(
      "Error verifying Flutterwave payment:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// Make a transfer / payout to a bank account
async function makeTransfer({
  account_bank,
  account_number,
  amount,
  narration,
  currency = "NGN",
  reference,
}) {
  const payload = {
    account_bank,
    account_number,
    amount,
    narration,
    currency,
    reference,
  };

  try {
    const res = await axios.post(`${FLW_BASE_URL}/transfers`, payload, {
      headers: getFlwAuthHeaders(),
    });
    if (res.data.status !== "success") {
      throw new Error(`Flutterwave transfer failed: ${res.data.message}`);
    }
    return res.data.data; // includes transfer id, status etc.
  } catch (err) {
    console.error(
      "Error initiating Flutterwave transfer:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// Check status of a transfer
async function verifyTransfer(transfer_id) {
  try {
    const res = await axios.get(`${FLW_BASE_URL}/transfers/${transfer_id}`, {
      headers: getFlwAuthHeaders(),
    });
    return res.data.data; // includes status, etc.
  } catch (err) {
    console.error(
      "Error verifying flutterwave transfer:",
      err.response?.data || err.message
    );
    throw err;
  }
}

async function convertToLocalCurrency(usdAmount, country) {
  const countryInfo = getSupportedCountry({ country });
  if (!countryInfo) {
    throw new Error(
      `Country ${country} is not supported for currency conversion`
    );
  }
  const API_URL = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${LOCAL_CURRENCY_API_KEY}&symbols=${countryInfo.currency_code}`;
  try {
    const response = await axios.get(API_URL);

    const rate = parseFloat(response.data.rates[countryInfo.currency_code]);

    if (isNaN(rate)) {
      throw new Error("Invalid NGN rate from API");
    }

    const convertedAmount = Math.round(usdAmount * rate);

    return { convertedAmount, currency: countryInfo.currency_code };
  } catch (error) {
    console.error("Currency conversion error:", error.message);
    throw error;
  }
}

module.exports = {
  initializeTransaction,
  verifyPayment,
  makeTransfer,
  verifyTransfer,
  convertToLocalCurrency,
};
