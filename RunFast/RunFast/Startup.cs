using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(RunFast.Startup))]
namespace RunFast
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
