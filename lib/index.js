/**
 * `metalsmith-relative-links` adds functions to the metadata that will
 * generate relative links between different files in the build.
 *
 * @example
 * var relativeLinks = require("metalsmith-relative-links");
 *
 * // Make your metalsmith instance and add this like other middleware.
 * metalsmith.use(relativeLinks({
 *     // configuration goes here
 * }));
 *
 * @module metalsmith-relative-links
 */
"use strict";


/**
 * Metalsmith's file object that represents a single file.
 *
 * @typedef {Object} metalsmithFile
 * @property {Buffer} contents
 * @property {string} mode
 */

/**
 * Metalsmith's collection of file objects.
 *
 * @typedef {Object.<string,metalsmith-relative-links~metalsmithFile>} metalsmithFileCollection
 */

var debug, path, pluginKit;

debug = require("debug")("metalsmith-relative-links");
path = require("path");
pluginKit = require("metalsmith-plugin-kit");


/**
 * Options for the middleware factory.
 *
 * @typedef {Object} options
 * @property {string} [emptyLink=./] If a link is empty, use this string instead.
 * @property {string} [linkProperty=link] Property name to add to file metadata.
 * @property {string} [match] Defaults to match all files.
 * @property {Object} [matchOptions={}] Additional options for matching files.
 * @property {function} [modifyLinks] Function to modify links. Default changes ".md" to ".html" and removes "index.html".
 */

/**
 * Factory to build middleware for Metalsmith.
 *
 * @param {module:metalsmith-relative-links~options} options
 * @return {Function}
 */
module.exports = function (options) {
    /**
     * Default function for modifying links
     *
     * @param {string} uri
     * @return {string}
     */
    function modifyLinks(uri) {
        uri = uri.replace(/\.md$/, ".html").replace(/(^|\/|\\)index.html$/, "$1");

        if (!uri || uri === "/") {
            return options.emptyLink;
        }

        return uri;
    }


    /**
     * Creates the link function and sets additional properties on the
     * link function in order to easily resolve links or create links with
     * a reference to a specific file object.
     *
     * @param {module:metalsmith-relative-links~metalsmithFileCollection} allFiles
     * @param {string} fileName
     * @return {Function}
     */
    function makeLinkFunction(allFiles, fileName) {
        var fileObject;

        fileObject = allFiles[fileName];


        /**
         * Something that can be resolved.
         *
         * * `string`: file path, both relative and root-relative.
         * * `Object`: a file object.
         *
         * @typedef {(module:metalsmith-relative-links~metalsmithFile|string)} resolvable
         */

        /**
         * Return a relative URL between two things. This is the function
         * that is generated for each file object provided by Metalsmith.
         *
         * @example
         * console.log(file.link("/a/b/c", "/d/e"));
         * // "../../../d/e"
         *
         * @param {module:metalsmith-relative-links~resolvable} from
         * @param {module:metalsmith-relative-links~resolvable} to
         * @return {string}
         */
        function link(from, to) {
            var fromPath, fromResolved, result, toBasename, toPath, toResolved;

            fromResolved = link.resolve(from);
            toResolved = link.resolve(to);

            if (fromResolved.charAt(fromResolved.length - 1) === "/") {
                fromPath = `/${fromResolved}`;
            } else {
                fromPath = path.posix.resolve("/", fromResolved, "..");
            }

            if (toResolved.charAt(toResolved.length - 1) === "/") {
                toPath = `/${toResolved}`;
                toBasename = "";
            } else {
                toPath = path.posix.resolve("/", toResolved, "..");
                toBasename = path.posix.basename(toResolved);
            }

            debug("Linking: %s (%s) -> %s (%s, %s)", fromResolved, fromPath, toResolved, toPath, toBasename);
            result = path.posix.relative(fromPath, toPath);

            if (result) {
                result += "/";
            }

            result += toBasename;
            debug(`Link: ${result}`);

            if (typeof options.modifyLinks === "function") {
                result = options.modifyLinks(result, fromResolved, toResolved);
                debug("After link modification: %s", result);
            }

            return result;
        }


        /**
         * Shorthand for calling `.link(from, thisFileObject)`
         *
         * @param {module:metalsmith-relative-links~resolvable} from
         * @return {string}
         */
        link.from = (from) => {
            return link(from, fileObject);
        };


        /**
         * Resolves a thing into a string.  Accepts file objects that are
         * in the list of all source files, strings relative to the current
         * file object's path (../whatever.html), strings relative to the
         * root (/root.html).
         *
         * @example
         * console.log(file.link.resolve("../"))
         * // "../"
         *
         * @example
         * // file is the file object for /a/b/c
         * console.log(file.link.resolve("/d/e"));
         * // "../../../d/e"
         *
         * @example
         * // file is the file object for /a/b/c
         * // otherFile is the file object for /d/e
         * console.log(file.link.resolve(otherFile));
         * // "../../../d/e"
         *
         * @param {module:metalsmith-relative-links~resolvable} what
         * @return {string}
         * @throws {Error} when unable to figure out the link
         */
        link.resolve = (what) => {
            var file, i, keys, result;

            if (typeof what === "object") {
                // file object?  See if we can locate it.
                keys = Object.keys(allFiles);

                for (i = 0; i < keys.length; i += 1) {
                    file = allFiles[keys[i]];

                    if (file === what) {
                        return keys[i];
                    }
                }
            }

            if (typeof what === "string") {
                // Empty string = root
                if (what.length === 0) {
                    return "";
                }

                // Start with / = root
                if (what.charAt(0) === "/") {
                    return what.slice(1);
                }

                // Resolve as per a path from current location
                result = path.posix.resolve("/", fileName, "..", what).slice(1);

                // If they want a slash at the end, provide one
                if (what.charAt(what.length - 1) === "/") {
                    result += "/";
                }

                return result;
            }

            // No idea
            throw new Error(`Unable to determine a link: ${what.toString()}`);
        };


        /**
         * Shorthand for calling `.link(thisFileObject, to)`
         *
         * @param {module:metalsmith-relative-links~resolvable} to
         * @return {string}
         */
        link.to = (to) => {
            return link(fileObject, to);
        };

        return link;
    }


    options = pluginKit.defaultOptions({
        emptyLink: "./",
        linkProperty: "link",
        match: "**/*",
        matchOptions: {},
        modifyLinks
    }, options);


    return pluginKit.middleware({
        each: (filename, file, files) => {
            file[options.linkProperty] = makeLinkFunction(files, filename);
        },
        match: options.match,
        matchOptions: options.matchOptions,
        name: "metalsmith-relative-links"
    });
};
