import { Router } from "express";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { AiRepository } from "./ai.repository";
import { FeatureGuardService } from "../subscriptions/feature-guard.service";
import { SubscriptionRepository } from "../subscriptions/subscription.repository";
import { extractAuth, attachBusinessRole, authorizeAny } from "../../middleware/rbac.middleware";
import { requireTenant } from "../../middleware/tenant.middleware";
import { AI_LOGS_VIEW, AI_EMBEDDING_MANAGE, AI_CHAT_USE } from "../../constants/permissions";

const router = Router();

// Dependency Injection Wiring
const subscriptionRepository = new SubscriptionRepository();
const featureGuard = new FeatureGuardService(subscriptionRepository);
const aiRepository = new AiRepository();
const aiService = new AiService(aiRepository, featureGuard);
const aiController = new AiController(aiService);

router.get(
  "/logs",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(AI_LOGS_VIEW),
  aiController.getAiLogs,
);

router.post(
  "/sync-embedding",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(AI_EMBEDDING_MANAGE),
  aiController.syncItemEmbedding,
);

router.post(
  "/chat",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(AI_CHAT_USE),
  aiController.generateChat,
);

export const AiRoutes = router;
