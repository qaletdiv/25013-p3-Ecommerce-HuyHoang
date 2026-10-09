const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

exports.resizeImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    //Lấy đường dẫn tạm thời của file đã upload
    const tempFilePath = req.file.path;
    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = ".jpg"; // Chuyển đổi tất cả hình ảnh sang định dạng JPEG
        const finalFileName = `image-${uniqueSuffix}${ext}`;
        
        //Gắn tên file cuối cùng vào req để controller có thể lấy và lưu vào cơ sở dữ liệu
        req.file.processedFileName = finalFileName; // Lưu tên file đã xử lý vào req.file để sử dụng sau này
       
        //Định nghĩa đường dẫn lưu trữ file cuối cùng
        const finalDirectory = path.join(__dirname, '..', 'public', 'images');
        const finalFilePath = path.join(finalDirectory, finalFileName);


        //Sử dụng Sharp để đọc file TẠM từ đĩa, xử lý và lưu file vào vị trí cuối cùng
        await sharp(tempFilePath)
        .resize(1000)
        .toFormat('jpeg', { quality: 80 }) // Chuyển đổi sang JPEG với chất lượng 80
        .toFile(finalFilePath); // Lưu file đã xử lý vào vị trí cuối cùng

        //Xóa file tạm thời sau khi đã xử lý xong
        fs.unlink(tempFilePath, (err) => {
            if (err) {
                console.error("Lỗi khi xóa file tạm thời:", err);
            }else{
                console.log("File tạm thời đã được xóa:", tempFilePath);    
            }
        });
        next();
    } catch (error) {
        console.error("Lỗi khi xử lý hình ảnh:", error);
         fs.unlink(tempFilePath, (err) => {
            if (err) {
                console.error("Lỗi khi xóa file tạm thời:", err);
            }else{
                console.log("File tạm thời đã được xóa:", tempFilePath);    
            }
        });
        next(error);
    }
};