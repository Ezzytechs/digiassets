const axios = require("axios");
require("dotenv").config();
const credentials = require("../configs/credentials");
const { MONNIFY_API_KEY, MONNIFY_SECRET_KEY, MONNIFY_CONTRACT_CODE } =
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
  } = transactionData;
  try {
 const metaData = {
  totalAmount: totalAmount.toString(),
  paymentReference: paymentReference.toString()+"Hello",
  phone: phone.toString(),
  email: email,
  asset: typeof asset === "string" ? asset : JSON.stringify(asset),
};

// console.log(transactionData)
const paymentData = {
      amount:totalAmount,
      customerName:"James Ezekiel",
      customerEmail:email,
      paymentReference:paymentReference.toString(),
      paymentDescription,
      currencyCode: "NGN",
      contractCode: MONNIFY_CONTRACT_CODE,
      redirectUrl: `${credentials.siteURL}/verify-pay`,
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER", "USSD"],
    };
    // const paymentData = {
    //   amount: totalAmount,
    //   customerName: "James Ezekiel",
    //   customerEmail: email,
    //   paymentReference,
    //   paymentDescription,
    //   currencyCode: "NGN",
    //   contractCode: MONNIFY_CONTRACT_CODE,
    //   redirectUrl: `${credentials.siteURL}/verify-pay`,
    //   paymentMethods: ["CARD", "ACCOUNT_TRANSFER", "USSD"],
    // };


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

module.exports = {
  initializeTransaction,
  makeTransfer,
  verifyPayment,
  getMonnifyBanks,
};
