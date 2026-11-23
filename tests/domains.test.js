import test from "node:test";
import assert from "node:assert/strict";
import {
  getRegistrableDomain,
  hostnameMatchesDomain,
} from "../src/js/domains.js";

test("mobiliar.ch matches mobiliar.ch", () => {
  assert.ok(
    hostnameMatchesDomain("mobiliar.ch", "mobiliar.ch"),
    "mobiliar.ch should match mobiliar.ch",
  );
});

test("mym.mobiliar.ch matches mobiliar.ch", () => {
  assert.ok(
    hostnameMatchesDomain("mym.mobiliar.ch", "mobiliar.ch"),
    "mym.mobiliar.ch should match mobiliar.ch",
  );
});

test("a.b.mobiliar.ch matches mobiliar.ch", () => {
  assert.ok(
    hostnameMatchesDomain("a.b.mobiliar.ch", "mobiliar.ch"),
    "a.b.mobiliar.ch should match mobiliar.ch",
  );
});

test("notmobiliar.ch does not match mobiliar.ch", () => {
  assert.ok(
    !hostnameMatchesDomain("notmobiliar.ch", "mobiliar.ch"),
    "notmobiliar.ch should not match mobiliar.ch",
  );
});

test("mobiliar.ch.evil.com does not match mobiliar.ch", () => {
  assert.ok(
    !hostnameMatchesDomain("mobiliar.ch.evil.com", "mobiliar.ch"),
    "mobiliar.ch.evil.com should not match mobiliar.ch",
  );
});

test("mobiliar.com does not match mobiliar.ch", () => {
  assert.ok(
    !hostnameMatchesDomain("mobiliar.com", "mobiliar.ch"),
    "mobiliar.com should not match mobiliar.ch",
  );
});

test("example.co.uk matches example.co.uk", () => {
  assert.ok(
    hostnameMatchesDomain("example.co.uk", "example.co.uk"),
    "example.co.uk should match example.co.uk",
  );
});

test("www.example.co.uk matches example.co.uk", () => {
  assert.ok(
    hostnameMatchesDomain("www.example.co.uk", "example.co.uk"),
    "www.example.co.uk should match example.co.uk",
  );
});

test("example.co.uk.evil.com does not match example.co.uk", () => {
  assert.ok(
    !hostnameMatchesDomain("example.co.uk.evil.com", "example.co.uk"),
    "example.co.uk.evil.com should not match example.co.uk",
  );
});

test("notexample.co.uk does not match example.co.uk", () => {
  assert.ok(
    !hostnameMatchesDomain("notexample.co.uk", "example.co.uk"),
    "notexample.co.uk should not match example.co.uk",
  );
});

test("MYM.MOBILIAR.CH matches mobiliar.ch (case-insensitive)", () => {
  assert.ok(
    hostnameMatchesDomain("MYM.MOBILIAR.CH", "mobiliar.ch"),
    "MYM.MOBILIAR.CH should match mobiliar.ch",
  );
});

test("getRegistrableDomain(mym.mobiliar.ch) is mobiliar.ch", () => {
  assert.equal(getRegistrableDomain("mym.mobiliar.ch"), "mobiliar.ch");
});

test("getRegistrableDomain(a.b.mobiliar.ch) is mobiliar.ch", () => {
  assert.equal(getRegistrableDomain("a.b.mobiliar.ch"), "mobiliar.ch");
});

test("getRegistrableDomain(mobiliar.ch) is mobiliar.ch", () => {
  assert.equal(getRegistrableDomain("mobiliar.ch"), "mobiliar.ch");
});

test("getRegistrableDomain(www.example.co.uk) is co.uk", () => {
  assert.equal(getRegistrableDomain("www.example.co.uk"), "co.uk");
});
