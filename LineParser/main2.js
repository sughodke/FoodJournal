var _  = require('underscore');

// Import Underscore.string to separate object, because there are conflict functions (include, reverse, contains)
_.str = require('underscore.string');

// Mix in non-conflict functions to Underscore namespace if you want
_.mixin(_.str.exports());

// All functions, include conflict, will be available through _.str object
_.str.include('Underscore.string', 'string'); // => true

var CountRegEx = /([0-9]x)|(x[0-9])/;
var CalRegEx = /([0-9]+)/;

var items = [];

function chewFood(item) {
  console.log(item);

  var countMatch = item.match(CountRegEx);
  if (countMatch) {
    console.log('count: '+countMatch[0]);
    item = _(item).splice(countMatch.index, countMatch[0].length).trim();
  }

  var calMatch = item.match(CalRegEx);
  if (calMatch) {
    console.log('cal: '+calMatch[0]);
    item = _(item).splice(calMatch.index, calMatch[0].length).trim();
  }
  console.log('food: '+item +'\n');
}

if (process.argv.length == 2) 
  items = 
    [
     'cantoloupe',
     'grapes 100',
     'granola bars x2',
     'rice 2x 400', 
     'milk 100 2x'
    ];
else {
  //items = process.argv.splice(2);
  var t = "";
  var a = _.chars( process.argv[2] );

  a.forEach(function(i){
    t = t + i;
    items.push(t);
  });
  console.log(items);
}

items.forEach(chewFood);

