d3.select("#convex-lens").call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));
function dragstarted(d){
	d3.select(this).raise().classed("active", true);
}
function dragged(d){
	d3.select(this).attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
}
function dragended(d){
	d3.select(this).classed("active", false);
}