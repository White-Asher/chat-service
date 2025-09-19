import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { checkSession, logout as apiLogout, setupInterceptors } from '../api';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

const getSessionDuration = () => {
  const timeoutInMinutes = localStorage.getItem('sessionTimeoutInMinutes');
  // localStorage에 값이 있으면 해당 값을 분 -> 초로 변환, 없으면 기본값 60분 -> 초로 변환
  return (timeoutInMinutes ? parseInt(timeoutInMinutes, 10) : 60) * 60;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(getSessionDuration());
  const [isRenewalModalOpen, setRenewalModalOpen] = useState(false);
  const [isSessionExpired, setSessionExpired] = useState(false);

  const timerRef = useRef(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const logout = useCallback(async (expired = false) => {
    stopTimer();
    setRenewalModalOpen(false); // 세션 만료 시 갱신 모달 닫기
    if (!expired) { // 세션 만료로 인한 로그아웃이 아닐 경우에만 API 호출
      try {
        await apiLogout();
      } catch (error) {
        console.error("Logout failed", error);
      }
    }
    setUser(null);
    if (expired) {
      setSessionExpired(true);
    }
  }, [stopTimer]);

  const startTimer = useCallback(() => {
    stopTimer(); // 기존 타이머 중지
    setRemainingTime(getSessionDuration());
    timerRef.current = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime <= 1) {
          stopTimer();
          // 시간이 0이 되면 세션 만료 처리
          logout(true);
          return 0;
        }
        if (prevTime === 61) { // 1분 남았을 때
          setRenewalModalOpen(true);
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [stopTimer, logout]);

  const resetSessionTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    setupInterceptors(logout, resetSessionTimer);

    const verifyUser = async () => {
      try {
        const response = await checkSession();
        setUser(response.data);
        startTimer();
      } catch (error) {
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

    return stopTimer; // 컴포넌트 언마운트 시 타이머 정리
  }, [startTimer, stopTimer, logout, resetSessionTimer]);

  const login = (userData) => {
    setUser(userData);
    startTimer();
  };

  const renewSession = async () => {
    try {
      await checkSession(); // 세션 갱신을 위해 API 호출
      startTimer(); // 타이머 재시작
      setRenewalModalOpen(false);
    } catch (error) {
      console.error("Failed to renew session:", error);
      setRenewalModalOpen(false); // 갱신 실패 시에도 모달 닫기
      // 갱신 실패 시 로그아웃 처리
      logout(true);
    }
  };

  const closeRenewalModal = () => {
    setRenewalModalOpen(false);
  };

  const closeExpiredModalAndLogin = () => {
    setSessionExpired(false);
    // 필요하다면 로그인 페이지로 리디렉션 할 수 있습니다.
    // 이 예제에서는 단순히 모달을 닫습니다.
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  if (loading) {
    return null; // 초기 세션 확인 중에는 렌더링하지 않음
  }

  const value = {
    user,
    login,
    logout,
    updateUser, // 닉네임 변경 후 유저 정보 업데이트
    loading,
    remainingTime,
    isRenewalModalOpen,
    renewSession,
    closeRenewalModal,
    isSessionExpired,
    closeExpiredModalAndLogin,
    resetSessionTimer // 노출
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};