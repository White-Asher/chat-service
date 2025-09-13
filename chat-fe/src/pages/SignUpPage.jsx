import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../api';
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

function SignUpPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!loginId.trim() || !password.trim() || !nickname.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    try {
      await signUp({ loginId, password, nickname });
      alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
      navigate('/'); // 회원가입 성공 후 로그인 페이지로 이동
    } catch (err) {
      console.error('Sign up failed:', err);
      const errorMessage = err.response?.data?.message || '회원가입에 실패했습니다. 아이디 또는 닉네임이 중복될 수 있습니다.';
      setError(errorMessage);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          회원가입
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
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="nickname"
            label="닉네임"
            name="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSignUp}
          >
            회원가입
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to="/" variant="body2">
                이미 계정이 있으신가요? 로그인
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default SignUpPage;
