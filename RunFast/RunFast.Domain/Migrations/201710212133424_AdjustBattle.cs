namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AdjustBattle : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Battle", "Suit", c => c.Short());
            AddColumn("dbo.Battle", "DealTimes", c => c.Short());
            AddColumn("dbo.Battle", "TurnTime", c => c.DateTime(nullable: false));
            AlterColumn("dbo.Battle", "PlayerId", c => c.Int(nullable: false));
            AlterColumn("dbo.Battle", "Rank", c => c.Short());
            DropColumn("dbo.Battle", "Kind");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Battle", "Kind", c => c.Short());
            AlterColumn("dbo.Battle", "Rank", c => c.String(maxLength: 2, unicode: false));
            AlterColumn("dbo.Battle", "PlayerId", c => c.Int());
            DropColumn("dbo.Battle", "TurnTime");
            DropColumn("dbo.Battle", "DealTimes");
            DropColumn("dbo.Battle", "Suit");
        }
    }
}
