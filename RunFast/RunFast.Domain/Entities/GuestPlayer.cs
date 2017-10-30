using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RunFast.Domain.Entities
{
    [Table("GuestPlayer")]
    public partial class GuestPlayer
    {
        public int Id { get; set; }
        [StringLength(50)]
        public string UniqueId { get; set; }
        public int Score { get; set; }
        public int? GameCount { get; set; }
        public DateTime? AidedTime { get; set; }
        public DateTime CreateTime { get; set; }
    }
}
