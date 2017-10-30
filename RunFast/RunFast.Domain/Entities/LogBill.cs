namespace RunFast.Domain.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("LogBill")]
    public partial class LogBill
    {
        public int Id { get; set; }

        public int PlayerId { get; set; }

        public short BillType { get; set; }

        public decimal Amount { get; set; }

        public DateTime BillTime { get; set; }
    }
}
