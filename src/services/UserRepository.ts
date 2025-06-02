import { CustomRole } from "../generated/prisma/index.js";
import { IPrismaClientProvider } from "./PrismaClientProvider.js";

export interface IUserRepository {
  createRole(roleId: string, userId: string): Promise<CustomRole>;
  deleteRole(roleId: string): Promise<void>;
  getCustomRoleById(roleId: string): Promise<CustomRole | null>;
  getCustomRolesByUserId(userId: string): Promise<CustomRole[]>;
}

export class UserRepository implements IUserRepository {
  private provider: IPrismaClientProvider; // Replace with actual Prisma client type

  constructor(provider: IPrismaClientProvider) {
    this.provider = provider;
  }

  async createRole(roleId: string, userId: string) {
    const database = this.provider.getClient();

    const role = await database.customRole.create({
      data: { id: roleId, userId },
    });
    return role;
  }

  async deleteRole(roleId: string): Promise<void> {
    const database = this.provider.getClient();

    await database.customRole.delete({
      where: { id: roleId },
    });

    return;
  }

  async getCustomRoleById(roleId: string) {
    const database = this.provider.getClient();

    const role = await database.customRole.findUnique({
      where: { id: roleId },
    });
    return role;
  }

  async getCustomRolesByUserId(userId: string) {
    const database = this.provider.getClient();

    const roles = await database.customRole.findMany({
      where: { userId },
    });
    return roles;
  }
}
