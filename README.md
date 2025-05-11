
# Financial Tracker – Bills and Transactions Manager

A lightweight and efficient financial management app built with React and Supabase, focused on managing accounts payable/receivable, recurring bills, and financial reporting.

## Tech Stack

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) – as backend and authentication
- [Day.js](https://day.js.org/) – for date manipulation

## Getting Started

```bash
git clone https://github.com/your-user/your-repo.git
cd your-repo
npm install
```

## Environment Variables

Create a `.env` file based on the example below:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

> Do not commit this file. It's already ignored in `.gitignore`.

## Run the App

```bash
npm run dev
```

## Build for Production

```bash
npm run build
```

##  Features

- [x] Register income and expenses (with or without VAT)
- [x] Separate calculation and storage of VAT and net values
- [x] Mark bills as paid and move to the transactions table
- [x] Support for recurring monthly bills
- [x] Filter bills by month and type (income/expense)
- [x] Monthly report by status and type
- [x] Cash flow chart and projected vs. realized balance

## Supabase Tables

- `bills`: unpaid or scheduled bills
- `transactions`: confirmed payments (after marking as paid)

## License

MIT