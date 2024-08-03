// 'use client'

// import { useState, useEffect } from 'react';
// import { firestore, auth } from "@/firebase";
// import { Box, Typography, Button, Stack, Card, CardContent, CardActions } from '@mui/material';
// import { collection, getDocs, setDoc, doc } from "firebase/firestore";

// export default function RecipeComponent() {
//   const [recipes, setRecipes] = useState([]);
//   const [generatedRecipe, setGeneratedRecipe] = useState(null);
//   const [selectedRecipe, setSelectedRecipe] = useState(null);

//   useEffect(() => {
//     const fetchRecipes = async () => {
//       const user = auth.currentUser;
//       if (user) {
//         const userRecipesCollection = collection(firestore, 'users', user.uid, 'recipes');
//         const docs = await getDocs(userRecipesCollection);
//         const recipesList = [];
//         docs.forEach((doc) => {
//           recipesList.push({ id: doc.id, ...doc.data() });
//         });
//         setRecipes(recipesList);
//       }
//     };

//     fetchRecipes();
//   }, []);

//   const fetchInventory = async () => {
//     const user = auth.currentUser;
//     if (user) {
//       const inventoryCollection = collection(firestore, 'users', user.uid, 'inventory');
//       const inventoryDocs = await getDocs(inventoryCollection);
//       const inventoryList = [];
//       inventoryDocs.forEach((doc) => {
//         inventoryList.push(doc.id);
//       });
//       return inventoryList;
//     }
//     return [];
//   };

//   const generateRecipe = async () => {
//     const user = auth.currentUser;
//     if (user) {
//       const inventory = await fetchInventory();
//       if (inventory.length === 0) {
//         setGeneratedRecipe({ 
//           title: "No Inventory", 
//           ingredients: [], 
//           instructions: "No items in inventory to generate a recipe."
//         });
//         return;
//       }

//       try {
//         const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
//             "Content-Type": "application/json"
//           },
//           body: JSON.stringify({
//             "model": "qwen/qwen-2-7b-instruct:free",
//             "messages": [
//               { "role": "user", "content": `Create a recipe using these ingredients: ${inventory.join(', ')}. Format your recipe with a title, spacing, and numbered instructions.` },
//             ],
//           })
//         });

//         if (response.status === 429) {
//           throw new Error('Rate limit exceeded. Please try again later.');
//         }

//         if (!response.ok) {
//           throw new Error(`API request failed with status ${response.status}`);
//         }

//         const data = await response.json();
//         console.log('API Response:', data);

//         if (!data.choices || data.choices.length === 0) {
//           throw new Error('Invalid response format: choices array is empty');
//         }

//         const recipeText = data.choices[0].message.content;

//         const titleMatch = recipeText.match(/Title:\s*(.*)/i);
//         const title = titleMatch ? titleMatch[1] : "Generated Recipe";

//         const instructionsMatch = recipeText.match(/Instructions:\s*(.*)/is);
//         const instructions = instructionsMatch ? instructionsMatch[1] : recipeText;

//         const newRecipe = {
//           title: title,
//           ingredients: inventory,
//           instructions: instructions,
//         };

//         setGeneratedRecipe(newRecipe);

//       } catch (error) {
//         console.error('Error generating recipe:', error);
//         setGeneratedRecipe({
//           title: "Error",
//           ingredients: [],
//           instructions: "There was an error generating the recipe. Please try again later.",
//         });
//       }
//     }
//   };

//   const saveRecipe = async () => {
//     const user = auth.currentUser;
//     if (user && generatedRecipe) {
//       try {
//         const userRecipesCollection = collection(firestore, 'users', user.uid, 'recipes');
//         await setDoc(doc(userRecipesCollection, generatedRecipe.title), generatedRecipe);
//         setRecipes(prevRecipes => [...prevRecipes, generatedRecipe]);
//         setGeneratedRecipe(null);
//       } catch (error) {
//         console.error('Error saving recipe:', error);
//       }
//     }
//   };

//   const handleRecipeClick = (recipe) => {
//     setSelectedRecipe(recipe);
//   };

//   return (
//     <Box 
//       border="1px solid #333" 
//       height="750px" 
//       width="800px"
//       display="flex" 
//       flexDirection="column"
//       justifyContent="center" 
//       alignItems="center" 
//       bgcolor="#f0f0f0"
//       paddingBottom={2}
//     >
//       <Box 
//         width="100%" 
//         height="80px" 
//         bgcolor="#ADD8E6" 
//         display="flex" 
//         alignItems="center" 
//         justifyContent="center"
//       >
//         <Typography variant="h3" color="#333" sx={{ fontFamily: '"Josefin", cursive' }}>
//           Recipes
//         </Typography>
//       </Box>
//       <Button 
//         variant="outlined" 
//         size="large"
//         onClick={generateRecipe}
//         sx={{ mt: 2 }}
//       >
//         Generate Recipe
//       </Button>
//       <Stack width="100%" height="650px" spacing={2} overflow="auto" padding={2}>
//         {generatedRecipe ? (
//           <Card>
//             <CardContent>
//               <Typography variant="h5" component="div">
//                 {generatedRecipe.title}
//               </Typography>
//               <Typography sx={{ mb: 1.5 }} color="text.secondary">
//                 Ingredients:
//               </Typography>
//               <Typography variant="body2">
//                 {generatedRecipe.ingredients.join(', ')}
//               </Typography>
//               <Typography sx={{ mt: 2 }} variant="body2">
//                 Instructions:
//               </Typography>
//               <Typography variant="body2" component="div">
//                 {generatedRecipe.instructions.split('\n').map((line, index) => (
//                   <div key={index}>{line}</div>
//                 ))}
//               </Typography>
//             </CardContent>
//             <CardActions>
//               <Button size="small" onClick={() => setGeneratedRecipe(null)}>Back to Saved Recipes</Button>
//               <Button size="small" onClick={saveRecipe}>Save Recipe</Button>
//             </CardActions>
//           </Card>
//         ) : selectedRecipe ? (
//           <Card>
//             <CardContent>
//               <Typography variant="h5" component="div">
//                 {selectedRecipe.title}
//               </Typography>
//               <Typography sx={{ mb: 1.5 }} color="text.secondary">
//                 Ingredients:
//               </Typography>
//               <Typography variant="body2">
//                 {selectedRecipe.ingredients.join(', ')}
//               </Typography>
//               <Typography sx={{ mt: 2 }} variant="body2">
//                 Instructions:
//               </Typography>
//               <Typography variant="body2" component="div">
//                 {selectedRecipe.instructions.split('\n').map((line, index) => (
//                   <div key={index}>{line}</div>
//                 ))}
//               </Typography>
//             </CardContent>
//             <CardActions>
//               <Button size="small" onClick={() => setSelectedRecipe(null)}>Back to Recipe List</Button>
//             </CardActions>
//           </Card>
//         ) : (
//           recipes.map((recipe) => (
//             <Card key={recipe.id} onClick={() => handleRecipeClick(recipe)}>
//               <CardContent>
//                 <Typography variant="h5" component="div">
//                   {recipe.title}
//                 </Typography>
//               </CardContent>
//             </Card>
//           ))
//         )}
//       </Stack>
//     </Box>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { firestore, auth } from "@/firebase";
import { Box, Typography, Button, Stack, Card, CardContent, CardActions, Grid, Paper } from '@mui/material';
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

export default function RecipeComponent() {
  const [recipes, setRecipes] = useState([]);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

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
            "model": "qwen/qwen-2-7b-instruct:free",
            "messages": [
              { "role": "user", "content": `Create a recipe using these ingredients: ${inventory.join(', ')}. Format your recipe with a title, spacing, and numbered instructions.` },
            ],
          })
        });

        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (!data.choices || data.choices.length === 0) {
          throw new Error('Invalid response format: choices array is empty');
        }

        const recipeText = data.choices[0].message.content;

        const titleMatch = recipeText.match(/Title:\s*(.*)/i);
        const title = titleMatch ? titleMatch[1] : "Generated Recipe";

        const instructionsMatch = recipeText.match(/Instructions:\s*(.*)/is);
        const instructions = instructionsMatch ? instructionsMatch[1] : recipeText;

        const newRecipe = {
          title: title,
          ingredients: inventory,
          instructions: instructions,
        };

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

  const saveRecipe = async () => {
    const user = auth.currentUser;
    if (user && generatedRecipe) {
      try {
        const userRecipesCollection = collection(firestore, 'users', user.uid, 'recipes');
        await setDoc(doc(userRecipesCollection, generatedRecipe.title), generatedRecipe);
        setRecipes(prevRecipes => [...prevRecipes, generatedRecipe]);
        setGeneratedRecipe(null);
      } catch (error) {
        console.error('Error saving recipe:', error);
      }
    }
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
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
          Recipes
        </Typography>
        <Button 
          variant="contained" 
          onClick={generateRecipe}
          sx={{ mt: 2 }}
        >
          Generate Recipe
        </Button>
      </Paper>
      <Grid container spacing={3} sx={{ width: '80%', maxHeight: '650px', overflowY: 'auto', padding: 2 }}>
        {generatedRecipe ? (
          <Grid item xs={12}>
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
                <Button size="small" onClick={saveRecipe}>Save Recipe</Button>
              </CardActions>
            </Card>
          </Grid>
        ) : selectedRecipe ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {selectedRecipe.title}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Ingredients:
                </Typography>
                <Typography variant="body2">
                  {selectedRecipe.ingredients.join(', ')}
                </Typography>
                <Typography sx={{ mt: 2 }} variant="body2">
                  Instructions:
                </Typography>
                <Typography variant="body2" component="div">
                  {selectedRecipe.instructions.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => setSelectedRecipe(null)}>Back to Recipe List</Button>
              </CardActions>
            </Card>
          </Grid>
        ) : (
          recipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
              <Card onClick={() => handleRecipeClick(recipe)}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {recipe.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}