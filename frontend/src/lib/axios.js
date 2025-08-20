import axios from "axios";

export const axios_instance = axios.create({
    baseURL: import.meta.env.BASE_URL,
    withCredentials: true
})