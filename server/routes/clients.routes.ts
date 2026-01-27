
import { Router, Response } from "express";
import { storage } from "../storage";
import { authMiddleware, AuthRequest, validateRequest } from "../middleware";
import { requireFeature } from "../feature-flags-middleware";
import { isFeatureEnabled } from "../../shared/feature-flags";
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

router.post("/", requireFeature('clients_create'), authMiddleware, requirePermission("clients", "create"), validateRequest(schema.insertClientSchema.omit({ createdBy: true, createdAt: true })), async (req: AuthRequest, res: Response) => {
  try {
    // req.body is now validated by Zod schema
    
    // Feature Guards
    if (!isFeatureEnabled('clients_gstin') && req.body.gstin) {
      return res.status(403).json({ error: "GSTIN feature is disabled" });
    }
    if (!isFeatureEnabled('clients_billingAddress') && req.body.billingAddress) {
       return res.status(403).json({ error: "Billing Address feature is disabled" });
    }
    if (!isFeatureEnabled('clients_shippingAddress') && req.body.shippingAddress) {
        return res.status(403).json({ error: "Shipping Address feature is disabled" });
    }

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
    const { name, email, gstin, billingAddress, shippingAddress } = req.body;

    // Feature Guards
    if (!isFeatureEnabled('clients_gstin') && gstin) {
      return res.status(403).json({ error: "GSTIN feature is disabled" });
    }
    if (!isFeatureEnabled('clients_billingAddress') && billingAddress) {
       return res.status(403).json({ error: "Billing Address feature is disabled" });
    }
    if (!isFeatureEnabled('clients_shippingAddress') && shippingAddress) {
        return res.status(403).json({ error: "Shipping Address feature is disabled" });
    }

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


// PHASE 3 - CLIENT MANAGEMENT ENDPOINTS (Tags & Communications)
router.get("/:clientId/tags", authMiddleware, requireFeature('clients_tags'), async (req: AuthRequest, res: Response) => {
  try {
    const tags = await storage.getClientTags(req.params.clientId);
    return res.json(tags);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch client tags" });
  }
});

router.post("/:clientId/tags", authMiddleware, requireFeature('clients_tags'), async (req: AuthRequest, res: Response) => {
  try {
    const { tag } = req.body;
    if (!tag) {
      return res.status(400).json({ error: "Tag is required" });
    }

    const clientTag = await storage.addClientTag({
      clientId: req.params.clientId,
      tag,
    });

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "add_client_tag",
      entityType: "client",
      entityId: req.params.clientId,
    });

    return res.json(clientTag);
  } catch (error) {
    return res.status(500).json({ error: "Failed to add tag" });
  }
});

router.delete("/tags/:tagId", authMiddleware, requireFeature('clients_tags'), async (req: AuthRequest, res: Response) => {
  try {
    await storage.removeClientTag(req.params.tagId);

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "remove_client_tag",
      entityType: "client_tag",
      entityId: req.params.tagId,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to remove tag" });
  }
});

router.get("/:clientId/communications", authMiddleware, requireFeature('clients_communicationHistory'), async (req: AuthRequest, res: Response) => {
  try {
    const communications = await storage.getClientCommunications(req.params.clientId);
    return res.json(communications);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch communications" });
  }
});

router.post("/:clientId/communications", authMiddleware, requireFeature('clients_communicationHistory'), async (req: AuthRequest, res: Response) => {
  try {
    const { type, subject, message, attachments } = req.body;

    if (!type || !["email", "call", "meeting", "note"].includes(type)) {
      return res.status(400).json({ error: "Valid communication type is required" });
    }

    const communication = await storage.createClientCommunication({
      clientId: req.params.clientId,
      type,
      subject,
      message,
      date: new Date(),
      communicatedBy: req.user!.id,
      attachments: attachments ? JSON.stringify(attachments) : undefined,
    });

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "create_communication",
      entityType: "client",
      entityId: req.params.clientId,
    });

    return res.json(communication);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to create communication" });
  }
});

router.delete("/communications/:commId", authMiddleware, requireFeature('clients_communicationHistory'), async (req: AuthRequest, res: Response) => {
  try {
    await storage.deleteClientCommunication(req.params.commId);

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "delete_communication",
      entityType: "client_communication",
      entityId: req.params.commId,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete communication" });
  }
});

export default router;
