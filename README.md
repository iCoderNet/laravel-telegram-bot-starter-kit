<p align="center">
  <img src="public/github/images/dashboard.png" alt="Laravel Telegram Bot Starter Kit" width="100%">
</p>

<h1 align="center">🤖 Laravel Telegram Bot Starter Kit</h1>

<p align="center">
  <strong>A modern, production-ready starter kit for building Telegram bots with Laravel</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-configuration">Configuration</a> •
  <a href="#-license">License</a>
</p>

<p align="center">
  <a href="README-UZ.md">🇺🇿 O'zbekcha</a> •
  <a href="README-RU.md">🇷🇺 Русский</a>
</p>

---

## ✨ Features

### 🎛️ Admin Dashboard

- **Beautiful UI** — Modern, responsive admin panel built with React 19 & Tailwind CSS 4
- **Real-time Stats** — Track users, commands, and bot status at a glance
- **Dark/Light Mode** — Full theme support with system preference detection

### 👥 User Management

- **Telegram Users** — View, search, and manage all bot users
- **Block/Unblock** — Control user access to your bot
- **Activity Tracking** — Monitor user engagement and last activity

### 💬 Dynamic Commands

- **Visual Command Builder** — Create commands without coding
- **Multiple Trigger Types** — Support for `/command` and text triggers
- **Rich Responses** — HTML, Markdown, and MarkdownV2 formatting
- **Media Support** — Attach photos, videos, audio, voice messages, and documents
- **Inline Buttons** — Build interactive keyboards with URL, Mini App, and callback buttons
- **Live Preview** — Telegram-style preview while editing

### 📢 Broadcast Messaging

- **Mass Messaging** — Send messages to all users or selected recipients
- **User Search** — Find and select specific users with AJAX search
- **Media Attachments** — Include photos, videos, audio, and documents
- **Inline Keyboards** — Add interactive buttons to broadcasts
- **Progress Tracking** — Real-time progress with sent/failed counters
- **Queue-based** — Rate-limited delivery respecting Telegram's API limits

### ⚙️ Bot Settings

- **Easy Configuration** — Set bot token directly from the admin panel
- **Webhook Management** — Set, update, or delete webhooks with one click
- **Status Monitoring** — View bot info and webhook status in real-time

---

## 📸 Screenshots

### 📊 Dashboard

<img src="public/github/images/dashboard.png" alt="Dashboard" width="100%">

### 💬 Commands Management

<img src="public/github/images/commands.png" alt="Commands List" width="100%">
<img src="public/github/images/commands-create.png" alt="Create Command" width="100%">
<img src="public/github/images/commands-edit.png" alt="Edit Command with Preview" width="100%">

### 📢 Broadcast Messages

<img src="public/github/images/sendMessage-list.png" alt="Broadcast List" width="100%">
<img src="public/github/images/sendMessage-create.png" alt="Create Broadcast" width="100%">
<img src="public/github/images/sendMessage-show.png" alt="Broadcast Progress" width="100%">

### 👥 Telegram Users

<img src="public/github/images/telegram-users.png" alt="Telegram Users" width="100%">

### ⚙️ Bot Settings

<img src="public/github/images/bot-settings.png" alt="Bot Settings" width="100%">

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Laravel 12, PHP 8.2+ |
| **Frontend** | React 19, TypeScript, Inertia.js |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Database** | MySQL / PostgreSQL / SQLite |
| **Queue** | Laravel Queue (Redis/Database) |
| **Authentication** | Laravel Fortify |

---

## 📦 Installation

### Requirements

- PHP 8.2 or higher
- Composer
- Node.js 18+ & pnpm/npm
- MySQL, PostgreSQL, or SQLite

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/laravel-bot-starter-kit.git
cd laravel-bot-starter-kit

# Install PHP dependencies
composer install

# Install Node.js dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Build frontend assets
pnpm run build

# Create storage link
php artisan storage:link

# Start the development server
php artisan serve
```

### Queue Worker (Required for Broadcasts)

```bash
php artisan queue:work --queue=broadcasts
```

---

## ⚙️ Configuration

### Telegram Bot Token

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Go to Admin → Bot Settings
3. Enter your bot token and save
4. Set up the webhook URL

### Environment Variables

```env
# App
APP_URL=https://your-domain.com

# Telegram (optional - can be set via admin panel)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook

# Queue (for broadcasts)
QUEUE_CONNECTION=database
```

---

## 🚀 Usage

### Creating Commands

1. Go to **Admin → Commands**
2. Click **Create Command**
3. Set trigger (e.g., `/start`, `/help`)
4. Add response with formatting
5. Optionally add media and inline buttons
6. Preview and save

### Broadcasting Messages

1. Go to **Admin → Send Message**
2. Click **New Broadcast**
3. Select recipients (all users or search specific)
4. Compose message with formatting
5. Add media and buttons (optional)
6. Preview and send

### Handling Custom Logic

Extend the webhook controller to add custom command handling:

```php
// app/Http/Controllers/TelegramWebhookController.php

protected function handleCommand(string $command, array $update): void
{
    match ($command) {
        '/custom' => $this->handleCustomCommand($update),
        default => $this->handleDynamicCommand($command, $update),
    };
}
```

---

## 📁 Project Structure

```
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/           # Admin panel controllers
│   │   └── TelegramWebhookController.php
│   ├── Jobs/
│   │   └── SendBroadcastMessageJob.php
│   ├── Models/
│   │   ├── BotCommand.php
│   │   ├── BroadcastMessage.php
│   │   └── TelegramUser.php
│   └── Services/
│       └── TelegramBotService.php
├── resources/js/
│   ├── components/          # UI components
│   ├── layouts/             # App layouts
│   └── pages/admin/         # Admin pages
└── routes/
    ├── admin.php            # Admin routes
    └── api.php              # Webhook routes
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).

---

## 🙏 Acknowledgments

- [Laravel](https://laravel.com)
- [React](https://react.dev)
- [Inertia.js](https://inertiajs.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

<p align="center">
  Made with ❤️ for the Telegram Bot community
</p>
