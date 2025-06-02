import {
  Command,
  CommandContext,
  InteractionContextType,
  RoleOption,
} from "kaltsit";
import { IUserRepository } from "../services/UserRepository.js";

export class UnbindCommand extends Command {
  readonly name = "unbind";
  description = "Unbinds a role from a user.";
  options = [new RoleOption("role", true).setDescription("The role to unbind")];
  preconditions = [];
  contexts = [InteractionContextType.Guild];

  constructor(private readonly userRepository: IUserRepository) {
    super();
  }

  async execute(ctx: CommandContext<UnbindCommand>): Promise<unknown> {
    const role = ctx.options.role.value;

    const customRole = await this.userRepository.getCustomRoleById(role.id);

    if (customRole === null) {
      await ctx.send({ content: `${role} is not bound to anyone.` });
      return;
    }

    await this.userRepository.deleteRole(role.id);
    await ctx.send({
      content: `${role} has been unbound from <@${customRole.userId}>.`,
    });

    return;
  }
}
