/**
 * Created by pi on 7/21/16.
 */
var Job = require('../models/pr/Job');
var Line = require('../models/eq/Line');
var Recipe = require('../models/pr/Recipe');
var JobParameter = require('../models/pr/JobParameter');
var IngredientComponent = require('../models/pr/IngredientComponent');
module.exports = function (app, i18n) {
    app.get('/admin/recipe/recipeList', function (req, res) {
        console.log("Recipe localed in i18n: " + i18n.getLocale(req));
        Recipe.findAll({
            where: {IsTemplate: true}
        }).then(function (recipes) {
            console.log('recipes: \n' + recipes);

            // recipes.forEach(function (recipe) {
            //     // console.log('recipe:');
            //     // console.dir(recipe);
            //     // console.log(recipe.getLine);
            //     // console.dir(recipe.getJob);
            //     // for(var p in recipe){
            //     //     console.log('p: ' + p);
            //     // }
            //     recipeJson = recipe.getJsonObject();
            //     recipe.getLine().then(function (line) {
            //         recipeJson.lineIdent =  line.ident;
            //         console.log('lineIdent: ' + recipeJson.lineIdent );
            //         recipeJsons.push(recipeJson);
            //         var recipesStr = JSON.stringify(recipeJsons);
            //         res.render('admin/recipe/recipeList', {
            //                 recipes: recipesStr
            //             }
            //         );
            //     });
            // });

            var recipesStr = JSON.stringify(recipes);
            res.render('admin/recipe/recipeList', {
                    recipes: recipes
                }
            );
        });

    });

    app.get('/admin/recipe/recipeList/createRecipe/:lineId', function (req, res) {
        var lineId = req.params.lineId.substring(1);
        // console.log(lineIdent);
        var recipeInfo = {
            ident: 'newRecipeTemplate',
            isTemplate: true
        };
        var recipeJson = {};
        Line.findOne({
            where: {id: lineId}
        }).then(function (theLine) {
            if (theLine) {
                recipeInfo.LineId = theLine.id;
                recipeInfo.lineIdent = theLine.ident;
                Recipe.create(recipeInfo).then(function (newRecipe) {
                    if (newRecipe) {
                        console.log('newRecipe: ' + JSON.stringify(newRecipe));
                        // console.log('newRecipe.save: ' +newRecipe.save);
                        recipeJson = newRecipe.getJsonObject();
                        res.json({recipe: recipeJson});

                    } else {
                        res.json({error: i18n.__('recipe is not found.')});
                    }

                });

            }
        })

    });
    app.post('/admin/recipe/recipeList/createRecipe/:lineId', function (req, res) {
        var lineId = req.params.lineId.substring(1);
        var recipeJson;
        var recipeInfo = req.body.recipeInfo;
        // console.log(lineIdent)
        Recipe.create(recipeInfo).then(function (newRecipe) {
            if (newRecipe) {
                console.log('newRecipe: ' + JSON.stringify(newRecipe));
                // console.log('newRecipe.save: ' +newRecipe.save);
                recipeJson = newRecipe.getJsonObject();
                res.json({newRecipe: recipeJson});

            } else {
                res.json({error: i18n.__('recipe create failed.')});
            }

        });

    });
    app.get('/admin/recipe/recipeList/deleteRecipe/:toDeleteIds', function (req, res) {
        var toDeleteIdsStr = req.params.toDeleteIds.substring(1);
        var toDeleteIds = JSON.parse(toDeleteIdsStr);
        Recipe.destroy({
            where: {
                id: {
                    $in: toDeleteIds
                }
            }
        }).then(function (message) {
            res.json(message);
        });

    });
    app.post('/admin/recipe/recipeList/deleteRecipe', function (req, res) {
        var toDeleteRecipeIdsStr = req.body.toDeleteRecipeIdsStr;
        console.log('toDeleteRecipeIdsStr:  ' + toDeleteRecipeIdsStr);
        var toDeleteRecipeIds = JSON.parse(toDeleteRecipeIdsStr);
        Recipe.destroy({
            where: {
                id: {
                    $in: toDeleteRecipeIds
                }
            }
        }).then(function (num) {
            res.json({info: i18n.__('have deleted  %d recipe', num)});
        });
    });
    //--------------------------------------------------------------------
    app.get('/admin/recipe/recipeDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var receiversJson = [];
        var sendersJson = [];
        console.log('Recipe id: ' + id);
        Recipe.findOne({
            where: {id: id}
        }).then(function (theRecipe) {
            var recipeJson = theRecipe.getJsonObject();
            theRecipe.getSenders({where: {category: 0}}).then(function (senders) {
                senders.forEach(function (sender) {
                    sendersJson.push(sender.getJsonObject());
                });
                theRecipe.getReceivers({where: {category: 1}}).then(function (receivers) {
                    receivers.forEach(function (receiver) {
                        receiversJson.push(receiver.getJsonObject());
                    });
                    recipeJson.receivers = receiversJson;
                    recipeJson.senders = sendersJson;
                    JobParameter.findAll({where: {RecipeId: id}}).then(function (parameters) {
                        recipeJson.jobParameters = parameters;
                        res.render('admin/recipe/recipeDetail',
                            {
                                recipe: recipeJson

                            });
                    });

                });
            });

        });
    });
    app.post('/admin/recipe/recipeDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var recipeInfo = req.body.recipeInfo;
        console.log('recipeFromClient: ' + recipeInfo);
        Recipe.findOne({
            where: {id: id}
        }).then(function (theRecipe) {
            if (theRecipe) {
                theRecipe.update(recipeInfo).then(function () {
                    console.log("save successfully");
                    res.json({info: i18n.__('recipe save successfully')});
                });
            } else {
                res.json({error: i18n.__('recipe not found')});
            }

        });

    });
//--------------------------------------------------------------------
    app.get('/admin/recipe/createIngredient/:recipeId/:category', function (req, res) {
        var recipeId = req.params.recipeId.substring(1);
        var category = req.params.category.substring(1);
        var receiversJson = [];
        var sendersJson = [];
        console.log('Recipe id: ' + recipeId);
        console.log('type of ingredient to create: ' + category);
        IngredientComponent.create({
            category: category,
            RecipeId: recipeId,
            targetPercentage: 0,
            targetWeight: 0
        }).then(function (newIngredient) {
            console.log('newIngredient');
            console.log(newIngredient);
            if (newIngredient) {
                console.log('response to send new ingredient:');
                res.json({newIngredient: newIngredient.getJsonObject()});
            } else {
                res.json({error: i18n.__('new ingredient is empty.')});
            }

        });
    });

    app.post('/admin/recipe/updateIngredient', function (req, res) {
        var ingredientStr = req.body.ingredientStr;
        //console.log('ingredientStr: ' + ingredientStr);
        var ingredientFromClient = JSON.parse(ingredientStr);
        console.log('ingredientFromClient: ' + ingredientFromClient);
        console.log('ingredientFromClient id: ' + ingredientFromClient.id);
        IngredientComponent.findOne({
            where: {id: ingredientFromClient.id}
        }).then(function (theIngredient) {
            if (theIngredient) {

                theIngredient.update(ingredientFromClient).then(function () {
                    console.log("save successfully");
                    res.json({info: i18n.__("save successfully")});
                });
            } else {
                console.log("ingredient not found");
            }

        });
    });

    app.post('/admin/recipe/deleteIngredient', function (req, res) {

        var toDeleteIngredientIdsStr = req.body.toDeleteIngredientIdsStr;
        console.log('toDeleteIngredientIdsStr:  ' + toDeleteIngredientIdsStr);
        var toDeleteIngredientIds = JSON.parse(toDeleteIngredientIdsStr);
        IngredientComponent.destroy({
            where: {
                id: {
                    $in: toDeleteIngredientIds
                }
            }
        }).then(function (deleteNo) {
            console.log('deleteNo: ' + deleteNo);
            res.json(i18n.__('Have delete ingredient number: %d', deleteNo));
        });

    });
    //------------------------------------------------------------
    //JobParameter
    app.get('/admin/recipe/createJobParameter/:recipeId', function (req, res) {
        var recipeId = req.params.recipeId.substring(1);
        var receiversJson = [];
        var sendersJson = [];
        console.log('Recipe id: ' + recipeId);
        JobParameter.getMaxId().then(function (max) {
            JobParameter.create({
                ident: 'para' + max,
                RecipeId: recipeId,
                name: ''
            }).then(function (newParameter) {
                console.log('newParameter');
                console.log(newParameter);
                if (newParameter) {
                    console.log('response to send new ingredient:');
                    res.json({newParameter: newParameter.getJsonObject()});
                } else {
                    res.json({error: i18n.__('new ingredient is empty.')});
                }

            });
        })

    });
    app.get('/admin/recipe/jobParameterDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        console.log('jobParameter id: ' + id);
        JobParameter.findOne({where:{id:id}}).then(function (theJobParameter) {
            res.json({theJobParameter: theJobParameter.getJsonObject()});
        })

    });
    app.post('/admin/recipe/deleteJobParameter', function (req, res) {
        var toDeleteParameterIdsStr = req.body.toDeleteParameterIdsStr;
        console.log('toDeleteParameterIdsStr:  ' + toDeleteParameterIdsStr);
        var toDeleteParameterIds = JSON.parse(toDeleteParameterIdsStr);
        JobParameter.destroy({
            where: {
                id: {
                    $in: toDeleteParameterIds
                }
            }
        }).then(function (num) {
            res.json({info: i18n.__('have deleted  %d jobParameter', num)});
        });
    });



};