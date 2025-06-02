import { Bot, CommandManager } from "kaltsit";
import { BindCommand } from "./commands/bind.js";
import { MyCommandGroup } from "./commands/my.js";
import { RoleCommandGroup } from "./commands/role.js";
import { UnbindCommand } from "./commands/unbind.js";
import { PrismaClientProvider } from "./services/PrismaClientProvider.js";
import { UserRepository } from "./services/UserRepository.js";

const dbProvider = new PrismaClientProvider();
const userRepository = new UserRepository(dbProvider);

const commands = [
  new BindCommand(userRepository),
  new UnbindCommand(userRepository),
  new MyCommandGroup(userRepository),
  new RoleCommandGroup(userRepository),
] as const;

export const commandManager = new CommandManager(commands);

const bot = new Bot({ intents: ["Guilds"] }, commandManager);
await bot.connect();
