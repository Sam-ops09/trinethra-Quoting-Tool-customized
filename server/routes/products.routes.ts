
import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { logger } from "../utils/logger";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// ==================== PRODUCTS ROUTES ====================

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const products = await db.select().from(schema.products).orderBy(schema.products.name);
    res.json(products);
  } catch (error) {
    logger.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [product] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, req.params.id));

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    logger.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Pre-process: Coerce unitPrice to string if number (backward compatibility)
    if (req.body && typeof req.body.unitPrice === 'number') {
      req.body.unitPrice = String(req.body.unitPrice);
    }

    const parseResult = schema.insertProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }

    const validatedData = parseResult.data;
    const stockQuantity = validatedData.stockQuantity || 0;
    const initialAvailable = validatedData.availableQuantity !== undefined ? validatedData.availableQuantity : stockQuantity;

    const [product] = await db
      .insert(schema.products)
      .values({
        ...validatedData,
        stockQuantity,
        availableQuantity: initialAvailable,
        createdBy: req.user!.id,
      })
      .returning();

    res.json(product);
  } catch (error) {
    logger.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.patch("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [updated] = await db
      .update(schema.products)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(schema.products.id, req.params.id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updated);
  } catch (error) {
    logger.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

export default router;
