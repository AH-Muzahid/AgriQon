import { Router } from "express";
import { AiController } from "./ai.controller";
import { extractAuth, attachBusinessRole, authorizeAny } from "../../middleware/rbac.middleware";
import { requireTenant } from "../../middleware/tenant.middleware";
import { AI_LOGS_VIEW, AI_EMBEDDING_MANAGE, AI_CHAT_USE } from "../../constants/permissions";

const router = Router();

router.get(
  "/logs",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(AI_LOGS_VIEW),
  AiController.getAiLogs,
);

router.post(
  "/sync-embedding",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(AI_EMBEDDING_MANAGE),
  AiController.syncItemEmbedding,
);

router.post(
  "/chat",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(AI_CHAT_USE),
  AiController.generateChat,
);

export const AiRoutes = router;
