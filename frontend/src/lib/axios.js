import axios  from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // withCredentials does the job of sending cookies to the server for every single api request
})

export default axiosInstance;