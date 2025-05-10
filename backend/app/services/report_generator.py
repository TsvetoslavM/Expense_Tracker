from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO, StringIO
import pandas as pd
from typing import List, Dict

def generate_csv(data: List[Dict]) -> str:
    df = pd.DataFrame(data)
    output = StringIO()
    df.to_csv(output, index=False)
    return output.getvalue()

def generate_pdf(data: List[Dict]) -> bytes:
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    p.setFont("Helvetica", 12)
    y = height - 40
    p.drawString(30, y, "Expense Report")
    y -= 30

    if not data:
        p.drawString(30, y, "No data available.")
    else:
        for row in data:
            line = ", ".join(f"{k}: {v}" for k, v in row.items())
            p.drawString(30, y, line)
            y -= 20
            if y < 40:
                p.showPage()
                y = height - 40

    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer.read()
