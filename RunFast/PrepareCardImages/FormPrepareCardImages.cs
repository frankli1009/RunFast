using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace PrepareCardImages
{
    public partial class FormPrepareCardImages : Form
    {
        public FormPrepareCardImages()
        {
            InitializeComponent();
        }

        private void buttonSrcImg_Click(object sender, EventArgs e)
        {
            DialogResult result = openFileDialogSrcImg.ShowDialog(); // Show the dialog.
            if (result == DialogResult.OK) // Test result.
            {
                string file = openFileDialogSrcImg.FileName;
                textBoxSrcImg.Text = file;
            }
        }

        private void buttonClose_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void buttonDestinationFolder_Click(object sender, EventArgs e)
        {
            if(textBoxSrcImg.Text != "")
            {
                string folderName = Path.GetDirectoryName(textBoxSrcImg.Text);
                folderBrowserDialogDestination.SelectedPath = folderName;
            }
            DialogResult result = folderBrowserDialogDestination.ShowDialog(); // Show the dialog.
            if(result == DialogResult.OK) // Test result
            {
                string folder = folderBrowserDialogDestination.SelectedPath;
                textBoxDestFolder.Text = folder;
            }
        }

        private void buttonPrepare_Click(object sender, EventArgs e)
        {
            // Get source image file name
            var fileName = textBoxSrcImg.Text;
            if(fileName == "")
            {
                MessageBox.Show("Souce image file can not be empty.", "Prepare Card Images", MessageBoxButtons.OK);
                textBoxSrcImg.Focus();
                return;
            }

            // Get destination folder name
            var folderName = textBoxDestFolder.Text;
            if (folderName == "")
            {
                MessageBox.Show("Destination folder can not be empty.", "Prepare Card Images", MessageBoxButtons.OK);
                textBoxDestFolder.Focus();
                return;
            }

            // Get offset and image size
            string message = "";
            int left, top, width, height, hSpacing, vSpacing;
            if(!GetIntValue(textBoxLeft, "Left", out left, out message, 0))
            {
                MessageBox.Show(message, "Prepare Card Images", MessageBoxButtons.OK);
                textBoxLeft.Focus();
                return;
            }
            if (!GetIntValue(textBoxTop, "Top", out top, out message, 0))
            {
                MessageBox.Show(message, "Prepare Card Images", MessageBoxButtons.OK);
                textBoxTop.Focus();
                return;
            }
            if (!GetIntValue(textBoxWidth, "Width", out width, out message, 1))
            {
                MessageBox.Show(message, "Prepare Card Images", MessageBoxButtons.OK);
                textBoxWidth.Focus();
                return;
            }
            if (!GetIntValue(textBoxHeight, "Height", out height, out message, 1))
            {
                MessageBox.Show(message, "Prepare Card Images", MessageBoxButtons.OK);
                textBoxHeight.Focus();
                return;
            }
            if (!GetIntValue(textBoxHSpacing, "Horizontal spacing", out hSpacing, out message, 0))
            {
                MessageBox.Show(message, "Prepare Card Images", MessageBoxButtons.OK);
                textBoxHSpacing.Focus();
                return;
            }
            if (!GetIntValue(textBoxVSpacing, "Vertical spacing", out vSpacing, out message, 0))
            {
                MessageBox.Show(message, "Prepare Card Images", MessageBoxButtons.OK);
                textBoxVSpacing.Focus();
                return;
            }

            // Prepare images
            (new PrepareImage { SrcFile = fileName, DestFolder = folderName,
                Left = left, Top = top, HSpacing = hSpacing, VSpacing = vSpacing,
                ImgHeight = height, ImgWidth = width })
                .Prepare(out message);
            MessageBox.Show(message, "Prepare Card Images", MessageBoxButtons.OK);
        }

        private bool GetIntValue(TextBox textBox, string title, out int value, out string message, int least = Int32.MinValue)
        {
            if (textBox.Text == "")
            {
                value = 0;
                message = String.Format("{0} can not be empty.", title);
                return false;
            }

            string sValue = textBox.Text;
            message = String.Format("{0} is not a number.", sValue);
            if(!Int32.TryParse(sValue, out value)) return false;

            if(value < least)
            {
                message = String.Format("{0} must be greater than or equal to {1}.", title, least);
                return false;
            }

            return true;
        }

        private void textBoxLeft_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (!char.IsControl(e.KeyChar) && !char.IsDigit(e.KeyChar))
            {
                e.Handled = true;
            }
        }
    }
}
