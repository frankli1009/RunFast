using RunFast.Domain.Concrete;
using RunFast.Domain.Entities;
using RunFast.Domain.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Abstract
{
    public interface IGameRepository
    {
        void SaveChanges();

        IEnumerable<Game> Games { get; }
        Game NewGame(bool local, string gameName, int? owner);
        IEnumerable<Game_Player> Game_Players { get; }
        IEnumerable<Game_Card> Game_Cards { get; }
        void InsertGameCards(int gameId, List<Card> cards);
        void NewGamePlayer(int gameId, int playerId, short playerType, short turn, short started);
        void GetLocalGame(int playerId, short playerType, out int gameId, out short turn);
        short ShuffleAndDispatchCards(int gameId, List<PlayerCards> playersCards);
        short GetDispatchedCards(int gameId, List<PlayerCards> playersCards);

        void GetOnlineGame(int playerId, short playerType, int changeTable, out int gameId, out short turn);
        short MakeDeal(BattleDeal battleDeal, out Card realDealCard);
        short GetDeal(int gameId, int playerId, short dealTimes, out short dealTurn, out short dealType, List<BattleDeal> battleDealList);
        short TurnStart(int gameId, int playerId, short dealTimes, short turn);

        IEnumerable<Pip> Pips { get; }
        IEnumerable<CardSuit> Suits { get; }

        IEnumerable<Battle> Battles { get; }
        IEnumerable<BattleType> BattleTypes { get; }

        IEnumerable<Message> Messages { get; }

        IEnumerable<LogGame> LogGames { get; }
        IEnumerable<LogGame_Player> LogGame_Players { get; }
        // scoreType: -1 - award, -2 - aid, -3 - buy (LogGameId = -LogBillId)
        void LogOtherScore(int playerId, Consts.ScoreType scoreType, int score);

        IEnumerable<PlayerType> PlayerTypes { get; }

        IEnumerable<GuestPlayer> GuestPlayers { get; }
        void NewGuestPlayer(string uniqueId, int score);

        int ExecSqlCommand(string sql, params object[] parameters);
        void DeleteRecord<T>(T rec) where T: class;
    }
} 
