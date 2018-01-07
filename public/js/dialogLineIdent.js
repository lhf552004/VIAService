/**
 * Created by pi on 8/30/16.
 */

var dialogLineIdent;
$(function () {
    dialogLineIdent = $("#getLineIdent").dialog({
        title: 'GcObject',
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            Cancel: function () {
                dialogLineIdent.dialog("close");
            },
            OK: function () {
                dialogLineIdent.dialog("close");
                var selectedLineId = $(lineList).val();
                createRecipe(selectedLineId);
            }
        }
    });

});






function createRecipe(selectedLineId) {
    $.getJSON('/admin/recipe/recipeList/createRecipe/:' + selectedLineId, function (newRecipe) {
        console.log('newRecipe: ' + newRecipe);
        console.log('newRecipe id: ' + newRecipe.id);
        location.reload();
    });
}