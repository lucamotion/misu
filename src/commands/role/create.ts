import {
  ActionRowBuilder,
  CommandContext,
  CommandStringOption,
  ComponentSubcommand,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "kaltsit";
import { hexPrecondition } from "../../lib/preconditions/hexPrecondition.js";
import { IUserRepository } from "../../services/UserRepository.js";

export class RoleCreateCommand extends ComponentSubcommand<RoleCreateCommand> {
  readonly name = "create";
  description = "Create a custom role";
  options = [
    new CommandStringOption("name").setDescription(
      "The new name of your custom role",
    ),
    new CommandStringOption("color")
      .setDescription("The hex color (e.g. #FFFFFF) of your custom role")
      .useTransformer(hexPrecondition),
  ];
  preconditions = [];

  constructor(private readonly userRepository: IUserRepository) {
    super();
  }

  async execute(ctx: CommandContext<RoleCreateCommand>): Promise<unknown> {
    if (!ctx.guild) {
      return;
    }

    const roleName = ctx.options.name.value;
    const roleColorResult = ctx.options.color;

    if (roleColorResult.isErr()) {
      await ctx.send({
        content: roleColorResult.error.message,
      });

      return;
    }

    if (roleName === undefined && roleColorResult.value === undefined) {
      await ctx.sendModal(
        new ModalBuilder()
          .setCustomId(
            this.generateButtonCustomId({
              name: undefined,
              color: undefined,
            }),
          )
          .setTitle("create custom role")
          .addComponents([
            new ActionRowBuilder<
              TextInputBuilder<RoleCreateCommand>
            >().addComponents(
              new TextInputBuilder<RoleCreateCommand>()
                .setCustomId("name")
                .setLabel("name")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("role name"),
            ),
            new ActionRowBuilder<
              TextInputBuilder<RoleCreateCommand>
            >().addComponents(
              new TextInputBuilder<RoleCreateCommand>()
                .setCustomId("color")
                .setLabel("color")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("hex code (e.g. #1A2B3C)"),
            ),
          ]),
      );
      return;
    }

    const roleColor = roleColorResult.value;

    const position = (await ctx.guild.members.fetch(ctx.user.client.user.id))
      .roles.highest.position;

    const newRole = await ctx.guild.roles.create({
      name: roleName,
      color: roleColor,
      position: position,
    });

    await ctx.guild.members.addRole({ user: ctx.user.id, role: newRole });
    await this.userRepository.createRole(newRole.id, ctx.user.id);

    await ctx.send({
      content: `Role <@&${newRole.id}> has been created.`,
    });

    return;
  }
}
