const { Router } = require('express');
const { Recipe, Step, Diet } = require('../db');
const axios = require('axios')
const {API_KEY} = process.env

const router = Router();

router.get('/', async function (req, res) {
	
	try {
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
			order : [
				[Step, 'number', 'ASC'],
				[Diet,'id','ASC'],
				['id', 'ASC']
			]
		})
		// adapta la lista para que encaje con la informacion traida de la api
		dbRecipes = dbRecipes.map(el => el.get({ plain: true }))
		dbRecipes.forEach(recipe => {
			adaptQuery(recipe)
		})

		// EXTERNAL API
		const eaRecipes = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`)
		.then(res => res.data.results)

		// AMBAS LISTAS UNIFICADAS
		let recipes = [...dbRecipes,...eaRecipes]
		if (req.query.name) {
			   recipes = recipes.filter(recipe => recipe.title.toLowerCase().includes(req.query.name.toLowerCase()))
				 if(!recipes.length) {
					 return res.status(404).json({error : 'No match found'})
				 }
		}

		res.json(recipes);
	} catch (error) {
		console.log(error)
	}
});

router.get('/:id', async (req,res) => {
	const {id} = req.params
	try {
		let recipe;
		if (id >= 10000) {
			// DATABASE
			 recipe = await Recipe.findByPk(id,{
				include: [
					{
						model: Step,
					},
					{
						model: Diet,
					},
				],
				order : [
					[Step, 'number', 'ASC'],
					[Diet,'id','ASC'],
					['id', 'ASC']
				]
			})
			.then(recipe => recipe.get({ plain: true }))
			recipe = adaptQuery(recipe)
			res.json(recipe)
		} else {
			// EXTERNAL API
			recipe = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`)
			.then (res => res.data)
			const {title, summary, spoonacularScore, healthScore, readyInMinutes, image, diets, analyzedInstructions} = recipe
			filteredRecipe = {
				id, title, summary, spoonacularScore, healthScore, readyInMinutes, image, diets, analyzedInstructions
			}
			recipe = filteredRecipe
			res.json(recipe)
		}
	} catch (error) {
		console.log(error)	
	}
})

function adaptQuery(recipe) {
	recipe.diets = recipe.diets.map(diet => diet.name)
	recipe.analyzedInstructions = [{steps : recipe.steps.map(step => ({number :step.number, step : step.step}))}] 
	delete recipe.steps
	return recipe
}

module.exports = router;
