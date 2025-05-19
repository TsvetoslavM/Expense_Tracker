import csv
import io
from datetime import datetime
from typing import List, Optional, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer

from app.models.expense import Expense
from app.models.user import User


def generate_csv(expenses: List[Expense], user: User) -> bytes:
    """Generate a CSV file with expense data."""
    try:
        # Create CSV file in memory
        output = io.StringIO()
        writer = csv.writer(output, delimiter='\t')
        
        # Write header row with proper spacing
        writer.writerow([
            "Date".ljust(15),
            "Category".ljust(15),
            "Description".ljust(20),
            "Amount".ljust(10),
            "Currency".ljust(10),
            "Notes".ljust(20)
        ])
        
        # Write expense data in columns with proper spacing
        for expense in expenses:
            writer.writerow([
                expense.date.strftime("%Y-%m-%d").ljust(15),
                (expense.category.name if expense.category else "N/A").ljust(15),
                (expense.description or "").ljust(20),
                f"{expense.amount:.2f}".ljust(10),
                expense.currency.ljust(10),
                (expense.notes or "").ljust(20)
            ])
        
        return output.getvalue().encode('utf-8')
    except Exception as e:
        print(f"Error generating CSV: {str(e)}")
        # Return basic CSV with error message if something goes wrong
        output = io.StringIO()
        writer = csv.writer(output, delimiter='\t')
        writer.writerow(["Error generating report", str(e)])
        return output.getvalue().encode('utf-8')


def generate_pdf(
    expenses: List[Expense], 
    category_summary: List[Any],
    year: int, 
    month: Optional[int], 
    user: User
) -> bytes:
    """Generate a PDF report with expense data and category summary."""
    try:
        # Get period description
        month_names = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"]
        period_desc = f"{year}" if not month else f"{month_names[month-1]} {year}"
        
        # Calculate total from category summary
        total_amount = sum(item.total_amount for item in category_summary)
        
        # Create PDF file in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = styles["Heading1"]
        subtitle_style = styles["Heading2"]
        normal_style = styles["Normal"]
        
        # Create elements for PDF
        elements = []
        
        # Add title
        elements.append(Paragraph(f"Expense Report", title_style))
        elements.append(Paragraph(f"Period: {period_desc}", subtitle_style))
        elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", normal_style))
        elements.append(Spacer(1, 12))
        
        # Add user info if available
        user_name = f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.email
        elements.append(Paragraph(f"User: {user_name}", normal_style))
        elements.append(Paragraph(f"Total Expenses: {total_amount:.2f} {user.preferred_currency}", subtitle_style))
        elements.append(Spacer(1, 12))
        
        # Add category summary
        elements.append(Paragraph("Expenses by Category:", subtitle_style))
        elements.append(Spacer(1, 6))
        
        if category_summary:
            category_data = [["Category", "Amount", "Percentage"]]
            for item in category_summary:
                percentage = (item.total_amount / total_amount * 100) if total_amount > 0 else 0
                category_data.append([
                    item.name,
                    f"{item.total_amount:.2f} {user.preferred_currency}",
                    f"{percentage:.2f}%",
                ])
            
            # Create category table
            category_table = Table(category_data)
            category_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(category_table)
        else:
            elements.append(Paragraph("No category data available for this period.", normal_style))
        
        elements.append(Spacer(1, 20))
        
        # Add expense details
        elements.append(Paragraph("Expense Details:", subtitle_style))
        elements.append(Spacer(1, 6))
        
        # Create expense table
        if expenses:
            expense_data = [["Date", "Category", "Description", "Amount"]]
            for expense in expenses:
                category_name = expense.category.name if expense.category else "N/A"
                expense_data.append([
                    expense.date.strftime("%Y-%m-%d"),
                    category_name,
                    expense.description or "N/A",
                    f"{expense.amount:.2f} {expense.currency}",
                ])
            
            expense_table = Table(expense_data)
            expense_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(expense_table)
        else:
            elements.append(Paragraph("No expenses found for this period.", normal_style))
        
        # Add footer
        elements.append(Spacer(1, 30))
        elements.append(Paragraph(f"Report generated by Expense Tracker - {datetime.now().strftime('%Y-%m-%d')}", normal_style))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        return buffer.getvalue()
    
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        # Create a simple error PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        
        elements = []
        elements.append(Paragraph("Error Generating Report", styles["Heading1"]))
        elements.append(Paragraph(f"An error occurred: {str(e)}", styles["Normal"]))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue() 