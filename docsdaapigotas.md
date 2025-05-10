API Reference
Comprehensive documentation for the Gotas Commerce REST API. All API requests are made to https://commerce.gotas.com.

Authentication
All API requests must include your API key in the x-api-key header.

curl -X GET "https://commerce.gotas.com/api/v1/payments" \
  -H "x-api-key: your_api_key"
API keys should be kept secure and never exposed in client-side code.

Endpoints
POST
/api/v1/payments
Create payment
Creates a new payment and generates a payment URL that can be used to redirect customers to the Gotas Commerce payment interface.

Request Parameters
Parameter	Type	Required	Description
amount	string	Yes	Payment amount (e.g., "100.00")
currency	string	Yes	Payment currency (currently only "USDT")
return_url	string	Yes	URL to redirect customer after payment
customer_email	string	No	Email address of the customer
client_reference_id	string	No	Your internal reference ID for this payment
description	string	No	Description of what is being paid for
Example Request
curl -X POST "https://commerce.gotas.com/api/v1/payments" \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "100.00",
    "currency": "USDT",
    "return_url": "https://yoursite.com/thank-you",
    "customer_email": "customer@example.com",
    "client_reference_id": "order-123",
    "description": "Purchase of Product X"
  }'
Response Parameters
Parameter	Type	Description
id	string	Unique payment identifier
amount	string	Payment amount
currency	string	Payment currency
status	string	Current payment status (pending, completed, failed, expired)
payment_url	string	URL to redirect customers to complete payment
expires_at	string	ISO timestamp when the payment expires
wallet_address	string	Destination wallet address
client_reference_id	string	Your internal reference ID
return_url	string	URL to redirect customer after payment
customer_email	string	Customer's email address
created_at	string	ISO timestamp when the payment was created
description	string	Description of what is being paid for
Example Response
{
  "id": "pay_123456789",
  "amount": "100.00",
  "currency": "USDT",
  "status": "pending",
  "payment_url": "https://commerce.gotas.com/pay?session=pay_123456789",
  "expires_at": "2025-06-01T12:34:56Z",
  "wallet_address": "0x123abc456def789abc123def456abc789def123",
  "client_reference_id": "order-123",
  "return_url": "https://yoursite.com/thank-you",
  "customer_email": "customer@example.com",
  "created_at": "2025-06-01T12:24:56Z",
  "description": "Purchase of Product X"
}
Error Codes
Status Code	Error Code	Description
400	VALIDATION_ERROR	Invalid or missing required fields
401	AUTHENTICATION_ERROR	Invalid or missing API key
429	RATE_LIMIT_EXCEEDED	Too many requests in a given time period
500	SERVER_ERROR	An error occurred on the server
POST
/api/v1/payment-intents
Create payment intent
Creates a payment intent for advanced frontend integrations. Payment intents provide greater flexibility in how you implement the payment experience.

Request Parameters
Parameter	Type	Required	Description
amount	string	Yes	Payment amount (e.g., "100.00")
currency	string	Yes	Payment currency (currently only "USDT")
return_url	string	Yes	URL to redirect customer after payment
customer_email	string	No	Email address of the customer
client_reference_id	string	No	Your internal reference ID for this payment
description	string	No	Description of what is being paid for
metadata	object	No	Additional metadata to store with the payment
webhook_url	string	No	URL to send webhook notifications for this specific payment
Example Request
curl -X POST "https://commerce.gotas.com/api/v1/payment-intents" \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "100.00",
    "currency": "USDT",
    "return_url": "https://yoursite.com/thank-you",
    "customer_email": "customer@example.com",
    "client_reference_id": "order-123",
    "description": "Purchase of Product X",
    "metadata": { "orderId": "12345" },
    "webhook_url": "https://yoursite.com/webhook"
  }'
Response Parameters
Parameter	Type	Description
id	string	Unique payment intent identifier
client_secret	string	Secret used to authenticate frontend operations
amount	string	Payment amount
currency	string	Payment currency
status	string	Current status (requires_payment, processing, succeeded, canceled)
payment_url	string	URL to redirect customers (empty if using SDK)
expires_at	string	ISO timestamp when the payment intent expires
wallet_address	string	Destination wallet address (populated when payment is initiated)
client_reference_id	string	Your internal reference ID
return_url	string	URL to redirect customer after payment
customer_email	string	Customer's email address
created_at	string	ISO timestamp when the payment intent was created
description	string	Description of what is being paid for
public_key	string	Public key for SDK integration
Example Response
{
  "id": "pi_123456789",
  "client_secret": "pi_cs_abcdefghijklmnopqrstuvwxyz",
  "amount": "100.00",
  "currency": "USDT",
  "status": "requires_payment",
  "payment_url": "",
  "expires_at": "2025-06-01T12:34:56Z",
  "wallet_address": "",
  "client_reference_id": "order-123",
  "return_url": "https://yoursite.com/thank-you",
  "customer_email": "customer@example.com",
  "created_at": "2025-06-01T12:24:56Z",
  "description": "Purchase of Product X",
  "public_key": "3f7b8a2e1d6c5f4e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3"
}
GET
/api/v1/payments/{id}
Check payment status
Retrieves the current status and details of a specific payment by its ID.

Path Parameters
Parameter	Type	Required	Description
id	string	Yes	The unique payment identifier
Example Request
curl -X GET "https://commerce.gotas.com/api/v1/payments/pay_123456789" \
  -H "x-api-key: your_api_key"
Example Response
{
  "id": "pay_123456789",
  "amount": "100.00",
  "currency": "USDT",
  "status": "completed",
  "payment_url": "https://commerce.gotas.com/pay?session=pay_123456789",
  "expires_at": "2025-06-01T12:34:56Z",
  "wallet_address": "0x123abc456def789abc123def456abc789def123",
  "client_reference_id": "order-123",
  "return_url": "https://yoursite.com/thank-you",
  "customer_email": "customer@example.com",
  "created_at": "2025-06-01T12:24:56Z",
  "description": "Purchase of Product X",
  "tx_hash": "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
  "completed_at": "2025-06-01T12:30:12Z"
}
Payment Status Definitions
Status	Description
pending	Payment has been created but not yet completed
processing	Payment is being processed on the blockchain
completed	Payment has been successfully completed
failed	Payment has failed due to an error
expired	Payment has expired without being completed
POST
/api/v1/webhooks
Register webhook
Registers a URL to receive webhook notifications when specific events occur in your Gotas Commerce account.

Request Parameters
Parameter	Type	Required	Description
url	string	Yes	The URL that will receive webhook events
events	array	Yes	Array of event types to subscribe to
description	string	No	Description of the webhook's purpose
generate_secret	boolean	No	Whether to generate a signing secret (default: true)
Example Request
curl -X POST "https://commerce.gotas.com/api/v1/webhooks" \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yoursite.com/webhook",
    "events": ["payment.completed", "payment.expired"],
    "description": "Payment notification webhook",
    "generate_secret": true
  }'
Response Parameters
Parameter	Type	Description
id	string	Unique webhook identifier
url	string	The URL that will receive webhook events
events	array	Array of event types this webhook is subscribed to
description	string	Description of the webhook's purpose
createdAt	string	ISO timestamp when the webhook was created
secret	string	Webhook signing secret (only returned once upon creation)
Example Response
{
  "id": "wh_123456789",
  "url": "https://yoursite.com/webhook",
  "events": ["payment.completed", "payment.expired"],
  "description": "Payment notification webhook",
  "createdAt": "2025-06-01T12:24:56Z",
  "secret": "whsec_123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
}
Rate Limits
To ensure the stability of our API, requests are subject to rate limiting. Current limits are 100 requests per minute per API key.

The following headers are included in API responses:

X-RateLimit-Limit: Maximum requests per minute
X-RateLimit-Remaining: Remaining requests in current period
X-RateLimit-Reset: Time in seconds until the limit resets


REFERENCIA: https://commerce.gotas.com/developer