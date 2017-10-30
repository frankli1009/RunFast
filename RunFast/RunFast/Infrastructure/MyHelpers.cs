using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RunFast.Infrastructure
{
    public class MyHelpers
    {
        public static IEnumerable<string> Titles = new List<string>
        {
            "Mr", "Mrs", "Miss", "Ms", "Dr", "Prof"
        };
    }
}