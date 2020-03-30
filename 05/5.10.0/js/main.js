/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

var margin = { left:80, right:20, top:50, bottom:100 };

var width = 600 - margin.left - margin.right,
	height = 400 - margin.top - margin.bottom;
	
var flag = true;

var idx_flag = 0;

var update_time = 100

  
var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");


var xAxisGroup = g.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + height +")");


var yAxisGroup = g.append("g")
    .attr("class", "y axis");



var x = d3.scaleLinear()
	.range([0,width])
	.domain([0, 90]);
	
var y = d3.scaleLog()
	.base(10)
	.range([height, 0])
	.domain([142, 150000]);

var area = d3.scaleLinear()
    .range([25*Math.PI, 1500*Math.PI])
	.domain([2000, 1400000000]);
var continentColor = d3.scaleOrdinal(d3.schemePastel1);



// X Label
var xLabel = g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
	.text("Life Expectancy (Years)")

// Y Label
var yLabel = g.append("text")
    .attr("y", -60)
    .attr("x", -(height / 2))
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("GDP Per Capita ($)");

	
var timeLabel = g.append("text")
.attr("y", height -10)
.attr("x", width - 40)
.attr("font-size", "40px")
.attr("opacity", "0.4")
.attr("text-anchor", "middle")
.text("1800");


d3.json("data/data.json").then(function(data){
	
	console.log(data);

	// Need to study
	const formattedData = data.map(function(year){
        return year["countries"].filter(function(country){
            var dataExists = (country.income && country.life_exp);
            return dataExists
        }).map(function(country){
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;            
        })
	});
	console.log(formattedData)

	var data_length = data.length;

    d3.interval(function(){
		idx_flag = (idx_flag + 1)%data_length
		update(formattedData[idx_flag],+data[idx_flag].year)

    }, update_time);

    // Run the vis for the first time
    update(formattedData[0],+data[0].year);
})

function update(data,year){
	var t = d3.transition().duration(100);


	// X Axis
	var xAxisCall = d3.axisBottom(x);
	xAxisGroup.transition(t).call(xAxisCall);;

	// Y Axis
	var yAxisCall = d3.axisLeft(y)
		// .tickValues([400, 4000, 40000])
		.tickValues([1000,10000,100000])
		.tickFormat(function(d){ return "$" + d; });
	yAxisGroup.transition(t).call(yAxisCall);

	var rects = g.selectAll("circle")
	.data(data, function(d){
		return d.country;
	});

	rects.exit()
		.attr("class", "exit")
		.remove()


	rects.enter()
		.append("circle")
			.attr("fill", "grey")
				.attr("cx", function(d){ return  x(d.life_exp) })
				.attr("cy",function(d){ return y(d.income)})
				.attr("r", function(d){ return 5})
				.attr("fill", function(d) { return continentColor(d.continent); })

			// AND UPDATE old elements present in new data.
			.merge(rects)
			.transition(t)
				.attr("cx", function(d){ return x(d.life_exp) })
				.attr("cy", function(d){ return y(d.income)  })
				.attr("r", function(d){ return Math.sqrt(area(d.population) / Math.PI) });


	// Update the time label
	timeLabel.text(year)
}