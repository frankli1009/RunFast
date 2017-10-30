using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Entities
{
    [Table("LogGame_Player")]
    public partial class LogGame_Player
    {
        public int Id { get; set; }

        public int LogGameId { get; set; }

        public int GameId { get; set; }

        public int PlayerId { get; set; }

        public int? Score { get; set; }

        public DateTime? UpdateTime { get; set; }
    }
}
