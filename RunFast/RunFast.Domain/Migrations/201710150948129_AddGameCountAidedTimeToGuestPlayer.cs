namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddGameCountAidedTimeToGuestPlayer : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.GuestPlayer", "GameCount", c => c.Int());
            AddColumn("dbo.GuestPlayer", "AidedTime", c => c.DateTime());
        }
        
        public override void Down()
        {
            DropColumn("dbo.GuestPlayer", "AidedTime");
            DropColumn("dbo.GuestPlayer", "GameCount");
        }
    }
}
