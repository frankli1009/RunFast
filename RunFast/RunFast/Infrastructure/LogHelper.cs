using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RunFast.Infrastructure
{
    public class LogHelper
    {
        public static readonly log4net.ILog Log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
    }
}