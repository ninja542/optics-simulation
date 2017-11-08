var margin = { top: 40, right: 40, bottom: 40, left: 40 },
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var svg = d3.select('#simulation')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .select('#transform')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
// general drag code for non circle things
var drag = d3.drag().on("drag", dragmove);
// d3.select("#convex-lens").call(drag);
d3.select("#object").call(drag);
// function dragstarted(){
// 	// redraws the object to be on top
// 	d3.select(this).raise();
// }
// this gets the center of the object
var bound = d3.select('#mirror').node().getBoundingClientRect();
var pencilBound = d3.select("#object").node().getBoundingClientRect();

function dragmove(){
	// gets the bounding rectangle so we can find the center
	let bound = this.getBoundingClientRect();
	var x = d3.event.x - (bound.width/2);
	var y = d3.event.y - (bound.height/2);
	d3.select(this).attr("transform", "translate("+x+","+y+")");
}
function adjustedDrag(){

}
// variable thing to get the circle drag to work
var circleEye = [
	{x: 0, y: 0}
];
// make the circle
var eye = svg.selectAll("circle").data(circleEye).enter().append('circle')
    .attr('cx', function(d){return d.x;})
    .attr('cy', function(d){return d.y;})
    .attr('r', 10)
    .style('fill', '#000')
    .attr("id", "eye");
// call the circle and drag it
eye.call(d3.drag().on("drag", circledrag));
// set the x and y attributes to the same as the dragging
function circledrag(d){
	d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}
// implement stupid graph
// x axis scaling stuff
var xScale = d3.scaleLinear().domain([-100, 100]).range([0, width]);
var xAxis = d3.axisBottom(xScale);
// y axis scaling stuff
var yScale = d3.scaleLinear().domain([100, -100]).range([0, height]);
var yAxis = d3.axisLeft(yScale);
// make the axes
svg.append("g").call(xAxis).attr("transform", "translate(" + 0 + ", " + yScale(0) + ")");
svg.append("g").call(yAxis).attr("transform", "translate(" + xScale(0) + ", " + 0 + ")");
d3.select("#mirror").attr("transform", "translate(" + (xScale(0)-bound.width/2) + ", " + (yScale(0)-bound.height/2) + ")");
d3.select("#object").attr("transform", "translate("+(xScale(-20)-pencilBound.width/2)+","+(yScale(0)-pencilBound.height/2)+")");
svg.append()