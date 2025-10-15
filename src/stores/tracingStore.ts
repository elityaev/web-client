import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TracingState {
    isEnabled: boolean;
    setEnabled: (enabled: boolean) => void;
    toggle: () => void;
}

export const useTracingStore = create<TracingState>()(
    persist(
        (set, get) => ({
            isEnabled: false, // По умолчанию выключен для обратной совместимости
            setEnabled: (enabled: boolean) => set({ isEnabled: enabled }),
            toggle: () => set((state) => ({ isEnabled: !state.isEnabled })),
        }),
        {
            name: 'tracing-storage',
        }
    )
);


