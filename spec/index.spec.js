"use strict";

var links;

links = require("..");

describe("metalsmith-relative-links", () => {
    /**
     * Runs the plugin.  The Metalsmith object is not used, so `null`
     * is passed instead.  The whole plugin operates synchronously, so
     * the `done` callback is just an empty function.
     *
     * @param {Object} files
     * @param {Object} [config]
     * @return {Promise.<Object>}
     */
    function runPlugin(files, config) {
        return new Promise((resolve, reject) => {
            links(config)(files, null, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    }

    it("adds link functions", () => {
        return runPlugin({
            "test.html": {}
        }).then((files) => {
            expect(files["test.html"]).toEqual({
                link: jasmine.any(Function)
            });
        });
    });
    describe("default .modifyLinks()", () => {
        var link;

        beforeEach(() => {
            return runPlugin({
                a: {}
            }).then((files) => {
                link = files.a.link;
            });
        });
        it("preserves non-matching files", () => {
            expect(link.to("folder/file.gif")).toEqual("folder/file.gif");
        });
        it("changes md to html", () => {
            expect(link.to("folder/file.md")).toEqual("folder/file.html");
        });
        it("eliminates index files in a folder", () => {
            expect(link.to("folder/index.md")).toEqual("folder/");
        });
        it("eliminates index files at the root", () => {
            expect(link.to("index.html")).toEqual("./");
        });
        it("rewrites / to ./", () => {
            expect(link.to("/")).toEqual("./");
        });
    });
    describe("invalid .modifyLinks()", () => {
        it("does not break", () => {
            runPlugin({
                a: {}
            }, {
                modifyLinks: 7
            }).then((files) => {
                expect(files.a.link("x/index.html", "y/index.html")).toEqual("../y/index.html");
            });
        });
    });
    describe("setting emptyLink", () => {
        var link;

        beforeEach(() => {
            return runPlugin({
                a: {}
            }, {
                emptyLink: "#"
            }).then((files) => {
                link = files.a.link;
            });
        });
        it("uses the empty link option for a value", () => {
            expect(link.to("/")).toEqual("#");
            expect(link.to("index.html")).toEqual("#");
        });
    });
    describe("options", () => {
        it("honors the matchers", () => {
            return runPlugin({
                "x.gif": {},
                "x.md": {},
                ".git/test.md": {}
            }, {
                match: "**/*.md",
                matchOptions: {
                    dot: true
                }
            }).then((files) => {
                expect(files["x.gif"].link).not.toBeDefined();
                expect(files["x.md"].link).toBeDefined();
                expect(files[".git/test.md"].link).toBeDefined();
            });
        });
    });
    describe("link", () => {
        var files, link;

        beforeEach(() => {
            return runPlugin({
                "a/test/file.html": {},
                "a/test/child/image.gif": {}
            }).then((filesResult) => {
                files = filesResult;
                link = files["a/test/file.html"].link;
            });
        });
        describe("function", () => {
            // Pretty well tested with .from() and .to() tests
            it("modifies links", () => {
                expect(link("x/index.html", "y/index.html")).toEqual("../y/");
            });
            it("does not make an absolute path when linking files off root", () => {
                expect(link("a", "b")).toEqual("b");
            });
        });
        describe(".from()", () => {
            it("links from parent file", () => {
                expect(link.from("../xyz")).toEqual("test/file.html");
            });
            it("links from parent folder", () => {
                expect(link.from("../xyz/")).toEqual("../test/file.html");
            });
        });
        describe(".resolve()", () => {
            it("resolves against a file object", () => {
                expect(link.resolve(files["a/test/child/image.gif"])).toEqual("a/test/child/image.gif");
            });
            it("throws when it can't find the object", () => {
                expect(() => {
                    link.resolve({});
                }).toThrow();
            });
            it("resolves the parent without a slash", () => {
                expect(link.resolve("..")).toEqual("a");
            });
            it("resolves the parent with a slash", () => {
                expect(link.resolve("../")).toEqual("a/");
            });
            it("resolves a child", () => {
                expect(link.resolve("child/thing")).toEqual("a/test/child/thing");
            });
            it("treats an empty string as root", () => {
                expect(link.resolve("")).toEqual("");
            });
            it("treats a slash as root", () => {
                expect(link.resolve("/")).toEqual("");
            });
            it("links to something off the root", () => {
                expect(link.resolve("/something")).toEqual("something");
            });
            it("links to a sibling", () => {
                expect(link.resolve("wherever.html")).toEqual("a/test/wherever.html");
            });
            it("throws when passed something it can't understand", () => {
                expect(() => {
                    link.resolve();
                }).toThrow();
            });
        });
        describe(".to()", () => {
            it("links to parent file", () => {
                expect(link.to("../xyz")).toEqual("../xyz");
            });
            it("links to parent folder", () => {
                expect(link.to("../xyz/")).toEqual("../xyz/");
            });
        });
    });
});
