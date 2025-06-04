import {
  Command,
  CommandContext,
  InteractionContextType,
  RoleOption,
  UserOption,
} from "kaltsit";
import { IUserRepository } from "../services/UserRepository.js";

export class BindCommand extends Command {
  readonly name = "bind";
  description = "binds a role to a user.";
  options = [
    new RoleOption("role", true).setDescription("the role to bind"),
    new UserOption("user", true).setDescription("the user to bind the role to"),
  ];
  preconditions = [];
  contexts = [InteractionContextType.Guild];

  constructor(private readonly userRepository: IUserRepository) {
    super();
  }

  async execute(ctx: CommandContext<BindCommand>): Promise<unknown> {
    const role = ctx.options.role.value;
    const user = ctx.options.user.value;

    const customRole = await this.userRepository.getCustomRoleById(role.id);

    if (customRole !== null) {
      await ctx.send({
        content: `role ${role} is already bound to ${user}.`,
      });
      return;
    }

    await this.userRepository.createRole(role.id, user.id);
    await ctx.send({
      content: `role ${role} has been successfully bound to ${user}.`,
    });

    return;
  }
}
