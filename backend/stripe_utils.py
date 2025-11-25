"""
Stripe utility functions for creating checkout sessions and verifying webhooks.
"""
import stripe
from stripe import StripeError
import os
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Load Stripe API key from environment
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Credit pack pricing (in cents)
CREDIT_PACKS = {
    "1": {"credits": 1, "price": 199},      # $1.99
    "5": {"credits": 5, "price": 799},      # $7.99
    "12": {"credits": 12, "price": 1599},   # $15.99
}


def create_checkout_session(
    session_id: str,
    pack: str,
    success_url: str,
    cancel_url: str
) -> Dict[str, str]:
    """
    Create a Stripe Checkout session for purchasing credits.
    
    Args:
        session_id: Application session ID
        pack: Credit pack size ("1", "5", or "12")
        success_url: URL to redirect after successful payment
        cancel_url: URL to redirect if payment is cancelled
    
    Returns:
        Dict with 'checkout_url' key
    
    Raises:
        ValueError: If pack is invalid
        StripeError: If Stripe API call fails
    """
    if pack not in CREDIT_PACKS:
        raise ValueError(f"Invalid pack: {pack}. Must be one of {list(CREDIT_PACKS.keys())}")
    
    pack_info = CREDIT_PACKS[pack]
    
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"{pack_info['credits']} Resume Credits",
                            "description": f"Credits for generating improved resume documents",
                        },
                        "unit_amount": pack_info["price"],
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "app_session_id": session_id,
                "credits": str(pack_info["credits"]),
            },
        )
        
        logger.info(
            f"Created Stripe Checkout session {checkout_session.id} "
            f"for app session {session_id}, pack: {pack}"
        )
        
        return {"checkout_url": checkout_session.url}
    
    except StripeError as e:
        logger.error(f"Stripe error creating checkout session: {e}")
        raise


def verify_webhook_signature(
    payload: bytes,
    signature: str,
    webhook_secret: Optional[str] = None
) -> stripe.Event:
    """
    Verify Stripe webhook signature and construct event.
    
    Args:
        payload: Raw request body
        signature: Stripe-Signature header value
        webhook_secret: Webhook signing secret (defaults to env var)
    
    Returns:
        Verified Stripe Event object
    
    Raises:
        StripeError: If signature is invalid
    """
    if webhook_secret is None:
        webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    if not webhook_secret:
        raise ValueError("STRIPE_WEBHOOK_SECRET not configured")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, webhook_secret
        )
        logger.info(f"Verified webhook event: {event['type']}")
        return event
    
    except StripeError as e:
        logger.error(f"Invalid webhook signature: {e}")
        raise


def get_checkout_url_for_session(session_id: str, pack: str, base_url: str) -> str:
    """
    Generate a checkout URL for a specific session and pack.
    
    Args:
        session_id: Application session ID
        pack: Credit pack size
        base_url: Base URL of the application
    
    Returns:
        Checkout URL string
    """
    success_url = f"{base_url}/success?session_id={session_id}"
    cancel_url = f"{base_url}/cancel?session_id={session_id}"
    
    result = create_checkout_session(session_id, pack, success_url, cancel_url)
    return result["checkout_url"]
