import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandContext,
  SelectBuilder,
  StringSelectMenuOptionBuilder,
  Subcommand,
} from "kaltsit";
import { commandManager } from "../../index.js";
import { IUserRepository } from "../../services/UserRepository.js";

export class MyRolesCommand extends Subcommand {
  readonly name = "roles";
  description = "Manage your custom roles";
  options = [];
  preconditions = [];

  constructor(private readonly userRepository: IUserRepository) {
    super();
  }

  async execute(context: CommandContext<MyRolesCommand>): Promise<unknown> {
    const roles = await this.userRepository.getCustomRolesByUserId(
      context.user.id,
    );

    const roleStrings: string[] = [];

    for (const role of roles) {
      roleStrings.push(`<@&${role.id}>`);
    }

    const components = [];

    if (roles.length > 0) {
      const options = [];

      for (const role of roles) {
        const cachedRole = await context.guild?.roles.fetch(role.id);

        if (!cachedRole) {
          continue;
        }

        options.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(cachedRole.name)
            .setValue(role.id),
        );
      }
      components.push(
        new ActionRowBuilder()
          .addComponents(
            new SelectBuilder()
              .setCustomId(
                commandManager
                  .getCommand("role.edit")
                  .generateSelectCustomId("role", {
                    name: undefined,
                    color: undefined,
                  }),
              )
              .setPlaceholder("Select a role")
              .setOptions(options),
          )
          .toJSON(),
      );
    }

    components.push(
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(
              commandManager.getCommand("role.create").generateButtonCustomId({
                name: undefined,
                color: undefined,
              }),
            )
            .setLabel("create role")
            .setStyle(ButtonStyle.Primary),
        )
        .toJSON(),
    );

    await context.send({
      content:
        roleStrings.length === 0 ? "No roles bound" : roleStrings.join("\n"),
      components,
    });

    return;
  }
}
