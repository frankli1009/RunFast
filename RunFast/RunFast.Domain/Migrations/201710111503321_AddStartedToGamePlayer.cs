namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddStartedToGamePlayer : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Game_Player", "Started", c => c.Short(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Game_Player", "Started");
        }
    }
}
