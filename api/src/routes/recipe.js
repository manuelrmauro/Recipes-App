const { Router } = require('express');
const { Recipe, Step, Diet } = require('../db');

const router = Router();

router.post('/', async function (req, res) {
	let {
		title,
		summary,
		score,
		healthScore,
		readyInMinutes,
		image,
		steps,
		diets,
		origin
	} = req.body;
	// verifica que title y summary existan
	if (typeof title === 'string' && typeof summary === 'string') {
		if (/^[a-zA-Z\ áéíóúÁÉÍÓÚñÑ\s]*$/.test(title)) {
			title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()
			const recipe = await Recipe.create({
				title,
				summary,
				spoonacularScore: score,
				healthScore,
				readyInMinutes,
				image,
				origin
			});
			// si tiene steps se los agrega
			if (Array.isArray(steps)) {
				let number = 1;
				steps.forEach(async (value) => {
					const step = await Step.create({
						number: number++,
						step: value,
					});
					await step.setRecipe(recipe);
				});
			}
			// 
			if (Array.isArray(diets)) {
				const finalDiets = await Diet.findAll({
          raw: true,
					where: {
						name: diets
					},
				})
        recipe.addDiets(finalDiets.map(diet => diet.id))
			}
      return res.json(recipe);
		}
	}
	return res.status(400)

});

module.exports = router;
