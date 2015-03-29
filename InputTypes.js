var input_types = {};

var getInputByType = function(type){
	if(!input_types.hasOwnProperty(type)){
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
