// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Todo Model
  // ----------

  // Our basic **Todo** model has `title`, `order`, and `done` attributes.
  var Todo = Backbone.Model.extend({

    // Default attributes for the todo item.
    defaults: function() {
      return {
        title: "empty todo...",
        order: Todos.nextOrder(),
        done: false,
        food: "",
        count: "",
        cal: ""
      };
    },

    // Ensure that each todo created has `title`.
    initialize: function() {
      if (!this.get("title")) {
        this.set({"title": this.defaults().title});
      }
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    }

  });

  // Todo Collection
  // ---------------

  // The collection of todos is backed by *localStorage* instead of a remote
  // server.
  var TodoList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Todo,

    // Save all of the todo items under the `"todos-backbone"` namespace.
    localStorage: new Backbone.LocalStorage("todos-backbone"),

    // Filter down the list of all todo items that are finished.
    done: function() {
      return this.filter(function(todo){ return todo.get('done'); });
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.done());
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: function(todo) {
      return todo.get('order');
    }
    ,

    // Add up items
    sum: function() {
      var r = 0;
      this.each(function(todo){ 
        if (!todo.get('done')) {
          r += parseInt( todo.get('cal') ) * parseInt( todo.get('count')); 
        }
      });
      return r;
    }
  });

  // Create our global collection of **Todos**.
  var Todos = new TodoList;

  // Todo Item View
  // --------------

  // The DOM element for a todo item...
  var TodoView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .toggle"   : "toggleDone",
      "dblclick .view"  : "edit",
      "click a.destroy" : "clear",
      "keypress .edit"  : "updateOnEnter",
      "blur .edit"      : "close"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the todo item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      return this;
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
      var value = this.input.val();
      if (!value) {
        this.clear();
      } else {
        this.model.save({title: value});
        this.$el.removeClass("editing");
      }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "focus #new-todo": "readyTextbox",
      "blur #new-todo": "placeholderTextbox",
      "keypress #new-todo":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete"
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {

      this.input = this.$("#new-todo");
      this.allCheckbox = this.$("#toggle-all")[0];

      this.listenTo(Todos, 'add', this.addOne);
      this.listenTo(Todos, 'reset', this.addAll);
      this.listenTo(Todos, 'all', this.render);

      this.footer = this.$('footer');
      this.main = $('#main');

      Todos.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      var done = Todos.done().length;
      var remaining = Todos.remaining().length;

      var total = Todos.sum();

      if (Todos.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({done: done, remaining: remaining, total: total}));
      } else {
        this.main.hide();
        this.footer.hide();
      }

      this.allCheckbox.checked = !remaining;
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").append(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
      Todos.each(this.addOne, this);
    },

    readyTextbox: function(e) {
      $('#new-todo').removeClass('placeholder').text('');
      //.append('<a></a>');
    },

    placeholderTextbox: function(e) {
      var i = $('#new-todo').text();
      
      if (i = "")
        $('#new-todo').addClass('placeholder')
	  .text('What needs to be done?');
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      var CountRegEx = /([0-9]x)|(x[0-9])/;
      var CalRegEx = /([0-9]+)/;

      function moveCaret(win, charCount) {
       var sel, range;
       if (win.getSelection) {
         sel = win.getSelection();
         if (sel.rangeCount > 0) {
           var textNode = sel.focusNode;
           var newOffset = sel.focusOffset + charCount;
           sel.collapse(textNode, Math.min(textNode.length, newOffset));
         }
       } else if ( (sel = win.document.selection) ) {
         if (sel.type != "Control") {
           range = sel.createRange();
           range.move("character", charCount);
           range.select();
         }
       }
     }

      function chewFood(item) {
        var r = { count: {value: "1x"} };

        var countMatch = item.match(CountRegEx);
        if (countMatch) {
         r.count = { value: countMatch[0], 
          index: countMatch.index, 
          length: countMatch[0].length };
          item = _.str.splice(item, r.count.index, r.count.length).trim();
        }

        var calMatch = item.match(CalRegEx);
        if (calMatch) {
         r.cal = { value: calMatch[0], 
          index: calMatch.index, 
          length: calMatch[0].length };
          item = _.str.splice(item, r.cal.index, r.cal.length).trim();
        }
        r.food = item;

        return r;
      }
      var i = $('#new-todo').text();
/*
      
      console.log( i );
      
      moveCaret(window, i.length);

      // On Space, parse inputted text
      if (e.keyCode != 32) return;
      var r = chewFood(i);

      
      $('#new-todo').append('<a>').text(r.food+' ');
      if (typeof r.count !== 'undefined')
        $('#new-todo').append('<span>').addClass('count').text(r.count.value);
      if (typeof r.cal !== 'undefined')
        $('#new-todo').append('<span>').addClass('cal').text(r.cal.value);

      console.log( $('#new-todo').html() );

      return false;
*/


      // On Enter, create the Todo Model
      if (e.keyCode != 13) return;
      if (!i) return;
      
      var z = chewFood(i);
      console.log(z);
      
      Todos.create({
          title: i
        , food: z.food
        , cal: z.cal.value
        , count: z.count.value
      });
      $('#new-todo').text('');

    },

    // Clear all done todo items, destroying their models.
    clearCompleted: function() {
      _.invoke(Todos.done(), 'destroy');
      return false;
    },

    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      Todos.each(function (todo) { todo.save({'done': done}); });
    }

  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

/*
  $(document).on('keypress', 'div[contenteditable="true"]', function(e) {
    //code here
    console.log('z');
  });
*/
});
