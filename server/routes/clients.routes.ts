
import { Router, Response } from "express";
import { storage } from "../storage";
import { authMiddleware, AuthRequest, validateRequest } from "../middleware";
import { requireFeature } from "../feature-flags-middleware";
import { requirePermission } from "../permissions-middleware";
import * as schema from "../../shared/schema";

const router = Router();

router.get("/", requireFeature('clients_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const clients = await storage.getAllClients();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

router.get("/:id", requireFeature('clients_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const client = await storage.getClient(req.params.id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    return res.json(client);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch client" });
  }
});

router.post("/", requireFeature('clients_create'), authMiddleware, requirePermission("clients", "create"), validateRequest(schema.insertClientSchema), async (req: AuthRequest, res: Response) => {
  try {
    // req.body is now validated by Zod schema

    const client = await storage.createClient({
      ...req.body,
      createdBy: req.user!.id,
    });

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "create_client",
      entityType: "client",
      entityId: client.id,
    });

    return res.json(client);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to create client" });
  }
});

router.put("/:id", requireFeature('clients_edit'), authMiddleware, requirePermission("clients", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: "Client name and email are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const client = await storage.updateClient(req.params.id, req.body);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "update_client",
      entityType: "client",
      entityId: client.id,
    });

    return res.json(client);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update client" });
  }
});

router.delete("/:id", requireFeature('clients_delete'), authMiddleware, requirePermission("clients", "delete"), async (req: AuthRequest, res: Response) => {
  try {
    await storage.deleteClient(req.params.id);

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "delete_client",
      entityType: "client",
      entityId: req.params.id,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete client" });
  }
});

export default router;
