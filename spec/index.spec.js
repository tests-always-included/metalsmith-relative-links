"use strict";

var links;

links = require("..");

describe("metalsmith-relative-links", function () {
    /**
     * Runs the plugin.  The Metalsmith object is not used, so `null`
     * is passed instead.  The whole plugin operates synchronously, so
     * the `done` callback is just an empty function.
     *
     * @param {Object} files
     * @param {Object} [config]
     */
    function runPlugin(files, config) {
        links(config)(files, null, function () {});
    }

    it("adds link functions", function () {
        var files;

        files = {
            "test.html": {}
        };
        runPlugin(files);
        expect(files["test.html"]).toEqual({
            link: jasmine.any(Function)
        });
    });
    it("defaults options", function () {
        var options;

        options = {};
        runPlugin({}, options);
        expect(options).toEqual({
            emptyLink: "./",
            linkProperty: "link",
            match: "**/*",
            matchOptions: {},
            modifyLinks: jasmine.any(Function)
        });
    });
    describe("default .modifyLinks()", function () {
        var modifyLinks, options;

        beforeEach(function () {
            options = {};
            runPlugin({}, options);
            modifyLinks = options.modifyLinks;
        });
        it("preserves non-matching files", function () {
            expect(modifyLinks("folder/file.gif")).toEqual("folder/file.gif");
        });
        it("changes md to html", function () {
            expect(modifyLinks("folder/file.md")).toEqual("folder/file.html");
        });
        it("eliminates index files in a folder", function () {
            expect(modifyLinks("folder/index.md")).toEqual("folder/");
        });
        it("eliminates index files at the root", function () {
            expect(modifyLinks("index.html")).toEqual("./");
        });
        it("rewrites / to ./", function () {
            expect(modifyLinks("/")).toEqual("./");
        });
        it("uses the empty link option for a value", function () {
            options.emptyLink = "#";
            expect(modifyLinks("/")).toEqual("#");
            expect(modifyLinks("index.html")).toEqual("#");
        });
    });
    describe("options", function () {
        it("honors the matchers", function () {
            var files, options;

            files = {
                "x.gif": {},
                "x.md": {},
                ".git/test.md": {}
            };
            options = {
                match: "**/*.md",
                matchOptions: {
                    dot: true
                }
            };
            runPlugin(files, options);
            expect(files["x.gif"].link).not.toBeDefined();
            expect(files["x.md"].link).toBeDefined();
            expect(files[".git/test.md"].link).toBeDefined();
        });
    });
    describe("link", function () {
        var files, link, options;

        beforeEach(function () {
            files = {
                "a/test/file.html": {},
                "a/test/child/image.gif": {}
            };
            options = {};
            runPlugin(files, options);
            link = files["a/test/file.html"].link;
        });
        describe("function", function () {
            // Pretty well tested with .from() and .to() tests
            it("modifies links", function () {
                expect(link("x/index.html", "y/index.html")).toEqual("../y/");
            });
            it("does no choke if modifyLinks is not a function", function () {
                options.modifyLinks = 7;
                expect(link("x/index.html", "y/index.html")).toEqual("../y/index.html");
            });
            it("does not make an absolute path when linking files off root", function () {
                expect(link("a", "b")).toEqual("b");
            });
        });
        describe(".from()", function () {
            it("links from parent file", function () {
                expect(link.from("../xyz")).toEqual("test/file.html");
            });
            it("links from parent folder", function () {
                expect(link.from("../xyz/")).toEqual("../test/file.html");
            });
        });
        describe(".resolve()", function () {
            it("resolves against a file object", function () {
                expect(link.resolve(files["a/test/child/image.gif"])).toEqual("a/test/child/image.gif");
            });
            it("throws when it can't find the object", function () {
                expect(function () {
                    link.resolve({});
                }).toThrow();
            });
            it("resolves the parent without a slash", function () {
                expect(link.resolve("..")).toEqual("a");
            });
            it("resolves the parent with a slash", function () {
                expect(link.resolve("../")).toEqual("a/");
            });
            it("resolves a child", function () {
                expect(link.resolve("child/thing")).toEqual("a/test/child/thing");
            });
            it("treats an empty string as root", function () {
                expect(link.resolve("")).toEqual("");
            });
            it("treats a slash as root", function () {
                expect(link.resolve("/")).toEqual("");
            });
            it("links to something off the root", function () {
                expect(link.resolve("/something")).toEqual("something");
            });
            it("links to a sibling", function () {
                expect(link.resolve("wherever.html")).toEqual("a/test/wherever.html");
            });
            it("throws when passed something it can't understand", function () {
                expect(function () {
                    link.resolve();
                }).toThrow();
            });
        });
        describe(".to()", function () {
            it("links to parent file", function () {
                expect(link.to("../xyz")).toEqual("../xyz");
            });
            it("links to parent folder", function () {
                expect(link.to("../xyz/")).toEqual("../xyz/");
            });
        });
    });
});
