// @TODO: YOUR CODE HERE!
d3.csv("./assets/data/data.csv").then(function(data) {
    console.log(data);


var state = data.map(d => d.abbr);
console.log(state);




});