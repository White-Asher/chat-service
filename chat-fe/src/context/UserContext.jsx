import React, { createContext, useState, useContext, useEffect } from 'react';
import { checkSession, logout as apiLogout } from '../api';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await checkSession();
        setUser(response.data);
      } catch (error) {
        // 401 오류는 로그인이 안된 정상적인 상태이므로 콘솔에 에러를 출력하지 않음
        if (error.response && error.response.status === 401) {
          setUser(null);
        } else {
          console.error("An unexpected error occurred during session check:", error);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
    }
  };

  // 로딩 중일 때는 아무것도 렌더링하지 않거나 로딩 스피너를 보여줄 수 있습니다.
  if (loading) {
    return null; // 또는 <LoadingSpinner />
  }

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};
