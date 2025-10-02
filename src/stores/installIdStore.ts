import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InstallIdState {
    enabled: boolean;
    value: string;
    setEnabled: (enabled: boolean) => void;
    setValue: (value: string) => void;
    reset: () => void;
}

export const useInstallIdStore = create<InstallIdState>()(
    persist(
        (set) => ({
            enabled: false,
            value: '',

            setEnabled: (enabled: boolean) => {
                set({ enabled });
            },

            setValue: (value: string) => {
                set({ value });
            },

            reset: () => {
                set({ enabled: false, value: '' });
            },
        }),
        {
            name: 'install-id-storage',
        }
    )
);
