
import { db } from "../db";
import { users, activityLogs } from "@shared/schema";
import { eq, sql, like, or, and, gte } from "drizzle-orm";

export class GovernanceService {
  async getStats() {
    const [totalUsersRes] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [activeUsersRes] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, 'active'));
    
    const [totalActivitiesRes] = await db.select({ count: sql<number>`count(*)` }).from(activityLogs);
    
    const [unauthorizedRes] = await db.select({ count: sql<number>`count(*)` }).from(activityLogs).where(like(activityLogs.action, 'unauthorized%'));
    
    // Critical: delete, lock, role changes, unauthorized
    const [criticalRes] = await db.select({ count: sql<number>`count(*)` }).from(activityLogs).where(
        or(
            like(activityLogs.action, '%delete%'),
            like(activityLogs.action, '%lock%'),
            like(activityLogs.action, 'unauthorized%'),
            like(activityLogs.action, 'change_user_role')
        )
    );
    
    // Recent approvals (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [approvalsRes] = await db.select({ count: sql<number>`count(*)` }).from(activityLogs).where(
        and(
            like(activityLogs.action, '%approve%'),
            gte(activityLogs.timestamp, thirtyDaysAgo)
        )
    );

    return {
      totalUsers: Number(totalUsersRes?.count || 0),
      activeUsers: Number(activeUsersRes?.count || 0),
      totalActivities: Number(totalActivitiesRes?.count || 0),
      criticalActivities: Number(criticalRes?.count || 0),
      unauthorizedAttempts: Number(unauthorizedRes?.count || 0),
      recentApprovals: Number(approvalsRes?.count || 0),
    };
  }
}

export const governanceService = new GovernanceService();
