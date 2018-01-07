/**
 * Created by pi on 9/17/16.
 */
$(function () {
    var recipesDataTable = $('#recipesTable').DataTable();
    var selected = [], lines = [];
    var dialog, form,

        // From http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29
        emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        ident = $("#ident"),
        email = $("#email"),
        password = $("#password"),
        $lines = $("#lines"),
        lineId = -1,
        lineIdent = '',
        allFields = $([]).add(ident).add(email).add(password),
        tips = $(".validateTips");

    function updateTips(t) {
        tips
            .text(t)
            .addClass("ui-state-highlight");
        setTimeout(function () {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }

    function checkLength(o, n, min, max) {
        if (o.val().length > max || o.val().length < min) {
            o.addClass("ui-state-error");
            updateTips("Length of " + n + " must be between " +
                min + " and " + max + ".");
            return false;
        } else {
            return true;
        }
    }

    function checkLine(c, $c, arr) {
        var index = arr.indexOf(c);
        console.log('index: ' + index);
        if (index > -1) {
            return true;
        } else {
            $('#lines-button').addClass("ui-state-error");
            updateTips("lines " + c + " must in the list.");
            return false;
        }
    }

    function checkRegexp(o, regexp, n) {
        if (!( regexp.test(o.val()) )) {
            o.addClass("ui-state-error");
            updateTips(n);
            return false;
        } else {
            return true;
        }
    }

    function addRecipe() {
        var valid = true;
        allFields.removeClass("ui-state-error");

        valid = valid && checkLength(ident, "ident", 3, 16);

        valid = valid && checkLine(lineId, $lines, lines);

        valid = valid && checkRegexp(ident, /^[a-z]([0-9a-z_\s])+$/i, "ident may consist of a-z, 0-9, underscores, spaces and must begin with a letter.");


        if (valid) {
            var recipeInfo = {
                ident: ident.val(),
                LineId: lineId,
                lineIdent: lineIdent
            };
            $.post('/admin/recipe/recipeList/createRecipe/:', {recipeInfo: recipeInfo}, function (data) {
                var newRecipe = null;
                console.log('data: ' + data);
                if (!data.error) {
                    newRecipe = data.newRecipe;
                    console.log('newRecipe: ' + newRecipe);
                    console.log('newRecipe id: ' + newRecipe.id);

                    var rowNode = recipesDataTable.row.add([
                        '<a href="/admin/recipe/recipeDetail/:' + newRecipe.id + '">' + newRecipe.ident + '</a>',
                        newRecipe.name,
                        newRecipe.lineIdent
                    ]).draw(false).node();
                    $(rowNode).attr('id', newRecipe.id);

                } else {
                    $('#errors').append('<li>' + data.error + '</li>');
                }
                dialog.dialog("close");

            });
        }
        return valid;
    }

    dialog = $("#createNewRecipeDialog").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Create an Recipe": addRecipe,
            Cancel: function () {
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        addRecipe();
    });


    $('#newRecipe').click(function () {
        $('#errors').empty();
        dialog.dialog("open");
        $.get('/line/getLineList', function (data) {
            console.log('linesStr' + data.lines);

            var lines = JSON.parse(data.lines);
            var options = [];
            for (i = 0; i < lines.length; i++) {
                lines.push(lines[i].id);
                options.push("<option value='" + lines[i].id + "'>" + lines[i].ident + "</option>");
            }
            //append after populating all options
            $('#lines')
                .selectmenu({
                    change: function (event, ui) {
                        lineId = ui.item.value;
                        lineId = parseInt(lineId);
                        lineIdent = ui.item.label;
                    }
                });
        });

    });
    $('#recipesTable tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selected.pop();
        }
        else {
            recipesDataTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            console.log('id: ' + this.id);
            selected.pop();
            selected.push(this.id);
            console.log('selected');
            console.dir(selected);

        }
    });
    $('#deleteRecipe').click(function () {
        $('#errors').empty();
        $('#infos').empty();
        if (selected.length > 0) {
            var toDeleteRecipeIdsStr = JSON.stringify(selected);
            console.log('toDeleteRecipeIdsStr: ' + toDeleteRecipeIdsStr);
            recipesDataTable.row('.selected').remove().draw(false);
            $.post('/admin/recipe/recipeList/deleteRecipe', {toDeleteRecipeIdsStr: toDeleteRecipeIdsStr}, function (data) {
                console.log(data);
                if (data.error) {
                    $('#errors').append('<li>' + data.error + '</li>');
                }
                if (data.info) {
                    $('#infos').append('<li>' + data.info + '</li>');
                }
            });
        } else {
            $('#errors').append('<li>No row selected</li>');
        }

    });

});