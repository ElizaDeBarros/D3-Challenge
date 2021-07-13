//set the dimensions and margins of the graph
var margin = {top: 40, right: 40, bottom: 100, left: 100},
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// creates svg container
var svg = d3.select("#scatter")
.append("svg")
.attr("height", height + margin.top + margin.bottom)
.attr("width", width + margin.left + margin.right);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform",`translate(${margin.left}, ${margin.top})`);  /*setting the transformer attribute equal to the translation based on the 
                                                                            given chart margin. Offsets everything from 0,0 to 100,40 */

// Initial Params
var chosenXAxis = "income";
var chosenYAxis = "obesity";


//------------------------------------------------------------------------------------------------------------------------------------------------------
// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) { 
    // create scales
    var xLinearScale = d3.scaleLinear().domain([(d3.min(censusData, d => d[chosenXAxis])*0.8),d3.max(censusData, d => d[chosenXAxis])*1.2]).range([0,width]);
    return xLinearScale;
};

  // function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) { 
    // create scales
    var yLinearScale = d3.scaleLinear().domain([(d3.min(censusData, d => d[chosenYAxis])*0.8),d3.max(censusData, d => d[chosenYAxis])*1.2]).range([height,0]);
    return yLinearScale;  
};

 // function used for updating xAxis var upon click on axis label
function renderxAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
};

  // function used for updating yAxis var upon click on axis label
function renderyAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
};

 // functions used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .call(d3.axisBottom(newXScale));
 
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]))
        .call(d3.axisLeft(newYScale));
  
    return circlesGroup;
};

// functions used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) { 
    var xLabel;
        if (chosenXAxis === "income") {
            xLabel = "Household Income (Mediam)";
        }
        else if (chosenXAxis === "age") {
            xLabel = "Age (Mediam)";
        }
        else {
            xLabel = "Poverty";
        };

    var yLabel;
        if (chosenYAxis === "obesity") {
            yLabel = "Obese (%)";
        }
        else if (chosenYAxis === "smokes") {
            yLabel = "Smokes (%)";
        }
        else {
            yLabel = "Lacks Healthcare (%)";
        };

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0, 0])
        .html(function(d) {
        return (`${d.state}<br>${xLabel}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function(data) {
        toolTip.hide(data);
        });

    return circlesGroup;
};
//------------------------------------------------------------------------------------------------------------------------------------------------------
d3.csv("./assets/data/data.csv").then(function(censusData, err) {
    if(err) throw err;
    
    // pull data from the csv file and for numbers, cast as number
    censusData.forEach(function(data) {
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
    data.income = +data.income;
    data.age = +data.age;
    data.poverty = +data.poverty;
     //console.log(data);
    });
    
    // Configure a linear scale for the horizontal axis
    var xLinearScale = xScale(censusData,chosenXAxis); 

    // Configure a linear scale for the vertical axis
    var yLinearScale = yScale(censusData,chosenYAxis); 
    
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    
    // set x to the bottom of the chart
    var xAxis = chartGroup.append("g")
        .classed("x-axis",true)
        .attr("transform",`translate(0, ${height})`)
        .call(bottomAxis);
    
    // set y to y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis",true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("class", "stateCircle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 14);
        
    chartGroup.selectAll('text')
        .data(censusData)
        .enter().append('text')
        .text(d => d.abbr)
        .attr("class", "stateText")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]));

    // Create group for x-axis label
    var labelsGroupX = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // Create group for x-axis labels
    var labelIncome = labelsGroupX.append("text")
        .attr("class", "aText")
        .attr("y", 70)
        .attr("x", 0)
        .attr("value", "income")
        .attr("fill", "black")
        .classed("active", true)
        .text("Household Income (Mediam)");

    var labelAge = labelsGroupX.append("text")
    .attr("class", "aText")
        .attr("y", 50)
        .attr("x", 0)
        .attr("value", "age")
        .attr("fill", "black")
        .classed("active", false)
        .text("Age (Mediam)");

    var labelPoverty = labelsGroupX.append("text")
    .attr("class", "aText")
        .attr("y", 30)
        .attr("x", 0)
        .attr("value", "poverty")
        .attr("fill", "black")
        .classed("active", false)
        .text("Poverty");


    // Create group for y-axis labels
    var labelsGroupY = chartGroup.append("g");

    var labelObesity = labelsGroupY.append("text")
        .attr("class", "aText")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("x", -200)
        .attr("value", "obesity")
        .attr("fill", "black")
        .classed("active", true)
        .text("Obese (%)");

    var labelSmokes = labelsGroupY.append("text")
        .attr("class", "aText")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -200)
        .attr("value", "smokes")
        .attr("fill", "black")
        .classed("active", false)
        .text("Smokes (%)");

    var labelHealth = labelsGroupY.append("text")
        .attr("class", "aText")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -200)
        .attr("value", "healthcare")
        .attr("fill", "black")
        .classed("active", false)
        .text("Lacks Healthcare (%)");


    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup); 
        
    // x axis labels event listener
    labelsGroupX.selectAll("text")
    .on("click", function() {
        // get value of selection
        var valueX = d3.select(this).attr("value");
            if (valueX !== chosenXAxis) {
            // replaces chosenXAxis with value
            chosenXAxis = valueX;
            };
            // updates x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderxAxis(xLinearScale, xAxis);

 
        // changes classes to change bold text
        if (chosenXAxis === "age") {
            labelAge
            .classed("active", true)
            .classed("inactive", false);
            labelIncome
            .classed("active", false)
            .classed("inactive", true);
            labelPoverty
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
            labelAge
            .classed("active", false)
            .classed("inactive", true);
            labelIncome
            .classed("active", true)
            .classed("inactive", false);
            labelPoverty
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            labelAge
            .classed("active", false)
            .classed("inactive", true);
            labelIncome
            .classed("active", false)
            .classed("inactive", true);
            labelPoverty
            .classed("active", true)
            .classed("inactive", false);
        };
           // updates circles with new x values
           circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        
           // updates tooltips with new info
           circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    });

        // y axis labels event listener
    labelsGroupY.selectAll("text")
    .on("click", function() {
        // get value of selection
        var valueY = d3.select(this).attr("value");
        if (valueY !== chosenYAxis) {
        // replaces chosenYAxis with value
        chosenYAxis = valueY;
        };
        // updates y scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderyAxis(yLinearScale, yAxis);

        if (chosenYAxis === "obesity") {
            labelObesity
            .classed("active", true)
            .classed("inactive", false);
            labelSmokes
            .classed("active", false)
            .classed("inactive", true);
            labelHealth
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
            labelObesity
            .classed("active", false)
            .classed("inactive", true);
            labelSmokes
            .classed("active", true)
            .classed("inactive", false);
            labelHealth
            .classed("active", false)
            .classed("inactive", true);
        }
        else {labelObesity
            .classed("active", false)
            .classed("inactive", true);
            labelSmokes
            .classed("active", false)
            .classed("inactive", true);
            labelHealth
            .classed("active", true)
            .classed("inactive", false);
        };

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    });
        
}).catch(function(error) {
console.log(error);
});