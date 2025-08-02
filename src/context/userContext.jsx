import React, { createcontext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

export const UserContext = createcontext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); //new state to track loading

    useEffect(()=>{
        if (user) return;

        const accessToken = localStorage.getItem("token");
        if (!accessToken){
            setLoading(false); //set loading to false if no token
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
                setUser(response.data);
            } catch (error) {
                console.error("User not authenticated", error);
                clearUser();
            } finally{
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem("token", userData.token); //save token
        setLoading(false);
    }

    const clearUser = () => {
        setUser(null);
        localStorage.removeItem("token"); //remove token
    };

    return (
        <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;