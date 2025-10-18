const axios = require("axios");
require("dotenv").config();
const credentials = require("../configs/credentials");
<<<<<<< HEAD
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
=======
const { MONNIFY_API_KEY, MONNIFY_SECRET_KEY, MONNIFY_CONTRACT_CODE, API_KEY } =
  process.env;

const authenticateMonnify = async () => {
  const authString = Buffer.from(
    `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`
  ).toString("base64");
  try {
    const response = await axios.post(
      `https://sandbox.monnify.com/api/v1/auth/login`,
      {},
      {
        headers: {
          Authorization: `Basic ${authString}`,
        },
      }
    );
    return response.data.responseBody.accessToken;
  } catch (error) {
    console.error("Error authenticating with Monnify:", error.response?.data);
    throw new Error(
      "Error processing your transaction. Please try after sometimes."
    );
  }
};

const initializeTransaction = async (transactionData) => {
  const token = await authenticateMonnify();
  const {
    asset,
    totalAmount,
    email,
    phone,
    paymentReference,
    paymentDescription,
    buyerName,
  } = transactionData;
  try {
    const metaData = {
>>>>>>> ddf3abc22a54fd50e6e13b301a595653a8293998
      totalAmount: totalAmount.toString(),
      paymentReference: paymentReference.toString(),
      phone: phone.toString(),
      email,
<<<<<<< HEAD
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

=======
      asset: JSON.stringify(asset),
    };
    const paymentData = {
      amount: totalAmount,
      customerName: buyerName,
      customerEmail: email,
      paymentReference: paymentReference.toString(),
      paymentDescription,
      currencyCode: "NGN",
      contractCode: MONNIFY_CONTRACT_CODE,
      redirectUrl: `${credentials.appUrl}/verify-pay`,
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER", "USSD"],
    };

    const response = await axios.post(
      "https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction",
      {
        ...paymentData,
        metaData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Transfer Response:", response.data.responseBody);
    return response.data.responseBody;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error(
      "Error processing your transaction. Please try after sometimes."
    );
  }
};

const makeTransfer = async (
  amount,
  reference,
  narration,
  bankCode,
  accountNumber,
  currency
) => {
  const monnifyApiUrl =
    "https://sandbox.monnify.com/api/v2/disbursements/single";
  const token = await authenticateMonnify();

  const payload = {
    amount: 5000, // Amount in NGN
    reference: "transfer_123456789", // Unique transfer reference
    narration: "Payment for services",
    destinationBankCode: "044", // Bank code (e.g., 044 for Access Bank)
    destinationAccountNumber: "0123456789", // Recipient account number
    currency: "NGN",
    sourceAccountNumber: "MAIN_ACCOUNT", // Use "MAIN_ACCOUNT" for transfers from your Monnify main account
  };

  try {
    const response = await axios.post(monnifyApiUrl, payload, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    console.log("Transfer Response:", response.data);
    return "Transfer Response:", response.data;
  } catch (error) {
    console.error(
      "Error making transfer:",
      error.response?.data || error.message || error
    );
    throw new Error(
      "Error processing your transaction. Please try after sometimes."
    );
  }
};

async function verifyPayment(reference) {
  const monnifyBaseUrl =
    "https://sandbox.monnify.com/api/v2/merchant/transactions";
  const token = await authenticateMonnify();

  // Correct endpoint for verifying a transaction by payment reference
  const response = await axios.get(
    `${monnifyBaseUrl}/query?paymentReference=${reference}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.responseBody;
}

const getMonnifyBanks = async () => {
  try {
    const token = await authenticateMonnify();

    const response = await axios.get("https://api.monnify.com/api/v1/banks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.responseBody; // Array of banks with name and code
  } catch (error) {
    console.error(
      "Failed to fetch banks:",
      error.response?.data || error.message
    );
    throw new Error("Unable to fetch bank list from Monnify");
  }
};

async function convertUsdToNgn(usdAmount) {
  const API_URL = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${API_KEY}&symbols=NGN`;
  try {
    const response = await axios.get(API_URL);

    const rate = parseFloat(response.data.rates.NGN);
>>>>>>> ddf3abc22a54fd50e6e13b301a595653a8293998
    if (isNaN(rate)) {
      throw new Error("Invalid NGN rate from API");
    }

<<<<<<< HEAD
    const convertedAmount = Math.round(usdAmount * rate);

    return { convertedAmount, currency: countryInfo.currency_code };
=======
    const convertedAmount =Math.round(usdAmount * rate);
  
    return convertedAmount;
>>>>>>> ddf3abc22a54fd50e6e13b301a595653a8293998
  } catch (error) {
    console.error("Currency conversion error:", error.message);
    throw error;
  }
}

module.exports = {
  initializeTransaction,
<<<<<<< HEAD
  verifyPayment,
  makeTransfer,
  verifyTransfer,
  convertToLocalCurrency,
=======
  makeTransfer,
  verifyPayment,
  getMonnifyBanks,
  convertUsdToNgn
>>>>>>> ddf3abc22a54fd50e6e13b301a595653a8293998
};
