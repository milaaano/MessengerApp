import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:4000" : "/";
console.log(BASE_URL);

export const useAuthStore = create((set, get) => ({
    authUser: null,

    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isLoggingOut: false,
    isCheckingAuth: true,
    onlineUsers:[],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({authUser: res.data});
            get().connectSocket();
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
            get().connectSocket();
        } catch (err) {
            console.log("Error in signup function under the fronted.");
            toast.error(err.respnse.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        set({ isLoggingOut: true });
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully.");
            get().disconnectSocket();
        } catch (err) {
            console.error("Error in logout under the frontend.");
            toast.error(err.response.data.message);
        } finally {
            set({ isLoggingOut: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', data);
            toast.success("Logged in successfully.");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (err) {
            toast.error(err.response.data.message);
            console.log("Error in login under the frontend.");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (err) {
            console.error("Error in updateProfile under the backend.");
            toast.error(err.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },


    connectSocket: () => {
        const socket = io(BASE_URL, {
            withCredentials: true,
        });

        socket.connect();
        set({ socket: socket });

        socket.on("connect", () => {
            console.log("Socket " + socket.id + " connected");
        });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) {
            get().socket.disconnect();
            set({ socket: null });
        }
    }
}));