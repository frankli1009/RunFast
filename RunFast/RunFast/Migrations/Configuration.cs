namespace RunFast.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;

    internal sealed class Configuration : DbMigrationsConfiguration<RunFast.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(RunFast.Models.ApplicationDbContext context)
        {
            //  This method will be called after migrating to the latest version.

            // Add the roles to db context if they don't exist in the role table
            context.Roles.AddOrUpdate(r => r.Name,
                new IdentityRole { Name = "registered" },
                new IdentityRole { Name = "VIP" });
            //var roleStore = new RoleStore<IdentityRole>(context);
            //if (!context.Roles.Any(r => r.Name == "registered"))
            //{
            //    roleStore.CreateAsync(new IdentityRole("registered"));
            //}
            //if (!context.Roles.Any(r => r.Name == "VIP"))
            //{
            //    roleStore.CreateAsync(new IdentityRole("VIP"));
            //}

            //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
            //  to avoid creating duplicate seed data. E.g.
            //
            //    context.People.AddOrUpdate(
            //      p => p.FullName,
            //      new Person { FullName = "Andrew Peters" },
            //      new Person { FullName = "Brice Lambson" },
            //      new Person { FullName = "Rowan Miller" }
            //    );
            //
        }
    }
}
