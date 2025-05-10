import calendar
from datetime import datetime, date
from typing import Tuple


def get_month_date_range(year: int, month: int) -> Tuple[str, str]:
    """
    Get the first and last day of a month as strings in format YYYY-MM-DD.
    
    Args:
        year: The year
        month: The month (1-12)
        
    Returns:
        Tuple containing first day and last day strings in format YYYY-MM-DD
    """
    # Validate month
    if month < 1 or month > 12:
        raise ValueError("Month must be between 1 and 12")
    
    # Get first day of month
    first_day = date(year, month, 1)
    
    # Get last day of month
    _, last_day_num = calendar.monthrange(year, month)
    last_day = date(year, month, last_day_num)
    
    # Return as strings in ISO format (YYYY-MM-DD)
    return first_day.isoformat(), last_day.isoformat()


def format_date(date_str: str, output_format: str = "%b %d, %Y") -> str:
    """
    Format a date string into a more readable format.
    
    Args:
        date_str: Date string in format YYYY-MM-DD
        output_format: Output date format (default: "%b %d, %Y")
        
    Returns:
        Formatted date string
    """
    try:
        # Parse the input date string
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        
        # Format to the desired output format
        return dt.strftime(output_format)
    except ValueError:
        # Return original string if it can't be parsed
        return date_str


def get_current_month_year() -> Tuple[int, int]:
    """
    Get the current month and year.
    
    Returns:
        Tuple containing (year, month)
    """
    now = datetime.now()
    return now.year, now.month


def get_month_name(month: int) -> str:
    """
    Get the name of a month from its number.
    
    Args:
        month: Month number (1-12)
        
    Returns:
        Month name
    """
    if month < 1 or month > 12:
        raise ValueError("Month must be between 1 and 12")
    
    return calendar.month_name[month] 