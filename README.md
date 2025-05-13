<div align="center">

# 💰 Expense Tracker made by Tsvetoslav Makaveev

<img src="https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge" alt="Version 1.0.0"/>
<img src="https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge" alt="License MIT"/>

**Manage your finances with ease. Track expenses, set budgets, and visualize your financial journey.**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"/>
</p>

Check out [💰 Can try it 💰](https://expense-tracker-zwetoslaw-gmailcoms-projects.vercel.app/login).
</div>

## 📋 Features

- **📊 Dynamic Dashboard**: Get a visual overview of your financial health
- **💸 Expense Management**: Easily track where your money goes
- **💹 Budget Planning**: Set meaningful spending limits by category
- **📝 Detailed Reports**: Generate PDF and CSV reports of your finances
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🌈 Customizable Categories**: Organize expenses your way with colored categories
- **🔐 Secure Authentication**: Keep your financial data private


## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Python 3.9+
- npm or yarn

### Getting Started (All-in-One)

For convenience, you can start both services at once:

```bash
# Clone the repository
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker

# Start both backend and frontend
node start-dev.js
```

The frontend will be available at http://localhost:3000 and the backend at http://localhost:8000.

### Default Login

```
Email: test@example.com
Password: password123
```

## 🏛️ Architecture

This project is built with a modern, decoupled architecture:

- **Frontend**: Next.js application with TypeScript, TailwindCSS, and Shadcn UI
- **Backend**: FastAPI application with SQLAlchemy, Pydantic, and JWT authentication
- **Database**: SQLite by default (can be configured to use PostgreSQL)

## 📚 User Stories

### For Regular Users:
1. **Като нов потребител**, искам да се регистрирам в системата, за да започна да проследявам разходите си.
2. **Като регистриран потребител**, искам да вляза в системата чрез имейл и парола, за да достъпя данните си.
3. **Като потребител**, искам да мога да въвеждам нови разходи, за да следя къде отиват парите ми.
4. **Като потребител**, искам да категоризирам разходите си, за да имам по-добър поглед върху харченето си.
5. **Като потребител**, искам да виждам обобщение на разходите си на Dashboard, за да имам бърз поглед върху финансовото си състояние.
6. **Като потребител**, искам да задавам бюджети по категории, за да контролирам разходите си.
7. **Като потребител**, искам да генерирам отчети за определен период, за да анализирам финансовото си поведение.
8. **Като потребител**, искам да получавам известия, когато наближа или надвиша бюджета си, за да коригирам навиците си на харчене.
9. **Като потребител**, искам да мога да редактирам или изтривам разходи, в случай на грешка при въвеждането.
10. **Като потребител**, искам да мога да персонализирам категориите си с различни цветове, за да ги разпознавам по-лесно визуално.

### За Администратори:
11. **Като администратор**, искам да виждам списък на всички потребители, за да управлявам правилно системата.
12. **Като администратор**, искам да мога да деактивирам акаунти, ако е необходимо за сигурността на системата.
13. **Като администратор**, искам да имам достъп до статистика за използването на системата, за да оптимизирам работата й.

## 🔄 Use Cases

### UC1: Регистрация на нов потребител
**User**: Нерегистриран потребител
**Goal**: Създаване на нов акаунт в системата
**Precondition**: Потребителят има валиден имейл адрес
**Main Scenario**:
1. Потребителят посещава началната страница на приложението
2. Потребителят избира опцията "Регистрация"
3. Системата показва форма за регистрация
4. Потребителят въвежда своя имейл, парола и други изисквани данни
5. Потребителят изпраща формата
6. Системата валидира въведените данни
7. Системата създава нов акаунт и записва информацията в базата данни
8. Системата автоматично влиза потребителя в системата
9. Системата пренасочва потребителя към Dashboard
**Alternative Scenario**:
- Ако имейлът вече съществува, системата показва съобщение за грешка
- Ако паролата не отговаря на изискванията за сигурност, системата показва подходящо съобщение

### UC2: Въвеждане на нов разход
**User**: Регистриран потребител
**Goal**: Записване на нов разход в системата
**Precondition**: Потребителят е влязъл в системата
**Main Scenario**:
1. Потребителят избира опцията "Добави разход" от навигацията
2. Системата показва форма за въвеждане на разход
3. Потребителят въвежда сума, категория, дата и описание на разхода
4. Потребителят изпраща формата
5. Системата валидира въведените данни
6. Системата записва новия разход в базата данни
7. Системата показва съобщение за успешно добавяне
8. Системата обновява Dashboard с новата информация
**Alternative Scenario**:
- Ако въведените данни са невалидни, системата показва съобщение за грешка

### UC3: Задаване на бюджет
**User**: Регистриран потребител
**Goal**: Създаване на бюджет за определена категория разходи
**Precondition**: Потребителят е влязъл в системата и има създадени категории
**Main Scenario**:
1. Потребителят избира секцията "Бюджети" от навигацията
2. Системата показва списък с текущите бюджети и опция за добавяне на нов
3. Потребителят избира "Добави бюджет"
4. Системата показва форма за създаване на бюджет
5. Потребителят избира категория, период (месец/година) и максимална сума
6. Потребителят изпраща формата
7. Системата валидира въведените данни
8. Системата записва новия бюджет в базата данни
9. Системата показва актуализиран списък с бюджети
**Alternative Scenario**:
- Ако бюджет за същата категория и период вече съществува, системата предлага да го редактира

### UC4: Генериране на отчет
**User**: Регистриран потребител
**Goal**: Създаване на детайлен отчет за определен период
**Precondition**: Потребителят е влязъл в системата и има записани разходи
**Main Scenario**:
1. Потребителят избира секцията "Отчети" от навигацията
2. Системата показва опции за генериране на отчет
3. Потребителят избира тип отчет (PDF или CSV), период и други филтри
4. Потребителят избира "Генерирай отчет"
5. Системата обработва данните за избрания период
6. Системата генерира отчет във избрания формат
7. Системата предоставя отчета за изтегляне или визуализация
**Alternative Scenario**:
- Ако няма данни за избрания период, системата показва съответно съобщение

### UC5: Преглед на Dashboard
**User**: Регистриран потребител
**Goal**: Получаване на обобщена информация за финансовото състояние
**Precondition**: Потребителят е влязъл в системата
**Main Scenario**:
1. Потребителят избира "Dashboard" от навигацията или влиза в системата
2. Системата извлича данни за разходи, бюджети и други финансови показатели
3. Системата обработва данните и генерира различни графики и статистики
4. Системата показва информация за последните разходи, общата сума на разходите за текущия месец, прогрес на бюджетите и разпределение на разходите по категории
5. Потребителят може да избере различни филтри или периоди за визуализация
**Alternative Scenario**:
- Ако потребителят няма въведени данни, системата показва насоки за започване

## 📁 Project Structure

```
expense-tracker/
├── backend/              # FastAPI application
│   ├── app/              # Main application package
│   │   ├── core/         # Core functionality
│   │   ├── models/       # Database models
│   │   ├── routers/      # API endpoints
│   │   ├── schemas/      # Pydantic models
│   │   └── services/     # Business logic
│   ├── tests/            # Test cases
│   └── run.py            # Server startup script
├── frontend/             # Next.js application
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API clients
│   ├── pages/            # Next.js pages
│   └── public/           # Static assets
└── start-dev.js          # Development startup script
```

## 💻 Development

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Technologies

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLAlchemy**: ORM for database interactions
- **Pydantic**: Data validation and settings management
- **JWT**: Authentication mechanism
- **SQLite**: Database (can be easily replaced with PostgreSQL)
- **ReportLab**: PDF report generation

### Frontend
- **Next.js**: React framework for the frontend
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn UI**: Component library based on Radix UI
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **ApexCharts**: Interactive charts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Next.js](https://nextjs.org/) for the frontend framework
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Shadcn UI](https://ui.shadcn.com/) for UI components
- [ApexCharts](https://apexcharts.com/) for data visualization

---

<div align="center">
  <p>Made with ❤️ for better financial management</p>
  <p>
    <a href="https://github.com/yourusername/expense-tracker/issues">Report Bug</a>
    ·
    <a href="https://github.com/yourusername/expense-tracker/issues">Request Feature</a>
  </p>
</div> 