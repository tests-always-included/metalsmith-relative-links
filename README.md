metalsmith-relative-links
=========================

Metalsmith plugin that adds functions to the metadata that assist with creating links to other resources.

[![npm version][npm-badge]][npm-link]
[![Build Status][travis-badge]][travis-link]
[![Dependencies][dependencies-badge]][dependencies-link]
[![Dev Dependencies][devdependencies-badge]][devdependencies-link]
[![codecov.io][codecov-badge]][codecov-link]


What It Does
------------

Each source file will have a `link()` function added to the metadata, allowing easier link generation.  There are also helper functions: `link.from()`, `link.to()`, and `link.resolve()`.  One would use these functions in templates to generate links to other resources.  This is an extremely handy plugin when you have a file tree in the metadata.  It works great with [metalsmith-hbt-md] and [metalsmith-ancestry].  Those two plugins will process [Mustache] templates in markdown and add a file hierarchy to the metadata.  It's useful for creating subpage listings:


Now you simply add another page to your sources and rerun Metalsmith.  Your index page is updated automatically.


### `link(from, to)`

Returns a relative link between `from` and `to`.  If `from` is "tools/index.html" and `to` is "tools/hammers/claw.html", the link returned would be "hammers/claw.html".

The `from` and `to` arguments are resolved to strings by `link.resolve()`.

Options also control how the links are generated.  See more about that in the Usage section.


### `link.from(to)`

Shorthand to create a link from the current file object to a given destination.  More details listed in `link()` and `link.resolve()`.


### `link.resolve(what)`

This changes `what` into a string.  It can be any of the following.

* File object.  This is looked up and its key is used as the resolved value.  This lets you link from one file object to another without knowing where in your directory hierarchy they are located.
* Relative paths, such as "..", "folder/file.html".  These are resolved against the current file object's location so they act exactly as you would imagine.
* Absolute paths, such as "/filename.html" or "/folder/file.html".  These are resolved against the root.
* Empty string.  Resolved as a link to the root and is functionally the same as "/".

When none of these match, an error is thrown.


### `link.to(from)`

Shorthand to create a link from the specified resource to the current file object.  Check out `link()` and `link.resolve()` for further information.


Installation
------------

`npm` can do this for you.

    npm install --save metalsmith-relative-links


Usage
-----

Include this like you would include any other plugin.  Here is the CLI example that also shows the default options.  You don't need to specify any options unless you wish to override their values.

    {
        "plugins": {
            "metalsmith-relative-links": {
                "linkProperty": "link",
                "match": "**/*.{htm,html}",
                "matchOptions": {}
            }
        }
    }

And here is how to use JavaScript to include the plugin along with a brief description of each option.  The JavaScript version also lets you modify the links using your own function with the `modifyLinks` configuration option.

    // Load this, just like other plugins.
    var links = require("metalsmith-relative-links");

    // Then in your list of plugins you use it.
    .use(links())

    // Alternately, you can specify options.  The values shown here are
    // the defaults.
    .use(links({
        // Name of property that should get the link function
        linkProperty: "link",

        // Pattern of files to match
        match: "**/*.htm,html",

        // Options for matching files.  See metalsmith-plugin-kit.
        matchOptions: {},

        // Function to modify links.  See below.
        modifyLinks: function (uri) {
            return uri.replace(/\.md$/, ".html").replace(/(^|\/|\\)index.html$/, "$1");
        }
    })

This uses [metalsmith-plugin-kit] to match files. It allows options to configure the matching rules.

The `modifyLinks()` function will, by default, change all `*.md` links into `*.html` and remove any `index.html` at the end of a URI.  If you'd like different behavior, this function is able to be replaced.  Let's say you wanted no file extensions ever and always create directory-style permalinks.  Here's a sample function that does just that.

    function (uri) {
        // Remove all extensions
        uri = uri.replace(/\.[^.]*$/, "");

        // Make sure we always link to a folder
        uri = uri + "/";

        return uri;
    }

For more complex behavior, the `modifyLinks()` function is passed additional arguments.

    function (uri, fromResolved, toResolved) {
        // uri: A relative link that points at the destination
        // fromResolved: The location of the link originator
        // toResolved: The location of the link destination
        return resultThatYouWant;
    }


API
---

<a name="module_metalsmith-relative-links"></a>

## metalsmith-relative-links
`metalsmith-relative-links` adds functions to the metadata that will
generate relative links between different files in the build.

**Example**  
```js
var relativeLinks = require("metalsmith-relative-links");

// Make your metalsmith instance and add this like other middleware.
metalsmith.use(relativeLinks({
    // configuration goes here
}));
```

* [metalsmith-relative-links](#module_metalsmith-relative-links)
    * [module.exports(options)](#exp_module_metalsmith-relative-links--module.exports) ⇒ <code>function</code> ⏏
        * [~modifyLinks(uri)](#module_metalsmith-relative-links--module.exports..modifyLinks) ⇒ <code>string</code>
        * [~makeLinkFunction(allFiles, fileName)](#module_metalsmith-relative-links--module.exports..makeLinkFunction) ⇒ <code>function</code>
            * [~link(from, to)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link) ⇒ <code>string</code>
                * [.from(from)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link.from) ⇒ <code>string</code>
                * [.resolve(what)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link.resolve) ⇒ <code>string</code>
                * [.to(to)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link.to) ⇒ <code>string</code>
        * [~metalsmithFile](#module_metalsmith-relative-links--module.exports..metalsmithFile) : <code>Object</code>
        * [~metalsmithFileCollection](#module_metalsmith-relative-links--module.exports..metalsmithFileCollection) : <code>Object.&lt;string, metalsmith-relative-links~metalsmithFile&gt;</code>
        * [~options](#module_metalsmith-relative-links--module.exports..options) : <code>Object</code>
        * [~resolvable](#module_metalsmith-relative-links--module.exports..resolvable) : [<code>metalsmithFile</code>](#module_metalsmith-relative-links--module.exports..metalsmithFile) \| <code>string</code>

<a name="exp_module_metalsmith-relative-links--module.exports"></a>

### module.exports(options) ⇒ <code>function</code> ⏏
Factory to build middleware for Metalsmith.

**Kind**: Exported function
**Params**

- options [<code>options</code>](#module_metalsmith-relative-links--module.exports..options)

<a name="module_metalsmith-relative-links--module.exports..modifyLinks"></a>

#### module.exports~modifyLinks(uri) ⇒ <code>string</code>
Default function for modifying links

**Kind**: inner method of [<code>module.exports</code>](#exp_module_metalsmith-relative-links--module.exports)
**Params**

- uri <code>string</code>

<a name="module_metalsmith-relative-links--module.exports..makeLinkFunction"></a>

#### module.exports~makeLinkFunction(allFiles, fileName) ⇒ <code>function</code>
Creates the link function and sets additional properties on the
link function in order to easily resolve links or create links with
a reference to a specific file object.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_metalsmith-relative-links--module.exports)
**Params**

- allFiles [<code>metalsmithFileCollection</code>](#module_metalsmith-relative-links--module.exports..metalsmithFileCollection)
- fileName <code>string</code>


* [~makeLinkFunction(allFiles, fileName)](#module_metalsmith-relative-links--module.exports..makeLinkFunction) ⇒ <code>function</code>
    * [~link(from, to)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link) ⇒ <code>string</code>
        * [.from(from)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link.from) ⇒ <code>string</code>
        * [.resolve(what)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link.resolve) ⇒ <code>string</code>
        * [.to(to)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link.to) ⇒ <code>string</code>

<a name="module_metalsmith-relative-links--module.exports..makeLinkFunction..link"></a>

##### makeLinkFunction~link(from, to) ⇒ <code>string</code>
Return a relative URL between two things. This is the function
that is generated for each file object provided by Metalsmith.

**Kind**: inner method of [<code>makeLinkFunction</code>](#module_metalsmith-relative-links--module.exports..makeLinkFunction)
**Params**

- from [<code>resolvable</code>](#module_metalsmith-relative-links--module.exports..resolvable)
- to [<code>resolvable</code>](#module_metalsmith-relative-links--module.exports..resolvable)

**Example**  
```js
console.log(file.link("/a/b/c", "/d/e"));
// "../../../d/e"
```

* [~link(from, to)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link) ⇒ <code>string</code>
    * [.from(from)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link.from) ⇒ <code>string</code>
    * [.resolve(what)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link.resolve) ⇒ <code>string</code>
    * [.to(to)](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link.to) ⇒ <code>string</code>

<a name="module_metalsmith-relative-links--module.exports..makeLinkFunction..link.from"></a>

###### link.from(from) ⇒ <code>string</code>
Shorthand for calling `.link(from, thisFileObject)`

**Kind**: static method of [<code>link</code>](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link)
**Params**

- from [<code>resolvable</code>](#module_metalsmith-relative-links--module.exports..resolvable)

<a name="module_metalsmith-relative-links--module.exports..makeLinkFunction..link.resolve"></a>

###### link.resolve(what) ⇒ <code>string</code>
Resolves a thing into a string.  Accepts file objects that are
in the list of all source files, strings relative to the current
file object's path (../whatever.html), strings relative to the
root (/root.html).

**Kind**: static method of [<code>link</code>](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link)
**Throws**:

- <code>Error</code> when unable to figure out the link

**Params**

- what [<code>resolvable</code>](#module_metalsmith-relative-links--module.exports..resolvable)

**Example**  
```js
console.log(file.link.resolve("../"))
// "../"
```
**Example**  
```js
// file is the file object for /a/b/c
console.log(file.link.resolve("/d/e"));
// "../../../d/e"
```
**Example**  
```js
// file is the file object for /a/b/c
// otherFile is the file object for /d/e
console.log(file.link.resolve(otherFile));
// "../../../d/e"
```
<a name="module_metalsmith-relative-links--module.exports..makeLinkFunction..link.to"></a>

###### link.to(to) ⇒ <code>string</code>
Shorthand for calling `.link(thisFileObject, to)`

**Kind**: static method of [<code>link</code>](#module_metalsmith-relative-links--module.exports..makeLinkFunction..link)
**Params**

- to [<code>resolvable</code>](#module_metalsmith-relative-links--module.exports..resolvable)

<a name="module_metalsmith-relative-links--module.exports..metalsmithFile"></a>

#### module.exports~metalsmithFile : <code>Object</code>
Metalsmith's file object that represents a single file.

**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_metalsmith-relative-links--module.exports)
**Properties**

| Name | Type |
| --- | --- |
| contents | <code>Buffer</code> | 
| mode | <code>string</code> | 

<a name="module_metalsmith-relative-links--module.exports..metalsmithFileCollection"></a>

#### module.exports~metalsmithFileCollection : <code>Object.&lt;string, metalsmith-relative-links~metalsmithFile&gt;</code>
Metalsmith's collection of file objects.

**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_metalsmith-relative-links--module.exports)
<a name="module_metalsmith-relative-links--module.exports..options"></a>

#### module.exports~options : <code>Object</code>
Options for the middleware factory.

**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_metalsmith-relative-links--module.exports)
**See**: [https://github.com/fidian/metalsmith-plugin-kit](https://github.com/fidian/metalsmith-plugin-kit)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| emptyLink | <code>string</code> | <code>&quot;./&quot;</code> | If a link is empty, use this string instead. |
| linkProperty | <code>string</code> | <code>&quot;link&quot;</code> | Property name to add to file metadata. |
| match | <code>module:metalsmith-plugin-kit~matchList</code> |  | Defaults to match all files. |
| matchOptions | <code>module:metalsmith-plugin-kit~matchOptions</code> | <code>{}</code> | Additional options for matching files. |
| modifyLinks | <code>function</code> |  | Function to modify links. Default changes ".md" to ".html" and removes "index.html". |

<a name="module_metalsmith-relative-links--module.exports..resolvable"></a>

#### module.exports~resolvable : [<code>metalsmithFile</code>](#module_metalsmith-relative-links--module.exports..metalsmithFile) \| <code>string</code>
Something that can be resolved.

* `string`: file path, both relative and root-relative.
* `Object`: a file object.

**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_metalsmith-relative-links--module.exports)


Development
-----------

This uses Jasmine, Istanbul and ESLint for tests.

    # Install all of the dependencies
    npm install

    # Run the tests
    npm run test

This plugin is licensed under the [MIT License][License] with an additional non-advertising clause.  See the [full license text][License] for information.


[codecov-badge]: https://img.shields.io/codecov/c/github/tests-always-included/metalsmith-relative-links/master.svg
[codecov-link]: https://codecov.io/github/tests-always-included/metalsmith-relative-links?branch=master
[dependencies-badge]: https://img.shields.io/david/tests-always-included/metalsmith-relative-links.svg
[dependencies-link]: https://david-dm.org/tests-always-included/metalsmith-relative-links
[devdependencies-badge]: https://img.shields.io/david/dev/tests-always-included/metalsmith-relative-links.svg
[devdependencies-link]: https://david-dm.org/tests-always-included/metalsmith-relative-links#info=devDependencies
[License]: LICENSE.md
[metalsmith-ancestry]: https://github.com/tests-always-included/metalsmith-ancestry
[metalsmith-hbt-md]: https://github.com/ahdiaz/metalsmith-hbt-md
[metalsmith-plugin-kit]: https://github.com/fidian/metalsmith-plugin-kit
[Mustache]: https://mustache.github.io/
[npm-badge]: https://img.shields.io/npm/v/metalsmith-relative-links.svg
[npm-link]: https://npmjs.org/package/metalsmith-relative-links
[travis-badge]: https://img.shields.io/travis/tests-always-included/metalsmith-relative-links/master.svg
[travis-link]: http://travis-ci.org/tests-always-included/metalsmith-relative-links
