import axios from "axios";

export const axiosClient = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true, // важно для refresh-cookie flow
});

export function setAxiosAccessToken(token: string | null) {
    if (token) {
        axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete axiosClient.defaults.headers.common.Authorization;
    }
}
