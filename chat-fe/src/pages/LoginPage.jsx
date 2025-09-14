import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { login as apiLogin } from '../api';
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

function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    try {
      const response = await apiLogin({ loginId, password });
      login(response.data); // UserContext에 사용자 정보 저장
      navigate('/chat'); // 채팅 목록 페이지로 이동
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || '로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.';
      setError(errorMessage);
    }
  };

  return (
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}>
      <Grid item>
        <Paper elevation={3} sx={{ p: 4, width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'background.paper' }}>
          <Typography component="h1" variant="h5">
            채팅 서비스 로그인
          </Typography>
          <Box sx={{ mt: 3, width: '100%' }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleLogin}
            >
              로그인
            </Button>
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
