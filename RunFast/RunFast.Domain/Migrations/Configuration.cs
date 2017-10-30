namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    public sealed class Configuration : DbMigrationsConfiguration<RunFast.Domain.Entities.RunFastDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(RunFast.Domain.Entities.RunFastDbContext context)
        {
            //  This method will be called after migrating to the latest version.
            context.Suits.AddOrUpdate(k => k.Name,
                new Entities.CardSuit { Name = "Clubs", Rank = 3 },
                new Entities.CardSuit { Name = "Spades", Rank = 1 },
                new Entities.CardSuit { Name = "Hearts", Rank = 2 },
                new Entities.CardSuit { Name = "Diamonds", Rank = 4 });

            context.Types.AddOrUpdate(t => t.Name,
                new Entities.BattleType { Name = "Single" },
                new Entities.BattleType { Name = "Pair" },
                new Entities.BattleType { Name = "Triplet" },
                new Entities.BattleType { Name = "Bomb" },
                new Entities.BattleType { Name = "Full House" },
                new Entities.BattleType { Name = "Straight" },
                new Entities.BattleType { Name = "Pair Straight" });

            context.Pips.AddOrUpdate(p => p.Name,
                new Entities.Pip { Name = "A", Rank = 2 },
                new Entities.Pip { Name = "2", Rank = 1 },
                new Entities.Pip { Name = "3", Rank = 13 },
                new Entities.Pip { Name = "4", Rank = 12 },
                new Entities.Pip { Name = "5", Rank = 11 },
                new Entities.Pip { Name = "6", Rank = 10 },
                new Entities.Pip { Name = "7", Rank = 9 },
                new Entities.Pip { Name = "8", Rank = 8 },
                new Entities.Pip { Name = "9", Rank = 7 },
                new Entities.Pip { Name = "10", Rank = 6 },
                new Entities.Pip { Name = "J", Rank = 5 },
                new Entities.Pip { Name = "Q", Rank = 4 },
                new Entities.Pip { Name = "K", Rank = 3 });

            for (int pip = 1; pip < 14; pip++)
            {
                for (int suit = 1; suit < 5; suit++)
                {
                    if((pip == 1 && suit != 2) || (pip == 2 && suit == 2) || (pip > 2))
                    {
                        context.Game_Cards.AddOrUpdate(c => new { c.GameId, c.PipId, c.SuitId },
                            new Entities.Game_Card
                            {
                                GameId = 0,
                                PipId = pip,
                                SuitId = suit,
                                Dispatched = 0,
                                Dealt = 0
                            });
                    }
                }
            }

            context.PlayerTypes.AddOrUpdate(t => t.Name,
                new Entities.PlayerType { Name = "Registered" },
                new Entities.PlayerType { Name = "VIP" });

            //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
            //  to avoid creating duplicate seed data. E.g.
            //
            //    context.People.AddOrUpdate(
            //      p => p.FullName,
            //      new Person { FullName = "Andrew Peters" },
            //      new Person { FullName = "Brice Lambson" },
            //      new Person { FullName = "Rowan Miller" }
            //    );
            //
        }
    }
}
