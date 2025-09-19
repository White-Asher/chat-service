/**
 * @file LoginPage.jsx
 * @description 이 파일은 로그인 페이지를 렌더링하는 LoginPage 컴포넌트를 포함한다.
 * 사용자가 애플리케이션에 로그인할 수 있도록 한다.
 * 
 * @requires react
 * @requires react-router-dom
 * @requires ../context/UserContext
 * @requires ../api
 * @requires @mui/material
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// 사용자 정보 컨텍스트
import { useUser } from '../context/UserContext';

// API 호출 함수
import { login as apiLogin } from '../api';

// MUI 컴포넌트
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Alert
} from '@mui/material';

/**
 * @component LoginPage
 * @description 로그인 페이지 컴포넌트
 */
function LoginPage() {
  // 컴포넌트 상태 변수들
  const [loginId, setLoginId] = useState(''); // 로그인 아이디
  const [password, setPassword] = useState(''); // 비밀번호
  const [error, setError] = useState(''); // 에러 메시지
  const navigate = useNavigate(); // 라우터 네비게이션
  const { login } = useUser(); // UserContext의 login 함수

  /**
   * @function handleLogin
   * @description 로그인 처리 함수
   */
  const handleLogin = async () => {
    // 아이디와 비밀번호가 입력되었는지 확인
    if (!loginId.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    try {
      // 로그인 API 호출
      const response = await apiLogin({ loginId, password });
      login(response.data); // UserContext에 사용자 정보 저장
      
      // 서버로부터 받은 세션 타임아웃 시간을 localStorage에 저장
      if (response.data.sessionTimeoutInMinutes) {
        localStorage.setItem('sessionTimeoutInMinutes', response.data.sessionTimeoutInMinutes);
      }
      navigate('/chat'); // 채팅 목록 페이지로 이동
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || '로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.';
      setError(errorMessage);
    }
  };

  // JSX 렌더링
  return (
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}>
      <Grid item>
        <Paper elevation={3} sx={{ p: 4, width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'background.paper' }}>
          <Typography component="h1" variant="h5">
            채팅 서비스 로그인
          </Typography>
          <Box sx={{ mt: 3, width: '100%' }}>
            {/* 에러 메시지 표시 */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {/* 아이디 입력 필드 */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="loginId"
              label="아이디"
              name="loginId"
              autoFocus
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
            {/* 비밀번호 입력 필드 */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()} // Enter 키로 로그인
            />
            {/* 로그인 버튼 */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleLogin}
            >
              로그인
            </Button>
            {/* 회원가입 페이지로 이동 링크 */}
            <Grid container>
              <Grid item>
                <Link to="/signup" style={{ color: 'white', textDecoration: 'underline' }}>
                  {"계정이 없으신가요? 회원가입"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default LoginPage;