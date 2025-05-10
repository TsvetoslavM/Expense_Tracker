import unittest
import pandas as pd
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from app.services.report_generator import generate_csv, generate_pdf

class TestReportGenerator(unittest.TestCase):
    
    def test_generate_csv_with_valid_data(self):
        # Arrange
        test_data = [
            {"date": "2023-01-01", "category": "Food", "amount": 100.50, "description": "Groceries"},
            {"date": "2023-01-15", "category": "Transport", "amount": 50.25, "description": "Gas"}
        ]
        
        # Act
        csv_content = generate_csv(test_data)
        
        # Assert
        # Convert back to dataframe to validate content
        df = pd.read_csv(io.StringIO(csv_content))
        self.assertEqual(len(df), 2)
        self.assertIn("date", df.columns)
        self.assertIn("category", df.columns)
        self.assertIn("amount", df.columns)
        self.assertIn("description", df.columns)
        self.assertEqual(df.iloc[0]["amount"], 100.50)
        self.assertEqual(df.iloc[1]["description"], "Gas")
    
    def test_generate_csv_with_empty_data(self):
        # Arrange
        test_data = []
        
        # Act
        csv_content = generate_csv(test_data)
        
        # Assert
        df = pd.read_csv(io.StringIO(csv_content)) if csv_content.strip() else pd.DataFrame()
        self.assertEqual(len(df), 0)
    
    def test_generate_pdf_with_valid_data(self):
        # Arrange
        test_data = [
            {"date": "2023-01-01", "category": "Food", "amount": 100.50, "description": "Groceries"},
            {"date": "2023-01-15", "category": "Transport", "amount": 50.25, "description": "Gas"}
        ]
        
        # Act
        pdf_bytes = generate_pdf(test_data)
        
        # Assert
        # Check that bytes were returned
        self.assertIsInstance(pdf_bytes, bytes)
        # Check that PDF content starts with the PDF header signature
        self.assertTrue(pdf_bytes.startswith(b'%PDF'))
    
    def test_generate_pdf_with_empty_data(self):
        # Arrange
        test_data = []
        
        # Act
        pdf_bytes = generate_pdf(test_data)
        
        # Assert
        self.assertIsInstance(pdf_bytes, bytes)
        self.assertTrue(pdf_bytes.startswith(b'%PDF'))

if __name__ == "__main__":
    unittest.main() 