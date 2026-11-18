exports.handler = async (event, context) => {
  // CORS Error fix karne ke liye headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Browser pehle OPTIONS request bhejta hai, usko allow karo
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method Not Allowed" };

  try {
    // Frontend se data lo
    const { amount, userId, email, phone, orderId, returnUrl } = JSON.parse(event.body);
    
    // Cashfree ko request bhejo (sandbox mode)
    const response = await fetch("https://sandbox.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID,       // Key Netlify se aayegi
        "x-client-secret": process.env.CASHFREE_SECRET_KEY, // Key Netlify se aayegi
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_amount: amount,
        order_currency: "INR",
        order_id: orderId,
        customer_details: { customer_id: userId, customer_email: email, customer_phone: phone },
        order_meta: { return_url: `${returnUrl}?cf_order_id=${orderId}` },
      }),
    });

    const data = await response.json();
    
    // Wapas frontend ko bhejo
    return { 
        statusCode: response.status, 
        headers, 
        body: JSON.stringify(data) 
    };
  } catch (error) {
    return { 
        statusCode: 500, 
        headers, 
        body: JSON.stringify({ error: error.message }) 
    };
  }
};
