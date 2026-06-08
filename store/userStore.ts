import { create } from "zustand";

interface UserStore {
  isAdmin: boolean;
  satIsAdmin: (value: boolean) => void;
}
export const useUserStore = create<UserStore>((set) => ({
  isAdmin: false,
  satIsAdmin: (value) => set({ isAdmin: value }),
}));
