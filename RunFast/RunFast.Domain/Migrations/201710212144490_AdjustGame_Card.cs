namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AdjustGame_Card : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Game_Card", "Dealt", c => c.Short(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Game_Card", "Dealt", c => c.Boolean(nullable: false));
        }
    }
}
