using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PrepareCardImages
{
    class PrepareImage
    {
        public int Top { get; set; }
        public int Left { get; set; }
        public int ImgWidth { get; set; }
        public int ImgHeight { get; set; }
        public int HSpacing { get; set; }
        public int VSpacing { get; set; }
        public string SrcFile { get; set; }
        public string DestFolder { get; set; }
        public string ImgExt
        {
            get
            {
                if(_imgExt == "") _imgExt = Path.GetExtension(SrcFile);
                return _imgExt;
            }
        }
        public string ImgFile
        {
            get
            {
                if (_imgFile == "") _imgFile = Path.GetFileNameWithoutExtension(SrcFile);
                return _imgFile;
            }
        }
        private string _imgExt = "";
        private string _imgFile = "";

        public bool Prepare(out string message)
        {
            // Make sure both source image file and destination folder exist
            if (!ValidateSrcFileAndDestFolder(out message)) return false;

            // Make sure offset and image size are valid
            if (!ValidateOffsetAndImgSize(out message)) return false;

            // Load source image
            Bitmap srcImage;
            if (!LoadSrcImage(out srcImage, out message)) return false;

            int totalWidth = srcImage.Width, totalHeight = srcImage.Height;
            int left = Left, i = 1;
            while(left + ImgWidth < totalWidth)
            {
                int top = Top, j = 1;
                while (top + ImgHeight < totalHeight)
                {
                    Rectangle srcRect = new Rectangle(left, top, ImgWidth, ImgHeight);
                    Bitmap cropped = (Bitmap)srcImage.Clone(srcRect, srcImage.PixelFormat);
                    cropped.Save(GetImgName(i, j));
                    j++;
                    top += ImgHeight + VSpacing;
                }

                i++;
                left += ImgWidth + HSpacing;
            }
            message = "Succeeded to prepare card images.";
            return true;
        }

        private string GetImgName(int i, int j)
        {
            string file = String.Format("{0}\\{1}{2}_{3}{4}", DestFolder, ImgFile, i, j, ImgExt);
            return file;
        }

        private bool ValidateOffsetAndImgSize(out string message)
        {
            if (ImgWidth < 1)
            {
                message = "Width must be greater than 0.";
                return false;
            }
            if (ImgHeight < 1)
            {
                message = "Height must be greater than 0.";
                return false;
            }

            message = "";
            return true;
        }

        private bool LoadSrcImage(out Bitmap srcImage, out string message)
        {
            srcImage = null;
            try
            {
                srcImage = new Bitmap(SrcFile);
            }
            catch (Exception ex)
            {
                message = String.Format("Failed to load image from file \"{0}\".\nError: {1}.",
                    SrcFile, ex.Message);
                return false;
            }

            message = "";
            return true;
        }

        private bool ValidateSrcFileAndDestFolder(out string message)
        {
            // Check whether source image file exists
            if (!(File.Exists(SrcFile)))
            {
                message = String.Format("Souce image file \"{0}\" does not exist.", SrcFile);
                return false;
            }

            // Check whether destination folder exists. If not, create it then recheck it
            if (!(Directory.Exists(DestFolder)))
            {
                Directory.CreateDirectory(DestFolder);
            }
            if (!(Directory.Exists(DestFolder)))
            {
                message = String.Format("Failed to create the folder \"{0}\".", DestFolder);
                return false;
            }

            message = "";
            return true;
        }
    }
}
