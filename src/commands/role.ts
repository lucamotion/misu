import { CommandWithSubcommands, InteractionContextType } from "kaltsit";
import { RoleCreateCommand } from "./role/create.js";
import { IUserRepository } from "../services/UserRepository.js";
import { RoleEditCommand } from "./role/edit.js";

export class RoleCommandGroup extends CommandWithSubcommands {
  readonly name = "role";
  description = "Manage custom role";
  commands: [RoleCreateCommand, RoleEditCommand];
  contexts = [InteractionContextType.Guild];

  constructor(private readonly userRepository: IUserRepository) {
    super();
    this.commands = [
      new RoleCreateCommand(userRepository),
      new RoleEditCommand(userRepository),
    ];
  }
}
