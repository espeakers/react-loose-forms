var _ = require('lodash');

var input_types = {};

var getInputByType = function(type){
	if(!_.has(input_types, type)){
		type = 'text';
	}
	return input_types[type];
};

var setInputType = function(type, input){
	input_types[type] = input;
};

module.exports = {
	getInputByType: getInputByType,
	setInputType: setInputType
};
