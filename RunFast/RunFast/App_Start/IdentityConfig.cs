using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using RunFast.Models;
using System.Net;
using System.Configuration;
using SendGrid.Helpers.Mail;
using SendGrid;
using System.Data.SqlClient;
using System.Data;
using System.Web.Helpers;

namespace RunFast
{
    public class EmailService : IIdentityMessageService
    {
        public Task SendAsync(IdentityMessage message)
        {
            // Plug in your email service here to send an email.
            return configSendGridasync(message);
        }

        private async Task configSendGridasync(IdentityMessage message)
        {
            var myMessage = new SendGridMessage();
            myMessage.AddTo(message.Destination);
            myMessage.From = new EmailAddress(
                                "register@franklidev.com", "Runs Fast");
            myMessage.Subject = message.Subject;
            myMessage.HtmlContent = message.Body;

            var apiKey = Environment.GetEnvironmentVariable("NAME_OF_THE_ENVIRONMENT_VARIABLE_FOR_YOUR_SENDGRID_KEY");
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress("test@example.com", "Example User");
            var subject = "Sending with SendGrid is Fun";
            var to = new EmailAddress("test@example.com", "Example User");
            var plainTextContent = "and easy to do anywhere, even with C#";
            var htmlContent = "<strong>and easy to do anywhere, even with C#</strong>";
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            var response = await client.SendEmailAsync(msg);
        }
    }

    public class SmsService : IIdentityMessageService
    {
        public Task SendAsync(IdentityMessage message)
        {
            // Plug in your SMS service here to send a text message.
            return Task.FromResult(0);
        }
    }

    // Configure the application user manager used in this application. UserManager is defined in ASP.NET Identity and is used by the application.
    public class ApplicationUserManager : UserManager<ApplicationUser>
    {
        public ApplicationUserManager(IUserStore<ApplicationUser> store)
            : base(store)
        {
        }

        public static ApplicationUserManager Create(IdentityFactoryOptions<ApplicationUserManager> options, IOwinContext context) 
        {
            ApplicationDbContext appContext = context.Get<ApplicationDbContext>();
            var manager = new ApplicationUserManager(new UserStore<ApplicationUser>(appContext));
            manager.Context = appContext;
            // Configure validation logic for usernames
            manager.UserValidator = new UserValidator<ApplicationUser>(manager)
            {
                AllowOnlyAlphanumericUserNames = false,
                RequireUniqueEmail = true
            };

            // Configure validation logic for passwords
            manager.PasswordValidator = new PasswordValidator
            {
                RequiredLength = 6,
                RequireNonLetterOrDigit = true,
                RequireDigit = true,
                RequireLowercase = true,
                RequireUppercase = true,
            };

            // Configure user lockout defaults
            manager.UserLockoutEnabledByDefault = true;
            manager.DefaultAccountLockoutTimeSpan = TimeSpan.FromMinutes(5);
            manager.MaxFailedAccessAttemptsBeforeLockout = 5;

            // Register two factor authentication providers. This application uses Phone and Emails as a step of receiving a code for verifying the user
            // You can write your own provider and plug it in here.
            manager.RegisterTwoFactorProvider("Phone Code", new PhoneNumberTokenProvider<ApplicationUser>
            {
                MessageFormat = "Your security code is {0}"
            });
            manager.RegisterTwoFactorProvider("Email Code", new EmailTokenProvider<ApplicationUser>
            {
                Subject = "Security Code",
                BodyFormat = "Your security code is {0}"
            });
            manager.EmailService = new EmailService();
            manager.SmsService = new SmsService();
            var dataProtectionProvider = options.DataProtectionProvider;
            if (dataProtectionProvider != null)
            {
                manager.UserTokenProvider = 
                    new DataProtectorTokenProvider<ApplicationUser>(dataProtectionProvider.Create("ASP.NET Identity"));
            }
            
            return manager;
        }

        public ApplicationDbContext Context { get; set; }

        public Player FindPlayerByUserId(string userId)
        {
            return Context.Players.First(p => p.ApplicationUserId == userId);
        }

        public void UpdatePlayer(Player player)
        {
            var oldPlayer = Context.Players.First(p => p.Id == player.Id);
            oldPlayer.FirstName = player.FirstName;
            oldPlayer.LastName = player.LastName;
            oldPlayer.Title = player.Title;
            Context.SaveChanges();
        }

        public override async Task SendEmailAsync(string userId, string subject, string body)
        {
            AdminUser adminUser = GetAdminUserInfo("register@franklidev.com");
            if (adminUser == null) return;
            var emailInfo = Json.Decode<EmailInfo>(adminUser.ExtraInfo);

            var user = await FindByIdAsync(userId);
            System.Net.Mail.MailMessage m = new System.Net.Mail.MailMessage(
                                    new System.Net.Mail.MailAddress(adminUser.UserName, emailInfo.Description),
                                    new System.Net.Mail.MailAddress(user.Email));
            m.Subject = subject;
            m.Body = body;
            m.IsBodyHtml = true;
            System.Net.Mail.SmtpClient smtp = new System.Net.Mail.SmtpClient(emailInfo.SmtpClient);
            smtp.Credentials = new System.Net.NetworkCredential(adminUser.UserName, adminUser.Password);
            smtp.EnableSsl = (emailInfo.SSL == 1);
            smtp.Send(m);
        }

        private AdminUser GetAdminUserInfo(string userName)
        {
            // Prepare @adminUserInfo OUTPUT parameter
            string jsonAdminUserInfo = "";
            SqlParameter pJsonAdminUserInfo = new SqlParameter("@jsonAdminUserInfo", SqlDbType.VarChar, 512,
                ParameterDirection.Output, false, 0, 0, "", DataRowVersion.Current, jsonAdminUserInfo);
            Context.Database.ExecuteSqlCommand("usp_GetAdminUserInfo @adminUserName, @jsonAdminUserInfo OUT",
            new SqlParameter("@adminUserName", userName), pJsonAdminUserInfo);

            jsonAdminUserInfo = pJsonAdminUserInfo.Value.ToString(); // jsonRealDealCard.Length==0 means PASS when dealResult == 1
            if (jsonAdminUserInfo == null || jsonAdminUserInfo.Length == 0) return null;
            var adminUser = Json.Decode<AdminUser[]>(jsonAdminUserInfo)[0];
            return adminUser;
        }
    }

    // Configure the application sign-in manager which is used in this application.
    public class ApplicationSignInManager : SignInManager<ApplicationUser, string>
    {
        public ApplicationSignInManager(ApplicationUserManager userManager, IAuthenticationManager authenticationManager)
            : base(userManager, authenticationManager)
        {
        }

        public override Task<ClaimsIdentity> CreateUserIdentityAsync(ApplicationUser user)
        {
            return user.GenerateUserIdentityAsync((ApplicationUserManager)UserManager);
        }

        public static ApplicationSignInManager Create(IdentityFactoryOptions<ApplicationSignInManager> options, IOwinContext context)
        {
            return new ApplicationSignInManager(context.GetUserManager<ApplicationUserManager>(), context.Authentication);
        }
    }
}
