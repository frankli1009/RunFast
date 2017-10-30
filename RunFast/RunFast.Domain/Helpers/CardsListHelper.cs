using RunFast.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Helpers
{
    public static class CardsListHelper
    {
        public static bool AddCard(this List<Card> list, Card cardToAdd, Card cardToCheck)
        {
            list.Add(cardToAdd);
            if (cardToAdd.Pip == cardToCheck.Pip && cardToAdd.Suit == cardToCheck.Suit) return true;
            else return false;
        }
    }
}
