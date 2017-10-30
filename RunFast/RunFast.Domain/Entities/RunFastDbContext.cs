namespace RunFast.Domain.Entities
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using Migrations;

    public partial class RunFastDbContext : DbContext
    {
        public RunFastDbContext()
            : base("name=RunFastDbContext")
        {
            Database.SetInitializer(new MigrateDatabaseToLatestVersion<RunFastDbContext, Configuration>());
        }

        public virtual DbSet<Battle> Battles { get; set; }
        public virtual DbSet<BillAddress> BillAddresses { get; set; }
        public virtual DbSet<BillType> BillTypes { get; set; }
        public virtual DbSet<Game> Games { get; set; }
        public virtual DbSet<Game_Player> Game_Players { get; set; }
        public virtual DbSet<CardSuit> Suits { get; set; }
        public virtual DbSet<LogBill> LogBills { get; set; }
        public virtual DbSet<LogGame> LogGames { get; set; }
        public virtual DbSet<LogGame_Player> LogGame_Players { get; set; }
        public virtual DbSet<Message> Messages { get; set; }
        public virtual DbSet<PlayerType> PlayerTypes { get; set; }
        public virtual DbSet<BattleType> Types { get; set; }
        public virtual DbSet<Pip> Pips { get; set; }
        public virtual DbSet<Game_Card> Game_Cards { get; set; }
        public virtual DbSet<GuestPlayer> GuestPlayers { get; set; }
        public virtual DbSet<LogDBOperation> LogDBOperations { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BillAddress>()
                .Property(e => e.Mobile)
                .IsUnicode(false);

            modelBuilder.Entity<BillAddress>()
                .Property(e => e.Telephone)
                .IsUnicode(false);

            modelBuilder.Entity<BillAddress>()
                .Property(e => e.AddressLine1)
                .IsUnicode(false);

            modelBuilder.Entity<BillAddress>()
                .Property(e => e.AddressLine2)
                .IsUnicode(false);

            modelBuilder.Entity<BillAddress>()
                .Property(e => e.City)
                .IsUnicode(false);

            modelBuilder.Entity<BillAddress>()
                .Property(e => e.Province)
                .IsUnicode(false);

            modelBuilder.Entity<BillAddress>()
                .Property(e => e.Country)
                .IsUnicode(false);

            modelBuilder.Entity<BillAddress>()
                .Property(e => e.PostCode)
                .IsUnicode(false);

            modelBuilder.Entity<BillType>()
                .Property(e => e.Name)
                .IsUnicode(false);

            modelBuilder.Entity<Game>()
                .Property(e => e.Name)
                .IsUnicode(false);

            modelBuilder.Entity<CardSuit>()
                .Property(e => e.Name)
                .IsUnicode(false);

            modelBuilder.Entity<LogBill>()
                .Property(e => e.Amount)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Message>()
                .Property(e => e.Message1)
                .IsUnicode(false);

            modelBuilder.Entity<PlayerType>()
                .Property(e => e.Name)
                .IsUnicode(false);

            modelBuilder.Entity<BattleType>()
                .Property(e => e.Name)
                .IsUnicode(false);

            modelBuilder.Entity<Pip>()
                .Property(e => e.Name)
                .IsUnicode(false);

            modelBuilder.Entity<GuestPlayer>()
                .Property(e => e.UniqueId)
                .IsUnicode(false);

            modelBuilder.Entity<LogDBOperation>()
                .Property(e => e.Operation)
                .IsUnicode(false);

            modelBuilder.Entity<LogDBOperation>()
                .Property(e => e.Parameters)
                .IsUnicode(false);

            modelBuilder.Entity<LogDBOperation>()
                .Property(e => e.LogMessage)
                .IsUnicode(false);
        }
    }
}
