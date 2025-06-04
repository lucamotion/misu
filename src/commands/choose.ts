import {
  Command,
  CommandContext,
  CommandStringOption,
  InteractionContextType,
} from "kaltsit";

export class ChooseCommand extends Command<ChooseCommand> {
  readonly name = "choose";
  description = "randomly picks from a list of options separated by 'or'";
  options = [
    new CommandStringOption("items", true).setDescription(
      "items to choose from, separated by 'or' (e.g. 'pizza or burgers or tacos')",
    ),
  ];
  preconditions = [];
  contexts = [
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel,
  ];

  async execute(ctx: CommandContext<ChooseCommand>): Promise<unknown> {
    const itemsString = ctx.options.items.value;

    const items = itemsString
      .split(/\s+or\s+/i)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (items.length === 0) {
      await ctx.send({
        content: "please enter at least two items separated by 'or'.",
      });
      return;
    } else if (items.length === 1) {
      await ctx.send({
        content: `i choose: **${items[0]}**... there really wasn't much variety.`,
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * items.length);
    const selectedItem = items[randomIndex];

    await ctx.send({ content: `i choose: **${selectedItem}**` });

    return;
  }
}
