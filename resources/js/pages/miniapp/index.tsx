import { Head } from '@inertiajs/react';

/**
 * Mini APP - Asosiy sahifa
 * 
 * Bu sahifa Telegram Mini APP da ochiladi.
 * Telegram WebApp SDK bilan integratsiya qilingan.
 */
export default function MiniAppIndex() {
    return (
        <>
            <Head title="Mini APP" />
            <div className="flex min-h-screen flex-col bg-background">
                {/* Header */}
                <header className="border-b px-4 py-3">
                    <h1 className="text-lg font-semibold">Mini APP</h1>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4">
                    <div className="mx-auto max-w-lg">
                        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                            <h2 className="mb-2 text-xl font-semibold">Xush kelibsiz!</h2>
                            <p className="text-muted-foreground">
                                Telegram Mini APP tayyor. Bu yerga kontentni qo'shish kerak.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
