from django.core.mail import send_mail
from django.conf import settings


SITE_URL = getattr(settings, 'FRONTEND_URL', 'http://localhost:8000')

# In production, FRONTEND_URL in .env should be your actual domain e.g. https://myshop.com
# The tracking/upload flow happens on the same domain — users just visit the site.


def _send(subject, message, recipient):
    """Thin wrapper so fail_silently is centralised."""
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=True,
        )
    except Exception:
        pass  # Never let email failures break the main flow


def send_order_placed_email(transaction):
    subject = f"Order Received — {transaction.tracking_code}"
    message = f"""Hi {transaction.name},

Your order has been received. Here's what to do next.

────────────────────────
ORDER SUMMARY
────────────────────────
Tracking Code : {transaction.tracking_code}
Order Total   : ₦{transaction.total_amount:,}
Status        : Pending Payment

Items:
{_format_items(transaction)}

────────────────────────
NEXT STEP: MAKE PAYMENT
────────────────────────
Transfer your order total to our bank account. You can find the bank
details on our website under "Payment Info" in the navigation menu.

After transferring, upload your payment receipt on our website:

  1. Go to {SITE_URL}
  2. Click "Upload Proof" in the navigation menu
  3. Enter your tracking code: {transaction.tracking_code}
  4. Attach your payment screenshot or PDF and submit

Once we confirm your payment, we will begin processing your order.

────────────────────────
TRACK YOUR ORDER
────────────────────────
You can check your order status at any time:

  1. Go to {SITE_URL}
  2. Click "Track Order" in the navigation menu
  3. Enter your tracking code: {transaction.tracking_code}

Save this email — your tracking code is the only thing you need.

Regards,
{_store_name()}
"""
    _send(subject, message, transaction.email)


def send_payment_uploaded_email(transaction):
    subject = f"Payment Proof Received — {transaction.tracking_code}"
    message = f"""Hi {transaction.name},

We have received your payment proof for order {transaction.tracking_code}.

Our team will review it shortly. Once confirmed, we will begin
processing your order and notify you by email.

You can track your order status at any time:

  1. Go to {SITE_URL}
  2. Click "Track Order" in the navigation menu
  3. Enter your tracking code: {transaction.tracking_code}

────────────────────────
ORDER SUMMARY
────────────────────────
Tracking Code : {transaction.tracking_code}
Order Total   : ₦{transaction.total_amount:,}
Status        : Payment Under Review

Items:
{_format_items(transaction)}

Regards,
{_store_name()}
"""
    _send(subject, message, transaction.email)


def send_status_update_email(transaction):
    """Called on any status change. Message adapts to the new status."""
    status_messages = {
        'payment_confirmed': (
            "Payment Confirmed",
            f"""Great news — your payment has been confirmed.

We are now preparing your order for dispatch.

Order Total   : ₦{transaction.total_amount:,}
Status        : Payment Confirmed"""
        ),
        'processing': (
            "Order is Being Processed",
            f"""Your order is currently being packed and prepared.

Order Total   : ₦{transaction.total_amount:,}
Status        : Processing"""
        ),
        'shipped': (
            "Your Order Has Been Shipped",
            f"""Your order is on its way!

Order Total   : ₦{transaction.total_amount:,}
Status        : Shipped

You will receive another update when it is delivered."""
        ),
        'delivered': (
            "Your Order Has Been Delivered",
            f"""Your order has been marked as delivered.

Order Total   : ₦{transaction.total_amount:,}
Status        : Delivered

Thank you for shopping with us. We hope to see you again!"""
        ),
        'cancelled': (
            "Order Cancelled",
            f"""Your order {transaction.tracking_code} has been cancelled.

Order Total   : ₦{transaction.total_amount:,}
Status        : Cancelled

If you believe this is a mistake or have questions, please
contact us and reference your tracking code."""
        ),
    }

    if transaction.status not in status_messages:
        return  # Don't send for statuses handled by dedicated functions

    status_label, body = status_messages[transaction.status]
    subject = f"{status_label} — {transaction.tracking_code}"
    message = f"""Hi {transaction.name},

{body}

────────────────────────
You can track your order at any time:

  1. Go to {SITE_URL}
  2. Click "Track Order" in the navigation menu
  3. Enter your tracking code: {transaction.tracking_code}

Regards,
{_store_name()}
"""
    _send(subject, message, transaction.email)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _format_items(transaction):
    try:
        items = transaction.items.all()
        if not items.exists():
            return "  (No items listed)"
        lines = []
        for item in items:
            lines.append(f"  • {item.product_name} × {item.quantity}  —  ₦{item.price:,}")
        return "\n".join(lines)
    except Exception:
        return "  (Item details unavailable)"


def _store_name():
    try:
        from .models import SiteSettings
        s = SiteSettings.objects.first()
        return s.site_title if s else "MicroShop"
    except Exception:
        return "MicroShop"