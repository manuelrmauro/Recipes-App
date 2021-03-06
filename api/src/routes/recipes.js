const { Router } = require('express');
const { Recipe, Step, Diet } = require('../db');
const axios = require('axios');
const { API_KEY } = process.env;

const router = Router();

router.get('/', async function (req, res) {
	//DATABASE
	let dbRecipes = await Recipe.findAll({
		include: [
			{
				model: Step,
			},
			{
				model: Diet,
			},
		],
		order: [
			[Step, 'number', 'ASC'],
			[Diet, 'id', 'ASC'],
			['id', 'ASC'],
		],
	});
	// adapta la lista para que encaje con la informacion traida de la api
	dbRecipes = dbRecipes.map((el) => el.get({ plain: true }));
	dbRecipes.forEach((recipe) => {
		adaptQuery(recipe);
	});

	let recipes = dbRecipes;

	// EXTERNAL API
	// COMENTAR PARA NO USAR LA API EXTERNA
 	try {
		const eaRecipes = await axios.get(
			`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`
		);
		// UNIFICA AMBAS LISTAS
		recipes = [...dbRecipes, ...eaRecipes.data.results];
	} catch (error) {
		console.log('EXTERNAL API FAILED.')
	} 

	// BUSQUEDA POR NAME
	if (req.query.name) {
		recipes = recipes.filter((recipe) =>
			recipe.title.toLowerCase().includes(req.query.name.toLowerCase())
		);
		if (!recipes.length) {
			return res.json([]);
		}
	}
	// ORDENAR ALFABETICAMENTE O POR SCORE
	if (req.query.order) {
		if (req.query.order === 'alpha') recipes = sort(recipes, 'title', 'asc');
		if (req.query.order === 'alphaDesc')
			recipes = sort(recipes, 'title', 'desc');
		if (req.query.order === 'score')
			recipes = sort(recipes, 'spoonacularScore', 'asc');
		if (req.query.order === 'scoreDesc')
			recipes = sort(recipes, 'spoonacularScore', 'desc');
		if (req.query.order === 'time')
		  recipes = sort(recipes, 'readyInMinutes')
	}


	if (!recipes.length) {
		return res.status(404).json(recipes);
	}
	res.json(recipes);
});

router.get('/:id', (req, res) => {
	const { id } = req.params;
	let recipe;
	if (isNaN(id)) {
		// DATABASE
		Recipe.findByPk(id, {
			include: [
				{
					model: Step,
				},
				{
					model: Diet,
				},
			],
			order: [
				[Step, 'number', 'ASC'],
				[Diet, 'id', 'ASC'],
				['id', 'ASC'],
			],
		})
			.then((recipe) => recipe?.get({ plain: true }))
			.then((recipe) => {
				console.log(recipe);
				if (recipe) recipe = adaptQuery(recipe);
				else return res.status(404).json({});
				res.json(recipe);
			});
	} else {
		// EXTERNAL API
		axios
			.get(
				`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`
			)
			.then((data) => {
				recipe = data.data;
				// trae son la data necesaria
				filteredRecipe = {
					id,
					title: recipe.title,
					summary: recipe.summary,
					spoonacularScore: recipe.spoonacularScore,
					healthScore: recipe.healthScore,
					readyInMinutes: recipe.readyInMinutes,
					image: recipe.image,
					diets: recipe.diets,
					analyzedInstructions: recipe.analyzedInstructions,
				};
				recipe = filteredRecipe;
				res.json(recipe);
			})
			.catch((err) => {
				res.status(404).json({});
			});
	}
});

function adaptQuery(recipe) {
	recipe.diets = recipe.diets.map((diet) => diet.name);
	recipe.analyzedInstructions = [
		{
			steps: recipe.steps.map((step) => ({
				number: step.number,
				step: step.step,
			})),
		},
	];
	delete recipe.steps;
	return recipe;
}

function sort(recipes, property, direc = 'asc') {
	direc = direc.toLowerCase();
	if (direc === 'asc') {
		return recipes.sort(function (a, b) {
			if (a[property] > b[property]) return 1;
			if (a[property] < b[property]) return -1;
			return 0;
		});
	}
	if (direc === 'desc') {
		return recipes.sort(function (a, b) {
			if (a[property] > b[property]) return -1;
			if (a[property] < b[property]) return 1;
			return 0;
		});
	}
	return [{ error: 'invidate direc' }];
}

module.exports = router;
