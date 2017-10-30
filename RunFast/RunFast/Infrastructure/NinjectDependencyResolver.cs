using Ninject;
using RunFast.Domain.Abstract;
using RunFast.Domain.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace RunFast.Infrastructure
{
    public class NinjectDependencyResolver : IDependencyResolver
    {
        private IKernel kernel;

        public NinjectDependencyResolver(IKernel kernel)
        {
            this.kernel = kernel;
            addBindings();
        }

        public object GetService(Type serviceType)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            throw new NotImplementedException();
        }

        private void addBindings()
        {
            // Add bindings here
            kernel.Bind<IGameRepository>().To<EFGameRepository>();

            // See MvcModule.cs
            //kernel.Bind<HttpContextBase>().To<HttpContextWrapper>()
            //    .WithConstructorArgument("httpContext", System.Web.HttpContext.Current);
        }
    }
}