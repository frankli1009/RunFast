using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Entities
{
    [Table("LogDBOperation")]
    public partial class LogDBOperation
    {
        public int Id { get; set; }
        public int? GameId { get; set; }
        public int? PlayerId { get; set; }
        public string Operation { get; set; }
        public string Parameters { get; set; }
        public short LogType { get; set; }
        public string LogMessage { get; set; }
    }
}
