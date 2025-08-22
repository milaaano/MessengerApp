import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLogginIn: false,
    isUpdatingProfile: false,
    isLogginOut: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({authUser: res.data});
        } catch (err) {
            console.error("Error in ceckAuth under the frontend:", err);
            set({authUser: null});
        } finally {
            set({isCheckingAuth: false});
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            toast.success("Account created successfully.");
            set({ authUser: res.data });
        } catch (err) {
            console.log("Error in signup function under the fronted.");
            toast.error(err.respnse.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        set({ isLogginOut: true });
        try {
            await axiosInstance.post("/auth/logout");
            toast.success("Logged out successfully.");
        } catch (err) {
            console.error("Error in logout under the frontend.");
            toast.error(err.response.data.message);
        } finally {
            set({ isLogginOut: false });
        }
    },


}));