// margins
var margin = { top: 40, right: 40, bottom: 40, left: 40 },
		width = 1000 - margin.left - margin.right,
		height = 800 - margin.top - margin.bottom;
var svg = d3.select('#simulation')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
	.select('#transform')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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
// note: need to add gridlines.

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

// variables for getting center of mirror, object, etc
var mirrorBound = d3.select('#mirror').node().getBoundingClientRect();
var pencilBound = d3.select("#object").node().getBoundingClientRect();
var eyeBound = d3.select("#eye").node().getBoundingClientRect();
var convexLensBound = d3.select("#convex-lens").node().getBoundingClientRect();
console.log(pencilBound);
console.log(eyeBound);

// positioning things at the start
d3.select("#mirror").attr("transform", "translate(" + (xScale(0)-mirrorBound.width/2) + ", " + (yScale(0)-mirrorBound.height/2) + ")");
d3.select("#object").attr("transform", "translate("+(xScale(-20)-pencilBound.width/2)+","+(yScale(0)-pencilBound.height/2)+")");
d3.select("#eye").attr("transform", "translate(" + xScale(-40) + ", " + yScale(60) + ")");
svg.select("#object-image").attr("transform", "translate("+(xScale(20)-pencilBound.width/2)+","+(yScale(0)-pencilBound.height/2)+")");
// svg.select("#lens").attr("viewBox", "0 0 40 200");
svg.select("#convex-lens").attr("transform", "translate(" + (xScale(0)-convexLensBound.width/2) + ", " + (yScale(0)-convexLensBound.height/2) + ")");

// general drag code for non circle things
var drag = d3.drag().on("start", dragstarted).on("drag", dragmove);
d3.select("#object").call(drag);
function dragstarted(){
	// redraws the object to be on top
	d3.select(this).raise();
}
function dragmove(){
		// gets the bounding rectangle so we can find the center
		let bound = this.getBoundingClientRect();
		var x = d3.event.x - (bound.width/2);
		var y = d3.event.y - (bound.height/2);
		d3.select(this).attr("transform", "translate("+x+","+y+")");
		svg.select("#object-image").attr("transform", "translate("+(xScale(100)-d3.event.x-bound.width/2)+","+(y)+")");
}

// ray tracing code

//update object bounds
eyeBound = d3.select("#eye").node().getBoundingClientRect();
pencilBound = d3.select("#object").node().getBoundingClientRect();
console.log(eyeBound);
console.log(pencilBound);
// plane mirror ray tracing
var coords = [
		{x: eyeBound.x, y: eyeBound.y},
		{x: pencilBound.x-pencilBound.width/2, y: pencilBound.y}
	];

var line = d3.line().x(function(d){return d.x;}).y(function(d){return d.y;});
svg.append("path").attr("d", line(coords)).attr("stroke-width", 1).attr("stroke", "black").attr("class", "solidRayTop");