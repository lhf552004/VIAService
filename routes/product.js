/**
 * Created by pi on 7/21/16.
 */
//var Job = require('../../Models/pr/Job');
var Product = require('../models/pr/Product');
var StorageCategory = require('../lib/stateAndCategory/storageCategory');
module.exports = function (app, i18n) {
    app.get('/product/productList', function (req, res) {
        Product.findAll().then(function (products) {
            console.log('products: ' + products);
            res.render('product/productList',
                {
                    products: products
                });
        });

    });
    app.post('/product/productList/createProduct', function (req, res) {

        var productInfo = req.body.productInfo;
        if (productInfo.ident) {
            Product.findOne({
                where: {ident: productInfo.ident}
            }).then(function (existedProduct) {
                if (existedProduct) {
                    res.json({error: i18n.__('the ident already existed.')});
                } else {
                    Product.create(productInfo).then(function (newProduct) {
                        console.log('newProduct: ' + JSON.stringify(newProduct));
                        // console.log('newRecipe.save: ' +newRecipe.save);
                        var newProductJson = newProduct.getJsonObject();
                        //TODO: product state
                        newProductJson.displayState = '';
                        res.json({newProduct: newProductJson});
                    });
                }
            })
        }


    });
    app.post('/product/productList/deleteProduct', function (req, res) {
        var toDeleteProductIdsStr = req.body.toDeleteProductIdsStr;
        console.log('toDeleteProductIdsStr:  ' + toDeleteProductIdsStr);
        var toDeleteProductIds = JSON.parse(toDeleteProductIdsStr);
        Product.destroy({
            where: {
                id: {
                    $in: toDeleteProductIds
                }
            }
        }).then(function (num) {
            res.json({info: i18n.__('have deleted  %d product', num)});
        });
    });

    app.get('/product/productDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var storageStr = '';
        var error = '';
        console.log('storage id: ' + id);
        Product.findOne({
            where: {id: id}
        }).then(function (theProduct) {
            console.log('theProduct: ');
            console.dir(theProduct);
            if (theProduct) {
                res.render('product/productDetail',
                    {
                        product: theProduct.getJsonObject()

                    });
            }
            else {

                error = i18n.__('storage not found');
                console.log(error);
                res.render('product/productDetail',
                    {
                        error: error

                    });
            }


        });
    });
    app.get('/product/getProductList/:category', function (req, res) {
        var category = req.params.category.substring(1);
        Product.findAll({where: {category: category}}).then(function (products) {
            console.log('products: ' + products);
            res.json(
                {
                    products: products
                });
        });
    });

    app.get('/product/getProduct/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var storageStr = '';
        var error = '';
        console.log('storage id: ' + id);
        Product.findOne({
            where: {id: id}
        }).then(function (theProduct) {
            console.log('product: ');
            console.dir(theProduct);
            if (theProduct) {
                res.json(
                    {
                        product: theProduct.getJsonObject()

                    });

            } else {
                res.json(
                    {
                        error: i18n.__('Product: %s is not found', id)

                    });
            }

        });
    });
    app.get('/product/getProductByIdent/:ident', function (req, res) {
        var ident = req.params.ident.substring(1);
        var storageStr = '';
        var error = '';
        console.log('product ident: ' + ident);
        Product.findOne({
            where: {ident: ident}
        }).then(function (theProduct) {
            console.log('product: ');
            console.dir(theProduct);
            if (theProduct) {
                res.json(
                    {
                        product: theProduct.getJsonObject()

                    });

            } else {
                res.json(
                    {
                        error: i18n.__('Product: %s is not found', ident)

                    });
            }

        });
    });
    app.post('/product/productDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        // for(var p in req){
        //     console.log('property of req: '+ p);
        // }
        var productInfo = req.body.productInfo;

        console.log('productInfo: ' + productInfo);
        Product.findOne({
            where: {id: id}
        }).then(function (theProduct) {
            if(theProduct){
                theProduct.update(productInfo).then(function () {
                    console.log("save successfully");
                    res.json({info: i18n.__("save successfully")});
                });
            }
            else {
                res.json({error: i18n.__("product not found")});
            }
        });

    });


}