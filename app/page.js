'use client'

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert
} from '@mui/material';
import Navbar from './components/navbar'

export default function Home() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const router = useRouter();

  const handleAuth = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      if (isSignUp) {
        await auth.signup(email, password);
      } else {
        await auth.signin(email, password);
      }
      router.push('/inventory');
    } catch (err) {
      if (err.message === 'Firebase: Error (auth/invalid-email).') {
        setError('Invalid email');
      }
      else if (err.message === 'Firebase: Error (auth/invalid-credential).') {
        setError('Invalid email or password');
      }
      else if (err.message === 'Firebase: Password should be at least 6 characters (auth/weak-password).') {
        setError('Password should be at least 6 characters')
      }
      else {
        setError(err.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await auth.signInWithGoogle();
      router.push('/inventory');
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleAuthMode = (event) => {
    event.preventDefault(); 
    setIsSignUp(prev => !prev);
    setError(''); 
  };

  return (
    <Box>
      <Navbar/>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          {isSignUp ? 'Sign Up' : 'Login'}
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box component="form" noValidate onSubmit={handleAuth} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isSignUp ? 'Sign Up' : 'Login'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleSignIn}
            sx={{ mb: 2 }}
          >
            Sign in with Google
          </Button>
          <Box display="flex" justifyContent="center" mt={2}>
            <Typography variant="body2">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <Link
                component="button"
                variant="body2"
                onClick={toggleAuthMode}
                sx={{ marginLeft: 1 }}
              >
                {isSignUp ? 'Login' : 'Sign Up'}
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}