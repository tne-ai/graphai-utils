import test from "node:test";
import assert from "node:assert";

import { ChunkData, ContentData, StreamData, ChunkParser } from "../src/index";

test("test", async () => {
  // assert.deepStrictEqual(1 == 1, true);
  const parser = new ChunkParser();

  const expects = [
    { test: 123, abc: "def" },
    { test2: 123, abc123: "def" },
  ];
  '{"test": 123, "abc": "def"}{"test2": 123, "abc123": "def"}'
    .split("")
    .forEach((chunk) => {
      const ret = parser.read(chunk);
      if (ret.length > 0) {
        const expect = expects.shift();
        assert.deepStrictEqual(ret[0], expect);
      }
    });
});
