import { usePage, router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import type { SharedData } from '@/types';

/**
 * Flash xabarlarni va validation errorlarni Sonner toast sifatida ko'rsatish uchun hook.
 */
export function useFlash() {
    const { flash, errors } = usePage<SharedData & { errors: Record<string, string> }>().props;
    const shownRef = useRef<string | null>(null);

    useEffect(() => {
        // Create unique key for current flash/errors state
        const currentKey = JSON.stringify({ flash, errors, time: Date.now() });

        // If same as last shown, don't show again (prevents immediate duplicates)
        // But allow showing again after 500ms (for repeated submissions)
        if (shownRef.current === currentKey) {
            return;
        }

        // Flash messages
        if (flash) {
            if (flash.success) {
                toast.success(flash.success);
            }

            if (flash.error) {
                toast.error(flash.error);
            }

            if (flash.warning) {
                toast.warning(flash.warning);
            }

            if (flash.info) {
                toast.info(flash.info);
            }
        }

        // Validation errors
        if (errors && Object.keys(errors).length > 0) {
            const errorMessages = Object.values(errors);
            if (errorMessages.length === 1) {
                toast.error(errorMessages[0]);
            } else {
                toast.error(`Validation failed: ${errorMessages.length} errors`, {
                    description: errorMessages.slice(0, 3).join(', ') + (errorMessages.length > 3 ? '...' : ''),
                });
            }
        }

        // Mark as shown (without timestamp for comparison)
        shownRef.current = JSON.stringify({ flash, errors });

        // Reset after short delay to allow repeated errors
        const timeout = setTimeout(() => {
            shownRef.current = null;
        }, 300);

        return () => clearTimeout(timeout);
    }, [flash, errors]);

    // Clear on navigation
    useEffect(() => {
        const removeListener = router.on('navigate', () => {
            shownRef.current = null;
        });

        return () => removeListener();
    }, []);
}
