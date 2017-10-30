namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddLastActiveTimePlayerTypeToGame_Player : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Game_Player", "PlayerType", c => c.Short(nullable: false));
            AddColumn("dbo.Game_Player", "LastActiveTime", c => c.DateTime());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Game_Player", "LastActiveTime");
            DropColumn("dbo.Game_Player", "PlayerType");
        }
    }
}
