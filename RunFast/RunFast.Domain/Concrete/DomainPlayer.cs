using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Concrete
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.Web;

    public partial class DomainPlayer
    {
        public int Id { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public short Type { get; set; }

        public string UniqueId { get; set; }

        public int? Score { get; set; }

        public int? GameCount { get; set; }

        public DateTime? AidedTime { get; set; }

        public DateTime CreateTime { get; set; }

        public DateTime? ValidUntil { get; set; }

        public DateTime? QuitTime { get; set; }

        public string ApplicationUserId { get; set; }
    }
}
