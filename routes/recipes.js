const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const Recipe = require("../models/Recipe.model");
require("express-async-errors");

// GET
router.get("/", async (req, res, next) => {
  console.log("Retrieve all recipes.");
  const recipes = await Recipe.find();
  res.json(recipes);
});

router.get("/:id", async (req, res) => {
  console.log("Retrieve a specific recipe.");
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) return res.status(404).send("the recipe is not found..!");

  res.json(recipe);
});

// POST
router.post("/", auth, async (req, res) => {
  const { error } = validateRecipe(req.body);

  if (error) return res.status(400).json({ message: error.message });

  const recipeDetails = _.pick(req.body, [
    "title",
    "description",
    "ingridients",
    "instructions",
    "image",
    "category",
    "author",
  ]);

  const result = await Recipe.create(recipeDetails);
  console.log("New Recipe has been added to the dataBase .");
  res.json(result);
});

// PUT
router.put("/:id", auth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) return res.status(404).send("the recipe is not found.!");

  const { error } = validateRecipe(req.body);

  if (error) return res.status(400).send(error.message);

  recipe.title = req.body.title;
  recipe.description = req.body.description;
  recipe.ingridients = req.body.ingridients;
  recipe.instructions = req.body.instructions;
  recipe.image = req.body.image;
  recipe.category = req.body.category;
  recipe.author = req.body.author;

  console.log("a Recipe has been updated in the dataBase .");
  res.json(recipe);
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  const recipe = await Recipe.findById(id);

  if (!recipe) return res.status(404).send("the recipe with is not found.!");

  const deletedRecipe = await Recipe.deleteOne({ _id: id });

  console.log("a recipe has been deleted from the dataBase.");
  res.send("you have sucsessfully removed a recipe.");
});

function validateRecipe(recipe) {
  const ENUM = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const schema = Joi.object({
    title: Joi.string().min(3).max(30).required(),
    description: Joi.string().min(3).max(255).required(),
    ingridients: Joi.array().items(Joi.string().required()).min(1).required(),
    instructions: Joi.array().items(Joi.string().required()).min(3).required(),
    image: Joi.string().min(5).max(500).required(),
    category: Joi.string()
      .valid(...ENUM)
      .required(),
    author: Joi.string().length(24).required(),
  });

  return schema.validate(recipe);
}

module.exports = router;
