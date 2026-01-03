'use client';

import { Toaster as Sonner, ToasterProps } from 'sonner';

import { useAppearance } from '@/hooks/use-appearance';

/**
 * Sonner toast componenti.
 * 
 * Tema bilan integratsiya qilingan Sonner toast.
 * richColors va closeButton yoqilgan.
 */
const Toaster = ({ ...props }: ToasterProps) => {
    const { appearance } = useAppearance();

    // Appearance ni theme ga aylantirish
    const theme = appearance === 'system'
        ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : appearance;

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            className="toaster group"
            richColors
            closeButton
            position="top-right"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                    description: 'group-[.toast]:text-muted-foreground',
                    actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
