import { createContext, useState, useEffect } from 'react';
import API from './axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Fetch users data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/api/v1/users/me', {
          withCredentials: true,
        });
        setUser(res.data.data.user);
      } catch (error) { 
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

