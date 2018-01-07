/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Line = require('../eq/Line');
var Job = require('./Job');
var IngredientComponent = require('./IngredientComponent');
var BusinessBase = require('../BusinessBase');
var utils = require('../../lib/utils');
var Recipe = modelBase.define('Recipe', {
    ident: modelBase.Sequelize.STRING,
    name: modelBase.Sequelize.STRING,
    category: modelBase.Sequelize.INTEGER,
    isTemplate: modelBase.Sequelize.BOOLEAN,
    lineIdent: modelBase.Sequelize.STRING,
    jobIdent: modelBase.Sequelize.STRING,
    isProduced: modelBase.Sequelize.BOOLEAN
}, {
    classMethods: {
        copyFromTemplate: function (lineIdent, newJob) {
            Recipe.findOne({
                where: {lineIdent: lineIdent}
            }).then(function (template) {
                var recipeInfo ={
                    ident: newJob.ident,
                    name: template.name,
                    category: template.category
                };
                Recipe.create(template).then(function (newRecipe) {
                    newRecipe.jobIdent = newJob.Ident;
                    newRecipe.jobId = newJob.id;
                    newRecipe.isTemplate = false;
                });
            });
        }
    }
});


Recipe.hasMany(IngredientComponent, {as: 'Senders'});
Recipe.hasMany(IngredientComponent, {as: 'Receivers'});

Recipe.belongsTo(Job);
Recipe.belongsTo(Line);

utils.inherits(Recipe.Instance.prototype, BusinessBase.prototype);
module.exports = Recipe;