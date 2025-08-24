import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/message/users");
            set({ users: res.data });
        } catch (err) {
            console.error("Error in getUsers under the frontend: ", err.response.data.message);
            toast.error(err.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/message/${userId}`);
            set({ messages: res.data });
        } catch (err) {
            console.error("Error in getMessages under the frontend: ", err.response.data.message);
            toast.error(err.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser.id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (err) {
            console.error("Error inside sendMessage under the frontend: ", err.response.data.message);
            toast.error(err.response.data.message);
        }
    },


}));