import { PrismaClient } from "../generated/prisma/index.js";

export interface IPrismaClientProvider {
  getClient(): PrismaClient;
}

export class PrismaClientProvider implements IPrismaClientProvider {
  private client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  getClient() {
    return this.client;
  }
}
