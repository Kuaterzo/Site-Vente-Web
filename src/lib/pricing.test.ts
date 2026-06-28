import { test } from "node:test";
import assert from "node:assert/strict";
import type { Session } from "next-auth";
import { isApprovedPro, canSeePrice, canBuy, tierPrice } from "./pricing";
import { discountPercent, formatPrice } from "./utils";

const mk = (role: string, status: string): Session =>
  ({ user: { role, status } }) as unknown as Session;

test("isApprovedPro", () => {
  assert.equal(isApprovedPro(null), false);
  assert.equal(isApprovedPro(mk("CUSTOMER", "PENDING")), false);
  assert.equal(isApprovedPro(mk("CUSTOMER", "APPROVED")), true);
  assert.equal(isApprovedPro(mk("ADMIN", "PENDING")), true); // admin toujours
});

test("canSeePrice : prix public visible par tous, sinon pros validés", () => {
  assert.equal(canSeePrice(true, null), true); // prix public, anonyme
  assert.equal(canSeePrice(false, null), false); // masqué, anonyme
  assert.equal(canSeePrice(false, mk("CUSTOMER", "APPROVED")), true);
  assert.equal(canSeePrice(false, mk("CUSTOMER", "PENDING")), false);
});

test("canBuy : achat réservé aux pros validés", () => {
  assert.equal(canBuy(null), false);
  assert.equal(canBuy(mk("CUSTOMER", "PENDING")), false);
  assert.equal(canBuy(mk("CUSTOMER", "APPROVED")), true);
});

test("tierPrice : palier dégressif selon la quantité", () => {
  const tiers = [
    { minQty: 6, priceHt: 4600 },
    { minQty: 12, priceHt: 4300 },
  ];
  assert.equal(tierPrice(4900, tiers, 1), 4900);
  assert.equal(tierPrice(4900, tiers, 6), 4600);
  assert.equal(tierPrice(4900, tiers, 11), 4600);
  assert.equal(tierPrice(4900, tiers, 12), 4300);
  assert.equal(tierPrice(4900, [], 100), 4900);
});

test("discountPercent", () => {
  assert.equal(discountPercent(7400, 6200), 16);
  assert.equal(discountPercent(0, 6200), 0);
  assert.equal(discountPercent(5000, 6000), 0); // pas de remise si nouveau > ancien
});

test("formatPrice", () => {
  // espace insécable utilisé par Intl fr-FR
  assert.match(formatPrice(1234), /12,34/);
  assert.match(formatPrice(1234), /€/);
});
