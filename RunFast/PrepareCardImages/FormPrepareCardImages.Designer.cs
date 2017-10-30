namespace PrepareCardImages
{
    partial class FormPrepareCardImages
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.label1 = new System.Windows.Forms.Label();
            this.openFileDialogSrcImg = new System.Windows.Forms.OpenFileDialog();
            this.textBoxSrcImg = new System.Windows.Forms.TextBox();
            this.buttonSrcImg = new System.Windows.Forms.Button();
            this.buttonPrepare = new System.Windows.Forms.Button();
            this.label2 = new System.Windows.Forms.Label();
            this.buttonClose = new System.Windows.Forms.Button();
            this.folderBrowserDialogDestination = new System.Windows.Forms.FolderBrowserDialog();
            this.textBoxDestFolder = new System.Windows.Forms.TextBox();
            this.buttonDestinationFolder = new System.Windows.Forms.Button();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.label3 = new System.Windows.Forms.Label();
            this.textBoxLeft = new System.Windows.Forms.TextBox();
            this.textBoxTop = new System.Windows.Forms.TextBox();
            this.label4 = new System.Windows.Forms.Label();
            this.textBoxHeight = new System.Windows.Forms.TextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.textBoxWidth = new System.Windows.Forms.TextBox();
            this.label6 = new System.Windows.Forms.Label();
            this.textBoxVSpacing = new System.Windows.Forms.TextBox();
            this.label7 = new System.Windows.Forms.Label();
            this.textBoxHSpacing = new System.Windows.Forms.TextBox();
            this.label8 = new System.Windows.Forms.Label();
            this.groupBox1.SuspendLayout();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(31, 20);
            this.label1.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(124, 17);
            this.label1.TabIndex = 0;
            this.label1.Text = "Source Image File:";
            // 
            // openFileDialogSrcImg
            // 
            this.openFileDialogSrcImg.Filter = "Image Files (*.jpg;*.png;*.bmp)|*.jpg;*.png;*.bmp";
            // 
            // textBoxSrcImg
            // 
            this.textBoxSrcImg.Location = new System.Drawing.Point(34, 55);
            this.textBoxSrcImg.Margin = new System.Windows.Forms.Padding(4);
            this.textBoxSrcImg.Name = "textBoxSrcImg";
            this.textBoxSrcImg.Size = new System.Drawing.Size(431, 23);
            this.textBoxSrcImg.TabIndex = 1;
            // 
            // buttonSrcImg
            // 
            this.buttonSrcImg.Location = new System.Drawing.Point(478, 55);
            this.buttonSrcImg.Name = "buttonSrcImg";
            this.buttonSrcImg.Size = new System.Drawing.Size(100, 25);
            this.buttonSrcImg.TabIndex = 2;
            this.buttonSrcImg.Text = "Open File";
            this.buttonSrcImg.UseVisualStyleBackColor = true;
            this.buttonSrcImg.Click += new System.EventHandler(this.buttonSrcImg_Click);
            // 
            // buttonPrepare
            // 
            this.buttonPrepare.Location = new System.Drawing.Point(478, 201);
            this.buttonPrepare.Name = "buttonPrepare";
            this.buttonPrepare.Size = new System.Drawing.Size(100, 25);
            this.buttonPrepare.TabIndex = 3;
            this.buttonPrepare.Text = "Prepare";
            this.buttonPrepare.UseVisualStyleBackColor = true;
            this.buttonPrepare.Click += new System.EventHandler(this.buttonPrepare_Click);
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(31, 96);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(128, 17);
            this.label2.TabIndex = 4;
            this.label2.Text = "Destination Folder:";
            // 
            // buttonClose
            // 
            this.buttonClose.Location = new System.Drawing.Point(478, 274);
            this.buttonClose.Name = "buttonClose";
            this.buttonClose.Size = new System.Drawing.Size(100, 25);
            this.buttonClose.TabIndex = 5;
            this.buttonClose.Text = "Close";
            this.buttonClose.UseVisualStyleBackColor = true;
            this.buttonClose.Click += new System.EventHandler(this.buttonClose_Click);
            // 
            // textBoxDestFolder
            // 
            this.textBoxDestFolder.Location = new System.Drawing.Point(34, 130);
            this.textBoxDestFolder.Margin = new System.Windows.Forms.Padding(4);
            this.textBoxDestFolder.Name = "textBoxDestFolder";
            this.textBoxDestFolder.Size = new System.Drawing.Size(431, 23);
            this.textBoxDestFolder.TabIndex = 6;
            // 
            // buttonDestinationFolder
            // 
            this.buttonDestinationFolder.Location = new System.Drawing.Point(478, 129);
            this.buttonDestinationFolder.Name = "buttonDestinationFolder";
            this.buttonDestinationFolder.Size = new System.Drawing.Size(100, 25);
            this.buttonDestinationFolder.TabIndex = 7;
            this.buttonDestinationFolder.Text = "Open Folder";
            this.buttonDestinationFolder.UseVisualStyleBackColor = true;
            this.buttonDestinationFolder.Click += new System.EventHandler(this.buttonDestinationFolder_Click);
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.textBoxVSpacing);
            this.groupBox1.Controls.Add(this.label7);
            this.groupBox1.Controls.Add(this.textBoxHSpacing);
            this.groupBox1.Controls.Add(this.label8);
            this.groupBox1.Controls.Add(this.textBoxHeight);
            this.groupBox1.Controls.Add(this.label5);
            this.groupBox1.Controls.Add(this.textBoxWidth);
            this.groupBox1.Controls.Add(this.label6);
            this.groupBox1.Controls.Add(this.textBoxTop);
            this.groupBox1.Controls.Add(this.label4);
            this.groupBox1.Controls.Add(this.textBoxLeft);
            this.groupBox1.Controls.Add(this.label3);
            this.groupBox1.Location = new System.Drawing.Point(34, 172);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(431, 136);
            this.groupBox1.TabIndex = 8;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Offset And Image Size";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(7, 29);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(37, 17);
            this.label3.TabIndex = 0;
            this.label3.Text = "Left:";
            // 
            // textBoxLeft
            // 
            this.textBoxLeft.Location = new System.Drawing.Point(92, 28);
            this.textBoxLeft.Name = "textBoxLeft";
            this.textBoxLeft.Size = new System.Drawing.Size(100, 23);
            this.textBoxLeft.TabIndex = 1;
            this.textBoxLeft.Text = "1";
            this.textBoxLeft.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.textBoxLeft_KeyPress);
            // 
            // textBoxTop
            // 
            this.textBoxTop.Location = new System.Drawing.Point(312, 28);
            this.textBoxTop.Name = "textBoxTop";
            this.textBoxTop.Size = new System.Drawing.Size(100, 23);
            this.textBoxTop.TabIndex = 3;
            this.textBoxTop.Text = "1";
            this.textBoxTop.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.textBoxLeft_KeyPress);
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(228, 29);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(38, 17);
            this.label4.TabIndex = 2;
            this.label4.Text = "Top:";
            // 
            // textBoxHeight
            // 
            this.textBoxHeight.Location = new System.Drawing.Point(312, 66);
            this.textBoxHeight.Name = "textBoxHeight";
            this.textBoxHeight.Size = new System.Drawing.Size(100, 23);
            this.textBoxHeight.TabIndex = 7;
            this.textBoxHeight.Text = "96";
            this.textBoxHeight.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.textBoxLeft_KeyPress);
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(228, 67);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(54, 17);
            this.label5.TabIndex = 6;
            this.label5.Text = "Height:";
            // 
            // textBoxWidth
            // 
            this.textBoxWidth.Location = new System.Drawing.Point(92, 66);
            this.textBoxWidth.Name = "textBoxWidth";
            this.textBoxWidth.Size = new System.Drawing.Size(100, 23);
            this.textBoxWidth.TabIndex = 5;
            this.textBoxWidth.Text = "72";
            this.textBoxWidth.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.textBoxLeft_KeyPress);
            // 
            // label6
            // 
            this.label6.AutoSize = true;
            this.label6.Location = new System.Drawing.Point(7, 67);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(51, 17);
            this.label6.TabIndex = 4;
            this.label6.Text = "Width:";
            // 
            // textBoxVSpacing
            // 
            this.textBoxVSpacing.Location = new System.Drawing.Point(312, 104);
            this.textBoxVSpacing.Name = "textBoxVSpacing";
            this.textBoxVSpacing.Size = new System.Drawing.Size(100, 23);
            this.textBoxVSpacing.TabIndex = 11;
            this.textBoxVSpacing.Text = "2";
            this.textBoxVSpacing.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.textBoxLeft_KeyPress);
            // 
            // label7
            // 
            this.label7.AutoSize = true;
            this.label7.Location = new System.Drawing.Point(228, 105);
            this.label7.Name = "label7";
            this.label7.Size = new System.Drawing.Size(76, 17);
            this.label7.TabIndex = 10;
            this.label7.Text = "V-Spacing:";
            // 
            // textBoxHSpacing
            // 
            this.textBoxHSpacing.Location = new System.Drawing.Point(92, 104);
            this.textBoxHSpacing.Name = "textBoxHSpacing";
            this.textBoxHSpacing.Size = new System.Drawing.Size(100, 23);
            this.textBoxHSpacing.TabIndex = 9;
            this.textBoxHSpacing.Text = "1";
            this.textBoxHSpacing.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.textBoxLeft_KeyPress);
            // 
            // label8
            // 
            this.label8.AutoSize = true;
            this.label8.Location = new System.Drawing.Point(7, 105);
            this.label8.Name = "label8";
            this.label8.Size = new System.Drawing.Size(77, 17);
            this.label8.TabIndex = 8;
            this.label8.Text = "H-Spacing:";
            // 
            // FormPrepareCardImages
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 17F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(612, 328);
            this.Controls.Add(this.groupBox1);
            this.Controls.Add(this.buttonDestinationFolder);
            this.Controls.Add(this.textBoxDestFolder);
            this.Controls.Add(this.buttonClose);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.buttonPrepare);
            this.Controls.Add(this.buttonSrcImg);
            this.Controls.Add(this.textBoxSrcImg);
            this.Controls.Add(this.label1);
            this.Font = new System.Drawing.Font("Georgia", 10.5F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Margin = new System.Windows.Forms.Padding(4);
            this.Name = "FormPrepareCardImages";
            this.Text = "Prepare Card Images";
            this.groupBox1.ResumeLayout(false);
            this.groupBox1.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.OpenFileDialog openFileDialogSrcImg;
        private System.Windows.Forms.TextBox textBoxSrcImg;
        private System.Windows.Forms.Button buttonSrcImg;
        private System.Windows.Forms.Button buttonPrepare;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Button buttonClose;
        private System.Windows.Forms.FolderBrowserDialog folderBrowserDialogDestination;
        private System.Windows.Forms.TextBox textBoxDestFolder;
        private System.Windows.Forms.Button buttonDestinationFolder;
        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.TextBox textBoxVSpacing;
        private System.Windows.Forms.Label label7;
        private System.Windows.Forms.TextBox textBoxHSpacing;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.TextBox textBoxHeight;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.TextBox textBoxWidth;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.TextBox textBoxTop;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.TextBox textBoxLeft;
        private System.Windows.Forms.Label label3;
    }
}

