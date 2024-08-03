'use client'

import { useState, useEffect } from 'react'
import { firestore, auth } from "@/firebase";
import { Box, Typography, Modal, Stack, TextField, Button, IconButton } from '@mui/material'
import { collection, deleteDoc, getDoc, getDocs, query, setDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/navbar'
import Recipes from '../components/recipe'

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState("");
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
      })
    });
    setInventory(inventoryList);
  }

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
  }

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
  }

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
      <Navbar/>
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
          <Button variant="outlined" onClick={() => {
              addItem(itemName, quantity);
              setItemName('');
              setQuantity(1);
              handleClose();
          }}>
            Add
          </Button>
        </Box>
      </Modal>
      <Box border="1px solid #333" height="750px">
        <Box 
          width= "800px" 
          height="80px" 
          bgcolor="#ADD8E6" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          padding={2}
          sx={{ borderBottom: 1 }}
        >
          <Typography variant="h3" color="#333" sx={{ fontFamily: '"Josefin", cursive' }}>
            Your Pantry
          </Typography>
        </Box>
        <Box 
          width= "800px" 
          height="80px" 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between"
          padding={6}
        >
          <TextField
              label="Search Inventory"
              variant="outlined"
              value={search}
              onChange={handleSearch}
              sx={{ 
                width: 400,
                minWidth: 400,
              }}
          />
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => {
              handleOpen();
            }}
          >
            Add New Item
          </Button>
        </Box>
      <Stack width="800px" height="650px" overflow="auto">
        {
          filteredInventory.map(({name, quantity}) => (
            <Box 
              key={name} 
              width="100%" 
              minHeight="75px" 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between" 
              px={4}
            >
              <Typography variant="h5" color="#333" textAlign="center" sx={{ fontWeight: 'bold' }}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton variant="contained" 
                  onClick={() => {
                    addItem(name, 1);
                  }}
                >
                  +
                </IconButton>
                <Typography variant="h5" color="#333" textAlign="center" sx={{ fontWeight: 'bold' }}>
                  {quantity}
                </Typography>
                <IconButton variant="contained" 
                  onClick={() => {
                    removeItem(name);
                  }}
                >
                  -
                </IconButton>
              </Stack>
            </Box>
          ))
        }
      </Stack>
      </Box>
      <Recipes/>
    </Box>
  );
}