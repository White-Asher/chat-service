import React, { createContext, useState, useContext } from 'react';

// 사용자 정보를 위한 Context 생성
const UserContext = createContext(null);

// 다른 컴포넌트에서 user 정보를 쉽게 사용하기 위한 custom hook
export const useUser = () => useContext(UserContext);

// 사용자 정보(user)와 로그인/로그아웃 함수(login/logout)를 제공하는 Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
