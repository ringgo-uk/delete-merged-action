import { shouldDelete, defaultValue } from "./util";
describe("should delete default", () => {
    test("example-branch", () => {
        expect(shouldDelete("example-branch", defaultValue)).toBeTruthy();
    });
    test("main", () => {
        expect(shouldDelete("main", defaultValue)).toBeFalsy();
    });
    test("master", () => {
        expect(shouldDelete("master", defaultValue)).toBeFalsy();
    });
});
describe("should delete with input", () => {
    test("example-branch", () => {
        expect(shouldDelete("example-branch", "example-branch")).toBeTruthy();
    });
    test("example-branch", () => {
        expect(shouldDelete("example-branch-1", "example-branch")).toBeFalsy();
    });
    test("example-*", () => {
        expect(shouldDelete("example-branch", "example-*")).toBeTruthy();
    });
    test("example-*", () => {
        expect(shouldDelete("example-branch-1", "example-*")).toBeTruthy();
    });
    test("example-*, hello-*", () => {
        expect(shouldDelete("example-branch", "example-*")).toBeTruthy();
    });
    test("example-*, hello-*", () => {
        expect(shouldDelete("hello-world", "example-*")).toBeFalsy();
    });
    test("example-*,hello-*", () => {
        expect(shouldDelete("example-branch", "example-*")).toBeTruthy();
    });
    test("example-*,hello-*", () => {
        expect(shouldDelete("hello-world", "example-*")).toBeFalsy();
    });
});
//# sourceMappingURL=util.spec.js.map