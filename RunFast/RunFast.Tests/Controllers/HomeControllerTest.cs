using System.Collections.Generic;
using System.Web.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using RunFast.Controllers;
using Moq;
using RunFast.Domain.Abstract;
using RunFast.Domain.Entities;
using RunFast.Models;

namespace RunFast.Tests.Controllers
{
    [TestClass]
    public class HomeControllerTest
    {
        // Change to stored procedure
        //[TestMethod]
        //public void CanCreateAndDispatchCards()
        //{
        //    // Arrange
        //    Mock<IGameRepository> mock = new Mock<IGameRepository>();
        //    bool local = true;
        //    int gameId = 1;
        //    string gameName = "Table";
        //    int owner = 0;
        //    mock.Setup(m => m.NewGame(local, gameName, owner)).Returns(new Game { Id= gameId, Name=gameName, Local=local, Owner= owner });
        //    mock.Setup(m => m.Pips).Returns(getPips());
        //    mock.Setup(m => m.Suits).Returns(getSuits());
        //    mock.Setup(m => m.InsertGameCards(It.IsAny<int>(), It.IsAny<List<Card>>()));
        //    mock.Setup(m => m.NewGamePlayer(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<short>(), It.IsAny<short>()));
        //    mock.Setup(m => m.Game_Cards).Returns(getGameCards(gameId));

        //    // Arrange
        //    HomeController controller = new HomeController(mock.Object);

        //    // Act
        //    GameProcessor result = (GameProcessor)((ViewResult)controller.LocalGame("")).Model;

        //    // Assert
        //    Assert.AreEqual(16, result.PlayerCardsList[0].Cards.Count);
        //    Assert.AreEqual(0, result.PlayerCardsList[0].PlayerId);
        //    Assert.AreEqual(1, result.PlayerCardsList[0].Turn);
        //}

        private Game_Card[] getGameCards(int gameId)
        {
            Game_Card[] gameCards = new Game_Card[48];
            int k = 0;
            for (int i=1; i<14; i++)
                for(int j=1; j<5; j++)
                {
                    if (i == 1 && j == 2) //"A" and Spades
                        continue;
                    if (i == 2 && j != 2) //"2" and not Spades
                        continue;
                    gameCards[k++] = new Game_Card { GameId = gameId, PipId = i, SuitId = j };
                }
            return gameCards;
        }
        private CardSuit[] getSuits()
        {
            return new CardSuit[]
            {
                new CardSuit { Id = 1, Name = "Clubs", Rank = 3 },
                new CardSuit { Id = 2, Name = "Spades", Rank = 1 },
                new CardSuit { Id = 3, Name = "Hearts", Rank = 2 },
                new CardSuit { Id = 4, Name = "Diamonds", Rank = 4 }
            };
        }

        private Pip[] getPips()
        {
            return new Pip[]
            {
                new Pip { Id = 1, Name = "A", Rank = 2 },
                new Pip { Id = 2, Name = "2", Rank = 1 },
                new Pip { Id = 3, Name = "3", Rank = 13 },
                new Pip { Id = 4, Name = "4", Rank = 12 },
                new Pip { Id = 5, Name = "5", Rank = 11 },
                new Pip { Id = 6, Name = "6", Rank = 10 },
                new Pip { Id = 7, Name = "7", Rank = 9 },
                new Pip { Id = 8, Name = "8", Rank = 8 },
                new Pip { Id = 9, Name = "9", Rank = 7 },
                new Pip { Id = 10, Name = "10", Rank = 6 },
                new Pip { Id = 11, Name = "J", Rank = 5 },
                new Pip { Id = 12, Name = "Q", Rank = 4 },
                new Pip { Id = 13, Name = "K", Rank = 3 }
            };
        }

        [TestMethod]
        public void TestGetOnlineGame()
        {
        }

        [TestMethod]
        public void Index()
        {
            // Arrange
            Mock<IGameRepository> mock = new Mock<IGameRepository>();
            Mock<System.Web.HttpContextBase> mockHCB = new Mock<System.Web.HttpContextBase>();

            // Arrange
            HomeController controller = new HomeController(mock.Object, mockHCB.Object);

            // Act
            ViewResult result = controller.Index() as ViewResult;

            // Assert
            Assert.IsNotNull(result);
        }

        [TestMethod]
        public void About()
        {
            // Arrange
            Mock<IGameRepository> mock = new Mock<IGameRepository>();
            Mock<System.Web.HttpContextBase> mockHCB = new Mock<System.Web.HttpContextBase>();

            // Arrange
            HomeController controller = new HomeController(mock.Object, mockHCB.Object);

            // Act
            ViewResult result = controller.About() as ViewResult;
            string message = result.ViewBag.Message;

            // Assert
            Assert.IsTrue(message.StartsWith("RUNS FAST"));
        }

        [TestMethod]
        public void Contact()
        {
            // Arrange
            Mock<IGameRepository> mock = new Mock<IGameRepository>();
            Mock<System.Web.HttpContextBase> mockHCB = new Mock<System.Web.HttpContextBase>();

            // Arrange
            HomeController controller = new HomeController(mock.Object, mockHCB.Object);

            // Act
            ViewResult result = controller.Contact() as ViewResult;

            // Assert
            Assert.IsNotNull(result);
        }
    }
}
