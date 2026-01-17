
import { storage } from "./server/storage";
import { db } from "./server/db";
import { salesOrders, salesOrderItems, users, clients, products } from "./shared/schema";
import { eq } from "drizzle-orm";
import { NumberingService } from "./server/services/numbering.service";

async function reproduceSalesOrderEdit() {
  console.log("Starting Sales Order Edit Reproduction...");

  // 1. Setup Data
  const [user] = await db.select().from(users).limit(1);
  const [client] = await db.select().from(clients).limit(1);
  
  if (!user || !client) {
    console.error("Missing user or client");
    return;
  }

  // Create Product
  const [product] = await db.insert(products).values({
    sku: "TEST-PROD-" + Date.now(),
    name: "Test Product",
    unitPrice: "100",
    stockQuantity: 100,
    createdBy: user.id
  }).returning();

  // Create Sales Order
  const orderNumber = await NumberingService.generateSalesOrderNumber();
  const [order] = await db.insert(salesOrders).values({
    orderNumber,
    clientId: client.id,
    status: "draft",
    subtotal: "100",
    total: "100",
    createdBy: user.id
  }).returning();

  // Create Existing Item
  await db.insert(salesOrderItems).values({
    salesOrderId: order.id,
    productId: product.id,
    description: "Original Description",
    quantity: 1,
    unitPrice: "100",
    subtotal: "100",
    status: "pending",
    sortOrder: 0
  });

  console.log("Created Draft Order with 1 item: 'Original Description'");

  // 2. Simulate Edit (Update Item Description)
  console.log("Simulating PATCH request payload...");
  
  // Payload mimicking what the frontend sends (Updated description, stripped ID, maybe undefined productId)
  const payload = {
    status: "draft",
    subtotal: "200",
    total: "200",
    items: [
      {
        // Notice: No ID, No ProductID (simulating frontend bug)
        description: "Updated Description",
        quantity: 1,
        unitPrice: "200",
        subtotal: "200",
        sortOrder: 0
      },
      {
        description: "New Item",
        quantity: 1,
        unitPrice: "0",
        subtotal: "0",
        sortOrder: 1
      }
    ]
  };

  // Verify backend logic manual simulation
  try {
     await db.transaction(async (tx) => {
          // Delete existing
          await tx.delete(salesOrderItems).where(eq(salesOrderItems.salesOrderId, order.id));
          
          // Insert new
          for (const item of payload.items) {
             await tx.insert(salesOrderItems).values({
                 salesOrderId: order.id,
                 productId: null, // explicit null if missing
                 description: item.description,
                 quantity: item.quantity,
                 unitPrice: item.unitPrice,
                 subtotal: item.subtotal,
                 sortOrder: item.sortOrder,
                 status: "pending"
             });
          }
     });
     console.log("Transaction executed successfully.");
  } catch (e) {
      console.error("Transaction failed:", e);
      return;
  }

  // 3. Verify Result
  const updatedItems = await storage.getSalesOrderItems(order.id);
  console.log("Updated Items count:", updatedItems.length);
  updatedItems.forEach(item => {
      console.log(`- ${item.description} (Price: ${item.unitPrice})`);
  });

  if (updatedItems.find(i => i.description === "Updated Description")) {
      console.log("SUCCESS: Item updated successfully.");
  } else {
      console.error("FAILURE: Item update not found.");
  }

  // Cleanup
  await db.delete(salesOrderItems).where(eq(salesOrderItems.salesOrderId, order.id));
  await db.delete(salesOrders).where(eq(salesOrders.id, order.id));
  await db.delete(products).where(eq(products.id, product.id));
  
  process.exit(0);
}

reproduceSalesOrderEdit().catch(console.error);
