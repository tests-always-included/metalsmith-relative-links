"use strict";

var debug, minimatch, path;

debug = require("debug")("metalsmith-relative-links");
minimatch = require("minimatch");
path = require("path");

/**
 * Factory to build middleware for Metalsmith.
 *
 * @param {Object} options
 * @return {Function}
 */
module.exports = function (options) {
    var matcher;

    options = options || {};
    options.emptyLink = "./";
    options.linkProperty = options.linkProperty || "link";
    options.match = options.match || "**/*";
    options.matchOptions = options.matchOptions || {};
    options.modifyLinks = options.modifyLinks || function (uri) {
        uri = uri.replace(/\.md$/, ".html").replace(/(^|\/|\\)index.html$/, "$1");

        if (!uri || uri === "/") {
            return options.emptyLink;
        }

        return uri;
    };
    matcher = new minimatch.Minimatch(options.match, options.matchOptions);


    /**
     * Creates the link function and sets additional properties on the
     * link function in order to easily resolve links or create links with
     * a reference to a specific file object.
     *
     * @param {Object} allFiles
     * @param {string} fileName
     * @return {Function}
     */
    function makeLinkFunction(allFiles, fileName) {
        var fileObject, link;

        fileObject = allFiles[fileName];


        /**
         * Return a relative URL between two things.
         *
         * @param {*} from
         * @param {*} to
         * @return {string}
         */
        link = function (from, to) {
            var fromPath, fromResolved, result, toBasename, toPath, toResolved;

            fromResolved = link.resolve(from);
            toResolved = link.resolve(to);

            if (fromResolved.charAt(fromResolved.length - 1) === "/") {
                fromPath = "/" + fromResolved;
            } else {
                fromPath = path.posix.resolve("/", fromResolved, "..");
            }

            if (toResolved.charAt(toResolved.length - 1) === "/") {
                toPath = "/" + toResolved;
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
            debug("Link: " + result);

            if (typeof options.modifyLinks === "function") {
                result = options.modifyLinks(result, fromResolved, toResolved);
                debug("After link modification: " + result);
            }

            return result;
        };


        /**
         * Shorthand for calling .link(from, this)
         *
         * @param {*} from
         * @return {string}
         */
        link.from = function (from) {
            return link(from, fileObject);
        };


        /**
         * Resolves a thing into a string.  Accepts file objects that are
         * in the list of all source files, strings relative to the current
         * file object's path (../whatever.html), strings relative to the
         * root (/root.html).
         *
         * @param {*} what
         * @return {string}
         * @throws {Error} when unable to figure out the link
         */
        link.resolve = function (what) {
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
            throw new Error("Unable to determine a link: " + what.toString());
        };


        /**
         * Shorthand for calling .link(this, to)
         *
         * @param {*} to
         * @return {string}
         */
        link.to = function (to) {
            return link(fileObject, to);
        };

        return link;
    }


    /**
     * Middleware function.
     *
     * @param {Object} files
     * @param {Object} metalsmith
     * @param {Function} done
     */
    return function (files, metalsmith, done) {
        Object.keys(files).forEach(function (file) {
            if (matcher.match(file)) {
                files[file][options.linkProperty] = makeLinkFunction(files, file);
            }
        });
        done();
    };
};
