import { create } from "zustand";
import { BookingStatus } from "@prisma/client";

interface AdminUIState {
  // Bookings page
  bookingStatusFilter: BookingStatus | "all";
  bookingSearch: string;
  setBookingStatusFilter: (status: BookingStatus | "all") => void;
  setBookingSearch: (query: string) => void;

  // Mobile sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAdminUI = create<AdminUIState>((set) => ({
  bookingStatusFilter: "all",
  bookingSearch: "",
  setBookingStatusFilter: (status) => set({ bookingStatusFilter: status }),
  setBookingSearch: (query) => set({ bookingSearch: query }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
