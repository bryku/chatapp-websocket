module.exports = function(str){
	var date = new Date();
	var id = str + date.toGMTString();
	return id.split('').map((v)=>{
		return Number(v.charCodeAt(0))
	}).reduce((a,c)=>{
		if(c % 2 == 0){return a + (c*2)}
		else{return a + (c*3)}
	},0);	
}