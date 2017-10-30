using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RunFast.Models
{
    public class GameReportModel
    {
        public int GameId { get; set; }
        public string UniqueId { get; set; }
        public int Score { get; set; }
    }
}