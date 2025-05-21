import { callObsidian } from "#tests/helpers";

describe("any route", () => {
  it(
    "should throw an error on missing/invalid `x-success` parameter",
    async () => {
      const res = await callObsidian("/", { "x-success": undefined }, 1000);
      expect(res.ok).toBe(false);
      expect(res.log).toBeDefined();
      expect(
        res.log!.find((l) =>
          l.level === "error" &&
          l.sender.startsWith("plugin:actions-uri:") &&
          l.args.join(" ").includes("x-success")
        ),
      ).toBeDefined();
    },
    10000,
  );

  it(
    "should throw an error on missing/invalid `x-error` parameter",
    async () => {
      const res = await callObsidian("/", { "x-error": undefined }, 1000);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.message).toBe("Callback timeout");
      }

      expect(res.log).toBeDefined();
      expect(
        res.log!.find((l) =>
          l.level === "error" &&
          l.sender.startsWith("plugin:actions-uri:") &&
          l.args.join(" ").includes("x-error")
        ),
      ).toBeDefined();
    },
    10000,
  );
});
