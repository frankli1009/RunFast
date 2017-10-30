using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Concrete
{
    public class PipSuit
    {
        public int PipId { get; set; }
        public List<int> SuitIds { get; set; }

        public PipSuit()
        {
            SuitIds = new List<int>();
        }
    }
}
