/**
 * @file SignUpPage.jsx
 * @description 이 파일은 회원가입 페이지를 렌더링하는 SignUpPage 컴포넌트를 포함한다.
 * 이 컴포넌트는 새로운 사용자가 계정을 생성할 수 있도록 한다.
 * 
 * @requires react
 * @requires react-router-dom
 * @requires ../api
 * @requires ../components/InfoModal
 * @requires @mui/material
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// API 호출 함수
import { signUp } from '../api';

// 공통 모달 컴포넌트
import InfoModal from '../components/InfoModal';

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
 * @component SignUpPage
 * @description 회원가입 페이지 컴포넌트
 */
function SignUpPage() {
  // 컴포넌트 상태 변수들
  const [loginId, setLoginId] = useState(''); // 로그인 아이디
  const [password, setPassword] = useState(''); // 비밀번호
  const [nickname, setNickname] = useState(''); // 닉네임
  const [error, setError] = useState(''); // 에러 메시지
  const [isInfoModalOpen, setInfoModalOpen] = useState(false); // 정보 모달 열림/닫힘 상태
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' }); // 정보 모달 내용
  const navigate = useNavigate(); // 라우터 네비게이션

  /**
   * @function handleSignUp
   * @description 회원가입 처리 함수
   */
  const handleSignUp = async () => {
    // 모든 필드가 입력되었는지 확인
    if (!loginId.trim() || !password.trim() || !nickname.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    try {
      // 회원가입 API 호출
      await signUp({ loginId, password, nickname });
      setInfoModalContent({ title: '성공', message: '회원가입에 성공했습니다! 로그인 페이지로 이동합니다.' });
      setInfoModalOpen(true);
    } catch (err) {
      console.error('Sign up failed:', err);
      const errorMessage = err.response?.data?.message || '회원가입에 실패했습니다. 아이디 또는 닉네임이 중복될 수 있습니다.';
      setError(errorMessage);
    }
  };

  /**
   * @function handleModalClose
   * @description 정보 모달 닫기 핸들러
   * 모달이 닫히면 로그인 페이지로 이동
   */
  const handleModalClose = () => {
    setInfoModalOpen(false);
    navigate('/');
  };

  // JSX 렌더링
  return (
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}>
      <Grid item>
        <Paper elevation={3} sx={{ p: 4, width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'background.paper' }}>
          <Typography component="h1" variant="h5">
            회원가입
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
            />
            {/* 닉네임 입력 필드 */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="nickname"
              label="닉네임"
              name="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSignUp()} // Enter 키로 회원가입
            />
            {/* 회원가입 버튼 */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleSignUp}
            >
              회원가입
            </Button>
            {/* 로그인 페이지로 이동 링크 */}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/" style={{ color: 'white', textDecoration: 'underline' }}>
                  이미 계정이 있으신가요? 로그인
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
      {/* 정보 모달 */}
      <InfoModal
        open={isInfoModalOpen}
        onClose={handleModalClose}
        title={infoModalContent.title}
        message={infoModalContent.message}
      />
    </Grid>
  );
}

export default SignUpPage;