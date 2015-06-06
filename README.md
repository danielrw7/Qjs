Qjs
===

### Introduction

Qjs is a Javascript module framework written by [Daniel Wilson][danny] and inspired by [Sam Weaver.][sam] It is similar to [Require.JS][requirejs], but with additional features tailored towards rapid application iterational development in modern Javascript web design.

### How does it work?

Qjs is rather simple, especially if you have worked with [Require.JS][requirejs] before. Take a look at this snippet of an example module:

```js
(function(Q){
    var module = new Q.module('string-reverser');

    module.reverseString = function(stringToReverse) {
        return stringToReverse.split('').reverse().join('');
    };
})(Q);
```

This module, called `string-reverser`, has one method. It simply takes an input string and reverses it. Let's look at how it could be used.

```js
var stringReverser = Q.getModule('string-reverser');

console.log(stringReverser.reverseString("dlrow olleh"));
```

This snippet would output "hello world" on the console.

Modules can also be accessed, by calling the `Q` function directly, instead of using `getModule`.

```js
var stringReverser = Q('string-reverser');
```

This syntax should be avoided, and is only included for sake of backwards compatibility. The reasoning for this is that the global variable `require` is a reference to the `Q` global variable. Therefore, you can also use this syntax, which may be easier for those who have worked with [Require.JS][requirejs].

```js
var stringReverser = require('string-reverser');
```

Modules can also automatically implement [jQuery][jquery]. You can do this by setting the `jQueryRequired` variable on the `module` object, in the code of your module.

```js
module.jQueryRequired = true; // or false...
```

Qjs includes some built-in events that make modern web development a bit easier. Events can be bound and triggered on modules using the following syntax.

```js
module.on('custom-event',function(){
    // ...
});

// Later, outside the module declaration:

definedModule.trigger('custom-event');
```

Built in events in Qjs include:

- `init`: Is triggered before page load, in the <head> tag.
- `ready`: Is triggered on document ready (through [jQuery][jquery] `$(document).ready(...);`
- `jQueryNotIncluded`: Is triggered if jQuery is not included on the page.

We hope that you enjoy Qjs as much as we do.

### Contribution Guide
If you desire to contribute, fork, and submit a pull request. Please follow the following guidelines:

- Keep code clean and easily understandable.<sup>see note 1</sup>
- Comment your code when necessary. Explaining the _why_ is often more useful than explaining the _how._
- Use Object Oriented coding style _whenever_ possible.

<small>**Note 1**: Whenever possible, keep close with [Google's Closure Javascript Style Guide][closure].</small>

### TODO
- Make Q modules fit [CommonJS Module Specification 1.1][modulespec]
    - **Note, this may be difficult and noncondusive to future development, on hold for now**
- :heavy_check_mark: ~~Write documentation~~
- :heavy_check_mark: ~~Unit testing~~

[danny]:#
[sam]:http://thatcoolidea.com
[requirejs]:http://requirejs.org
[jquery]:https://jquery.com
[closure]:https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
[modulespec]:http://wiki.commonjs.org/wiki/Modules/1.1
