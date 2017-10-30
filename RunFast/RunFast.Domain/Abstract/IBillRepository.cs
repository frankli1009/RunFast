using RunFast.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Abstract
{
    public interface IBillTypeRepository
    {
        IEnumerable<BillType> BillTypes { get; }
        IEnumerable<BillAddress> BillAddresses { get; }
        IEnumerable<LogBill> LogBills { get; }
    }
}
