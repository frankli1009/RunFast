namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddShuffleReadyStateToGame : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Game", "ShuffleState", c => c.Short(nullable: false));
            AddColumn("dbo.Game", "ReadyState", c => c.Short(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Game", "ReadyState");
            DropColumn("dbo.Game", "ShuffleState");
        }
    }
}
