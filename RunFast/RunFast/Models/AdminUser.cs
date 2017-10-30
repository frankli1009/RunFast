using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RunFast.Models
{
    public class AdminUser
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public short UserType { get; set; }
        public string Password { get; set; }
        public string PwdIndexes { get; set; }
        public string ExtraInfo { get; set; }
    }
}