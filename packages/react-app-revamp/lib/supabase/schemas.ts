import { addressRegex } from "@helpers/regex";
import { z } from "zod";

export const MAX_ITEMS_PER_PAGE = 50;
export const MAX_PAGE = 100_000;
export const MAX_ROW_OFFSET = 10_000_000;

export const addressSchema = z.string().regex(addressRegex);

export const chainNameSchema = z.string().min(1).max(64);

export const pageSchema = z.coerce.number().int().min(0).max(MAX_PAGE);

export const rowOffsetSchema = z.coerce.number().int().min(0).max(MAX_ROW_OFFSET);

export const perPageSchema = z.coerce.number().int().min(1).max(MAX_ITEMS_PER_PAGE);

export const sortBySchema = z.string().max(32).optional();
