/**
 * @file UserContext.jsx
 * @description 이 파일은 애플리케이션 전반에 걸쳐 사용자 인증 및 세션 관리를 제공하는 UserContext를 포함한다.
 * 사용자 로그인, 로그아웃, 세션 타이머 및 세션 갱신을 처리한다.
 * 
 * @requires react
 * @requires ../api
 */

import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';

// API 호출 함수 및 인터셉터 설정 함수
import { checkSession, logout as apiLogout, setupInterceptors } from '../api';

// UserContext 생성
const UserContext = createContext(null);

/**
 * @function useUser
 * @description UserContext를 사용하기 위한 커스텀 훅
 * @returns {object} UserContext의 value 객체
 */
export const useUser = () => useContext(UserContext);

/**
 * @function getSessionDuration
 * @description 세션 만료 시간을 초 단위로 가져오는 함수
 * localStorage에 저장된 값이 없으면 기본값 60분으로 설정
 * @returns {number} 세션 만료 시간 (초)
 */
const getSessionDuration = () => {
  const timeoutInMinutes = localStorage.getItem('sessionTimeoutInMinutes');
  return (timeoutInMinutes ? parseInt(timeoutInMinutes, 10) : 60) * 60;
};

/**
 * @component UserProvider
 * @description 사용자 정보 및 인증 상태를 관리하고, 하위 컴포넌트에 제공하는 Provider 컴포넌트
 * @param {object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 하위 컴포넌트
 */
export const UserProvider = ({ children }) => {
  // 컴포넌트 상태 변수들
  const [user, setUser] = useState(null); // 현재 사용자 정보
  const [loading, setLoading] = useState(true); // 초기 로딩 상태
  const [remainingTime, setRemainingTime] = useState(getSessionDuration()); // 세션 남은 시간
  const [isRenewalModalOpen, setRenewalModalOpen] = useState(false); // 세션 갱신 모달 열림/닫힘 상태
  const [isSessionExpired, setSessionExpired] = useState(false); // 세션 만료 여부

  const timerRef = useRef(null); // 세션 타이머 참조

  /**
   * @function stopTimer
   * @description 세션 타이머를 중지하는 함수
   */
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * @function logout
   * @description 로그아웃 처리 함수
   * @param {boolean} expired - 세션 만료로 인한 로그아웃인지 여부
   */
  const logout = useCallback(async (expired = false) => {
    stopTimer();
    setRenewalModalOpen(false); // 갱신 모달 닫기
    if (!expired) { // 사용자가 직접 로그아웃하는 경우에만 API 호출
      try {
        await apiLogout();
      } catch (error) {
        console.error("Logout failed", error);
      }
    }
    setUser(null); // 사용자 정보 초기화
    if (expired) {
      setSessionExpired(true); // 세션 만료 상태로 설정
    }
  }, [stopTimer]);

  /**
   * @function startTimer
   * @description 세션 타이머를 시작하는 함수
   */
  const startTimer = useCallback(() => {
    stopTimer(); // 기존 타이머 중지
    setRemainingTime(getSessionDuration());
    timerRef.current = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime <= 1) {
          stopTimer();
          logout(true); // 시간이 0이 되면 세션 만료 처리
          return 0;
        }
        if (prevTime === 61) { // 1분 남았을 때 갱신 모달 표시
          setRenewalModalOpen(true);
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [stopTimer, logout]);

  /**
   * @function resetSessionTimer
   * @description 세션 타이머를 재설정하는 함수
   */
  const resetSessionTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  // 컴포넌트 마운트 시 API 인터셉터 설정 및 사용자 세션 확인
  useEffect(() => {
    setupInterceptors(logout, resetSessionTimer);

    const verifyUser = async () => {
      try {
        const response = await checkSession();
        setUser(response.data);
        startTimer(); // 세션 확인 성공 시 타이머 시작
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setUser(null); // 401 에러 시 사용자 정보 없음으로 처리
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

  /**
   * @function login
   * @description 로그인 처리 함수
   * @param {object} userData - 사용자 정보
   */
  const login = (userData) => {
    setUser(userData);
    startTimer();
  };

  /**
   * @function renewSession
   * @description 세션 갱신 처리 함수
   */
  const renewSession = async () => {
    try {
      await checkSession(); // 세션 갱신 API 호출
      startTimer(); // 타이머 재시작
      setRenewalModalOpen(false);
    } catch (error) {
      console.error("Failed to renew session:", error);
      setRenewalModalOpen(false);
      logout(true); // 갱신 실패 시 로그아웃 처리
    }
  };

  /**
   * @function closeRenewalModal
   * @description 세션 갱신 모달을 닫는 함수
   */
  const closeRenewalModal = () => {
    setRenewalModalOpen(false);
  };

  /**
   * @function closeExpiredModalAndLogin
   * @description 세션 만료 모달을 닫는 함수
   */
  const closeExpiredModalAndLogin = () => {
    setSessionExpired(false);
  };

  /**
   * @function updateUser
   * @description 사용자 정보를 업데이트하는 함수 (예: 닉네임 변경)
   * @param {object} newUserData - 새로운 사용자 정보
   */
  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  // 초기 세션 확인 중에는 렌더링하지 않음
  if (loading) {
    return null;
  }

  // Context로 전달할 값
  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    remainingTime,
    isRenewalModalOpen,
    renewSession,
    closeRenewalModal,
    isSessionExpired,
    closeExpiredModalAndLogin,
    resetSessionTimer
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
