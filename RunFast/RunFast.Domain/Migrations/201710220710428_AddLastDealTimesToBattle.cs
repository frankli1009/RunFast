namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddLastDealTimesToBattle : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Battle", "LastDealTimes", c => c.Short());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Battle", "LastDealTimes");
        }
    }
}
