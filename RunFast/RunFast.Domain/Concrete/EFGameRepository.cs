using RunFast.Domain.Abstract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RunFast.Domain.Entities;
using System.Data.SqlClient;
using System.Data;
using RunsFast.Domain.Concrete;
using RunFast.Domain.Helpers;
using System.Web.Helpers;
using System.Data.Entity;

namespace RunFast.Domain.Concrete
{
    public class EFGameRepository : IGameRepository
    {
        private RunFastDbContext context = new RunFastDbContext();

        public void SaveChanges()
        {
            context.SaveChanges();
        }

        // Battle 

        public IEnumerable<Battle> Battles
        {
            get
            {
                return context.Battles;
            }
        }

        // Local Game
        
        public IEnumerable<Game> Games
        {
            get
            {
                return context.Games;
            }
        }

        public Game NewGame(bool local, string gameName, int? owner)
        {
            Game game = context.Games.Add(new Game {
                Name = gameName,
                Owner = owner,
                CreateTime = DateTime.Now,
                Local = local
            });
            context.SaveChanges();
            return game;
        }

        public void InsertGameCards(int gameId, List<Card> cards)
        {
            foreach(var card in cards)
            {
                context.Game_Cards.Add(new Game_Card {
                    GameId = gameId,
                    PipId = card.Pip,
                    SuitId = card.Suit,
                    Dispatched = 0,
                    Dealt = 0
                });
            }
            context.SaveChanges();
        }

        public void NewGamePlayer(int gameId, int playerId, short playerType, short turn, short started)
        {
            context.Game_Players.Add(new Game_Player {
                GameId = gameId,
                PlayerId = playerId,
                PlayerType = playerType,
                Turn = turn,
                Started = started
            });
            context.SaveChanges();
        }

        public void GetLocalGame(int playerId, short playerType, out int gameId, out short turn)
        {
            gameId = 0;
            turn = 1;
            var gamePlayerTurns = context.Database.SqlQuery<GamePlayerTurn>("usp_GetLocalGame @playerId, @playerType", 
                new SqlParameter("@playerId", playerId), new SqlParameter("@playerType", playerType)).ToList();
            //var gamePlayerTurns = context.Database.SqlQuery<GamePlayerTurn>("usp_GetLocalGame {0}", playerId).ToList();
            var gamePlayerTurn = gamePlayerTurns.FirstOrDefault();
            if (gamePlayerTurn != null)
            {
                gameId = gamePlayerTurn.GameId;
                turn = gamePlayerTurn.Turn;
            }
        }

        public void NewGuestPlayer(string uniqueId, int score)
        {
            context.GuestPlayers.Add(new GuestPlayer
            {
                UniqueId = uniqueId,
                Score = score,
                CreateTime = DateTime.Now
            });
            context.SaveChanges();
        }

        public int ExecSqlCommand(string sql, params object[] parameters)
        {
            return context.Database.ExecuteSqlCommand(sql, parameters);
        }

        public short ShuffleAndDispatchCards(int gameId, List<PlayerCards> playersCards)
        {
            short firstTurn = 0;
            // Prepare the output parameter
            SqlParameter paramFirstTurn = new SqlParameter("@firstTurn", SqlDbType.SmallInt, 2, ParameterDirection.Output,
                false, 0, 0, "", DataRowVersion.Current, firstTurn);
            // Execute the stored procedure
            var gameCards = context.Database.SqlQuery<Game_Card_Ex>("usp_ShuffleAndDispatchCards @gameId, @firstTurn OUT", 
                new SqlParameter("@gameId", gameId), paramFirstTurn).ToList();
            // Retrieve the value of the output parameter
            firstTurn = short.Parse(paramFirstTurn.Value.ToString());
            // Retrieve the cards
            PlayerCards playerCards = null;
            short playerTurn = -1;
            foreach (var card in gameCards)
            {
                short turn = card.Dispatched;
                if(turn != playerTurn)
                {
                    foreach (var pcards in playersCards)
                    {
                        if(pcards.Turn == turn)
                        {
                            playerTurn = turn;
                            playerCards = pcards;
                            break;
                        }
                    }
                }
                playerCards.Cards.Add(card.FormCard());
            }

            return firstTurn;
        }

        public void GetOnlineGame(int playerId, short playerType, int changeTable, out int gameId, out short turn)
        {
            gameId = 0;
            turn = 1;
            SqlParameter pGameId = new SqlParameter("@gameId", SqlDbType.Int, 4, 
                ParameterDirection.Output, false, 0, 0, "", DataRowVersion.Current, gameId);
            SqlParameter pTurn = new SqlParameter("@turn", SqlDbType.SmallInt, 2,
                ParameterDirection.Output, false, 0, 0, "", DataRowVersion.Current, turn);
            context.Database.ExecuteSqlCommand("usp_GetOnlineGame @playerId, @playerType, @changeTable, @gameId OUT, @turn OUT", 
                new SqlParameter("@playerId", playerId), new SqlParameter("@playerType", playerType), 
                new SqlParameter("@changeTable", changeTable), 
                pGameId, pTurn);
            gameId = int.Parse(pGameId.Value.ToString());
            turn = short.Parse(pTurn.Value.ToString());
        }

        public short GetDispatchedCards(int gameId, List<PlayerCards> playersCards)
        {
            short firstTurn = 0;
            // Prepare the output parameter
            //SqlParameter paramFirstTurn = new SqlParameter("@firstTurn", SqlDbType.SmallInt, 2, ParameterDirection.Output,
            //    false, 0, 0, "", DataRowVersion.Current, firstTurn);
            SqlParameter paramFirstTurn = new SqlParameter("@firstTurn", SqlDbType.SmallInt);
            paramFirstTurn.Direction = ParameterDirection.Output;
            paramFirstTurn.Value = firstTurn;
            // Execute the stored procedure
            var gameCards = context.Database.SqlQuery<Game_Card_Ex>("usp_GetDispatchedCards @gameId, @firstTurn OUT",
                new SqlParameter("@gameId", gameId), paramFirstTurn).ToList();
            // Retrieve the value of the output parameter
            firstTurn = short.Parse(paramFirstTurn.Value.ToString());
            // Retrieve the cards
            PlayerCards playerCards = null;
            short playerTurn = -1;
            foreach (var card in gameCards)
            {
                short turn = card.Dispatched;
                if (turn != playerTurn)
                {
                    foreach (var pcards in playersCards)
                    {
                        if (pcards.Turn == turn)
                        {
                            playerTurn = turn;
                            playerCards = pcards;
                            break;
                        }
                    }
                }
                playerCards.Cards.Add(card.FormCard());
            }

            return firstTurn;
        }

        public short MakeDeal(BattleDeal battleDeal, out Card realDealCard)
        {
            // Prepare @dealCards structured parameter
            var inTable = new DataTable();
            inTable.Columns.Add("Pip", typeof(int));
            inTable.Columns.Add("PipRank", typeof(int));
            inTable.Columns.Add("Suit", typeof(int));
            inTable.Columns.Add("SuitRank", typeof(short));

            foreach (var card in battleDeal.Cards)
            {
                inTable.Rows.Add(card.Pip, card.PipRank, card.Suit, card.SuitRank);
            }

            var pDealCards = new SqlParameter("@dealCards", SqlDbType.Structured);
            pDealCards.TypeName = "dbo.CardList";
            pDealCards.Value = inTable;

            // Prepare @dealResult OUTPUT parameter
            short dealResult = 0;
            SqlParameter pDealResult = new SqlParameter("@dealResult", SqlDbType.SmallInt, 2,
                ParameterDirection.Output, false, 0, 0, "", DataRowVersion.Current, dealResult);

            // Prepare @jsonRealDealCard OUTPUT parameter
            string jsonRealDealCard = "";
            SqlParameter pJsonRealDealCard = new SqlParameter("@jsonRealDealCard", SqlDbType.VarChar, 200,
                ParameterDirection.Output, false, 0, 0, "", DataRowVersion.Current, jsonRealDealCard);

            context.Database.ExecuteSqlCommand("usp_BattleDealReport @gameId, @playerId, @dealTimes, @dealTurn, @dealType, @dealCount, @dealRank, @dealSuit, @dealCards, @dealResult OUT, @jsonRealDealCard OUT",
            new SqlParameter("@gameId", battleDeal.GameId), new SqlParameter("@playerId", battleDeal.PlayerId),
            new SqlParameter("@dealTimes", battleDeal.DealTimes), new SqlParameter("@dealTurn", battleDeal.DealTurn), 
            new SqlParameter("@dealType", battleDeal.DealType), new SqlParameter("@dealCount", battleDeal.DealCount), 
            new SqlParameter("@dealRank", battleDeal.DealRank), new SqlParameter("@dealSuit", battleDeal.DealSuit),
            pDealCards, pDealResult, pJsonRealDealCard);

            dealResult = short.Parse(pDealResult.Value.ToString());
            jsonRealDealCard = pJsonRealDealCard.Value.ToString(); // jsonRealDealCard.Length==0 means PASS when dealResult == 1

            realDealCard = null;
            // If there is an auto played card deal, it must be the single one with the lowest rank
            if (dealResult == 1 && jsonRealDealCard.Length > 0) realDealCard = Json.Decode<Card[]>(jsonRealDealCard)[0];
            return dealResult;
        }

        public short GetDeal(int gameId, int playerId, short dealTimes, out short dealTurn, out short dealType, List<BattleDeal> battleDealList)
        {
            // Prepare @dealResult OUTPUT parameter
            short dealAmount = 0;
            dealTurn = 0;
            dealType = 0;
            SqlParameter pDealAmount = new SqlParameter("@dealAmount", SqlDbType.SmallInt, 2,
                ParameterDirection.Output, false, 0, 0, "", DataRowVersion.Current, dealAmount);
            SqlParameter pDealTurn = new SqlParameter("@dealTurn", SqlDbType.SmallInt, 2,
                ParameterDirection.Output, false, 0, 0, "", DataRowVersion.Current, dealTurn);
            SqlParameter pDealType = new SqlParameter("@dealType", SqlDbType.SmallInt, 2,
                ParameterDirection.Output, false, 0, 0, "", DataRowVersion.Current, dealType);

            var dealInfos = context.Database.SqlQuery<BattleDeal_Ex>("usp_GetBattleDeal @gameId, @playerId, @dealTimes, @dealAmount OUT, @dealTurn OUT, @dealType OUT",
                new SqlParameter("@gameId", gameId), new SqlParameter("@playerId", playerId), 
                new SqlParameter("@dealTimes", dealTimes), pDealAmount, pDealTurn, pDealType).ToList();

            dealTurn = short.Parse(pDealTurn.Value.ToString());
            dealType = short.Parse(pDealType.Value.ToString());
            dealAmount = short.Parse(pDealAmount.Value.ToString());
            if (dealAmount > 0)
            {
                short curDealTimes = 0;
                BattleDeal battleDeal = null;
                foreach (var dealInfo in dealInfos)
                {
                    if(dealInfo.DealTimes != curDealTimes)
                    {
                        if(battleDeal != null) battleDealList.Add(battleDeal);

                        battleDeal = new BattleDeal();
                        curDealTimes = dealInfo.DealTimes;
                        battleDeal.DealCount = 0;
                        battleDeal.DealRank = dealInfo.DealRank;
                        battleDeal.DealSuit = dealInfo.DealSuit;
                        battleDeal.DealTimes = dealInfo.DealTimes;
                        battleDeal.DealType = dealInfo.DealType;
                        battleDeal.DealTurn = dealInfo.DealTurn;
                    }
                    battleDeal.DealCount++;
                    battleDeal.Cards.Add(new Card
                    {
                        Pip = dealInfo.DealPipId,
                        PipRank = dealInfo.DealPipRank,
                        Suit = dealInfo.DealSuitId,
                        SuitRank = dealInfo.DealSuitRank
                    });
                }
                if (battleDeal != null) battleDealList.Add(battleDeal);
            }
            return dealAmount;
        }

        // scoreType: -1 - award, -2 - aid, -3 - buy (LogGameId = -LogBillId)
        public void LogOtherScore(int playerId, Consts.ScoreType scoreType, int score)
        {
            context.LogGame_Players.Add(new Entities.LogGame_Player
            {
                LogGameId = 0,
                GameId = (int)scoreType,
                PlayerId = playerId,
                Score = score,
                UpdateTime = DateTime.Now
            });
        }

        public short TurnStart(int gameId, int playerId, short dealTimes, short turn)
        {
            // Prepare @result OUTPUT parameter
            short result = 0;
            SqlParameter pResult = new SqlParameter("@result", SqlDbType.SmallInt, 2,
                ParameterDirection.Output, false, 0, 0, "", DataRowVersion.Current, result);

            context.Database.ExecuteSqlCommand("usp_TurnStartReport @gameId, @playerId, @dealTimes, @turn, @result OUT",
            new SqlParameter("@gameId", gameId), new SqlParameter("@playerId", playerId),
            new SqlParameter("@dealTimes", dealTimes), new SqlParameter("@turn", turn),
            pResult);

            result = short.Parse(pResult.Value.ToString());
            return result;
        }

        public void DeleteRecord<T>(T rec) where T : class
        {
            context.Entry(rec).State = EntityState.Deleted;
            context.SaveChanges();
        }

        public IEnumerable<Game_Card> Game_Cards
        {
            get
            {
                return context.Game_Cards;
            }
        }

        public IEnumerable<Game_Player> Game_Players
        {
            get
            {
                return context.Game_Players;
            }
        }

        public IEnumerable<LogGame> LogGames
        {
            get
            {
                return context.LogGames;
            }
        }

        public IEnumerable<LogGame_Player> LogGame_Players
        {
            get
            {
                return context.LogGame_Players;
            }
        }

        public IEnumerable<Message> Messages
        {
            get
            {
                return context.Messages;
            }
        }

        public IEnumerable<Pip> Pips
        {
            get
            {
                return context.Pips;
            }
        }

        public IEnumerable<PlayerType> PlayerTypes
        {
            get
            {
                return context.PlayerTypes;
            }
        }

        public IEnumerable<CardSuit> Suits
        {
            get
            {
                return context.Suits;
            }
        }

        public IEnumerable<BattleType> BattleTypes
        {
            get
            {
                return context.Types;
            }
        }

        public IEnumerable<GuestPlayer> GuestPlayers
        {
            get
            {
                return context.GuestPlayers;
            }
        }
    }
}
