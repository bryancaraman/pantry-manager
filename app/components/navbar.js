import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { auth } from '@/firebase'; 
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#ADD8E6' }}>
      <Toolbar>
        <Typography variant="h6" color="black" component="div" sx={{ flexGrow: 1 }}>
          Pantry Manager
        </Typography>
        {user && (
          <Box display="flex" alignItems="center">
            <Typography variant="h6" color="black" component="div" sx={{ marginRight: 2 }}>
              {user.displayName || user.email}
            </Typography>
            <Button onClick={handleSignOut} color="error">
              Sign Out
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;