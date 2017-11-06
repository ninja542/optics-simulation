d3.select("#convex-lens").call(d3.drag().subject(subject).on("drag", dragmove));
function dragmove(){
	var x = d3.event.x;
	var y = d3.event.y;
	d3.select(this).attr("transform", "translate("+x+","+y+")");
}
function subject(d){
	var t = d3.select(this);
	return {x: t.attr("x"), y: t.attr("y")};
	// return {x: d3.event.x, y: d3.event.y};
}