#!/bin/bash

# Stripe Checkout Payment Flow Test Script
# This script demonstrates the complete payment flow with curl commands

set -e  # Exit on error

echo "========================================"
echo "Stripe Checkout Payment Flow Test"
echo "========================================"
echo ""

# Configuration
BASE_URL="http://localhost:8000"
SESSION_ID="test-session-$(date +%s)"

# TODO: Replace these with your actual Stripe keys
# Get these from: https://dashboard.stripe.com/test/apikeys
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

echo "Using test session ID: $SESSION_ID"
echo "Base URL: $BASE_URL"
echo ""

# ==================== Step 1: Create a test session ====================
echo "Step 1: Creating test session in database..."
echo "--------------------------------------------"

# Simulate session creation (like after resume upload)
# In production, this would happen during /upload endpoint
sqlite3 backend/sessions.db <<EOF
INSERT OR REPLACE INTO sessions (session_id, improved_text, credits, created_at)
VALUES ('$SESSION_ID', 'Sample improved resume text...', 1, datetime('now'));
EOF

echo "✓ Created session with 1 free credit"
echo ""

# ==================== Step 2: Check session info ====================
echo "Step 2: Checking session info..."
echo "--------------------------------------------"

curl -s -X GET "$BASE_URL/session/$SESSION_ID" | python3 -m json.tool

echo ""
echo ""

# ==================== Step 3: Create Stripe Checkout session ====================
echo "Step 3: Creating Stripe Checkout session..."
echo "--------------------------------------------"

CHECKOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/create-checkout" \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"pack\": \"5\"
  }")

echo "$CHECKOUT_RESPONSE" | python3 -m json.tool

CHECKOUT_URL=$(echo "$CHECKOUT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['checkout_url'])" 2>/dev/null || echo "")

if [ -n "$CHECKOUT_URL" ]; then
    echo ""
    echo "✓ Checkout URL created:"
    echo "  $CHECKOUT_URL"
    echo ""
    echo "  Open this URL in a browser to complete test payment"
    echo "  Use test card: 4242 4242 4242 4242"
    echo ""
else
    echo "✗ Failed to create checkout session"
    echo "  Make sure STRIPE_SECRET_KEY is set in .env"
fi

echo ""

# ==================== Step 4: Simulate webhook (optional) ====================
echo "Step 4: Simulating webhook event..."
echo "--------------------------------------------"
echo "To test webhooks locally, use Stripe CLI:"
echo ""
echo "  1. Install Stripe CLI: https://stripe.com/docs/stripe-cli"
echo "  2. Login: stripe login"
echo "  3. Forward webhooks:"
echo "     stripe listen --forward-to $BASE_URL/webhook"
echo "  4. Trigger test event:"
echo "     stripe trigger checkout.session.completed"
echo ""
echo "Or manually simulate with curl (requires valid signature):"
echo ""
echo "curl -X POST $BASE_URL/webhook \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Stripe-Signature: t=...,v1=...' \\"
echo "  -d '{...event data...}'"
echo ""

# ==================== Step 5: Attempt download with 0 credits ====================
echo "Step 5: Testing /generate with insufficient credits..."
echo "--------------------------------------------"

# First, use up the free credit
echo "Using the 1 free credit..."
curl -s -X POST "$BASE_URL/generate" \
  -F "session_id=$SESSION_ID" \
  -F "filename=first_download.docx" \
  -o /dev/null

echo "✓ Downloaded with free credit"
echo ""

# Now try with 0 credits
echo "Attempting download with 0 credits (should return 402)..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/generate" \
  -F "session_id=$SESSION_ID" \
  -F "filename=resume.docx")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Response status: $HTTP_STATUS"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

if [ "$HTTP_STATUS" = "402" ]; then
    echo ""
    echo "✓ Correctly returned 402 with checkout URL"
else
    echo ""
    echo "✗ Expected HTTP 402, got $HTTP_STATUS"
fi

echo ""

# ==================== Step 6: Test watermarked download ====================
echo "Step 6: Testing watermarked download (no credits required)..."
echo "--------------------------------------------"

curl -s -X POST "$BASE_URL/generate-watermarked" \
  -F "session_id=$SESSION_ID" \
  -F "filename=watermarked_sample.docx" \
  -o watermarked_sample.docx

if [ -f "watermarked_sample.docx" ]; then
    echo "✓ Downloaded watermarked sample: watermarked_sample.docx"
    ls -lh watermarked_sample.docx
else
    echo "✗ Failed to download watermarked sample"
fi

echo ""

# ==================== Summary ====================
echo "========================================"
echo "Test Summary"
echo "========================================"
echo ""
echo "Session ID: $SESSION_ID"
echo ""
echo "To complete the payment flow:"
echo "  1. Open the checkout URL in a browser"
echo "  2. Use test card: 4242 4242 4242 4242"
echo "  3. Complete payment"
echo "  4. Webhook will automatically add credits"
echo "  5. Run /generate again to download with credits"
echo ""
echo "To add credits manually for testing:"
echo "  sqlite3 backend/sessions.db \"UPDATE sessions SET credits = 10 WHERE session_id = '$SESSION_ID'\""
echo ""
echo "To check current credits:"
echo "  curl -s $BASE_URL/session/$SESSION_ID | python3 -m json.tool"
echo ""
