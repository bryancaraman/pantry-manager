'use client';

import { useState, useEffect } from 'react';
import { firestore, auth } from "@/firebase";
import { Box, Typography, Modal, Grid, TextField, Button, IconButton, Paper, Stack } from '@mui/material';
import { collection, deleteDoc, getDoc, getDocs, query, setDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/navbar';
import Recipes from '../components/recipe';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        updateInventory(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateInventory = async (uid) => {
    const snapshot = query(collection(firestore, 'users', uid, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item, quantity) => {
    if (!user) return;

    const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentQuantity = docSnap.data().quantity;
      await setDoc(docRef, { quantity: currentQuantity + quantity });
    } else {
      await setDoc(docRef, { quantity });
    }

    await updateInventory(user.uid);
  };

  const removeItem = async (item) => {
    if (!user) return;

    const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory(user.uid);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  return (
    <Box 
      width="100vw" 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      gap={2} 
    >
      <Navbar />
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute" top="50%" left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">Add New Item:</Typography>
          <TextField 
            label="Item Name"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
            }}
          />
          <TextField 
            label="Quantity"
            variant="outlined"
            fullWidth
            type="number"
            value={quantity}
            onChange={(e) => {
              setQuantity(Number(e.target.value));
            }}
          />
          <Button 
            variant="contained" 
            onClick={() => {
              addItem(itemName, quantity);
              setItemName('');
              setQuantity(1);
              handleClose();
            }}
          >
            Add
          </Button>
        </Box>
      </Modal>
      <Paper 
        sx={{ 
          width: '80%', 
          padding: 2, 
          marginBottom: 2, 
          textAlign: 'center' 
        }}
        elevation={3}
      >
        <Typography variant="h3" sx={{ fontFamily: '"Josefin", cursive' }}>
          Your Pantry
        </Typography>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          margin={3}
        >
          <TextField
            label="Search Inventory"
            variant="outlined"
            value={search}
            onChange={handleSearch}
            sx={{ width: '70%' }}
          />
          <Button 
            variant="contained" 
            onClick={handleOpen}
          >
            Add New Item
          </Button>
        </Box>
      </Paper>
      <Grid container spacing={3} sx={{ width: '80%', maxHeight: '650px', overflowY: 'auto' }}>
        {filteredInventory.map(({ name, quantity }) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={name} padding={2}>
            <Paper 
              elevation={3} 
              sx={{ padding: 2, textAlign: 'center', position: 'relative' }}
            >
              <Typography 
                variant="h6" 
                sx={{ fontWeight: 'bold', marginBottom: 1 }}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                <IconButton 
                  color="primary" 
                  onClick={() => addItem(name, 1)}
                >
                  <AddIcon />
                </IconButton>
                <Typography variant="h6">
                  {quantity}
                </Typography>
                <IconButton 
                  color="secondary" 
                  onClick={() => removeItem(name)}
                >
                  <RemoveIcon />
                </IconButton>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Recipes />
    </Box>
  );
}