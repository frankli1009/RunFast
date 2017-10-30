using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using RunFast.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using static RunFast.Controllers.ManageController;

namespace RunFast.Tests.Controllers
{
    [TestClass]
    public class ManageControllerTest
    {
        [TestMethod]
        public void TestIndex()
        {
            // Arrange
            //Mock<> mock = new Mock<IGameRepository>();
            //Mock<System.Web.HttpContextBase> mockHCB = new Mock<System.Web.HttpContextBase>();

            // Arrange
            ManageController controller = new ManageController();

            // Act
            var resultTask = controller.Index(ManageMessageId.UpdateDetailsSuccess);
            resultTask.Wait();
            var result = resultTask.Result as ViewResult;

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("Your details have been updated.", result.ViewBag.StatusMessage);
        }
    }
}
