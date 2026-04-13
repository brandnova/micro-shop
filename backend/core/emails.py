from django.core.mail import send_mail
from django.conf import settings


SITE_URL = getattr(settings, 'FRONTEND_URL', 'http://localhost:8000')


def _send(subject, message, recipient):
    """Central send wrapper — never raises, always fails silently."""
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=True,
        )
    except Exception:
        pass


def _store_name():
    try:
        from .models import SiteSettings
        s = SiteSettings.objects.first()
        return s.site_title if s else "MicroShop"
    except Exception:
        return "MicroShop"


def _owner_email():
    try:
        from .models import SiteSettings
        s = SiteSettings.objects.first()
        return s.contact_email if s and s.contact_email else None
    except Exception:
        return None


def _format_items(transaction):
    try:
        items = transaction.items.all()
        if not items.exists():
            return "  (No items listed)"
        lines = []
        for item in items:
            price = item.price if item.price is not None else 0
            lines.append(
                f"  • {item.product_name} × {item.quantity}  —  ₦{price:,}"
            )
        return "\n".join(lines)
    except Exception:
        return "  (Item details unavailable)"


# ─── Customer emails ──────────────────────────────────────────────────────────

def send_order_placed_email(transaction):
    """
    Sent to the customer immediately after checkout.
    Tells them their order is received and walks them through the next step:
    make the bank transfer and upload proof.
    """
    subject = f"Order Received — {transaction.tracking_code}"
    message = f"""Hi {transaction.name},

Your order has been received. Here is everything you need to complete it.

────────────────────────
ORDER SUMMARY
────────────────────────
Tracking Code : {transaction.tracking_code}
Order Total   : ₦{transaction.total_amount:,}
Status        : Pending Payment

Items:
{_format_items(transaction)}
{f"{chr(10)}Your Note: {transaction.note}{chr(10)}" if transaction.note else ""}
────────────────────────
WHAT TO DO NEXT
────────────────────────
Step 1 — Make your payment

  Transfer exactly ₦{transaction.total_amount:,} to our bank account.
  You can find our account details on the store's Payment Info page.

Step 2 — Upload your payment receipt

  Once you have made the transfer, upload your receipt so we can
  confirm your payment quickly:

    1. Visit {SITE_URL}
    2. Click "Upload Proof" in the navigation menu
    3. Enter your tracking code: {transaction.tracking_code}
    4. Attach your transfer screenshot or PDF and submit

Step 3 — Wait for confirmation

  We will review your payment and send you an email confirmation.
  You will then receive further updates as your order is processed
  and dispatched.

────────────────────────
TRACK YOUR ORDER
────────────────────────
You can check your order status at any time:

  1. Visit {SITE_URL}
  2. Click "Track Order" in the navigation menu
  3. Enter your tracking code: {transaction.tracking_code}

Save this email — your tracking code is the only reference you need.

Regards,
{_store_name()}
"""
    _send(subject, message, transaction.email)


def send_payment_uploaded_email(transaction):
    """
    Sent to the customer after they submit their payment proof.
    Reassures them and sets expectations for what comes next.
    """
    subject = f"Payment Proof Received — {transaction.tracking_code}"
    message = f"""Hi {transaction.name},

We have received your payment proof for order {transaction.tracking_code}.

Our team will review it shortly. You will receive an email confirmation
once your payment has been verified.

────────────────────────
WHAT HAPPENS NEXT
────────────────────────
  1. We review your payment proof (usually within 1 business day)
  2. We send you a Payment Confirmed email
  3. Your order enters processing and is prepared for dispatch
  4. You receive a Shipped notification with delivery details
  5. Once delivered, you will receive a final confirmation email —
     or you can confirm receipt yourself from the Track Order screen

────────────────────────
ORDER SUMMARY
────────────────────────
Tracking Code : {transaction.tracking_code}
Order Total   : ₦{transaction.total_amount:,}
Status        : Payment Under Review

Items:
{_format_items(transaction)}

────────────────────────
TRACK YOUR ORDER
────────────────────────
  Visit {SITE_URL} → Click "Track Order" → Enter: {transaction.tracking_code}

Regards,
{_store_name()}
"""
    _send(subject, message, transaction.email)


def send_status_update_email(transaction):
    """
    Sent to the customer on every status change.
    Each status gets its own message with the correct next-step instructions.
    """
    status_content = {
        'payment_confirmed': (
            "Payment Confirmed — Your Order is Being Prepared",
            f"""Great news — your payment has been confirmed.

We are now preparing your order for dispatch.

Order Total : ₦{transaction.total_amount:,}
Status      : Payment Confirmed

────────────────────────
WHAT HAPPENS NEXT
────────────────────────
Your order will be packed and you will receive a Shipped notification
once it is on its way. Keep an eye on your inbox.

────────────────────────
TRACK YOUR ORDER
────────────────────────
  Visit {SITE_URL} → Click "Track Order" → Enter: {transaction.tracking_code}"""
        ),

        'processing': (
            "Your Order is Being Processed",
            f"""Your order is currently being packed and prepared for dispatch.

Order Total : ₦{transaction.total_amount:,}
Status      : Processing

────────────────────────
WHAT HAPPENS NEXT
────────────────────────
Once your order is ready to ship, you will receive a Shipped notification.

────────────────────────
TRACK YOUR ORDER
────────────────────────
  Visit {SITE_URL} → Click "Track Order" → Enter: {transaction.tracking_code}"""
        ),

        'shipped': (
            "Your Order Has Been Shipped",
            f"""Your order is on its way!

Order Total : ₦{transaction.total_amount:,}
Status      : Shipped

────────────────────────
WHAT HAPPENS NEXT
────────────────────────
Once your order arrives, you will receive a Delivered confirmation email.

If you receive your order but have not gotten a delivery confirmation
email within 24 hours, please confirm receipt yourself:

  1. Visit {SITE_URL}
  2. Click "Track Order" in the navigation menu
  3. Enter your tracking code: {transaction.tracking_code}
  4. Click "Mark as Received" at the bottom of the tracking screen

This helps us keep your order record accurate and closes out your order.

────────────────────────
TRACK YOUR ORDER
────────────────────────
  Visit {SITE_URL} → Click "Track Order" → Enter: {transaction.tracking_code}"""
        ),

        'delivered': (
            "Your Order Has Been Delivered",
            f"""Your order has been marked as delivered. We hope everything
arrived in perfect condition.

Order Total : ₦{transaction.total_amount:,}
Status      : Delivered

Thank you for shopping with {_store_name()}. We hope to see you again!

────────────────────────
QUESTIONS OR ISSUES?
────────────────────────
If you have any concerns about your order, please contact us and
reference your tracking code: {transaction.tracking_code}"""
        ),

        'cancelled': (
            "Order Cancelled",
            f"""Your order {transaction.tracking_code} has been cancelled.

Order Total : ₦{transaction.total_amount:,}
Status      : Cancelled

If you believe this is a mistake or have questions, please contact us
and quote your tracking code: {transaction.tracking_code}

────────────────────────
TRACK YOUR ORDER
────────────────────────
  Visit {SITE_URL} → Click "Track Order" → Enter: {transaction.tracking_code}"""
        ),
    }

    if transaction.status not in status_content:
        return

    subject_line, body = status_content[transaction.status]
    subject = f"{subject_line} — {transaction.tracking_code}"
    message = f"""Hi {transaction.name},

{body}

Regards,
{_store_name()}
"""
    _send(subject, message, transaction.email)


# ─── Store owner emails ───────────────────────────────────────────────────────

def send_owner_new_order_email(transaction):
    """
    Sent to the store owner when a new order is placed.
    """
    owner = _owner_email()
    if not owner:
        return

    subject = f"New Order — {transaction.tracking_code}"
    message = f"""A new order has been placed on {_store_name()}.

────────────────────────
ORDER DETAILS
────────────────────────
Tracking Code : {transaction.tracking_code}
Customer      : {transaction.name}
Email         : {transaction.email}
Phone         : {transaction.phone}
Location      : {transaction.location}
Order Total   : ₦{transaction.total_amount:,}

Items:
{_format_items(transaction)}
{f"{chr(10)}Customer Note: {transaction.note}{chr(10)}" if transaction.note else ""}
────────────────────────
ACTION REQUIRED
────────────────────────
Await payment proof from the customer, then confirm payment and
update the order status from your store admin:

  {SITE_URL}/store-admin

Regards,
{_store_name()} Notifications
"""
    _send(subject, message, owner)


def send_owner_payment_proof_email(transaction):
    """
    Sent to the store owner when a customer uploads their payment proof.
    This is the signal to review and confirm the payment.
    """
    owner = _owner_email()
    if not owner:
        return

    subject = f"Payment Proof Submitted — {transaction.tracking_code}"
    message = f"""A customer has uploaded payment proof for order {transaction.tracking_code}.

────────────────────────
ORDER DETAILS
────────────────────────
Tracking Code : {transaction.tracking_code}
Customer      : {transaction.name}
Email         : {transaction.email}
Phone         : {transaction.phone}
Order Total   : ₦{transaction.total_amount:,}

Items:
{_format_items(transaction)}

────────────────────────
ACTION REQUIRED
────────────────────────
Log into your store admin to review the payment proof and update
the order status to "Payment Confirmed" once verified:

  {SITE_URL}/store-admin

You can view the uploaded payment proof directly from the order
details in your admin dashboard.

Regards,
{_store_name()} Notifications
"""
    _send(subject, message, owner)