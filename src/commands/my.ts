import { CommandWithSubcommands, InteractionContextType } from "kaltsit";
import { IUserRepository } from "../services/UserRepository.js";
import { MyRolesCommand } from "./my/roles.js";

export class MyCommandGroup extends CommandWithSubcommands {
  readonly name = "my";
  description = "Container";
  contexts = [InteractionContextType.Guild];
  commands: [MyRolesCommand];

  constructor(private readonly userRepository: IUserRepository) {
    super();
    this.commands = [new MyRolesCommand(userRepository)];
  }
}
