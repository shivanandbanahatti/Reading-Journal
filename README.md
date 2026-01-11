# Lumina — Personal Reading Journal 📚

Lumina is a modern, beautiful, and open-source reading journal designed for bibliophiles who want to track their reading progress and preserve their favorite insights. Capture highlights, save profound quotes, and write personal notes for every book in your library.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## ✨ Features

-   **📖 Library Management**: Track books you are currently reading, have finished, or want to read.
-   **✍️ Annotations**: Organize your thoughts with dedicated sections for:
    -   **Highlights**: Save important passages.
    -   **Quotes**: Keep track of memorable lines.
    -   **Notes**: Write down your personal reflections.
-   **📊 Progress Tracking**: Visual progress bars to see how far you are in each book.
-   **📱 PWA Ready**: Install Lumina on your mobile device directly from the browser for a native app experience.
-   **🔍 Quick Search**: Instantly find any book or author in your collection.
-   **🔐 Secure Auth**: Private accounts powered by Supabase Authentication.

## 🚀 Tech Stack

-   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
-   **Database & Auth**: [Supabase](https://supabase.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Mobile Bridge**: [Capacitor](https://capacitorjs.com/) (Optional for Native builds)

## 🛠️ Getting Started

### Prerequisites

-   Node.js 18+ 
-   A Supabase account (Free tier works perfectly)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/lumina.git
    cd lumina
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup:**
    Run the migrations provided in `supabase/migrations` or copy the SQL from the migration files into the Supabase SQL Editor to set up the `books`, `profiles`, and `annotations` tables.

5.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see your app.

## 📱 Mobile Installation (PWA)

Lumina is built as a Progressive Web App. To "install" it on your phone:
1.  Deploy the app to a service like Vercel.
2.  Open the URL in your mobile browser (Chrome for Android, Safari for iOS).
3.  Tap **"Add to Home Screen"**.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ for readers everywhere.
