namespace RunFast.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AdGameCountAidedTimeToPlayer : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Player", "GameCount", c => c.Int());
            AddColumn("dbo.Player", "AidedTime", c => c.DateTime());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Player", "AidedTime");
            DropColumn("dbo.Player", "GameCount");
        }
    }
}
