"use strict";

var minimatch, path;

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
    options.linkProperty = options.linkProperty || "link";
    options.match = options.match || "**/*";
    options.matchOptions = options.matchOptions || {};
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

            if (typeof options.modifyLinks === "function") {
                fromResolved = options.modifyLinks(fromResolved);
                toResolved = options.modifyLinks(toResolved);
            }

            fromPath = path.resolve("/", fromResolved, "..");
            toBasename = path.basename(toResolved);
            toPath = path.resolve("/", toResolved, "..");

            result = path.relative(fromPath, toPath);
            result = path.resolve(result, toBasename).slice(1);

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
            var i, keys;

            if (typeof what === "object") {
                // file object?  See if we can locate it.
                keys = Object.keys(allFiles);

                for (i = 0; i < keys.length; i += 1) {
                    if (allFiles[keys[i]] === what) {
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
                return path.resolve("/", fileName, "..", what).slice(1);
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
