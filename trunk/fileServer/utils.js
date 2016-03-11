var extend = function(destination, source) {
	for (var property in source)
	  destination[property] = source[property];
	return destination;
}
exports.extend = extend;

module.exports = extend(exports,{
	"strIsBlank" : function(_Str){
		if(_Str == null){
			return true;
		}

		return /^\s*$/.test(_Str);
	},
	'strIsNotBlank' : function(_Str){
		return !this.strIsBlank(_Str);
	}}
);