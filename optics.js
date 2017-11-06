d3.select("#convex-lens").call(d3.drag().on("start", dragstarted).on("drag", dragmove));
d3.select("#mirror").call(d3.drag().on("start", dragstarted).on("drag", dragmove));
function dragstarted(){
	d3.select(this).raise();
}
function dragmove(){
	var bound = this.getBoundingClientRect();
	var x = d3.event.x - bound.width/2;
	var y = d3.event.y - bound.height/2;
	d3.select(this).attr("transform", "translate("+x+","+y+")");
}
function subject(){
	var t = d3.transform(d3.select('#convex-lens').attr("transform")),
	    x = t.translate[0],
	    y = t.translate[1];
	return {x: x, y: y};
}