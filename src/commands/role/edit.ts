import {
  ActionRowBuilder,
  CommandContext,
  CommandStringOption,
  ComponentSubcommand,
  err,
  KaltsitError,
  MessageFlags,
  ModalBuilder,
  ok,
  Result,
  Role,
  TextInputBuilder,
  TextInputStyle,
} from "kaltsit";
import { hexPrecondition } from "../../lib/preconditions/hexPrecondition.js";
import { IUserRepository } from "../../services/UserRepository.js";

export class RoleEditCommand extends ComponentSubcommand<RoleEditCommand> {
  readonly name = "edit";
  description = "edits a custom role";
  readonly options = [
    new CommandStringOption("role", true)
      .setDescription("the ID of the custom role")
      .useTransformer(
        async (value, context): Promise<Result<Role, KaltsitError>> => {
          const role = await context.guild?.roles.fetch(value);

          if (!role) {
            return err(new KaltsitError("role not found"));
          }

          return ok(role ?? undefined);
        },
      ),
    new CommandStringOption("name", false).setDescription(
      "the new name of your custom role",
    ),
    new CommandStringOption("color", false)
      .setDescription("the new hex color (e.g. #FFFFFF) of your custom role")
      .useTransformer(hexPrecondition),
  ] as const;
  preconditions = [];

  constructor(private readonly userRepository: IUserRepository) {
    super();
  }

  async execute(ctx: CommandContext<RoleEditCommand>): Promise<unknown> {
    if (!ctx.guild) {
      return;
    }

    const roleResult = ctx.options.role;
    const roleName = ctx.options.name.value;
    const roleColorResult = ctx.options.color;

    if (roleResult.isErr()) {
      await ctx.send({
        content: roleResult.error.message,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const role = roleResult.value;

    const customRole = await this.userRepository.getCustomRoleById(role.id);

    if (customRole === null) {
      await ctx.send({
        content: `${role} is not being managed by misu. Use /bind to bind it first.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    } else if (customRole.userId !== ctx.user.id) {
      await ctx.send({
        content: `${role} is not bound to you.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (roleColorResult.isErr()) {
      await ctx.send({ content: roleColorResult.error.message });
      return;
    }

    if (roleName === undefined && roleColorResult.value === undefined) {
      await ctx.sendModal(
        new ModalBuilder()
          .setCustomId(
            this.generateButtonCustomId({
              role: role.id,
              name: undefined,
              color: undefined,
            }),
          )
          .setTitle("edit custom role")
          .addComponents([
            new ActionRowBuilder<
              TextInputBuilder<RoleEditCommand>
            >().addComponents(
              new TextInputBuilder<RoleEditCommand>()
                .setCustomId("name")
                .setLabel("name")
                .setStyle(TextInputStyle.Short)
                .setValue(role.name),
            ),
            new ActionRowBuilder<
              TextInputBuilder<RoleEditCommand>
            >().addComponents(
              new TextInputBuilder<RoleEditCommand>()
                .setCustomId("color")
                .setLabel("color")
                .setStyle(TextInputStyle.Short)
                .setValue(role.hexColor),
            ),
          ]),
      );
      return;
    }

    try {
      const newRole = await ctx.guild.roles.edit(role, {
        name: roleName,
        color: roleColorResult.value,
      });

      await ctx.send({
        content: `Role <@&${newRole.id}> has been updated.`,
      });
    } catch (e) {
      console.error(e);
    }

    return;
  }
}
