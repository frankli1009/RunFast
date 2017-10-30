namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ChangeDispatchedToShortInGameCard : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Game_Card", "Dispatched", c => c.Short(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Game_Card", "Dispatched", c => c.Int(nullable: false));
        }
    }
}
