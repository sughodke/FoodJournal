var CountRegEx = /([0-9]x)|(x[0-9])/;
var CalRegEx = / [0-9]+$/;

var items = [ 'cantoloupe',
              'grapes 100',
              'granola bars x2',
              'rice 2x 400' ];


items.forEach(function(item){
  console.log(item);
  var countMatch = item.match(CountRegEx);
  var calMatch = item.match(CalRegEx);
  if (countMatch) {
    console.log(item.substring(0,countMatch.index) + item.substring(countMatch.index+countMatch[0].length);
    console.log('count: '+countMatch[0]);
  }
  if (calMatch) console.log('cal: '+calMatch[0]);
  console.log();
});

