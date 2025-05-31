from datetime import datetime, timedelta
import logging
from pathlib import Path
from typing import Any, Dict, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import BackgroundTasks, HTTPException, status
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
    
    Args:
        background_tasks: FastAPI BackgroundTasks for async processing.
        subject: Email subject line.
        email_to: Recipient email address.
        body: Email body content.
        template_name: Jinja2 template name.
    """
    # Check if email settings are configured
    if not all([settings.MAIL_USERNAME, settings.MAIL_PASSWORD, settings.MAIL_SERVER]):
        logger.warning("Email settings not configured. Email would not be sent.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email service is not configured. Please contact the administrator."
        )

    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
        msg['To'] = email_to
        msg['Subject'] = subject

        # Render template
        template = templates.get_template(template_name)
        html_content = template.render(**body)
        
        # Attach HTML content
        msg.attach(MIMEText(html_content, 'html'))

        # Connect to SMTP server
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            if settings.MAIL_TLS:
                server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.send_message(msg)
            
        logger.info(f"Email sent successfully to {email_to}")
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email. Please try again later."
        )


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
    # Check if email settings are configured
    if not all([settings.MAIL_USERNAME, settings.MAIL_PASSWORD, settings.MAIL_SERVER]):
        logger.warning("Email settings are not configured. Password reset email will not be sent.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email service is not configured. Please contact the administrator."
        )

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