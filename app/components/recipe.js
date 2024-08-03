'use client'

import { useState, useEffect } from 'react';
import { firestore, auth } from "@/firebase";
import { Box, Typography, Button, Stack, Card, CardContent, CardActions } from '@mui/material';
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

export default function RecipeComponent() {
  const [recipes, setRecipes] = useState([]);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRecipesCollection = collection(firestore, 'users', user.uid, 'recipes');
        const docs = await getDocs(userRecipesCollection);
        const recipesList = [];
        docs.forEach((doc) => {
          recipesList.push({ id: doc.id, ...doc.data() });
        });
        setRecipes(recipesList);
      }
    };

    fetchRecipes();
  }, []);

  const fetchInventory = async () => {
    const user = auth.currentUser;
    if (user) {
      const inventoryCollection = collection(firestore, 'users', user.uid, 'inventory');
      const inventoryDocs = await getDocs(inventoryCollection);
      const inventoryList = [];
      inventoryDocs.forEach((doc) => {
        inventoryList.push(doc.id);
      });
      return inventoryList;
    }
    return [];
  };

  const generateRecipe = async () => {
    const user = auth.currentUser;
    if (user) {
      const inventory = await fetchInventory();
      if (inventory.length === 0) {
        setGeneratedRecipe({ 
          title: "No Inventory", 
          ingredients: [], 
          instructions: "No items in inventory to generate a recipe."
        });
        return;
      }

      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "meta-llama/llama-3.1-8b-instruct:free",
            "messages": [
              { "role": "user", "content": `Create a recipe using these ingredients: ${inventory.join(', ')}. Format your recipe with a title, spacing, and numbered instructions.` },
            ],
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.choices || data.choices.length === 0) {
          throw new Error('Invalid response format: choices array is empty');
        }

        const recipeText = data.choices[0].message.content;

        // Extract the title and instructions from the response
        const titleMatch = recipeText.match(/Title:\s*(.*)/i);
        const title = titleMatch ? titleMatch[1] : "Generated Recipe";

        const instructionsMatch = recipeText.match(/Instructions:\s*(.*)/is);
        const instructions = instructionsMatch ? instructionsMatch[1] : recipeText;

        const newRecipe = {
          title: title,
          ingredients: inventory,
          instructions: instructions,
        };

        const userRecipesCollection = collection(firestore, 'users', user.uid, 'recipes');
        await setDoc(doc(userRecipesCollection, newRecipe.title), newRecipe);
        setGeneratedRecipe(newRecipe);

      } catch (error) {
        console.error('Error generating recipe:', error);
        setGeneratedRecipe({
          title: "Error",
          ingredients: [],
          instructions: "There was an error generating the recipe. Please try again later.",
        });
      }
    }
  };

  return (
    <Box 
      border="1px solid #333" 
      height="750px" 
      width="800px"
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      bgcolor="#f0f0f0"
      paddingBottom={2}
    >
      <Box 
        width="100%" 
        height="80px" 
        bgcolor="#ADD8E6" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <Typography variant="h3" color="#333" sx={{ fontFamily: '"Josefin", cursive' }}>
          Recipes
        </Typography>
      </Box>
      <Button 
        variant="outlined" 
        size="large"
        onClick={generateRecipe}
        sx={{ mt: 2 }}
      >
        Generate Recipe
      </Button>
      <Stack width="100%" height="650px" spacing={2} overflow="auto" padding={2}>
        {generatedRecipe ? (
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {generatedRecipe.title}
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                Ingredients:
              </Typography>
              <Typography variant="body2">
                {generatedRecipe.ingredients.join(', ')}
              </Typography>
              <Typography sx={{ mt: 2 }} variant="body2">
                Instructions:
              </Typography>
              <Typography variant="body2" component="div">
                {generatedRecipe.instructions.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => setGeneratedRecipe(null)}>Back to Saved Recipes</Button>
            </CardActions>
          </Card>
        ) : (
          recipes.map(({ id, title, ingredients, instructions }) => (
            <Card key={id}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {title}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Ingredients:
                </Typography>
                <Typography variant="body2">
                  {ingredients.join(', ')}
                </Typography>
                <Typography sx={{ mt: 2 }} variant="body2">
                  Instructions:
                </Typography>
                <Typography variant="body2" component="div">
                  {instructions.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
}