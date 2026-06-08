import express from "express";
import validateRequest from "../../middleware/validateRequest";
import { BusinessValidation } from "./business.validation";
import { BusinessController } from "./business.controller";
import { auth } from "../../middleware/auth.middleware";
import { Role } from "../../../generated/client";
import { extractAuth, attachBusinessRole, authorizeAny } from "../../middleware/rbac.middleware";
import { requireTenant } from "../../middleware/tenant.middleware";
import { BUSINESS_VIEW, BUSINESS_UPDATE } from "../../constants/permissions";

const router = express.Router();

router.get(
  "/my-business",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  BusinessController.getMyBusiness,
);

router.get("/public", BusinessController.getAllBusinesses);

router.get(
  "/",
  auth(Role.ADMIN, Role.MANAGER),
  BusinessController.getBusinessesByOrganization,
);

router.post(
  "/",
  auth(Role.ADMIN, Role.MANAGER),
  validateRequest(BusinessValidation.createBusinessSchema),
  BusinessController.createBusiness,
);

router.patch(
  "/:id",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_UPDATE),
  validateRequest(BusinessValidation.updateBusinessSchema),
  BusinessController.updateBusiness,
);

router.delete("/:id", auth(Role.ADMIN), BusinessController.deleteBusiness);

export const BusinessRoutes = router;
