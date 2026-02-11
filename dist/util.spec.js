"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
describe("should delete default", () => {
    test("example-branch", () => {
        expect((0, util_1.shouldDelete)("example-branch", util_1.defaultValue)).toBeTruthy();
    });
    test("main", () => {
        expect((0, util_1.shouldDelete)("main", util_1.defaultValue)).toBeFalsy();
    });
    test("master", () => {
        expect((0, util_1.shouldDelete)("master", util_1.defaultValue)).toBeFalsy();
    });
});
describe("should delete with input", () => {
    test("example-branch", () => {
        expect((0, util_1.shouldDelete)("example-branch", "example-branch")).toBeTruthy();
    });
    test("example-branch", () => {
        expect((0, util_1.shouldDelete)("example-branch-1", "example-branch")).toBeFalsy();
    });
    test("example-*", () => {
        expect((0, util_1.shouldDelete)("example-branch", "example-*")).toBeTruthy();
    });
    test("example-*", () => {
        expect((0, util_1.shouldDelete)("example-branch-1", "example-*")).toBeTruthy();
    });
    test("example-*, hello-*", () => {
        expect((0, util_1.shouldDelete)("example-branch", "example-*")).toBeTruthy();
    });
    test("example-*, hello-*", () => {
        expect((0, util_1.shouldDelete)("hello-world", "example-*")).toBeFalsy();
    });
    test("example-*,hello-*", () => {
        expect((0, util_1.shouldDelete)("example-branch", "example-*")).toBeTruthy();
    });
    test("example-*,hello-*", () => {
        expect((0, util_1.shouldDelete)("hello-world", "example-*")).toBeFalsy();
    });
});
//# sourceMappingURL=util.spec.js.map