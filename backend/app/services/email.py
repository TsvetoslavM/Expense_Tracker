from datetime import datetime, timedelta
import logging
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import BackgroundTasks
from fastapi.templating import Jinja2Templates
from pydantic import EmailStr
import jwt

from app.core.config import settings

# Set up logging
logger = logging.getLogger(__name__)

# Set up Jinja2 templates
templates = Jinja2Templates(directory=Path(__file__).parent / "../templates")


def generate_password_reset_token(email: str) -> str:
    """
    Generate a JWT token for password reset that expires in 24 hours.
    
    Args:
        email: The user's email address.
        
    Returns:
        A JWT token.
    """
    delta = timedelta(hours=24)
    now = datetime.utcnow()
    expires = now + delta
    
    encoded_jwt = jwt.encode(
        {
            "exp": expires.timestamp(),
            "nbf": now.timestamp(),
            "sub": email,
            "type": "password_reset"
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verify the password reset token and return the user's email if valid.
    
    Args:
        token: The JWT token to verify.
        
    Returns:
        The user's email if the token is valid, None otherwise.
    """
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if decoded_token["type"] != "password_reset":
            return None
        return decoded_token["sub"]
    except jwt.PyJWTError:
        return None


async def send_email(
    background_tasks: BackgroundTasks,
    subject: str,
    email_to: EmailStr,
    body: Dict[str, Any],
    template_name: str = "email.html"
) -> None:
    """
    Send an email using the configured email settings.
    This is a placeholder function that logs the email content.
    In a production environment, you would implement actual email sending here.
    
    Args:
        background_tasks: FastAPI BackgroundTasks for async processing.
        subject: Email subject line.
        email_to: Recipient email address.
        body: Email body content.
        template_name: Jinja2 template name.
    """
    # In development, we'll just log that we would send an email
    logger.info(
        f"Would send email to {email_to} with subject: {subject}\n"
        f"Body: {body}\n"
        f"Using template: {template_name}"
    )
    
    # Check if email settings are configured
    if not settings.MAIL_USERNAME or not settings.MAIL_SERVER:
        logger.warning("Email settings not configured. Email would not be sent in production.")
        return
    
    # In a real implementation, you would add code here to:
    # 1. Render the email template with Jinja2
    # 2. Connect to the SMTP server
    # 3. Send the email
    # 4. Handle any errors
    
    # For example with libraries like:
    # - smtplib for SMTP
    # - email.mime for message composition
    # Or use a third-party service like SendGrid, Mailgun, etc.
    
    # Adding this function to background tasks would allow it to run asynchronously
    # background_tasks.add_task(actual_send_function, ...)
    
    # Simulate successful sending
    logger.info(f"Email to {email_to} would be sent successfully")


async def send_password_reset_email(
    background_tasks: BackgroundTasks,
    email_to: EmailStr,
    token: str
) -> None:
    """
    Send a password reset email with a link containing the reset token.
    
    Args:
        background_tasks: FastAPI BackgroundTasks for async processing.
        email_to: Recipient email address.
        token: Password reset token.
    """
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    subject = f"{settings.APP_NAME} - Password Reset"
    
    body = {
        "project_name": settings.APP_NAME,
        "email": email_to,
        "valid_hours": 24,
        "reset_link": reset_link,
    }
    
    await send_email(
        background_tasks=background_tasks,
        subject=subject,
        email_to=email_to,
        body=body,
        template_name="password_reset.html"
    ) 