var _ = require('lodash');		
var request = require('request');

var getVariants = function(products, productType) {
  return _(products)
    .filter(function (p) {return p.product_type === productType})
    .flatMap('variants')
    //Spend the least amount of money possible
    .sortBy(function (variant) {
      return +variant.price;
    })
    //no duplicate variants
    .uniqBy(function (variant) {
      return variant.title;
    })
    .value();
};

var getGrams = function (products, numElements) {
  return _(products)
    .take(numElements)
    .sumBy('grams');
};

var calculateTotalWeight = function (products) {
  var computerVariants = getVariants(products, 'Computer');
  var keyboardVariants = getVariants(products, 'Keyboard');
  var minAmountProducts = Math.min(computerVariants.length, keyboardVariants.length);

  return getGrams(computerVariants, minAmountProducts) + 
    getGrams(keyboardVariants, minAmountProducts);
};

var keyboardOrComputer = function (product) {
  return product.product_type === 'Computer' || product.product_type === 'Keyboard';
};

var requestData = function (page, products) {
	request(
		'http://shopicruit.myshopify.com/products.json?page=' + page,
		function(err, res, body) {
      var newProducts = JSON.parse(body).products;
			if (newProducts.length) {
				return requestData(page + 1, products.concat(newProducts.filter(keyboardOrComputer)));
			} 

			console.log(calculateTotalWeight(products), 'grams');
	});
};

requestData(1, []);
