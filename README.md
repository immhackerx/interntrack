# 🚀 InternTrack

**The ultimate internship aggregator and application tracking dashboard for students.**

InternTrack automatically scrapes, categorizes, and organizes thousands of student internship opportunities from platforms like LinkedIn, Unstop, and Internshala into one clean, responsive dashboard. It also features a built-in Kanban board to track your application status.

---

## ✨ Features

* **⚡ Automated Aggregation:** Python-based scraper pipeline automatically pulls, standardizes, and auto-approves thousands of active roles from major job boards.
* **🔒 Smart Authentication:** Secure Google OAuth integration via Supabase.
* **🗂️ Kanban Application Tracker:** Move your saved internships through "Wishlist", "Applied", "Interviewing", and "Offer" columns.
* **🛡️ Admin Moderation Deck:** Community-submitted roles require admin approval before going live, while verified scraped roles bypass the queue.
* **📱 Responsive Design:** Features a sleek, dark-themed mobile drawer menu and responsive grid layout built with React and Tailwind CSS.
* **🏷️ Dynamic Categorization:** Automatically tags roles by environment (Remote/On-site), domain (Tech/Design/Marketing), and pay (Paid/Unpaid).

---

## 🛠️ Tech Stack

**Frontend (Client)**
* React.js (Vite)
* TypeScript
* Tailwind CSS
* React Icons

**Backend & Database**
* Supabase (PostgreSQL, Auth, Realtime Subscriptions)

**Data Pipeline (Scraping)**
* Python 3
* Requests / BeautifulSoup
* Python-JobSpy

---

## ⚙️ Local Installation & Setup

Want to run InternTrack on your local machine? Follow these steps:

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/interntrack.git](https://github.com/your-username/interntrack.git)
cd interntrack
