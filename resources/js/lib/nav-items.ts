import { type NavItem } from '@/types';
import { BookOpen, Bot, Folder, LayoutGrid, MessageSquare, Send, Settings, Users } from 'lucide-react';

/**
 * Main navigation items shown in sidebar and header.
 */
export const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: Bot,
    },
];

/**
 * Admin panel navigation items.
 */
export const adminNavItems: NavItem[] = [
    {
        title: 'Telegram Users',
        href: '/admin/telegram-users',
        icon: Users,
    },
    {
        title: 'Send Message',
        href: '/admin/broadcast',
        icon: Send,
    },
    {
        title: 'Commands',
        href: '/admin/commands',
        icon: MessageSquare,
    },
    {
        title: 'Bot Settings',
        href: '/admin/bot-settings',
        icon: Settings,
    },
];

/**
 * Footer navigation items (external links).
 */
export const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

/**
 * Right side navigation items for header (same as footer, external links).
 */
export const rightNavItems = footerNavItems;
