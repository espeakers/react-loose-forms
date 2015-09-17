var input_types = {};

module.exports = {
	getInputByType: function(type){
		if(!input_types.hasOwnProperty(type)){
			type = 'text';
		}
		return input_types[type];
	},
	setInputType: function(type, input){
		input_types[type] = input;
		return input_types[type];
	}
};
