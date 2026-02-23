import AdminAuditLog from "../models/AdminAuditLog";

export const logAdminAction = async ({
  adminId,
  action,
  targetUserId = null,
  metadata = {},
  ipAddress,
}: {
  adminId: string;
  action: string;
  targetUserId?: string | null;
  metadata?: any;
  ipAddress?: string;
}) => {
  await AdminAuditLog.create({
    adminId,
    action,
    targetUserId,
    metadata,
    ipAddress,
  });
};
